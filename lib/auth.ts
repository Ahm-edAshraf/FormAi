import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isClerkConfigured } from '@/lib/clerk'

export async function getCurrentUserId() {
  if (!isClerkConfigured()) {
    return null
  }

  const { userId } = await auth()
  return userId
}

export async function redirectIfSignedIn(destination = '/dashboard') {
  if (!isClerkConfigured()) {
    return null
  }

  const { userId } = await auth()

  if (userId) {
    redirect(destination)
  }

  return userId
}

export async function requireUserId() {
  if (!isClerkConfigured()) {
    return null
  }

  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return userId
}
