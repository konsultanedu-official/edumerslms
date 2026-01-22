"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const packageSchema = z.object({
    name: z.string().min(3, "Nama paket minimal 3 karakter"),
    description: z.string().optional(),
    duration_days: z.coerce.number().min(1, "Durasi minimal 1 hari"),
    price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
    is_active: z.boolean().default(true),
    tutor_fee_permanent: z.coerce.number().min(0).default(0),
});

function generateSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}

export async function createPackage(formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        duration_days: formData.get("duration_days"),
        price: formData.get("price"),
        is_active: formData.get("is_active") === "true",
        tutor_fee_permanent: formData.get("tutor_fee_permanent") || 0,
    };

    const validated = packageSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Validasi gagal", details: validated.error.flatten().fieldErrors };
    }

    const { data, error } = await supabase
        .from("private_class_packages")
        .insert({
            ...validated.data,
            slug: `${generateSlug(validated.data.name)}-${Math.floor(Math.random() * 1000)}`,
        });

    if (error) {
        console.error("Create Package Error:", error);
        return { error: "Gagal membuat paket" };
    }

    revalidatePath("/admin/packages");
    return { success: true };
}

export async function updatePackage(id: string, formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        duration_days: formData.get("duration_days"),
        price: formData.get("price"),
        is_active: formData.get("is_active") === "true",
        tutor_fee_permanent: formData.get("tutor_fee_permanent") || 0,
    };

    const validated = packageSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Validasi gagal", details: validated.error.flatten().fieldErrors };
    }

    const { error } = await supabase
        .from("private_class_packages")
        .update(validated.data)
        .eq("id", id);

    if (error) {
        console.error("Update Package Error:", error);
        return { error: "Gagal memperbarui paket" };
    }

    revalidatePath("/admin/packages");
    return { success: true };
}

export async function deletePackage(id: string) {
    const supabase = await createClient();

    // Soft delete as requested or actual delete
    const { error } = await supabase
        .from("private_class_packages")
        .update({ is_active: false })
        .eq("id", id);

    if (error) {
        console.error("Delete Package Error:", error);
        return { error: "Gagal menghapus paket" };
    }

    revalidatePath("/admin/packages");
    return { success: true };
}
