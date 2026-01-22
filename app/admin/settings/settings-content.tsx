"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { updateAdminProfile, addHoliday, removeHoliday } from "./actions";
import { toast } from "sonner";
import { Calendar, Trash2, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface SettingsContentProps {
    profile: any;
    holidays: any[];
}

export function SettingsContent({ profile, holidays }: SettingsContentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || "");

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData();
        formData.append("full_name", fullName);

        const result = await updateAdminProfile(formData);
        if (result.success) {
            toast.success("Profil diperbarui");
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    }

    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="holidays">Hari Libur</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Admin</CardTitle>
                        <CardDescription>Perbarui informasi dasar akun Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={profile?.email} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nama Anda"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Perubahan
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <UpdatePasswordForm />
            </TabsContent>

            <TabsContent value="holidays" className="space-y-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Hari Libur</CardTitle>
                        <CardDescription>Hari libur akan otomatis dilewati saat kalkulasi durasi kelas privat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HolidayForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Hari Libur</CardTitle>
                        <CardDescription>Menampilkan semua hari libur yang terdaftar di sistem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {holidays.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">Belum ada hari libur yang ditambahkan.</p>
                            ) : (
                                <div className="divide-y border rounded-md">
                                    {holidays.map((h) => (
                                        <div key={h.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-primary/10 p-2 rounded">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{h.name}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {format(new Date(h.date), "EEEE, d MMMM yyyy", { locale: id })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={async () => {
                                                    const res = await removeHoliday(h.id);
                                                    if (res.success) toast.success("Hari libur dihapus");
                                                    else toast.error(res.error);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

function HolidayForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const result = await addHoliday(formData);
        if (result.success) {
            toast.success("Hari libur ditambahkan");
            form.reset();
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="grid gap-2 w-full sm:w-1/3">
                <Label htmlFor="date">Tanggal</Label>
                <Input type="date" id="date" name="date" required />
            </div>
            <div className="grid gap-2 w-full sm:flex-1">
                <Label htmlFor="name">Keterangan / Nama Hari Libur</Label>
                <Input id="name" name="name" placeholder="Contoh: Tahun Baru Hijriah" required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
        </form>
    );
}
