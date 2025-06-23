import React from "react";
import SocialLoginButtons from "../components/auth/SocialLoginButtons";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <div className="max-w-md w-full royal-glass p-8 rounded-xl royal-glow">
        <h2 className="text-3xl font-royal font-bold text-royal-gold text-center mb-4 royal-text-glow">
          Royalty beitreten
        </h2>
        <p className="text-royal-cream text-center mb-8">
          Melden Sie sich an, um exklusive Vorteile zu erhalten.
        </p>
        <SocialLoginButtons />
      </div>
    </div>
  );
};

export default Auth;
