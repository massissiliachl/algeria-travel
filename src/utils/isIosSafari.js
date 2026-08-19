export function isIosSafariBrowser() {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const isIosDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  return isIosDevice && !isStandalone;
}
