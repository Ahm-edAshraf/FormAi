'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Shield, Bell, ArrowLeft, Save, Eye, EyeOff, Sparkles } from 'lucide-react'
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { MobileNav } from '@/components/mobile-nav'

export function AccountSettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null)
  const [userAgent, setUserAgent] = useState<string>('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [company, setCompany] = useState('')
  const [notifySubs, setNotifySubs] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(true)
  const [notifyUpdates, setNotifyUpdates] = useState(true)
  const [notifyMarketing, setNotifyMarketing] = useState(false)
  const [dndFrom, setDndFrom] = useState('22:00')
  const [dndTo, setDndTo] = useState('08:00')
  const [twoFactor, setTwoFactor] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      const supabase = createSupabaseBrowser()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return
      setEmail(userData.user.email ?? '')
      setLastSignInAt(userData.user.last_sign_in_at ?? null)
      // Client-only user agent details
      setUserAgent(`${navigator.platform} • ${navigator.userAgent}`)
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userData.user.id).single()
      if (profile) {
        setFirstName(profile.first_name ?? '')
        setLastName(profile.last_name ?? '')
        setCompany(profile.company ?? '')
        setBio(profile.bio ?? '')
        setNotifySubs(profile.notify_submissions ?? true)
        setNotifyWeekly(profile.notify_weekly ?? true)
        setNotifyUpdates(profile.notify_updates ?? true)
        setNotifyMarketing(profile.notify_marketing ?? false)
        setDndFrom(profile.dnd_from ?? '22:00')
        setDndTo(profile.dnd_to ?? '08:00')
        setTwoFactor(profile.two_factor_enabled ?? false)
      }
    })()
  }, [])

  const handleSave = async () => {
    try {
      const supabase = createSupabaseBrowser()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return
      const updates = {
        first_name: firstName,
        last_name: lastName,
        company,
        bio,
        notify_submissions: notifySubs,
        notify_weekly: notifyWeekly,
        notify_updates: notifyUpdates,
        notify_marketing: notifyMarketing,
        dnd_from: dndFrom,
        dnd_to: dndTo,
        two_factor_enabled: twoFactor,
      }
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', userData.user.id)
      if (error) throw error
      toast({ title: 'Settings saved' })
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message ?? 'Please try again', variant: 'destructive' as any })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-white inline-flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </a>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Account Settings</h1>
                  <p className="text-sm text-slate-400">Manage your account preferences</p>
            </div>
            <div className="sm:hidden"><MobileNav /></div>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              className="glow-effect bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="profile" className="text-white">Profile</TabsTrigger>
            <TabsTrigger value="security" className="text-white">Security</TabsTrigger>
            <TabsTrigger value="notifications" className="text-white">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <Button variant="outline" className="border-slate-600 text-white hover:border-slate-500">
                        Change Avatar
                      </Button>
                      <p className="text-slate-400 text-sm mt-2">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-white">First Name</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-slate-800 border-slate-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Last Name</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-slate-800 border-slate-600 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Email Address</Label>
                    <Input type="email" value={email} disabled className="bg-slate-800 border-slate-600 text-white" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Bio</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="bg-slate-800 border-slate-600 text-white" rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Company</Label>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company name" className="bg-slate-800 border-slate-600 text-white" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm">Password changes are handled via the sign-in reset flow.</p>
                    </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Enable 2FA</p>
                        <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <Switch checked={twoFactor} onCheckedChange={async (checked) => {
                        setTwoFactor(checked)
                        const supabase = createSupabaseBrowser()
                        const { data: userData } = await supabase.auth.getUser()
                        if (!userData?.user) return
                        await supabase.from('profiles').update({ two_factor_enabled: checked }).eq('user_id', userData.user.id)
                      }} />
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Login Sessions</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-white font-medium">Current Session</p>
                          <p className="text-slate-400 text-sm break-all">{userAgent || 'This device'}</p>
                          {lastSignInAt && (
                            <p className="text-slate-500 text-xs mt-1">Last sign-in: {new Date(lastSignInAt).toLocaleString()}</p>
                          )}
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-white"
                          onClick={async () => {
                            const supabase = createSupabaseBrowser()
                            await supabase.auth.signOut()
                            window.location.href = '/'
                          }}
                        >
                          Sign out of this device
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-medium mb-4">Email Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Form Submissions</p>
                            <p className="text-slate-400 text-sm">Get notified when someone submits a form</p>
                          </div>
                          <Switch checked={notifySubs} onCheckedChange={setNotifySubs} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Weekly Reports</p>
                            <p className="text-slate-400 text-sm">Receive weekly analytics summaries</p>
                          </div>
                          <Switch checked={notifyWeekly} onCheckedChange={setNotifyWeekly} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Product Updates</p>
                            <p className="text-slate-400 text-sm">Stay informed about new features</p>
                          </div>
                          <Switch checked={notifyUpdates} onCheckedChange={setNotifyUpdates} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Marketing Emails</p>
                            <p className="text-slate-400 text-sm">Tips, tutorials, and promotional content</p>
                          </div>
                          <Switch checked={notifyMarketing} onCheckedChange={setNotifyMarketing} />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div>
                      <h4 className="text-white font-medium mb-4">Push Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Real-time Submissions</p>
                            <p className="text-slate-400 text-sm">Instant notifications for new submissions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">System Alerts</p>
                            <p className="text-slate-400 text-sm">Important system notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div>
                      <h4 className="text-white font-medium mb-4">Notification Schedule</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Do Not Disturb</p>
                            <p className="text-slate-400 text-sm">Pause notifications during these hours</p>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">From</Label>
                            <Input type="time" value={dndFrom} onChange={(e) => setDndFrom(e.target.value)} className="bg-slate-800 border-slate-600 text-white" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">To</Label>
                            <Input type="time" value={dndTo} onChange={(e) => setDndTo(e.target.value)} className="bg-slate-800 border-slate-600 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
