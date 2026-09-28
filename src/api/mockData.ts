import { addDays, subDays } from 'date-fns';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelado';
  origin: string;
  destination: string;
  date: string;
  value: number;
}

const origins = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];
const destinations = ['Manaus, AM', 'Recife, PE', 'Salvador, BA', 'Fortaleza, CE', 'Brasília, DF'];
const statuses: Shipment['status'][] = ['Pendente', 'Em Trânsito', 'Entregue', 'Cancelado'];

export const mockShipments: Shipment[] = Array.from({ length: 10000 }).map((_, index) => {
  const dateObj = index % 2 === 0 ? addDays(new Date(), index % 30) : subDays(new Date(), index % 60);
  return {
    id: `SHP-${10000 + index}`,
    trackingNumber: `TRK${Math.random().toString().slice(2, 11)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    origin: origins[Math.floor(Math.random() * origins.length)],
    destination: destinations[Math.floor(Math.random() * destinations.length)],
    date: dateObj.toISOString().split('T')[0],
    value: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
  };
});

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
