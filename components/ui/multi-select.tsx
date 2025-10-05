"use client";

import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useState } from "react";

export interface Option<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps<T> {
  options: Option<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
  name: string
}

export function MultiSelect<T>({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  maxSelected,
  disabled,
  className,
  name = "item"
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (val: T) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      if (!maxSelected || selected.length < maxSelected) {
        onChange([...selected, val]);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start flex-wrap", className)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              Selected {selected.length} {name}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length > 0 ? (
              <CommandGroup>
                {filtered.map((opt, i) => (
                  <CommandItem
                    key={i}
                    disabled={opt.disabled}
                    onSelect={() => toggleValue(opt.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(opt.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}