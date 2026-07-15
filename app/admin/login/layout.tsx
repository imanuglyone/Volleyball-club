export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-login-shell"><div className="admin-login-atmosphere" aria-hidden="true"/><main>{children}</main></div>;
}
