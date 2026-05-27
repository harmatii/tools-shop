// Layout for the (auth) route group — wraps sign-in / sign-up pages.
// Centers the child page vertically and horizontally on a full-screen container.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex-center min-h-screen w-full">{children}</div>;
}
