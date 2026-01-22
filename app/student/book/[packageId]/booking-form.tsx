"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { submitBooking } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is installed or will use basic alert

// Schema matching server-side validation
const formSchema = z.object({
    packageId: z.string().uuid(),
    startDate: z.date({
        message: "A start date is required.",
    }),
    researchTitle: z.string().min(5, {
        message: "Research title must be at least 5 characters.",
    }),
    currentChallenges: z.string().optional(),
});

interface BookingFormProps {
    packageId: string;
    packageName: string;
    durationDays: number;
}

export function BookingForm({ packageId, packageName, durationDays }: BookingFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            packageId: packageId,
            researchTitle: "",
            currentChallenges: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            // Create FormData to pass to Server Action
            const formData = new FormData();
            formData.append("packageId", values.packageId);
            formData.append("startDate", values.startDate.toISOString());
            formData.append("researchTitle", values.researchTitle);
            formData.append("currentChallenges", values.currentChallenges || "");

            const result = await submitBooking(null, formData);

            if (result?.error) {
                // Handle error (ideally via toast)
                alert(result.error); // Fallback for now
                if (result.details) console.error(result.details);
            } else {
                // Success handled by redirect in server action
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Hidden Package ID */}
                <input type="hidden" {...form.register("packageId")} />

                <FormField
                    control={form.control}
                    name="researchTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Judul Penelitian / Skripsi <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Contoh: Analisis Dampak AI terhadap..." {...field} disabled={isPending} />
                            </FormControl>
                            <FormDescription>
                                Judul sementara tidak masalah.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Rencana Mulai Bimbingan <span className="text-destructive">*</span></FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            disabled={isPending}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pilih tanggal</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Paket berlaku selama {durationDays} hari kerja setelah tanggal ini.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="currentChallenges"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kendala Saat Ini (Opsional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ceritakan sedikit kendala yang Anda hadapi..."
                                    className="resize-none"
                                    {...field}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses Booking...
                        </>
                    ) : (
                        "Konfirmasi Booking"
                    )}
                </Button>
            </form>
        </Form>
    );
}
