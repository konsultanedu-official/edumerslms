"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { PackageDialog } from "./package-dialog";
import { deletePackage } from "./actions";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PackagesTableProps {
    packages: any[];
}

export function PackagesTable({ packages }: PackagesTableProps) {
    const [editPkg, setEditPkg] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    async function handleDelete() {
        if (!deleteId) return;

        try {
            const result = await deletePackage(deleteId);
            if (result.success) {
                toast.success("Paket dinonaktifkan");
            } else {
                toast.error(result.error || "Gagal menghapus");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama Paket</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Fee Tutor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {packages.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                Belum ada data paket.
                            </TableCell>
                        </TableRow>
                    ) : (
                        packages.map((pkg) => (
                            <TableRow key={pkg.id}>
                                <TableCell className="font-medium">
                                    <div>
                                        {pkg.name}
                                        <p className="text-xs text-muted-foreground line-clamp-1 font-normal">
                                            {pkg.description || "Tidak ada deskripsi"}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>{pkg.duration_days} Hari</TableCell>
                                <TableCell>{formatIDR(pkg.price)}</TableCell>
                                <TableCell>{formatIDR(pkg.tutor_fee_permanent || 0)}</TableCell>
                                <TableCell>
                                    {pkg.is_active ? (
                                        <div className="flex items-center text-green-600 gap-1 text-sm font-medium">
                                            <CheckCircle2 className="h-4 w-4" /> Aktif
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-muted-foreground gap-1 text-sm font-medium">
                                            <XCircle className="h-4 w-4" /> Nonaktif
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditPkg(pkg);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteId(pkg.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <PackageDialog
                isOpen={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setEditPkg(null);
                }}
                pkg={editPkg}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menonaktifkan paket bimbingan ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Nonaktifkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
