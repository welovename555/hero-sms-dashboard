export const HERO_SMS_BASE_URL = 'https://hero-sms.com/stubs/handler_api.php';

export const ACTIONS = {
  GET_BALANCE: 'getBalance',
  GET_NUMBER: 'getNumberV2', // Use V2 as in reference
  SET_STATUS: 'setStatus',
  GET_STATUS: 'getStatus',
  GET_PRICES: 'getPrices',
  GET_COUNTRIES: 'getCountries',
  GET_SERVICES: 'getServicesList',
  GET_OPERATORS: 'getOperators',
  GET_TOP_COUNTRIES: 'getTopCountriesByService',
  GET_ACTIVE_ACTIVATIONS: 'getActiveActivations',
  GET_HISTORY: 'getHistory',
};

export const STATUS_CODES = {
  READY: 1,
  RETRY: 3,
  COMPLETE: 6,
  CANCEL: 8,
};
