export default function TutorDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard Tutor</h1>
            <p className="text-muted-foreground">Selamat datang kembali! Berikut ringkasan aktivitas Anda hari ini.</p>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Siswa</h3>
                    <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Jadwal Hari Ini</h3>
                    <p className="text-2xl font-bold">3 Sesi</p>
                </div>
                <div className="p-6 border rounded-xl bg-card">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tugas Belum Dinilai</h3>
                    <p className="text-2xl font-bold">5</p>
                </div>
            </div>
        </div>
    );
}
