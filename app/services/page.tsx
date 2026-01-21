import { createClient } from "@/lib/supabase/server";
import { PackageCard } from "@/components/services/package-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";

async function PackageList() {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
        .from("private_class_packages")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

    if (error) {
        console.error("Error fetching packages:", error);
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-destructive font-medium">Gagal memuat paket bimbingan.</p>
            </div>
        );
    }

    if (!packages || packages.length === 0) {
        return (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Belum ada paket yang tersedia saat ini.</p>
            </div>
        );
    }

    return (
        <>
            {packages.map((pkg) => (
                <PackageCard
                    key={pkg.id}
                    id={pkg.id}
                    name={pkg.name}
                    slug={pkg.slug}
                    description={pkg.description}
                    duration_days={pkg.duration_days}
                    price={pkg.price}
                    is_active={pkg.is_active}
                />
            ))}
        </>
    );
}

function PackageListSkeleton() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            <p className="text-muted-foreground animate-pulse">Memuat paket bimbingan...</p>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </Button>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Pilihan Paket Bimbingan</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Temukan paket bimbingan private yang sesuai dengan kebutuhan tugas akhir atau riset Anda.
                    Didampingi oleh tutor berpengalaman.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
                <Suspense fallback={<PackageListSkeleton />}>
                    <PackageList />
                </Suspense>
            </div>
        </div>
    );
}
