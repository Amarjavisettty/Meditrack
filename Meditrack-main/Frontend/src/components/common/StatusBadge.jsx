import React from "react";
import { Clock, CheckCircle, Play, AlertCircle, X } from "lucide-react";

const StatusBadge = ({ status, size = "normal" }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
        label: "Confirmed",
      },
      "in-progress": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Play,
        label: "In Progress",
      },
      completed: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        label: "Cancelled",
      },
      rejected: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: X,
        label: "Rejected",
      },
    };

    return configs[status] || configs["pending"];
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    normal: "px-3 py-1 text-sm",
    large: "px-4 py-2 text-base",
  };

  const iconSizes = {
    small: "w-3 h-3",
    normal: "w-4 h-4",
    large: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
