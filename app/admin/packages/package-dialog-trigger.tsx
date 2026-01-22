"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PackageDialog } from "./package-dialog";

export function PackageDialogTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Paket
            </Button>
            <PackageDialog isOpen={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}
