// Production configuration. The application must never present simulated records.

export const DEMO_CONFIG = {
  isDemoMode: false,
  
  // Base application URL used for QR Codes and direct share links
  appUrl: (typeof window !== 'undefined' && window.location?.origin) 
    ? window.location.origin 
    : 'https://wil-seven-tan.vercel.app',

  // Version identifier
  version: '1.0.0-production',
  
  // Production capabilities are enabled only through the configured server.
  guards: {
    allowProductionDatabase: true,
    allowExternalSms: false,
    allowExternalEmail: false,
    allowRealCitizenStorage: true,
  }
};

export const getBaseTrackingUrl = (trackingNumber: string): string => {
  const base = DEMO_CONFIG.appUrl.replace(/\/$/, '');
  return `${base}/#track=${encodeURIComponent(trackingNumber)}`;
};
