'use client';

interface OurStoryProps {
  label: string;
  title: string;
  paragraphs: string[];
  quote: string;
  author: string;
}

export function OurStory({ label, title, paragraphs, quote, author }: OurStoryProps) {
  // Split paragraphs into two columns
  const midPoint = Math.ceil(paragraphs.length / 2);
  const leftColumn = paragraphs.slice(0, midPoint);
  const rightColumn = paragraphs.slice(midPoint);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-start">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold mb-6">
            {label}
          </p>
          <h2 className="text-3xl md:text-5xl font-headline font-normal mb-16 text-left leading-tight max-w-4xl">
            {title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-sm md:text-base font-light text-muted-foreground leading-relaxed">
            <div className="space-y-8">
              {leftColumn.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="space-y-8">
              {rightColumn.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="mt-16 md:mt-24 w-full border-none">
            <div className="max-w-3xl mx-auto">
              <blockquote className="text-2xl md:text-4xl font-headline italic font-light leading-snug text-foreground text-left">
                "{quote}"
              </blockquote>
              <p className="mt-6 text-sm uppercase tracking-widest text-muted-foreground font-bold text-left">
                — {author}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
