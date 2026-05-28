"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLedger } from "@/hooks/use-ledger";
import { formatAmount } from "@/lib/ledger";
import { createClient } from "@/lib/supabase/client";
import {
  fetchIncomingSharesApi,
  isAuthConfigured,
  redirectToLogin,
  type IncomingShare,
} from "@/lib/api-transactions";

const navItems = [
  { href: "/", label: "Ledger", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { balancesByCategory, myAccountTotal, hydrated } = useLedger();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [incomingShares, setIncomingShares] = useState<IncomingShare[]>([]);

  useEffect(() => {
    if (!isAuthConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    async function loadShares() {
      if (!isAuthConfigured()) return;
      const shares = await fetchIncomingSharesApi();
      if (shares === "unauthorized") {
        redirectToLogin();
        return;
      }
      setIncomingShares(shares ?? []);
    }

    void loadShares();
  }, []);

  const categoryEntries = Object.entries(balancesByCategory).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  async function handleSignOut() {
    if (!isAuthConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

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
                  <SidebarMenuButton asChild isActive={pathname === href}>
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

        {incomingShares.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Shared with me</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {incomingShares.map((share) => (
                    <SidebarMenuItem key={share.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/shared/${share.id}`}
                      >
                        <Link href={`/shared/${share.id}`}>
                          <span className="flex w-full items-center justify-between gap-2">
                            <span className="truncate">{share.category} (shared)</span>
                            <span
                              className={`shrink-0 text-xs tabular-nums ${
                                share.total >= 0 ? "text-foreground" : "text-destructive"
                              }`}
                            >
                              {formatAmount(share.total)}
                            </span>
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

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
      {isAuthConfigured() && (
        <SidebarFooter className="border-t border-sidebar-border p-2">
          {userEmail && (
            <p className="mb-2 truncate px-2 text-xs text-muted-foreground">
              {userEmail}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
