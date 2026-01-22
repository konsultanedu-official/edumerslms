
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

/**
 * Calculates the end date based on working days (skipping weekends and optional holidays)
 * @param startDate The date to start counting from
 * @param durationDays Number of working days
 * @param holidays Optional list of holiday date strings (YYYY-MM-DD)
 */
export function calculateEndDate(startDate: Date, durationDays: number, holidays: string[] = []): Date {
  let currentDate = new Date(startDate);
  let daysCounted = 0;

  const holidaySet = new Set(holidays);

  while (daysCounted < durationDays) {
    const day = currentDate.getDay(); // 0: Sunday, 6: Saturday

    // Format date as YYYY-MM-DD for holiday check
    const dateStr = currentDate.getFullYear() + '-' +
      String(currentDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(currentDate.getDate()).padStart(2, '0');

    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidaySet.has(dateStr);

    if (!isWeekend && !isHoliday) {
      daysCounted++;
    }

    // Move to next day if we still need more working days
    if (daysCounted < durationDays) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return currentDate;
}
