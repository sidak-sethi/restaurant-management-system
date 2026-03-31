// src/pages/ChefDashboard.jsx
// Chef/Owner URL: http://localhost:5173/chef
// Reads "chef_orders" from localStorage — auto-polls every 4 seconds

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
} from "lucide-react";
import "../styles/chef.css";

const API_BASE_URL = "http://localhost:5000/api";

// ── HELPERS ────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "recently";
  // Handle both JS timestamp and SQL datetime string
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
function OrderCard({ order, onMarkReady, onMarkDone, index }) {
  // Adapt backend naming
  const orderId = order.order_id || order.orderId;
  const tableId = order.table_id || order.tableId;
  const total = order.total_amount || order.total;
  const placedAt = order.placed_at || order.placedAt;
  const status = order.status;
  const items = order.items || [];

  const isUrgent =
    status === "cooking" && order.endTime < Date.now() + 3 * 60 * 1000;
    
  return (
    <motion.div
      className={
        "order-card" +
        (isUrgent ? " order-card--urgent" : "") +
        (status === "ready" ? " order-card--ready" : "") +
        (status === "done" ? " order-card--done" : "")
      }
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: status === "done" ? 30 : -30 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1],
      }}
      layout
    >
      {/* Header */}
      <div className="ocard-head">
        <span className="ocard-table">{tableId}</span>
        <div className="ocard-head-right">
          {isUrgent && status === "cooking" && (
            <span className="ocard-urgent-badge">URGENT</span>
          )}
          {status === "ready" && (
            <span className="ocard-ready-badge">READY</span>
          )}
          <span className="ocard-time">
            <Clock size={11} /> {timeAgo(placedAt)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="ocard-items">
        {items.map((item, idx) => (
          <div key={item.id || item.item_id || idx} className="ocard-item">
            <span className="ocard-item-name">{item.name || (item.item && item.item.name)}</span>
            <span className="ocard-item-qty">x{item.qty || item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="ocard-footer">
        <span className="ocard-total">
          <IndianRupee size={12} />
          {total}
        </span>
        <div className="ocard-actions">
          {status === "cooking" && (
            <button
              className="ocard-btn ocard-btn--ready"
              onClick={() => onMarkReady(orderId)}
            >
              Mark Ready
            </button>
          )}
          {status === "ready" && (
            <button
              className="ocard-btn ocard-btn--done"
              onClick={() => onMarkDone(orderId)}
            >
              Served ✓
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
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      const data = await res.json();
      
      // Calculate stats from FULL list before filtering
      const revenue = todayRevenue(data);
      const servedToday = data.filter(o => o.status === 'done').length;
      setStats({ revenue, servedToday });

      // Filter out manually cleared orders for the board
      const filtered = data.filter(o => !clearedOrderIds.has(o.order_id || o.orderId));
      setOrders(filtered);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 4000);
    return () => clearInterval(t);
  }, [clearedOrderIds]); // Re-run when cleared IDs change to refresh view

  const markReady = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" })
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const markDone = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" })
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const clearDone = () => {
    const doneIds = orders
      .filter(o => o.status === 'done')
      .map(o => o.order_id || o.orderId);
    setClearedOrderIds(prev => new Set([...prev, ...doneIds]));
    setOrders(prev => prev.filter(o => o.status !== 'done'));
  };

  const cooking = orders.filter((o) => o.status === "cooking");
  const ready = orders.filter((o) => o.status === "ready");
  const done = orders.filter((o) => o.status === "done");

  return (
    <div className="chef-shell">
      {/* ── TOP HEADER ─────────────────────────────────────── */}
      <header className="chef-header">
        <div className="chef-header-brand">
          <div className="chef-logo">
            <ChefHat size={22} />
          </div>
          <div>
            <h1 className="chef-title">Kitchen Display</h1>
            <p className="chef-sub">Live order management</p>
          </div>
        </div>

        <div className="chef-pulse">
          <span className="pulse-dot" />
          <span className="pulse-label">Live</span>
        </div>
      </header>

      {/* ── STATS ROW ──────────────────────────────────────── */}
      <div className="stats-row">
        <StatCard
          icon={Flame}
          label="Cooking"
          value={cooking.length}
          color="fire"
          index={0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Ready"
          value={ready.length}
          color="green"
          index={1}
        />
        <StatCard
          icon={Users}
          label="Served Today"
          value={stats.servedToday}
          color="blue"
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

      {/* ── KANBAN BOARD ───────────────────────────────────── */}
      <div className="chef-board">
        {/* COOKING */}
        <div className="chef-col">
          <div className="col-header col-header--fire">
            <Flame size={15} /> Cooking
            <span className="col-count">{cooking.length}</span>
          </div>
          <div className="col-cards">
            <AnimatePresence>
              {cooking.length === 0 && (
                <motion.p
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No active orders
                </motion.p>
              )}
              {cooking.map((order, i) => (
                <OrderCard
                  key={order.order_id || order.orderId}
                  order={order}
                  onMarkReady={markReady}
                  onMarkDone={markDone}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* READY */}
        <div className="chef-col">
          <div className="col-header col-header--green">
            <CheckCircle2 size={15} /> Ready to Serve
            <span className="col-count">{ready.length}</span>
          </div>
          <div className="col-cards">
            <AnimatePresence>
              {ready.length === 0 && (
                <motion.p
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Nothing ready yet
                </motion.p>
              )}
              {ready.map((order, i) => (
                <OrderCard
                  key={order.order_id || order.orderId}
                  order={order}
                  onMarkReady={markReady}
                  onMarkDone={markDone}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* DONE */}
        <div className="chef-col">
          <div className="col-header col-header--muted">
            <ArchiveX size={15} /> Served
            <span className="col-count">{done.length}</span>
            {done.length > 0 && (
              <button className="btn-clear" onClick={clearDone}>
                Clear
              </button>
            )}
          </div>
          <div className="col-cards">
            {done.length === 0 && <p className="empty-state">—</p>}
            <AnimatePresence>
              {done
                .slice()
                .reverse()
                .slice(0, 6)
                .map((order, i) => (
                  <OrderCard
                    key={order.order_id || order.orderId}
                    order={order}
                    onMarkReady={markReady}
                    onMarkDone={markDone}
                    index={i}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="chef-footer">
        <span className="footer-dot" />
        Auto-refreshes every 4 seconds &nbsp;·&nbsp; {orders.length} total
        orders today
      </footer>
    </div>
  );
}
