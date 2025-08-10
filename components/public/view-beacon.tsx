'use client'

import { useEffect } from 'react'

export function ViewBeacon({ formId }: { formId: string }) {
  useEffect(() => {
    fetch(`/api/forms/${formId}/view`, { method: 'POST' }).catch(() => {})
  }, [formId])
  return null
}


