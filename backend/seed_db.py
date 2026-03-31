import sqlite3
import json

MENU_DATA = {
    "Breakfast": [
        {"id": "b1", "name": "Aloo Puri", "desc": "3 pcs · golden puri with spiced aloo sabzi", "price": 120},
        {"id": "b2", "name": "Paneer Stuffed Paratha", "desc": "Crisp layered paratha · pickle & curd", "price": 90},
        {"id": "b3", "name": "Chole Bhature", "desc": "Fluffy bhature · tangy Punjabi chole · onion salad", "price": 180},
        {"id": "b4", "name": "Poha with Sev", "desc": "Light flattened rice · mustard tempering · coriander", "price": 70},
        {"id": "b5", "name": "Mixed Veg Cutlet", "desc": "Pan-fried potato patties · mint chutney", "price": 110},
        {"id": "b6", "name": "Bedmi Poori", "desc": "Urad dal stuffed pooris · classic Banaras style", "price": 130},
        {"id": "b7", "name": "Sweet Lassi", "desc": "Clay pot · chilled · full-cream milk · rose water", "price": 80},
    ],
    "Snacks": [
        {"id": "s1", "name": "Hara Bhara Kabab", "desc": "Spinach & peas patties · grilled · tamarind dip", "price": 160},
        {"id": "s2", "name": "Dahi Ke Sholay", "desc": "Bread triangles · hung curd filling · golden fried", "price": 190},
        {"id": "s3", "name": "Crispy Corn Chaat", "desc": "Sweet corn · peppers · chaat masala · lemon", "price": 140},
        {"id": "s4", "name": "Paneer Tikka Classic", "desc": "Marinated cottage cheese · tandoor charred · 4 pcs", "price": 220},
        {"id": "s5", "name": "Veg Spring Rolls", "desc": "Crispy rolls · mixed vegetables · schezwan dip", "price": 150},
        {"id": "s6", "name": "Chilli Mushroom", "desc": "Indo-Chinese wok-tossed mushrooms · spring onion", "price": 180},
        {"id": "s7", "name": "Soya Chaap Afghani", "desc": "Creamy malai marinade · charcoal grilled · 3 pcs", "price": 210},
    ],
    "Lunch": [
        {"id": "l1", "name": "Dal Makhani", "desc": "Slow-cooked overnight · black lentils · butter & cream", "price": 220},
        {"id": "l2", "name": "Paneer Butter Masala", "desc": "Rich tomato gravy · cottage cheese · kasuri methi", "price": 260},
        {"id": "l3", "name": "Mix Veg Handi", "desc": "Seasonal vegetables · dum cooked · mild spices", "price": 190},
        {"id": "l4", "name": "Jeera Rice", "desc": "Basmati · tempered cumin · ghee finish", "price": 140},
        {"id": "l5", "name": "Malai Kofta", "desc": "Paneer & potato dumplings · silky makhani sauce", "price": 240},
        {"id": "l6", "name": "Hyderabadi Dum Biryani", "desc": "Aged basmati · whole spices · saffron · raita aside", "price": 280},
        {"id": "l7", "name": "Garlic Naan", "desc": "2 pcs · tandoor baked · butter & fresh garlic", "price": 90},
    ],
    "Dinner": [
        {"id": "d1", "name": "Shahi Paneer", "desc": "Cashew & cream gravy · mild aromatic · royal prep", "price": 250},
        {"id": "d2", "name": "Kadhai Paneer", "desc": "Bell peppers · onion · bold kadhai masala", "price": 260},
        {"id": "d3", "name": "Amritsari Kulcha Combo", "desc": "Stuffed kulcha · chole · lassi · full platter", "price": 220},
        {"id": "d4", "name": "Veg Pulao", "desc": "Fragrant basmati · fresh vegetables · whole spices", "price": 180},
        {"id": "d5", "name": "Tandoori Roti Basket", "desc": "4 pcs whole wheat roti · hand-patted · live tandoor", "price": 140},
        {"id": "d6", "name": "Gulab Jamun", "desc": "2 pcs · khoya dumplings · warm rose sugar syrup", "price": 90},
        {"id": "d7", "name": "Sizzling Brownie", "desc": "Warm chocolate brownie · vanilla ice cream · caramel", "price": 160},
    ],
}

def seed():
    conn = sqlite3.connect('restaurant.db')
    cursor = conn.cursor()
    
    # Initialize schema
    with open('schema.sql', mode='r') as f:
        cursor.executescript(f.read())
    
    for category, items in MENU_DATA.items():
        for item in items:
            cursor.execute(
                "INSERT OR REPLACE INTO menu_item (item_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)",
                (item['id'], item['name'], item['desc'], item['price'], category)
            )
    
    conn.commit()
    conn.close()
    print("Database seeded!")

if __name__ == "__main__":
    seed()
