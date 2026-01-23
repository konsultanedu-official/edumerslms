"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Plus, Pencil, Trash, Save } from "lucide-react"
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type FeeConfig = {
    id: string
    role_type: string
    percentage_split: number
}

type BonusRule = {
    id: string
    min_turnover: number
    max_turnover: number
    bonus_amount: number
}

export default function FeesPage() {
    const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>([])
    const [bonusRules, setBonusRules] = useState<BonusRule[]>([])
    const [loading, setLoading] = useState(true)

    // Dialog States
    const [openFee, setOpenFee] = useState(false)
    const [currentFee, setCurrentFee] = useState<Partial<FeeConfig>>({})

    const [openBonus, setOpenBonus] = useState(false)
    const [currentBonus, setCurrentBonus] = useState<Partial<BonusRule>>({})
    const [isEditingBonus, setIsEditingBonus] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        await Promise.all([fetchFees(), fetchBonuses()])
        setLoading(false)
    }

    const fetchFees = async () => {
        const { data, error } = await supabase
            .from("fee_configurations")
            .select("*")
            .order("role_type", { ascending: true })

        if (error) toast.error("Failed to fetch fees")
        else setFeeConfigs(data || [])
    }

    const fetchBonuses = async () => {
        const { data, error } = await supabase
            .from("admin_bonus_rules")
            .select("*")
            .order("min_turnover", { ascending: true })

        if (error) toast.error("Failed to fetch bonus rules")
        else setBonusRules(data || [])
    }

    // --- FEE HANDLERS ---
    const handleSaveFee = async () => {
        if (!currentFee.id) return

        const { error } = await supabase
            .from("fee_configurations")
            .update({ percentage_split: currentFee.percentage_split })
            .eq("id", currentFee.id)

        if (error) {
            toast.error("Error updating fee: " + error.message)
        } else {
            toast.success("Fee configuration updated")
            setOpenFee(false)
            fetchFees()
        }
    }

    const startEditFee = (fee: FeeConfig) => {
        setCurrentFee(fee)
        setOpenFee(true)
    }

    // --- BONUS HANDLERS ---
    const handleSaveBonus = async () => {
        const payload = {
            min_turnover: currentBonus.min_turnover || 0,
            max_turnover: currentBonus.max_turnover || 0,
            bonus_amount: currentBonus.bonus_amount || 0
        }

        let error
        if (isEditingBonus && currentBonus.id) {
            const { error: updateError } = await supabase
                .from("admin_bonus_rules")
                .update(payload)
                .eq("id", currentBonus.id)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from("admin_bonus_rules")
                .insert([payload])
            error = insertError
        }

        if (error) {
            toast.error("Error saving rule: " + error.message)
        } else {
            toast.success(isEditingBonus ? "Rule updated" : "Rule created")
            setOpenBonus(false)
            fetchBonuses()
        }
    }

    const handleDeleteBonus = async (id: string) => {
        if (!confirm("Delete this rule?")) return
        const { error } = await supabase.from("admin_bonus_rules").delete().eq("id", id)
        if (error) toast.error("Failed to delete")
        else {
            toast.success("Rule deleted")
            fetchBonuses()
        }
    }

    const startCreateBonus = () => {
        setCurrentBonus({
            min_turnover: 0,
            max_turnover: 0,
            bonus_amount: 0
        })
        setIsEditingBonus(false)
        setOpenBonus(true)
    }

    const startEditBonus = (rule: BonusRule) => {
        setCurrentBonus(rule)
        setIsEditingBonus(true)
        setOpenBonus(true)
    }


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Financial Configurations</h2>
                <p className="text-muted-foreground">Manage tutor commission splits and admin bonuses.</p>
            </div>

            {/* TUTOR FEES SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle>Tutor Fee Split</CardTitle>
                    <CardDescription>Percentage of revenue allocated to the Tutor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tutor Role</TableHead>
                                <TableHead>Percentage Split</TableHead>
                                <TableHead>Platform Share (Est.)</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeConfigs.map(fee => (
                                <TableRow key={fee.id}>
                                    <TableCell className="font-medium capitalize">{fee.role_type.replace('_', ' ')}</TableCell>
                                    <TableCell>{fee.percentage_split}%</TableCell>
                                    <TableCell className="text-muted-foreground">{100 - fee.percentage_split}%</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => startEditFee(fee)}>
                                            <Pencil className="mr-2 h-3 w-3" /> Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {feeConfigs.length === 0 && !loading && (
                                <TableRow><TableCell colSpan={4} className="text-center">No configs found. Seed db?</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* BONUS RULES SECTION */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Admin Closing Bonus Rules</CardTitle>
                        <CardDescription>Daily turnover thresholds and reward amounts.</CardDescription>
                    </div>
                    <Button onClick={startCreateBonus}>
                        <Plus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Min Turnover</TableHead>
                                <TableHead>Max Turnover</TableHead>
                                <TableHead>Bonus Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bonusRules.map(rule => (
                                <TableRow key={rule.id}>
                                    <TableCell>Rp {rule.min_turnover.toLocaleString()}</TableCell>
                                    <TableCell>Rp {rule.max_turnover.toLocaleString()}</TableCell>
                                    <TableCell className="font-bold text-green-600">Rp {rule.bonus_amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => startEditBonus(rule)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBonus(rule.id)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* DIALOG: EDIT FEE */}
            <Dialog open={openFee} onOpenChange={setOpenFee}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Fee Split</DialogTitle>
                        <DialogDescription>Change the percentage allocated to {currentFee.role_type?.replace('_', ' ')}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Percentage (%)</Label>
                            <Input
                                type="number"
                                value={currentFee.percentage_split || ""}
                                onChange={(e) => setCurrentFee({ ...currentFee, percentage_split: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveFee}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG: EDIT BONUS */}
            <Dialog open={openBonus} onOpenChange={setOpenBonus}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingBonus ? "Edit Rule" : "Create Bonus Rule"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Min Turnover (Rp)</Label>
                                <Input
                                    type="number"
                                    value={currentBonus.min_turnover || 0}
                                    onChange={(e) => setCurrentBonus({ ...currentBonus, min_turnover: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Max Turnover (Rp)</Label>
                                <Input
                                    type="number"
                                    value={currentBonus.max_turnover || 0}
                                    onChange={(e) => setCurrentBonus({ ...currentBonus, max_turnover: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Bonus Amount (Rp)</Label>
                            <Input
                                type="number"
                                value={currentBonus.bonus_amount || 0}
                                onChange={(e) => setCurrentBonus({ ...currentBonus, bonus_amount: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveBonus}>Save Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
