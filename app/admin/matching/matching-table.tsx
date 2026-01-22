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
import { assignTutor } from "./actions";
import { useState } from "react";
import { CheckCircle, Loader2, UserPlus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PrivateClass {
    id: string;
    status: string;
    student_id: string;
    student_profile: {
        full_name: string;
        email: string;
    } | null;
    package: {
        name: string;
    } | null;
}

interface Tutor {
    id: string;
    profiles: {
        full_name: string;
    } | null;
}

interface MatchingTableProps {
    classes: PrivateClass[];
    tutors: Tutor[];
}

export function MatchingTable({ classes, tutors }: MatchingTableProps) {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedTutorId, setSelectedTutorId] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAssign = async () => {
        if (!selectedClassId || !selectedTutorId) return;
        setIsProcessing(true);
        try {
            await assignTutor(selectedClassId, selectedTutorId);
            setOpen(false);
        } catch (error) {
            console.error("Failed to assign tutor", error);
            alert("Gagal menetapkan tutor");
        } finally {
            setIsProcessing(false);
            setSelectedTutorId("");
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Siswa</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Tidak ada kelas yang perlu dicocokkan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        classes.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <div className="font-medium">{c.student_profile?.full_name || "Unknown"}</div>
                                    <div className="text-xs text-muted-foreground">{c.student_profile?.email}</div>
                                </TableCell>
                                <TableCell>{c.package?.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Perlu Tutor
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={open && selectedClassId === c.id} onOpenChange={(isOpen) => {
                                        setOpen(isOpen);
                                        if (isOpen) setSelectedClassId(c.id);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="default" className="cursor-pointer">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Tetapkan Tutor
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Tetapkan Tutor</DialogTitle>
                                                <DialogDescription>
                                                    Pilih tutor untuk siswa <b>{c.student_profile?.full_name}</b>.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="tutor" className="text-right">
                                                        Tutor
                                                    </Label>
                                                    <div className="col-span-3">
                                                        <Select onValueChange={setSelectedTutorId} value={selectedTutorId}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih Tutor..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tutors.map((t) => (
                                                                    <SelectItem key={t.id} value={t.id} className="cursor-pointer">
                                                                        {t.profiles?.full_name || "Unknown Tutor"}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    onClick={handleAssign}
                                                    disabled={!selectedTutorId || isProcessing}
                                                    className="cursor-pointer"
                                                >
                                                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Simpan
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
