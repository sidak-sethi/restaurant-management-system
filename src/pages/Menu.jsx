// src/pages/Menu.jsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  UtensilsCrossed,
  PartyPopper,
  ShoppingCart,
  X,
  MapPin,
  Utensils,
} from "lucide-react";
import "../styles/menu.css";

const API_BASE_URL = "http://localhost:5000/api";

// ── MENU DATA ──────────────────────────────────────────────────────────────
const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ── HELPERS ────────────────────────────────────────────────────────────────
function getInitialTableId() {
  const p = new URLSearchParams(window.location.search);
  const n = Number(p.get("table"));
  return !isNaN(n) && n >= 1 && n <= 10 ? n : null;
}
function calcWaitTime() {
  return Math.floor(Math.random() * 5) + 10;
}

// ── TABLE SELECTOR POPUP ───────────────────────────────────────────────────
function TableSelector({ onSelect }) {
  return (
    <motion.div
      className="ack-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 1000 }}
    >
      <motion.div
        className="table-selector-card"
        initial={{ scale: 0.78, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="ts-header">
          <MapPin size={24} className="ts-icon" />
          <div>
            <h2 className="ts-title">Welcome to The Kitchen</h2>
            <p className="ts-sub">Please select your table to view the menu</p>
          </div>
        </div>

        <div className="ts-grid">
          {TABLE_NUMBERS.map((n) => (
            <motion.button
              key={n}
              className="ts-btn"
              onClick={() => onSelect(n)}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.12 }}
            >
              {n}
            </motion.button>
          ))}
        </div>

        <p className="ts-note">
          Selecting a table allows you to place orders and track active ones.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── PENDING ORDERS DISPLAY ─────────────────────────────────────────────────
function PendingOrdersSection({ orders, onOrderMore }) {
  if (!orders || orders.length === 0) return null;

  const activeOrders = orders.filter(o => o.status !== 'PAID');
  if (activeOrders.length === 0) return null;

  return (
    <div className="pending-orders-sec">
      <div className="pos-header">
        <div className="pos-header-left">
          <Clock size={16} className="pos-icon" />
          <span className="pos-title">Active Table Orders</span>
        </div>
        <button className="pos-order-more" onClick={onOrderMore}>
          Add More Food <ChevronRight size={14} />
        </button>
      </div>
      <div className="pos-list">
        {activeOrders.map((order) => (
          <div key={order.order_id} className="pos-card">
            <div className="pos-card-top">
              <span className="pos-id">Order #{order.order_id}</span>
              <span className={`pos-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="pos-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="pos-item">
                  {item.name} <span className="pos-qty">x{item.quantity || item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FLOATING CART BUBBLE ───────────────────────────────────────────────────
function FloatingCart({ cartEntries, totalItems, totalPrice, onPlace }) {
  const [open, setOpen] = useState(false);

  if (totalItems === 0) return null;

  return (
    <>
      <motion.button
        className="float-cart-btn"
        onClick={() => setOpen((o) => !o)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.92 }}
      >
        <ShoppingCart size={20} />
        <span className="float-cart-count">{totalItems}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="float-cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="float-cart-panel"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
            >
              <div className="fcp-header">
                <span className="fcp-title">Your Cart</span>
                <button className="fcp-close" onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="fcp-items">
                {cartEntries.map(({ item, qty }) => (
                  <div key={item.id} className="fcp-item">
                    <span className="fcp-item-name">{item.name}</span>
                    <div className="fcp-item-right">
                      <span className="fcp-item-qty">x{qty}</span>
                      <span className="fcp-item-price">&#8377;{item.price * qty}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fcp-footer">
                <div className="fcp-total">
                  <span>Total</span>
                  <span>&#8377;{totalPrice}</span>
                </div>
                <motion.button
                  className="fcp-place-btn"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setOpen(false);
                    onPlace();
                  }}
                >
                  Place Order <ChevronRight size={15} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── ACK POPUP ─────────────────────────────────────────────────────────────
function AckPopup({ tableId, waitMins, itemCount, onClose }) {
  return (
    <motion.div
      className="ack-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ack-card"
        initial={{ scale: 0.72, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <motion.div
          className="ack-icon-wrap"
          animate={{ rotate: [0, -12, 12, -7, 7, 0] }}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          <PartyPopper size={40} className="ack-icon" />
        </motion.div>
        <h2 className="ack-title">Order Placed!</h2>
        <p className="ack-table">Table {tableId}</p>
        <div className="ack-stats">
          <div className="ack-stat">
            <span className="ack-stat-val">{itemCount}</span>
            <span className="ack-stat-lbl">{itemCount === 1 ? "item" : "items"}</span>
          </div>
          <div className="ack-stat-sep" />
          <div className="ack-stat">
            <span className="ack-stat-val">~{waitMins}m</span>
            <span className="ack-stat-lbl">wait time</span>
          </div>
        </div>
        <p className="ack-msg">You can continue adding more food anytime!</p>
        <button className="ack-close-btn" onClick={onClose}>
          Awesome, Back to Menu
        </button>
        <div className="ack-bar-track">
          <motion.div
            className="ack-bar-fill"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 10, ease: "linear" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MENU ITEM ──────────────────────────────────────────────────────────────
function MenuItem({ item, qty, onAdd, onRemove, index }) {
  return (
    <motion.div
      className="menu-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-price">&#8377;{item.price}</span>
      </div>
      <div className="item-controls">
        {qty === 0 ? (
          <motion.button
            className="btn-add"
            onClick={() => onAdd(item)}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={13} strokeWidth={2.8} /> Add
          </motion.button>
        ) : (
          <div className="qty-control">
            <motion.button
              className="qty-btn"
              onClick={() => onRemove(item)}
              whileTap={{ scale: 0.85 }}
            >
              <Minus size={13} strokeWidth={2.5} />
            </motion.button>
            <span className="qty-number">{qty}</span>
            <motion.button
              className="qty-btn"
              onClick={() => onAdd(item)}
              whileTap={{ scale: 0.85 }}
            >
              <Plus size={13} strokeWidth={2.5} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── CATEGORY BAR ──────────────────────────────────────────────────────────
function CategoryBar({ categories, active, onSelect }) {
  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <button
          key={cat}
          className={"cat-pill" + (active === cat ? " cat-pill--active" : "")}
          onClick={() => onSelect(cat)}
        >
          {active === cat && (
            <motion.div
              className="pill-bg"
              layoutId="pillBg"
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            />
          )}
          <span className="pill-text">{cat}</span>
        </button>
      ))}
    </div>
  );
}

// ── CART BAR ──────────────────────────────────────────────────────────────
function CartBar({ total, itemCount, onPlace }) {
  return (
    <AnimatePresence>
      {total > 0 && (
        <motion.div
          className="cart-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
        >
          <div className="cart-left">
            <span className="cart-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <span className="cart-total">&#8377;{total}</span>
          </div>
          <motion.button
            className="btn-place"
            onClick={onPlace}
            whileTap={{ scale: 0.96 }}
          >
            Place Order <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function Menu() {
  const [tableId, setTableId] = useState(getInitialTableId());
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState({});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [showAck, setShowAck] = useState(false);
  const [lastWaitMins, setLastWaitMins] = useState(0);
  const [lastOrderItems, setLastOrderItems] = useState(0);
  
  const sectionRefs = useRef({});
  const menuStartRef = useRef(null);

  // Fetch Menu
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const data = await res.json();
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push({ ...item, id: item.item_id });
          return acc;
        }, {});
        setMenuData(grouped);
        const cats = Object.keys(grouped);
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0]);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      }
    }
    fetchMenu();
  }, []);

  // Poll Orders
  useEffect(() => {
    if (!tableId) return;

    const fetchTableOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders?table_id=${tableId}`);
        const data = await res.json();
        setPendingOrders(data.filter(o => o.status !== 'PAID'));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchTableOrders();
    const interval = setInterval(fetchTableOrders, 5000);
    return () => clearInterval(interval);
  }, [tableId]);

  // Observer
  useEffect(() => {
    if (categories.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCategory(e.target.dataset.category);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [categories]);

  const addItem = (item) =>
    setCart((p) => ({
      ...p,
      [item.id]: { item, qty: (p[item.id]?.qty ?? 0) + 1 },
    }));

  const removeItem = (item) =>
    setCart((p) => {
      if ((p[item.id]?.qty ?? 0) <= 1) {
        const n = { ...p };
        delete n[item.id];
        return n;
      }
      return { ...p, [item.id]: { item, qty: p[item.id].qty - 1 } };
    });

  const cartEntries = Object.values(cart);
  const currentCartCount = cartEntries.reduce((s, e) => s + e.qty, 0);
  const currentCartTotal = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);

  // Calculate total items currently pending in kitchen
  const pendingKitchenItems = pendingOrders.reduce((acc, order) => {
    return acc + (order.items?.reduce((s, i) => s + (i.quantity || i.qty || 0), 0) || 0);
  }, 0);

  const handleTableSelect = (num) => {
    setTableId(num);
    const url = new URL(window.location);
    url.searchParams.set("table", num);
    window.history.pushState({}, "", url);
  };

  const placeOrder = async () => {
    const mins = calcWaitTime();
    const itemsCount = currentCartCount;
    setLastWaitMins(mins);
    setLastOrderItems(itemsCount);
    
    const payload = {
      tableId,
      items: cartEntries.map(e => ({ item_id: e.item.id, quantity: e.qty, name: e.item.name }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.orderId) {
        // Optimistic update for the pending list
        const optimisticOrder = {
          order_id: result.orderId,
          status: 'PLACED',
          items: payload.items,
          table_id: tableId
        };
        setPendingOrders(prev => [optimisticOrder, ...prev]);
        setCart({});
        setShowAck(true);
      } else {
        alert(result.error || "Order failed");
      }
    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  const scrollMenu = () => {
    menuStartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app-root">
      <AnimatePresence>
        {!tableId && <TableSelector onSelect={handleTableSelect} />}
      </AnimatePresence>

      {tableId && (
        <motion.div
          className="menu-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <header className="menu-header">
            <div className="header-left">
              <button 
                className="header-table-badge" 
                onClick={() => setTableId(null)}
                title="Change Table"
              >
                Table {tableId}
              </button>
              <h1 className="menu-brand">The Kitchen</h1>
              <p className="menu-tagline">Fresh • Seasonal • North Indian</p>
            </div>
            <div className="header-right">
              <div className="header-meta-group">
                <div className="header-meta">
                  <p className="header-meta-label">In Cart</p>
                  <p className="header-meta-val">{currentCartCount}</p>
                </div>
                <div className="header-meta-sep" />
                <div className="header-meta">
                  <p className="header-meta-label">In Kitchen</p>
                  <p className="header-meta-val">{pendingKitchenItems}</p>
                </div>
              </div>
            </div>
          </header>

          <CategoryBar
            categories={categories}
            active={activeCategory}
            onSelect={(cat) => {
              setActiveCategory(cat);
              sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <main className="menu-body">
            <PendingOrdersSection orders={pendingOrders} onOrderMore={scrollMenu} />
            
            <div ref={menuStartRef} className="menu-start-anchor" />

            {categories.map((cat) => (
              <section
                key={cat}
                data-category={cat}
                ref={(el) => (sectionRefs.current[cat] = el)}
                className="menu-section"
              >
                <h2 className="section-title">{cat}</h2>
                <div className="section-items">
                  {menuData[cat]?.map((item, i) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      qty={cart[item.id]?.qty ?? 0}
                      onAdd={addItem}
                      onRemove={removeItem}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            ))}
          </main>

          <FloatingCart
            cartEntries={cartEntries}
            totalItems={currentCartCount}
            totalPrice={currentCartTotal}
            onPlace={placeOrder}
          />

          <CartBar
            total={currentCartTotal}
            itemCount={currentCartCount}
            onPlace={placeOrder}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {showAck && (
          <AckPopup
            tableId={tableId}
            waitMins={lastWaitMins}
            itemCount={lastOrderItems}
            onClose={() => setShowAck(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
