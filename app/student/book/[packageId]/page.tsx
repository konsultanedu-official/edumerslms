import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BookingForm } from "./booking-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{
        packageId: string;
    }>;
}

export default async function BookingPage({ params }: PageProps) {
    const { packageId } = await params;
    const supabase = await createClient();

    const { data: pkg, error } = await supabase
        .from("private_class_packages")
        .select("name, price, duration_days, description")
        .eq("id", packageId)
        .single();

    if (error || !pkg) {
        notFound();
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent">
                <Link href={`/services/private-class/${pkg.name.toLowerCase().replace(/ /g, "-")}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Batal
                </Link>
                {/* Note: Slug construction above is a naive fallback. Ideally we pass slug or just go back to services. */}
            </Button>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Formulir Booking</h1>
                    <p className="text-muted-foreground">Lengkapi data berikut untuk memulai sesi bimbingan Anda.</p>
                </div>

                <Card className="bg-muted/50 border-dashed">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>{pkg.name}</span>
                            <Badge variant="secondary">{formatIDR(pkg.price)}</Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Durasi: {pkg.duration_days} Hari Kerja
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Penelitian</CardTitle>
                        <CardDescription>Informasi ini akan membantu tutor kami memahami kebutuhan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BookingForm
                            packageId={packageId}
                            packageName={pkg.name}
                            durationDays={pkg.duration_days}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
