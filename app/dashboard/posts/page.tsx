/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
	collection,
	getDocs,
	query,
	where,
	orderBy,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type Post = {
	id: string;
	title: string;
	status: string;
	createdAt: string;
	updatedAt: string;
};

export default function PostsPage() {
	const { user } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [postToDelete, setPostToDelete] = useState<string | null>(null);

	useEffect(() => {
		const fetchPosts = async () => {
			if (!user) return;

			try {
				const postsRef = collection(db, "posts");
				const q = query(
					postsRef,
					where("userId", "==", user.uid),
					orderBy("createdAt", "desc")
				);
				const querySnapshot = await getDocs(q);

				const fetchedPosts: Post[] = [];
				querySnapshot.forEach((doc) => {
					fetchedPosts.push({
						id: doc.id,
						...doc.data(),
					} as Post);
				});

				setPosts(fetchedPosts);
			} catch (error) {
				console.error("Error fetching posts:", error);
				toast({
					variant: "destructive",
					title: "Error",
					description: "Failed to load posts. Please try again.",
				});
			} finally {
				setIsLoading(false);
			}
		};

		if (user) {
			fetchPosts();
		}
	}, [user, toast]);

	const handleDeletePost = async () => {
		if (!postToDelete) return;

		try {
			await deleteDoc(doc(db, "posts", postToDelete));

			setPosts(posts.filter((post) => post.id !== postToDelete));

			toast({
				title: "Post deleted",
				description: "Your post has been deleted successfully.",
			});
		} catch (error) {
			console.error("Error deleting post:", error);
			toast({
				variant: "destructive",
				title: "Delete failed",
				description: "Failed to delete post. Please try again.",
			});
		} finally {
			setPostToDelete(null);
		}
	};

	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case "draft":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "ready_for_review":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "published":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
		}
	};

	const formatStatus = (status: string) => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	return (
		<DashboardLayout>
			<div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
				<div className='flex items-center justify-between'>
					<h2 className='text-3xl font-bold tracking-tight'>My Posts</h2>
					<Link href='/dashboard/create'>
						<Button>
							<Plus className='mr-2 h-4 w-4' /> Create New Post
						</Button>
					</Link>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>LinkedIn Posts</CardTitle>
						<CardDescription>
							Manage all your LinkedIn post drafts
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className='flex justify-center py-6'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
							</div>
						) : posts.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Updated</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{posts.map((post) => (
										<TableRow key={post.id}>
											<TableCell className='font-medium'>
												{post.title}
											</TableCell>
											<TableCell>
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
														post.status
													)}`}
												>
													{formatStatus(post.status)}
												</span>
											</TableCell>
											<TableCell>
												{new Date(post.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{new Date(post.updatedAt).toLocaleDateString()}
											</TableCell>
											<TableCell className='text-right'>
												<div className='flex justify-end gap-2'>
													<Link href={`/dashboard/posts/${post.id}`}>
														<Button
															variant='ghost'
															size='icon'
														>
															<Edit className='h-4 w-4' />
															<span className='sr-only'>Edit</span>
														</Button>
													</Link>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant='ghost'
																size='icon'
																onClick={() => setPostToDelete(post.id)}
															>
																<Trash className='h-4 w-4 text-red-500' />
																<span className='sr-only'>Delete</span>
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete Post</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete this post?
																	This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel
																	onClick={() => setPostToDelete(null)}
																>
																	Cancel
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={handleDeletePost}
																	className='bg-red-500 hover:bg-red-600'
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className='text-center py-6 text-muted-foreground'>
								<p className='mb-4'>
									No posts yet. Create your first LinkedIn post!
								</p>
								<Link href='/dashboard/create'>
									<Button>
										<Plus className='mr-2 h-4 w-4' /> Create New Post
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</DashboardLayout>
	);
}
