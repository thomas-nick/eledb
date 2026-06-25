"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ManageNavLinkProps {
  onNavigate?: () => void;
}

export function ManageNavLink({ onNavigate }: ManageNavLinkProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      setCount(0);
      return;
    }
    let active = true;
    fetch("/api/manage/summary")
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => {
        if (active) setCount(Number(data.count) || 0);
      })
      .catch(() => {
        if (active) setCount(0);
      });
    return () => {
      active = false;
    };
  }, [status]);

  if (count < 1) return null;

  return (
    <Link
      href="/manage"
      onClick={onNavigate}
      className={cn(
        "text-sm font-medium transition-colors hover:text-clay",
        pathname.startsWith("/manage") ? "text-clay" : "text-muted"
      )}
    >
      Manage
    </Link>
  );
}
