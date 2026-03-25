'use client'

import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-slate-400 text-center">
            Authentication now runs through Clerk. Continue to the dedicated auth screens.
          </p>

          <div className="grid gap-3">
            <Button asChild className="w-full glow-effect bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/sign-in">
                <LogIn className="w-4 h-4 mr-2" />
                Continue to Sign In
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full border-slate-600 text-white hover:border-slate-500">
              <Link href="/sign-up">
                <UserPlus className="w-4 h-4 mr-2" />
                Continue to Sign Up
              </Link>
            </Button>
          </div>

          <div className="relative">
            <Separator className="bg-slate-700" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-sm text-slate-400">
              or
            </span>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-slate-400 hover:text-white" onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Need an account instead?' : 'Already have an account instead?'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
