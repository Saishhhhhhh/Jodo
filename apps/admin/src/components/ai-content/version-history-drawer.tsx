'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, FileText, CheckCircle, Sparkles, Edit3 } from 'lucide-react';
import { AiContentVersion } from '@/stores/ai-content';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: AiContentVersion[];
  contentId: string;
  onRestoreVersion?: (version: AiContentVersion) => void;
}

export function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions = [],
  contentId,
  onRestoreVersion,
}: VersionHistoryDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2 text-primary">
            <History className="w-5 h-5" />
            <SheetTitle>Version History</SheetTitle>
          </div>
          <SheetDescription>
            Audit trail of all AI iterations, human edits, reviews, and CMS publication events for {contentId}.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {versions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No historical versions recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
              {versions.map((ver, idx) => {
                const isLatest = idx === 0;
                const isAI = ver.action.toLowerCase().includes('ai');
                const isPublished = ver.action.toLowerCase().includes('publish');
                const isApproved = ver.action.toLowerCase().includes('approved');

                return (
                  <div key={ver.version} className="relative group">
                    {/* Timeline node icon */}
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                        isLatest
                          ? 'border-primary ring-2 ring-primary/20'
                          : isPublished
                          ? 'border-emerald-600'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLatest
                            ? 'bg-primary'
                            : isPublished
                            ? 'bg-emerald-600'
                            : 'bg-muted-foreground'
                        }`}
                      />
                    </div>

                    <div className="border rounded-lg p-3.5 bg-card hover:border-primary/40 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">
                            Version {ver.version}
                          </span>
                          {isLatest && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/5 text-primary border-primary/20">
                              Active
                            </Badge>
                          )}
                        </div>
                        {ver.qualityScore && (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Score: {ver.qualityScore}/100
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        {isAI ? (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        ) : isApproved ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {ver.action}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ver.modifiedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ver.date}
                        </span>
                      </div>

                      {onRestoreVersion && !isLatest && (
                        <button
                          type="button"
                          onClick={() => onRestoreVersion(ver)}
                          className="text-[11px] text-primary hover:underline font-medium pt-1 block"
                        >
                          Restore this version
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
