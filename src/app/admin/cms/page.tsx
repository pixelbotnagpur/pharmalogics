
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Mail, 
  ShieldAlert, 
  Home, 
  Package, 
  Database, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { initializeClinicalRegistry } from '@/lib/initialization';

const MANAGEABLE_PAGES = [
  { id: 'home', title: 'Home Page', desc: 'Hero, science points, and featured highlights.', icon: Home },
  { id: 'products', title: 'Products Page', desc: 'Manage catalog hero and SEO metadata.', icon: Package },
  { id: 'about', title: 'About Page', desc: 'Manage mission, story, values, and community sections.', icon: FileText },
  { id: 'faqs', title: 'FAQ Registry', desc: 'Manage support questions and clinical efficacy answers.', icon: HelpCircle },
  { id: 'contact', title: 'Contact Concierge', desc: 'Update support identifiers, locations, and hours.', icon: Mail },
  { id: 'policies', title: 'Legal Policies', desc: 'Governance for Delivery, Terms, Privacy, and Cookies.', icon: ShieldAlert },
];

export default function CMSDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitRegistry = async () => {
    if (!confirm("This will synchronize all clinical page nodes and research abstracts. Proceed?")) return;
    
    setIsInitializing(true);
    try {
      await initializeClinicalRegistry(db);
      toast({ title: "Registry Synchronized", description: "Clinical page nodes and research abstracts have been deployed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failure", description: error.message });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="pb-6 border-b border-border/30 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-headline font-normal text-primary">Content Management</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Clinical Page Registry & Visual CMS</p>
        </div>
        <Button 
          onClick={handleInitRegistry} 
          disabled={isInitializing}
          variant="outline"
          className="h-11 px-6 border-primary text-primary hover:bg-primary hover:text-white transition-all uppercase text-[10px] font-bold tracking-widest"
        >
          {isInitializing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
          Initialize Clinical Registry
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-4">
            {MANAGEABLE_PAGES.map((page) => (
              <Card key={page.id} className={cn("border-none shadow-sm transition-all overflow-hidden hover:bg-primary/5")}>
                <CardContent className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-muted/30 text-primary">
                      <page.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider">{page.title}</h3>
                      <p className="text-xs text-muted-foreground font-light">{page.desc}</p>
                    </div>
                  </div>
                  <Button asChild variant="ghost" className="group">
                    <Link href={`/admin/cms/${page.id}`}>
                      Manage Section <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-white border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-headline leading-tight">Dynamic <br /> Governance.</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                Web page sections are synchronized via the cloud. Changes made here propagate instantly to the clinical storefront.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-accent/5 border-accent/10 rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-headline leading-tight text-accent">Research <br /> Acceleration.</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                Use the "Initialize Clinical Registry" tool above to deploy our baseline research abstracts and optimization protocols to your storefront.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
