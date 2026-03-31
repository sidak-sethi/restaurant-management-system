from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db, init_db
import sqlite3

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/menu', methods=['GET'])
def get_menu():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM menu_item WHERE is_available = TRUE")
    data = [dict(row) for row in cursor.fetchall()]
    db.close()
    return jsonify(data)

@app.route('/api/orders', methods=['GET'])
def get_orders():
    db = get_db()
    cursor = db.cursor()
    # Fetch orders along with their items
    cursor.execute("SELECT * FROM orders ORDER BY placed_at DESC")
    orders = [dict(row) for row in cursor.fetchall()]

    for order in orders:
        cursor.execute("""
            SELECT oi.*, mi.name 
            FROM order_item oi 
            JOIN menu_item mi ON oi.item_id = mi.item_id 
            WHERE oi.order_id = ?
        """, (order['order_id'],))
        order['items'] = [dict(row) for row in cursor.fetchall()]

    db.close()
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json
    table_id = data.get('tableId') # adjusted to match frontend current naming if possible
    items = data.get('items') # [{item, qty}]
    total = data.get('total')
    wait_mins = data.get('waitMins', 15)
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO orders (table_id, status, total_amount) VALUES (?, 'cooking', ?)",
            (table_id, total)
        )
        order_id = cursor.lastrowid
        
        for entry in items:
            item = entry['item']
            qty = entry['qty']
            cursor.execute(
                "INSERT INTO order_item (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
                (order_id, item['id'], qty, item['price'])
            )
            
        db.commit()
        return jsonify({"orderId": order_id, "status": "success"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/orders/<int:id>', methods=['PATCH'])
def update_order(id):
    data = request.json
    status = data.get('status')
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        (status, id)
    )
    db.commit()
    db.close()
    return jsonify({"message": "updated"})

# Helper endpoint to seed menu (one-time use)
@app.route('/api/seed', methods=['POST'])
def seed_menu():
    menu_data = request.json
    db = get_db()
    cursor = db.cursor()
    
    for category, items in menu_data.items():
        for item in items:
            cursor.execute(
                "INSERT OR REPLACE INTO menu_item (item_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)",
                (item['id'], item['name'], item['desc'], item['price'], category)
            )
    db.commit()
    db.close()
    return jsonify({"message": "seeded successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
