/**
 * Utility function for conditionally joining class names
 * Replaces missing cn utility from AnnotateAI
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default cn; 