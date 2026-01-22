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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface StudentClass {
    id: string;
    student_profile: {
        university: string;
        study_program: string;
        profile: {
            full_name: string;
            email: string;
            phone: string;
        } | null;
    } | null;
    package: {
        name: string;
        duration_days: number;
    } | null;
    status: string;
    research_title: string;
    start_date: string;
    end_date: string;
}

interface StudentListTableProps {
    classes: StudentClass[];
}

export function StudentListTable({ classes }: StudentListTableProps) {
    if (classes.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                Belum ada siswa yang ditugaskan kepada Anda.
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Universitas</TableHead>
                        <TableHead>Paket Bimbingan</TableHead>
                        <TableHead>Judul Penelitian</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.map((c) => {
                        const student = c.student_profile;
                        const profile = student?.profile;

                        return (
                            <TableRow key={c.id} className="hover:bg-muted/10 transition-colors">
                                <TableCell>
                                    <div className="font-medium">{profile?.full_name || "Unknown"}</div>
                                    <div className="text-xs text-muted-foreground">{profile?.email}</div>
                                    <div className="text-xs text-muted-foreground">{profile?.phone}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{student?.university}</div>
                                    <div className="text-xs text-muted-foreground">{student?.study_program}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{c.package?.name}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="truncate max-w-[200px] block" title={c.research_title}>
                                            {c.research_title || "-"}
                                        </span>
                                        {c.research_title && (
                                            <HoverCard>
                                                <HoverCardTrigger className="cursor-pointer">
                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80">
                                                    <h4 className="font-semibold text-sm mb-1">Judul Penelitian</h4>
                                                    <p className="text-sm text-muted-foreground">{c.research_title}</p>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {c.start_date ? (
                                        <>
                                            <div>{format(new Date(c.start_date), "dd MMM", { locale: id })}</div>
                                            <div className="text-xs text-muted-foreground">s.d</div>
                                            <div>{format(new Date(c.end_date), "dd MMM yyyy", { locale: id })}</div>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={c.status === "active" ? "default" : "secondary"}
                                        className={c.status === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                    >
                                        {c.status === "active" ? "Aktif" : c.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
