'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AiContentItem } from '@/stores/ai-content';

interface PublishConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item?: AiContentItem | null;
}

export function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  item,
}: PublishConfirmationModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  if (!item) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsPublishing(false);
    }
  };

  const payload = item.editedContent || item.generatedContent || {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Globe className="w-5 h-5 text-emerald-600" />
            <DialogTitle>Publish this content to CMS?</DialogTitle>
          </div>
          <DialogDescription>
            This approved content will replace/update the live record in the JODO CMS database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Live Storefront Synchronization</span>
              <p className="text-[11px] leading-relaxed">
                Changes will take effect immediately on the official storefront, product cards, and search indices.
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground pb-2 border-b">
              <span>Target Record</span>
              <span className="font-semibold text-foreground">{item.productName || item.title}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Content Type</span>
              <span className="font-medium text-foreground capitalize">
                {item.contentType.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Approved Version</span>
              <span className="font-medium text-foreground">Version {item.version}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Approved By</span>
              <span className="font-medium text-emerald-600">{item.approvedBy || 'Manager'}</span>
            </div>
          </div>

          {payload.shortDescription && (
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground block">
                CMS Short Description Preview:
              </span>
              <div className="p-2.5 bg-background border rounded-md text-muted-foreground text-[11px] leading-relaxed max-h-24 overflow-y-auto">
                {payload.shortDescription}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
            {isPublishing ? 'Publishing to CMS...' : 'Confirm & Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
