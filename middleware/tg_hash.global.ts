export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const telegramHashString = convertTelegramHashToString();
  if (telegramHashString) {
    // Store the Telegram hash in localStorage
    localStorage.setItem('telegramSession', telegramHashString);
    // Clear the hash from the URL
    location.hash = "";
  }
});