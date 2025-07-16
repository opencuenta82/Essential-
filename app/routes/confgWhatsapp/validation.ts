import { VALID_COUNTRY_CODES } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validatePhoneNumber(phoneNumber: string): ValidationResult {
  if (!phoneNumber.trim()) {
    return {
      isValid: false,
      message: "Por favor ingresa un número de teléfono válido"
    };
  }

  const sanitizedPhone = phoneNumber.replace(/[^\d]/g, '');
  if (!sanitizedPhone || sanitizedPhone.length < 8 || sanitizedPhone.length > 15) {
    return {
      isValid: false,
      message: "Por favor ingresa un número de teléfono válido (8-15 dígitos)"
    };
  }

  return { isValid: true };
}

export function validateMessage(message: string): ValidationResult {
  const sanitizedMessage = message.trim().slice(0, 500);
  if (!sanitizedMessage || sanitizedMessage.length < 5) {
    return {
      isValid: false,
      message: "Por favor ingresa un mensaje inicial (mínimo 5 caracteres)"
    };
  }

  return { isValid: true };
}

export function validateCountryCode(countryCode: string): ValidationResult {
  if (!VALID_COUNTRY_CODES.includes(countryCode)) {
    return {
      isValid: false,
      message: "Código de país no válido"
    };
  }

  return { isValid: true };
}

export function validateLogo(logoUrl: string): ValidationResult {
  if (logoUrl && logoUrl.length > 50000) {
    return {
      isValid: false,
      message: "El logo es demasiado grande. Por favor usa una imagen más pequeña."
    };
  }

  return { isValid: true };
}

export function validateColor(color: string): ValidationResult {
  const colorRegex = /^#[0-9A-F]{6}$/i;
  if (!colorRegex.test(color)) {
    return {
      isValid: false,
      message: "Color no válido"
    };
  }

  return { isValid: true };
}

export function validateForm(formData: {
  phoneNumber: string;
  startMessage: string;
  countryCode: string;
  logoUrl: string;
  color: string;
}): ValidationResult {
  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid) return phoneValidation;

  const messageValidation = validateMessage(formData.startMessage);
  if (!messageValidation.isValid) return messageValidation;

  const countryValidation = validateCountryCode(formData.countryCode);
  if (!countryValidation.isValid) return countryValidation;

  const logoValidation = validateLogo(formData.logoUrl);
  if (!logoValidation.isValid) return logoValidation;

  const colorValidation = validateColor(formData.color);
  if (!colorValidation.isValid) return colorValidation;

  return { isValid: true };
}