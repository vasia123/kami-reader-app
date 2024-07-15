export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const telegramHashString = convertTelegramHashToString();
  if (telegramHashString) {
    const cookies = useCookie('session');
    cookies.value = telegramHashString;
    location.hash = "";
  }
});