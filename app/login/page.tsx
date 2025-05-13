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
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await signInWithEmailAndPassword(auth, email, password);
			toast({
				title: "Login successful",
				description: "Welcome back to LinkedIn Ghostwriter!",
			});
			router.push("/dashboard");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Login failed",
				description:
					error.message || "Please check your credentials and try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		const provider = new GoogleAuthProvider();

		try {
			await signInWithPopup(auth, provider);
			toast({
				title: "Login successful",
				description: "Welcome to LinkedIn Ghostwriter!",
			});
			router.push("/dashboard");
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Google login failed",
				description: error.message || "An error occurred during Google login.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='container flex h-screen w-screen flex-col items-center justify-center'>
			<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
				<div className='flex flex-col space-y-2 text-center'>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Welcome back
					</h1>
					<p className='text-sm text-muted-foreground'>
						Sign in to your LinkedIn Ghostwriter account
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Login</CardTitle>
						<CardDescription>
							Choose your preferred login method
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Button
								variant='outline'
								className='w-full'
								onClick={handleGoogleLogin}
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
						<form onSubmit={handleEmailLogin}>
							<div className='grid gap-4'>
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
									<div className='flex items-center justify-between'>
										<Label htmlFor='password'>Password</Label>
										<Link
											href='/forgot-password'
											className='text-sm text-primary underline-offset-4 hover:underline'
										>
											Forgot password?
										</Link>
									</div>
									<Input
										id='password'
										type='password'
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<Button
									type='submit'
									disabled={isLoading}
								>
									{isLoading ? "Signing in..." : "Sign In"}
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter>
						<div className='text-sm text-muted-foreground text-center w-full'>
							Don&apos;t have an account?{" "}
							<Link
								href='/signup'
								className='text-primary underline-offset-4 hover:underline'
							>
								Sign up
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
