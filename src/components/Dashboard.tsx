import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchShipments, fetchDashboardStats, fetchChartData, type Shipment } from '../api/mockData';
import { DataTable } from './DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Truck, CheckCircle, Search, Download, ChevronDown, Filter } from 'lucide-react';

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || 'Todos';
  const searchQuery = searchParams.get('search') || '';
  const sortField = (searchParams.get('sortField') || '') as keyof Shipment | '';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
  const pageSize = Number(searchParams.get('pageSize')) || 100;

  const [searchInput, setSearchInput] = useState(searchQuery);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['shipments', { page, pageSize, statusFilter, searchQuery, sortField, sortOrder }],
    queryFn: () => fetchShipments({ page, pageSize, status: statusFilter, search: searchQuery, sortField, sortOrder }),
    placeholderData: (prev) => prev,
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

  const handleSort = (field: keyof Shipment) => {
    if (sortField === field) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sortField: field, sortOrder: 'asc' });
    }
  };

  const handleExport = () => {
    if (!data?.data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Rastreio,Status,Origem,Destino,Valor\n"
      + data.data.map(e => `${e.id},${e.trackingNumber},${e.status},"${e.origin}","${e.destination}",${e.value}`).join("\n");
    
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
    <div className="flex px-4 md:px-8 max-w-[1600px] mx-auto gap-8">
      {/* Sidebar Layout */}
      <aside className="hidden md:flex flex-col gap-6 w-24 pt-4">
        <div className="flex flex-col items-center gap-4">
          <div 
            onClick={() => setSearchParams(new URLSearchParams())}
            className="w-16 h-20 bg-indigo-500 rounded-3xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-500/40 cursor-pointer transition-transform hover:-translate-y-1 active:scale-95"
          >
            <Package size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wider">BASE</span>
          </div>
          <div 
            onClick={() => updateParams({ status: 'Em Trânsito', page: '1' })}
            className={`w-16 h-20 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:-translate-y-1 active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${statusFilter === 'Em Trânsito' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' : 'bg-white text-slate-400 hover:text-indigo-500'}`}
          >
            <Truck size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wider">TRÂNSITO</span>
          </div>
          <div 
            onClick={() => document.getElementById('search-input')?.focus()}
            className="w-16 h-20 bg-white rounded-3xl flex flex-col items-center justify-center text-slate-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transition-transform hover:-translate-y-1 active:scale-95 hover:text-indigo-500"
          >
            <Search size={20} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wider">BUSCA</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="bg-white px-6 py-2.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700 tracking-wide">PAINEL</span>
            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
              <span className="text-[10px]">👁</span>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm font-semibold text-sm"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-orange-100 rounded-bl-full opacity-50 -z-10"></div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total de Remessas</p>
              <div className="p-2 bg-rose-50 text-rose-500 rounded-2xl">
                <Package size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800">{stats?.totalShipments?.toLocaleString('pt-BR') || '...'}</h3>
          </div>

          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-[32px] p-6 shadow-lg shadow-indigo-500/30 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Em Trânsito</p>
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Truck size={20} />
              </div>
            </div>
            <h3 className="text-4xl font-black">{stats?.inTransitCount?.toLocaleString('pt-BR') || '...'}</h3>
            <div className="flex gap-4 mt-auto text-indigo-100 text-sm font-medium">
              <span>{Math.round(((stats?.inTransitCount || 0) / (stats?.totalShipments || 1)) * 100)}% ativos</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Valor Total</p>
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-2xl">
                <CheckCircle size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">
              {stats?.totalValue 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.totalValue)
                : '...'}
            </h3>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-[400px] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                id="search-input"
                type="text"
                placeholder="Buscar por ID, rastreio, origem..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-600 font-medium placeholder:text-slate-400 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-full sm:w-56 group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                  <Filter size={18} />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
                  className="w-full pl-12 pr-10 py-3.5 bg-white rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-600 font-bold transition-all appearance-none cursor-pointer"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em Trânsito">Em Trânsito</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[600px] bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
            <DataTable
              data={data?.data || []}
              totalCount={data?.totalCount || 0}
              totalPages={data?.totalPages || 0}
              currentPage={page}
              pageSize={pageSize}
              isLoading={isLoading || isFetching}
              onPageChange={(p) => updateParams({ page: p.toString() })}
              onPageSizeChange={(size) => updateParams({ pageSize: size.toString(), page: '1' })}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
