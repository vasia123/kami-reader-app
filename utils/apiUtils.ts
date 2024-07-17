// utils/apiUtils.ts

const API_BASE_URL = 'https://manga-viewer-chuker.amvera.io';

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const telegramSession = useCookie('telegramSession');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Authorization': telegramSession.value ? `Telegram ${telegramSession.value}` : '',
      ...options.headers,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as T;
}