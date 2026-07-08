import type { ReactNode } from 'react';

interface ResourceTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => ReactNode;
  }>;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ResourceTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data available',
}: ResourceTableProps<T>) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">{emptyMessage}</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                {column.render(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
