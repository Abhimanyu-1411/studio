import { MountainSnow } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <MountainSnow className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-xl font-bold text-primary">
        GeoClaim Insight
      </h1>
    </div>
  );
}
