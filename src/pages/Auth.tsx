import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Crown, Phone } from "lucide-react";
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
    phone: "",
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CRITICAL FIX: Prevent multiple rapid submissions
    if (isSubmitting) {
      console.log("Preventing duplicate submission");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate("/", { replace: true });
      } else if (mode === "register") {
        await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.phone
        );
        toast.success("Account created successfully!");
        navigate("/", { replace: true });
      } else if (mode === "reset") {
        await resetPassword(formData.email);
        toast.success("Password reset email sent!");
        setMode("login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 bg-royal-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-royal-gold/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-royal-purple/10 rounded-full blur-xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-md w-full royal-glass p-8 rounded-2xl royal-glow border border-royal-gold/30"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-royal-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 royal-glow"
          >
            <Crown className="w-8 h-8 text-royal-charcoal" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-royal font-bold text-royal-gold mb-2 royal-text-glow"
          >
            {mode === "login" && "Willkommen zurück"}
            {mode === "register" && "Royalty beitreten"}
            {mode === "reset" && "Passwort zurücksetzen"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-royal-cream-light"
          >
            {mode === "login" &&
              "Melden Sie sich an, um exklusive Vorteile zu erhalten."}
            {mode === "register" && "Erstellen Sie Ihr königliches Konto."}
            {mode === "reset" && "Geben Sie Ihre E-Mail-Adresse ein."}
          </motion.p>
        </div>

        {/* Email/Password Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4 mb-6"
        >
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
                className="royal-input w-full pl-10 pr-4 py-3 text-royal-cream-light placeholder-royal-cream-light/60"
              />
            </div>
          )}

          {mode === "register" && (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-cream-light w-5 h-5" />
              <input
                type="tel"
                name="phone"
                placeholder="Telefonnummer (optional)"
                value={formData.phone}
                onChange={handleInputChange}
                className="royal-input w-full pl-10 pr-4 py-3 text-royal-cream-light placeholder-royal-cream-light/60"
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
              className="royal-input w-full pl-10 pr-4 py-3 text-royal-cream-light placeholder-royal-cream-light/60"
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
                className="royal-input w-full pl-10 pr-12 py-3 text-royal-cream-light placeholder-royal-cream-light/60"
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
            className="w-full bg-royal-gradient-gold text-royal-charcoal font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed royal-hover-glow relative overflow-hidden"
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
        </motion.form>

        {/* Mode Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mb-6"
        >
          {mode === "login" && (
            <div className="space-y-2">
              <button
                onClick={() => setMode("register")}
                className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm font-medium"
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
              className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm font-medium"
            >
              Bereits ein Konto? Anmelden
            </button>
          )}
          {mode === "reset" && (
            <button
              onClick={() => setMode("login")}
              className="text-royal-gold hover:text-royal-gold-light transition-colors duration-200 text-sm font-medium"
            >
              Zurück zur Anmeldung
            </button>
          )}
        </motion.div>

        {/* Social Login */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-royal-gold/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-royal-charcoal-dark text-royal-cream-light">
                Oder fortfahren mit
              </span>
            </div>
          </div>
          <SocialLoginButtons onSuccess={handleSocialLogin} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
