import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center w-full h-full p-8 ${className || ""}`}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}
