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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function TransactionsPage() {
    const supabase = createClient()

    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                *,
                user:profiles(full_name, email)
            `)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            setTransactions(data || [])
        } catch (error: any) {
            toast.error("Failed to load transactions")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'default' // primary
            case 'pending': return 'secondary' // gray
            case 'failed': return 'destructive' // red
            case 'refunded': return 'outline'
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

    const filteredData = transactions.filter(t =>
        t.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Monitor incoming payments and transaction capability.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                        List of all financial movements into the platform.
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search usage invoice or user..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice / Date</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow>
                                ) : filteredData.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center h-24">No transactions found.</TableCell></TableRow>
                                ) : (
                                    filteredData.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <div className="font-mono text-sm font-medium">{t.invoice_number || 'INV-???'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(t.created_at), "dd MMM yyyy, HH:mm")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{t.user?.full_name || 'Guest'}</div>
                                                <div className="text-xs text-muted-foreground">{t.user?.email}</div>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {t.service_type?.replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className="capitalize text-sm">
                                                {t.payment_method || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(t.status) as any}>
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-medium">
                                                {formatCurrency(t.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
