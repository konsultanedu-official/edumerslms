"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignTutor(classId: string, tutorId: string) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from("private_classes")
            .update({
                tutor_id: tutorId,
                status: "active",
                matched_by: user.id,
                matched_at: new Date().toISOString(),
            })
            .eq("id", classId);

        if (error) throw error;

        revalidatePath("/admin/matching");
        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Assign tutor failed:", error);
        return { success: false, error: "Failed to assign tutor" };
    }
}
