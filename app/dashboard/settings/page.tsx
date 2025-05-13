"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const handleSaveSettings = async () => {
    if (!user) return

    setIsSaving(true)

    try {
      await updateDoc(doc(db, "users", user.uid), {
        settings: {
          emailNotifications,
          marketingEmails,
        },
      })

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Failed to save your settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when your posts are edited
                  </p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new features and offers</p>
                </div>
                <Switch id="marketing-emails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage your subscription settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Plan</span>
                    <span>{userProfile?.subscriptionStatus === "active" ? "Premium" : "None"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    <span className="capitalize">{userProfile?.subscriptionStatus || "Inactive"}</span>
                  </div>
                  {userProfile?.subscriptionStatus === "active" && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Next Billing Date</span>
                      <span>June 15, 2025</span>
                    </div>
                  )}
                </div>
              </div>

              {userProfile?.subscriptionStatus === "active" ? (
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              ) : (
                <Button className="w-full" onClick={() => (window.location.href = "/pricing")}>
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showDeleteAlert ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Deleting your account is permanent. All your data will be permanently removed. This action cannot be
                    undone.
                  </AlertDescription>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowDeleteAlert(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        toast({
                          title: "Account deletion requested",
                          description: "We've sent you an email to confirm your account deletion.",
                        })
                        setShowDeleteAlert(false)
                      }}
                    >
                      Confirm Delete
                    </Button>
                  </div>
                </Alert>
              ) : (
                <Button variant="destructive" onClick={() => setShowDeleteAlert(true)}>
                  Delete Account
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
