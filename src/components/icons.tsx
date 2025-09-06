
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Leaf className="h-7 w-7" />
      <div>
        <h1 className="text-lg font-bold whitespace-nowrap">
          FRA Atlas
        </h1>
        <p className="text-xs hidden sm:block">Forest Rights Act Decision Support System</p>
      </div>
    </div>
  );
}
