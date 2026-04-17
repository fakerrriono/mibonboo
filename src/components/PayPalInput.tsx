import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface PayPalInputProps {
  label: string;
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  name?: string;
  showToggle?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function PayPalInput({ 
  label, 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  className, 
  type = 'text', 
  showToggle = false,
  ...props 
}: PayPalInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputType, setInputType] = useState(type);
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  const toggleVisibility = () => {
    setInputType(prev => prev === 'password' ? 'text' : 'password');
  };

  return (
    <div className={cn("relative w-full rounded-[4px] border transition-all duration-200 bg-white", 
      isFocused ? "border-secondary ring-[0.5px] ring-secondary shadow-[0_0_0_1px_rgba(17,97,202,0.1)]" : "border-[#8d949b]",
      className
    )}>
      <label 
        className={cn(
          "absolute left-3 transition-all duration-200 pointer-events-none text-[#6c7378]",
          (isFocused || hasValue) 
            ? "top-1.5 text-[11px] font-bold" 
            : "top-1/2 -translate-y-1/2 text-[16px]"
        )}
      >
        {label}
      </label>
      <div className="flex items-center">
        <input 
          {...props}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "w-full px-3 pb-2 pt-5 bg-transparent outline-none text-[16px] text-text-main h-[56px]",
            (isFocused || hasValue) ? "opacity-100" : "opacity-0"
          )}
        />
        {showToggle && type === 'password' && hasValue && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="px-4 text-[14px] font-bold text-secondary hover:underline"
          >
            {inputType === 'password' ? 'Anzeigen' : 'Ausblenden'}
          </button>
        )}
      </div>
    </div>
  );
}
