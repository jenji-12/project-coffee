// components/Card.tsx
import * as React from "react";

type BaseProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Card({ className = "", ...props }: BaseProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: BaseProps) {
  return <div className={`mb-3 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: BaseProps) {
  return <h3 className={`text-lg font-semibold ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: BaseProps) {
  return <div className={className} {...props} />;
}

export function CardFooter({ className = "", ...props }: BaseProps) {
  return <div className={`mt-3 ${className}`} {...props} />;
}

// ✅ เพิ่ม default export เพื่อให้ import Card ได้โดยตรง
export default Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
}); 
