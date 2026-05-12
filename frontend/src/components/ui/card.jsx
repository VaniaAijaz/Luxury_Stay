import React from "react";
import { cn } from "@/lib/utils"; // optional (if you have it)

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-sm",
        "hover:shadow-lg transition-all duration-300",
        "dark:bg-gray-900 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-gray-100 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardDescription = ({ className, children, ...props }) => {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400 mt-1",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};