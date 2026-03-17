from functools import wraps
from flask import Flask, Response, jsonify, request, session, redirect
from flask_cors import CORS
import json
import os
import uuid
import re
import time
import hmac
import hashlib
import struct
import base64
import secrets
from urllib.parse import quote

from index import INDEX_TEMPLATE, LOGIN_TEMPLATE, AUTHENTICATOR_TEMPLATE
from styles import css_content

app = Flask(__name__)
app.secret_key = os.environ.get('HALLEYX_SECRET_KEY', 'halleyx-dev-secret')
CORS(app)

ORDERS_FILE = 'orders.json'
DASHBOARD_FILE = 'dashboard.json'
USERS_FILE = 'users.json'
USER_DATA_DIR = 'user_data'
SAMPLE_USERNAME = 'admin'
SAMPLE_PASSWORD = 'admin123'

def load_data(filename, default=None):
    if default is None:
        default = []
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return default

def save_data(filename, data):
    directory = os.path.dirname(filename)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)


def slugify_username(username):
    return re.sub(r'[^a-z0-9_-]', '-', username.lower()).strip('-') or 'user'


def get_users():
    users = load_data(USERS_FILE, [])
    if not users:
        users = [{
            'username': SAMPLE_USERNAME,
            'password': SAMPLE_PASSWORD,
            'display_name': 'Administrator',
            'authenticator_secret': generate_authenticator_secret()
        }]
        save_data(USERS_FILE, users)
    return users


def find_user(username):
    return next((user for user in get_users() if user['username'].lower() == username.lower()), None)


def save_users(users):
    save_data(USERS_FILE, users)


def ensure_user_authenticator(username):
    users = get_users()
    updated = False
    user_secret = None
    for user in users:
        if user['username'].lower() == username.lower():
            if not user.get('authenticator_secret'):
                user['authenticator_secret'] = generate_authenticator_secret()
                updated = True
            user_secret = user['authenticator_secret']
            break
    if updated:
        save_users(users)
    return user_secret


def get_user_paths(username):
    safe_username = slugify_username(username)
    user_root = os.path.join(USER_DATA_DIR, safe_username)
    return {
        'root': user_root,
        'orders': os.path.join(user_root, 'orders.json'),
        'dashboard': os.path.join(user_root, 'dashboard.json'),
        'environment': os.path.join(user_root, 'environment.json')
    }


def ensure_user_storage(username):
    paths = get_user_paths(username)
    os.makedirs(paths['root'], exist_ok=True)

    if not os.path.exists(paths['orders']):
        seed_orders = load_data(ORDERS_FILE, []) if username == SAMPLE_USERNAME else []
        save_data(paths['orders'], seed_orders)

    if not os.path.exists(paths['dashboard']):
        seed_dashboard = load_data(DASHBOARD_FILE, {}) if username == SAMPLE_USERNAME else {'widgets': []}
        save_data(paths['dashboard'], seed_dashboard)

    if not os.path.exists(paths['environment']):
        save_data(paths['environment'], {
            'username': username,
            'theme': 'modern-glass',
            'workspace': 'default',
            'created_for': 'Halleyx Dashboard Builder'
        })

    return paths


def current_user_paths():
    username = session.get('username')
    if not username:
        raise RuntimeError('No logged in user in session.')
    return ensure_user_storage(username)


def generate_authenticator_secret():
    return base64.b32encode(secrets.token_bytes(10)).decode('utf-8').rstrip('=')


def generate_totp_code(secret, interval=30, digits=6):
    padded_secret = secret + ('=' * ((8 - len(secret) % 8) % 8))
    key = base64.b32decode(padded_secret, casefold=True)
    counter = int(time.time() // interval)
    msg = struct.pack('>Q', counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code_int = struct.unpack('>I', digest[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(code_int % (10 ** digits)).zfill(digits)


def verify_totp_code(secret, code, interval=30, digits=6, allowed_drift=1):
    normalized_code = str(code or '').strip()
    if not (normalized_code.isdigit() and len(normalized_code) == digits):
        return False

    padded_secret = secret + ('=' * ((8 - len(secret) % 8) % 8))
    key = base64.b32decode(padded_secret, casefold=True)
    current_counter = int(time.time() // interval)

    for drift in range(-allowed_drift, allowed_drift + 1):
        counter = current_counter + drift
        msg = struct.pack('>Q', counter)
        digest = hmac.new(key, msg, hashlib.sha1).digest()
        offset = digest[-1] & 0x0F
        code_int = struct.unpack('>I', digest[offset:offset + 4])[0] & 0x7FFFFFFF
        expected = str(code_int % (10 ** digits)).zfill(digits)
        if hmac.compare_digest(expected, normalized_code):
            return True
    return False


def build_otpauth_uri(username, secret, issuer='Halleyx Dashboard'):
    label = quote(f'{issuer}:{username}')
    issuer_param = quote(issuer)
    return f'otpauth://totp/{label}?secret={secret}&issuer={issuer_param}&algorithm=SHA1&digits=6&period=30'

def login_required(view_func):
    @wraps(view_func)
    def wrapped_view(*args, **kwargs):
        if not session.get('logged_in'):
            if request.path.startswith('/orders') or request.path.startswith('/dashboard'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect('/')
        return view_func(*args, **kwargs)
    return wrapped_view

@app.route('/', methods=['GET'])
def login_page():
    if session.get('logged_in'):
        return redirect('/workspace')
    return Response(LOGIN_TEMPLATE, mimetype='text/html')


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    user = find_user(username)

    if user and user['password'] == password:
        session['logged_in'] = True
        session['username'] = user['username']
        ensure_user_storage(user['username'])
        return jsonify({'ok': True, 'redirect': '/workspace'})

    return jsonify({
        'ok': False,
        'message': 'Invalid credentials. Try admin / admin123.'
    }), 401


@app.route('/authenticator', methods=['GET'])
def authenticator_page():
    return Response(AUTHENTICATOR_TEMPLATE, mimetype='text/html')


@app.route('/authenticator/setup', methods=['POST'])
def authenticator_setup():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    user = find_user(username)

    if not user:
        return jsonify({'ok': False, 'message': 'User not found.'}), 404

    secret = ensure_user_authenticator(user['username'])
    return jsonify({
        'ok': True,
        'username': user['username'],
        'secret': secret,
        'otpauth_uri': build_otpauth_uri(user['username'], secret),
        'message': 'Add this account in Google Authenticator, then enter the 6-digit code.'
    })


@app.route('/authenticator/verify', methods=['POST'])
def authenticator_verify():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    code = (data.get('code') or '').strip()
    user = find_user(username)

    if not user:
        return jsonify({'ok': False, 'message': 'User not found.'}), 404

    secret = ensure_user_authenticator(user['username'])
    if not verify_totp_code(secret, code):
        return jsonify({'ok': False, 'message': 'Invalid authenticator code.'}), 401

    session['password_reset_verified_for'] = user['username']
    return jsonify({
        'ok': True,
        'message': 'Code verified. You can reset the password now.'
    })


@app.route('/authenticator/reset-password', methods=['POST'])
def authenticator_reset_password():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    new_password = data.get('newPassword') or ''

    if session.get('password_reset_verified_for') != username:
        return jsonify({'ok': False, 'message': 'Verify the authenticator code first.'}), 403

    if len(new_password) < 4:
        return jsonify({'ok': False, 'message': 'Password must be at least 4 characters.'}), 400

    users = get_users()
    updated = False
    for user in users:
        if user['username'].lower() == username.lower():
            user['password'] = new_password
            updated = True
            break

    if not updated:
        return jsonify({'ok': False, 'message': 'User not found.'}), 404

    save_users(users)
    session.pop('password_reset_verified_for', None)
    return jsonify({
        'ok': True,
        'message': 'Password updated successfully. Return to login and sign in.'
    })


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    display_name = (data.get('displayName') or username).strip()

    if not username or not password:
        return jsonify({'ok': False, 'message': 'Username and password are required.'}), 400

    if len(password) < 4:
        return jsonify({'ok': False, 'message': 'Password must be at least 4 characters.'}), 400

    if find_user(username):
        return jsonify({'ok': False, 'message': 'That username already exists.'}), 409

    users = get_users()
    new_user = {
        'username': username,
        'password': password,
        'display_name': display_name
    }
    users.append(new_user)
    save_data(USERS_FILE, users)
    ensure_user_storage(username)

    return jsonify({
        'ok': True,
        'message': 'User created successfully. You can log in now.',
        'user_files': get_user_paths(username)
    }), 201


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True, 'redirect': '/'})


@app.route('/workspace', methods=['GET'])
@login_required
def workspace():
    return Response(INDEX_TEMPLATE, mimetype='text/html')


@app.route('/styles.css', methods=['GET'])
def styles():
    return Response(css_content, mimetype='text/css')


@app.route('/script.js', methods=['GET'])
def script():
    script_path = os.path.join(os.path.dirname(__file__), 'script.js')
    with open(script_path, 'r', encoding='utf-8') as f:
        return Response(f.read(), mimetype='application/javascript')

@app.route('/orders', methods=['GET'])
@login_required
def get_orders():
    orders = load_data(current_user_paths()['orders'], [])
    return jsonify(orders)

@app.route('/orders', methods=['POST'])
@login_required
def create_order():
    data = request.json
    orders = load_data(current_user_paths()['orders'], [])
    order_id = str(uuid.uuid4())
    data['id'] = order_id
    orders.append(data)
    save_data(current_user_paths()['orders'], orders)
    return jsonify({'id': order_id}), 201

@app.route('/orders/<order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    data = request.json
    user_files = current_user_paths()
    orders = load_data(user_files['orders'], [])
    for order in orders:
        if order['id'] == order_id:
            order.update(data)
            save_data(user_files['orders'], orders)
            return jsonify({'message': 'Updated'})
    return jsonify({'error': 'Not found'}), 404

@app.route('/orders/<order_id>', methods=['DELETE'])
@login_required
def delete_order(order_id):
    user_files = current_user_paths()
    orders = load_data(user_files['orders'], [])
    orders = [o for o in orders if o['id'] != order_id]
    save_data(user_files['orders'], orders)
    return jsonify({'message': 'Deleted'})

@app.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard():
    dashboard = load_data(current_user_paths()['dashboard'], {})
    return jsonify(dashboard)

@app.route('/dashboard', methods=['POST'])
@login_required
def save_dashboard():
    data = request.json
    save_data(current_user_paths()['dashboard'], data)
    return jsonify({'message': 'Saved'})


def render_dashboard_in_ipython():
    try:
        from IPython.display import HTML
    except ImportError as exc:
        raise RuntimeError('IPython is not installed in this environment.') from exc

    return HTML(INDEX_TEMPLATE)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
