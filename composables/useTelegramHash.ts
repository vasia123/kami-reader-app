import {createHmac} from 'crypto';
import type { TelegramWebAppData } from "@/types/telegram-web-app-data";

export const verifyInitData = (telegramInitData: string): boolean => {
  const urlParams = new URLSearchParams(telegramInitData);

  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  urlParams.sort();

  const dataCheck = [];
  for (const [key, value] of urlParams.entries()) {
    dataCheck.push(`${key}=${value}`);
  }
  const dataCheckString = dataCheck.join("\n");

  const secret = createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN ?? '');
  const calculatedHash = createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

export function paramsToTgWebAppData(entries: URLSearchParams): TelegramWebAppData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  for (const [key, value] of entries.entries()) {
    if (value.startsWith('{')) {
      result[key] = JSON.parse(value);
    } else {
      result[key] = value;
    }
  }
  return result as TelegramWebAppData;
}
export const convertTelegramHashToString = () => {
  const documentHash = document.location.hash;
  if (documentHash === '') {
    return null;
  }
  const hash = decodeURIComponent(
    decodeURIComponent(documentHash.substring(1)),
  );
  const urlParams = new URLSearchParams(hash.replace('tgWebAppData=', ''));
  const keysToRemove = [];
  for (const key of urlParams.keys()) {
    if (key.startsWith('tgWeb')) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    urlParams.delete(key);
  }
  return urlParams.toString()
};