"use client";

import { useEffect, useState } from "react";

export function Copyright() {
    const [year, setYear] = useState<number | string>("");

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <span>
            &copy; {year || "2026"} Edumers Official. All rights reserved.
        </span>
    );
}
