import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { Calendar, Clock, Loader2, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

async function PrivateClassesList() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: classes, error } = await supabase
        .from("private_classes")
        .select(`
      id,
      status,
      start_date,
      end_date,
      research_title,
      transaction_id,
      private_class_packages (
        name,
        duration_days,
        price
      ),
      tutor_profiles (
        full_name
      )
    `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching private classes:", error);
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Gagal memuat daftar kelas.</p>
            </div>
        );
    }

    if (!classes || classes.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <p className="text-muted-foreground mb-4">Anda belum memiliki kelas private.</p>
                <Button asChild>
                    <Link href="/services">Lihat Katalog</Link>
                </Button>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
            case "completed":
                return <Badge variant="secondary">Selesai</Badge>;
            case "pending_payment":
                return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
            case "pending_match":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Mencari Tutor</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((item) => (
                <Card key={item.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            {getStatusBadge(item.status)}
                            {/* @ts-ignore - joined type workaround */}
                            {item.private_class_packages?.price && (
                                <span className="text-sm font-medium text-muted-foreground">
                                    {/* @ts-ignore */}
                                    {formatIDR(item.private_class_packages.price)}
                                </span>
                            )}
                        </div>
                        <CardTitle className="text-xl">
                            {/* @ts-ignore */}
                            {item.private_class_packages?.name || "Private Class"}
                        </CardTitle>
                        <CardDescription className="line-clamp-2" title={item.research_title}>
                            {item.research_title}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {item.start_date ? format(new Date(item.start_date), "d MMM yyyy", { locale: id }) : "-"}
                                {" s/d "}
                                {item.end_date ? format(new Date(item.end_date), "d MMM yyyy", { locale: id }) : "-"}
                            </span>
                        </div>
                        {/* @ts-ignore */}
                        {item.tutor_profiles?.full_name ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                {/* @ts-ignore */}
                                <span>Tutor: {item.tutor_profiles.full_name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                <User className="w-4 h-4" />
                                <span>Tutor belum ditunjuk</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        {item.status === "pending_payment" ? (
                            <Button className="w-full" variant="default" asChild>
                                <Link href={`/student/invoices/${item.transaction_id}`}>
                                    Bayar Sekarang <AlertCircle className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button className="w-full" variant="outline" asChild>
                                <Link href={`/student/private-classes/${item.id}`}>
                                    Lihat Detail
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

function ClassesListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card text-card-foreground shadow h-[250px] flex flex-col p-6 space-y-4">
                    <div className="h-6 bg-muted/50 rounded w-1/3 animate-pulse" />
                    <div className="h-8 bg-muted/50 rounded w-2/3 animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                        <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                    </div>
                    <div className="h-10 bg-muted/50 rounded w-full animate-pulse" />
                </div>
            ))}
        </div>
    )
}

export default function PrivateClassesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kelas Private Saya</h1>
                    <p className="text-muted-foreground">Kelola jadwal bimbingan dan status kelas Anda.</p>
                </div>
                <Button asChild>
                    <Link href="/services">Tambah Kelas Baru</Link>
                </Button>
            </div>

            <Suspense fallback={<ClassesListSkeleton />}>
                <PrivateClassesList />
            </Suspense>
        </div>
    );
}
