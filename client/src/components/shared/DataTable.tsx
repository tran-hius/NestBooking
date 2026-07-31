import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  actionButton?: ReactNode;
  emptyMessage?: string;
  getRowKey?: (item: T) => string;
}

export function DataTable<T>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  actionButton,
  emptyMessage = "Không có dữ liệu.",
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {actionButton}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-slate-50 dark:bg-zinc-900/80">
            <TableRow>
              {columns.map((col: Column<T>, idx: number) => (
                <TableHead key={idx} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item: T, rowIdx: number) => (
                <TableRow key={getRowKey ? getRowKey(item) : rowIdx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                  {columns.map((col: Column<T>, colIdx: number) => (
                    <TableCell key={colIdx} className={col.className}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
