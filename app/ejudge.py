import subprocess

from app import level, redis_store

EJUDGE_USER_LOGIN = 'ejudge'
EJUDGE_USER_PASSWORD = 'ejudge'
EJUDGE_CONTEST_ID = level['id']
EJUDGE_CONTESTS_CMD_PATH = '/opt/ejudge/bin/ejudge-contests-cmd'
REDIS_KEY = 'ejsid:%s:%d' % (EJUDGE_USER_LOGIN, EJUDGE_CONTEST_ID)
TTL = 12 * 60 * 60


def get_session(force=False):
    session = None
    if not force:
        session = redis_store.get(REDIS_KEY)
        if session:
            return session.decode()

    try:
        session = subprocess.check_output([
            EJUDGE_CONTESTS_CMD_PATH,
            str(EJUDGE_CONTEST_ID),
            "master-login",
            "STDOUT",
            EJUDGE_USER_LOGIN,
            EJUDGE_USER_PASSWORD
        ])
        session = session.strip()
    except:
        return None

    if not session:
        return None

    redis_store.set(REDIS_KEY, session)
    redis_store.expire(REDIS_KEY, TTL)
    return session.decode()


def do_contests_cmd(ssid, action, *params):
    try:
        output = subprocess.check_output([
            EJUDGE_CONTESTS_CMD_PATH,
            str(EJUDGE_CONTEST_ID),
            action,
            "--session",
            ssid
        ] + list(map(str, params))).decode()
    except:
        return None
    return output


def contests_cmd(action, *params):
    res = do_contests_cmd(get_session(), action, *params)
    if res is not None:
        return res
    return do_contests_cmd(get_session(force=True), action, *params)