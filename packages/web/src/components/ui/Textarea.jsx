import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
