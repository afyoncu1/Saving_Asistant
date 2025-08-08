import CryptoJS from 'crypto-js';

// Security utilities for the application
const ENCRYPTION_KEY = 'saving-assistant-secure-key-2024';

// XSS prevention - sanitize HTML content
export function sanitizeHTML(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// CSS sanitization for style generation
export function sanitizeCSS(css: string): string {
  // Remove dangerous CSS properties and values
  const dangerous = [
    'javascript:',
    'expression(',
    'behavior:',
    'vbscript:',
    'data:',
    '@import',
    'binding:',
    '-moz-binding'
  ];
  
  let sanitized = css;
  dangerous.forEach(item => {
    const regex = new RegExp(item, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
}

// Secure local storage with encryption
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decryptData<T>(encryptedData: string): T | null {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Input validation and sanitization
export function validateNumericInput(value: string, min?: number, max?: number): { isValid: boolean; sanitized: number | null; error?: string } {
  const sanitized = parseFloat(value.replace(/[^\d.-]/g, ''));
  
  if (isNaN(sanitized)) {
    return { isValid: false, sanitized: null, error: 'Invalid numeric value' };
  }
  
  if (min !== undefined && sanitized < min) {
    return { isValid: false, sanitized: null, error: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && sanitized > max) {
    return { isValid: false, sanitized: null, error: `Value must be at most ${max}` };
  }
  
  return { isValid: true, sanitized };
}

export function sanitizeTextInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

// Rate limiting for sensitive operations
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxAttempts) {
    return false;
  }
  
  current.count++;
  return true;
}