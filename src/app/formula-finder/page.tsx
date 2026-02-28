'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { findOptimizationProtocol, FormulaFinderOutput } from '@/ai/flows/formula-finder';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { 
  ArrowRight, 
  Brain, 
  HeartPulse, 
  Zap, 
  Shield, 
  Activity,
  Sparkles,
  RefreshCw,
  Stethoscope,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    id: 'goal',
    title: 'Primary Health Goal',
    description: 'What is the most critical area of your biology you wish to optimize today?',
    options: [
      { value: 'Focus', label: 'Cognitive Performance', icon: Brain },
      { value: 'Vitality', label: 'Cellular Energy', icon: Zap },
      { value: 'Immunity', label: 'Biological Defense', icon: Shield },
      { value: 'Recovery', label: 'Systemic Recovery', icon: Activity },
      { value: 'Longevity', label: 'Longevity & Heart', icon: HeartPulse },
    ]
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle Assessment',
    description: 'How would you describe your daily physiological environment?',
    options: [
      { value: 'High Stress', label: 'High-Stress / Fast-Paced', sub: 'Constant mental or physical demand' },
      { value: 'Active', label: 'Athlete / High-Activity', sub: 'Consistent training and movement' },
      { value: 'Balanced', label: 'Balanced / Moderate', sub: 'Varied routine with moderate output' },
      { value: 'Sedentary', label: 'Office-Based / Sedentary', sub: 'Limited movement, high digital exposure' },
    ]
  },
  {
    id: 'concerns',
    title: 'Secondary Concerns',
    description: 'Select any specific areas that require additional support.',
    options: [
      { value: 'Sleep Quality', label: 'Sleep Quality' },
      { value: 'Joint Discomfort', label: 'Joint Integrity' },
      { value: 'Digestive Issues', label: 'Gut Health' },
      { value: 'Mood Regulation', label: 'Mood & Calm' },
      { value: 'Skin Health', label: 'Cellular Vitality (Skin)' },
    ]
  },
];

export default function FormulaFinderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    primaryGoal: '',
    lifestyle: '',
    concerns: [] as string[],
    dietary: 'No Preference',
  });
  const [result, setResult] = useState<FormulaFinderOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const data = await findOptimizationProtocol({
        primaryGoal: selections.primaryGoal,
        lifestyle: selections.lifestyle,
        concerns: selections.concerns,
        dietaryPreferences: selections.dietary,
      });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return !!selections.primaryGoal;
    if (currentStep === 1) return !!selections.lifestyle;
    if (currentStep === 2) return selections.concerns.length > 0;
    return true;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (result) {
    const recommendedProducts = products.filter(p => 
      result.recommendations.some(r => r.productId === p.id)
    );

    return (
      <div className="container mx-auto px-4 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <div className="text-center space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">ANALYSIS COMPLETE</p>
            <h1 className="text-4xl md:text-6xl font-headline font-normal">{result.protocolName}</h1>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              {result.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-8">
              <div className="p-6 bg-card rounded-xl shadow-none">
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-foreground">Recommended Stack</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map((product) => {
                  const rec = result.recommendations.find(r => r.productId === product.id);
                  return (
                    <div key={product.id} className="space-y-4">
                      <ProductCard product={product} />
                      <div className="p-5 bg-card rounded-xl border border-border/20 shadow-sm min-h-[140px] flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className={`inline-block text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            rec?.priority === 'Essential' ? 'bg-primary text-white' : 'bg-accent/10 text-accent'
                          }`}>
                            {rec?.priority}
                          </span>
                          <p className="text-xs text-muted-foreground font-light leading-relaxed">
                            {rec?.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6 lg:mt-0 mt-8">
              <Card className="border-none bg-primary text-white rounded-2xl overflow-hidden relative shadow-xl">
                <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-headline">Clinical Insight</h3>
                  <p className="text-xs font-light leading-relaxed text-white/80">
                    {result.lifestyleAdvice}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white hover:text-primary h-12 text-[10px] tracking-widest font-bold uppercase" 
                    onClick={() => {
                      setResult(null);
                      setCurrentStep(0);
                      setSelections({ primaryGoal: '', lifestyle: '', concerns: [], dietary: 'No Preference' });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> RE-RUN ANALYSIS
                  </Button>
                </CardContent>
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              </Card>

              <div className="p-8 bg-accent/5 border border-accent/10 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent">Subscription Benefit</h4>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  Start this protocol as a subscription to save 30% on your initial delivery and ensure zero downtime in your optimization cycle.
                </p>
                <Button className="w-full bg-accent text-white hover:bg-accent/90 h-12 text-[10px] tracking-widest font-bold uppercase" asChild>
                  <Link href="/products">ADD ALL TO BAG <Plus className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 md:py-24 px-4 md:px-8">
      <div className="container mx-auto w-full">
        <div className="mb-16 space-y-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">HUMAN OPTIMIZATION</p>
          <h1 className="text-4xl md:text-6xl font-headline font-normal">Biological Audit.</h1>
          <div className="flex justify-center pt-4">
            <div className="w-full max-w-md bg-muted h-1 rounded-full overflow-hidden">
              <motion.div 
                className="bg-primary h-full" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative">
                  <div className="h-20 w-20 rounded-full border-2 border-primary/20 animate-ping absolute inset-0" />
                  <div className="h-20 w-20 rounded-full border-2 border-primary flex items-center justify-center bg-background relative z-10">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Analyzing Profile</p>
                  <p className="text-xs text-muted-foreground font-light">Cross-referencing biological biomarkers with clinical data...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                <div className="space-y-3 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-headline text-foreground">{steps[currentStep].title}</h2>
                  <p className="text-lg text-muted-foreground font-light">{steps[currentStep].description}</p>
                </div>

                {currentStep === 0 && (
                  <RadioGroup 
                    value={selections.primaryGoal} 
                    onValueChange={(val) => setSelections(s => ({ ...s, primaryGoal: val }))}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {steps[0].options.map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex flex-col p-8 rounded-3xl border-2 transition-all cursor-pointer hover:bg-muted/30 ${
                          selections.primaryGoal === opt.value ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <opt.icon className={`h-8 w-8 ${selections.primaryGoal === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <RadioGroupItem value={opt.value} id={opt.value} className="sr-only" />
                        </div>
                        <span className="font-headline text-xl">{opt.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {currentStep === 1 && (
                  <RadioGroup 
                    value={selections.lifestyle} 
                    onValueChange={(val) => setSelections(s => ({ ...s, lifestyle: val }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {steps[1].options.map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={opt.value}
                        className={`flex items-center justify-between p-8 rounded-3xl border-2 transition-all cursor-pointer ${
                          selections.lifestyle === opt.value ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
                        }`}
                      >
                        <div className="flex-1">
                          <span className="font-headline text-xl block mb-1">{opt.label}</span>
                          <span className="text-sm text-muted-foreground font-light">{opt.sub}</span>
                        </div>
                        <RadioGroupItem value={opt.value} id={opt.value} />
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {steps[2].options.map((opt) => (
                        <div
                          key={opt.value}
                          className={`flex items-center space-x-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                            selections.concerns.includes(opt.value) ? 'border-primary bg-primary/5' : 'border-border/50'
                          }`}
                          onClick={() => {
                            setSelections(prev => ({
                              ...prev,
                              concerns: prev.concerns.includes(opt.value)
                                ? prev.concerns.filter(c => c !== opt.value)
                                : [...prev.concerns, opt.value]
                            }));
                          }}
                        >
                          <Checkbox 
                            checked={selections.concerns.includes(opt.value)} 
                            onCheckedChange={() => {}} // Managed by div click
                            className="h-5 w-5 data-[state=checked]:bg-primary rounded-none border-foreground/30"
                          />
                          <span className="text-base font-light">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-12">
                  {currentStep > 0 && (
                    <Button 
                      variant="ghost" 
                      className="h-16 px-10 uppercase text-xs font-bold tracking-[0.2em] text-muted-foreground hover:text-primary"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                    >
                      BACK
                    </Button>
                  )}
                  <Button 
                    disabled={!isStepValid()}
                    className="flex-1 h-16 bg-primary text-white text-xs font-bold tracking-[0.2em] uppercase rounded-md shadow-2xl hover:shadow-primary/20 transition-all group"
                    onClick={handleNext}
                  >
                    {currentStep === steps.length - 1 ? 'RUN CLINICAL ANALYSIS' : 'CONTINUE'}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
