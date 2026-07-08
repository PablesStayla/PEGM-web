'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@pranakaia/ui';
import { Download, FileSpreadsheet, FileText, Table } from 'lucide-react';
import { useState } from 'react';
import { logger } from '@/lib/logger';

interface ExportDialogProps<T = unknown> {
  data: T[];
  onExportAction: (format: 'csv' | 'excel' | 'pdf', data: T[]) => void;
}

export function ExportDialog<T = unknown>({ data, onExportAction }: ExportDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExportAction(format, data);
      setOpen(false);
    } catch (error) {
      logger.error('Export error', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Choose a format to export {data.length} records</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={format}
          onValueChange={(v) => {
            if (v === 'csv' || v === 'excel' || v === 'pdf') {
              setFormat(v);
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv" className="flex cursor-pointer items-center gap-2">
              <Table className="h-4 w-4" />
              <div>
                <div className="font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">
                  Comma-separated values, compatible with Excel
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="excel" id="excel" />
            <Label htmlFor="excel" className="flex cursor-pointer items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <div>
                <div className="font-medium">Excel</div>
                <div className="text-xs text-muted-foreground">Native Excel format (.xlsx)</div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="pdf" />
            <Label htmlFor="pdf" className="flex cursor-pointer items-center gap-2">
              <FileText className="h-4 w-4" />
              <div>
                <div className="font-medium">PDF</div>
                <div className="text-xs text-muted-foreground">Printable document format</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
