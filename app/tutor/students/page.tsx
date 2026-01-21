import { createClient } from "@/lib/supabase/server";
import { StudentListTable } from "./students-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Siswa Saya - Edumers Tutor",
    description: "Daftar siswa bimbingan yang ditugaskan.",
};

export default async function MyStudentsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    const { data: classes, error } = await supabase
        .from("private_classes")
        .select(`
            id,
            status,
            research_title,
            start_date,
            end_date,
            package:private_class_packages(title, duration_days),
            student_profile:student_profiles(
                university,
                study_program,
                profile:profiles(full_name, email, phone)
            )
        `)
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching students:", error);
        return <div className="p-4 text-red-500">Gagal memuat data siswa.</div>;
    }

    const formattedClasses = classes?.map(c => ({
        ...c,
        student_profile: c.student_profile ? {
            ...c.student_profile,
            profile: Array.isArray(c.student_profile.profile) ? c.student_profile.profile[0] : c.student_profile.profile
        } : null
    })) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Siswa Saya</h1>
                <p className="text-muted-foreground">
                    Kelola dan pantau perkembangan siswa bimbingan Anda.
                </p>
            </div>

            <StudentListTable classes={formattedClasses as any} />
        </div>
    );
}
