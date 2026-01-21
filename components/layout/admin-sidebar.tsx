"use client";

import {
    LayoutDashboard,
    WalletCards,
    Users,
    Settings,
    LogOut,
    Briefcase
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
    {
        title: "Tinjauan",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Pesanan Masuk",
        href: "/admin/orders",
        icon: WalletCards,
    },
    {
        title: "Pencocokan Tutor",
        href: "/admin/matching",
        icon: Users,
    },
    {
        title: "Manajemen Paket",
        href: "/admin/packages",
        icon: Briefcase,
    },
    {
        title: "Pengaturan",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login?role=admin");
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b px-4 py-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                        A
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">Edumers Admin</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Admin</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                        className="cursor-pointer transition-colors duration-200 hover:bg-muted"
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            tooltip="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
