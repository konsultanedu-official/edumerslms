import { createClient } from "@/lib/supabase/server";
import { MatchingTable } from "./matching-table";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pencocokan Tutor - Admin Edumers",
    description: "Tetapkan tutor untuk kelas privat yang sudah dibayar.",
};

export default async function MatchingPage() {
    const supabase = await createClient();

    // 1. Fetch classes waiting for match
    const { data: classes, error: classError } = await supabase
        .from("private_classes")
        .select(`
            id,
            status,
            student_id,
            student_profile:student_profiles(
                id,
                profile:profiles(full_name, email)
            ),
            package:private_class_packages(name)
        `)
        .eq("status", "pending_match")
        .order("created_at", { ascending: true });

    // Note: student_profile relation might need adjustment based on Schema.
    // Let's retry simpler if that fails, but essentially we need student info.
    // Schema: private_classes -> student_id (ref student_profiles(id) -> profiles(id)).
    // So to get name, we join student_profiles -> profiles.

    // 2. Fetch active tutors
    const { data: tutors, error: tutorError } = await supabase
        .from("tutor_profiles")
        .select(`
            id,
            profiles(full_name)
        `)
        .eq("status", "active");

    if (classError || tutorError) {
        console.error("Error fetching matching data", classError, tutorError);
        return <div className="p-4 text-red-500">Gagal memuat data pencocokan.</div>;
    }

    // Flatten student profile data for table
    const formattedClasses = classes?.map(c => {
        // Safe access because Supabase return types can be nested arrays or single objects depending on relationship
        const studentProfile = Array.isArray(c.student_profile) ? c.student_profile[0] : c.student_profile;
        const profile = studentProfile?.profile;
        const profileData = Array.isArray(profile) ? profile[0] : profile;

        return {
            ...c,
            // Force type casting or safe access
            package: Array.isArray(c.package) ? c.package[0] : c.package,
            student_profile: profileData
                ? {
                    full_name: profileData.full_name,
                    email: profileData.email
                }
                : { full_name: "Unknown", email: "-" }
        };
    }) || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pencocokan Tutor</h1>
                <p className="text-muted-foreground">
                    Tetapkan tutor untuk siswa yang telah menyelesaikan pembayaran.
                </p>
            </div>

            <MatchingTable
                classes={formattedClasses}
                tutors={tutors?.map(t => ({
                    ...t,
                    profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
                })) || []}
            />
        </div>
    );
}
