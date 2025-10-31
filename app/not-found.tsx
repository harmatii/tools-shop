import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <Image
        src="/images/tools.jpg"
        alt="Broken tool"
        width={400}
        height={400}
      />
      <h1 className="text-3xl font-bold mt-6">Page Not Found</h1>
      <p className="text-gray-500 mt-2">
        Looks like you grabbed the wrong wrench!
      </p>
      <Link
        href="/"
        className="mt-6 bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
