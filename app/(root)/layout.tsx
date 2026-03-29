import Header from "@/components/shared/header";
import Footer from "@/components/footer";
import CategoryNav from "@/components/shared/category-nav";

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
