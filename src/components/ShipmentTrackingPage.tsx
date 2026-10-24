import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchShipmentById,
  initialNotifications,
  type ShipmentDetails,
} from '../api/mockData';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Mail,
  Bell,
  Lightbulb,
  ShieldCheck,
  Phone,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export function ShipmentTrackingPage() {
  const { shipmentId = 'SHP-10080' } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();

  const { data: shipment, isLoading } = useQuery({
    queryKey: ['shipmentDetails', shipmentId],
    queryFn: () => fetchShipmentById(shipmentId),
  });

  const [channels, setChannels] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    push: false,
  });
  const [channelSavedToast, setChannelSavedToast] = useState(false);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [simulatedStepOverride, setSimulatedStepOverride] = useState<
    ShipmentDetails['currentStepId'] | null
  >(null);

  const handleToggleChannel = (key: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
    setChannelSavedToast(true);
    setTimeout(() => setChannelSavedToast(false), 2000);
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="h-10 w-48 bg-white rounded-full animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 bg-white rounded-[32px] animate-pulse" />
            <div className="h-96 bg-white rounded-[32px] animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-white rounded-[32px] animate-pulse" />
            <div className="h-64 bg-white rounded-[32px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-[32px] p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Package size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            Remessa "{shipmentId}" não localizada
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Verifique o código da remessa ou selecione um registro diretamente na tabela ou na central de notificações.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
            Voltar ao Painel Principal
          </button>
        </div>
      </div>
    );
  }

  const activeStepId = simulatedStepOverride || shipment.currentStepId;
  const stepOrder: ShipmentDetails['currentStepId'][] = [
    'processing',
    'shipped',
    'in_transit',
    'delivered',
  ];
  const activeStepIndex = stepOrder.indexOf(activeStepId);

  const effectiveProgress = simulatedStepOverride
    ? activeStepIndex === 0
      ? 25
      : activeStepIndex === 1
        ? 50
        : activeStepIndex === 2
          ? 75
          : 100
    : shipment.progressPercentage;

  const effectiveStatusLabel =
    activeStepId === 'delivered'
      ? 'Entregue'
      : activeStepId === 'in_transit'
        ? 'Em Trânsito'
        : activeStepId === 'shipped'
          ? 'Despachado'
          : 'Pendente';

  const operationalTips =
    activeStepId === 'processing'
      ? {
          title: 'Preparação e Conferência de Doca',
          subtitle: 'Recomendações operacionais enquanto a remessa aguarda expedição',
          tips: [
            {
              title: 'Validação de Manifesto e CT-e',
              description:
                'Confirme se a chave de acesso do CT-e e as notas fiscais vinculadas já foram liberadas para a transportadora.',
              readTime: '2 min de leitura',
            },
            {
              title: 'Agendamento de Janela no Destino',
              description: `Notifique o centro receptor em ${shipment.destination} para reservar a ${shipment.recipient.dock}.`,
              readTime: '3 min de leitura',
            },
          ],
        }
      : activeStepId === 'shipped' || activeStepId === 'in_transit'
        ? {
            title:
              shipment.id === 'SHP-10055'
                ? 'Protocolo de Contingência na Rota'
                : 'Acompanhamento de Trânsito Ativo',
            subtitle:
              'Diretrizes da Torre de Controle para cargas em deslocamento rodoviário',
            tips: [
              {
                title:
                  shipment.id === 'SHP-10055'
                    ? 'Desvio Monitorado — BR-116 (Km 412)'
                    : 'Telemetria e Velocidade Média',
                description:
                  shipment.id === 'SHP-10055'
                    ? 'A retenção na BR-116 acrescentou ~1h40 ao SLA original. O motorista já acionou ponto de apoio homologado.'
                    : 'O veículo mantém velocidade constante dentro da faixa de segurança com rastreamento via satélite.',
                readTime: '2 min de leitura',
              },
              {
                title: 'Preparação de Descarga Paletizada',
                description:
                  'Oriente a equipe de pátio a disponibilizar empilhadeira para descarga rápida assim que o veículo encostar.',
                readTime: '1 min de leitura',
              },
              {
                title: 'Checklist de Recebimento Cego',
                description:
                  'Gere a folha de conferência física dos lotes antes da abertura do lacre eletrônico.',
                readTime: '3 min de leitura',
              },
            ],
          }
        : {
            title: 'Auditoria Pós-Entrega & POD',
            subtitle: 'Próximos passos após a confirmação de entrega no destino final',
            tips: [
              {
                title: 'Validação do Canhoto Digital (POD)',
                description:
                  'O comprovante assinado digitalmente já foi anexado ao histórico fiscal desta remessa.',
                readTime: '2 min de leitura',
              },
              {
                title: 'Avaliação de SLA da Transportadora',
                description:
                  'Registre o índice de pontualidade e integridade da embalagem para alimentar o ranking trimestral.',
                readTime: '3 min de leitura',
              },
            ],
          };

  const priorityBenefits = [
    { icon: ShieldCheck, text: 'Cobertura securitária integral averbada (100% do lote)' },
    { icon: Truck, text: 'Prioridade de encoste em doca nos hubs NEXUS' },
    { icon: Clock, text: 'Recálculo automático de ETA via telemetria satelital' },
    { icon: Sparkles, text: 'Gerente de conta dedicado na Torre de Controle 24/7' },
  ];

  const deliveryChannelsList = [
    {
      key: 'sms' as const,
      icon: Smartphone,
      title: 'Alertas via SMS',
      description: 'Avisos imediatos sobre mudança de status ou retenção em rodovia',
      active: channels.sms,
      recommended: true,
    },
    {
      key: 'whatsapp' as const,
      icon: MessageSquare,
      title: 'WhatsApp Corporativo',
      description: 'Receba localização em tempo real e canhoto digital via WhatsApp',
      active: channels.whatsapp,
      recommended: true,
    },
    {
      key: 'email' as const,
      icon: Mail,
      title: 'Relatórios por E-mail',
      description: 'Cópia automática de CT-e, manifesto e comprovantes fiscais',
      active: channels.email,
      recommended: false,
    },
    {
      key: 'push' as const,
      icon: Bell,
      title: 'Notificações no Painel',
      description: 'Alertas sonoros e visuais no cabeçalho do NEXUS Logística',
      active: channels.push,
      recommended: false,
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 space-y-6">
      {/* Top Navigation & Notification Quick-Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-[28px] px-6 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            Voltar ao Painel
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Rastreios das Notificações:
            </span>
            {initialNotifications.map((notif) => {
              const isCurrent = notif.shipmentId === shipment.id;
              return (
                <Link
                  key={notif.id}
                  to={`/rastreio/${notif.shipmentId}`}
                  onClick={() => setSimulatedStepOverride(null)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {notif.type === 'warning' && (
                    <AlertTriangle
                      size={12}
                      className={isCurrent ? 'text-white' : 'text-orange-500'}
                    />
                  )}
                  {notif.shipmentId}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Interactive Stage Simulator (like the FigMake prototype) */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Simular Etapa:
          </span>
          {(
            [
              { id: 'processing', label: 'Confirmado' },
              { id: 'shipped', label: 'Expedição' },
              { id: 'in_transit', label: 'Em Trânsito' },
              { id: 'delivered', label: 'Entregue' },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              onClick={() => setSimulatedStepOverride(st.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                activeStepId === st.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Title & Order Metadata Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Rastreamento da Remessa
            </h1>
            <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-wider border border-indigo-100">
              {shipment.id}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
            <button
              onClick={() => handleCopyTracking(shipment.trackingNumber)}
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Copiar código de rastreio"
            >
              <span>Código #{shipment.trackingNumber}</span>
              {copiedTracking ? (
                <Check size={14} className="text-emerald-500" />
              ) : (
                <Copy size={14} className="text-slate-400" />
              )}
            </button>
            <span>•</span>
            <span>
              Origem: <strong className="text-slate-700">{shipment.origin}</strong> → Destino:{' '}
              <strong className="text-slate-700">{shipment.destination}</strong>
            </span>
            <span>•</span>
            <span>
              Previsão de entrega:{' '}
              <strong className="text-indigo-600">
                {activeStepId === 'delivered'
                  ? 'Entregue no Destino'
                  : shipment.estimatedDelivery}
              </strong>
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            navigate(`/dashboard?search=${encodeURIComponent(shipment.trackingNumber)}`)
          }
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:text-indigo-600 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <ExternalLink size={14} />
          Filtrar na Tabela Principal
        </button>
      </div>

      {/* Alert Banner when shipment has an active notification note (e.g. BR-116 delay) */}
      {shipment.alertNote && (
        <div
          className={`rounded-[28px] p-5 border flex items-start gap-4 ${
            shipment.id === 'SHP-10055'
              ? 'bg-orange-50/90 border-orange-200 text-orange-950'
              : shipment.status === 'Entregue'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : 'bg-indigo-50/80 border-indigo-100 text-indigo-950'
          }`}
        >
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              shipment.id === 'SHP-10055'
                ? 'bg-orange-100 text-orange-600'
                : shipment.status === 'Entregue'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            {shipment.id === 'SHP-10055' ? (
              <AlertTriangle size={20} />
            ) : shipment.status === 'Entregue' ? (
              <CheckCircle2 size={20} />
            ) : (
              <Bell size={20} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-wider opacity-75">
              Alerta Vinculado à Central de Notificações
            </p>
            <p className="text-sm font-semibold mt-0.5">{shipment.alertNote}</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout from Figma Order Tracking Page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Order / Shipment Status & Progress Bar Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800">Status da Remessa</h3>
              <span
                className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  effectiveStatusLabel === 'Entregue'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : effectiveStatusLabel === 'Em Trânsito'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                }`}
              >
                {effectiveStatusLabel}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  effectiveProgress === 100
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : shipment.id === 'SHP-10055'
                      ? 'bg-gradient-to-r from-indigo-500 via-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${effectiveProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-500" />
                <span>Última atualização: {shipment.lastUpdatedLabel}</span>
              </div>
              <span className="font-black text-slate-700">{effectiveProgress}% concluído</span>
            </div>
          </div>

          {/* 2. Tracking Timeline Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-slate-800 mb-6">
              Linha do Tempo de Rastreamento
            </h3>

            <div className="space-y-6">
              {shipment.timeline.map((step, index) => {
                const stepIdx = stepOrder.indexOf(step.id);
                const isCompleted = stepIdx <= activeStepIndex;
                const isCurrent = step.id === activeStepId;

                const StepIcon =
                  step.id === 'processing'
                    ? Package
                    : step.id === 'shipped'
                      ? Truck
                      : step.id === 'in_transit'
                        ? MapPin
                        : CheckCircle2;

                return (
                  <div key={step.id} className="relative flex gap-4">
                    {/* Connector line */}
                    {index < shipment.timeline.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 -bottom-6 w-0.5 -translate-x-1/2 ${
                          stepIdx < activeStepIndex ? 'bg-indigo-500' : 'bg-slate-100'
                        }`}
                      />
                    )}

                    {/* Step Circle Icon */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        step.isWarning && isCurrent
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 animate-pulse'
                          : isCompleted
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                            : isCurrent
                              ? 'bg-indigo-100 text-indigo-600 animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <StepIcon size={18} />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              step.isWarning
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-indigo-100 text-indigo-600'
                            }`}
                          >
                            Etapa Atual
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <CheckCircle2 size={15} className="text-emerald-500" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">
                        {step.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {step.timestamp}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {step.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Delivery Updates Preferences Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-slate-800">
                Preferências de Alerta da Entrega
              </h3>
              {channelSavedToast && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 size={13} />
                  Preferências Atualizadas
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 mb-5">
              Escolha como sua equipe deseja receber notificações em tempo real sobre a remessa{' '}
              <strong>{shipment.id}</strong>
            </p>

            <div className="space-y-3">
              {deliveryChannelsList.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#f8faff] border border-slate-100/80"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-2xl bg-white text-indigo-500 shadow-xs">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{ch.title}</p>
                          {ch.recommended && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={ch.active}
                      onClick={() => handleToggleChannel(ch.key)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                        ch.active ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          ch.active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/70">
              <p className="text-xs font-semibold text-indigo-900">
                📱 Enviamos alertas proativos sempre que houver mudança de status, desvio de rota ou emissão do comprovante de entrega (POD).
              </p>
            </div>
          </div>

          {/* 4. Order / Cargo Details Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              Detalhes do Manifesto & Volumes
            </h3>
            <div className="divide-y divide-slate-100">
              {shipment.cargoItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-base">
                      📦
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        SKU: {item.sku} • Qtd: {item.quantity} un. • Peso: {item.weightKg} kg
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Valor Total Declarado da Remessa
              </span>
              <span className="text-xl font-black text-slate-800">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(shipment.value)}
              </span>
            </div>
          </div>

          {/* 5. Shipping Address & Route Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              Endereço de Entrega & Doca de Destino
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8faff]">
                <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs font-medium text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Destinatário Final
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {shipment.recipient.company}
                  </p>
                  <p>{shipment.recipient.contact}</p>
                  <p>{shipment.recipient.street}</p>
                  <p>
                    {shipment.recipient.cityState} • CEP {shipment.recipient.zipCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#f8faff]">
                <Truck className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div className="space-y-1 text-xs font-medium text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Instruções de Pátio
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {shipment.recipient.dock}
                  </p>
                  <p>Origem: Terminal Consolidado {shipment.origin}</p>
                  <p>Data de Emissão: {shipment.date}</p>
                  <p>Modal: Rodoviário Dedicado B2B</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* 1. Contextual Operational Insights Card (from FigMake "Ae" card) */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-2xl bg-amber-50 text-amber-500">
                <Lightbulb size={18} />
              </div>
              <h3 className="text-lg font-black text-slate-800">
                {operationalTips.title}
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-5">
              {operationalTips.subtitle}
            </p>

            <div className="space-y-3.5">
              {operationalTips.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#f8faff] border border-slate-100/80"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-slate-800">{tip.title}</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-slate-400 border border-slate-100 shrink-0">
                      <Clock size={10} />
                      {tip.readTime}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1">
                💡 Dica da Torre de Controle
              </h4>
              <p className="text-xs font-medium text-indigo-950/80 leading-relaxed">
                Compartilhe a URL desta página diretamente com o gestor do centro de distribuição em{' '}
                <strong>{shipment.destination}</strong> para acompanhamento sincronizado.
              </p>
            </div>
          </div>

          {/* 2. NEXUS Priority SLA & Insurance Card (from FigMake "Pe" card) */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-7 shadow-lg shadow-indigo-500/25 text-white">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-indigo-100" />
                <h3 className="text-lg font-black">NEXUS Priority SLA</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-black uppercase tracking-wider">
                Ativo
              </span>
            </div>

            <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-4">
              Esta remessa conta com monitoramento satelital prioritário e seguro de carga averbado.
            </p>

            <div className="space-y-2.5 mb-4">
              {priorityBenefits
                .slice(0, showAllBenefits ? priorityBenefits.length : 2)
                .map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold">
                      <Icon size={15} className="text-indigo-200 shrink-0" />
                      <span>{b.text}</span>
                    </div>
                  );
                })}
            </div>

            {!showAllBenefits && (
              <button
                type="button"
                onClick={() => setShowAllBenefits(true)}
                className="w-full py-2 text-xs font-bold text-indigo-100 hover:text-white underline underline-offset-4 cursor-pointer mb-3"
              >
                Mostrar todos os benefícios da apólice
              </button>
            )}

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={15} className="text-emerald-300" />
                <span className="text-xs font-bold">Garantia de SLA B2B</span>
              </div>
              <p className="text-[11px] text-indigo-100 leading-relaxed">
                Auditoria automática de rota e temperatura com relatórios exportáveis em PDF/CSV.
              </p>
            </div>
          </div>

          {/* 3. Need Help / Control Tower Support Card */}
          <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              Suporte da Torre de Controle
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  alert(
                    `Iniciando atendimento prioritário com a Torre de Controle para a remessa ${shipment.id} (${shipment.trackingNumber}).`
                  )
                }
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <MessageSquare size={16} className="text-indigo-500" />
                Chat Ao Vivo — Torre de Controle
              </button>
              <button
                type="button"
                onClick={() =>
                  alert(`Central Operacional NEXUS: 0800-770-6398 — Protocolo ${shipment.id}`)
                }
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
              >
                <Phone size={16} className="text-indigo-500" />
                Ligar para Central: 0800-NEXUS-LOG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

