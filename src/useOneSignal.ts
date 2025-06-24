import OneSignal from 'react-onesignal';
import { useEffect } from 'react';
import { useUser } from './UserContext';

const oneSignalAppId = import.meta.env.VITE_PUBLIC_ONESIGNAL_APP_ID || import.meta.env.VITE_ONESIGNAL_APP_ID;

export function useOneSignal() {
  const { userId } = useUser();

  useEffect(() => {
    if (!userId || !oneSignalAppId) return;
    let initialized = false;
    (async () => {
      if (initialized) return;
      initialized = true;
      await OneSignal.init({
        appId: oneSignalAppId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/onesignal/OneSignalSDKWorker.js',
        serviceWorkerParam: { scope: '/onesignal/' },
      });
      await OneSignal.login(userId);
    })();
  }, [userId]);
}
