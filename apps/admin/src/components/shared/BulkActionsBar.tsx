'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@pranakaia/ui';
import { Archive, CheckCircle2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { logger } from '@/lib/logger';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => Promise<void>;
  onArchive?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onArchive,
  onActivate,
  onClearSelection,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
      onClearSelection();
    } catch (error) {
      logger.error('Error during bulk delete', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>

        <div className="flex gap-2">
          {onActivate && (
            <Button size="sm" variant="outline" onClick={onActivate} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Activate
            </Button>
          )}

          {onArchive && (
            <Button size="sm" variant="outline" onClick={onArchive} className="gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            Cancel
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} {selectedCount === 1 ? 'item' : 'items'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
