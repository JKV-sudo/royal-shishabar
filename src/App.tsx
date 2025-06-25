import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PerformanceMonitor from "./components/common/PerformanceMonitor";
import AdminSetupButton from "./components/common/AdminSetupButton";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-royal-charcoal">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route
                path="/auth"
                element={
                  <ProtectedRoute requireAuth={false} redirectTo="/">
                    <Auth />
                  </ProtectedRoute>
                }
              />
              {/* Add other routes here, e.g., Menu, etc. */}
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
          <PerformanceMonitor />
          <AdminSetupButton />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
