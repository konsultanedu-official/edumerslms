
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Parallel queries for statistics
    const [
        { count: totalStudents },
        { count: totalOrders },
        { count: pendingOrders }
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("private_classes").select("*", { count: "exact", head: true }),
        supabase.from("private_classes").select("*", { count: "exact", head: true }).eq("status", "pending_payment")
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Panel Admin</h1>
                <p className="text-muted-foreground">Halo Admin, berikut ringkasan statistik sistem.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Siswa Terdaftar</h3>
                    <p className="text-2xl font-bold">{totalStudents || 0}</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Pesanan</h3>
                    <p className="text-2xl font-bold">{totalOrders || 0}</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Pesanan Menunggu Pembayaran</h3>
                    <p className="text-2xl font-bold text-destructive">{pendingOrders || 0}</p>
                </div>
            </div>
        </div>
    );
}
