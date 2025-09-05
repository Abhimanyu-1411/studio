
import { Leaf } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Leaf className="h-7 w-7 text-primary" />
      <div>
        <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
          FRA Atlas
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block">Forest Rights Act Decision Support System</p>
      </div>
    </div>
  );
}
