importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// VitePWA will inject its precache manifest below
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
// ...other custom logic if needed...

// VitePWA injects manifest here
self.__WB_MANIFEST;
