"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function WithdrawalsPage() {
    const supabase = createClient()

    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReq, setSelectedReq] = useState<any | null>(null)

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const fetchWithdrawals = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('withdrawal_requests')
                .select(`
                *,
                tutor:profiles(full_name, email)
            `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setWithdrawals(data || [])
        } catch (error: any) {
            toast.error("Failed to load withdrawals")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleProcessPayment = async () => {
        if (!selectedReq) return;

        try {
            // 1. Update Request Status
            const { error: updateError } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'paid',
                    payment_date: new Date().toISOString(),
                    admin_note: 'Processed via Admin Dashboard'
                })
                .eq('id', selectedReq.id)

            if (updateError) throw updateError

            // 2. Create Ledger Entry (Debit Tutor)
            const { error: ledgerError } = await supabase
                .from('ledger_entries')
                .insert({
                    user_id: selectedReq.tutor_id,
                    type: 'payout_tutor',
                    amount: -selectedReq.amount, // Negative for debit
                    description: `Withdrawal Paid (Ref: ${selectedReq.id.slice(0, 8)})`
                })

            if (ledgerError) throw ledgerError

            toast.success("Withdrawal marked as Paid & Ledger updated")
            setSelectedReq(null)
            fetchWithdrawals()

        } catch (error: any) {
            toast.error("Error: " + error.message)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'default'
            case 'details': return 'secondary' // pending uses secondary
            case 'pending': return 'secondary'
            case 'rejected': return 'destructive'
            default: return 'outline'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
                    <p className="text-muted-foreground">Manage tutor payout requests.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Requests</CardTitle>
                    <CardDescription>
                        Pending and past withdrawals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Bank Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : withdrawals.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No requests found.</TableCell></TableRow>
                            ) : (
                                withdrawals.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            {format(new Date(r.created_at), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{r.tutor?.full_name}</div>
                                            <div className="text-xs text-muted-foreground">{r.tutor?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {r.bank_details?.bank} - {r.bank_details?.number}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{r.bank_details?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(r.status) as any}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold">
                                            {formatCurrency(r.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {r.status === 'pending' && (
                                                <Button size="sm" onClick={() => setSelectedReq(r)}>
                                                    Process
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Withdrawal</DialogTitle>
                        <DialogDescription>
                            Review and confirm payment for <b>{selectedReq?.tutor?.full_name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="p-4 bg-secondary/20 rounded-lg space-y-2 border">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-lg">{selectedReq && formatCurrency(selectedReq.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bank:</span>
                                <span>{selectedReq?.bank_details?.bank}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Account:</span>
                                <span className="font-mono">{selectedReq?.bank_details?.number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span>{selectedReq?.bank_details?.name}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
                        <Button onClick={handleProcessPayment}>
                            <Check className="mr-2 h-4 w-4" /> Confirm Paid
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
