
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground">
                    Konfigurasi sistem dan preferensi aplikasi.
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Admin</CardTitle>
                        <CardDescription>
                            Informasi akun administrator Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" placeholder="Email" disabled value="admin@edumers.com" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input type="text" id="name" placeholder="Nama Lengkap" />
                        </div>
                        <Button>Simpan Perubahan</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Konfigurasi Sistem</CardTitle>
                        <CardDescription>
                            Pengaturan umum aplikasi Edumers LMS. (Placeholder)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">Belum ada konfigurasi sistem yang tersedia.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
