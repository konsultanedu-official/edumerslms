
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateEndDate(startDate: Date, durationDays: number): Date {
  let currentDate = new Date(startDate);
  let daysCounted = 0;

  // Clone date to avoid mutating the original if passed by reference (though Date ctor creates new)
  // Ensure we start checking from the given start date.

  // Logic: We need to find the N-th working day.
  // If startDate is a working day, it's Day 1.
  // If startDate is a weekend, we hunt for the first working day to be Day 1?
  // Or do we just exclude weekends from the count?
  // The logic "Tambahkan hari hanya jika BUKAN Sabtu/Minggu" implies we skip weekends in validity check.

  while (daysCounted < durationDays) {
    const day = currentDate.getDay();
    // 0 is Sunday, 6 is Saturday
    if (day !== 0 && day !== 6) {
      daysCounted++;
    }

    // If we haven't reached the duration yet, move to next day
    if (daysCounted < durationDays) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return currentDate;
}
