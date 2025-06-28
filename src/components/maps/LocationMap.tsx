import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone } from "lucide-react";

interface LocationMapProps {
  className?: string;
  width?: string;
  zoom?: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
  className = "",
  width = "100%",
  zoom = 15,
}) => {
  // Royal Shisha Bar location coordinates (Waldkraiburg, Germany)
  const location = {
    lat: 48.2082,
    lng: 12.3985,
    address: "Stadtpl. 2, 84478 Waldkraiburg, Germany",
    name: "Royal Shisha Bar",
  };

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(
    location.address
  )}&zoom=${zoom}`;

  return (
    <div className={`w-full ${width} ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        {/* Map */}
        <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 border-royal-gold/20">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Royal Shisha Bar Location"
            className="w-full h-full"
          />

          {/* Custom overlay with business info */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-royal-gold" />
              <h3 className="font-royal font-bold text-royal-charcoal">
                {location.name}
              </h3>
            </div>
            <p className="text-sm text-royal-charcoal/80 mb-3">
              {location.address}
            </p>
            <div className="flex space-x-2">
              <a
                href={`https://maps.google.com/maps?daddr=${encodeURIComponent(
                  location.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs bg-royal-gold text-white px-3 py-1.5 rounded-full hover:bg-royal-gold-dark transition-colors duration-200"
              >
                <Navigation className="w-3 h-3" />
                <span>Route</span>
              </a>
              <a
                href="tel:+4915781413767"
                className="flex items-center space-x-1 text-xs bg-royal-purple text-white px-3 py-1.5 rounded-full hover:bg-royal-purple-dark transition-colors duration-200"
              >
                <Phone className="w-3 h-3" />
                <span>Anrufen</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationMap;
