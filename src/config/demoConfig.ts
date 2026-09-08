// Configuration for Demo / Simulation Mode
// Strictly ensures NO real production databases, emails, or SMS are triggered.

export const DEMO_CONFIG = {
  // Demo mode flag (defaults to true)
  isDemoMode: true,
  
  // Base application URL used for QR Codes and direct share links
  appUrl: (typeof window !== 'undefined' && window.location?.origin) 
    ? window.location.origin 
    : 'https://wil-seven-tan.vercel.app',

  // Version identifier
  version: '1.0.0-demo',
  
  // Guardrails: strictly prohibited in Demo Mode
  guards: {
    allowProductionDatabase: false,
    allowExternalSms: false,
    allowExternalEmail: false,
    allowRealCitizenStorage: false,
  }
};

export const getBaseTrackingUrl = (trackingNumber: string): string => {
  const base = DEMO_CONFIG.appUrl.replace(/\/$/, '');
  return `${base}/#track=${encodeURIComponent(trackingNumber)}`;
};
