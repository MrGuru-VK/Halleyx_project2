from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import uuid

app = Flask(__name__)
CORS(app)

ORDERS_FILE = 'orders.json'
DASHBOARD_FILE = 'dashboard.json'

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

@app.route('/orders', methods=['GET'])
def get_orders():
    orders = load_data(ORDERS_FILE)
    return jsonify(orders)

@app.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    orders = load_data(ORDERS_FILE)
    order_id = str(uuid.uuid4())
    data['id'] = order_id
    orders.append(data)
    save_data(ORDERS_FILE, orders)
    return jsonify({'id': order_id}), 201

@app.route('/orders/<order_id>', methods=['PUT'])
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
def delete_order(order_id):
    orders = load_data(ORDERS_FILE)
    orders = [o for o in orders if o['id'] != order_id]
    save_data(ORDERS_FILE, orders)
    return jsonify({'message': 'Deleted'})

@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    dashboard = load_data(DASHBOARD_FILE, {})
    return jsonify(dashboard)

@app.route('/dashboard', methods=['POST'])
def save_dashboard():
    data = request.json
    save_data(DASHBOARD_FILE, data)
    return jsonify({'message': 'Saved'})

if __name__ == '__main__':
    app.run(debug=True)