"use server";

import { unstable_cache } from "next/cache";
import type { ComboboxOption } from "@/types";

const UKRPOSHTA_CLASSIFIER_URL = "https://www.ukrposhta.ua/address-classifier";

const CACHE_SECONDS = 60 * 60 * 24;

// Our single "courier" to Ukrposhta: every method call goes through here and always comes back as an array of raw records.
const callUkrposhta = async (method: string, params: Record<string, string>) => {
  try {
    // Turns { city_ua: "терноп" } into "city_ua=%D1%82..."
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${UKRPOSHTA_CLASSIFIER_URL}/${method}?${query}`, {
      headers: {
        Authorization: `Bearer ${process.env.UKRPOSHTA_ECOM_BEARER ?? ""}`,
        Accept: "application/json",
      },
    });

    const result = await response.json();

    // Digs the records out of the { Entries: { Entry: ... } } wrapper; when nothing was found we fall back to [].
    const entries = result?.Entries?.Entry ?? [];

    // Ukrposhta quirk: a single match arrives as a plain object instead of an array, so we wrap it — callers always get an array to map over.
    return (Array.isArray(entries) ? entries : [entries]) as any[];
  } catch (error) {
    console.error("Ukrposhta API error:", error);
    return [];
  }
};

// Fetches matching cities from Ukrposhta and caches each answer for a day, so a query we have already seen comes straight from the cache.
const searchCitiesCached = unstable_cache(
  async (query: string): Promise<ComboboxOption[]> => {
    const data = await callUkrposhta("get_city_by_region_id_and_district_id_and_city_ua", {
      city_ua: query,
    });

    // True when the city's CURRENT name starts with the typed prefix; false means the API matched an old (pre-renaming) name.
    const startsWithQuery = (city: any) => (city.CITY_UA ?? "").toLowerCase().startsWith(query);

    return (
      data
        // Number(true) is 1 and Number(false) is 0, so honest prefix matches float up and renamed settlements sink down (but stay).
        .sort((a, b) => Number(startsWithQuery(b)) - Number(startsWithQuery(a)))
        .slice(0, 10)
        .map((city: any) => ({
          // No ready-made line like Nova Poshta's Present, so we assemble "м. Тернопіль, Тернопільський р-н, Тернопільська обл." ourselves.
          label: [
            [city.SHORTCITYTYPE_UA, city.CITY_UA].filter(Boolean).join(" "),
            city.DISTRICT_UA && city.DISTRICT_UA !== city.CITY_UA ? `${city.DISTRICT_UA} р-н` : "",
            city.REGION_UA && city.REGION_UA !== city.CITY_UA ? `${city.REGION_UA} обл.` : "",
          ]
            .filter(Boolean)
            .join(", "),
          value: city.CITY_ID,
        }))
    );
  },
  ["ukrposhta-cities"],
  { revalidate: CACHE_SECONDS },
);

// A "use server" file may only export async functions, and unstable_cache
// returns a plain wrapped function, so we expose it through this thin wrapper.
export async function searchCities(query: string): Promise<ComboboxOption[]> {
  if (query.trim().length < 1) return [];

  return searchCitiesCached(query.trim().toLowerCase());
}

// Fetches matching post offices from Ukrposhta and caches each answer for a day, so a query we have already seen comes straight from the cache.
const getPostOfficesCached = unstable_cache(
  async (cityId: string): Promise<ComboboxOption[]> => {
    const data = await callUkrposhta("get_postoffices_by_postcode_cityid_cityvpzid", {
      city_id: cityId,
    });

    return data
      .filter((office: any) => office.LOCK_CODE === "0" && office.IS_SECURITY !== "1")
      .map((office: any) => ({
        label: `${office.POSTTERMINAL === "1" ? "Поштомат" : "Відділення"} №${office.POSTCODE}: ${office.STREET_UA_VPZ ?? ""}`,
        value: office.POSTCODE,
      }));
  },
  ["ukrposhta-postoffices"],
  { revalidate: CACHE_SECONDS },
);

// A "use server" file may only export async functions, and unstable_cache
// returns a plain wrapped function, so we expose it through this thin wrapper.
export async function searchPostOffices(cityId: string, query: string): Promise<ComboboxOption[]> {
  // Without a chosen city there is nothing to search in, so we bail out early.
  if (!cityId) return [];

  const offices = await getPostOfficesCached(cityId);

  const trimmedQuery = query.trim().toLowerCase();

  // Nothing typed yet, so we just show the first thirty offices of the chosen city.
  if (!trimmedQuery) return offices.slice(0, 30);

  // Otherwise we keep only the offices whose label matches the typed text and show the first thirty of them.
  return offices.filter((office) => office.label.toLowerCase().includes(trimmedQuery)).slice(0, 30);
}
