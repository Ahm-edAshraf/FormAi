'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export default function ToastEffect() {
  const params = useSearchParams()
  const router = useRouter()
  const hasShownRef = useRef(false)
  useEffect(() => {
    if (hasShownRef.current) return
    const submitted = params.get('submitted')
    const error = params.get('error')
    if (submitted === '1') {
      toast({ title: 'Thanks!', description: 'Your response has been submitted.' })
      const newParams = new URLSearchParams(params.toString())
      newParams.delete('submitted')
      router.replace('?' + newParams.toString())
      hasShownRef.current = true
    } else if (error === 'already_submitted') {
      toast({ title: 'Already submitted', description: 'This form allows only one submission.', variant: 'destructive' as any })
      const newParams = new URLSearchParams(params.toString())
      newParams.delete('error')
      router.replace('?' + newParams.toString())
      hasShownRef.current = true
    } else if (error === 'failed') {
      toast({ title: 'Submission failed', description: 'Please check your entries and try again.', variant: 'destructive' as any })
      const newParams = new URLSearchParams(params.toString())
      newParams.delete('error')
      router.replace('?' + newParams.toString())
      hasShownRef.current = true
    }
  }, [params, router])
  return null
}


