import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function DashboardContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch counts in parallel
    const [
        { count: activeClassesCount },
        { count: pendingPaymentCount }
    ] = await Promise.all([
        supabase
            .from("private_classes")
            .select("*", { count: "exact", head: true })
            .eq("student_id", user.id)
            .eq("status", "active"),
        supabase
            .from("private_classes")
            .select("*", { count: "exact", head: true })
            .eq("student_id", user.id)
            .eq("status", "pending_payment")
    ]);

    // Fetch recent pending classes for "Recent Activity" or similar
    const { data: recentPending } = await supabase
        .from("private_classes")
        .select("*, private_class_packages(name)")
        .eq("student_id", user.id)
        .eq("status", "pending_payment")
        .order("created_at", { ascending: false })
        .limit(3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Selamat datang kembali, {user?.user_metadata?.full_name || "Pelajar"}!
                    </p>
                </div>
                {/* <Button asChild>
                    <Link href="/services">Book New Class</Link>
                </Button> */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeClassesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Sessions currently ongoing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{pendingPaymentCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Sessions awaiting payment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Video courses enrolled</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Needs Attention (Pending Payment)</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentPending && recentPending.length > 0 ? (
                        <div className="space-y-4">
                            {recentPending.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {/* @ts-ignore - Supabase types join workaround */}
                                            {item.private_class_packages?.name || "Private Class"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Research: {item.research_title}</p>
                                    </div>
                                    <Button size="sm" variant="outline" asChild>
                                        {/* Placeholder for payment page */}
                                        <Link href={`/student/invoices/${item.transaction_id}`}>
                                            Pay Now
                                        </Link>
                                        {/* Note: Invoices page not created yet, plan for next step? */}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Tidak ada tagihan yang belum dibayar.
                            </p>
                            <Button asChild variant="secondary" size="sm">
                                <Link href="/services">Mulai Bimbingan Baru</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <p className="text-lg text-muted-foreground animate-pulse font-medium">Memuat dashboard...</p>
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}
