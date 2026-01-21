"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, Video, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Schedule {
    id: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
    meeting_link?: string;
    student_profile: {
        profile: {
            full_name: string;
        } | null;
    } | null;
    private_class: {
        research_title: string;
    } | null;
}

interface ScheduleListProps {
    schedules: Schedule[];
}

export function ScheduleList({ schedules }: ScheduleListProps) {
    if (schedules.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                <Calendar className="mx-auto h-8 w-8 mb-4 opacity-50" />
                <p>Belum ada jadwal konsultasi.</p>
            </div>
        );
    }

    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const date = schedule.scheduled_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);

    return (
        <div className="space-y-6">
            {Object.keys(groupedSchedules).sort().map((date) => (
                <div key={date}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(parseISO(date), "EEEE, d MMM yyyy", { locale: id })}
                        {isToday(parseISO(date)) && <Badge className="ml-2">Hari Ini</Badge>}
                        {isTomorrow(parseISO(date)) && <Badge variant="secondary" className="ml-2">Besok</Badge>}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groupedSchedules[date].map((item) => (
                            <Card key={item.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {item.status}
                                        </Badge>
                                        <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                        </div>
                                    </div>
                                    <CardTitle className="text-base mt-2">
                                        {item.private_class?.research_title || "Topik Belum ditentukan"}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {item.student_profile?.profile?.full_name || "Siswa"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    {/* Action buttons or details can go here */}
                                </CardContent>
                                <CardFooter>
                                    {item.status === 'confirmed' && (
                                        <Button className="w-full cursor-pointer" variant="outline" size="sm">
                                            <Video className="mr-2 h-4 w-4" />
                                            Masuk Meeting
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
