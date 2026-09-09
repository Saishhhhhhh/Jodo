'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone,
  Mail,
  MessageSquare,
  Instagram,
  Globe,
  Smartphone,
  Sparkles,
  Save,
  Send,
  CheckCircle2,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { QualityScoreBadge } from '@/components/ai-content/quality-score-badge';
import { RegenerationModal } from '@/components/ai-content/regeneration-modal';
import { PublishConfirmationModal } from '@/components/ai-content/publish-confirmation-modal';

const CAMPAIGN_TYPES = [
  'New Collection',
  'Product Launch',
  'Festival',
  'Sale',
  'Promotion',
  'Re-engagement',
  'Seasonal Campaign',
];

const CAMPAIGN_TONES = ['Luxury', 'Elegant', 'Exciting', 'Minimal', 'Friendly', 'Urgent'];

export default function CampaignContentPage() {
  const { items, generateContent, saveDraft, submitForReview, publishToCms } = useAiContentStore();

  const [campaignType, setCampaignType] = useState('Festival');
  const [campaignName, setCampaignName] = useState('Diwali Festive Curation 2026');
  const [offer, setOffer] = useState('Flat 15% Festive Privilege + Complimentary Styling Advice');
  const [discount, setDiscount] = useState('15%');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-11-05');
  const [targetAudience, setTargetAudience] = useState('High net worth patrons and repeat luxury design buyers');
  const [objective, setObjective] = useState('Drive holiday season conversions & showcase new dining suites');
  const [tone, setTone] = useState('Luxury');

  const [isGenerating, setIsGenerating] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Active campaign item
  const existingCampaign = items.find((i) => i.contentType === 'campaign_content') || items[2] || items[0];
  const [activeItem, setActiveItem] = useState<AiContentItem>(existingCampaign);

  // Editable states per channel
  const content = activeItem.editedContent || activeItem.generatedContent || {};

  const [emailSubject, setEmailSubject] = useState(content.email?.subject || '✨ Exclusive: Diwali Festive Curation');
  const [emailPreheader, setEmailPreheader] = useState(content.email?.preheader || 'Curated architectural pieces for illuminated celebrations.');
  const [emailHeadline, setEmailHeadline] = useState(content.email?.headline || 'Welcome Prosperity with Timeless Architectural Living');
  const [emailBody, setEmailBody] = useState(content.email?.body || 'Dear Patron,\n\nAs the festival of illumination approaches, home becomes the sacred canvas for warmth, celebration, and cherished hospitality.\n\nIntroducing the JODO Diwali Curation — a bespoke portfolio of solid teak dining ensembles, sculptured accent seating, and ambient brass illumination.\n\nEnjoy an exclusive 15% Festive Privilege.');
  const [emailCta, setEmailCta] = useState(content.email?.cta || 'Explore The Festive Atelier');

  const [whatsappMsg, setWhatsappMsg] = useState(content.whatsapp?.message || 'Shubh Deepavali from JODO! 🪔✨\n\nCelebrate refined living with our handcrafted festive collection. From artisanal solid wood dining tables to statement lounge armchairs, each piece brings warmth and heirloom grace.\n\n🎁 Special Privilege: Flat 15% Festive Privilege.');
  const [whatsappCta, setWhatsappCta] = useState(content.whatsapp?.cta || 'View Private Showcase');

  const [igCaption, setIgCaption] = useState(content.instagram?.caption || 'When festive light reflects upon hand-rubbed Burma teak and brushed brass. 🪔✨\n\nThe JODO Diwali Festive Curation is now open for private viewings and nationwide white-glove delivery.\n\nDiscover pieces designed to hold generations of laughter and golden memories.');
  const [igHashtags, setIgHashtags] = useState(
    Array.isArray(content.instagram?.hashtags) ? content.instagram.hashtags.join(' ') : '#JODOLuxury #Diwali2026 #FestiveLiving #TeakFurniture'
  );
  const [igCta, setIgCta] = useState(content.instagram?.cta || 'Experience Collection in Bio');

  const [webHeadline, setWebHeadline] = useState(content.website?.campaignHeadline || 'The Festive Atelier: Illuminating Modern Sanctuary');
  const [webSubheading, setWebSubheading] = useState(content.website?.subheading || 'Heirloom craftsmanship for life’s most luminous gatherings. Enjoy 15% Festive Privilege.');
  const [webBanner, setWebBanner] = useState(content.website?.bannerCopy || 'Curated dining, sculptural seating, and ambient lighting engineered for festive warmth and lasting memories.');
  const [webCta, setWebCta] = useState(content.website?.cta || 'Shop Festive Atelier');

  const [smsText, setSmsText] = useState(content.sms?.text || 'JODO Diwali Privilege: Elevate your home celebrations with 15% festive savings + complimentary styling advice: https://jodo.store/diwali');

  const handleGenerateCampaign = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newItem = generateContent({
        contentType: 'campaign_content',
        campaign: {
          name: campaignName,
          type: campaignType,
          offer,
          discount,
          startDate,
          endDate,
          targetAudience,
          objective,
        },
        tone,
      });

      setActiveItem(newItem);
      const c = newItem.generatedContent;
      if (c.email) {
        setEmailSubject(c.email.subject);
        setEmailPreheader(c.email.preheader);
        setEmailHeadline(c.email.headline);
        setEmailBody(c.email.body);
        setEmailCta(c.email.cta);
      }
      if (c.whatsapp) {
        setWhatsappMsg(c.whatsapp.message);
        setWhatsappCta(c.whatsapp.cta);
      }
      if (c.instagram) {
        setIgCaption(c.instagram.caption);
        setIgHashtags(Array.isArray(c.instagram.hashtags) ? c.instagram.hashtags.join(' ') : '#JODOHome');
        setIgCta(c.instagram.cta);
      }
      if (c.website) {
        setWebHeadline(c.website.campaignHeadline);
        setWebSubheading(c.website.subheading);
        setWebBanner(c.website.bannerCopy);
        setWebCta(c.website.cta);
      }
      if (c.sms) {
        setSmsText(c.sms.text);
      }

      setIsGenerating(false);
      toast.success(`Multi-channel campaign content generated for "${campaignName}"!`);
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        }
      }, 150);
    }, 800);
  };

  const handleSaveCampaignDraft = () => {
    const updatedPayload = {
      campaignName,
      campaignType,
      offer,
      email: { subject: emailSubject, preheader: emailPreheader, headline: emailHeadline, body: emailBody, cta: emailCta },
      whatsapp: { message: whatsappMsg, offer, cta: whatsappCta },
      instagram: { caption: igCaption, hashtags: igHashtags.split(' ').filter(Boolean), cta: igCta },
      website: { campaignHeadline: webHeadline, subheading: webSubheading, bannerCopy: webBanner, cta: webCta },
      sms: { text: smsText },
    };

    saveDraft(activeItem.id, updatedPayload);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSendForReview = () => {
    handleSaveCampaignDraft();
    submitForReview(activeItem.id, 'Marketing Lead');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Campaign Content
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              Omni-Channel Marketing AI
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate cohesive multi-channel marketing copy across Email, WhatsApp, Instagram, Website banners, and SMS.
          </p>
        </div>
      </div>

      {/* Input Configuration Form (Section 8) */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Campaign Setup & Strategy
          </span>
          <span className="text-xs text-muted-foreground">Omni-Channel Synchronization</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Campaign Name</label>
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="text-xs" />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Campaign Type</label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
            >
              {CAMPAIGN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
            >
              {CAMPAIGN_TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-muted-foreground block mb-1">Special Offer / Privilege</label>
            <Input value={offer} onChange={(e) => setOffer(e.target.value)} className="text-xs" />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Discount Tag</label>
            <Input value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-xs" />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-muted-foreground block mb-1">Target Audience</label>
            <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="text-xs" />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Campaign Objective</label>
            <Input value={objective} onChange={(e) => setObjective(e.target.value)} className="text-xs" />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t">
          <Button
            type="button"
            onClick={handleGenerateCampaign}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold text-xs px-6"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating Multi-Channel Copy...' : 'Generate Campaign Content'}
          </Button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Campaign draft updated across all channels.
        </div>
      )}

      {/* Multi-Channel AI Output (Section 9) */}
      <div ref={resultRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">Campaign Output by Channel</h2>
            <QualityScoreBadge score={activeItem.qualityScore} checks={activeItem.qualityChecks} />
            <Badge variant="outline" className="text-xs">{activeItem.status}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveCampaignDraft}
              className="gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5 text-primary" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSendForReview}
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-3.5 h-3.5" />
              Send for Review
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <Tabs defaultValue="email" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl h-10 text-xs">
              <TabsTrigger value="email" className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5" /> Email
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center gap-1.5 text-xs">
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </TabsTrigger>
              <TabsTrigger value="website" className="flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5" /> Website
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-1.5 text-xs">
                <Smartphone className="w-3.5 h-3.5" /> SMS
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Email */}
            <TabsContent value="email" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Email Subject</label>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Pre-header</label>
                <Input value={emailPreheader} onChange={(e) => setEmailPreheader(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Headline</label>
                <Input value={emailHeadline} onChange={(e) => setEmailHeadline(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Email Body</label>
                <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="text-xs h-36 resize-none" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Call to Action (CTA)</label>
                <Input value={emailCta} onChange={(e) => setEmailCta(e.target.value)} className="text-xs" />
              </div>
            </TabsContent>

            {/* TAB 2: WhatsApp */}
            <TabsContent value="whatsapp" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Short WhatsApp Message</label>
                <Textarea value={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.value)} className="text-xs h-36 resize-none" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Call to Action</label>
                <Input value={whatsappCta} onChange={(e) => setWhatsappCta(e.target.value)} className="text-xs" />
              </div>
            </TabsContent>

            {/* TAB 3: Instagram */}
            <TabsContent value="instagram" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Instagram Caption</label>
                <Textarea value={igCaption} onChange={(e) => setIgCaption(e.target.value)} className="text-xs h-36 resize-none" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Hashtags</label>
                <Input value={igHashtags} onChange={(e) => setIgHashtags(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CTA</label>
                <Input value={igCta} onChange={(e) => setIgCta(e.target.value)} className="text-xs" />
              </div>
            </TabsContent>

            {/* TAB 4: Website */}
            <TabsContent value="website" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Campaign Headline</label>
                <Input value={webHeadline} onChange={(e) => setWebHeadline(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Subheading</label>
                <Input value={webSubheading} onChange={(e) => setWebSubheading(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Banner Copy</label>
                <Textarea value={webBanner} onChange={(e) => setWebBanner(e.target.value)} className="text-xs h-20 resize-none" />
              </div>
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CTA</label>
                <Input value={webCta} onChange={(e) => setWebCta(e.target.value)} className="text-xs" />
              </div>
            </TabsContent>

            {/* TAB 5: SMS */}
            <TabsContent value="sms" className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Short Promotional Text (SMS)</label>
                <Textarea value={smsText} onChange={(e) => setSmsText(e.target.value)} className="text-xs h-24 resize-none" />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
