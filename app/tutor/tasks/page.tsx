import { RotateCcw } from "lucide-react";

export default function TasksPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
                <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Fitur Segera Hadir</h1>
            <p className="text-muted-foreground max-w-sm">
                Manajemen tugas siswa sedang dalam pengembangan. Anda akan segera dapat memberikan dan menilai tugas dari sini.
            </p>
        </div>
    );
}
