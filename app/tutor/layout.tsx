import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/layout/tutor-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "@/components/ui/separator";

export default function TutorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <TutorSidebar />
                <main className="flex-1 overflow-auto bg-muted/30">
                    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="cursor-pointer" />
                            <Separator orientation="vertical" className="h-6" />
                            <h2 className="text-sm font-medium text-muted-foreground">Tutor Portal</h2>
                        </div>
                        <UserNav />
                    </header>
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
