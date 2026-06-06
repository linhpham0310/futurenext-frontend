'use client';

import { Button } from '@/components/ui/button';

export function SocialLoginButtons() {
  return (
    <>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc tiếp tục với</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" disabled>
          Apple
        </Button>
        <Button variant="outline" disabled>
          Google
        </Button>
        <Button variant="outline" disabled>
          Meta
        </Button>
      </div>
    </>
  );
}
