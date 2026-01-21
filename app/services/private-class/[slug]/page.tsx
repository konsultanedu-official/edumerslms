import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { Suspense, use } from "react";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function PackageDetails({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: pkg, error } = await supabase
        .from("private_class_packages")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !pkg) {
        notFound();
    }

    // Parse benefits template if it exists, otherwise use default placeholder
    const benefits = pkg.benefits_template
        ? (typeof pkg.benefits_template === 'string' ? JSON.parse(pkg.benefits_template) : pkg.benefits_template)
        : [
            "Sesi konsultasi 1-on-1 intensif",
            "Review mendalam progress riset/tugas",
            "Diskusi metode dan analisis data",
            "Feedback tertulis pasca sesi",
            "Jadwal fleksibel sesuai kesepakatan"
        ];

    const benefitsList = Array.isArray(benefits) ? benefits : [];

    return (
        <div className="grid gap-8 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
                <div>
                    <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                        Private Class
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">{pkg.name}</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {pkg.description || "Program bimbingan privat eksklusif untuk membantu akselerasi tugas akhir dan riset Anda."}
                    </p>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-4">Apa yang akan Anda dapatkan?</h3>
                    <ul className="grid gap-3 list-none p-0">
                        {benefitsList.map((benefit: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-muted/30 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                        Jaminan Kualitas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Setiap sesi dibimbing oleh tutor yang telah terverifikasi keahliannya.
                        Jika tutor berhalangan, kami menjamin penggantian jadwal atau refund sesuai kebijakan yang berlaku.
                    </p>
                </div>
            </div>

            {/* Sidebar / Pricing Card */}
            <div className="md:col-span-1">
                <div className="sticky top-24 p-6 rounded-xl border bg-card shadow-sm space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Investasi</p>
                        <div className="text-3xl font-bold text-primary">
                            {formatIDR(pkg.price)}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Durasi: <strong>{pkg.duration_days} Hari Kerja</strong></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Masa Berlaku: <strong>Fleksibel</strong></span>
                        </div>
                    </div>

                    <Button className="w-full h-12 text-lg font-semibold shadow-lg shadow-blue-500/20" asChild>
                        <Link href={`/login?redirect=/student/book/${pkg.id}`}>
                            Booking Sekarang
                        </Link>
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <CreditCard className="w-3 h-3" />
                        <span>Pembayaran Aman & Terverifikasi</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            <p className="text-lg text-muted-foreground animate-pulse font-medium">Memuat detail paket...</p>
        </div>
    );
}

export default function PrivateClassDetailPage({ params }: PageProps) {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Button variant="ghost" asChild className="mb-8 pl-0 hover:bg-transparent">
                <Link href="/services" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Katalog
                </Link>
            </Button>

            <Suspense fallback={<PageSkeleton />}>
                <PackageDetails params={params} />
            </Suspense>
        </div>
    );
}
