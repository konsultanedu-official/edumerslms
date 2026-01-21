import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "./orders-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pesanan Masuk - Admin Edumers",
    description: "Kelola pesanan masuk dan verifikasi pembayaran.",
};

export default async function OrdersPage() {
    const supabase = await createClient();

    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
            *,
            profiles(full_name, email),
            private_classes(
                id,
                status,
                package:private_class_packages(title, price, duration_days)
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return <div className="p-4 text-red-500">Gagal memuat pesanan. Silakan coba lagi nanti.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pesanan Masuk</h1>
                <p className="text-muted-foreground">
                    Verifikasi pembayaran dari siswa untuk mengaktifkan kelas privat.
                </p>
            </div>

            <OrdersTable transactions={transactions || []} />
        </div>
    );
}
