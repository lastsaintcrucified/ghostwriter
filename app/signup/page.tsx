/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	createUserWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	updateProfile,
	getAdditionalUserInfo,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [company, setCompany] = useState("");
	const [writingStyle, setWritingStyle] = useState("Technical");
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const createUserProfile = async (uid: string, userData: any) => {
		await setDoc(doc(db, "users", uid), {
			...userData,
			subscriptionStatus: "inactive",
			createdAt: new Date().toISOString(),
		});
	};

	const handleEmailSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			await updateProfile(user, { displayName: name });

			await createUserProfile(user.uid, {
				name,
				email,
				company,
				preferredWritingStyle: writingStyle,
			});

			toast({
				title: "Account created",
				description: "Welcome to LinkedIn Ghostwriter!",
			});

			router.push("/dashboard");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Signup failed",
				description: error.message || "An error occurred during signup.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignup = async () => {
		setIsLoading(true);
		const provider = new GoogleAuthProvider();

		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if this is a new user
			const additionalUserInfo = getAdditionalUserInfo(result);
			const isNewUser = additionalUserInfo?.isNewUser;

			if (isNewUser) {
				await createUserProfile(user.uid, {
					name: user.displayName || "",
					email: user.email || "",
					company: "",
					preferredWritingStyle: "Technical",
				});

				toast({
					title: "Account created",
					description: "Welcome to LinkedIn Ghostwriter!",
				});
			} else {
				toast({
					title: "Login successful",
					description: "Welcome back to LinkedIn Ghostwriter!",
				});
			}

			router.push("/dashboard");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Google signup failed",
				description: error.message || "An error occurred during Google signup.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='container flex h-screen w-screen flex-col items-center justify-center'>
			<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
				<div className='flex flex-col space-y-2 text-center'>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Create an account
					</h1>
					<p className='text-sm text-muted-foreground'>
						Sign up for LinkedIn Ghostwriter to get started
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Sign Up</CardTitle>
						<CardDescription>
							Choose your preferred signup method
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Button
								variant='outline'
								className='w-full'
								onClick={handleGoogleSignup}
								disabled={isLoading}
							>
								<svg
									className='mr-2 h-4 w-4'
									aria-hidden='true'
									focusable='false'
									data-prefix='fab'
									data-icon='google'
									role='img'
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 488 512'
								>
									<path
										fill='currentColor'
										d='M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z'
									></path>
								</svg>
								Continue with Google
							</Button>
						</div>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<span className='w-full border-t' />
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-background px-2 text-muted-foreground'>
									Or continue with
								</span>
							</div>
						</div>
						<form onSubmit={handleEmailSignup}>
							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										type='text'
										placeholder='John Doe'
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										placeholder='name@example.com'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='password'>Password</Label>
									<Input
										id='password'
										type='password'
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='company'>Company</Label>
									<Input
										id='company'
										type='text'
										placeholder='Your Company'
										value={company}
										onChange={(e) => setCompany(e.target.value)}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='writing-style'>Preferred Writing Style</Label>
									<Select
										value={writingStyle}
										onValueChange={setWritingStyle}
									>
										<SelectTrigger id='writing-style'>
											<SelectValue placeholder='Select a writing style' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='Technical'>Technical</SelectItem>
											<SelectItem value='Visionary'>Visionary</SelectItem>
											<SelectItem value='Casual'>Casual</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button
									type='submit'
									disabled={isLoading}
								>
									{isLoading ? "Creating account..." : "Create Account"}
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter>
						<div className='text-sm text-muted-foreground text-center w-full'>
							Already have an account?{" "}
							<Link
								href='/login'
								className='text-primary underline-offset-4 hover:underline'
							>
								Sign in
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
