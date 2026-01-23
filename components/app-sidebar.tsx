import {
    Calendar,
    Home,
    Inbox,
    Search,
    Settings,
    Package,
    Users,
    CreditCard,
    FileText,
    Repeat
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "Tutors",
        url: "/admin/tutors",
        icon: Users,
    },
    {
        title: "Assignment / Matching",
        url: "/admin/matching",
        icon: Inbox,
    },
    {
        title: "Transfers & History",
        url: "/admin/transfers",
        icon: Repeat,
    },
    {
        title: "Students",
        url: "/admin/students",
        icon: Users,
    },
    {
        title: "Packages",
        url: "/admin/packages",
        icon: Package,
    },
    {
        title: "RDN Projects",
        url: "/admin/rdn",
        icon: FileText,
    },
    {
        title: "Transactions",
        url: "/admin/transactions",
        icon: CreditCard,
    },
    {
        title: "Withdrawals",
        url: "/admin/withdrawals",
        icon: CreditCard,
    },
    {
        title: "Fee Configs",
        url: "/admin/fees",
        icon: CreditCard,
    },
    {
        title: "Enrollments",
        url: "/admin/enrollments",
        icon: FileText,
    },
    {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Edumers Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
