from flask import session

from app import user_logins


def auth_required(f):
    def decorated(*args, **kwargs):
        if session.get('user') in user_logins:
            return f(*args, **kwargs)
    return decorated
