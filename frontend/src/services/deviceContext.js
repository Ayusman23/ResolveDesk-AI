/**
 * Novel Feature 5: Contextual Indexing Client Collector
 * Harvests client environment diagnostics to enrich ticket payloads
 * before processing through the zero-trust AI pipeline.
 */

export const getDeviceDiagnostics = () => {
  const userAgent = navigator.userAgent || '';
  
  // Detect OS
  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows 11 / 10 Enterprise';
  else if (userAgent.indexOf('Mac') !== -1) os = 'macOS Sonoma / Ventura';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux Enterprise / Ubuntu';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android OS';
  else if (userAgent.indexOf('like Mac') !== -1) os = 'iOS Workstation';

  // Detect Browser
  let browser = 'Unknown Browser';
  if (userAgent.indexOf('Edg') !== -1) browser = 'Microsoft Edge Enterprise';
  else if (userAgent.indexOf('Chrome') !== -1) browser = 'Google Chrome';
  else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'Apple Safari';
  else if (userAgent.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';

  // Screen resolution
  const screenResolution = `${window.screen.width || 1920}x${window.screen.height || 1080} (${window.devicePixelRatio || 1}x)`;

  // Network connection diagnostics
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const networkType = connection ? `${connection.effectiveType || '4g'} (${connection.downlink || '10'} Mbps)` : 'Corporate Ethernet / Wi-Fi';

  return {
    os,
    browser,
    screenResolution,
    networkType,
    userAgent,
    language: navigator.language || 'en-US',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };
};
