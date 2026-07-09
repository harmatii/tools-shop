// Server actions for user authentication: sign in with credentials and sign out.
// Called from forms via useActionState — runs only on the server.

"use server";

import { contactInfoSchema, shippingAddressSchema, signInFormSchema, signUpFormSchema } from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashPassword } from "@/lib/encrypt";
import { prisma } from "@/lib/db";
import { formatError } from "../utils";
import { ContactInfo, ShippingAddress } from "@/types";

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password" };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = hashPassword(user.password);

    await prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: await formatError(error),

      // Echo back non-sensitive fields so the form can repopulate:
      values: {
        email: formData.get("email") as string,
      },
    };
  }
}

// Get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");
  return user;
}

// Update the user's contact information
export async function updateUserContactInfo(data: ContactInfo) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const contactInfo = contactInfoSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        phoneNumber: contactInfo.phoneNumber,
        email: contactInfo.email,
      },
    });

    return { success: true, message: "Contact information updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update the user's shipping address
export async function updateUserShippingAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const shippingAddress = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        address: {
          streetAddress: shippingAddress.streetAddress,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      },
    });

    return { success: true, message: "Shipping address updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
