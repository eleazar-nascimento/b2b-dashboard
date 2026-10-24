import {
  X,
  Bell,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '../api/mockData';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenShipmentTracking = (notif: AppNotification) => {
    onMarkRead(notif.id);
    onClose();
    navigate(`/rastreio/${notif.shipmentId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:pr-8 sm:pt-4 pointer-events-none">
      {/* Soft Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Popover/Modal */}
      <div className="bg-white w-full max-w-[430px] rounded-[32px] shadow-[0_20px_60px_-15px_rgb(0,0,0,0.08)] pointer-events-auto relative z-10 mt-20 overflow-hidden flex flex-col border border-white/60">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Notificações
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {unreadCount === 0
                  ? 'Todas lidas'
                  : `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[58vh] custom-scrollbar bg-white">
          {notifications.map((notif) => {
            const Icon =
              notif.type === 'success'
                ? CheckCircle
                : notif.type === 'warning'
                  ? AlertTriangle
                  : notif.shipmentId === 'SHP-10004'
                    ? Truck
                    : Package;

            return (
              <div
                key={notif.id}
                onClick={() => handleOpenShipmentTracking(notif)}
                className={`p-6 border-b border-slate-50 transition-colors hover:bg-slate-50/90 flex gap-4 cursor-pointer group ${
                  !notif.read ? 'bg-indigo-50/20' : ''
                }`}
              >
                <div
                  className={`mt-1 flex-shrink-0 p-2.5 rounded-2xl h-fit shadow-sm ${
                    notif.type === 'success'
                      ? 'bg-emerald-50 text-emerald-500'
                      : notif.type === 'warning'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-indigo-50 text-indigo-500'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mt-0.5">
                      {notif.time}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-3">
                    {notif.message}
                  </p>

                  {/* Connected Shipment Pill & Action Link */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-indigo-50 text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      <span>{notif.shipmentId}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[10px] opacity-80">
                        {notif.trackingNumber}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                      Ver rastreio
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 flex items-center justify-between px-6 border-t border-slate-50">
          <span className="text-[11px] font-semibold text-slate-400">
            Clique em um alerta para abrir o rastreio
          </span>
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 disabled:text-slate-300 transition-colors underline underline-offset-4 decoration-indigo-200 disabled:no-underline cursor-pointer disabled:cursor-default"
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>
    </div>
  );
}
