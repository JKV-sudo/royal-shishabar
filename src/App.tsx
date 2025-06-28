import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Menu from "./pages/Menu";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PerformanceMonitor from "./components/common/PerformanceMonitor";
import AdminSetupButton from "./components/common/AdminSetupButton";
import LivePopup from "./components/common/LivePopup";
import OfflineIndicator from "./components/common/OfflineIndicator";
import "./utils/eventNotifications"; // Import to start notification manager

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-royal-charcoal">
            <Header />
            <OfflineIndicator />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/auth"
                  element={
                    <ProtectedRoute requireAuth={false} redirectTo="/">
                      <Auth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute
                      requireAuth={true}
                      requireRole="admin"
                      redirectTo="/auth"
                    >
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                {/* Add other routes here, e.g., Contact, etc. */}
              </Routes>
            </main>
            <Footer />
            <LivePopup />
            <AdminSetupButton />
            <PerformanceMonitor />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1a1a1a",
                  color: "#f5f5f5",
                  border: "1px solid #8B4513",
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
