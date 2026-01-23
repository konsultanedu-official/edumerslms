"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Calendar as CalendarIcon, UserCheck, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PrivateClass = {
    id: string
    student_id: string
    tutor_id: string | null
    package_id: string
    status: string
    start_date: string | null
    end_date: string | null
    student?: { profiles: { full_name: string } }
    tutor?: { profiles: { full_name: string } }
    package?: {
        name: string
        duration_days: number
        schedule_type: 'weekday' | 'weekend' | 'everyday'
    }
}

type Profile = { id: string; full_name: string }
type Package = { id: string; name: string; duration_days: number; schedule_type: string }

export default function MatchingPage() {
    const [bookings, setBookings] = useState<PrivateClass[]>([])
    const [students, setStudents] = useState<Profile[]>([])
    const [tutors, setTutors] = useState<Profile[]>([])
    const [packages, setPackages] = useState<Package[]>([])

    const [loading, setLoading] = useState(true)

    // Dialog States
    const [openManual, setOpenManual] = useState(false)
    const [newBooking, setNewBooking] = useState<{ student_id: string, package_id: string, start_date: string }>({
        student_id: "", package_id: "", start_date: new Date().toISOString().split('T')[0]
    })

    const [openAssign, setOpenAssign] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<PrivateClass | null>(null)
    const [assignData, setAssignData] = useState<{ tutor_id: string, start_date: string }>({
        tutor_id: "", start_date: ""
    })
    const [calculatedEndDate, setCalculatedEndDate] = useState<string | null>(null)
    const [calculating, setCalculating] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        await Promise.all([fetchBookings(), fetchResources()])
        setLoading(false)
    }

    const fetchBookings = async () => {
        const { data, error } = await supabase
            .from("private_classes")
            .select(`
        *,
        student:student_profiles(profiles(full_name)),
        tutor:tutor_profiles(profiles(full_name)),
        package:private_class_packages(name, duration_days, schedule_type)
      `)
            .order("created_at", { ascending: false })

        if (error) toast.error("Failed to fetch bookings")
        else setBookings(data || [])
    }

    const fetchResources = async () => {
        const { data: s } = await supabase.from("profiles").select("id, full_name").eq("role", "student")
        if (s) setStudents(s)

        const { data: t } = await supabase.from("profiles").select("id, full_name").eq("role", "tutor")
        if (t) setTutors(t)

        const { data: p } = await supabase.from("private_class_packages").select("id, name, duration_days, schedule_type")
        if (p) setPackages(p)
    }

    // --- MANUAL BOOKING ---
    const handleCreateBooking = async () => {
        if (!newBooking.student_id || !newBooking.package_id) {
            toast.error("Student and Package are required")
            return
        }

        try {
            // 1. Fetch Package Price (Default to S1 for manual entry)
            const { data: pkg, error: pkgError } = await supabase
                .from('private_class_packages')
                .select('price_s1')
                .eq('id', newBooking.package_id)
                .single()

            if (pkgError) throw pkgError
            const amount = pkg.price_s1 || 0

            // 2. Insert Transaction (Paid)
            const { data: txn, error: txnError } = await supabase
                .from('transactions')
                .insert({
                    user_id: newBooking.student_id,
                    service_type: 'private_class',
                    service_id: '00000000-0000-0000-0000-000000000000', // Temporary ID
                    amount: amount,
                    status: 'paid',
                    payment_method: 'manual'
                })
                .select()
                .single()

            if (txnError) throw txnError

            // 3. Create Private Class
            const { data: cls, error: clsError } = await supabase
                .from("private_classes")
                .insert([{
                    student_id: newBooking.student_id,
                    package_id: newBooking.package_id,
                    status: 'pending_match',
                    transaction_id: txn.id
                }])
                .select()
                .single()

            if (clsError) throw clsError

            // 3b. Update Transaction with correct service_id
            await supabase.from('transactions').update({ service_id: cls.id }).eq('id', txn.id)

            // 4. Create Ledger Entry (Platform Income)
            const { error: ledgerError } = await supabase
                .from('ledger_entries')
                .insert({
                    transaction_id: txn.id,
                    type: 'income_platform',
                    amount: amount,
                    description: 'Manual Booking Payment'
                })

            if (ledgerError) throw ledgerError

            toast.success("Booking created & Payment recorded")
            setOpenManual(false)
            fetchBookings()

        } catch (error: any) {
            console.error(error)
            toast.error("Error: " + error.message)
        }
    }

    // --- ASSIGNMENT LOGIC ---
    const openAssignModal = (booking: PrivateClass) => {
        setSelectedBooking(booking)
        setAssignData({
            tutor_id: booking.tutor_id || "",
            start_date: booking.start_date || new Date().toISOString().split('T')[0]
        })
        setCalculatedEndDate(booking.end_date)
        setOpenAssign(true)
    }

    const handleCalculateDate = async () => {
        if (!selectedBooking?.package || !assignData.start_date) return

        setCalculating(true)
        // Call RPC function
        const { data, error } = await supabase.rpc('calculate_end_date', {
            p_start_date: assignData.start_date,
            p_working_days: selectedBooking.package.duration_days,
            p_schedule_type: selectedBooking.package.schedule_type
        })

        setCalculating(false)
        if (error) {
            toast.error("Calc Error: " + error.message)
        } else {
            setCalculatedEndDate(data)
            toast.success(`End Date: ${data}`)
        }
    }

    const handleConfirmAssignment = async () => {
        if (!selectedBooking || !assignData.tutor_id) {
            toast.error("Please select a tutor")
            return
        }
        if (!calculatedEndDate) {
            toast.error("Please calculate end date first")
            return
        }

        try {
            // 1. Fetch Transaction & Tutor Details
            const { data: booking, error: bookingError } = await supabase
                .from('private_classes')
                .select('transaction_id, transactions(amount)')
                .eq('id', selectedBooking.id)
                .single()

            if (bookingError) throw bookingError

            // Handle array or object return for joined query in Supabase JS
            const transactionId = booking.transaction_id
            // @ts-ignore
            const amount = Array.isArray(booking.transactions) ? booking.transactions[0]?.amount : booking.transactions?.amount;

            if (!transactionId || !amount) {
                toast.warning("Warning: No valid transaction found. Ledger update skipped.")
            } else {

                const { data: tutorProfile, error: tutorError } = await supabase
                    .from('tutor_profiles')
                    .select('status')
                    .eq('id', assignData.tutor_id)
                    .single()

                if (tutorError) throw tutorError

                // 2. Determine Split Percentage
                const roleType = tutorProfile.status === 'intern' ? 'tutor_intern' : 'tutor_permanent';

                const { data: feeConfig, error: feeError } = await supabase
                    .from('fee_configurations')
                    .select('percentage_split')
                    .eq('role_type', roleType)
                    .single()

                // Default to 50% if config missing
                const percentage = feeConfig?.percentage_split || 50;
                const tutorShare = (amount * percentage) / 100;

                // 3. Update Ledger (Move from Platform to Tutor)
                // Debit Platform
                const { error: debitError } = await supabase.from('ledger_entries').insert({
                    transaction_id: transactionId,
                    type: 'income_platform',
                    amount: -tutorShare, // Negative to reduce platform share
                    description: `Fee Split Allocation to Tutor (Debit)`
                })
                if (debitError) throw debitError

                // Credit Tutor
                const { error: creditError } = await supabase.from('ledger_entries').insert({
                    transaction_id: transactionId,
                    user_id: assignData.tutor_id,
                    type: 'income_tutor',
                    amount: tutorShare,
                    description: `Fee Share (${percentage}%)`
                })
                if (creditError) throw creditError
            }

            // 4. Update Booking
            const { error } = await supabase
                .from("private_classes")
                .update({
                    tutor_id: assignData.tutor_id,
                    start_date: assignData.start_date,
                    end_date: calculatedEndDate,
                    status: 'active'
                })
                .eq("id", selectedBooking.id)

            if (error) throw error

            toast.success("Tutor Assigned & Fees Allocated")
            setOpenAssign(false)
            fetchBookings()

        } catch (error: any) {
            console.error(error)
            toast.error("Assignment Failed: " + error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assignment Dashboard</h2>
                    <p className="text-muted-foreground">Match students with tutors and schedule classes.</p>
                </div>
                <Button onClick={() => setOpenManual(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Manual Booking
                </Button>
            </div>

            {/* PENDING MATCHING */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Matching</CardTitle>
                    <CardDescription>Bookings waiting for tutor assignment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Duration / Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.filter(b => b.status === 'pending_match' || b.status === 'pending_payment').length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No pending bookings.</TableCell></TableRow>
                            )}
                            {bookings.filter(b => b.status === 'pending_match' || b.status === 'pending_payment').map(b => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-medium">{b.student?.profiles?.full_name}</TableCell>
                                    <TableCell>{b.package?.name}</TableCell>
                                    <TableCell>{b.package?.duration_days} Days ({b.package?.schedule_type})</TableCell>
                                    <TableCell><Badge variant="outline">{b.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => openAssignModal(b)}>
                                            <UserCheck className="mr-2 h-4 w-4" /> Match
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ACTIVE CLASSES */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Classes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead className="text-right">End Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.filter(b => b.status === 'active').map(b => (
                                <TableRow key={b.id}>
                                    <TableCell className="font-medium">{b.student?.profiles?.full_name}</TableCell>
                                    <TableCell>{b.tutor?.profiles?.full_name}</TableCell>
                                    <TableCell>{b.package?.name}</TableCell>
                                    <TableCell>{b.start_date} - {b.end_date}</TableCell>
                                    <TableCell className="text-right font-mono">{b.end_date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MANUAL BOOKING DIALOG */}
            <Dialog open={openManual} onOpenChange={setOpenManual}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Manual Booking Entry</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Student</Label>
                            <Select onValueChange={(v) => setNewBooking({ ...newBooking, student_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Package</Label>
                            <Select onValueChange={(v) => setNewBooking({ ...newBooking, package_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Package" /></SelectTrigger>
                                <SelectContent>{packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.duration_days}d)</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateBooking}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ASSIGN TUTOR DIALOG */}
            <Dialog open={openAssign} onOpenChange={setOpenAssign}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Assign Tutor</DialogTitle>
                        <DialogDescription>
                            {selectedBooking?.package?.name} for {selectedBooking?.student?.profiles.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Select Tutor</Label>
                            <Select value={assignData.tutor_id} onValueChange={(v) => setAssignData({ ...assignData, tutor_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Available Tutors" /></SelectTrigger>
                                <SelectContent>
                                    {tutors.map(t => {
                                        // Calculate Load
                                        const activeLoad = bookings.filter(b => b.tutor_id === t.id && b.status === 'active').length
                                        const isOverloaded = activeLoad >= 5

                                        return (
                                            <SelectItem key={t.id} value={t.id} className="flex justify-between items-center w-full">
                                                <span className={isOverloaded ? "text-amber-600 font-medium" : ""}>
                                                    {t.full_name} ({activeLoad} Active)
                                                </span>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Load Warning */}
                        {assignData.tutor_id && (() => {
                            const activeLoad = bookings.filter(b => b.tutor_id === assignData.tutor_id && b.status === "active").length;
                            if (activeLoad >= 5) {
                                return (
                                    <div className="p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-900 text-sm">
                                        <strong>Warning:</strong> This tutor already has {activeLoad} active students. Please ensure they have available capacity.
                                    </div>
                                )
                            }
                            return null
                        })()}

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input type="date" value={assignData.start_date} onChange={(e) => setAssignData({ ...assignData, start_date: e.target.value })} />
                            </div>
                            <Button variant="secondary" onClick={handleCalculateDate} disabled={calculating}>
                                {calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
                                Calc End Date
                            </Button>
                        </div>

                        {calculatedEndDate && (
                            <div className="p-3 bg-secondary/20 rounded-md border text-center">
                                <span className="text-sm text-muted-foreground mr-2">Calculated End Date:</span>
                                <span className="font-bold text-lg">{calculatedEndDate}</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Based on {selectedBooking?.package?.schedule_type} schedule ({selectedBooking?.package?.duration_days} days)
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleConfirmAssignment} disabled={!calculatedEndDate || !assignData.tutor_id}>Confirm Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
