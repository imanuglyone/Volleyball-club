export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-night-950">
      <main className="container-page flex min-h-screen items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
