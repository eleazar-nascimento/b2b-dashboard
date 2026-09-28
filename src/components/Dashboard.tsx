import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchShipments, fetchDashboardStats, fetchChartData } from '../api/mockData';
import { DataTable } from './DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Truck, CheckCircle, Search, Download } from 'lucide-react';

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchQuery);

  const pageSize = 100; // Using 100 to show off virtualization

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['shipments', { page, statusFilter, searchQuery }],
    queryFn: () => fetchShipments({ page, pageSize, status: statusFilter, search: searchQuery }),
    placeholderData: (prev) => prev, // keeps previous data on screen while fetching new
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  const { data: chartData } = useQuery({
    queryKey: ['chartData'],
    queryFn: fetchChartData,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateParams({ search: searchInput, page: '1' });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Tracking,Status,Origin,Destination,Value\n"
      + data?.data.map(e => `${e.id},${e.trackingNumber},${e.status},"${e.origin}","${e.destination}",${e.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_logistica.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Logístico</h1>
          <p className="text-muted-foreground">Acompanhe remessas, status e métricas financeiras.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Download size={16} />
          Exportar Relatório (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-700 dark:bg-blue-900/40 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Remessas</p>
            <h3 className="text-2xl font-bold">{stats?.totalShipments?.toLocaleString('pt-BR') || '...'}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 rounded-lg">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Em Trânsito</p>
            <h3 className="text-2xl font-bold">{stats?.inTransitCount?.toLocaleString('pt-BR') || '...'}</h3>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-700 dark:bg-green-900/40 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor Total Entregue</p>
            <h3 className="text-2xl font-bold">
              {stats?.totalValue 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)
                : '...'}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Volume por Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  cursor={{ fill: 'var(--muted)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Distribuição</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {chartData?.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID, rastreio, origem..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
            className="w-full sm:w-48 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="All">Todos os Status</option>
            <option value="Pending">Pendente</option>
            <option value="In Transit">Em Trânsito</option>
            <option value="Delivered">Entregue</option>
            <option value="Cancelled">Cancelado</option>
          </select>
        </div>

        <div className="h-[600px]">
          <DataTable
            data={data?.data || []}
            totalCount={data?.totalCount || 0}
            totalPages={data?.totalPages || 0}
            currentPage={page}
            pageSize={pageSize}
            isLoading={isLoading || isFetching}
            onPageChange={(p) => updateParams({ page: p.toString() })}
          />
        </div>
      </div>
    </div>
  );
}
