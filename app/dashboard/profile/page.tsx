"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { db, auth } from "@/lib/firebase"

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [writingStyle, setWritingStyle] = useState("Technical")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "")
      setCompany(userProfile.company || "")
      setWritingStyle(userProfile.preferredWritingStyle || "Technical")
    } else if (user) {
      setName(user.displayName || "")
    }
  }, [user, userProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsUpdating(true)

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: name,
      })

      // Update Firestore profile
      await updateDoc(doc(db, "users", user.uid), {
        name,
        company,
        preferredWritingStyle: writingStyle,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Loading Profile...</h2>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="writing-style">Preferred Writing Style</Label>
                    <Select value={writingStyle} onValueChange={setWritingStyle}>
                      <SelectTrigger id="writing-style">
                        <SelectValue placeholder="Select a writing style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Visionary">Visionary</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Status</Label>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span>Current Plan</span>
                      <span className="font-medium">
                        {userProfile?.subscriptionStatus === "active" ? "Premium" : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
