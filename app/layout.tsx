// app/layout.tsx
export const metadata = {
  title: "Project Coffee",
  description: "Waibon POS - Dashboard & Reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
