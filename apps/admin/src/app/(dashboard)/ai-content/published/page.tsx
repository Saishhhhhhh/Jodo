'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  CheckCircle2,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  Package,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { PublishConfirmationModal } from '@/components/ai-content/publish-confirmation-modal';
import { VersionHistoryDrawer } from '@/components/ai-content/version-history-drawer';
import { QualityScoreBadge } from '@/components/ai-content/quality-score-badge';

export default function PublishedContentPage() {
  const { items, publishToCms } = useAiContentStore();

  const [search, setSearch] = useState('');
  const [activePublishItem, setActivePublishItem] = useState<AiContentItem | null>(null);
  const [activeHistoryItem, setActiveHistoryItem] = useState<AiContentItem | null>(null);

  // Show Approved & Published items
  const displayItems = items.filter((item) => {
    const isRelevantStatus = item.status === 'Approved' || item.status === 'Published';
    const matchesSearch =
      item.contentId?.toLowerCase().includes(search.toLowerCase()) ||
      item.id?.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.productName?.toLowerCase().includes(search.toLowerCase());

    return isRelevantStatus && matchesSearch;
  });

  const publishedCount = items.filter((i) => i.status === 'Published').length;
  const approvedCount = items.filter((i) => i.status === 'Approved').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Published & Approved Content
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              CMS Synchronization
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Deploy approved drafts into the live CMS database and track active storefront records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{approvedCount} Approved (Ready to Publish)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>{publishedCount} Live in CMS</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search published and approved records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Live sync updates product titles, descriptions, and specifications.
        </span>
      </div>

      {/* Published & Approved Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayItems.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-muted-foreground text-xs bg-card border rounded-xl">
            No published or approved items match your search.
          </div>
        ) : (
          displayItems.map((item) => {
            const isApproved = item.status === 'Approved';
            const isPublished = item.status === 'Published';
            const payload = item.editedContent || item.generatedContent || {};

            return (
              <div
                key={item.id}
                className="bg-card border rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {item.id}
                        </span>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {item.contentType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">
                        {item.productName || item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <QualityScoreBadge score={item.qualityScore} size="sm" />
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isPublished
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {payload.shortDescription || payload.fullDescription || payload.offer || '—'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t text-muted-foreground">
                    <div>
                      <span>Approved By: </span>
                      <span className="font-medium text-foreground">{item.approvedBy || 'Manager'}</span>
                    </div>
                    <div>
                      <span>Version: </span>
                      <span className="font-medium text-foreground">V{item.version}</span>
                    </div>
                    {isPublished && (
                      <div className="col-span-2 text-purple-600 font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>Published on {item.publishedAt || item.updatedAt} by {item.publishedBy || 'Admin'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setActiveHistoryItem(item)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    Version Timeline
                  </button>

                  <div className="flex items-center gap-2">
                    {/* STRICT PUBLISHING GATE (Section 12): Only Status === Approved displays Publish to CMS */}
                    {isApproved && (
                      <Button
                        size="sm"
                        onClick={() => setActivePublishItem(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Publish to CMS
                      </Button>
                    )}

                    {isPublished && (
                      <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-xs py-1 px-3">
                        ✓ Active on CMS Storefront
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Confirmation Modal */}
      {activePublishItem && (
        <PublishConfirmationModal
          isOpen={!!activePublishItem}
          onClose={() => setActivePublishItem(null)}
          onConfirm={async () => {
            await publishToCms(activePublishItem.id, 'Admin');
          }}
          item={activePublishItem}
        />
      )}

      {/* Version History Drawer */}
      {activeHistoryItem && (
        <VersionHistoryDrawer
          isOpen={!!activeHistoryItem}
          onClose={() => setActiveHistoryItem(null)}
          versions={activeHistoryItem.versions || []}
          contentId={activeHistoryItem.id}
        />
      )}
    </div>
  );
}
