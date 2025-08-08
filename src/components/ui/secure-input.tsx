import * as React from "react";
import { cn } from "@/lib/utils";
import { validateNumericInput, sanitizeTextInput, checkRateLimit } from "@/lib/security";

interface SecureInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  validation?: {
    type: 'numeric' | 'text';
    min?: number;
    max?: number;
    maxLength?: number;
  };
  rateLimitKey?: string;
  onValidationError?: (error: string) => void;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ 
    className, 
    value, 
    onChange, 
    validation,
    rateLimitKey,
    onValidationError,
    ...props 
  }, ref) => {
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Rate limiting check
      if (rateLimitKey && !checkRateLimit(rateLimitKey)) {
        setError('Too many attempts. Please wait before trying again.');
        onValidationError?.('Rate limit exceeded');
        return;
      }

      // Input validation and sanitization
      if (validation) {
        if (validation.type === 'numeric') {
          const result = validateNumericInput(inputValue, validation.min, validation.max);
          if (!result.isValid && inputValue !== '') {
            setError(result.error || 'Invalid input');
            onValidationError?.(result.error || 'Invalid input');
            return;
          }
          setError(null);
          onChange(inputValue);
        } else if (validation.type === 'text') {
          const sanitized = sanitizeTextInput(inputValue, validation.maxLength);
          setError(null);
          onChange(sanitized);
        }
      } else {
        onChange(inputValue);
      }
    };

    return (
      <div className="space-y-1">
        <input
          value={value}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

SecureInput.displayName = "SecureInput";

export { SecureInput };