"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

type Post = {
  id: string
  title: string
  content: string
  tone: string
  status: string
  createdAt: string
  updatedAt: string
  editorNotes?: string
}

export default function PostDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("draft")
  const [editorNotes, setEditorNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!user || !postId) return

      try {
        const docRef = doc(db, "posts", postId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const postData = docSnap.data() as Omit<Post, "id">
          const fetchedPost = {
            id: postId,
            ...postData,
          } as Post

          setPost(fetchedPost)
          setContent(fetchedPost.content)
          setStatus(fetchedPost.status)
          setEditorNotes(fetchedPost.editorNotes || "")
        } else {
          toast({
            variant: "destructive",
            title: "Post not found",
            description: "The requested post could not be found.",
          })
          router.push("/dashboard/posts")
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPost()
    }
  }, [user, postId, router, toast])

  useEffect(() => {
    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (post && content !== post.content) {
        handleSave(false)
      }
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [post, content])

  const handleSave = async (showToast = true) => {
    if (!user || !postId) return

    setIsSaving(true)

    try {
      const docRef = doc(db, "posts", postId)
      await updateDoc(docRef, {
        content,
        status,
        editorNotes,
        updatedAt: serverTimestamp(),
      })

      setLastSaved(new Date())

      if (showToast) {
        toast({
          title: "Post saved",
          description: "Your post has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Failed to save your post. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Loading Post...</h2>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Post Not Found</h2>
          </div>
          <div className="flex justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">The requested post could not be found.</p>
              <Link href="/dashboard/posts">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/posts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">{post.title}</h2>
          </div>
          <Button onClick={() => handleSave()} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Post</CardTitle>
              <CardDescription>Edit your LinkedIn post content</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="font-medium"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
              </div>
              <Button onClick={() => handleSave()} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Manage your post status and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready_for_review">Ready for Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editor-notes">Editor Notes</Label>
                <Textarea
                  id="editor-notes"
                  placeholder="Add notes for the editor..."
                  value={editorNotes}
                  onChange={(e) => setEditorNotes(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Created</span>
                  <span className="text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Last Updated</span>
                  <span className="text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatus("ready_for_review")
                  handleSave()
                }}
                disabled={isSaving || status === "ready_for_review"}
              >
                Submit for Review
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
