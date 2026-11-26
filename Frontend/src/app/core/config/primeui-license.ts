declare global {
  interface Window {
    __PRIMEUI_LICENSE__?: string;
  }
}

export const primeUiLicense =
  typeof window === 'undefined' ? '' : (window.__PRIMEUI_LICENSE__ ?? '');
