import * as React from "react";

function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(" ");
}

export function Input({
 className,
 type,
 ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
 return (
 <input
 type={type}
 className={cn(
 "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none",
 "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
 "disabled:cursor-not-allowed disabled:opacity-60",
 className
 )}
 {...props}
 />
 );
}
