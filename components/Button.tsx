import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };
export default function Button({ className = '', ...props }: Props) {
  return <button className={`rounded-xl border px-4 py-2 shadow-sm ${className}`} {...props} />;
}
