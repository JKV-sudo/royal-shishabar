import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

type AuthMode = "login" | "register" | "reset";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const {
    signIn,
    signUp,
    signInWithSocial,
    resetPassword,
    isLoading,
    isAuthenticated,
  } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate("/", { replace: true });
      } else if (mode === "register") {
        await signUp(formData.email, formData.password, formData.name);
        toast.success("Account created successfully!");
        navigate("/", { replace: true });
      } else if (mode === "reset") {
        await resetPassword(formData.email);
        toast.success("Password reset email sent!");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSocialLogin = async (providerId: string) => {
    try {
      await signInWithSocial(providerId);
      toast.success(`Welcome! Signed in with ${providerId}`);
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 bg-royal-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full royal-glass p-8 rounded-xl royal-glow"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-royal font-bold text-royal-gold mb-2 royal-text-glow">
            {mode === "login" && "Willkommen zurück"}
            {mode === "register" && "Royalty beitreten"}
            {mode === "reset" && "Passwort zurücksetzen"}
          </h2>
          <p className="text-royal-cream-light">
            {mode === "login" &&
              "Melden Sie sich an, um exklusive Vorteile zu erhalten."}
            {mode === "register" && "Erstellen Sie Ihr königliches Konto."}
            {mode === "reset" && "Geben Sie Ihre E-Mail-Adresse ein."}
          </p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Vollständiger Name"
                value={formData.name}
                onChange={handleInputChange}
                required={mode === "register"}
                className="w-full pl-10 pr-4 py-3 bg-royal-charcoal/50 border border-royal-gold/30 rounded-lg text-royal-cream-light placeholder-royal-cream-light/60 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all duration-200"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="E-Mail-Adresse"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-royal-charcoal/50 border border-royal-gold/30 rounded-lg text-royal-cream-light placeholder-royal-cream-light/60 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all duration-200"
            />
          </div>

          {mode !== "reset" && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Passwort"
                value={formData.password}
                onChange={handleInputChange}
                required={mode === "login" || mode === "register"}
                className="w-full pl-10 pr-12 py-3 bg-royal-charcoal/50 border border-royal-gold/30 rounded-lg text-royal-cream-light placeholder-royal-cream-light/60 focus:outline-none focus:border-royal-gold focus:ring-1 focus:ring-royal-gold transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light hover:text-royal-gold transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-royal-gradient-gold text-royal-charcoal font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed royal-hover-glow"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-royal-charcoal mr-2"></div>
                {mode === "login" && "Anmelden..."}
                {mode === "register" && "Registrieren..."}
                {mode === "reset" && "Senden..."}
              </div>
            ) : (
              <>
                {mode === "login" && "Anmelden"}
                {mode === "register" && "Registrieren"}
                {mode === "reset" && "Zurücksetzen"}
              </>
            )}
          </motion.button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center mb-6">
          {mode === "login" && (
            <div className="space-y-2">
              <button
                onClick={() => setMode("register")}
                className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm"
              >
                Noch kein Konto? Registrieren
              </button>
              <div>
                <button
                  onClick={() => setMode("reset")}
                  className="text-royal-cream-light hover:text-royal-gold transition-colors duration-200 text-sm"
                >
                  Passwort vergessen?
                </button>
              </div>
            </div>
          )}
          {mode === "register" && (
            <button
              onClick={() => setMode("login")}
              className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm"
            >
              Bereits ein Konto? Anmelden
            </button>
          )}
          {mode === "reset" && (
            <button
              onClick={() => setMode("login")}
              className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm"
            >
              Zurück zur Anmeldung
            </button>
          )}
        </div>

        {/* Social Login */}
        {mode === "login" && (
          <div>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-royal-gold/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-royal-charcoal text-royal-cream-light">
                  oder
                </span>
              </div>
            </div>
            <SocialLoginButtons onSuccess={handleSocialLogin} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
