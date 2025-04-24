import { cn } from "@/lib/utils";

interface InputErrorProps {
  message?: string;
  className?: string;
}

export function InputError({ message, className }: InputErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("text-sm text-destructive mt-1", className)}>
      {message}
    </p>
  );
} 