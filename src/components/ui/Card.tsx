import * as React from "react";

function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(" ");
}

export function Card({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return (
 <div
 className={cn(
 "rounded-2xl border border-slate-200 bg-white shadow-sm",
 className
 )}
 {...props}
 />
 );
}

export function CardHeader({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("p-6 pb-2", className)} {...props} />;
}

export function CardTitle({
 className,
 ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
 return (
 <h1
 className={cn("text-xl font-semibold tracking-tight", className)}
 {...props}
 />
 );
}

export function CardContent({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) {
 return <div className={cn("p-6 pt-2", className)} {...props} />;
}
