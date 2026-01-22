
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackagesTable } from "./packages-table";
import { Metadata } from "next";
import { PackageDialogTrigger } from "./package-dialog-trigger";

export const metadata: Metadata = {
    title: "Manajemen Paket - Admin Edumers",
    description: "Kelola paket bimbingan private class yang tersedia.",
};

export default async function PackagesPage() {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
        .from("private_class_packages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch Packages Error:", error);
        return <div className="p-4 text-destructive">Gagal memuat data paket.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Paket</h1>
                    <p className="text-muted-foreground">
                        Kelola paket bimbingan private class yang tersedia untuk siswa.
                    </p>
                </div>
                <PackageDialogTrigger />
            </div>

            <PackagesTable packages={packages || []} />
        </div>
    );
}
