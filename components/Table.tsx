import * as React from 'react';

export function Table({ className = '', ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full text-sm ${className}`} {...props} />;
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} />; }
export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} />; }
export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) { return <tr {...props} />; }
export function TH(props: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className="text-left font-semibold" {...props} />; }
export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className="align-top" {...props} />; }
