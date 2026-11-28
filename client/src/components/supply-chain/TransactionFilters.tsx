
import type { ReactNode } from "react";

export type TransactionColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
};

type TransactionTableProps<T> = {
  columns: TransactionColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
};

export default function TransactionTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyMessage = "No transactions found.",
}: TransactionTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading transactions...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-700">
          {emptyMessage}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`${column.header}-${index}`}
                className={`px-5 py-4 font-bold ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              className="transition hover:bg-slate-50"
            >
              {columns.map((column, index) => (
                <td
                  key={`${getRowId(row)}-${index}`}
                  className={`px-5 py-4 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
