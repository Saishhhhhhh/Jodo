'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Send,
  RefreshCw,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAiContentStore, AiContentItem, AiContentType, AiContentStatus } from '@/stores/ai-content';
import { QualityScoreBadge } from '@/components/ai-content/quality-score-badge';
import { RegenerationModal } from '@/components/ai-content/regeneration-modal';
import { ReviewDetailModal } from '@/components/ai-content/review-detail-modal';

export default function DraftsPage() {
  const router = useRouter();
  const {
    items,
    deleteItem,
    submitForReview,
    regenerateContent,
    approveContent,
    rejectContent,
    requestChanges,
  } = useAiContentStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [activeRegenItem, setActiveRegenItem] = useState<AiContentItem | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<AiContentItem | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.contentId?.toLowerCase().includes(search.toLowerCase()) ||
      item.id?.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.createdBy?.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'all' || item.contentType === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (item: AiContentItem) => {
    if (item.contentType === 'product_description') {
      router.push('/ai-content/product-descriptions');
    } else if (item.contentType === 'catalogue_content') {
      router.push('/ai-content/catalogue-content');
    } else if (item.contentType === 'listing_copy') {
      router.push('/ai-content/listing-copy');
    } else {
      router.push('/ai-content/campaign-content');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Draft Management
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              {filteredItems.length} Draft Records
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, edit, regenerate, and manage drafts through the review lifecycle.
          </p>
        </div>

        <Button
          onClick={() => router.push('/ai-content/product-descriptions')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm text-xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create New Draft
        </Button>
      </div>

      {/* Search & Filter Toolbar (Section 22) */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by Product, SKU, Content ID, Campaign, or Creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          {/* Filter Type */}
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
            >
              <option value="all">All Content Types</option>
              <option value="product_description">Product Description</option>
              <option value="catalogue_content">Catalogue Content</option>
              <option value="listing_copy">Listing Copy</option>
              <option value="campaign_content">Campaign Content</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Approved">Approved</option>
              <option value="Published">Published</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drafts Table (Section 10) */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Content ID</th>
                <th className="py-3 px-4">Content Type</th>
                <th className="py-3 px-4">Product / Campaign</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Quality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-xs">
                    No draft records match your search query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="secondary" className="text-[10px] font-medium capitalize">
                        {item.contentType.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{item.productName}</div>
                      {item.sku && <span className="text-[10px] text-muted-foreground">{item.sku}</span>}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-1 text-muted-foreground">{item.title}</p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {item.createdBy}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {item.createdAt.slice(0, 10)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <QualityScoreBadge score={item.qualityScore} size="sm" />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : item.status === 'Pending Review'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : item.status === 'Published'
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                            : item.status === 'Changes Requested'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : item.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Preview Modal */}
                        <button
                          type="button"
                          onClick={() => setActivePreviewItem(item)}
                          title="View Preview & History"
                          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit in dedicated module */}
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit in Generator"
                          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Regenerate */}
                        <button
                          type="button"
                          onClick={() => setActiveRegenItem(item)}
                          title="Regenerate with AI"
                          className="p-1.5 hover:bg-muted rounded-md text-amber-500 hover:text-amber-600 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Send for review */}
                        {item.status !== 'Approved' && item.status !== 'Published' && (
                          <button
                            type="button"
                            onClick={() => {
                              submitForReview(item.id, 'Admin');
                              toast.success(`Draft ${item.id} submitted for review!`);
                            }}
                            title="Send for Review"
                            className="p-1.5 hover:bg-muted rounded-md text-primary hover:text-primary/80 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            deleteItem(item.id);
                            toast.error(`Draft ${item.id} deleted.`);
                          }}
                          title="Delete Draft"
                          className="p-1.5 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeRegenItem && (
        <RegenerationModal
          isOpen={!!activeRegenItem}
          onClose={() => setActiveRegenItem(null)}
          onRegenerate={(instruction) => regenerateContent(activeRegenItem.id, instruction)}
          title={`Regenerate ${activeRegenItem.id}`}
        />
      )}

      {activePreviewItem && (
        <ReviewDetailModal
          isOpen={!!activePreviewItem}
          onClose={() => setActivePreviewItem(null)}
          item={activePreviewItem}
          onApprove={(id) => approveContent(id, 'Admin')}
          onRequestChanges={(id, feedback) => requestChanges(id, feedback)}
          onReject={(id, reason) => rejectContent(id, reason)}
        />
      )}
    </div>
  );
}
