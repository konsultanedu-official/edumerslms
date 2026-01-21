import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Copy, CreditCard, Download, Upload } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: Promise<{
        transactionId: string;
    }>;
}

export default async function InvoicePage({ params }: PageProps) {
    const { transactionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: transaction, error } = await supabase
        .from("transactions")
        .select(`
      *,
      private_classes (
        id,
        research_title,
        private_class_packages (
          name,
          duration_days
        )
      )
    `)
        .eq("id", transactionId)
        .single();

    if (error || !transaction) {
        notFound();
    }

    // Security check: ensure transaction belongs to user
    if (transaction.user_id !== user.id) {
        return (
            <div className="container py-24 text-center">
                <h1 className="text-2xl font-bold text-destructive">Akses Ditolak</h1>
                <p className="text-muted-foreground">Anda tidak memiliki izin untuk melihat tagihan ini.</p>
                <Button asChild className="mt-4">
                    <Link href="/student/dashboard">Kembali ke Dashboard</Link>
                </Button>
            </div>
        );
    }

    const isPaid = transaction.status === "paid";
    const packages = transaction.private_classes?.[0]?.private_class_packages;
    const researchTitle = transaction.private_classes?.[0]?.research_title;

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent">
                <Link href="/student/private-classes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar Kelas
                </Link>
            </Button>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoice #{transaction.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-muted-foreground">Detail pembayaran untuk layanan bimbingan.</p>
                </div>
                <Badge variant={isPaid ? "default" : "destructive"} className="text-base px-4 py-1">
                    {isPaid ? "LUNAS" : "BELUM DIBAYAR"}
                </Badge>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Rincian Layanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            {/* @ts-ignore */}
                            <div className="font-semibold text-lg">{packages?.name || "Private Class"}</div>
                            <div className="text-sm text-muted-foreground">Judul: {researchTitle}</div>
                        </div>
                        <div className="text-right font-bold text-lg">
                            {formatIDR(transaction.amount)}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-muted-foreground text-sm">
                        <span>Subtotal</span>
                        <span>{formatIDR(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                        <span>Biaya Admin</span>
                        <span>Rp 0</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-xl">
                        <span>Total Pembayaran</span>
                        <span>{formatIDR(transaction.amount)}</span>
                    </div>
                </CardContent>
            </Card>

            {!isPaid && (
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <CreditCard className="w-5 h-5" />
                            Instruksi Pembayaran
                        </CardTitle>
                        <CardDescription>
                            Silakan transfer nominal tepat hingga 3 digit terakhir ke rekening berikut:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-background rounded-lg border flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Bank BCA</p>
                                <p className="font-mono text-xl font-bold">123 456 7890</p>
                                <p className="text-sm text-muted-foreground">a.n. PT Edumers Indonesia</p>
                            </div>
                            <Button variant="outline" size="icon" title="Salin No. Rekening">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Setelah melakukan transfer, mohon untuk mengirimkan bukti transfer melalui WhatsApp admin kami atau upload bukti pembayaran di bawah ini (Fitur Upload Coming Soon).</p>
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        {/* For MVP, let's just make simulate 'Mark as Paid' or 'Contact Admin' */}
                        <Button className="w-full" asChild>
                            <Link href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20sudah%20transfer%20untuk%20Invoice%20..." target="_blank">
                                <Upload className="mr-2 w-4 h-4" /> Konfirmasi via WhatsApp
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {isPaid && (
                <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Pembayaran Berhasil</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Terima kasih! Pembayaran Anda telah kami terima. Admin kami akan segera menunjuk tutor terbaik untuk Anda.
                            </p>
                        </div>
                        <Button variant="outline">
                            <Download className="mr-2 w-4 h-4" /> Unduh Invoice / Kwitansi
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
