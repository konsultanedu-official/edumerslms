"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(formData: FormData) {
    const supabase = await createClient();
    const fullName = formData.get("full_name") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

    if (error) {
        console.error("Update Profile Error:", error);
        return { error: "Gagal memperbarui profil" };
    }

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function addHoliday(formData: FormData) {
    const supabase = await createClient();
    const date = formData.get("date") as string;
    const name = formData.get("name") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("holidays")
        .insert({
            date,
            name,
            type: "manual",
            created_by: user.id
        });

    if (error) {
        console.error("Add Holiday Error:", error);
        return { error: "Gagal menambah hari libur. Pastikan tanggal belum terdaftar." };
    }

    revalidatePath("/admin/settings");
    return { success: true };
}

export async function removeHoliday(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("holidays")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Remove Holiday Error:", error);
        return { error: "Gagal menghapus hari libur" };
    }

    revalidatePath("/admin/settings");
    return { success: true };
}
