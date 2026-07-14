"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ComboboxOption } from "@/lib/actions/novaposhta.actions";

// A combobox is an input with an autocomplete dropdown: the user types, we ask
// the server for matching options and show them as a list to pick from. This
// component doesn't know anything about Nova Poshta — the parent hands us an
// `onSearch` function, so the same component works for cities, branches, or any
// other remote list we need later.
const AsyncCombobox = ({
  value,
  placeholder,
  emptyText,
  onSearch,
  onSelect,
  searchOnOpen = false,
  disabled = false,
}: {
  // The label of the currently chosen option, shown on the closed button.
  value: string;
  placeholder: string;
  // What we show when the search came back with no matches.
  emptyText: string;
  onSelect: (option: ComboboxOption) => void;
  onSearch: (query: string) => Promise<ComboboxOption[]>;
  // Branches want to show a list the moment the dropdown opens (an empty query
  // returns the first ones), while for cities an empty search means nothing yet.
  searchOnOpen?: boolean;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce: this effect re-runs on every typed letter (query is in the
  // dependency list), and each new run first kills the previous one — see the
  // cleanup function at the bottom.
  useEffect(() => {
    // The dropdown is closed — nothing to do.
    if (!open) return;

    // Empty search box: the city field waits until the user starts typing.
    if (query.trim() === "" && !searchOnOpen) return;

    // Becomes true when a newer letter makes this run outdated.
    let cancelled = false;

    // Wait for 300ms of silence, then actually ask the server.
    const timer = setTimeout(async () => {
      setIsSearching(true);

      const results = await onSearch(query.trim());

      // A newer letter was typed while we waited for the server — this
      // answer is stale, throw it away.
      if (cancelled) return;

      setOptions(results);
      setIsSearching(false);
    }, 300);

    // We never call this function ourselves — we hand it to React, and React
    // runs it right before the NEXT run of this effect (or when the component
    // leaves the screen). Its two weapons cover two moments: clearTimeout
    // stops the request before it flies, cancelled discards the answer while
    // it is already flying.
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, searchOnOpen, onSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {/* Command filters its items by itself out of the box, but our filtering
            already happened on the server, so we switch that behavior off. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={(newQuery) => {
              setQuery(newQuery);

              // When the field is emptied there is nothing to search for, so we
              // drop the old results and the spinner right here in the event
              // handler — the effect above deliberately skips this case.
              if (newQuery.trim() === "" && !searchOnOpen) {
                setOptions([]);
                setIsSearching(false);
              }
            }}
          />

          <CommandList>
            {isSearching ? (
              <div className="flex-center py-6">
                <Loader className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>

                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onSelect(option);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === option.label ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AsyncCombobox;
