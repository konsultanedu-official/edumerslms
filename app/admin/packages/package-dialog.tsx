"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createPackage, updatePackage } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PackageDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pkg?: any; // If provided, we are in edit mode
}

export function PackageDialog({ isOpen, onOpenChange, pkg }: PackageDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEdit = !!pkg;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        duration_days: "",
        price: "",
        is_active: true,
        tutor_fee_permanent: "",
    });

    useEffect(() => {
        if (pkg) {
            setFormData({
                name: pkg.name || "",
                description: pkg.description || "",
                duration_days: pkg.duration_days?.toString() || "",
                price: pkg.price?.toString() || "",
                is_active: pkg.is_active ?? true,
                tutor_fee_permanent: pkg.tutor_fee_permanent?.toString() || "0",
            });
        } else {
            setFormData({
                name: "",
                description: "",
                duration_days: "",
                price: "",
                is_active: true,
                tutor_fee_permanent: "0",
            });
        }
    }, [pkg, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("duration_days", formData.duration_days);
        data.append("price", formData.price);
        data.append("is_active", formData.is_active.toString());
        data.append("tutor_fee_permanent", formData.tutor_fee_permanent);

        try {
            const result = isEdit
                ? await updatePackage(pkg.id, data)
                : await createPackage(data);

            if (result.success) {
                toast.success(isEdit ? "Paket diperbarui" : "Paket dibuat");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Terjadi kesalahan");
            }
        } catch (error) {
            toast.error("Gagal menyimpan data");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
                        <DialogDescription>
                            Isi formulir di bawah ini untuk {isEdit ? "mengubah" : "menambah"} paket bimbingan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Paket</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Paket Thesis Gold"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Penjelasan singkat mengenai paket..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Durasi (Hari)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    required
                                    value={formData.duration_days}
                                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                    placeholder="14"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Harga (IDR)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="1500000"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tutor_fee">Fee Tutor Tetap (IDR)</Label>
                            <Input
                                id="tutor_fee"
                                type="number"
                                value={formData.tutor_fee_permanent}
                                onChange={(e) => setFormData({ ...formData, tutor_fee_permanent: e.target.value })}
                                placeholder="500000"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Status Aktif</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Simpan Perubahan" : "Buat Paket"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
