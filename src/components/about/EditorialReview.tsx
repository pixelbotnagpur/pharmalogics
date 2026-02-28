
'use client';

interface EditorialReviewProps {
  title: React.ReactNode;
  content: string;
}

export function EditorialReview({ title, content }: EditorialReviewProps) {
  return (
    <section className="py-12 md:py-16 border-y border-foreground/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <h2 className="text-4xl md:text-5xl font-headline font-normal max-w-md leading-[1.1]">
            {title}
          </h2>
          <div className="max-w-xl">
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
