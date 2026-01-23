"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function EnrollmentsPage() {
    const supabase = createClient()
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchEnrollments()
    }, [])

    const fetchEnrollments = async () => {
        setLoading(true)
        // Fetch private_classes as "enrollments"
        // Use proper aliasing for nested relations:
        // student linked via student_id -> student_profiles -> profiles
        // tutor linked via tutor_id -> tutor_profiles -> profiles

        const { data, error } = await supabase
            .from('private_classes')
            .select(`
                *,
                student:student_profiles( profiles(full_name) ),
                tutor:tutor_profiles( profiles(full_name) ),
                package:private_class_packages(name)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
        } else {
            // Safe transform to flatten the nested structure for the UI
            const flattened = (data || []).map((item: any) => ({
                ...item,
                student: { full_name: item.student?.profiles?.full_name || 'Unknown' },
                tutor: { full_name: item.tutor?.profiles?.full_name || 'Unassigned' }
            }))
            setEnrollments(flattened)
        }
        setLoading(false)
    }

    // Filter
    const filteredData = enrollments.filter(row =>
        row.id?.toLowerCase().includes(searchTerm) ||
        row.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.package?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        if (status === 'active') return 'default'
        if (status === 'completed') return 'outline'
        if (status === 'pending_payment') return 'secondary'
        return 'secondary'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
                <p className="text-muted-foreground">List of student enrollments in private classes.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active & Past Enrollments</CardTitle>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search student or package..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Schedule</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : filteredData.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No enrollments found.</TableCell></TableRow>
                            ) : (
                                filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{format(new Date(item.created_at), "dd MMM yyyy")}</TableCell>
                                        <TableCell className="font-medium">{item.student?.full_name || 'Unknown'}</TableCell>
                                        <TableCell>{item.package?.name || 'Custom Package'}</TableCell>
                                        <TableCell>{item.tutor?.full_name || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {item.schedule ? JSON.stringify(item.schedule).slice(0, 20) + '...' : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
