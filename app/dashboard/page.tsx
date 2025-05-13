"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FileText, Plus, Settings, User } from "lucide-react"
import Link from "next/link"

type Post = {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return

      try {
        const postsRef = collection(db, "posts")
        const q = query(postsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const fetchedPosts: Post[] = []
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({
            id: doc.id,
            ...doc.data(),
          } as Post)
        })

        setPosts(fetchedPosts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPosts()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Link href="/dashboard/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create New Post
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{posts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{userProfile?.subscriptionStatus || "Inactive"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Writing Style</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile?.preferredWritingStyle || "Not set"}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Your most recent LinkedIn post drafts</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-center justify-between border-b pb-4">
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Status: <span className="capitalize">{post.status}</span>
                            </div>
                          </div>
                          <Link href={`/dashboard/posts/${post.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No posts yet. Create your first LinkedIn post!
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard/posts" className="w-full">
                    <Button variant="outline" className="w-full">
                      View All Posts
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My LinkedIn Posts</CardTitle>
                <CardDescription>Manage all your LinkedIn post drafts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Status: <span className="capitalize">{post.status}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Link href={`/dashboard/posts/${post.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No posts yet. Create your first LinkedIn post!
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/create" className="w-full">
                  <Button className="w-full">Create New Post</Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your LinkedIn Ghostwriter subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Current Plan</div>
                      <div className="font-bold">
                        {userProfile?.subscriptionStatus === "active" ? "Premium" : "None"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Status</div>
                      <div className="capitalize font-medium">{userProfile?.subscriptionStatus || "Inactive"}</div>
                    </div>
                    {userProfile?.subscriptionStatus === "active" && (
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Posts Remaining</div>
                        <div>4</div>
                      </div>
                    )}
                  </div>
                </div>

                {userProfile?.subscriptionStatus !== "active" && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">Premium Plan</h3>
                        <p className="text-muted-foreground">$500/month - 4 posts per month</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span>4 professionally edited posts per month</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span>Unlimited AI draft generation</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <span>48-hour turnaround time</span>
                        </li>
                      </ul>
                      <Link href="/pricing">
                        <Button className="w-full">Subscribe Now</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
