import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile'; // import the profile page
import Messages from './pages/Messages'; // import the messages page
import Notifications from './pages/Notifications'; // import the notifications page
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';
import { OneSignalInitializer } from './OneSignalInitializer';
import { ConversationSubscriptions } from './components/ConversationSubscriptions';
import { RealtimeNotificationsProvider } from './components/RealtimeNotificationsProvider';
import { useMemo, useEffect, useState } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function MobilePwaBlocker({ installPromptEvent, onInstallClick }: { installPromptEvent: any, onInstallClick: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #18181b 0%, #23272f 100%)',
      color: 'white',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        background: 'rgba(30, 32, 38, 0.98)',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35)',
        padding: '40px 32px 32px 32px',
        maxWidth: 380,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #23272f',
      }}>
        <img src="/web-app-manifest-192x192.png" alt="App Icon" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 24 }} />
        <h2 style={{ fontSize: 28, marginBottom: 12, fontWeight: 700, letterSpacing: -1 }}>Install Our App</h2>
        <p style={{ fontSize: 17, marginBottom: 20, color: '#cbd5e1', lineHeight: 1.5 }}>
          For the best experience, please install and use our app from your home screen.<br/>
          Using the web version on mobile is not supported.
        </p>
        {installPromptEvent ? (
          <>
            <button
              onClick={onInstallClick}
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                color: '#fff',
                fontSize: 18,
                padding: '14px 0',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 18,
                fontWeight: 700,
                width: '100%',
                boxShadow: '0 2px 8px rgba(99,102,241,0.18)',
                transition: 'background 0.2s',
              }}
            >
              <span role="img" aria-label="install" style={{ marginRight: 8 }}>⬇️</span> Install App
            </button>
            <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
              If you have already installed the app, please open it from your home screen.
            </p>
          </>
        ) : (
          <>
            <ol style={{ textAlign: 'left', maxWidth: 320, margin: '0 auto 12px auto', fontSize: 16, color: '#e0e7ef', paddingLeft: 20 }}>
              <li style={{ marginBottom: 8 }}>Tap the <b>Share</b> button in your browser.</li>
              <li style={{ marginBottom: 8 }}>Select <b>"Add to Home Screen"</b>.</li>
              <li>Open the app from your home screen.</li>
            </ol>
            <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
              If you have already installed the app, please open it from your home screen.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstalledMsg, setShowInstalledMsg] = useState(false);
  const [installInitiated, setInstallInitiated] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Listen for appinstalled event and only show message if install was initiated from this session
  useEffect(() => {
    const onAppInstalled = () => {
      if (installInitiated) {
        setShowInstalledMsg(true);
      }
    };
    window.addEventListener('appinstalled', onAppInstalled);

    // Listen for display-mode changes (for iOS and others)
    const checkStandalone = () => {
      // No-op, but could be used for future logic
    };
    window.addEventListener('visibilitychange', checkStandalone);
    window.addEventListener('resize', checkStandalone);
    checkStandalone();

    return () => {
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('visibilitychange', checkStandalone);
      window.removeEventListener('resize', checkStandalone);
    };
  }, [installInitiated]);

  // Hide installed message after 3 seconds
  useEffect(() => {
    if (showInstalledMsg) {
      const timer = setTimeout(() => setShowInstalledMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstalledMsg]);

  // Only allow access if in standalone mode
  const shouldBlock = useMemo(() => {
    return isMobile() && !isInStandaloneMode();
  }, []);

  const handleInstallClick = () => {
    if (installPromptEvent) {
      setInstallInitiated(true);
      installPromptEvent.prompt();
      installPromptEvent.userChoice?.then(() => {
        setInstallPromptEvent(null);
      });
    }
  };

  if (shouldBlock) {
    if (showInstalledMsg) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #18181b 0%, #23272f 100%)',
          color: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(30, 32, 38, 0.98)',
            borderRadius: 24,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35)',
            padding: '40px 32px 32px 32px',
            maxWidth: 380,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid #23272f',
          }}>
            <img src="/web-app-manifest-192x192.png" alt="App Icon" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 24 }} />
            <h2 style={{ fontSize: 24, marginBottom: 12, fontWeight: 700, letterSpacing: -1, color: '#a7f3d0' }}>App installed!</h2>
            <p style={{ fontSize: 17, color: '#cbd5e1', lineHeight: 1.5 }}>
              Please open it from your home screen for the best experience.
            </p>
          </div>
        </div>
      );
    }
    return <MobilePwaBlocker installPromptEvent={installPromptEvent} onInstallClick={handleInstallClick} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
              <OneSignalInitializer />
              <ToastProvider>
            <RealtimeNotificationsProvider>
                <ConversationSubscriptions />
              <div className='bg-black min-h-screen overflow-x-hidden w-screen flex items-center flex-col justify-start'>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages/:conversationId" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  {/* Add the route for the profile page */}
                  <Route path="/profile/:username" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </RealtimeNotificationsProvider>
            </ToastProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;