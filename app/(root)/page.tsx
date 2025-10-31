import sampleData from "@/db/sample-data";
import ProductList from "@/components/shared/product/product-list";

console.log(sampleData);
const Homepage = () => {
  return (
    <>
      <ProductList data={sampleData.products} title="Newest Arrivals" />
    </>
  );
};

export default Homepage;
