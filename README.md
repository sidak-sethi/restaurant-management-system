# 🍽️ Kitchen Royale: Modern Restaurant Management System

A high-performance, real-time restaurant management solution featuring a customer-facing menu and a professional live kitchen display.

## 🚀 Key Features

- **Table-First Workflow**: Mandatory table selection ensures every order is accurately tracked to its location.
- **Additive Ordering**: Customers can "Order More Food" multiple times during their session; orders are pooled and tracked live.
- **Dual Tracking Header**: Live stats for "In Cart" vs. "In Kitchen" (total items across all pending orders).
- **Professional Chef Dashboard**: Kanban-style board using standardized status flow (**PLACED** → **PREPARING** → **SERVED**).
- **Automated Business Logic**: 
  - Backend calculates totals and manages inventory.
  - Table statuses (**AVAILABLE** / **OCCUPIED**) sync automatically with ordering and payment.
- **SQL Transaction Protected**: Ensures data integrity for all multi-step operations (e.g., placing orders, processing payments).

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Framer Motion, Lucide Icons, Vanilla CSS
- **Backend**: Python, Flask, Flask-CORS
- **Database**: SQLite (ACID compliant)

## 📁 Project Structure

```text
restaurant-frontend/
├── backend/                # Flask API & DBMS
│   ├── app.py              # API routes & Business Logic
│   ├── db.py               # Database initialization & Access
│   ├── schema.sql          # Standardized DBMS Schema
│   ├── seed_db.py          # Idempotent database reset & seeding
│   └── restaurant.db       # Active SQLite database
├── src/                    # React Frontend
│   ├── pages/
│   │   ├── Menu.jsx        # Customer interface & Live Tracking
│   │   └── ChefDashboard.jsx # Kitchen Display System (KDS)
│   ├── styles/             # Premium Aesthetic CSS
│   └── App.jsx             # React Routing
└── README.md               # Documentation
```

## ⚙️ Setup & Installation

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install flask flask-cors
python seed_db.py  # Reset and seed the database with items & tables
python app.py      # Runs on http://localhost:5000
```

### 2. Frontend Setup
```powershell
npm install
npm run dev        # Runs on http://localhost:5173
```

## 📖 Usage Flow

1. **Customer View**: Access `http://localhost:5173/`.
   - Select a table number.
   - Add items to cart.
   - Place order and track live "Order More" entries.
2. **Chef Dashboard**: Access `http://localhost:5173/chef`.
   - View new orders in **PLACED**.
   - Move to **PREPARING** when cooking starts.
   - Move to **SERVED** when food is delivered.
3. **Payment**: Process payment via the provided API or payment flow to reset the table to **AVAILABLE**.

## 📝 License
MIT
