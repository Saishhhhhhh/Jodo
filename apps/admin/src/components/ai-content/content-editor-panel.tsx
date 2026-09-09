'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  RefreshCw,
  Save,
  Send,
  Edit2,
  Check,
  Eye,
  Globe,
  Tag,
  Package,
  Layers,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { QualityScoreBadge } from './quality-score-badge';
import { RegenerationModal } from './regeneration-modal';
import { PublishConfirmationModal } from './publish-confirmation-modal';
import { VersionHistoryDrawer } from './version-history-drawer';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';

interface ContentEditorPanelProps {
  item: AiContentItem;
  onUpdate?: () => void;
}

export function ContentEditorPanel({ item }: ContentEditorPanelProps) {
  const { saveDraft, submitForReview, regenerateContent, publishToCms } = useAiContentStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Form editable states
  const initialContent = item.editedContent || item.generatedContent || {};
  const [title, setTitle] = useState(initialContent.productTitle || initialContent.catalogueTitle || initialContent.productListingTitle || initialContent.campaignName || item.title);
  const [shortDescription, setShortDescription] = useState(initialContent.shortDescription || initialContent.offer || '');
  const [fullDescription, setFullDescription] = useState(initialContent.fullDescription || initialContent.detailedDescription || (initialContent.email ? initialContent.email.body : ''));
  const [keyFeaturesStr, setKeyFeaturesStr] = useState(
    Array.isArray(initialContent.keyFeatures)
      ? initialContent.keyFeatures.join('\n')
      : Array.isArray(initialContent.bulletPoints)
      ? initialContent.bulletPoints.join('\n')
      : ''
  );
  const [seoMetaTitle, setSeoMetaTitle] = useState(initialContent.seoMetaTitle || initialContent.metaTitle || '');
  const [seoMetaDescription, setSeoMetaDescription] = useState(initialContent.seoMetaDescription || initialContent.metaDescription || '');

  // Reset local state whenever a new item is selected or generated
  React.useEffect(() => {
    const fresh = item.editedContent || item.generatedContent || {};
    setTitle(fresh.productTitle || fresh.catalogueTitle || fresh.productListingTitle || fresh.campaignName || item.title || '');
    setShortDescription(fresh.shortDescription || fresh.offer || '');
    setFullDescription(fresh.fullDescription || fresh.detailedDescription || (fresh.email ? fresh.email.body : ''));
    setKeyFeaturesStr(
      Array.isArray(fresh.keyFeatures)
        ? fresh.keyFeatures.join('\n')
        : Array.isArray(fresh.bulletPoints)
        ? fresh.bulletPoints.join('\n')
        : ''
    );
    setSeoMetaTitle(fresh.seoMetaTitle || fresh.metaTitle || '');
    setSeoMetaDescription(fresh.seoMetaDescription || fresh.metaDescription || '');
    setIsEditing(false);
  }, [item]);

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveDraft = () => {
    const updatedContent = {
      ...initialContent,
      productTitle: title,
      shortDescription,
      fullDescription,
      keyFeatures: keyFeaturesStr.split('\n').map((s) => s.trim()).filter(Boolean),
      seoMetaTitle,
      seoMetaDescription,
    };
    saveDraft(item.id, updatedContent);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSendForReview = () => {
    handleSaveDraft();
    submitForReview(item.id, 'Admin');
  };

  const handleRegenerate = (instruction: string) => {
    regenerateContent(item.id, instruction);
  };

  const handlePublishConfirm = async () => {
    await publishToCms(item.id, 'Admin');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-card rounded-xl border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge
            className={`text-xs px-3 py-1 font-medium ${
              item.status === 'Approved'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : item.status === 'Pending Review'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : item.status === 'Published'
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                : item.status === 'Changes Requested'
                ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {item.status}
          </Badge>
          <QualityScoreBadge score={item.qualityScore} checks={item.qualityChecks} />
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(true)}
            className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 border rounded-md px-2.5 py-1 bg-background hover:bg-muted/40 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            Version {item.version}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegenModal(true)}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            Regenerate
          </Button>

          <Button
            variant={isEditing ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-1.5 text-xs"
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {isEditing ? 'Preview Mode' : 'Edit Content'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5 text-primary" />
            Save Draft
          </Button>

          {item.status !== 'Approved' && item.status !== 'Published' && (
            <Button
              size="sm"
              onClick={handleSendForReview}
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-3.5 h-3.5" />
              Send for Review
            </Button>
          )}

          {/* STRICT REQUIREMENT: Only Approved content displays Publish to CMS */}
          {item.status === 'Approved' && (
            <Button
              size="sm"
              onClick={() => setShowPublishModal(true)}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              Publish to CMS
            </Button>
          )}
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Draft updated and new version saved successfully.
        </div>
      )}

      {/* Side-by-Side: Product Information (Left) vs AI Generated/Edited Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Product Information (CMS Ground Truth) */}
        <div className="lg:col-span-4 bg-card rounded-xl border p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Product Information</h3>
          </div>

          {item.imageUrl && (
            <div className="rounded-lg overflow-hidden border aspect-video bg-muted/20 relative">
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Product Name</span>
              <span className="font-semibold text-foreground">{item.productName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px]">SKU</span>
                <span className="font-medium text-foreground">{item.sku || 'JD-CHR-001'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Category</span>
                <span className="font-medium text-foreground">{item.category || 'Living Room'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px]">Retail Price</span>
                <span className="font-semibold text-emerald-600">₹{item.price?.toLocaleString('en-IN') || '24,999'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Tone / Length</span>
                <span className="font-medium text-foreground">{item.tone} ({item.length})</span>
              </div>
            </div>

            <div className="border-t pt-2.5 space-y-1.5">
              <span className="text-muted-foreground block text-[11px] font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3 text-primary" /> SEO Keywords
              </span>
              <div className="flex flex-wrap gap-1">
                {item.seoKeywords && item.seoKeywords.length > 0 ? (
                  item.seoKeywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-[11px]">No keywords configured</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Generated / Editable Content */}
        <div className="lg:col-span-8 bg-card rounded-xl border p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm">
                {isEditing ? 'Edit Content' : 'AI Generated Content'}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {isEditing ? 'Changes auto-saved as new version upon Save' : 'Previewing generated draft'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Field 1: Title */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Product Title
              </label>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs font-semibold"
                />
              ) : (
                <div className="p-3 bg-muted/20 border rounded-lg text-xs font-semibold text-foreground">
                  {title}
                </div>
              )}
            </div>

            {/* Field 2: Short Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Short Description
              </label>
              {isEditing ? (
                <Textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="text-xs h-20 resize-none"
                />
              ) : (
                <div className="p-3 bg-muted/20 border rounded-lg text-xs text-muted-foreground leading-relaxed">
                  {shortDescription}
                </div>
              )}
            </div>

            {/* Field 3: Full Description */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Full Description
              </label>
              {isEditing ? (
                <Textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="text-xs h-40 resize-none font-sans leading-relaxed"
                />
              ) : (
                <div className="p-3 bg-muted/20 border rounded-lg text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {fullDescription}
                </div>
              )}
            </div>

            {/* Field 4: Key Features */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Key Features (One per line)
              </label>
              {isEditing ? (
                <Textarea
                  value={keyFeaturesStr}
                  onChange={(e) => setKeyFeaturesStr(e.target.value)}
                  className="text-xs h-28 resize-none font-mono"
                />
              ) : (
                <div className="p-3 bg-muted/20 border rounded-lg text-xs">
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {keyFeaturesStr.split('\n').filter(Boolean).map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Field 5: SEO Meta Description */}
            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-bold text-foreground block">
                SEO Search Engine Optimization
              </span>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  SEO Meta Title
                </label>
                {isEditing ? (
                  <Input
                    value={seoMetaTitle}
                    onChange={(e) => setSeoMetaTitle(e.target.value)}
                    className="text-xs"
                  />
                ) : (
                  <div className="p-2.5 bg-muted/20 border rounded-md text-xs text-foreground font-medium">
                    {seoMetaTitle || '—'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  SEO Meta Description
                </label>
                {isEditing ? (
                  <Textarea
                    value={seoMetaDescription}
                    onChange={(e) => setSeoMetaDescription(e.target.value)}
                    className="text-xs h-16 resize-none"
                  />
                ) : (
                  <div className="p-2.5 bg-muted/20 border rounded-md text-xs text-muted-foreground leading-relaxed">
                    {seoMetaDescription || '—'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegenerationModal
        isOpen={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        onRegenerate={handleRegenerate}
      />

      <PublishConfirmationModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublishConfirm}
        item={item}
      />

      <VersionHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        versions={item.versions || []}
        contentId={item.id}
      />
    </div>
  );
}
