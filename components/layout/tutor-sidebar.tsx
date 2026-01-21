"use client";

import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    LogOut,
    CheckSquare
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
        href: "/tutor/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Siswa Saya",
        href: "/tutor/students",
        icon: Users,
    },
    {
        title: "Jadwal",
        href: "/tutor/schedule",
        icon: Calendar,
    },
    {
        title: "Tugas Siswa",
        href: "/tutor/tasks",
        icon: CheckSquare,
    },
    {
        title: "Pengaturan",
        href: "/tutor/settings",
        icon: Settings,
    },
];

export function TutorSidebar() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login?role=tutor");
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b px-4 py-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        T
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">Edumers Tutor</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Tutor</SidebarGroupLabel>
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
