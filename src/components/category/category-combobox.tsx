"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
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
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  disabled?: boolean;
}

export function CategoryCombobox({
  value,
  onChange,
  categories,
  disabled,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value || "Select category..."}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type category..."
            value={value}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>
              Press enter to use &quot;{value}&quot;
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category}
                  value={category}
                  onSelect={(current) => {
                    onChange(current);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === category ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
