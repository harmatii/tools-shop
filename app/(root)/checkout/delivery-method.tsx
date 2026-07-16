"use client";

import { toast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { ShippingAddress } from "@/types";
import { shippingAddressSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader, ArrowRight } from "lucide-react";
import { updateUserShippingAddress } from "@/lib/actions/user.actions";
import { searchCities, searchWarehouses } from "@/lib/actions/novaposhta.actions";
import { searchCities as searchUkrposhtaCities, searchPostOffices } from "@/lib/actions/ukrposhta.actions";
import AddressFields from "./address-fields";
import AsyncCombobox from "@/components/features/async-combobox";

const DeliveryMethod = ({ shippingAddress }: { shippingAddress: ShippingAddress }) => {
  // we opt this component out of React Compiler because it skips the re-renders
  // react-hook-form needs to display validation errors on screen
  "use no memo";

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });

  // We subscribe to the delivery type radio so the JSX below can decide whether to
  // show the branch picker or the full address fields as the user switches between them.
  const deliveryType = form.watch("deliveryType");

  // Both carriers now have their own autocomplete API, so we watch the carrier
  // to decide which one the comboboxes should call. We also
  // watch cityRef because the branch search needs to know which city to look in.
  const carrier = form.watch("carrier");
  const cityRef = form.watch("cityRef");

  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (data) => {
    startTransition(async () => {
      const result = await updateUserShippingAddress(data);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return;
      }
      //router.push("/checkout/delivery-method");
    });
  };

  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Метод Доставки</h1>
      </div>

      <Form {...form}>
        <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="carrier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Перевізник</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(newCarrier) => {
                      field.onChange(newCarrier);

                      // The carriers live in different id worlds — Nova Poshta
                      // uses refs, Ukrposhta uses city ids and postcodes — so a
                      // city or branch picked for one is meaningless for the
                      // other and we clear the whole selection on switch.
                      form.setValue("city", "");
                      form.setValue("cityRef", "");
                      form.setValue("branch", "");
                      form.setValue("branchRef", "");
                    }}
                    value={field.value}
                    className="flex flex-col gap-2"
                  >
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="novaPoshta" />
                      </FormControl>
                      <FormLabel className="font-normal">Нова Пошта</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="ukrPoshta" />
                      </FormControl>
                      <FormLabel className="font-normal">УкрПошта</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Спосіб отримання</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-2">
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="branch" />
                      </FormControl>
                      <FormLabel className="font-normal">Відділення</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <RadioGroupItem value="address" />
                      </FormControl>
                      <FormLabel className="font-normal">Адресна доставка</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Both delivery types need the city, so we always show it. The field
              is the same autocomplete for both carriers — only the server action
              behind it differs. The `key` remounts the combobox on a carrier
              switch so results fetched from one API never linger in the dropdown
              of the other. Picking a different city resets the chosen branch,
              because the old one belongs to the old city. */}
          <div className="flex flex-col md:flex-row gap-5">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Місто</FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      key={carrier}
                      value={field.value}
                      placeholder="Почніть вводити назву міста…"
                      emptyText="Місто не знайдено"
                      onSearch={carrier === "novaPoshta" ? searchCities : searchUkrposhtaCities}
                      onSelect={(option) => {
                        form.setValue("city", option.label, { shouldValidate: true });
                        form.setValue("cityRef", option.value);
                        form.setValue("branch", "");
                        form.setValue("branchRef", "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Delivery to a branch only needs to know which branch, while delivery to
              the door needs the rest of the address, so we swap the fields here. */}
          {deliveryType === "branch" && (
            <div className="flex flex-col md:flex-row gap-5">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Відділення</FormLabel>
                    <FormControl>
                      {/* The branch list opens with the city's first branches right
                          away (searchOnOpen) and stays disabled until a city is
                          picked, because neither API can search branches without one. */}
                      <AsyncCombobox
                        key={carrier}
                        value={field.value}
                        placeholder={cityRef ? "Номер або вулиця відділення…" : "Спочатку оберіть місто"}
                        emptyText="Відділення не знайдено"
                        onSelect={(option) => {
                          form.setValue("branch", option.label, { shouldValidate: true });
                          form.setValue("branchRef", option.value);
                        }}
                        onSearch={(query) =>
                          carrier === "novaPoshta" ? searchWarehouses(cityRef, query) : searchPostOffices(cityRef, query)
                        }
                        searchOnOpen
                        disabled={!cityRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {deliveryType === "address" && <AddressFields control={form.control} />}

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

export default DeliveryMethod;
