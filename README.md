# 🍽️ Modern Restaurant Order Management System

A full-stack, real-time restaurant management solution featuring a customer-facing menu and a live kitchen display (Chef Dashboard).

## 🚀 Features

- **Real-Time Tracking**: Customers can track their order status from "Cooking" to "Ready" to "Served".
- **Live Kitchen Display**: A Kanban-style dashboard for chefs to manage and progress incoming orders.
- **Dynamic Menu**: Categorized menu with intuitive navigation and cart management.
- **Persistent Backend**: Powered by Flask and SQLite for reliable data storage.
- **Premium UI**: Modern, dark-themed design with smooth animations and responsive layouts.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Framer Motion, Lucide Icons, Vanilla CSS
- **Backend**: Python, Flask, Flask-CORS
- **Database**: SQLite

## 📁 Project Structure

```text
restaurant-frontend/
├── backend/                # Flask API Server
│   ├── app.py              # Main entry point & API routes
│   ├── db.py               # Database connection logic
│   ├── schema.sql          # Database schema definition
│   ├── seed_db.py          # Script to populate initial menu data
│   └── requirements.txt    # Backend dependencies
├── src/                    # React Frontend
│   ├── pages/
│   │   ├── Menu.jsx        # Customer-facing menu & tracking
│   │   └── ChefDashboard.jsx # Kitchen management interface
│   ├── styles/             # Modular CSS styles
│   └── App.jsx             # Main application & routing
├── .gitignore              # Multi-environment ignore rules
└── README.md               # You are here!
```

## ⚙️ Setup & Installation

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python seed_db.py  # Run once to initialize the database
python app.py
```

### 2. Frontend Setup
```powershell
npm install
npm run dev
```

## 📖 Usage

- **Customer View**: Access `http://localhost:5173/?table=1` to place orders.
- **Chef Dashboard**: Access `http://localhost:5173/chef` to manage the kitchen.

## 📝 License
MIT
