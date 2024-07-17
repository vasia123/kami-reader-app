export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const telegramHashString = convertTelegramHashToString();
  if (telegramHashString) {
    const cookies = useCookie('telegramSession');
    cookies.value = telegramHashString;
    location.hash = "";
  }
});