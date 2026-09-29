import { X, Bell, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications = [
  { 
    id: 1, 
    title: 'Nova remessa criada', 
    message: 'A remessa SHP-10080 foi registrada com sucesso no sistema.', 
    time: 'Há 5 min', 
    read: false, 
    type: 'info', 
    icon: Package 
  },
  { 
    id: 2, 
    title: 'Atraso na rota identificado', 
    message: 'A remessa SHP-10055 sofreu um atraso devido a congestionamento severo na BR-116.', 
    time: 'Há 2 horas', 
    read: false, 
    type: 'warning', 
    icon: AlertTriangle 
  },
  { 
    id: 3, 
    title: 'Remessa entregue', 
    message: 'A remessa SHP-10012 foi entregue ao destinatário final em Recife com sucesso.', 
    time: 'Ontem', 
    read: true, 
    type: 'success', 
    icon: CheckCircle 
  },
  { 
    id: 4, 
    title: 'Relatório Mensal', 
    message: 'O relatório consolidado de remessas do último mês já está disponível para exportação.', 
    time: 'Há 2 dias', 
    read: true, 
    type: 'info', 
    icon: Bell 
  },
];

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:pr-8 sm:pt-4 pointer-events-none">
      {/* Soft Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] pointer-events-auto transition-opacity" 
        onClick={onClose}
      />
      
      {/* Popover/Modal */}
      <div className="bg-white w-full max-w-[400px] rounded-[32px] shadow-[0_20px_60px_-15px_rgb(0,0,0,0.08)] pointer-events-auto relative z-10 mt-20 overflow-hidden flex flex-col border border-white/60">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Notificações</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">2 não lidas</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[50vh] custom-scrollbar bg-white">
          {mockNotifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id} 
                className={`p-6 border-b border-slate-50 transition-colors hover:bg-slate-50/80 flex gap-4 cursor-pointer group ${!notif.read ? 'bg-indigo-50/20' : ''}`}
              >
                <div className={`mt-1 flex-shrink-0 p-2 rounded-2xl h-fit shadow-sm ${
                  notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                  notif.type === 'warning' ? 'bg-orange-50 text-orange-500' : 
                  'bg-indigo-50 text-indigo-500'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{notif.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mt-0.5">{notif.time}</span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50/80 text-center border-t border-slate-50">
          <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors underline underline-offset-4 decoration-indigo-200">
            Marcar todas como lidas
          </button>
        </div>
      </div>
    </div>
  );
}
