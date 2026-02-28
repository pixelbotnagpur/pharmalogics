'use client';

import { useState, useEffect } from 'react';
import { 
  useFirestore, 
  useDoc, 
  useMemoFirebase, 
  useCollection,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus, 
  Trash2, 
  Globe, 
  Tag, 
  DollarSign, 
  Percent, 
  Loader2, 
  Settings as SettingsIcon,
  Palette,
  Upload,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatusDialog } from '@/components/common/StatusDialog';
import type { StoreSettings, Coupon } from '@/lib/types';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pharmlogics';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

export default function AdminSettingsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Status Dialog State
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', desc: '' });

  // Settings Data from Cloud
  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'store'), [db]);
  const { data: settings, isLoading: settingsLoading } = useDoc<StoreSettings>(settingsRef);

  // Coupons Data
  const couponsQuery = useMemoFirebase(() => collection(db, 'coupons'), [db]);
  const { data: coupons, isLoading: couponsLoading } = useCollection<Coupon>(couponsQuery);

  // Local State for Controlled Inputs
  const [formData, setFormData] = useState<any>({
    storeName: '',
    logoUrl: '',
    logoWhiteUrl: '',
    faviconUrl: '',
    currencySymbol: '$',
    currencyCode: 'USD',
    taxRate: 0,
    standardShippingRate: 0,
    freeShippingThreshold: 0,
    primaryColor: '',
    backgroundColor: '',
    accentColor: '',
    secondaryColor: '',
    foregroundColor: '',
    mutedColor: '',
    cardColor: '',
    borderColor: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    active: true
  });

  // Sync local state when cloud data arrives
  useEffect(() => {
    if (settings) {
      setFormData({
        ...settings,
        storeName: settings.storeName || '',
        logoUrl: settings.logoUrl || '',
        logoWhiteUrl: settings.logoWhiteUrl || '',
        faviconUrl: settings.faviconUrl || '',
        currencySymbol: settings.currencySymbol || '$',
        currencyCode: settings.currencyCode || 'USD',
        primaryColor: settings.primaryColor || '',
        backgroundColor: settings.backgroundColor || '',
        accentColor: settings.accentColor || '',
        secondaryColor: settings.secondaryColor || '',
        foregroundColor: settings.foregroundColor || '',
        mutedColor: settings.mutedColor || '',
        cardColor: settings.cardColor || '',
        borderColor: settings.borderColor || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    
    // Initial protocol with audit timestamp
    const updateData = {
      ...formData,
      updatedAt: new Date().toISOString()
    };

    // Remove the ID if it's in the state to avoid Firestore errors
    delete updateData.id;

    // Synchronize with Cloud Registry
    setDocumentNonBlocking(settingsRef, updateData, { merge: true });
    
    setTimeout(() => {
      setIsSavingSettings(false);
      setStatusDialog({
        open: true,
        title: "Settings Synchronized",
        desc: "Global store configurations and financial nodes have been updated in the cloud registry."
      });
    }, 500);
  };

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, inputName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', file);
        cloudinaryData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: cloudinaryData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setFormData((prev: any) => ({
          ...prev,
          [inputName]: data.secure_url
        }));
        
        setStatusDialog({
          open: true,
          title: "Asset Registered",
          desc: "Brand asset has been successfully uploaded and linked to the global configuration."
        });
      } catch (error) {
        console.error("Upload failed:", error);
        toast({ variant: "destructive", title: "Storage Error", description: "Could not upload asset to Cloudinary." });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCreateCoupon = () => {
    if (!newCoupon.code || newCoupon.discountValue === undefined || Number.isNaN(newCoupon.discountValue)) {
      toast({ variant: "destructive", title: "Incomplete Registry", description: "Enter valid coupon credentials and values." });
      return;
    }

    const couponData = {
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(db, 'coupons'), couponData);
    setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, active: true });
    
    setStatusDialog({
      open: true,
      title: "Coupon Activated",
      desc: `Protocol ${couponData.code} is now active in the financial registry.`
    });
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    if (confirm(`Terminate coupon protocol ${code}?`)) {
      deleteDocumentNonBlocking(doc(db, 'coupons', id));
      setStatusDialog({
        open: true,
        title: "Coupon Purged",
        desc: "The discount identifier has been permanently removed from the registry."
      });
    }
  };

  if (settingsLoading && Object.keys(formData).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-border/30">
        <h1 className="text-3xl font-headline font-normal text-primary">System Settings</h1>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Global Store & Visual Configuration</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="h-auto p-0 bg-transparent flex flex-wrap justify-start gap-2 mb-12">
          {[
            { value: 'general', icon: Globe, label: 'Financial Nodes' },
            { value: 'site', icon: Palette, label: 'Site Configuration' },
            { value: 'coupons', icon: Tag, label: 'Coupon Registry' },
          ].map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="rounded-md px-6 py-3 border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              <tab.icon className="h-3 w-3 mr-2" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" /> Global Financial Protocols
                  </CardTitle>
                  <CardDescription className="text-xs">Configure how the storefront handles taxation and currency units.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Currency Symbol</Label>
                        <Input name="currencySymbol" value={formData.currencySymbol || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Currency ISO Code</Label>
                        <Input name="currencyCode" value={formData.currencyCode || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Clinical Tax Rate (%)</Label>
                        <Input name="taxRate" type="number" step="0.01" value={formData.taxRate || 0} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Free Shipping Threshold</Label>
                        <Input name="freeShippingThreshold" type="number" step="0.01" value={formData.freeShippingThreshold || 0} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Standard Shipping Rate</Label>
                      <Input name="standardShippingRate" type="number" step="0.01" value={formData.standardShippingRate || 0} onChange={handleInputChange} className="h-12 bg-muted/20 border-none" />
                    </div>

                    <Button type="submit" disabled={isSavingSettings} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 mt-4 bg-primary text-white hover:bg-primary/90 border-none">
                      {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Commit Global Protocol
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="bg-primary text-white border-none rounded-xl shadow-2xl relative overflow-hidden h-full min-h-[300px]">
                <CardContent className="p-10 flex flex-col justify-between h-full relative z-10">
                  <div>
                    <h3 className="text-3xl font-headline leading-tight">Financial <br /> Integrity.</h3>
                    <p className="mt-6 text-sm text-white/70 font-light leading-relaxed">
                      These settings define the biological cost calculations across the entire storefront. These fields are merged into the global configuration node.
                    </p>
                  </div>
                  <div className="mt-12 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Active Region</p>
                      <p className="text-lg font-headline">{formData.currencyCode || 'INR'} Registry</p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="site" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Brand & Theme Governance
                  </CardTitle>
                  <CardDescription className="text-xs">Manage your brand assets and global clinical color palette.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleSaveSettings} className="space-y-8">
                    {/* Brand Section */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b pb-2">Company Identity</h3>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                          <Input name="storeName" value={formData.storeName || ''} onChange={handleInputChange} className="h-12 pl-12 bg-muted/20 border-none" placeholder="e.g. Pharmlogics Healthcare" />
                        </div>
                      </div>
                    </div>

                    {/* Logo Section */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b pb-2">Visual Assets</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-bold uppercase tracking-widest">Primary Logo (Dark)</Label>
                          <div className="flex gap-2">
                            <Input name="logoUrl" value={formData.logoUrl || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none flex-1" placeholder="URL" />
                            <label className="h-12 w-12 rounded-md bg-primary text-white flex items-center justify-center cursor-pointer shrink-0">
                              <Upload className="h-4 w-4" />
                              <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'logoUrl')} />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-bold uppercase tracking-widest">Secondary Logo (White)</Label>
                          <div className="flex gap-2">
                            <Input name="logoWhiteUrl" value={formData.logoWhiteUrl || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none flex-1" placeholder="URL" />
                            <label className="h-12 w-12 rounded-md bg-primary text-white flex items-center justify-center cursor-pointer shrink-0">
                              <Upload className="h-4 w-4" />
                              <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'logoWhiteUrl')} />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Favicon Asset URL</Label>
                        <div className="flex gap-2">
                          <Input name="faviconUrl" value={formData.faviconUrl || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none flex-1" placeholder="https://..." />
                          <label className="h-12 w-12 rounded-md bg-primary text-white flex items-center justify-center cursor-pointer shrink-0">
                            <Upload className="h-4 w-4" />
                            <input type="file" className="hidden" onChange={(e) => handleCloudinaryUpload(e, 'faviconUrl')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Theme Section */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b pb-2">Clinical Color Palette (HSL)</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {['primaryColor', 'backgroundColor', 'accentColor', 'foregroundColor', 'secondaryColor', 'mutedColor', 'cardColor', 'borderColor'].map(color => (
                          <div key={color} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-[10px] font-bold uppercase tracking-widest">{color.replace('Color', '')}</Label>
                              <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: `hsl(${formData[color] || '0 0% 0%'})` }} />
                            </div>
                            <Input name={color} value={formData[color] || ''} onChange={handleInputChange} className="h-12 bg-muted/20 border-none font-mono text-xs" placeholder="H S% L%" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-muted-foreground italic">*Colors must be entered as space-separated HSL values (e.g., "230 100% 36%").</p>
                    </div>

                    <Button type="submit" disabled={isSavingSettings || isUploading} className="w-full h-14 uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 mt-4 bg-primary text-white hover:bg-primary/90 border-none">
                      {(isSavingSettings || isUploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Deploy Visual Configuration
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden h-full">
                <CardHeader className="bg-primary pb-6 text-white">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Live Preview Node</CardTitle>
                </CardHeader>
                <CardContent className="pt-8 flex flex-col items-center gap-8 h-full bg-muted/5">
                  <div className="w-full p-6 bg-white rounded-xl shadow-sm space-y-6">
                    <div className="flex justify-center border-b pb-4">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                      ) : (
                        <span className="font-headline text-xl text-primary">{formData.storeName || 'Pharmlogics'}</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                    <Button className="w-full border-none" style={{ backgroundColor: `hsl(${formData.primaryColor || '230 100% 36%'})` }}>
                      Sample Action
                    </Button>
                  </div>
                  <div className="p-6 bg-accent/5 border border-accent/10 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-accent">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Storage Protocol</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground font-light">
                      Theme variables and brand assets are synchronized across all application nodes. Saving here updates the global aesthetic identity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Initialize Discount
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-[10px] font-bold uppercase tracking-widest">Access Code</Label>
                    <Input 
                      placeholder="e.g. WELLNESS20" 
                      value={newCoupon.code || ''}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})}
                      className="h-12 bg-muted/20 border-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest">Protocol Type</Label>
                      <select 
                        className="w-full h-12 rounded-md bg-muted/20 border-none px-3 text-sm focus:ring-0"
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest">Value</Label>
                      <Input 
                        type="number" 
                        value={Number.isNaN(newCoupon.discountValue) ? "" : (newCoupon.discountValue ?? "")}
                        onChange={(e) => {
                          const val = e.target.value === "" ? NaN : parseFloat(e.target.value);
                          setNewCoupon({...newCoupon, discountValue: val});
                        }}
                        className="h-12 bg-muted/20 border-none"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateCoupon} className="w-full h-14 uppercase text-[11px] font-bold tracking-widest bg-primary text-white hover:bg-primary/90 border-none">
                    Register Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Active Coupon Stream</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="border-border/30">
                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest pl-6">Code</TableHead>
                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Value</TableHead>
                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                        <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-right pr-6">Management</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {couponsLoading ? (
                        <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                      ) : coupons?.map((coupon) => (
                        <TableRow key={coupon.id} className="border-border/20">
                          <TableCell className="pl-6 py-6"><code className="bg-muted px-2 py-1 rounded text-xs font-bold text-primary">{coupon.code}</code></TableCell>
                          <TableCell className="text-xs uppercase font-light">{coupon.discountType}</TableCell>
                          <TableCell className="font-headline text-lg">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${formData.currencySymbol || ''}${coupon.discountValue.toFixed(2)}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.active ? 'default' : 'secondary'} className="text-[9px] font-bold uppercase tracking-widest">
                              {coupon.active ? 'Active' : 'Paused'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id, coupon.code)} className="text-destructive hover:bg-destructive/5">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <StatusDialog 
        open={statusDialog.open} 
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.title}
        description={statusDialog.desc}
      />
    </div>
  );
}
