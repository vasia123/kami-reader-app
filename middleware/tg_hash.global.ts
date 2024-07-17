export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const telegramHashString = convertTelegramHashToString();
  if (telegramHashString) {
    localStorage.setItem('telegramSession', telegramHashString);
    location.hash = "";
  }
});