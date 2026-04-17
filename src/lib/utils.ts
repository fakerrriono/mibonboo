import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes.
 * Requires 'clsx' and 'tailwind-merge' to be installed.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
