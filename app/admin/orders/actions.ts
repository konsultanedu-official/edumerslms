"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyPayment(transactionId: string) {
    const supabase = await createClient();

    try {
        // 1. Update transaction status to 'paid'
        const { error: txError } = await supabase
            .from("transactions")
            .update({ status: "paid" })
            .eq("id", transactionId);

        if (txError) throw txError;

        // 2. Update associated private_classes status to 'pending_match'
        // Find classes linked to this transaction
        const { data: classes, error: fetchError } = await supabase
            .from("private_classes")
            .select("id")
            .eq("transaction_id", transactionId);

        if (fetchError) throw fetchError;

        if (classes.length > 0) {
            const { error: classError } = await supabase
                .from("private_classes")
                .update({ status: "pending_match" })
                .in("id", classes.map(c => c.id));

            if (classError) throw classError;
        }

        revalidatePath("/admin/orders");
        revalidatePath("/admin/matching");
        return { success: true };
    } catch (error) {
        console.error("Payment verification failed:", error);
        return { success: false, error: "Failed to verify payment" };
    }
}
