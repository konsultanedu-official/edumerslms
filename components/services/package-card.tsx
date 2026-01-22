import Link from "next/link";
import { formatIDR } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Check, Clock } from "lucide-react";

interface PackageCardProps {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    duration_days: number;
    price: number;
    is_active: boolean;
    benefits?: string[]; // Optional if we want to parse benefits_template later
}

export function PackageCard({
    id,
    name,
    slug,
    description,
    duration_days,
    price,
    is_active,
    benefits,
}: PackageCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                            Private Class
                        </Badge>
                        <CardTitle className="text-xl font-bold">{name}</CardTitle>
                    </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                    {description || "Bimbingan intensif one-on-one dengan tutor ahli."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{duration_days} Hari Kerja (Exclude Weekend)</span>
                    </div>

                    <div className="text-2xl font-bold text-primary">
                        {formatIDR(price)}
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Termasuk:
                        </p>
                        <ul className="text-sm space-y-1">
                            {benefits && Array.isArray(benefits) && benefits.length > 0 ? (
                                (benefits as string[]).map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>{benefit}</span>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>1-on-1 dengan Tutor</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>Diskusi & Review Progress</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" asChild>
                    <Link href={`/services/private-class/${slug}`}>
                        Lihat Detail
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
