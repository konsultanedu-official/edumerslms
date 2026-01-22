
import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "./settings-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pengaturan - Admin Edumers",
    description: "Konfigurasi sistem dan preferensi aplikasi.",
};

export default async function SettingsPage() {
    const supabase = await createClient();

    // Fetch Admin Profile
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

    // Fetch Holidays
    const { data: holidays } = await supabase
        .from("holidays")
        .select("*")
        .order("date", { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground">
                    Konfigurasi sistem dan manajemen profil administrator.
                </p>
            </div>

            <SettingsContent
                profile={profile}
                holidays={holidays || []}
            />
        </div>
    );
}
