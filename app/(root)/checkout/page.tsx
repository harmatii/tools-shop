import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContactInfo, ShippingAddress } from "@/types";
import ContactInfoForm from "./contact-info-form";
import DeliveryMethod from "./delivery-method";
import PaymentMethod from "./payment-method";

export const metadata: Metadata = {
  title: "Checkout",
};

const CheckoutPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) throw new Error("No user ID");

  const user = await getUserById(userId);

  const contactInfo: ContactInfo = {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phoneNumber: user.phoneNumber ?? "",
  };

  const savedAddress = user.address as ShippingAddress | null;

  const shippingAddress: ShippingAddress = {
    streetAddress: savedAddress?.streetAddress ?? "",
    city: savedAddress?.city ?? "",
    postalCode: savedAddress?.postalCode ?? "",
    country: savedAddress?.country ?? "",
  };

  return (
    <>
      <div className="w-full md:w-1/3 mx-auto">
        <ContactInfoForm contactInfo={contactInfo} />
        <DeliveryMethod shippingAddress={shippingAddress} />
      </div>
      <PaymentMethod />
    </>
  );
};

export default CheckoutPage;
