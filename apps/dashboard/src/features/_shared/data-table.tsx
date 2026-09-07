import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";

/** Definición de una columna. `cell` recibe la fila y devuelve lo que se pinta. */
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

/**
 * Estado de paginación (del servidor) que consume el pie de `DataTable`.
 * Los campos espejan `Paginated<T>` de `@repo/types`.
 */
export interface DataTablePagination {
  /** Página actual (1-based). */
  page: number;
  /** Última página disponible. */
  lastPage: number;
  /** Total de filas en todas las páginas. */
  total: number;
  /** Índice de la primera fila de esta página (1-based), o `null` si vacía. */
  from: number | null;
  /** Índice de la última fila de esta página, o `null` si vacía. */
  to: number | null;
  onPageChangeAction: (page: number) => void;
  /** Mientras se trae otra página; deshabilita los botones. */
  isFetching?: boolean;
}

/**
 * Tabla de lista, dirigida por configuración. La paginación es opcional pero
 * recomendada: pásale `pagination` y pinta el pie con "Anterior / Siguiente".
 * El filtrado se hace fuera (una `SearchInput` sobre la tabla).
 */
export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  isLoading = false,
  emptyMessage = "Sin resultados.",
  rowActions,
  pagination,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Celda final con acciones por fila (menú, botones…). */
  rowActions?: (row: T) => React.ReactNode;
  pagination?: DataTablePagination;
}) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              {rowActions ? (
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Cargando…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                  {rowActions ? (
                    <TableCell className="text-right">{rowActions(row)}</TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? <DataTablePaginationBar {...pagination} /> : null}
    </div>
  );
}

function DataTablePaginationBar({
  page,
  lastPage,
  total,
  from,
  to,
  onPageChangeAction,
  isFetching = false,
}: DataTablePagination) {
  const safeLastPage = Math.max(lastPage, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
      <span>
        {total === 0
          ? "Sin resultados"
          : `Mostrando ${from ?? 0}–${to ?? 0} de ${total}`}
      </span>
      <div className="flex items-center gap-2">
        <span className="tabular-nums">
          Página {page} de {safeLastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page <= 1}
          onClick={() => onPageChangeAction(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || page >= safeLastPage}
          onClick={() => onPageChangeAction(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
