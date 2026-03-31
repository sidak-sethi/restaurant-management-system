// src/pages/Menu.jsx
// REQUIRES: npm install framer-motion lucide-react
// Customer URL: http://localhost:5173/?table=3

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
} from "lucide-react";
import "../styles/menu.css";

const API_BASE_URL = "http://localhost:5000/api";

// ── MENU DATA ──────────────────────────────────────────────────────────────
const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ── HELPERS ────────────────────────────────────────────────────────────────
function getTableId() {
  const p = new URLSearchParams(window.location.search);
  const n = Number(p.get("table"));
  return !isNaN(n) && n >= 1 && n <= 10 ? "Table " + n : "Table 0";
}
function getActiveOrderCount() {
  return 2;
}
function calcWaitTime() {
  return Math.floor(Math.random() * 5) + 5 + getActiveOrderCount() * 3;
}

// ── TABLE SELECTOR POPUP ───────────────────────────────────────────────────
function TableSelector({ onSelect }) {
  return (
    <motion.div
      className="ack-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="table-selector-card"
        initial={{ scale: 0.78, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <div className="ts-header">
          <MapPin size={20} className="ts-icon" />
          <div>
            <h2 className="ts-title">Select Your Table</h2>
            <p className="ts-sub">Which table are you sitting at?</p>
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
          This will start a fresh order for the selected table
        </p>
      </motion.div>
    </motion.div>
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
        exit={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        title="View cart"
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
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
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
                    <span className="fcp-item-right">
                      <span className="fcp-item-qty">x{qty}</span>
                      <span className="fcp-item-price">
                        &#8377;{item.price * qty}
                      </span>
                    </span>
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
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
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
        <p className="ack-table">{tableId}</p>
        <div className="ack-stats">
          <div className="ack-stat">
            <span className="ack-stat-val">{itemCount}</span>
            <span className="ack-stat-lbl">
              {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="ack-stat-sep" />
          <div className="ack-stat">
            <span className="ack-stat-val">~{waitMins}m</span>
            <span className="ack-stat-lbl">wait time</span>
          </div>
        </div>
        <p className="ack-msg">
          Your order is with the kitchen. Sit back and relax!
        </p>
        <div className="ack-bar-track">
          <motion.div
            className="ack-bar-fill"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4.5, ease: "linear" }}
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
      transition={{
        delay: index * 0.038,
        duration: 0.32,
        ease: [0.25, 1, 0.5, 1],
      }}
    >
      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <span className="item-desc">{item.desc}</span>
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

// ── BOTTOM CART BAR ────────────────────────────────────────────────────────
function CartBar({ total, itemCount, cartEntries, onPlace }) {
  return (
    <AnimatePresence>
      {total > 0 && (
        <motion.div
          className="cart-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
        >
          <div className="cart-left">
            <span className="cart-count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="cart-total">&#8377;{total}</span>
          </div>
          <div className="cart-items-preview">
            {cartEntries.slice(0, 4).map(({ item, qty }) => (
              <span key={item.id} className="cart-chip">
                {item.name} x{qty}
              </span>
            ))}
            {cartEntries.length > 4 && (
              <span className="cart-chip">+{cartEntries.length - 4} more</span>
            )}
          </div>
          <div className="cart-right">
            <motion.button
              className="btn-place"
              onClick={onPlace}
              whileTap={{ scale: 0.96 }}
            >
              Place Order <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── COUNTDOWN ─────────────────────────────────────────────────────────────
function CountdownTimer({ endTime }) {
  const totalRef = useRef(
    Math.max(1, Math.floor((endTime - Date.now()) / 1000)),
  );
  const [secsLeft, setSecsLeft] = useState(() => {
    const d = Math.floor((endTime - Date.now()) / 1000);
    return d > 0 ? d : 0;
  });
  useEffect(() => {
    if (secsLeft <= 0) return;
    const t = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const done = secsLeft === 0;
  const pct = done ? 0 : (secsLeft / totalRef.current) * 100;
  return (
    <div className={"countdown" + (done ? " countdown--done" : "")}>
      <div className="countdown-row">
        {done ? (
          <span className="done-label">
            <CheckCircle size={16} /> Your order is ready!
          </span>
        ) : (
          <>
            <Clock size={14} />
            <span>
              {mins}m {String(secs).padStart(2, "0")}s remaining
            </span>
          </>
        )}
      </div>
      {!done && (
        <div className="cdown-track">
          <div className="cdown-fill" style={{ width: pct + "%" }} />
        </div>
      )}
    </div>
  );
}

// ── TRACKING SCREEN ────────────────────────────────────────────────────────
function TrackingScreen({ tableId, order, onOrderMore }) {
  const [currentOrder, setCurrentOrder] = useState(order);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        const allOrders = await res.json();
        const currentId = currentOrder.order_id || currentOrder.orderId;
        const found = allOrders.find((o) => {
          const oid = o.order_id || o.orderId;
          return String(oid) === String(currentId);
        });
        if (found) {
          setCurrentOrder(found);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
    return () => clearInterval(t);
  }, [currentOrder.order_id, currentOrder.orderId]);
  
  return (
    <motion.div
      className="tracking-screen"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="tracking-band">
        <UtensilsCrossed size={28} />
        <div>
          <h1 className="tracking-title">
            {currentOrder.status === 'ready' ? "Order Ready!" : currentOrder.status === 'done' ? "Order Served" : "Order Received"}
          </h1>
          <p className="tracking-table">{tableId}</p>
        </div>
      </div>
      <div className="tracking-body">
        <div className="tracking-left">
          <div className="queue-block">
            <span className="queue-pos">{currentOrder.status === 'cooking' ? "Cooking" : currentOrder.status.toUpperCase()}</span>
            <p className="queue-label">current status</p>
          </div>
          {currentOrder.status === 'cooking' && currentOrder.endTime && <CountdownTimer endTime={currentOrder.endTime} />}
          <button className="btn-new-order" onClick={onOrderMore}>
            &#8592; Order more items
          </button>
        </div>
        <div className="tracking-right">
          <div className="order-summary">
            <p className="summary-heading">Your order</p>
            {currentOrder.items.map((entry) => {
              const item = entry.item || entry;
              return (
              <div key={item.id || item.item_id} className="summary-row">
                <span>
                  {item.name} x {entry.qty || entry.quantity}
                </span>
                <span>&#8377;{item.price * (entry.qty || entry.quantity)}</span>
              </div>
            )})}
            <div className="summary-total">
              <span>Total</span>
              <span>&#8377;{currentOrder.total || currentOrder.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function Menu() {
  const tableId = getTableId();
  const storageKey = "active_order_id_" + tableId.replace(" ", "_").toLowerCase();

  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState({});
  const [view, setView] = useState("menu");
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [showAck, setShowAck] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const data = await res.json();
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push({
            ...item,
            id: item.item_id,
            desc: item.description
          });
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

  useEffect(() => {
    async function restoreOrder() {
      const savedOrderId = localStorage.getItem(storageKey);
      if (savedOrderId) {
        try {
          const res = await fetch(`${API_BASE_URL}/orders`);
          const all = await res.json();
          const found = all.find(o => String(o.order_id) === String(savedOrderId));
          if (found && found.status !== 'done') {
            setActiveOrder(found);
            setView("tracking");
          }
        } catch (_) {}
      }
    }
    restoreOrder();
  }, [storageKey]);

  useEffect(() => {
    if (view !== "menu" || categories.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCategory(e.target.dataset.category);
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [view, categories]);

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
  const totalItems = cartEntries.reduce((s, e) => s + e.qty, 0);
  const totalPrice = cartEntries.reduce((s, e) => s + e.item.price * e.qty, 0);

  const placeOrder = async () => {
    const waitMins = calcWaitTime();
    const placedAt = Date.now();
    const orderPayload = {
      tableId,
      items: cartEntries,
      total: totalPrice,
      waitMins,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const result = await res.json();
      
      if (result.orderId) {
        const localOrder = {
          ...orderPayload,
          orderId: result.orderId,
          status: 'cooking',
          placedAt,
          endTime: placedAt + waitMins * 60 * 1000
        };
        localStorage.setItem(storageKey, result.orderId);
        setActiveOrder(localOrder);
        setPendingOrder(localOrder);
        setCart({});
        setShowAck(true);
      }
    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  const handleOrderMore = () => {
    setShowTableSelector(true);
  };

  const handleTableSelect = (tableNum) => {
    window.location.href = window.location.pathname + "?table=" + tableNum;
  };

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {view === "tracking" && activeOrder && (
          <TrackingScreen
            key="tracking"
            tableId={tableId}
            order={activeOrder}
            onOrderMore={handleOrderMore}
          />
        )}

        {view === "menu" && (
          <motion.div
            key="menu"
            className="menu-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <header className="menu-header">
              <div className="header-left">
                <div className="header-table-badge">{tableId}</div>
                <h1 className="menu-brand">The Kitchen</h1>
                <p className="menu-tagline">
                  Fresh &middot; Seasonal &middot; North Indian
                </p>
              </div>
              <div className="header-right">
                <div className="header-meta">
                  <p className="header-meta-label">Items in cart</p>
                  <p className="header-meta-val">
                    {totalItems > 0 ? totalItems + " items" : "\u2014"}
                  </p>
                </div>
              </div>
            </header>

            <CategoryBar
              categories={categories}
              active={activeCategory}
              onSelect={(cat) => {
                setActiveCategory(cat);
                sectionRefs.current[cat]?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />

            <main className="menu-body">
              {categories.map((cat) => (
                <section
                  key={cat}
                  data-category={cat}
                  ref={(el) => (sectionRefs.current[cat] = el)}
                  className="menu-section"
                >
                  <h2 className="section-title">{cat}</h2>
                  <div className="section-items">
                    {menuData[cat] && menuData[cat].map((item, i) => (
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

            {/* Floating cart bubble — always on top-right */}
            <AnimatePresence>
              {totalItems > 0 && (
                <FloatingCart
                  cartEntries={cartEntries}
                  totalItems={totalItems}
                  totalPrice={totalPrice}
                  onPlace={placeOrder}
                />
              )}
            </AnimatePresence>

            {/* Bottom cart bar */}
            <CartBar
              total={totalPrice}
              itemCount={totalItems}
              cartEntries={cartEntries}
              onPlace={placeOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACK POPUP */}
      <AnimatePresence>
        {showAck && pendingOrder && (
          <AckPopup
            key="ack"
            tableId={tableId}
            waitMins={pendingOrder.waitMins}
            itemCount={pendingOrder.items.reduce((s, e) => s + e.qty, 0)}
            onClose={() => {
              setShowAck(false);
              setActiveOrder(pendingOrder);
              setView("tracking");
            }}
          />
        )}
      </AnimatePresence>

      {/* TABLE SELECTOR POPUP */}
      <AnimatePresence>
        {showTableSelector && (
          <TableSelector key="table-sel" onSelect={handleTableSelect} />
        )}
      </AnimatePresence>
    </div>
  );
}
