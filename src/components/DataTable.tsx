import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Shipment } from '../api/mockData';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ChevronDown } from 'lucide-react';

interface DataTableProps {
  data: Shipment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortField: keyof Shipment | '';
  sortOrder: 'asc' | 'desc';
  onSort: (field: keyof Shipment) => void;
}

export function DataTable({
  data,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  sortField,
  sortOrder,
  onSort,
}: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Increased for more padding
    overscan: 10,
  });

  const renderSortIcon = (field: keyof Shipment) => {
    const isActive = sortField === field;
    return (
      <div className="relative flex items-center justify-center w-4 h-4 ml-1 overflow-hidden">
        <ArrowUpDown 
          size={14} 
          className={`absolute transition-all duration-300 ease-in-out ${isActive ? 'opacity-0 scale-50' : 'opacity-40 scale-100 group-hover:opacity-100'}`} 
        />
        <ArrowUp 
          size={14} 
          className={`absolute text-primary transition-all duration-300 ease-in-out ${!isActive ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} ${sortOrder === 'desc' ? 'rotate-180' : 'rotate-0'}`} 
        />
      </div>
    );
  };

  const columns: { label: string; field: keyof Shipment; align?: 'right' }[] = [
    { label: 'ID', field: 'id' },
    { label: 'Rastreio', field: 'trackingNumber' },
    { label: 'Status', field: 'status' },
    { label: 'Origem', field: 'origin' },
    { label: 'Destino', field: 'destination' },
    { label: 'Valor', field: 'value', align: 'right' },
  ];

  const gridColsClass = "grid grid-cols-[140px_160px_140px_minmax(200px,1fr)_minmax(200px,1fr)_140px] w-full";

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div 
        ref={parentRef} 
        className="flex-1 overflow-auto relative custom-scrollbar"
        style={{ minHeight: '400px' }}
      >
        <table className="w-full text-sm text-left block">
          <thead className="text-[11px] text-slate-400 font-bold uppercase sticky top-0 z-20 block w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
            <tr className={gridColsClass}>
              {columns.map((col) => (
                <th key={col.field} className="px-5 py-4 font-semibold tracking-wider">
                  <button 
                    onClick={() => onSort(col.field)}
                    className={`flex items-center group hover:text-foreground transition-colors w-full ${col.align === 'right' ? 'justify-end' : ''}`}
                  >
                    {col.label}
                    {renderSortIcon(col.field)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="block relative w-full"
            style={{
              height: isLoading ? 'auto' : `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className={`${gridColsClass} items-center border-b`}>
                  <td className="px-5 py-4"><div className="h-4 bg-muted/60 rounded animate-pulse w-16"></div></td>
                  <td className="px-5 py-4"><div className="h-4 bg-muted/60 rounded animate-pulse w-24"></div></td>
                  <td className="px-5 py-4"><div className="h-6 bg-muted/60 rounded-full animate-pulse w-24"></div></td>
                  <td className="px-5 py-4"><div className="h-4 bg-muted/60 rounded animate-pulse w-32"></div></td>
                  <td className="px-5 py-4"><div className="h-4 bg-muted/60 rounded animate-pulse w-32"></div></td>
                  <td className="px-5 py-4 flex justify-end"><div className="h-4 bg-muted/60 rounded animate-pulse w-20"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center w-full">
                  <div className="bg-muted/20 p-4 rounded-full mb-3">
                    <ArrowUpDown size={24} className="opacity-20" />
                  </div>
                  <p>Nenhum registro encontrado.</p>
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const shipment = data[virtualRow.index];
                return (
                  <tr
                    key={shipment.id}
                    className={`${gridColsClass} items-center absolute border-b border-slate-50 transition-all hover:bg-slate-50/80 group rounded-2xl hover:scale-[0.995] hover:shadow-sm bg-white`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-5 py-3 font-bold text-indigo-500 underline underline-offset-4 decoration-indigo-100 cursor-pointer hover:text-indigo-600">{shipment.id}</td>
                    <td className="px-5 py-3 text-slate-400 group-hover:text-slate-600 transition-colors font-medium tracking-wide text-sm">{shipment.trackingNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border uppercase tracking-wider ${
                        shipment.status === 'Entregue' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                        shipment.status === 'Em Trânsito' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                        shipment.status === 'Cancelado' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        'bg-orange-50 text-orange-500 border-orange-100'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 truncate text-slate-600 font-medium text-sm">{shipment.origin}</td>
                    <td className="px-5 py-3 truncate text-slate-600 font-medium text-sm">{shipment.destination}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipment.value)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-transparent border-t border-slate-100 gap-4 mt-auto">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Mostrando <span className="font-semibold text-foreground">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> até{' '}
            <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> de{' '}
            <span className="font-semibold text-foreground">{totalCount}</span> registros
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <div className="relative group">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="appearance-none bg-white border-none rounded-full pl-4 pr-8 py-2 text-sm font-bold text-slate-600 shadow-[0_4px_15px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                {[20, 50, 100, 200, 500].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-3 rounded-full bg-white text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_15px_rgb(0,0,0,0.04)]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-4 text-muted-foreground">
            Página <span className="text-foreground">{currentPage}</span> de <span className="text-foreground">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-3 rounded-full bg-white text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_15px_rgb(0,0,0,0.04)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
