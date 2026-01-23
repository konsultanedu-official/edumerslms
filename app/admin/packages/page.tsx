"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Pencil, Trash } from "lucide-react"
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
    DialogTrigger,
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

type Package = {
    id: string
    name: string
    slug: string
    schedule_type: 'weekday' | 'weekend' | 'everyday'
    duration_days: number
    price_s1: number
    price_s2: number
    price_s3: number
    is_active: boolean
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [currentPackage, setCurrentPackage] = useState<Partial<Package>>({})
    const [isEditing, setIsEditing] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchPackages()
    }, [])

    const fetchPackages = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("private_class_packages")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch packages: " + error.message)
        } else {
            setPackages(data || [])
        }
        setLoading(false)
    }

    const handleSave = async () => {
        try {
            if (!currentPackage.name || !currentPackage.slug) {
                toast.error("Name and Slug are required")
                return
            }

            const payload = {
                name: currentPackage.name,
                slug: currentPackage.slug,
                schedule_type: currentPackage.schedule_type || 'weekday',
                duration_days: currentPackage.duration_days || 0,
                price_s1: currentPackage.price_s1 || 0,
                price_s2: currentPackage.price_s2 || 0,
                price_s3: currentPackage.price_s3 || 0,
                is_active: currentPackage.is_active ?? true
            }

            let error
            if (isEditing && currentPackage.id) {
                const { error: updateError } = await supabase
                    .from("private_class_packages")
                    .update(payload)
                    .eq("id", currentPackage.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from("private_class_packages")
                    .insert([payload])
                error = insertError
            }

            if (error) throw error

            toast.success(isEditing ? "Package updated" : "Package created")
            setOpen(false)
            fetchPackages()
            setCurrentPackage({})
        } catch (e: any) {
            toast.error("Error saving package: " + e.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        const { error } = await supabase
            .from("private_class_packages")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Failed to delete: " + error.message)
        } else {
            toast.success("Package deleted")
            fetchPackages()
        }
    }

    const startEdit = (pkg: Package) => {
        setCurrentPackage(pkg)
        setIsEditing(true)
        setOpen(true)
    }

    const startCreate = () => {
        setCurrentPackage({
            schedule_type: 'weekday',
            is_active: true
        })
        setIsEditing(false)
        setOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Private Class Packages</h2>
                <Button onClick={startCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Package
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Package" : "Create Package"}</DialogTitle>
                        <DialogDescription>
                            Configure package details, duration, and pricing for each degree level.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">System Name</Label>
                                <Input
                                    id="name"
                                    value={currentPackage.name || ""}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                                    placeholder="e.g. Paket Proposal"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug (Unique)</Label>
                                <Input
                                    id="slug"
                                    value={currentPackage.slug || ""}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, slug: e.target.value })}
                                    placeholder="e.g. proposal-1-bulan"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="schedule">Schedule Type</Label>
                                <Select
                                    value={currentPackage.schedule_type}
                                    onValueChange={(val: any) => setCurrentPackage({ ...currentPackage, schedule_type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekday">Weekday (No Sat/Sun)</SelectItem>
                                        <SelectItem value="weekend">Weekend (Sat/Sun Only)</SelectItem>
                                        <SelectItem value="everyday">Everyday</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (Days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={currentPackage.duration_days || ""}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, duration_days: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 border p-4 rounded-md bg-muted/20">
                            <h4 className="font-semibold mb-2">Pricing Configuration</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="p_s1">S1 Price</Label>
                                    <Input
                                        id="p_s1" type="number"
                                        value={currentPackage.price_s1 || 0}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage, price_s1: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="p_s2">S2 Price</Label>
                                    <Input
                                        id="p_s2" type="number"
                                        value={currentPackage.price_s2 || 0}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage, price_s2: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="p_s3">S3 Price</Label>
                                    <Input
                                        id="p_s3" type="number"
                                        value={currentPackage.price_s3 || 0}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage, price_s3: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>All Packages</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Price S1</TableHead>
                                <TableHead>Price S2</TableHead>
                                <TableHead>Price S3</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">Loading packages...</TableCell>
                                </TableRow>
                            ) : packages.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell className="font-medium">
                                        {pkg.name}
                                        <div className="text-xs text-muted-foreground">{pkg.slug}</div>
                                    </TableCell>
                                    <TableCell className="capitalize">{pkg.schedule_type}</TableCell>
                                    <TableCell>{pkg.duration_days} Days</TableCell>
                                    <TableCell>Rp {pkg.price_s1.toLocaleString()}</TableCell>
                                    <TableCell>Rp {pkg.price_s2.toLocaleString()}</TableCell>
                                    <TableCell>Rp {pkg.price_s3.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(pkg)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(pkg.id)}>
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
