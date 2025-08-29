import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loading = ({ 
  message = "Loading...", 
  size = "md",
  className = ""
}: LoadingProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mx-auto`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const PageLoading = ({ 
  message = "Loading...",
  className = "min-h-screen"
}: Omit<LoadingProps, 'size'>) => {
  return (
    <div className={className}>
      <Loading message={message} size="lg" />
    </div>
  );
};
