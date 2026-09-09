'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Package,
  Sparkles,
  Edit3,
  History,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AiContentItem } from '@/stores/ai-content';
import { QualityScoreBadge } from './quality-score-badge';

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AiContentItem | null;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string, feedback: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function ReviewDetailModal({
  isOpen,
  onClose,
  item,
  onApprove,
  onRequestChanges,
  onReject,
}: ReviewDetailModalProps) {
  const [activeTab, setActiveTab] = useState<string>('comparison');
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [actionType, setActionType] = useState<'request_changes' | 'reject' | null>(null);

  if (!item) return null;

  const handleApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onApprove(item.id);
      setIsSubmitting(false);
      toast.success(`Content ${item.id} approved successfully! Ready for CMS publishing.`);
      onClose();
    }, 400);
  };

  const handleActionConfirm = () => {
    if (!feedbackNotes.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      if (actionType === 'request_changes') {
        onRequestChanges(item.id, feedbackNotes);
        toast.warning(`Changes requested for ${item.id}.`);
      } else if (actionType === 'reject') {
        onReject(item.id, feedbackNotes);
        toast.error(`Content ${item.id} rejected.`);
      }
      setIsSubmitting(false);
      setShowFeedbackInput(false);
      onClose();
    }, 400);
  };

  const ai = item.generatedContent || {};
  const edited = item.editedContent || ai;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 border-b pb-4 shrink-0 bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold">
                  Review & Approval: {item.productName || item.title}
                </DialogTitle>
                <Badge variant="outline" className="text-xs uppercase font-mono">
                  {item.id}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Submitted by {item.submittedBy || item.createdBy || 'Team'} on {item.submittedAt || item.createdAt}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <QualityScoreBadge score={item.qualityScore} checks={item.qualityChecks} />
              <Badge
                className={`text-xs px-2.5 py-1 ${
                  item.status === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : item.status === 'Pending Review'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {item.status}
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-4 w-full max-w-md h-9 text-xs">
              <TabsTrigger value="comparison" className="text-xs">
                Diff & Edit
              </TabsTrigger>
              <TabsTrigger value="original" className="text-xs">
                CMS Data
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI Original
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                Versions ({item.versions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10 space-y-6">
          {/* TAB 1: Diff & Edit Comparison */}
          {activeTab === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: AI Generated Content */}
              <div className="border rounded-xl p-5 bg-card space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI Generated Draft (V1)
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Baseline</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Product Title
                    </label>
                    <p className="p-2.5 bg-muted/40 rounded-md font-medium text-foreground">
                      {ai.productTitle || ai.catalogueTitle || ai.productListingTitle || ai.campaignName || '—'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Short Description
                    </label>
                    <p className="p-2.5 bg-muted/40 rounded-md text-muted-foreground leading-relaxed">
                      {ai.shortDescription || ai.offer || '—'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      Full Description
                    </label>
                    <div className="p-2.5 bg-muted/40 rounded-md text-muted-foreground leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                      {ai.fullDescription || ai.detailedDescription || JSON.stringify(ai.email || {}, null, 2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Edited Content (Ready for Approval) */}
              <div className="border border-primary/30 rounded-xl p-5 bg-card space-y-4 shadow-sm ring-1 ring-primary/10">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="font-semibold text-xs flex items-center gap-1.5 text-primary">
                    <Edit3 className="w-3.5 h-3.5" />
                    Edited Version for Approval (V{item.version})
                  </span>
                  <Badge className="bg-primary/10 text-primary text-[10px] border-primary/20">
                    Ready to Approve
                  </Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-primary block mb-1">
                      Product Title
                    </label>
                    <p className="p-2.5 bg-primary/5 border border-primary/20 rounded-md font-medium text-foreground">
                      {edited.productTitle || edited.catalogueTitle || edited.productListingTitle || edited.campaignName}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primary block mb-1">
                      Short Description
                    </label>
                    <p className="p-2.5 bg-primary/5 border border-primary/20 rounded-md text-foreground leading-relaxed">
                      {edited.shortDescription || edited.offer}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primary block mb-1">
                      Full Description
                    </label>
                    <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-md text-foreground leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                      {edited.fullDescription || edited.detailedDescription || JSON.stringify(edited.email || {}, null, 2)}
                    </div>
                  </div>

                  {edited.keyFeatures && Array.isArray(edited.keyFeatures) && (
                    <div>
                      <label className="text-[11px] font-semibold text-primary block mb-1">
                        Key Features ({edited.keyFeatures.length})
                      </label>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        {edited.keyFeatures.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Original CMS Product Data */}
          {activeTab === 'original' && (
            <div className="border rounded-xl p-6 bg-card space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                CMS Product Ground Truth (Anti-Hallucination Source)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">Product Name</span>
                  <span className="font-bold text-foreground mt-0.5 block">{item.productName}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">SKU</span>
                  <span className="font-bold text-foreground mt-0.5 block">{item.sku || 'N/A'}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">Category</span>
                  <span className="font-bold text-foreground mt-0.5 block">{item.category || 'Furniture'}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">Retail Price</span>
                  <span className="font-bold text-foreground mt-0.5 block">₹{item.price?.toLocaleString('en-IN') || '—'}</span>
                </div>
              </div>
              <div className="p-4 bg-muted/20 border rounded-lg text-xs space-y-1.5">
                <span className="font-semibold text-muted-foreground">Target Audience:</span>
                <p className="text-foreground">{item.targetAudience || 'General Luxury Consumer'}</p>
                <span className="font-semibold text-muted-foreground block pt-2">SEO Keywords Configured:</span>
                <p className="text-foreground">{item.seoKeywords?.join(', ') || 'None provided'}</p>
              </div>
            </div>
          )}

          {/* TAB 3: Full AI Raw */}
          {activeTab === 'ai' && (
            <div className="border rounded-xl p-6 bg-card space-y-3 text-xs">
              <h4 className="font-semibold text-sm">Full AI Generated Output Payload</h4>
              <pre className="p-4 bg-muted/40 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
                {JSON.stringify(ai, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 4: Version History */}
          {activeTab === 'history' && (
            <div className="border rounded-xl p-6 bg-card space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Version Timeline & Audit Trail
              </h4>
              <div className="space-y-3">
                {item.versions.map((ver) => (
                  <div key={ver.version} className="p-3.5 border rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">Version {ver.version}</span>
                        <Badge variant="outline" className="text-[10px]">{ver.action}</Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Modified by {ver.modifiedBy} on {ver.date}
                      </p>
                    </div>
                    {ver.qualityScore && (
                      <span className="font-semibold text-emerald-600">
                        Score: {ver.qualityScore}/100
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Input when requesting changes or rejecting */}
          {showFeedbackInput && (
            <div className="p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  {actionType === 'request_changes' ? 'Specify Changes Required' : 'Reason for Rejection'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFeedbackInput(false)}
                  className="text-muted-foreground hover:text-foreground text-[11px]"
                >
                  Cancel
                </button>
              </div>
              <Textarea
                placeholder={
                  actionType === 'request_changes'
                    ? 'e.g. Tone is slightly too informal; please emphasize solid wood care and add 2 bullet points.'
                    : 'e.g. Incompatible with seasonal campaign positioning.'
                }
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="h-20 text-xs resize-none"
              />
              <Button
                size="sm"
                onClick={handleActionConfirm}
                disabled={!feedbackNotes.trim() || isSubmitting}
                className={actionType === 'request_changes' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
              >
                {actionType === 'request_changes' ? 'Submit Changes Request' : 'Confirm Rejection'}
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <DialogFooter className="p-4 border-t bg-background flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground">
            Strict human approval workflow active.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionType('reject');
                setShowFeedbackInput(true);
              }}
              disabled={isSubmitting}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionType('request_changes');
                setShowFeedbackInput(true);
              }}
              disabled={isSubmitting}
              className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 border-amber-200"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              Request Changes
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className={`w-3.5 h-3.5 mr-1 ${isSubmitting ? 'animate-spin' : ''}`} />
              Approve Content
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
