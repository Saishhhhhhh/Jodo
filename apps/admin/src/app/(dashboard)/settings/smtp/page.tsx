'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  ShieldCheck,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  KeyRound,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { smtpApi } from '@/lib/api-client';

interface SmtpFormData {
  provider: string;
  host: string;
  port: number | string;
  username: string;
  password: string;
  encryption: 'STARTTLS' | 'TLS' | 'NONE';
  fromEmail: string;
  fromName: string;
  smtpPasswordConfigured?: boolean;
}

const PROVIDER_PRESETS: Record<string, { host: string; port: number; encryption: 'STARTTLS' | 'TLS' | 'NONE'; note: string }> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'STARTTLS',
    note: 'Use a 16-character Google App Password (not your personal account password). Two-Factor Authentication must be enabled on your Google account.',
  },
  outlook: {
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'STARTTLS',
    note: 'Requires SMTP AUTH enabled on your Microsoft 365 / Outlook mail tenant.',
  },
  ses: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'STARTTLS',
    note: 'Requires verified sender identity in AWS SES console. Ensure AWS SES sandbox restrictions are considered.',
  },
  zoho: {
    host: 'smtp.zoho.com',
    port: 465,
    encryption: 'TLS',
    note: 'Use Zoho Application-Specific Password for authenticated SMTP dispatch.',
  },
  custom: {
    host: '',
    port: 587,
    encryption: 'STARTTLS',
    note: 'Standard SMTP credentials provided by your hosting provider or transactional mail service.',
  },
};

export default function SmtpSettingsPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SmtpFormData>({
    provider: 'custom',
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'STARTTLS',
    fromEmail: '',
    fromName: 'Jodo',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Send Test Email Dialog State
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Fetch current SMTP configuration
  const { data: smtpData, isLoading } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      const res = await smtpApi.get();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (smtpData) {
      setFormData({
        provider: smtpData.provider || 'custom',
        host: smtpData.host || '',
        port: smtpData.port || 587,
        username: smtpData.username || '',
        password: '', // Never populated from backend for security
        encryption: smtpData.encryption || 'STARTTLS',
        fromEmail: smtpData.fromEmail || '',
        fromName: smtpData.fromName || 'Jodo',
        smtpPasswordConfigured: smtpData.smtpPasswordConfigured,
      });
    }
  }, [smtpData]);

  // Handle provider preset selection
  const handleProviderChange = (newProvider: string) => {
    const preset = PROVIDER_PRESETS[newProvider];
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        provider: newProvider,
        host: preset.host || prev.host,
        port: preset.port || prev.port,
        encryption: preset.encryption || prev.encryption,
      }));
    } else {
      setFormData((prev) => ({ ...prev, provider: newProvider }));
    }
    setTestResult(null);
  };

  // Save Settings Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: SmtpFormData) => {
      const res = await smtpApi.update(payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
      toast.success('SMTP settings saved successfully!', {
        description: 'Outbound emails will now use this mail configuration.',
      });
      // Clear entered password field from input since it is securely stored
      setFormData((prev) => ({ ...prev, password: '', smtpPasswordConfigured: true }));
      setTestResult(null);
    },
    onError: (err: any) => {
      toast.error('Failed to save SMTP settings', {
        description: err.response?.data?.message || err.message,
      });
    },
  });

  // Test Connection Handler
  const handleTestConnection = async () => {
    if (!formData.host || !formData.port) {
      toast.error('Please enter SMTP host and port before testing.');
      return;
    }

    try {
      setTestingConnection(true);
      setTestResult(null);

      const res = await smtpApi.test({
        provider: formData.provider,
        host: formData.host,
        port: Number(formData.port),
        username: formData.username,
        password: formData.password || undefined,
        encryption: formData.encryption,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
      });

      setTestResult({
        success: true,
        message: res.data.message || 'SMTP connection verified successfully!',
      });
      toast.success('SMTP connection verified successfully!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Connection verification failed';
      setTestResult({
        success: false,
        message: errMsg,
      });
      toast.error('SMTP Connection Failed', { description: errMsg });
    } finally {
      setTestingConnection(false);
    }
  };

  // Send Test Email Handler
  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }

    try {
      setSendingTest(true);
      const res = await smtpApi.sendTest(testRecipient.trim());
      toast.success('Test Email Sent!', {
        description: res.data.message || `Dispatched test email to ${testRecipient}`,
      });
      setTestEmailOpen(false);
      setTestRecipient('');
    } catch (err: any) {
      toast.error('Failed to Send Test Email', {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const isConfigured = Boolean(
    (formData.host && (formData.password || formData.smtpPasswordConfigured)) ||
    smtpData?.isConfigured
  );

  if (isLoading) {
    return (
      <div className="p-8 w-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading SMTP configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/settings" className="hover:text-foreground transition-colors">
          Settings
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Email / SMTP Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-primary" />
            Email / SMTP Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your outbound SMTP mail server for customer email verifications, order updates, and notifications.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {isConfigured ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SMTP Active
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Configuration Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Status Banner */}
      <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/20 shadow-xs">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Outbound Mail Infrastructure
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isConfigured
                  ? `Routing via ${formData.host}:${formData.port} (${formData.encryption}) using ${formData.username || 'configured auth'}.`
                  : 'Customer registration OTPs and transactional notifications currently require SMTP credentials.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection || saveMutation.isPending}
              className="gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setTestRecipient(formData.fromEmail || formData.username || '');
                setTestEmailOpen(true);
              }}
              disabled={!isConfigured || saveMutation.isPending}
              className="gap-1.5 text-xs font-medium"
            >
              <Send className="w-3.5 h-3.5" />
              Send Test Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Connection Result Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed animate-in fade-in-50 duration-200 ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
          )}
          <div>
            <strong className="font-semibold">
              {testResult.success ? 'Connection Succeeded:' : 'Connection Error:'}
            </strong>{' '}
            {testResult.message}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(formData);
        }}
        className="space-y-6"
      >
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              SMTP Server Details
            </CardTitle>
            <CardDescription className="text-xs">
              Select a provider preset or configure standard SMTP credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Provider Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">SMTP Provider</Label>
              <Select value={formData.provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom" className="text-xs">Custom SMTP Server</SelectItem>
                  <SelectItem value="gmail" className="text-xs">Google / Gmail SMTP</SelectItem>
                  <SelectItem value="outlook" className="text-xs">Microsoft 365 / Outlook</SelectItem>
                  <SelectItem value="ses" className="text-xs">Amazon SES SMTP</SelectItem>
                  <SelectItem value="zoho" className="text-xs">Zoho Mail</SelectItem>
                </SelectContent>
              </Select>
              {PROVIDER_PRESETS[formData.provider]?.note && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <Info className="w-3 h-3 shrink-0 text-primary" />
                  {PROVIDER_PRESETS[formData.provider].note}
                </p>
              )}
            </div>

            {/* Host and Port Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="host" className="text-xs font-semibold">
                  SMTP Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="host"
                  required
                  placeholder="e.g. smtp.gmail.com"
                  value={formData.host}
                  onChange={(e) => {
                    setFormData({ ...formData, host: e.target.value });
                    setTestResult(null);
                  }}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="port" className="text-xs font-semibold">
                  SMTP Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="port"
                  required
                  type="number"
                  placeholder="587"
                  value={formData.port}
                  onChange={(e) => {
                    setFormData({ ...formData, port: e.target.value });
                    setTestResult(null);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Username and Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold">
                  SMTP Username / Email
                </Label>
                <Input
                  id="username"
                  placeholder="e.g. notifications@jodoshop.com"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setTestResult(null);
                  }}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    SMTP Password
                  </Label>
                  {formData.smtpPasswordConfigured && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                      Password Saved
                    </Badge>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      formData.smtpPasswordConfigured
                        ? '•••••••••••• (Leave blank to keep current)'
                        : 'Enter SMTP password'
                    }
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setTestResult(null);
                    }}
                    className="h-9 text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Encryption Protocol Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Encryption / Security</Label>
              <Select
                value={formData.encryption}
                onValueChange={(val: any) => {
                  setFormData({ ...formData, encryption: val });
                  setTestResult(null);
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTTLS" className="text-xs">
                    STARTTLS (Recommended for Port 587)
                  </SelectItem>
                  <SelectItem value="TLS" className="text-xs">
                    TLS / SSL (Recommended for Port 465)
                  </SelectItem>
                  <SelectItem value="NONE" className="text-xs">
                    None (Plain text / Local debugging)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* From Sender Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-1.5">
                <Label htmlFor="fromEmail" className="text-xs font-semibold">
                  From Email Address
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="e.g. noreply@jodoshop.com"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  The email address that appears in the customer's inbox "From" line.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fromName" className="text-xs font-semibold">
                  From Sender Name
                </Label>
                <Input
                  id="fromName"
                  placeholder="e.g. Jodo"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  The friendly brand name displayed on verification and order emails.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t bg-muted/10">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Passwords are encrypted with AES-256-GCM before saving.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                size="sm"
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {saveMutation.isPending ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Send Test Email Modal */}
      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Send Real Test Email
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch a test message using your active SMTP credentials to verify inbox deliverability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="testEmailRecipient" className="text-xs font-semibold">
                Test Recipient Email Address
              </Label>
              <Input
                id="testEmailRecipient"
                type="email"
                placeholder="your-email@example.com"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              A sample verification email with Jodo branding will be dispatched immediately.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTestEmailOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendTestEmail}
              disabled={sendingTest || !testRecipient}
              className="gap-1.5 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              {sendingTest ? 'Sending Email...' : 'Send Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
