export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Panel Admin</h1>
            <p className="text-muted-foreground">Halo Admin, berikut ringkasan statistik sistem.</p>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Pesanan Baru</h3>
                    <p className="text-2xl font-bold text-destructive">4</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Transaksi</h3>
                    <p className="text-2xl font-bold">Rp 12,500,000</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">User Aktif</h3>
                    <p className="text-2xl font-bold">156</p>
                </div>
            </div>
        </div>
    );
}
