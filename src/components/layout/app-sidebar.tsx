"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useLedger } from "@/hooks/use-ledger";
import { formatAmount } from "@/lib/ledger";

const navItems = [
  { href: "/", label: "Ledger", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { balancesByCategory, myAccountTotal, hydrated } = useLedger();

  const categoryEntries = Object.entries(balancesByCategory).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <Wallet className="size-5" />
          <span className="font-semibold">Fund Track</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hydrated && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Balances</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-semibold">
                      <span className="truncate">
                        My Account
                        <span className="ml-1 font-normal text-muted-foreground">
                          (total)
                        </span>
                      </span>
                      <span
                        className={`tabular-nums text-xs font-semibold ${
                          myAccountTotal >= 0
                            ? "text-foreground"
                            : "text-destructive"
                        }`}
                      >
                        {formatAmount(myAccountTotal)}
                      </span>
                    </div>
                  </SidebarMenuItem>
                  {categoryEntries.length > 0 && <SidebarSeparator />}
                  {categoryEntries.map(([category, balance]) => (
                    <SidebarMenuItem key={category}>
                      <div className="flex w-full items-center justify-between px-2 py-1.5 text-sm">
                        <span className="truncate">{category}</span>
                        <span
                          className={`tabular-nums text-xs font-medium ${
                            balance >= 0
                              ? "text-foreground"
                              : "text-destructive"
                          }`}
                        >
                          {formatAmount(balance)}
                        </span>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
