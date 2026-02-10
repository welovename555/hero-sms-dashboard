export const HERO_SMS_BASE_URL = 'https://hero-sms.com/stubs/handler_api.php';

export const ACTIONS = {
  GET_BALANCE: 'getBalance',
  GET_NUMBER: 'getNumber',
  SET_STATUS: 'setStatus',
  GET_STATUS: 'getStatus',
  GET_PRICES: 'getPrices',
  GET_COUNTRIES: 'getCountries',
  GET_SERVICES: 'getServicesList',
  GET_OPERATORS: 'getOperators',
  GET_ACTIVE_ACTIVATIONS: 'getActiveActivations',
  GET_HISTORY: 'getHistory',
};

export const STATUS_CODES = {
  ACCESS_READY: 1, // Ready for SMS
  ACCESS_RETRY_GET: 3, // Request another SMS
  ACCESS_ACTIVATION: 6, // Complete activation
  ACCESS_CANCEL: 8, // Cancel activation
};
