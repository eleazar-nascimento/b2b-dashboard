import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Shipment } from '../api/mockData';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
  data: Shipment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
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
  sortField,
  sortOrder,
  onSort,
}: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const renderSortIcon = (field: keyof Shipment) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-40" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const columns: { label: string; field: keyof Shipment; align?: 'right' }[] = [
    { label: 'ID', field: 'id' },
    { label: 'Tracking', field: 'trackingNumber' },
    { label: 'Status', field: 'status' },
    { label: 'Origem', field: 'origin' },
    { label: 'Destino', field: 'destination' },
    { label: 'Valor', field: 'value', align: 'right' },
  ];

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground border rounded-lg shadow-sm">
      <div 
        ref={parentRef} 
        className="flex-1 overflow-auto relative"
        style={{ minHeight: '400px' }}
      >
        <table className="w-full text-sm text-left relative">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th key={col.field} className={`px-4 py-3 font-medium ${col.align === 'right' ? 'text-right' : ''}`}>
                  <button 
                    onClick={() => onSort(col.field)}
                    className={`flex items-center gap-1 hover:text-foreground transition-colors ${col.align === 'right' ? 'justify-end w-full' : ''}`}
                  >
                    {col.label}
                    {renderSortIcon(col.field)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={{
              height: isLoading ? 'auto' : `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b">
                  <td className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-16"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-24"></div></td>
                  <td className="px-4 py-3"><div className="h-6 bg-muted rounded-full animate-pulse w-20"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-32"></div></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse w-32"></div></td>
                  <td className="px-4 py-3 flex justify-end"><div className="h-4 bg-muted rounded animate-pulse w-20"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const shipment = data[virtualRow.index];
                return (
                  <tr
                    key={shipment.id}
                    className="border-b transition-colors hover:bg-muted/50 absolute w-full"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{shipment.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{shipment.trackingNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shipment.status === 'Entregue' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        shipment.status === 'Em Trânsito' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        shipment.status === 'Cancelado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{shipment.origin}</td>
                    <td className="px-4 py-3">{shipment.destination}</td>
                    <td className="px-4 py-3 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipment.value)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> até{' '}
          <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> de{' '}
          <span className="font-medium">{totalCount}</span> registros
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-2 rounded-md border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
