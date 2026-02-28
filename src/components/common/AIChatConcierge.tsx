
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Loader2, 
  Stethoscope, 
  ArrowRight,
  ShieldCheck,
  Minus,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithConcierge } from '@/ai/flows/clinical-concierge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { ProgressLog } from '@/lib/types';

interface Message {
  role: 'user' | 'model';
  content: string;
  productIds?: string[];
}

export function AIChatConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: 'Greetings. I am the Pharmlogics Clinical Concierge. How can I assist your biological optimization journey today?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const db = useFirestore();

  // Fetch recent biomarkers to provide context to the AI
  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'progress_logs'),
      orderBy('date', 'desc'),
      limit(7)
    );
  }, [db, user]);

  const { data: logs } = useCollection<ProgressLog>(logsQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      // Map logs to a simple structure for the LLM context
      const biomarkers = logs?.map(log => ({
        date: new Date(log.date).toLocaleDateString(),
        metrics: log.metrics
      }));

      const result = await chatWithConcierge({
        history,
        message: userMessage,
        biomarkers: biomarkers || undefined
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: result.response,
        productIds: result.suggestedProductIds
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'I apologize, but I am experiencing a synchronization delay with our clinical research nodes. Please try again shortly.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-0 right-4 sm:right-8 z-[100] w-[90vw] sm:w-[400px] h-[550px] shadow-2xl rounded-t-3xl overflow-hidden border-none flex flex-col bg-background"
          >
            <Card className="flex-1 flex flex-col border-none shadow-none rounded-none">
              <CardHeader className="bg-primary text-white p-6 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-lg leading-none">Clinical Concierge</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Live Research Node</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-muted/5" data-lenis-prevent>
                <ScrollArea className="flex-1 px-6 pt-6 min-h-0" viewportRef={scrollRef}>
                  <div className="space-y-6 pb-6">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                        <div className={cn("p-4 rounded-2xl text-sm leading-relaxed", msg.role === 'user' ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" : "bg-white text-foreground rounded-tl-none border border-border/30 shadow-sm")}>
                          {msg.content}
                        </div>
                        {msg.productIds && msg.productIds.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.productIds.map(id => (
                              <Link key={id} href={`/products/${id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                                View Formula <ArrowRight className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-2">
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-border/30 flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-primary opacity-40" />
                          <span className="text-xs text-muted-foreground font-light italic">Accessing clinical data...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-6 bg-white border-t border-border/30 shrink-0">
                  <form onSubmit={handleSend} className="relative">
                    <Input placeholder="Ask about bio-actives, dosage, or stacks..." value={input} onChange={(e) => setInput(e.target.value)} className="h-12 pl-4 pr-12 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-sm" />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <div className="mt-4 flex items-center justify-center gap-2 opacity-40">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Encrypted Clinical Session</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 bottom-[10%] z-[90] hidden md:block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button onClick={() => setIsOpen(!isOpen)} className={cn("flex flex-col items-center bg-primary text-white rounded-l-lg shadow-2xl hover:bg-accent transition-all group border border-white/10 border-r-0 overflow-hidden", isOpen && "bg-accent")}>
          <motion.div initial={false} animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0, marginTop: isHovered ? 20 : 0, marginBottom: isHovered ? 4 : 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-center whitespace-nowrap overflow-hidden">
            <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
              {isOpen ? 'Close Concierge' : 'Clinical Concierge'}
            </span>
          </motion.div>
          <div className="h-10 w-10 flex items-center justify-center shrink-0">
            {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />}
          </div>
        </button>
      </motion.div>

      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-white z-[90] scale-110">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
