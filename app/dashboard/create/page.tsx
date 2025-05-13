/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Copy } from "lucide-react";

export default function CreatePostPage() {
	const { user, userProfile } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const [topic, setTopic] = useState("");
	const [tone, setTone] = useState("Professional");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedContent, setGeneratedContent] = useState("");

	const generateDraft = async () => {
		if (!topic) {
			toast({
				variant: "destructive",
				title: "Topic required",
				description: "Please enter a topic for your LinkedIn post.",
			});
			return;
		}

		setIsGenerating(true);
		setGeneratedContent("");

		try {
			// Call the OpenRouter API
			const response = await fetch("/api/generate-post", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					topic,
					tone,
					industry: userProfile?.company || "Startup",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate content");
			}

			const data = await response.json();
			setGeneratedContent(data.content);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Generation failed",
				description: `${error.message}, please try again.`,
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(generatedContent);
		toast({
			title: "Copied to clipboard",
			description: "The generated content has been copied to your clipboard.",
		});
	};

	const saveToEditor = async () => {
		if (!user || !generatedContent) return;

		try {
			const docRef = await addDoc(collection(db, "posts"), {
				userId: user.uid,
				title: topic,
				content: generatedContent,
				tone,
				status: "draft",
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			toast({
				title: "Draft saved",
				description: "Your post has been sent to the editor.",
			});

			router.push(`/dashboard/posts/${docRef.id}`);
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Save failed",
				description: `${error.message},post not saved`,
			});
		}
	};

	return (
		<DashboardLayout>
			<div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
				<div className='flex items-center justify-between'>
					<h2 className='text-3xl font-bold tracking-tight'>
						Create LinkedIn Post
					</h2>
				</div>

				<div className='grid gap-4 md:grid-cols-2'>
					<Card className='md:col-span-1'>
						<CardHeader>
							<CardTitle>Generate AI Draft</CardTitle>
							<CardDescription>
								Enter your topic and select a tone to generate a LinkedIn post
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='topic'>What do you want to post about?</Label>
								<Textarea
									id='topic'
									placeholder='E.g., Our startup just raised Series A funding'
									value={topic}
									onChange={(e) => setTopic(e.target.value)}
									rows={4}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='tone'>Tone</Label>
								<Select
									value={tone}
									onValueChange={setTone}
								>
									<SelectTrigger id='tone'>
										<SelectValue placeholder='Select a tone' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='Professional'>Professional</SelectItem>
										<SelectItem value='Engaging'>Engaging</SelectItem>
										<SelectItem value='Controversial'>Controversial</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
						<CardFooter>
							<Button
								onClick={generateDraft}
								disabled={isGenerating || !topic}
								className='w-full'
							>
								{isGenerating ? "Generating..." : "Generate Draft"}
							</Button>
						</CardFooter>
					</Card>

					<Card className='md:col-span-1'>
						<CardHeader>
							<CardTitle>Generated Draft</CardTitle>
							<CardDescription>
								Your AI-generated LinkedIn post draft
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isGenerating ? (
								<div className='space-y-2'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-3/4' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-5/6' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-2/3' />
								</div>
							) : generatedContent ? (
								<div className='whitespace-pre-line rounded-md border p-4 text-sm'>
									{generatedContent}
								</div>
							) : (
								<div className='flex h-[200px] items-center justify-center text-center text-muted-foreground'>
									<p>Generated content will appear here</p>
								</div>
							)}
						</CardContent>
						{generatedContent && (
							<CardFooter className='flex flex-col space-y-2'>
								<div className='flex w-full gap-2'>
									<Button
										variant='outline'
										className='flex-1'
										onClick={copyToClipboard}
									>
										<Copy className='mr-2 h-4 w-4' />
										Copy
									</Button>
									<Button
										className='flex-1'
										onClick={saveToEditor}
									>
										Send to Editor
									</Button>
								</div>
							</CardFooter>
						)}
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}
