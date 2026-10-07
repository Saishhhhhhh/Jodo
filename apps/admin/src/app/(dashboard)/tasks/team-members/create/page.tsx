'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckSquare,
  LayoutDashboard,
  Store,
  ShoppingCart,
  Users,
  Target,
  Warehouse,
  Sparkles,
  Megaphone,
  MessageSquare,
  Image as ImageIcon,
  BookOpen,
  BarChart3,
  Settings,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  Sparkle,
  Layers,
  UserPlus,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface ModuleDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  subfeatures: string[];
  icon: React.ComponentType<{ className?: string }>;
  isCore?: boolean;
}

const AVAILABLE_MODULES: ModuleDefinition[] = [
  {
    id: 'tasks',
    name: 'Tasks Management',
    category: 'Core Operations',
    description: 'Assigned tasks, statuses, remarks, proof attachments, and completion logs.',
    subfeatures: ['My Tasks', 'Completed Tasks', 'Remarks', 'Status Flow'],
    icon: CheckSquare,
    isCore: true,
  },
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    category: 'Overview',
    description: 'Executive overview, sales summaries, store KPIs, and live activity feeds.',
    subfeatures: ['KPI Summary', 'Revenue Analytics', 'Recent Orders', 'Daily Trends'],
    icon: LayoutDashboard,
  },
  {
    id: 'store',
    name: 'Store & Catalogue',
    category: 'Commerce',
    description: 'Products catalogue, collections, inventory adjustments, and reviews.',
    subfeatures: ['Products', 'Collections', 'Inventory Levels', 'Gift Cards', 'Reviews'],
    icon: Store,
  },
  {
    id: 'orders',
    name: 'Orders & Fulfilment',
    category: 'Commerce',
    description: 'Process incoming orders, draft orders, returns, and shipping labels.',
    subfeatures: ['All Orders', 'Draft Orders', 'Returns & Complaints', 'Shipping Labels'],
    icon: ShoppingCart,
  },
  {
    id: 'customers',
    name: 'Customers & Loyalty',
    category: 'Customers',
    description: 'Customer profiles, segment classification, loyalty tiers, and customer wallets.',
    subfeatures: ['Customer Directory', 'Segments', 'Loyalty Rewards', 'Wallets'],
    icon: Users,
  },
  {
    id: 'leads',
    name: 'CRM & Sales Leads',
    category: 'Sales',
    description: 'Sales leads management, pipeline stages, client inquiries, and status follow-ups.',
    subfeatures: ['Leads Pipeline', 'Lead Stages', 'Follow-up Reminders', 'Inquiry Details'],
    icon: Target,
  },
  {
    id: 'warehouse',
    name: 'Warehouse & Operations',
    category: 'Supply Chain',
    description: 'Procurement logs, contract manufacturers, production batches, and QC inspections.',
    subfeatures: ['Procurement', 'Contract Manufacturers', 'Production Orders', 'Quality Checks'],
    icon: Warehouse,
  },
  {
    id: 'ai-content',
    name: 'AI Content Studio',
    category: 'Content',
    description: 'AI-assisted product descriptions, marketing campaigns, and review approvals.',
    subfeatures: ['Product Copy', 'Catalogue Content', 'Listing Copy', 'Approval Queue'],
    icon: Sparkles,
  },
  {
    id: 'marketing',
    name: 'Marketing & Campaigns',
    category: 'Growth',
    description: 'Discount codes, promotional campaigns, and automated marketing email broadcasts.',
    subfeatures: ['Discount Coupons', 'Campaigns', 'Marketing Emails'],
    icon: Megaphone,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Communications',
    category: 'Communications',
    description: 'Customer WhatsApp messaging, template broadcasts, and automated notifications.',
    subfeatures: ['Live Chat', 'Template Broadcasts', 'Automated Updates'],
    icon: MessageSquare,
  },
  {
    id: 'content',
    name: 'Media & Site Content',
    category: 'Storefront',
    description: 'Storefront promotional banners, media asset library, and navigation links.',
    subfeatures: ['Banner Sliders', 'Media Library', 'Navigation Menus'],
    icon: ImageIcon,
  },
  {
    id: 'blog',
    name: 'Blog Posts & FAQs',
    category: 'Content & Help',
    description: 'Educational articles, blog stories, and customer FAQ entries.',
    subfeatures: ['Articles & Stories', 'FAQ Accordions', 'Help Centre'],
    icon: BookOpen,
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    category: 'Business Intelligence',
    description: 'Sales analytics, product performance metrics, customer cohorts, and digests.',
    subfeatures: ['Sales Analytics', 'Product Performance', 'Reports & Digest'],
    icon: BarChart3,
  },
  {
    id: 'settings',
    name: 'Settings & Administration',
    category: 'Administration',
    description: 'Store configurations, staff permissions, payment gateways, and audit logs.',
    subfeatures: ['Store Details', 'Staff & Permissions', 'Payment Gateways', 'Audit Logs'],
    icon: Settings,
  },
];

const PRESETS = [
  {
    label: 'Tasks Only (Default)',
    modules: ['tasks'],
    description: 'Minimal access: only assigned tasks and completion records',
  },
  {
    label: 'Sales & CRM',
    modules: ['tasks', 'leads', 'customers', 'orders', 'whatsapp'],
    description: 'Ideal for sales agents and customer relationship managers',
  },
  {
    label: 'Warehouse & Operations',
    modules: ['tasks', 'warehouse', 'orders', 'store'],
    description: 'Ideal for procurement, inventory, and order dispatch teams',
  },
  {
    label: 'Content & Marketing',
    modules: ['tasks', 'ai-content', 'marketing', 'content', 'blog'],
    description: 'Ideal for copywriters, marketers, and creative staff',
  },
  {
    label: 'Full Access (All Modules)',
    modules: AVAILABLE_MODULES.map((m) => m.id),
    description: 'Unrestricted access to all modules in the admin portal',
  },
];

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('Sales');
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Module Access State (Tasks is enabled by default)
  const [selectedModules, setSelectedModules] = useState<string[]>(['tasks']);

  // Pre-generate a default Member ID on load
  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setMemberId(`TM${randomNum}`);
  }, []);

  const toggleModule = (id: string) => {
    if (id === 'tasks') return; // Core module cannot be disabled
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const applyPreset = (modules: string[]) => {
    setSelectedModules(Array.from(new Set(['tasks', ...modules])));
    toast.info('Applied preset access permissions');
  };

  const selectAll = () => {
    setSelectedModules(AVAILABLE_MODULES.map((m) => m.id));
    toast.info('All modules selected');
  };

  const resetToTasks = () => {
    setSelectedModules(['tasks']);
    toast.info('Reset permissions to Tasks only');
  };

  const generateMemberId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const prefix = team ? team.substring(0, 2).toUpperCase() : 'TM';
    setMemberId(`${prefix}${randomNum}`);
    toast.info(`Generated Member ID: ${prefix}${randomNum}`);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the team member full name');
      return;
    }
    if (!memberId.trim()) {
      toast.error('Please provide a Member ID');
      return;
    }
    if (!password) {
      toast.error('Please enter a login password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/admin/team-members', {
        name: name.trim(),
        memberId: memberId.trim().toUpperCase(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        team,
        status,
        password,
        moduleAccess: selectedModules,
      });

      toast.success(`Team Member "${name}" created successfully!`);
      router.push('/tasks/team-members');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full pb-16 bg-muted/10">
      {/* Top Fullwidth Sticky Navigation Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/tasks/team-members">
              <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5 text-xs font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Create Team Member
                </h1>
                <Badge variant="outline" className="text-[11px] font-mono border-primary/30 text-primary bg-primary/5">
                  Full Width Setup
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure account credentials and granular module access permissions for this team member.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/tasks/team-members">
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading}
              size="sm"
              className="text-xs font-semibold px-4 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Creating Member...
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 mr-2" />
                  Save & Create Team Member
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Fullwidth Content */}
      <div className="w-full px-6 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Unified Account Details & Security Card (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-5">
                {/* Header */}
                <div className="border-b border-border/80 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Account & Credentials
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Member profile and login credentials.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium">
                    Required Fields *
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Full Name & Member ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">
                          Member ID <span className="text-destructive">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={generateMemberId}
                          className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Sparkle className="w-3 h-3" /> Auto
                        </button>
                      </div>
                      <Input
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                        placeholder="e.g. TM001"
                        required
                        className="text-xs font-mono font-semibold tracking-wider uppercase bg-muted/20"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Email Address (Optional)</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Phone Number (Optional)</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Team & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Department / Team</Label>
                      <select
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer"
                      >
                        {['Sales', 'Operations', 'Warehouse', 'Content', 'Support', 'Follow-up', 'Finance'].map((t) => (
                          <option key={t} value={t} className="bg-popover text-popover-foreground">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Account Status</Label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer"
                      >
                        <option value="active" className="bg-popover text-popover-foreground">Active</option>
                        <option value="inactive" className="bg-popover text-popover-foreground">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Credentials Section */}
                  <div className="pt-3 border-t border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-primary" />
                        Login Password
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Confirm Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm"
                          required
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Fullwidth Module Access Matrix (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-5">
                {/* Header & Presets */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        Module Access Permissions
                      </h2>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {selectedModules.length} of {AVAILABLE_MODULES.length} Selected
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Toggle specific sections of the portal this team member will have permission to view and manage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs h-8"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetToTasks}
                      className="text-xs h-8 text-muted-foreground hover:text-foreground"
                    >
                      Tasks Only
                    </Button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="bg-muted/40 rounded-xl p-3 border border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Quick Access Presets:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => {
                      const isActive =
                        p.modules.length === selectedModules.length &&
                        p.modules.every((m) => selectedModules.includes(m));

                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => applyPreset(p.modules)}
                          title={p.description}
                          className={cn(
                            'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150 text-left flex items-center gap-1.5 cursor-pointer',
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background hover:bg-muted text-foreground border-border hover:border-border/80'
                          )}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid of Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {AVAILABLE_MODULES.map((module) => {
                    const isSelected = selectedModules.includes(module.id);
                    const Icon = module.icon;

                    return (
                      <div
                        key={module.id}
                        onClick={() => toggleModule(module.id)}
                        className={cn(
                          'relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between group',
                          isSelected
                            ? 'bg-primary/5 border-primary/60 shadow-xs ring-1 ring-primary/20'
                            : 'bg-card border-border hover:border-border/80 hover:bg-muted/30'
                        )}
                      >
                        <div>
                          {/* Header of Card */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'bg-muted text-muted-foreground group-hover:text-foreground'
                                )}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  {module.name}
                                  {module.isCore && (
                                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/40 text-primary">
                                      Core
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-[10px] text-muted-foreground">
                                  {module.category}
                                </p>
                              </div>
                            </div>

                            {/* Stop propagation so clicking the switch does NOT double-toggle */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (module.isCore) return;
                                  if (checked) {
                                    setSelectedModules((prev) => Array.from(new Set([...prev, module.id])));
                                  } else {
                                    setSelectedModules((prev) => prev.filter((m) => m !== module.id));
                                  }
                                }}
                                disabled={module.isCore}
                                className="data-[state=checked]:bg-primary cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                            {module.description}
                          </p>
                        </div>

                        {/* Subfeatures Tag List */}
                        <div className="pt-2.5 mt-2.5 border-t border-border/40 flex flex-wrap gap-1">
                          {module.subfeatures.map((feat) => (
                            <span
                              key={feat}
                              className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                isSelected
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted/60 text-muted-foreground'
                              )}
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fullwidth Action Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {name || 'New Member'} ({memberId || 'TM—'})
              </span>
              <span>•</span>
              <span>Team: {team}</span>
              <span>•</span>
              <span className="text-primary font-medium">
                {selectedModules.length} Modules Permitted
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/tasks/team-members">
                <Button type="button" variant="outline" size="sm" className="text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="text-xs font-semibold px-5"
              >
                {loading ? 'Creating...' : 'Create Team Member'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
