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