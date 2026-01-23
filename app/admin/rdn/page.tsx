"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Pencil, Trash, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type RDNProject = {
    id: string
    title: string
    student_id: string
    tutor_id: string | null
    variable_count: number
    company_count: number
    period_years: number
    software_used: string
    price: number
    tutor_fee: number
    status: string
    student?: {
        profiles: {
            full_name: string
        } | null
    }
    tutor?: {
        profiles: {
            full_name: string
        } | null
    }
}

type Profile = {
    id: string
    full_name: string
}

export default function RDNPage() {
    const [projects, setProjects] = useState<RDNProject[]>([])
    const [students, setStudents] = useState<Profile[]>([])
    const [tutors, setTutors] = useState<Profile[]>([])

    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [currentProject, setCurrentProject] = useState<Partial<RDNProject>>({})
    const [isEditing, setIsEditing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        await Promise.all([fetchProjects(), fetchProfiles()])
        setLoading(false)
    }

    const fetchProjects = async () => {
        // Note: The nested select assumes the foreign keys point to student_profiles/tutor_profiles
        // AND those tables have a foreign key to profiles.
        const { data, error } = await supabase
            .from("rdn_projects")
            .select(`
        *,
        student:student_profiles(
            profiles(full_name)
        ),
        tutor:tutor_profiles(
            profiles(full_name)
        )
      `)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching projects:", error)
            toast.error("Failed to fetch projects")
        } else {
            setProjects(data || [])
        }
    }

    const fetchProfiles = async () => {
        const { data: studentData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "student")

        if (studentData) setStudents(studentData)

        const { data: tutorData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "tutor")

        if (tutorData) setTutors(tutorData)
    }

    const handleSave = async () => {
        try {
            if (!currentProject.title || !currentProject.student_id) {
                toast.error("Title and Student are required")
                return
            }

            const payload = {
                title: currentProject.title,
                student_id: currentProject.student_id,
                tutor_id: currentProject.tutor_id || null,
                variable_count: currentProject.variable_count || 0,
                company_count: currentProject.company_count || 0,
                period_years: currentProject.period_years || 0,
                software_used: currentProject.software_used || "",
                price: currentProject.price || 0,
                tutor_fee: currentProject.tutor_fee || 0,
                status: currentProject.status || 'pending_payment'
            }

            let error
            if (isEditing && currentProject.id) {
                const { error: updateError } = await supabase
                    .from("rdn_projects")
                    .update(payload)
                    .eq("id", currentProject.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from("rdn_projects")
                    .insert([payload])
                error = insertError
            }

            if (error) throw error

            toast.success(isEditing ? "Project updated" : "Project created")
            setOpen(false)
            fetchProjects()
            setCurrentProject({})
        } catch (e: any) {
            toast.error("Error saving project: " + e.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return

        const { error } = await supabase
            .from("rdn_projects")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Failed to delete: " + error.message)
        } else {
            toast.success("Project deleted")
            fetchProjects()
        }
    }

    const startEdit = (proj: RDNProject) => {
        setCurrentProject(proj)
        setIsEditing(true)
        setOpen(true)
    }

    const startCreate = () => {
        setCurrentProject({
            status: 'pending_payment',
            variable_count: 0,
            company_count: 0,
            period_years: 0,
            price: 0,
            tutor_fee: 0
        })
        setIsEditing(false)
        setOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">RDN Projects</h2>
                    <p className="text-muted-foreground">Manage Layanan Data Sekunder projects.</p>
                </div>
                <Button onClick={startCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit RDN Project" : "Create RDN Project"}</DialogTitle>
                        <DialogDescription>
                            Enter project details, variables, and negotiate price.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* Row 1: Title & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                    id="title"
                                    value={currentProject.title || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                    placeholder="e.g. Analisis Regresi Berganda"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={currentProject.status}
                                    onValueChange={(val) => setCurrentProject({ ...currentProject, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending_payment">Pending Payment</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 2: Student & Tutor */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="student">Student</Label>
                                <Select
                                    value={currentProject.student_id}
                                    onValueChange={(val) => setCurrentProject({ ...currentProject, student_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tutor">Tutor (Optional)</Label>
                                <Select
                                    value={currentProject.tutor_id || "none"}
                                    onValueChange={(val) => setCurrentProject({ ...currentProject, tutor_id: val === "none" ? null : val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Tutor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Unassigned --</SelectItem>
                                        {tutors.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: RDN Specifics */}
                        <div className="grid gap-2 border p-4 rounded-md bg-muted/20">
                            <h4 className="font-semibold mb-2">Project Metrics</h4>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="vars">Variables</Label>
                                    <Input
                                        id="vars" type="number"
                                        value={currentProject.variable_count || 0}
                                        onChange={(e) => setCurrentProject({ ...currentProject, variable_count: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="comps">Companies</Label>
                                    <Input
                                        id="comps" type="number"
                                        value={currentProject.company_count || 0}
                                        onChange={(e) => setCurrentProject({ ...currentProject, company_count: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="years">Years</Label>
                                    <Input
                                        id="years" type="number"
                                        value={currentProject.period_years || 0}
                                        onChange={(e) => setCurrentProject({ ...currentProject, period_years: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="soft">Software</Label>
                                    <Input
                                        id="soft"
                                        value={currentProject.software_used || ""}
                                        onChange={(e) => setCurrentProject({ ...currentProject, software_used: e.target.value })}
                                        placeholder="SPSS..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Financials */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Deal Price (Rp)</Label>
                                <Input
                                    id="price" type="number"
                                    value={currentProject.price || 0}
                                    onChange={(e) => setCurrentProject({ ...currentProject, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fee">Tutor Fee (Rp)</Label>
                                <Input
                                    id="fee" type="number"
                                    value={currentProject.tutor_fee || 0}
                                    onChange={(e) => setCurrentProject({ ...currentProject, tutor_fee: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Project List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Client / Tutor</TableHead>
                                <TableHead>Metrics (V/C/Y)</TableHead>
                                <TableHead>Software</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">Loading projects...</TableCell>
                                </TableRow>
                            ) : projects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No RDN projects found.</TableCell>
                                </TableRow>
                            ) : projects.map((proj) => (
                                <TableRow key={proj.id}>
                                    <TableCell className="font-medium">
                                        {proj.title}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-semibold">{proj.student?.profiles?.full_name || "Unknown Student"}</div>
                                        <div className="text-xs text-muted-foreground">{proj.tutor?.profiles?.full_name || "Unassigned"}</div>
                                    </TableCell>
                                    <TableCell>
                                        {proj.variable_count} / {proj.company_count} / {proj.period_years}
                                    </TableCell>
                                    <TableCell>{proj.software_used}</TableCell>
                                    <TableCell>Rp {proj.price.toLocaleString()}</TableCell>
                                    <TableCell className="capitalize">
                                        <span className={`px-2 py-1 rounded text-xs ${proj.status === 'active' ? 'bg-green-100 text-green-800' :
                                                proj.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                            }`}>
                                            {proj.status.replace('_', ' ')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(proj)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(proj.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
