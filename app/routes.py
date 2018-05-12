import json

import gevent
import msgpack
import redis
import time
from flask import send_from_directory, request, session, redirect
from flask_socketio import emit, join_room
import copy
import pymysql
import os

from app import app, io, redis_store, problems, level, contest_root, ejudge_url, hidden_users
from app.decorators import auth_required
from app import user_logins

DIRECTIONS = {
    "left": (-1, 0),
    "up": (0, -1),
    "right": (1, 0),
    "down": (0, 1)
}

SOLID = ["#", "s"]
TRANSPARENT = [" ", "s"]


def inbounds(x, y):
    return 0 <= x < level['width'] and 0 <= y < level['height']


def at(x, y):
    if not inbounds(x, y):
        return " "
    return level['level'][y][x]


def solid(x, y):
    return at(x, y) in SOLID


def transparent(x, y):
    return at(x, y) in TRANSPARENT


def update_visible(visible, x, y, first=False):
    if not inbounds(x, y):
        return False

    if not first and visible[x][y]:
        return False

    upd = False
    if not visible[x][y]:
        visible[x][y] = 1
        upd = True

    if not first and not transparent(x, y):
        return upd

    for dir in DIRECTIONS:
        d = DIRECTIONS[dir]
        upd |= update_visible(visible, x + d[0], y + d[1])

    return upd


def populate(login):
    redis_store.setnx(login + ':player.x', level['player']['x'])
    redis_store.setnx(login + ':player.y', level['player']['y'])
    visible = [[0] * level['height'] for _ in range(level['width'])]
    redis_store.setnx(login + ':visible', msgpack.dumps(visible))
    redis_store.setnx(login + ':name', login)
    redis_store.setnx(login + ':coins', 0)
    redis_store.setnx(login + ':score', 0)


def is_door_opened(login, x, y):
    if ('%d,%d' % (x, y)) not in level['doors']:
        return True
    prob_id = level['doors'].get('%d,%d' % (x, y))
    if redis_store.get(login + ':solved:' + str(prob_id)):
        return True
    return False


def is_coin_picked(x, y):
    if redis_store.get('coin_%d,%d' % (x, y)):
        return True
    return False


def get_door_problem(x, y):
    return level['doors'].get('%d,%d' % (x, y))


def render_scoreboard():
    users = [u for u in user_logins if u not in hidden_users]
    scores = []
    for login in users:
        try:
            score = int(redis_store.get(login + ':score') or 0)
            coins = int(redis_store.get(login + ':coins') or 0)
            name = redis_store.get(login + ':name').decode()
        except:
            continue
        scores.append((score, coins, name))
    scores.sort(key=lambda x: (-x[0], -x[1], x[2]))
    return scores


def get_scoreboard():
    # todo: add caching
    return render_scoreboard()


def remaining_time():
    dur = level.get('dur', 0)
    t = round(time.time())
    s = 0
    try:
        s = int(redis_store.get('start_time'))
    except:
        pass
    passed = t - s
    rem = dur - passed
    if rem < 0:
        rem = 0
    return rem


def get_frac_time():
    dur = level.get('dur', 0)
    if dur == 0:
        return 1
    rem = remaining_time()
    return rem / dur


def get_reward(base):
    k = 0.3 + 0.7 * get_frac_time()
    return round(k * base)


def background_task():
    print("running background task...")
    socketio = app.extensions['socketio']
    db = pymysql.connect("localhost", "ejudge", "ejudge", "ejudge")
    rdb = redis.Redis()
    while True:
        with db.cursor() as cursor:
            sql = """
SELECT logins.login, runs.prob_id FROM logins
INNER JOIN runs ON runs.user_id=logins.user_id WHERE runs.contest_id=%d
AND NOT runs.is_marked AND runs.status=0;
""" % level['id']

            cursor.execute(sql)
            results = cursor.fetchall()
            for row in results:
                login = row[0]
                _prob_id = row[1]
                prob_id = None
                for prob in problems:
                    if problems[prob].get("id") == _prob_id:
                        prob_id = prob
                        break
                if prob_id is None:
                    continue
                if not rdb.get(login + ":solved:" + prob_id):
                    rdb.set(login + ":solved:" + prob_id, 1)
                    rdb.incrby(login + ':score', get_reward(problems[prob_id]['reward']))
                    socketio.emit('problem.ok', int(prob_id), room=login)

            sql = """
UPDATE runs SET is_marked=1 WHERE contest_id=%d AND NOT is_marked AND status=0;
""" % level['id']

            try:
                cursor.execute(sql)
                db.commit()
            except:
                db.rollback()
        gevent.sleep(1)


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/<filename>.pdf')
def send_pdf(filename):
    if filename == "love-letter":
        return redirect("/static/dQw4w9WgXcQ.mp4")
    return send_from_directory(os.path.join(contest_root, 'statements'), '%s.pdf' % filename)


@app.route('/ej')
def ej_redirect():
    return redirect(ejudge_url)


@app.route('/PleaseStartTheContest', methods=['GET', 'POST'])
def please_start_the_contest():
    if request.method == "POST":
        redis_store.set('running', 1)
        redis_store.set('start_time', round(time.time()))
        return "ok"
    return '''
<form method="POST">
<button type="submit">start</button>
</form>
'''


@app.route('/PleaseStopTheContest', methods=['GET', 'POST'])
def please_stop_the_contest():
    if request.method == "POST":
        redis_store.delete('running')
        return "ok"
    return '''
<form method="POST">
<button type="submit">stop</button>
</form>
'''


@app.route('/time')
def remaining_time_view():
    return str(remaining_time())


@io.on('login')
def io_login(login, password):
    if user_logins.get(login) == password:
        session['user'] = login
        join_room(login)
        populate(login)
        emit('login.ok')
    else:
        emit('login.fail')


@io.on('map.send')
@auth_required
def io_map_send():
    login = session['user']
    try:
        x = int(redis_store.get(login + ':player.x'))
        y = int(redis_store.get(login + ':player.y'))
        visible = msgpack.loads(redis_store.get(login + ':visible'))
        coins = int(redis_store.get(login + ':coins'))
    except:
        return
    data = copy.deepcopy(level)
    data['player']['x'] = x
    data['player']['y'] = y
    data['coins'] = coins
    data['ghosts'] = {}
    for k in user_logins:
        if k in hidden_users:
            continue
        try:
            px = int(redis_store.get(k + ':player.x'))
            py = int(redis_store.get(k + ':player.y'))
        except:
            continue
        data['ghosts'][k] = {
            'x': px,
            'y': py
        }
    for door in level['doors']:
        if redis_store.get(login + ':solved:' + str(level['doors'][door])):
            data['doors'][door] = -1
    for i in range(level['width']):
        for j in range(level['height']):
            if level['level'][j][i] == '$':
                if is_coin_picked(i, j):
                    data['level'][j][i] = ' '
    emit('map.recv', msgpack.dumps(data))
    if update_visible(visible, x, y, True):
        redis_store.set(login + ':visible', msgpack.dumps(visible))
    emit('map.visible', msgpack.dumps(visible))


@io.on('player.move')
@auth_required
def io_player_move(dir):
    login = session['user']
    try:
        x = int(redis_store.get(login + ':player.x'))
        y = int(redis_store.get(login + ':player.y'))
        visible = msgpack.loads(redis_store.get(login + ':visible'))
    except:
        return
    if dir not in DIRECTIONS:
        return
    dx, dy = DIRECTIONS[dir]
    nx, ny = x + dx, y + dy
    g = at(nx, ny)
    if (g not in SOLID) and (g != "D" or is_door_opened(login, nx, ny)):
        x = nx
        y = ny
        if update_visible(visible, x, y, first=True):
            redis_store.set(login + ':visible', msgpack.dumps(visible))
            emit('map.visible', msgpack.dumps(visible), room=login)
        redis_store.set(login + ':player.x', x)
        redis_store.set(login + ':player.y', y)
        emit('player.position', (x, y), room=login)
        if login not in hidden_users:
            emit('ghost.position', (login, x, y), broadcast=True)
        if g == "$" and not is_coin_picked(nx, ny):
            redis_store.incr(login + ':coins')
            redis_store.set('coin_%d,%d' % (nx, ny), 1)
    else:
        if g == 's':
            # scoreboard
            emit('scoreboard.view', msgpack.dumps(get_scoreboard()))

        if g == "D":
            # closed door
            prob_id = get_door_problem(nx, ny)
            if prob_id is None:
                return

            prob_data = problems.get(str(prob_id))
            if prob_data is None:
                return

            if prob_data['type'] in ["team_name", "answer", "guess"]:
                data = {
                    "name": prob_data['name'],
                    "type": "answer",
                    "id": prob_id,
                    "reward": prob_data['reward'],
                    "cur_reward": get_reward(prob_data['reward'])
                }
                if 'statement' in prob_data:
                    data['statement'] = prob_data['statement']
                else:
                    if 'internal_name' in prob_data:
                        data['statement_url'] = "/%s.pdf" % prob_data['internal_name']
                    else:
                        data['statement_url'] = prob_data['statement_url']
                emit('problem.view', msgpack.dumps(data))

            if prob_data['type'] in ['standard']:
                data = {
                    "name": prob_data['name'],
                    "type": "standard",
                    "short_name": prob_data['short_name'],
                    "statement_url": "/%s.pdf" % prob_data['internal_name'],
                    "id": prob_id,
                    "reward": prob_data['reward'],
                    "cur_reward": get_reward(prob_data['reward'])
                }
                emit('problem.view', msgpack.dumps(data))


@io.on('problem.answer')
@auth_required
def io_problem_answer(prob_id, answer):
    answer = answer.strip()
    login = session['user']
    prob_data = problems.get(str(prob_id))
    if prob_data is None:
        return

    solved = False
    msg = "Неправильный ответ"

    if redis_store.get('running') or app.config['CONTEST'] == 'practice':
        if prob_data['type'] == "team_name":
            redis_store.set(login + ':name', answer)
            solved = True

        if prob_data['type'] in ['answer', 'guess']:
            if answer == prob_data['answer']:
                solved = True

        if not solved and prob_data['type'] == "guess":
            try:
                number = int(answer)
            except:
                msg = "Введите число"
            else:
                correct = int(prob_data['answer'])
                if correct > number:
                    msg = "Моё число больше"
                else:
                    msg = "Моё число меньше"
    else:
        msg = "Соревнование ещё не началось"

    if solved:
        if not redis_store.get(login + ':solved:' + str(prob_id)):
            redis_store.set(login + ':solved:' + str(prob_id), 1)
            redis_store.incrby(login + ':score', get_reward(problems[str(prob_id)]['reward']))
            emit('problem.ok', prob_id, room=login)
    else:
        emit('problem.wrong_answer', msg)

