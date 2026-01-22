
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentCoursesPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <BookOpen className="h-12 w-12 text-blue-500" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Modul Pembelajaran Online</h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                    Akses materi pembelajaran mandiri, video course, dan kuis interaktif akan tersedia di sini.
                </p>
            </div>
            <Button asChild size="lg">
                <Link href="/student/dashboard">Kembali ke Dashboard</Link>
            </Button>
        </div>
    );
}
