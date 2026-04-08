// src/pages/ChefDashboard.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  ArchiveX,
  Clock,
  ChefHat,
  TrendingUp,
  Users,
  IndianRupee,
  BellRing,
} from "lucide-react";
import "../styles/chef.css";

const API_BASE_URL = "http://localhost:5000/api";

// ── HELPERS ────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "recently";
  const timestamp = typeof ts === 'number' ? ts : new Date(ts + "Z").getTime();
  const d = Math.floor((Date.now() - timestamp) / 1000);
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  return Math.floor(d / 3600) + "h ago";
}

function todayRevenue(orders) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return orders
    .filter((o) => {
      const rawTs = o.placed_at || o.placedAt;
      if (!rawTs) return false;
      const ts = typeof rawTs === 'number' ? rawTs : new Date(rawTs + "Z").getTime();
      return ts >= start.getTime();
    })
    .reduce((s, o) => s + (o.total_amount || o.total || 0), 0);
}

// ── STAT CARD ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, index }) {
  return (
    <motion.div
      className={"stat-card stat-card--" + color}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <div className={"stat-icon stat-icon--" + color}>
        <Icon size={20} />
      </div>
      <div>
        <p className="stat-val">{value}</p>
        <p className="stat-lbl">{label}</p>
      </div>
    </motion.div>
  );
}

// ── ORDER CARD ─────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus, index }) {
  const orderId = order.order_id || order.orderId;
  const tableId = order.table_id || order.tableId;
  const total = order.total_amount || order.total;
  const placedAt = order.placed_at || order.placedAt;
  const status = order.status;
  const items = order.items || [];

  return (
    <motion.div
      className={`order-card status-${status.toLowerCase()}`}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <div className="ocard-head">
        <span className="ocard-table">Table {tableId}</span>
        <div className="ocard-head-right">
          <span className="ocard-time">
            <Clock size={11} /> {timeAgo(placedAt)}
          </span>
        </div>
      </div>

      <div className="ocard-items">
        {items.map((item, idx) => (
          <div key={idx} className="ocard-item">
            <span className="ocard-item-name">{item.name}</span>
            <span className="ocard-item-qty">x{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="ocard-footer">
        <span className="ocard-total">
          <IndianRupee size={12} /> {total}
        </span>
        <div className="ocard-actions">
          {status === "PLACED" && (
            <button
              className="ocard-btn ocard-btn--preparing"
              onClick={() => onUpdateStatus(orderId, "PREPARING")}
            >
              Start Cooking
            </button>
          )}
          {status === "PREPARING" && (
            <button
              className="ocard-btn ocard-btn--served"
              onClick={() => onUpdateStatus(orderId, "SERVED")}
            >
              Mark Served
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [clearedOrderIds, setClearedOrderIds] = useState(new Set());
  const [stats, setStats] = useState({ revenue: 0, servedToday: 0 });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      
      const revenue = todayRevenue(data);
      const servedToday = data.filter(o => o.status === 'SERVED' || o.status === 'PAID').length;
      setStats({ revenue, servedToday });

      const filtered = data.filter(o => !clearedOrderIds.has(o.order_id || o.orderId));
      setOrders(filtered);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 4000);
    return () => clearInterval(t);
  }, [clearedOrderIds]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.error) alert(result.error);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const clearServed = () => {
    const servedIds = orders
      .filter(o => o.status === 'SERVED' || o.status === 'PAID')
      .map(o => o.order_id || o.orderId);
    setClearedOrderIds(prev => new Set([...prev, ...servedIds]));
    setOrders(prev => prev.filter(o => o.status !== 'SERVED' && o.status !== 'PAID'));
  };

  const placed = orders.filter((o) => o.status === "PLACED");
  const preparing = orders.filter((o) => o.status === "PREPARING");
  const completed = orders.filter((o) => o.status === "SERVED" || o.status === "PAID");

  return (
    <div className="chef-shell">
      <header className="chef-header">
        <div className="chef-header-brand">
          <div className="chef-logo">
            <ChefHat size={22} />
          </div>
          <div>
            <h1 className="chef-title">Kitchen Display</h1>
            <p className="chef-sub">Live order tracking and management</p>
          </div>
        </div>

        <div className="chef-pulse">
          <span className="pulse-dot" />
          <span className="pulse-label">Live Sync</span>
        </div>
      </header>

      <div className="stats-row">
        <StatCard
          icon={BellRing}
          label="New Orders"
          value={placed.length}
          color="blue"
          index={0}
        />
        <StatCard
          icon={Flame}
          label="Preparing"
          value={preparing.length}
          color="fire"
          index={1}
        />
        <StatCard
          icon={Users}
          label="Served Today"
          value={stats.servedToday}
          color="green"
          index={2}
        />
        <StatCard
          icon={TrendingUp}
          label="Today Revenue"
          value={"₹" + stats.revenue}
          color="gold"
          index={3}
        />
      </div>

      <div className="chef-board">
        {/* NEW ORDERS */}
        <div className="chef-col">
          <div className="col-header col-header--blue">
            <BellRing size={15} /> New Orders
            <span className="col-count">{placed.length}</span>
          </div>
          <div className="col-cards">
            <AnimatePresence>
              {placed.length === 0 && <p className="empty-state">No new orders</p>}
              {placed.map((order, i) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* PREPARING */}
        <div className="chef-col">
          <div className="col-header col-header--fire">
            <Flame size={15} /> Preparing
            <span className="col-count">{preparing.length}</span>
          </div>
          <div className="col-cards">
            <AnimatePresence>
              {preparing.length === 0 && <p className="empty-state">Kitchen idled</p>}
              {preparing.map((order, i) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="chef-col">
          <div className="col-header col-header--muted">
            <ArchiveX size={15} /> Completed
            <span className="col-count">{completed.length}</span>
            {completed.length > 0 && (
              <button className="btn-clear" onClick={clearServed}>Clear</button>
            )}
          </div>
          <div className="col-cards">
            <AnimatePresence>
              {completed.length === 0 && <p className="empty-state">—</p>}
              {completed.slice().reverse().slice(0, 10).map((order, i) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onUpdateStatus={updateStatus}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <footer className="chef-footer">
        <span className="footer-dot" />
        Fresh from the database · {orders.length} orders total
      </footer>
    </div>
  );
}
