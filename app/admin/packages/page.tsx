
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PackagesPage() {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
        .from("private_class_packages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-4 text-destructive">Gagal memuat data paket.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Paket</h1>
                    <p className="text-muted-foreground">
                        Kelola paket bimbingan private class yang tersedia.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Paket
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages?.map((pkg) => (
                    <Card key={pkg.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant={pkg.is_active ? "default" : "secondary"}>
                                    {pkg.is_active ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Hapus">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="mt-2">{pkg.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {pkg.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Harga:</span>
                                    <span className="font-semibold">{formatIDR(pkg.price)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Durasi:</span>
                                    <span>{pkg.duration_days} Hari</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fee Tutor (Tetap):</span>
                                    <span>{formatIDR(pkg.tutor_fee_permanent)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
