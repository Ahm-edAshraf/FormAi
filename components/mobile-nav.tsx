'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut, Crown, BarChart3, Settings, Home } from 'lucide-react'

export function MobileNav() {
  const router = useRouter()
  const clerk = useClerk()

  const handleLogout = async () => {
    await clerk.signOut({ redirectUrl: '/' })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="sm:hidden text-white" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-slate-900 border-slate-700 w-80">
        <div className="flex flex-col gap-2 mt-8">
          <Button variant="ghost" className="justify-start text-white" onClick={() => router.push('/dashboard')}>
            <Home className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button variant="ghost" className="justify-start text-white" onClick={() => router.push('/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
          </Button>
          <Button variant="ghost" className="justify-start text-white" onClick={() => router.push('/settings')}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="ghost" className="justify-start text-white" onClick={() => router.push('/billing')}>
            <Crown className="w-4 h-4 mr-2" /> Billing
          </Button>
          <div className="h-px w-full bg-slate-700 my-2" />
          <Button variant="ghost" className="justify-start text-red-300 hover:text-red-200" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

