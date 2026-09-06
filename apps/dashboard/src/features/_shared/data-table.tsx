import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { cn } from "@repo/ui/lib/utils";

/** Definición de una columna. `cell` recibe la fila y devuelve lo que se pinta. */
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

/**
 * Tabla de lista, dirigida por configuración. No trae paginación ni filtros
 * (van fuera). Sirve para el 90 % de los módulos CRUD.
 */
export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  isLoading = false,
  emptyMessage = "Sin resultados.",
  rowActions,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Celda final con acciones por fila (menú, botones…). */
  rowActions?: (row: T) => React.ReactNode;
}) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  return (
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
  );
}
