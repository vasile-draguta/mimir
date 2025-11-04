/**
 * Sanitizes text input to prevent XSS and injection attacks
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  let sanitized = text.replace(/<[^>]*>/g, ''); // Remove HTML tags

  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters except newlines, tabs, and carriage returns
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
  sanitized = sanitized.replace(/[ \t]{3,}/g, '  '); // Remove excessive whitespace
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n'); // Normalize line breaks
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines to max 2

  return sanitized.trim();
}

/**
 * Validates text to ensure it's safe before sending to API
 * @param text - The text to validate
 * @param maxLength - Maximum allowed length
 * @returns true if text is valid, false otherwise
 */
export function validateText(text: string, maxLength: number): boolean {
  if (!text || text.length === 0 || text.length > maxLength) {
    return false;
  }

  if (/<[^>]*>/.test(text)) {
    return false;
  }

  const suspiciousPatterns = [
    /javascript:/i,
    /on\w+\s*=/i,
    /<script/i,
    /eval\(/i,
    /expression\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }

  return true;
}
