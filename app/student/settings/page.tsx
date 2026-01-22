
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export default async function StudentSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h1>
                <p className="text-muted-foreground">
                    Perbarui informasi profil dan preferensi keamanan Anda.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informasi Pribadi</CardTitle>
                        <CardDescription>
                            Data diri dan kontak yang terdaftar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user?.email || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Nama Lengkap</Label>
                                <Input id="fullname" placeholder="Nama Lengkap" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="university">Universitas</Label>
                                <Input id="university" placeholder="Asal Universitas" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="major">Jurusan / Program Studi</Label>
                                <Input id="major" placeholder="Jurusan Anda" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button>Simpan Perubahan</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Keamanan</CardTitle>
                        <CardDescription>
                            Ubah kata sandi akun Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full">
                            Ubah Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
