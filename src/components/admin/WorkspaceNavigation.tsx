'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard } from 'lucide-react'

export function WorkspaceNavigation() {
  const pathname = usePathname()

  return (
    <div className="sp-workspace-nav">
      <Link href="/admin" className="sp-nav-brand" prefetch={false} aria-label="Solid Print — pulpit">
        <span className="sp-nav-mark" aria-hidden="true">SP</span>
        <strong>Solid Print</strong>
      </Link>
      <Link href="/admin" prefetch={false} aria-current={pathname === '/admin' ? 'page' : undefined}>
        <LayoutDashboard size={17} aria-hidden="true" /> Pulpit
      </Link>
      <Link href="/admin/stan-systemu" prefetch={false} aria-current={pathname === '/admin/stan-systemu' ? 'page' : undefined}>
        <Activity size={17} aria-hidden="true" /> Stan systemu
      </Link>
    </div>
  )
}
