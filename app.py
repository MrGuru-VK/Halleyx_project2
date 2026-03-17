from functools import wraps
from flask import Flask, Response, jsonify, request, session, redirect
from flask_cors import CORS
import json
import os
import uuid

from index import INDEX_TEMPLATE, LOGIN_TEMPLATE
from styles import css_content

app = Flask(__name__)
app.secret_key = os.environ.get('HALLEYX_SECRET_KEY', 'halleyx-dev-secret')
CORS(app)

ORDERS_FILE = 'orders.json'
DASHBOARD_FILE = 'dashboard.json'
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
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

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

    if username == SAMPLE_USERNAME and password == SAMPLE_PASSWORD:
        session['logged_in'] = True
        session['username'] = username
        return jsonify({'ok': True, 'redirect': '/workspace'})

    return jsonify({
        'ok': False,
        'message': 'Invalid credentials. Try admin / admin123.'
    }), 401


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
    orders = load_data(ORDERS_FILE)
    return jsonify(orders)

@app.route('/orders', methods=['POST'])
@login_required
def create_order():
    data = request.json
    orders = load_data(ORDERS_FILE)
    order_id = str(uuid.uuid4())
    data['id'] = order_id
    orders.append(data)
    save_data(ORDERS_FILE, orders)
    return jsonify({'id': order_id}), 201

@app.route('/orders/<order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    data = request.json
    orders = load_data(ORDERS_FILE)
    for order in orders:
        if order['id'] == order_id:
            order.update(data)
            save_data(ORDERS_FILE, orders)
            return jsonify({'message': 'Updated'})
    return jsonify({'error': 'Not found'}), 404

@app.route('/orders/<order_id>', methods=['DELETE'])
@login_required
def delete_order(order_id):
    orders = load_data(ORDERS_FILE)
    orders = [o for o in orders if o['id'] != order_id]
    save_data(ORDERS_FILE, orders)
    return jsonify({'message': 'Deleted'})

@app.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard():
    dashboard = load_data(DASHBOARD_FILE, {})
    return jsonify(dashboard)

@app.route('/dashboard', methods=['POST'])
@login_required
def save_dashboard():
    data = request.json
    save_data(DASHBOARD_FILE, data)
    return jsonify({'message': 'Saved'})


def render_dashboard_in_ipython():
    try:
        from IPython.display import HTML
    except ImportError as exc:
        raise RuntimeError('IPython is not installed in this environment.') from exc

    return HTML(INDEX_TEMPLATE)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
