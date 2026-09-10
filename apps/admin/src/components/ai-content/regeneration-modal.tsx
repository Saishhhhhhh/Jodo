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
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface RegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (instruction: string) => void;
  title?: string;
}

const PRESET_OPTIONS = [
  { label: 'Make Shorter', desc: 'Condense into punchy, concise copy' },
  { label: 'Make Longer', desc: 'Elaborate on details and craftsmanship' },
  { label: 'More Premium', desc: 'Infuse high-end luxury and artisanal vocabulary' },
  { label: 'More Professional', desc: 'Refined, architectural and commercial tone' },
  { label: 'More SEO Friendly', desc: 'Maximize natural search intent keywords' },
  { label: 'More Engaging', desc: 'Vibrant, dynamic, and lifestyle-oriented' },
  { label: 'Simplify', desc: 'Clarity, direct benefit bullets, accessible terms' },
];

export function RegenerationModal({
  isOpen,
  onClose,
  onRegenerate,
  title = 'Regenerate Content with AI',
}: RegenerationModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('More Premium');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleApply = () => {
    setIsGenerating(true);
    const finalInstruction = customPrompt.trim() ? customPrompt.trim() : selectedPreset;
    setTimeout(() => {
      onRegenerate(finalInstruction);
      setIsGenerating(false);
      toast.info(`Regenerated draft with instruction: "${finalInstruction}"`);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            Choose a refinement preset or enter a custom prompt. A new version will be created without overwriting your existing draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Refinement Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_OPTIONS.map((preset) => {
                const isSelected = selectedPreset === preset.label && !customPrompt.trim();
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset.label);
                      setCustomPrompt('');
                    }}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary text-foreground font-medium'
                        : 'border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Wand2 className="w-3 h-3 text-primary" />
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {preset.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Custom Instruction (Optional)
            </label>
            <Textarea
              placeholder='e.g., "Make this description more premium and focus on wedding gifting and durability."'
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-xs h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isGenerating}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Regenerating...' : 'Regenerate Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
