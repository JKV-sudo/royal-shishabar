import React from "react";
import { RefreshCw, Plus, Search, Database, Wifi, XCircle } from "lucide-react";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  className?: string;
  variant?: "default" | "error" | "loading" | "network" | "search" | "create";
  showBackground?: boolean;
}

const variantConfig = {
  default: {
    icon: <Database className="w-12 h-12 text-gray-400" />,
    titleColor: "text-gray-900",
    descriptionColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  error: {
    icon: <XCircle className="w-12 h-12 text-red-400" />,
    titleColor: "text-red-900",
    descriptionColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  loading: {
    icon: <RefreshCw className="w-12 h-12 text-blue-400 animate-spin" />,
    titleColor: "text-blue-900",
    descriptionColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  network: {
    icon: <Wifi className="w-12 h-12 text-orange-400" />,
    titleColor: "text-orange-900",
    descriptionColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  search: {
    icon: <Search className="w-12 h-12 text-gray-400" />,
    titleColor: "text-gray-900",
    descriptionColor: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  create: {
    icon: <Plus className="w-12 h-12 text-green-400" />,
    titleColor: "text-green-900",
    descriptionColor: "text-green-600",
    bgColor: "bg-green-50",
  },
};

const getButtonVariantClasses = (
  variant: EmptyStateAction["variant"] = "primary"
) => {
  switch (variant) {
    case "primary":
      return "bg-blue-600 hover:bg-blue-700 text-white border-transparent";
    case "secondary":
      return "bg-gray-600 hover:bg-gray-700 text-white border-transparent";
    case "outline":
      return "bg-white hover:bg-gray-50 text-gray-700 border-gray-300";
    default:
      return "bg-blue-600 hover:bg-blue-700 text-white border-transparent";
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actions = [],
  className = "",
  variant = "default",
  showBackground = true,
}) => {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  return (
    <div
      className={`
      text-center py-12 px-4 
      ${showBackground ? `rounded-lg ${config.bgColor}` : ""}
      ${className}
    `}
    >
      <div className="max-w-sm mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">{displayIcon}</div>

        {/* Title */}
        <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-sm mb-6 ${config.descriptionColor}`}>
          {description}
        </p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.loading}
                className={`
                  inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                  border transition-colors duration-200 min-w-[120px]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${getButtonVariantClasses(action.variant)}
                `}
              >
                {action.loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : action.icon ? (
                  <span className="mr-2">{action.icon}</span>
                ) : null}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined empty state components for common scenarios
export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  refreshing?: boolean;
  className?: string;
}> = ({
  title = "No data available",
  description = "There's no data to display at the moment.",
  onRefresh,
  onAdd,
  addLabel = "Add New",
  refreshing = false,
  className,
}) => {
  const actions: EmptyStateAction[] = [];

  if (onRefresh) {
    actions.push({
      label: "Refresh",
      onClick: onRefresh,
      variant: "outline",
      icon: <RefreshCw className="w-4 h-4" />,
      loading: refreshing,
    });
  }

  if (onAdd) {
    actions.push({
      label: addLabel,
      onClick: onAdd,
      variant: "primary",
      icon: <Plus className="w-4 h-4" />,
    });
  }

  return (
    <EmptyState
      title={title}
      description={description}
      variant="default"
      actions={actions}
      className={className}
    />
  );
};

export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}> = ({
  title = "Something went wrong",
  description = "We encountered an error while loading your data. Please try again.",
  onRetry,
  retrying = false,
  className,
}) => {
  const actions: EmptyStateAction[] = [];

  if (onRetry) {
    actions.push({
      label: "Try Again",
      onClick: onRetry,
      variant: "primary",
      icon: <RefreshCw className="w-4 h-4" />,
      loading: retrying,
    });
  }

  return (
    <EmptyState
      title={title}
      description={description}
      variant="error"
      actions={actions}
      className={className}
    />
  );
};

export const LoadingEmptyState: React.FC<{
  title?: string;
  description?: string;
  className?: string;
}> = ({
  title = "Loading...",
  description = "Please wait while we fetch your data.",
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      variant="loading"
      className={className}
    />
  );
};

export const NetworkEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}> = ({
  title = "Network connection issue",
  description = "Please check your internet connection and try again.",
  onRetry,
  retrying = false,
  className,
}) => {
  const actions: EmptyStateAction[] = [];

  if (onRetry) {
    actions.push({
      label: "Retry",
      onClick: onRetry,
      variant: "primary",
      icon: <RefreshCw className="w-4 h-4" />,
      loading: retrying,
    });
  }

  return (
    <EmptyState
      title={title}
      description={description}
      variant="network"
      actions={actions}
      className={className}
    />
  );
};

export const SearchEmptyState: React.FC<{
  title?: string;
  description?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({
  title = "No results found",
  description = "Try adjusting your search terms or filters.",
  onClearSearch,
  className,
}) => {
  const actions: EmptyStateAction[] = [];

  if (onClearSearch) {
    actions.push({
      label: "Clear Search",
      onClick: onClearSearch,
      variant: "outline",
      icon: <XCircle className="w-4 h-4" />,
    });
  }

  return (
    <EmptyState
      title={title}
      description={description}
      variant="search"
      actions={actions}
      className={className}
    />
  );
};

export const CreateEmptyState: React.FC<{
  title?: string;
  description?: string;
  onAdd: () => void;
  addLabel?: string;
  className?: string;
}> = ({
  title = "Get started",
  description = "Create your first item to get started.",
  onAdd,
  addLabel = "Create New",
  className,
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      variant="create"
      actions={[
        {
          label: addLabel,
          onClick: onAdd,
          variant: "primary",
          icon: <Plus className="w-4 h-4" />,
        },
      ]}
      className={className}
    />
  );
};
