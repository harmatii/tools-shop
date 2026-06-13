// Wraps only shop pages — (auth) pages are in a sibling folder, so they never get this.
// Adds Header, CategoryNav, Footer. Nested inside app/layout.tsx, which still runs too.
// The () around "root" just hide the folder name from the URL — the scoping works the same.
import Header from "@/components/features/header";
import Footer from "@/components/features/footer";
import CategoryNav from "@/components/features/category-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      {/* Categories */}
      <CategoryNav />
      <main className="flex-1 wrapper"> {children} </main>
      <Footer />
    </div>
  );
}
