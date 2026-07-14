import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContactInfo, ShippingAddress } from "@/types";
import ContactInfoForm from "./contact-info-form";
import DeliveryMethod from "./delivery-method";
import PaymentMethod from "./payment-method";
import CheckoutSteps from "@/components/features/checkout-steps";

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
    carrier: savedAddress?.carrier ?? "novaPoshta",
    deliveryType: savedAddress?.deliveryType ?? "branch",
    city: savedAddress?.city ?? "",
    branch: savedAddress?.branch ?? "",
    cityRef: savedAddress?.cityRef ?? "",
    branchRef: savedAddress?.branchRef ?? "",
    streetAddress: savedAddress?.streetAddress ?? "",
    postalCode: savedAddress?.postalCode ?? "",
    country: savedAddress?.country ?? "",
  };

  return (
    <>
      <CheckoutSteps current={0} />
      <ContactInfoForm contactInfo={contactInfo} />
      <DeliveryMethod shippingAddress={shippingAddress} />
      <PaymentMethod />
    </>
  );
};

export default CheckoutPage;
