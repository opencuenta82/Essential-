// Códigos de país válidos
export const VALID_COUNTRY_CODES = ['1', '51', '52', '54', '55', '56', '57', '58', '34'];

// Opciones de colores
export const COLOR_OPTIONS = [
  { value: "#25D366", name: "Verde WhatsApp" },
  { value: "#6366f1", name: "Índigo" },
  { value: "#ec4899", name: "Rosa" },
  { value: "#f59e0b", name: "Ámbar" },
  { value: "#8b5cf6", name: "Púrpura" },
  { value: "#0f172a", name: "Gris Oscuro" }
];

// Opciones de iconos
export const ICON_OPTIONS = [
  { value: "💬", label: "💬 Mensaje" },
  { value: "📱", label: "📱 Teléfono" },
  { value: "🚀", label: "🚀 Cohete" },
  { value: "💚", label: "💚 Corazón Verde" },
  { value: "⚡", label: "⚡ Rayo" },
  { value: "🔥", label: "🔥 Fuego" },
  { value: "💎", label: "💎 Diamante" },
  { value: "🎯", label: "🎯 Diana" }
];

// Opciones de países
export const COUNTRY_OPTIONS = [
  { value: "51", label: "🇵🇪 +51 Perú" },
  { value: "1", label: "🇺🇸 +1 EE.UU." },
  { value: "52", label: "🇲🇽 +52 México" },
  { value: "54", label: "🇦🇷 +54 Argentina" },
  { value: "55", label: "🇧🇷 +55 Brasil" },
  { value: "57", label: "🇨🇴 +57 Colombia" },
  { value: "56", label: "🇨🇱 +56 Chile" },
  { value: "58", label: "🇻🇪 +58 Venezuela" },
  { value: "34", label: "🇪🇸 +34 España" }
];

// Opciones de posición
export const POSITION_OPTIONS = [
  { value: "top-left", label: "Esquina Superior Izquierda" },
  { value: "bottom-left", label: "Esquina Inferior Izquierda" },
  { value: "bottom-right", label: "Esquina Inferior Derecha" },
  { value: "top-right", label: "Esquina Superior Derecha" }
];

// Días de la semana
export const WEEKDAYS = [
  { value: 'monday', name: 'Lunes', short: 'LUN' },
  { value: 'tuesday', name: 'Martes', short: 'MAR' },
  { value: 'wednesday', name: 'Miércoles', short: 'MIE' },
  { value: 'thursday', name: 'Jueves', short: 'JUE' },
  { value: 'friday', name: 'Viernes', short: 'VIE' },
  { value: 'saturday', name: 'Sábado', short: 'SAB' },
  { value: 'sunday', name: 'Domingo', short: 'DOM' }
];

// Valores por defecto del formulario
export const DEFAULT_FORM_VALUES = {
  position: "bottom-right",
  color: "#25D366",
  icon: "💬",
  countryCode: "51",
  phoneNumber: "999999999",
  startMessage: "¡Hola! Me interesa tu producto",
  buttonStyle: "style1",
  logoUrl: "",
  isActive24Hours: true,
  startTime: "09:00",
  endTime: "18:00",
  activeDays: "monday,tuesday,wednesday,thursday,friday"
};