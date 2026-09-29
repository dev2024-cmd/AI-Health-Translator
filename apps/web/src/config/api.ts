/// <reference types="vite/client" />

export const API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:8000'
).replace(/\/+$/, '');
