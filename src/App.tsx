import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { NotificationModal } from './components/NotificationModal';
import { ShipmentTrackingPage } from './components/ShipmentTrackingPage';
import { initialNotifications, type AppNotification } from './api/mockData';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f4f7fc] text-slate-700 font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <nav className="py-6 px-8 flex items-center justify-between max-w-[1600px] mx-auto">
            <Link to="/dashboard" className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-wide uppercase">
                NEXUS
              </span>
              <span className="text-slate-400 font-medium ml-2 uppercase">
                Logística
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=transparent"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold text-indigo-500 text-sm cursor-pointer hover:text-indigo-600 transition-colors underline underline-offset-4 decoration-indigo-200">
                  João Silva
                </span>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-sm font-medium text-slate-600 hover:text-indigo-500 active:scale-95 transition-all cursor-pointer"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    unreadCount > 0
                      ? 'bg-indigo-500 animate-pulse'
                      : 'bg-slate-300'
                  }`}
                />
                <span>NOTIFICAÇÕES</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </nav>

          <main className="pb-12">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/rastreio/:shipmentId"
                element={<ShipmentTrackingPage />}
              />
            </Routes>
          </main>

          <NotificationModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
