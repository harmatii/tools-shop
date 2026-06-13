// The homepage ("/"). A page.tsx is the content that swaps per route — the layout frame stays, this changes.
// Fetches products on the server and passes them to ProductList.
import ProductList from "@/components/features/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <>
      <ProductList data={latestProducts} title="Newest Arrivals" />
    </>
  );
};

export default Homepage;
