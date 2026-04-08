import sqlite3
import json

MENU_DATA = {
    "Breakfast": [
        {"id": "b1", "name": "Aloo Puri", "price": 120},
        {"id": "b2", "name": "Paneer Stuffed Paratha", "price": 90},
        {"id": "b3", "name": "Chole Bhature", "price": 180},
        {"id": "b4", "name": "Poha with Sev", "price": 70},
        {"id": "b5", "name": "Mixed Veg Cutlet", "price": 110},
        {"id": "b6", "name": "Bedmi Poori", "price": 130},
        {"id": "b7", "name": "Sweet Lassi", "price": 80},
    ],
    "Snacks": [
        {"id": "s1", "name": "Hara Bhara Kabab", "price": 160},
        {"id": "s2", "name": "Dahi Ke Sholay", "price": 190},
        {"id": "s3", "name": "Crispy Corn Chaat", "price": 140},
        {"id": "s4", "name": "Paneer Tikka Classic", "price": 220},
        {"id": "s5", "name": "Veg Spring Rolls", "price": 150},
        {"id": "s6", "name": "Chilli Mushroom", "price": 180},
        {"id": "s7", "name": "Soya Chaap Afghani", "price": 210},
    ],
    "Lunch": [
        {"id": "l1", "name": "Dal Makhani", "price": 220},
        {"id": "l2", "name": "Paneer Butter Masala", "price": 260},
        {"id": "l3", "name": "Mix Veg Handi", "price": 190},
        {"id": "l4", "name": "Jeera Rice", "price": 140},
        {"id": "l5", "name": "Malai Kofta", "price": 240},
        {"id": "l6", "name": "Hyderabadi Dum Biryani", "price": 280},
        {"id": "l7", "name": "Garlic Naan", "price": 90},
    ],
    "Dinner": [
        {"id": "d1", "name": "Shahi Paneer", "price": 250},
        {"id": "d2", "name": "Kadhai Paneer", "price": 260},
        {"id": "d3", "name": "Amritsari Kulcha Combo", "price": 220},
        {"id": "d4", "name": "Veg Pulao", "price": 180},
        {"id": "d5", "name": "Tandoori Roti Basket", "price": 140},
        {"id": "d6", "name": "Gulab Jamun", "price": 90},
        {"id": "d7", "name": "Sizzling Brownie", "price": 160},
    ],
}

import os

def seed():
    # Remove existing database to ensure clean schema
    if os.path.exists('restaurant.db'):
        os.remove('restaurant.db')
        
    conn = sqlite3.connect('restaurant.db')
    cursor = conn.cursor()
    
    # Initialize schema
    with open('schema.sql', mode='r') as f:
        cursor.executescript(f.read())
    
    # Seed Menu Items
    for category, items in MENU_DATA.items():
        for item in items:
            cursor.execute(
                "INSERT OR REPLACE INTO menu_item (item_id, name, price, category) VALUES (?, ?, ?, ?)",
                (item['id'], item['name'], item['price'], category)
            )
    
    # Seed Tables (1 to 10)
    for i in range(1, 11):
        cursor.execute(
            "INSERT OR IGNORE INTO tables (table_id, status) VALUES (?, 'AVAILABLE')",
            (i,)
        )
        
    # Seed Initial Inventory (linked to menu items)
    for category, items in MENU_DATA.items():
        for item in items:
            cursor.execute(
                "INSERT OR REPLACE INTO inventory (item_id, item_name, stock_quantity) VALUES (?, ?, ?)",
                (item['id'], item['name'], 100) # Initial stock of 100
            )
    
    conn.commit()
    conn.close()
    print("Database seeded with menu, tables, and inventory!")

if __name__ == "__main__":
    seed()
