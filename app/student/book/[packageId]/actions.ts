"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const bookingSchema = z.object({
    packageId: z.string().uuid(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    researchTitle: z.string().min(5, "Research title must be at least 5 characters"),
    currentChallenges: z.string().optional(),
});

export async function submitBooking(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const rawData = {
        packageId: formData.get("packageId"),
        startDate: formData.get("startDate"),
        researchTitle: formData.get("researchTitle"),
        currentChallenges: formData.get("currentChallenges"),
    };

    const validatedFields = bookingSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: "Validation failed. Please check your inputs.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { packageId, startDate, researchTitle, currentChallenges } =
        validatedFields.data;

    // 1. Authenticate User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // 2. Fetch Package Details (for duration and price)
    const { data: pkg, error: pkgError } = await supabase
        .from("private_class_packages")
        .select("price, duration_days")
        .eq("id", packageId)
        .single();

    if (pkgError || !pkg) {
        return { error: "Package not found." };
    }

    let transactionId: string | null = null;

    try {
        // 3. Calculate End Date using DB Function
        const { data: endDate, error: calcError } = await supabase.rpc(
            "calculate_end_date",
            {
                p_start_date: startDate,
                p_working_days: pkg.duration_days,
            }
        );

        if (calcError) {
            console.error("Calculate End Date Error:", calcError);
            throw new Error("Failed to calculate end date");
        }

        // 4. Create Transaction (Pending)
        const { data: transaction, error: transError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                amount: pkg.price,
                status: "pending",
                payment_proof_url: null, // Initial state
                description: `Booking Private Class: ${researchTitle}`,
            })
            .select("id")
            .single();

        if (transError) {
            console.error("Transaction Error:", transError);
            throw new Error("Failed to create transaction");
        }

        transactionId = transaction.id;

        // 5. Create Private Class (Pending Payment)
        const { error: classError } = await supabase.from("private_classes").insert({
            student_id: user.id, // linked via id
            package_id: packageId,
            tutor_id: null,
            transaction_id: transaction.id,
            start_date: startDate,
            end_date: endDate,
            status: "pending_payment",
            research_title: researchTitle,
            current_challenges: currentChallenges,
        });

        if (classError) {
            console.error("Class Error:", classError);
            throw new Error("Failed to create class record");
        }

    } catch (err) {
        console.error("Booking Error:", err);
        return { error: "An unexpected error occurred. Please try again." };
    }

    // 6. Redirect to Payment/Success Page
    if (transactionId) {
        redirect(`/student/invoices/${transactionId}`);
    }
}
