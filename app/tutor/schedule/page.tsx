import { createClient } from "@/lib/supabase/server";
import { ScheduleList } from "./schedule-list";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Jadwal Konsultasi - Edumers Tutor",
    description: "Jadwal konsultasi bimbingan skripsi.",
};

export default async function SchedulePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    const { data: schedules, error } = await supabase
        .from("consultation_schedules")
        .select(`
            id,
            scheduled_date,
            start_time,
            end_time,
            status,
            notes,
            private_class:private_classes(research_title),
            student_profile:student_profiles(
                profile:profiles(full_name)
            )
        `)
        .eq("tutor_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split('T')[0]) // Upcoming only
        .order("scheduled_date", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {
        console.error("Error fetching schedules:", error);
        return <div className="p-4 text-red-500">Gagal memuat jadwal.</div>;
    }

    // Flatten data safely
    const formattedSchedules = schedules?.map(s => {
        const studentProfileData = Array.isArray(s.student_profile) ? s.student_profile[0] : s.student_profile;
        const profileData = studentProfileData?.profile;
        const finalProfile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
            ...s,
            student_profile: studentProfileData ? {
                ...studentProfileData,
                profile: finalProfile
            } : null
        };
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Jadwal Konsultasi</h1>
                    <p className="text-muted-foreground">
                        Agenda bimbingan mendatang Anda.
                    </p>
                </div>
            </div>

            <ScheduleList schedules={formattedSchedules as any} />
        </div>
    );
}
