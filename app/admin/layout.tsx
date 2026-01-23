import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            {/* 
                User Requested Layout: CSS Grid
                Sidebar fixed width (handled by Sidebar component automatic width)
                Main content takes remaining space
             */}
            <div className="min-h-screen w-full md:grid md:grid-cols-[auto_1fr]">

                {/* Desktop Sidebar */}
                <aside className="hidden md:block border-r bg-sidebar text-sidebar-foreground">
                    <AppSidebar collapsible="none" className="min-h-screen" />
                </aside>

                {/* Main Content Area */}
                <div className="flex min-w-0 flex-col">
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center p-4 border-b bg-background sticky top-0 z-20">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-[18rem]">
                                <AppSidebar collapsible="none" />
                            </SheetContent>
                        </Sheet>
                        <h1 className="ml-4 text-xl font-bold">Edumers LMS Admin</h1>
                    </header>

                    {/* Desktop Header (Optional/Hidden for now as Sidebar is always visible) */}

                    <main className="flex-1 p-6 md:p-8 overflow-x-hidden min-w-0">
                        {children}
                    </main>
                </div>

                <Toaster />
            </div>
        </SidebarProvider>
    )
}
