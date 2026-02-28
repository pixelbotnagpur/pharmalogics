
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  Brain, 
  Zap, 
  Moon, 
  Shield, 
  Plus, 
  Loader2, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Sparkles,
  Info,
  Package
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend,
  ReferenceLine,
  Label as RechartsLabel
} from "recharts";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ProgressLog, ProgressMetrics, Subscription } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const METRIC_CONFIG = [
  { id: 'focus', label: 'Cognitive Focus', icon: Brain, color: 'hsl(var(--primary))' },
  { id: 'energy', label: 'Physical Energy', icon: Zap, color: 'hsl(var(--accent))' },
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, color: 'hsl(var(--secondary))' },
  { id: 'immunity', label: 'Biological Defense', icon: Shield, color: '#10b981' },
  { id: 'recovery', label: 'Systemic Recovery', icon: Activity, color: '#8b5cf6' },
];

export default function ProgressPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLogging, setIsLogging] = useState(false);
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    focus: 5,
    energy: 5,
    sleep: 5,
    immunity: 5,
    recovery: 5,
  });
  const [notes, setNotes] = useState('');

  // Fetch Logs
  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'progress_logs'),
      orderBy('date', 'asc')
    );
  }, [db, user]);

  const { data: logs, isLoading: logsLoading } = useCollection<ProgressLog>(logsQuery);

  // Fetch Subscriptions for Milestones
  const subQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'subscriptions');
  }, [db, user]);

  const { data: subscriptions, isLoading: subsLoading } = useCollection<Subscription>(subQuery);

  const chartData = useMemo(() => {
    if (!logs) return [];
    return logs.map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      rawDate: log.date,
      ...log.metrics
    }));
  }, [logs]);

  // Identify milestones (Subscription start dates) that fall within the chart data range
  const milestones = useMemo(() => {
    if (!subscriptions || !chartData.length) return [];
    
    return subscriptions.map(sub => {
      const subDate = sub.createdAt ? new Date(sub.createdAt) : null;
      if (!subDate) return null;

      // Find the closest date in chartData to show the milestone
      const formattedSubDate = subDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      return {
        date: formattedSubDate,
        name: sub.productName,
        id: sub.id
      };
    }).filter(m => m !== null && chartData.some(d => d.date === m.date));
  }, [subscriptions, chartData]);

  const handleLogSubmit = async () => {
    if (!user) return;
    setIsLogging(true);

    const logData = {
      userId: user.uid,
      date: new Date().toISOString(),
      metrics,
      notes,
    };

    try {
      const logsRef = collection(db, 'users', user.uid, 'progress_logs');
      await addDocumentNonBlocking(logsRef, logData);
      
      toast({ title: "Biological Snapshot Registered", description: "Your progress has been committed to the clinical registry." });
      setNotes('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  const isLoading = logsLoading || subsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="pb-10 border-b border-border/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">BIOLOGICAL TRACKING</p>
        <h1 className="text-4xl md:text-5xl font-headline font-normal leading-tight">Progress.</h1>
        <p className="text-sm text-muted-foreground font-light mt-4 max-w-md leading-relaxed">
          Log your daily biomarkers to visualize the synergistic effects of your Pharmlogics protocols on your physical and cognitive performance.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Logging Panel */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
            <CardHeader className="bg-primary text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-headline">Clinical Snapshot</CardTitle>
                  <CardDescription className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Daily Log Node</CardDescription>
                </div>
                <CalendarIcon className="h-6 w-6 text-white/40" />
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              {METRIC_CONFIG.map((metric) => {
                const Icon = metric.icon;
                const value = metrics[metric.id as keyof ProgressMetrics];
                return (
                  <div key={metric.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted/30 flex items-center justify-center text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <Label className="text-[10px] font-bold uppercase tracking-widest">{metric.label}</Label>
                      </div>
                      <span className="text-lg font-headline text-primary">{value}/10</span>
                    </div>
                    <Slider
                      value={[value]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([val]) => setMetrics(prev => ({ ...prev, [metric.id]: val }))}
                      className="py-4"
                    />
                  </div>
                );
              })}

              <div className="space-y-3 pt-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Daily Observations</Label>
                <Textarea 
                  placeholder="Note any specific physiological changes or routine deviations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-muted/20 border-none resize-none rounded-xl text-sm font-light leading-relaxed"
                />
              </div>

              <Button 
                onClick={handleLogSubmit} 
                disabled={isLogging}
                className="w-full h-16 rounded-xl uppercase text-[11px] font-bold tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {isLogging ? <Loader2 className="h-5 w-5 animate-spin" /> : 'COMMIT BIOLOGICAL SNAPSHOT'}
              </Button>
            </CardContent>
          </Card>

          <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-accent">
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Clinical Tip</span>
            </div>
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              Consistency is the key to accurate biological profiling. Log your metrics at approximately the same time each day for optimal trend analysis.
            </p>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden h-full flex flex-col">
            <CardHeader className="p-8 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-headline">Optimization Trends</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">Longitudinal Performance Registry</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col">
              {chartData.length > 1 ? (
                <>
                  <div className="h-[400px] w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <ChartTooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px' 
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          align="right"
                          height={36}
                          iconType="circle"
                          formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{value}</span>}
                        />
                        
                        {/* Milestone Markers (Subscription Start Dates) */}
                        {milestones.map((milestone, idx) => (
                          <ReferenceLine
                            key={idx}
                            x={milestone.date}
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          >
                            <RechartsLabel 
                              value={`Protocol: ${milestone.name}`} 
                              position="insideTopLeft" 
                              fill="hsl(var(--accent))"
                              fontSize={9}
                              fontWeight="bold"
                              className="uppercase tracking-widest"
                            />
                          </ReferenceLine>
                        ))}

                        {METRIC_CONFIG.map(metric => (
                          <Line
                            key={metric.id}
                            type="monotone"
                            dataKey={metric.id}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 border-t border-dashed border-border/30">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total Samples</p>
                      <p className="text-2xl font-headline text-primary">{logs.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Milestones</p>
                      <p className="text-2xl font-headline text-accent">{milestones.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Registry Health</p>
                      <p className="text-2xl font-headline text-green-600">Stable</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-headline mb-2">Insufficient Data Points</h3>
                  <p className="text-sm font-light max-w-xs mx-auto leading-relaxed">
                    Submit at least two biological snapshots to initialize clinical trend visualization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Narrative Progress Log & Milestones */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="pt-10 border-t border-border/30">
          <div className="flex items-center gap-3 mb-8">
            <Info className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-[0.3em]">Recent Insights Registry</h3>
          </div>
          <div className="space-y-4" data-lenis-prevent>
            {logs && logs.length > 0 ? (
              logs.slice(-3).reverse().map((log) => (
                <div key={log.id} className="p-6 bg-muted/10 rounded-2xl border border-transparent hover:border-border/30 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="shrink-0 text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-headline">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-border/30 hidden md:block" />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-3">
                      {METRIC_CONFIG.map(m => (
                        <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-border/20 shadow-sm">
                          <m.icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] font-bold tabular-nums">{log.metrics[m.id as keyof ProgressMetrics]}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-light text-muted-foreground italic leading-relaxed">
                      {log.notes || "No observations registered for this node."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Awaiting clinical input...</p>
            )}
          </div>
        </section>

        <section className="pt-10 border-t border-border/30">
          <div className="flex items-center gap-3 mb-8">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="text-sm font-bold uppercase tracking-[0.3em]">Active Protocol Markers</h3>
          </div>
          <div className="space-y-4">
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className="p-6 bg-accent/5 rounded-2xl border border-transparent flex items-center gap-6">
                  <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <img src={sub.imageUrl} className="h-full w-full object-contain p-1" alt="" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold uppercase tracking-wider">{sub.productName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      Initiated: {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-accent/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-accent">Monitoring</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-muted/10 rounded-3xl border border-dashed">
                <p className="text-xs text-muted-foreground font-light">Zero active protocol milestones detected.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
