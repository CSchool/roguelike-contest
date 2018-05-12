import gevent
from flask import Flask
from flask_redis import FlaskRedis
from flask_socketio import SocketIO
import json
import os
import csv


app = Flask(__name__)
app.config['SECRET_KEY'] = b'k\x81\xa2I\xe6\xecOEM\x12Vr8\xa2\xbf\xbe\x9f%\xc10\xa2J"\x9e'
app.config['REDIS_URL'] = 'redis://localhost:6379/0'

with open(os.path.join(app.root_path, "contest.txt")) as f:
    app.config['CONTEST'] = f.read().strip()

print("loading contest '%s'" % app.config['CONTEST'])

io = SocketIO(app)
redis_store = FlaskRedis(app)

contest_root = os.path.join(app.root_path, "data", app.config.get('CONTEST'))

with open(os.path.join(contest_root, "problems.json")) as f:
    problems = json.load(f)

with open(os.path.join(contest_root, "meta.json")) as f:
    level = json.load(f)

with open(os.path.join(contest_root, "map.txt")) as f:
    level['level'] = [list(i) for i in f]

user_logins = {}
hidden_users = set()

with open(os.path.join(app.root_path, "users.csv")) as f:
    reader = csv.reader(f, delimiter=';')
    for row in reader:
        login, password = row
        if login == "login":
            continue
        user_logins[login] = password

with open(os.path.join(app.root_path, "hidden_users.txt")) as f:
    for line in f:
        login = line.strip()
        if login:
            hidden_users.add(login)

ejudge_url = "/cgi-bin/new-client?contest_id=%d" % level['id']

from app import routes

gevent.spawn(routes.background_task)