"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { ContactInfo } from "@/types";
import { contactInfoSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { contactInfoDefaultValues } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";

const ContactInfoForm = ({ contactInfo }: { contactInfo: ContactInfo }) => {
  "use no memo";
  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: contactInfo || contactInfoDefaultValues,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = async () => {
    return;
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Особиста Інформація</h1>
      </div>

      <Form {...form}>
        <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof contactInfoSchema>, "firstName"> }) => (
                <FormItem className="w-full">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ім'я" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof contactInfoSchema>, "lastName"> }) => (
                <FormItem className="w-full">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Прізвище" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof contactInfoSchema>, "email"> }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email адреса" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({
                field,
              }: {
                field: ControllerRenderProps<z.infer<typeof contactInfoSchema>, "phoneNumber">;
              }) => (
                <FormItem className="w-full">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Номер телефону" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Продовжити
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ContactInfoForm;
