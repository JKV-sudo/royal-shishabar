import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { SocialAuthService } from "../../services/socialAuthService";
import toast from "react-hot-toast";

interface SocialLoginButtonsProps {
  onSuccess?: (providerId: string) => void;
  onError?: (error: string) => void;
  variant?: "default" | "compact";
}

const SocialLoginButtons = ({
  onSuccess,
  onError,
  variant = "default",
}: SocialLoginButtonsProps) => {
  const { isLoading } = useAuthStore();

  const handleSocialLogin = async (providerId: string) => {
    try {
      onSuccess?.(providerId);
    } catch (error: any) {
      toast.error(error.message);
      onError?.(error.message);
    }
  };

  const availableProviders = SocialAuthService.getAvailableProviders();

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        {availableProviders.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[120px] py-2 px-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: provider.color }}
          >
            <span className="text-lg mr-2">{provider.icon}</span>
            {provider.name}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {availableProviders.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              {
                borderColor: provider.color,
                "--tw-shadow-color": provider.color,
              } as any
            }
          >
            <span className="text-lg mr-2">{provider.icon}</span>
            <span>{provider.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Instagram Button (Special handling) */}
      <motion.button
        onClick={() => handleSocialLogin("instagram")}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-medium hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-lg mr-2">📸</span>
        <span>Instagram</span>
      </motion.button>
    </div>
  );
};

export default SocialLoginButtons;
