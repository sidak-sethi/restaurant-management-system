import sqlite3
import os

DATABASE = 'restaurant.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row  # This allows accessing columns by name
    return db

def init_db():
    if not os.path.exists(DATABASE):
        db = get_db()
        with open('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
        db.close()
