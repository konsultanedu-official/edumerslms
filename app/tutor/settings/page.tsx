
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export default async function TutorSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan Tutor</h1>
                <p className="text-muted-foreground">
                    Kelola profil dan preferensi akun Anda.
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Saya</CardTitle>
                        <CardDescription>
                            Informasi pribadi dan kontak.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" value={user?.email || ""} disabled />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input type="tel" id="phone" placeholder="+62..." />
                        </div>
                        <Button>Simpan Profil</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Keahlian & Bidang Riset</CardTitle>
                        <CardDescription>
                            Perbarui spesialisasi Anda untuk pencocokan siswa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm italic">Fitur manajemen keahlian akan segera hadir.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
