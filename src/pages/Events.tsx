import React from "react";
import { useAuthStore } from "../stores/authStore";
import EventPlanner from "../components/events/EventPlanner";
import CustomerEventPlanner from "../components/events/CustomerEventPlanner";

const Events: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {isAdmin ? <EventPlanner /> : <CustomerEventPlanner />}
    </div>
  );
};

export default Events;
