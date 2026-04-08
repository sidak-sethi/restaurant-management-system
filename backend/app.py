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
    # Standardize statuses for filtering if needed
    status_filter = request.args.get('status')
    table_id = request.args.get('table_id')
    
    db = get_db()
    cursor = db.cursor()
    
    query = "SELECT * FROM orders"
    conditions = []
    params = []
    
    if status_filter:
        conditions.append("status = ?")
        params.append(status_filter)
    
    if table_id:
        conditions.append("table_id = ?")
        params.append(table_id)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY placed_at DESC"
    
    cursor.execute(query, params)
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
    table_id = data.get('tableId') # integer expected
    items_input = data.get('items') # expected list of {"item_id", "quantity"}
    
    if not table_id or not items_input:
        return jsonify({"error": "Missing tableId or items"}), 400

    db = get_db()
    cursor = db.cursor()
    
    try:
        # 1. Verify table exists
        cursor.execute("SELECT status FROM tables WHERE table_id = ?", (table_id,))
        table = cursor.fetchone()
        if not table:
            return jsonify({"error": "Table not found"}), 404
        # We allow orders even if status is OCCUPIED to enable "Order More" functionality

        # 2. Calculate total and verify items
        total_amount = 0
        order_items = []
        for entry in items_input:
            item_id = entry['item_id']
            qty = entry['quantity']
            cursor.execute("SELECT price FROM menu_item WHERE item_id = ?", (item_id,))
            mi = cursor.fetchone()
            if not mi:
                raise Exception(f"Item {item_id} not found")
            
            price = mi['price']
            total_amount += price * qty
            order_items.append((item_id, qty, price))

        # 3. Create Order
        cursor.execute(
            "INSERT INTO orders (table_id, status, total_amount) VALUES (?, 'PLACED', ?)",
            (table_id, total_amount)
        )
        order_id = cursor.lastrowid
        
        # 4. Insert Order Items
        for item_id, qty, price in order_items:
            cursor.execute(
                "INSERT INTO order_item (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
                (order_id, item_id, qty, price)
            )
            
        # 5. Update Table Status
        cursor.execute("UPDATE tables SET status = 'OCCUPIED' WHERE table_id = ?", (table_id,))
            
        db.commit()
        return jsonify({"orderId": order_id, "status": "success", "total_amount": total_amount})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/orders/<int:id>', methods=['PATCH'])
def update_order(id):
    data = request.json
    new_status = data.get('status')
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Get current status
        cursor.execute("SELECT status FROM orders WHERE order_id = ?", (id,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        current_status = order['status']
        
        # Enforce status flow
        valid_transitions = {
            'PLACED': ['PREPARING'],
            'PREPARING': ['SERVED'],
            'SERVED': ['PAID'],
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            return jsonify({"error": f"Invalid transition from {current_status} to {new_status}"}), 400

        cursor.execute(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            (new_status, id)
        )
        db.commit()
        return jsonify({"message": "status updated"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/payments', methods=['POST'])
def process_payment():
    data = request.json
    order_id = data.get('order_id')
    method = data.get('payment_method', 'Cash')
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # 1. Get Order details
        cursor.execute("SELECT status, total_amount, table_id FROM orders WHERE order_id = ?", (order_id,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        if order['status'] == 'PAID':
            return jsonify({"error": "Order is already PAID"}), 400
            
        # 2. Insert Payment Record
        cursor.execute(
            "INSERT INTO payment (order_id, amount, payment_method) VALUES (?, ?, ?)",
            (order_id, order['total_amount'], method)
        )
        
        # 3. Update Order Status
        cursor.execute("UPDATE orders SET status = 'PAID' WHERE order_id = ?", (order_id,))
        
        # 4. Update Table Status
        cursor.execute("UPDATE tables SET status = 'AVAILABLE' WHERE table_id = ?", (order['table_id'],))
        
        db.commit()
        return jsonify({"status": "success", "message": "Payment processed, table is now AVAILABLE"})
    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": "Payment already exists for this order"}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/tables', methods=['GET'])
def get_tables():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tables")
    data = [dict(row) for row in cursor.fetchall()]
    db.close()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
