import * as React from "react";

function cn(...classes: Array<string | false | null | undefined>) {
 return classes.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
 variant?: "primary" | "secondary";
};

export function Button({
 className,
 variant = "primary",
 ...props
}: ButtonProps) {
 const styles =
 variant === "primary"
 ? "bg-slate-900 text-white hover:bg-slate-800"
 : "bg-slate-100 text-slate-900 hover:bg-slate-200";

 return (
 <button
 className={cn(
 "h-11 w-full rounded-xl px-4 text-sm font-medium transition-colors",
 "disabled:cursor-not-allowed disabled:opacity-60",
 styles,
 className
 )}
 {...props}
 />
 );
}
