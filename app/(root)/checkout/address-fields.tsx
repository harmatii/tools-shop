"use client";

import { shippingAddressSchema } from "@/lib/validators";
import { Control } from "react-hook-form";
import { z } from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// This component is deliberately just a group of fields, not a whole form. The
// parent (delivery-method.tsx) owns the useForm instance, the <form> tag and the
// submit button, and passes its `control` down to us. That way these fields can be
// shown or hidden depending on the selected delivery type while still being
// validated and submitted together with everything else. The city field is not
// here because branch delivery needs it too, so it lives in the parent.
const AddressFields = ({ control }: { control: Control<z.infer<typeof shippingAddressSchema>> }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-5">
        <FormField
          control={control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="Вулиця, будинок, квартира" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <FormField
          control={control}
          name="postalCode"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="Поштовий індекс" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Країна" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default AddressFields;
