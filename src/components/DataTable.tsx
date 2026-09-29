import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Shipment } from '../api/mockData';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

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
    { label: 'Tracking', field: 'trackingNumber' },
    { label: 'Status', field: 'status' },
    { label: 'Origem', field: 'origin' },
    { label: 'Destino', field: 'destination' },
    { label: 'Valor', field: 'value', align: 'right' },
  ];

  const gridColsClass = "grid grid-cols-[110px_160px_140px_minmax(200px,1fr)_minmax(200px,1fr)_140px] w-full";

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground border rounded-xl shadow-sm overflow-hidden">
      <div 
        ref={parentRef} 
        className="flex-1 overflow-auto relative custom-scrollbar"
        style={{ minHeight: '400px' }}
      >
        <table className="w-full text-sm text-left block">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/40 sticky top-0 z-20 block w-full border-b shadow-sm backdrop-blur-sm">
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
                    className={`${gridColsClass} items-center absolute border-b border-border/50 transition-all hover:bg-muted/30 group`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-5 py-3 font-semibold text-foreground/90">{shipment.id}</td>
                    <td className="px-5 py-3 text-muted-foreground group-hover:text-foreground/80 transition-colors font-medium tracking-wide">{shipment.trackingNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border uppercase tracking-wider ${
                        shipment.status === 'Entregue' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        shipment.status === 'Em Trânsito' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                        shipment.status === 'Cancelado' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 truncate text-foreground/80">{shipment.origin}</td>
                    <td className="px-5 py-3 truncate text-foreground/80">{shipment.destination}</td>
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

      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-muted/10 border-t gap-4">
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
                className="appearance-none bg-background border border-muted-foreground/20 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium hover:border-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-sm"
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
            className="p-2.5 rounded-lg border bg-background hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-4 text-muted-foreground">
            Página <span className="text-foreground">{currentPage}</span> de <span className="text-foreground">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-2.5 rounded-lg border bg-background hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
