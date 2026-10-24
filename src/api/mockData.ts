import { addDays, subDays } from 'date-fns';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelado';
  origin: string;
  destination: string;
  date: string;
  value: number;
  alertNote?: string;
  estimatedDelivery?: string;
  carrier?: string;
  recipientName?: string;
  recipientAddress?: string;
}

export interface ShipmentTimelineStep {
  id: 'processing' | 'shipped' | 'in_transit' | 'delivered';
  title: string;
  description: string;
  timestamp: string;
  location: string;
  completed: boolean;
  current: boolean;
  isWarning?: boolean;
}

export interface ShipmentCargoItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  weightKg: number;
  unitPrice: number;
}

export interface ShipmentDetails extends Shipment {
  progressPercentage: number;
  currentStepId: 'processing' | 'shipped' | 'in_transit' | 'delivered';
  lastUpdatedLabel: string;
  timeline: ShipmentTimelineStep[];
  cargoItems: ShipmentCargoItem[];
  recipient: {
    company: string;
    contact: string;
    street: string;
    dock: string;
    cityState: string;
    zipCode: string;
  };
}

export interface AppNotification {
  id: number;
  shipmentId: string;
  trackingNumber: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
  routeHighlight?: string;
}

const origins = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];
const destinations = ['Manaus, AM', 'Recife, PE', 'Salvador, BA', 'Fortaleza, CE', 'Brasília, DF'];
const statuses: Shipment['status'][] = ['Pendente', 'Em Trânsito', 'Entregue', 'Cancelado'];

// Deterministic pseudo-random helper so tracking numbers stay stable across renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export const mockShipments: Shipment[] = Array.from({ length: 10000 }).map((_, index) => {
  const id = `SHP-${10000 + index}`;
  const r1 = seededRandom(index + 1);
  const r2 = seededRandom(index + 101);
  const r3 = seededRandom(index + 202);
  const r4 = seededRandom(index + 303);

  const dateObj = index % 2 === 0 ? addDays(new Date(), index % 30) : subDays(new Date(), index % 60);
  const trkDigits = Math.floor(100000000 + r1 * 899999999);

  let status = statuses[Math.floor(r2 * statuses.length)];
  let origin = origins[Math.floor(r3 * origins.length)];
  let destination = destinations[Math.floor(r4 * destinations.length)];
  let alertNote: string | undefined;
  let estimatedDelivery = 'Amanhã, 14:00 - 18:00';

  // Ensure exact consistency for shipments referenced in notifications
  if (id === 'SHP-10080') {
    status = 'Pendente';
    origin = 'São Paulo, SP';
    destination = 'Manaus, AM';
    estimatedDelivery = '26 Out, 09:00 - 13:00';
    alertNote = 'Remessa recém-registrada no sistema e aguardando consolidação na doca.';
  } else if (id === 'SHP-10055') {
    status = 'Em Trânsito';
    origin = 'Curitiba, PR';
    destination = 'Salvador, BA';
    estimatedDelivery = 'Hoje, 18:00 - 21:00 (Reprogramado)';
    alertNote = 'Atraso identificado devido a congestionamento severo na BR-116 (Km 412). Rota monitorada pela Torre de Controle.';
  } else if (id === 'SHP-10012') {
    status = 'Entregue';
    origin = 'São Paulo, SP';
    destination = 'Recife, PE';
    estimatedDelivery = 'Entregue — Comprovante digital assinado';
    alertNote = 'Remessa entregue ao destinatário final em Recife com sucesso.';
  } else if (id === 'SHP-10004') {
    status = 'Em Trânsito';
    origin = 'Porto Alegre, RS';
    destination = 'Brasília, DF';
    estimatedDelivery = 'Hoje, 15:00 - 17:30';
    alertNote = 'Veículo passou pelo posto de fiscalização estadual sem ocorrências.';
  }

  return {
    id,
    trackingNumber: `TRK${trkDigits}`,
    status,
    origin,
    destination,
    date: dateObj.toISOString().split('T')[0],
    value: parseFloat((r1 * 5000 + 450).toFixed(2)),
    alertNote,
    estimatedDelivery,
  };
});

export const initialNotifications: AppNotification[] = [
  {
    id: 1,
    shipmentId: 'SHP-10080',
    trackingNumber: mockShipments[80]?.trackingNumber || 'TRK849201442',
    title: 'Nova remessa criada',
    message: 'A remessa SHP-10080 foi registrada com sucesso no sistema.',
    time: 'Há 5 min',
    read: false,
    type: 'info',
    routeHighlight: 'São Paulo, SP → Manaus, AM',
  },
  {
    id: 2,
    shipmentId: 'SHP-10055',
    trackingNumber: mockShipments[55]?.trackingNumber || 'TRK592018311',
    title: 'Atraso na rota identificado',
    message: 'A remessa SHP-10055 sofreu um atraso devido a congestionamento severo na BR-116.',
    time: 'Há 2 horas',
    read: false,
    type: 'warning',
    routeHighlight: 'BR-116 • Curitiba, PR → Salvador, BA',
  },
  {
    id: 3,
    shipmentId: 'SHP-10012',
    trackingNumber: mockShipments[12]?.trackingNumber || 'TRK301948271',
    title: 'Remessa entregue',
    message: 'A remessa SHP-10012 foi entregue ao destinatário final em Recife com sucesso.',
    time: 'Ontem',
    read: true,
    type: 'success',
    routeHighlight: 'São Paulo, SP → Recife, PE',
  },
  {
    id: 4,
    shipmentId: 'SHP-10004',
    trackingNumber: mockShipments[4]?.trackingNumber || 'TRK771920412',
    title: 'Passagem por Hub Logístico',
    message: 'A remessa SHP-10004 concluiu transferência de manifesto rumo a Brasília, DF.',
    time: 'Há 2 dias',
    read: true,
    type: 'info',
    routeHighlight: 'Porto Alegre, RS → Brasília, DF',
  },
];

export interface FetchShipmentsParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  sortField?: keyof Shipment | '';
  sortOrder?: 'asc' | 'desc';
}

export const fetchShipments = async (params: FetchShipmentsParams) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  let filtered = [...mockShipments];

  if (params.status && params.status !== 'Todos') {
    filtered = filtered.filter((s) => s.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.trackingNumber.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q)
    );
  }

  if (params.sortField) {
    filtered.sort((a, b) => {
      const fieldA = a[params.sortField as keyof Shipment];
      const fieldB = b[params.sortField as keyof Shipment];

      let comparison = 0;
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        comparison = fieldA - fieldB;
      }

      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  const start = (params.page - 1) * params.pageSize;
  const paginated = filtered.slice(start, start + params.pageSize);

  return {
    data: paginated,
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / params.pageSize),
  };
};

export const fetchShipmentById = async (idOrTracking: string): Promise<ShipmentDetails | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const normalized = idOrTracking.trim().toUpperCase();
  const base = mockShipments.find(
    (s) => s.id.toUpperCase() === normalized || s.trackingNumber.toUpperCase() === normalized
  );

  if (!base) return null;

  const isPending = base.status === 'Pendente';
  const isInTransit = base.status === 'Em Trânsito';
  const isDelivered = base.status === 'Entregue';
  const isDelayed = base.id === 'SHP-10055';

  const currentStepId: ShipmentDetails['currentStepId'] = isDelivered
    ? 'delivered'
    : isInTransit
      ? 'in_transit'
      : 'processing';

  const progressPercentage = isDelivered
    ? 100
    : isInTransit
      ? isDelayed
        ? 62
        : 75
      : isPending
        ? 25
        : 15;

  const timeline: ShipmentTimelineStep[] = [
    {
      id: 'processing',
      title: 'Ordem Logística Confirmada',
      description: 'Manifesto eletrônico (CT-e) emitido e carga conferida no armazém de origem.',
      timestamp: `${base.date} - 08:30`,
      location: `Centro de Distribuição • ${base.origin}`,
      completed: true,
      current: currentStepId === 'processing',
    },
    {
      id: 'shipped',
      title: 'Expedição Autorizada',
      description: 'Carga lacrada e embarcada na frota rodoviária dedicada NEXUS.',
      timestamp: !isPending ? `${base.date} - 13:15` : 'Aguardando liberação de doca',
      location: `Terminal de Carga • ${base.origin}`,
      completed: !isPending,
      current: false,
    },
    {
      id: 'in_transit',
      title: isDelayed ? 'Em Trânsito (Alerta de Retenção na BR-116)' : 'Em Trânsito na Rodovia',
      description: isDelayed
        ? 'Congestionamento severo identificado na BR-116. Telemetria recalculando janela de chegada.'
        : `Transferência interestadual em andamento rumo a ${base.destination}.`,
      timestamp: isInTransit || isDelivered ? `${base.date} - 17:45` : 'Previsto após expedição',
      location: isDelayed ? 'Rodovia BR-116, Km 412' : `Corredor Logístico → ${base.destination}`,
      completed: isInTransit || isDelivered,
      current: currentStepId === 'in_transit',
      isWarning: isDelayed,
    },
    {
      id: 'delivered',
      title: 'Entregue no Destino Final',
      description: 'Recebimento confirmado via assinatura digital e comprovante de entrega (POD).',
      timestamp: isDelivered ? `${base.date} - 16:20` : 'Estimado conforme SLA',
      location: `Doca de Recebimento • ${base.destination}`,
      completed: isDelivered,
      current: currentStepId === 'delivered',
    },
  ];

  const primaryValue = parseFloat((base.value * 0.65).toFixed(2));
  const secondaryValue = parseFloat((base.value - primaryValue).toFixed(2));

  const cargoItems: ShipmentCargoItem[] = [
    {
      id: `${base.id}-ITM-1`,
      name: 'Palete Industrial Modulado — Série A',
      sku: `NX-${base.id.slice(4)}-A`,
      quantity: 2,
      weightKg: 140,
      unitPrice: parseFloat((primaryValue / 2).toFixed(2)),
    },
    {
      id: `${base.id}-ITM-2`,
      name: 'Unidade de Suprimentos Corporativos B2B',
      sku: `NX-${base.id.slice(4)}-B`,
      quantity: 1,
      weightKg: 65,
      unitPrice: secondaryValue,
    },
  ];

  return {
    ...base,
    progressPercentage,
    currentStepId,
    lastUpdatedLabel: isDelayed ? 'Há 12 minutos (Telemetria BR-116)' : 'Há 5 minutos via Satélite NEXUS',
    timeline,
    cargoItems,
    recipient: {
      company: ` Polo Empresarial ${base.destination.split(',')[0]} S.A.`,
      contact: 'Gestão de Recebimento & Almoxarifado',
      street: 'Av. das Indústrias, 1450 — Galpão Logístico 04',
      dock: 'Doca 12 (Acesso Pesado)',
      cityState: base.destination,
      zipCode: '50030-230',
    },
  };
};

export const fetchDashboardStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const totalValue = mockShipments.reduce((acc, curr) => acc + curr.value, 0);
  const deliveredCount = mockShipments.filter((s) => s.status === 'Entregue').length;
  const inTransitCount = mockShipments.filter((s) => s.status === 'Em Trânsito').length;

  return {
    totalShipments: mockShipments.length,
    totalValue,
    deliveredCount,
    inTransitCount,
  };
};

export const fetchChartData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return statuses.map((status) => ({
    name: status,
    value: mockShipments.filter((s) => s.status === status).length,
  }));
};
