// src/App.jsx
import { useEffect, useState } from "react";
import Menu from "./pages/Menu";
import ChefDashboard from "./pages/ChefDashboard";

export default function App() {
  const [page, setPage] = useState(() => {
    return window.location.pathname === "/chef" ? "chef" : "menu";
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setPage(window.location.pathname === "/chef" ? "chef" : "menu");
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return page === "chef" ? <ChefDashboard /> : <Menu />;
}
