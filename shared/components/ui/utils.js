/**
 * Utility function for conditionally joining class names
 * Replaces missing cn utility from AnnotateAI
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
export default cn;
