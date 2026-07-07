// Auto-shown by Next.js while any page is fetching data — no manual isLoading needed.
// Lives here in app/ so it covers the whole site (same folder-scoping rule as layouts).
import Image from "next/image";
import loader from "@/assets/loader.svg";

const LoadingPage = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Image src={loader} height={64} width={64} alt="Loading..." />
    </div>
  );
};

export default LoadingPage;
