'use client';

import { Button } from '@pranakaia/ui';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface TablePaginationProps {
  pagination: PaginationMeta;
}

export function TablePagination({ pagination }: TablePaginationProps) {
  const [_currentPage, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  const { page, pageSize, total, totalPages } = pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (totalPages <= 1) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navBtnClass =
    'h-8 w-8 border border-white/10 bg-white/4 text-gray-400 hover:bg-white/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center justify-between px-2 py-3 mt-1">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-medium text-gray-300">{from}</span>–
        <span className="font-medium text-gray-300">{to}</span> de{' '}
        <span className="font-medium text-gray-300">{total}</span> resultados
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className={navBtnClass}
          disabled={page <= 1}
          onClick={() => handlePageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={navBtnClass}
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
            if (i > 0 && arr[i - 1] !== undefined && p - (arr[i - 1] as number) > 1) {
              acc.push('ellipsis');
            }
            acc.push(p);
            return acc;
          }, [])
          .map((item, i) =>
            item === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1 text-gray-600 text-sm">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant="outline"
                size="icon"
                className={
                  item === page
                    ? 'h-8 w-8 bg-[#14b8a6] border-[#14b8a6] text-black font-bold hover:bg-[#0f9f8f]'
                    : navBtnClass
                }
                onClick={() => handlePageChange(item as number)}
              >
                {item}
              </Button>
            ),
          )}

        <Button
          variant="outline"
          size="icon"
          className={navBtnClass}
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={navBtnClass}
          disabled={page >= totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
