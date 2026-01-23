import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="flex items-center p-4 border-b">
                    <SidebarTrigger />
                    <h1 className="ml-4 text-xl font-bold">Edumers LMS Admin</h1>
                </div>
                <div className="p-6">
                    {children}
                </div>
                <Toaster />
            </main>
        </SidebarProvider>
    )
}
