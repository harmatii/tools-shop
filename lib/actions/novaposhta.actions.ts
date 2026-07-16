"use server";

import { unstable_cache } from "next/cache";
import type { ComboboxOption } from "@/types";

// Every Nova Poshta request goes to this single endpoint as a POST with a JSON
// body that says which model and method we want. The api key lives only on the
// server, so the browser never sees it.
const NOVAPOSHTA_API_URL = "https://api.novaposhta.ua/v2.0/json/";

// We keep cached answers for a day because cities and branches change rarely,
// and a stale branch list for a few hours is not a real problem for checkout.
const CACHE_SECONDS = 60 * 60 * 24;

// A small helper that sends the request envelope Nova Poshta expects and
// returns the `data` array, or an empty array when anything goes wrong —
// during checkout we would rather show "nothing found" than crash the form.
const callNovaPoshta = async (calledMethod: string, methodProperties: Record<string, string>) => {
  try {
    const response = await fetch(NOVAPOSHTA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: process.env.NOVAPOSHTA_API_KEY ?? "",
        modelName: "Address",
        calledMethod,
        methodProperties,
      }),
    });

    const result = await response.json();

    if (!result.success) return [];

    return result.data as any[];
  } catch (error) {
    console.error("Nova Poshta API error:", error);
    return [];
  }
};

// searchSettlements is Nova Poshta's own autocomplete: we pass the letters the
// user has typed so far and it answers with matching settlements. We cache each
// distinct query, so once one shopper has typed "Ки" everyone else gets the
// answer instantly for the next 24 hours without another trip to the API.
const searchCitiesCached = unstable_cache(
  async (query: string): Promise<ComboboxOption[]> => {
    const data = await callNovaPoshta("searchSettlements", {
      CityName: query,
      Limit: "10",
      Page: "1",
    });

    const addresses = data[0]?.Addresses ?? [];

    return addresses.map((address: any) => ({
      // Present is a ready-made human line like "м. Київ, Київська обл." which
      // also tells apart the many villages that share the same name.
      label: address.Present,
      // DeliveryCity (not Ref!) is the id getWarehouses expects as its CityRef.
      value: address.DeliveryCity,
    }));
  },
  ["novaposhta-cities"],
  { revalidate: CACHE_SECONDS },
);

// A "use server" file may only export async functions, and unstable_cache
// returns a plain wrapped function, so we expose it through this thin wrapper.
export async function searchCities(query: string): Promise<ComboboxOption[]> {
  if (query.trim().length < 1) return [];

  return searchCitiesCached(query.trim().toLowerCase());
}

// getWarehouses lists every branch and parcel locker of one city. FindByString
// narrows the list by whatever the user typed (a branch number or a street),
// and an empty string simply returns the first branches, which lets us show a
// list the moment the dropdown opens.
const searchWarehousesCached = unstable_cache(
  async (cityRef: string, query: string): Promise<ComboboxOption[]> => {
    const data = await callNovaPoshta("getWarehouses", {
      CityRef: cityRef,
      FindByString: query,
      Limit: "30",
      Page: "1",
    });

    return data.map((warehouse: any) => ({
      // Description is a ready-made line like "Відділення №12: вул. Родини Бунге, 8".
      label: warehouse.Description,
      value: warehouse.Ref,
    }));
  },
  ["novaposhta-warehouses"],
  { revalidate: CACHE_SECONDS },
);

export async function searchWarehouses(cityRef: string, query: string): Promise<ComboboxOption[]> {
  // Without a chosen city there is nothing to search in, so we bail out early.
  if (!cityRef) return [];

  return searchWarehousesCached(cityRef, query.trim().toLowerCase());
}
