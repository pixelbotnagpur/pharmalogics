
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground text-center p-8 rounded-lg border">
            <h1 className="text-9xl font-headline font-normal">404</h1>
            <h2 className="mt-4 text-3xl font-light">Page Not Found</h2>
            <p className="mt-2 text-lg text-muted-foreground">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <Button asChild variant="default" className="mt-8">
                <Link href="/">Go back home</Link>
            </Button>
        </div>
    </div>
  );
}
