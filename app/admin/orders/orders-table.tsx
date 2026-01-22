"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "./actions";
import { useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    } | null;
    private_classes: {
        id: string;
        status: string;
        package: {
            name: string;
            price: number;
            duration_days: number;
        } | null;
    }[];
}

interface OrdersTableProps {
    transactions: Transaction[];
}

export function OrdersTable({ transactions }: OrdersTableProps) {
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleVerifyParams = async (transactionId: string) => {
        setProcessingId(transactionId);
        try {
            await verifyPayment(transactionId);
        } catch (error) {
            console.error("Failed to verify payment", error);
            alert("Gagal memverifikasi pembayaran");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Paket</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Tidak ada pesanan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((tx) => {
                            const pClass = tx.private_classes[0];
                            const pkgTitle = pClass?.package?.name || "Unknown Package";

                            return (
                                <TableRow key={tx.id} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="font-medium">
                                        {format(new Date(tx.created_at), "dd MMM yyyy", { locale: id })}
                                        <div className="text-xs text-muted-foreground">
                                            {format(new Date(tx.created_at), "HH:mm", { locale: id })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{tx.profiles?.full_name || "Guest"}</div>
                                        <div className="text-xs text-muted-foreground">{tx.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{pkgTitle}</div>
                                        {pClass && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {pClass.status}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        IDR {tx.amount.toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={tx.status === "paid" ? "default" : "secondary"}
                                            className={tx.status === "pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
                                        >
                                            {tx.status === "paid" ? "Lunas" : tx.status === "pending" ? "Menunggu" : tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {tx.status === "pending" && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleVerifyParams(tx.id)}
                                                disabled={!!processingId}
                                                className="cursor-pointer"
                                            >
                                                {processingId === tx.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Verifikasi
                                            </Button>
                                        )}
                                        {tx.status === "paid" && (
                                            <span className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Terverifikasi
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
