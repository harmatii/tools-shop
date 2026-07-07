import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import CredentialsSignInForm from "./sign-in-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign In",
};

// /sign-in page that shows the sign-in form. If the user is already signed in, it redirects them to the callbackUrl or home page.
const SignInPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    return redirect(safeCallbackUrl(callbackUrl));
  }
  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image src="/images/logo.svg" width={100} height={100} alt={`${APP_NAME} logo`} priority={true} />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
