/* eslint-disable react/no-unescaped-entities */
"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
	const { user, userProfile } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleCheckout = async () => {
		if (!user) {
			router.push("/login?redirect=pricing");
			return;
		}

		setIsLoading(true);

		try {
			// In a real implementation, this would redirect to Stripe Checkout
			// For demo purposes, we'll just update the user's subscription status
			await updateDoc(doc(db, "users", user.uid), {
				subscriptionStatus: "active",
			});

			toast({
				title: "Subscription activated",
				description:
					"Your premium subscription has been activated successfully!",
			});

			router.push("/dashboard");
		} catch (error) {
			console.error("Error during checkout:", error);
			toast({
				variant: "destructive",
				title: "Checkout failed",
				description: "Failed to process your subscription. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='border-b'>
				<div className='container flex h-16 items-center justify-between py-4'>
					<Link
						href='/'
						className='flex items-center gap-2 font-bold text-xl'
					>
						<span className='text-primary'>LinkedIn</span>
						<span>Ghostwriter</span>
					</Link>
					<div className='flex items-center gap-4'>
						{user ? (
							<Link href='/dashboard'>
								<Button variant='ghost'>Dashboard</Button>
							</Link>
						) : (
							<>
								<Link href='/login'>
									<Button variant='ghost'>Login</Button>
								</Link>
								<Link href='/signup'>
									<Button>Sign Up</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</header>
			<main className='flex-1'>
				<section className='py-12 md:py-24'>
					<div className='container px-4 md:px-6'>
						<div className='flex flex-col items-center justify-center space-y-4 text-center'>
							<div className='space-y-2'>
								<h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
									Simple, Transparent Pricing
								</h1>
								<p className='max-w-[700px] text-muted-foreground md:text-xl'>
									Choose the plan that works best for your LinkedIn content
									needs
								</p>
							</div>
						</div>
						<div className='mx-auto max-w-md py-12'>
							<Card className='shadow-lg'>
								<CardHeader className='text-center'>
									<CardTitle className='text-2xl'>Premium Plan</CardTitle>
									<CardDescription>
										Everything you need to build your LinkedIn presence
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-6'>
									<div className='flex justify-center'>
										<div className='flex items-baseline'>
											<span className='text-5xl font-bold'>$500</span>
											<span className='ml-1 text-muted-foreground'>/month</span>
										</div>
									</div>
									<ul className='space-y-3'>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>4 professionally edited posts per month</span>
										</li>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>Unlimited AI draft generation</span>
										</li>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>48-hour turnaround time</span>
										</li>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>Personalized writing style</span>
										</li>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>Content strategy consultation</span>
										</li>
										<li className='flex items-start gap-2'>
											<CheckCircle className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
											<span>Cancel anytime</span>
										</li>
									</ul>
								</CardContent>
								<CardFooter>
									<Button
										className='w-full'
										size='lg'
										onClick={handleCheckout}
										disabled={
											isLoading || userProfile?.subscriptionStatus === "active"
										}
									>
										{isLoading
											? "Processing..."
											: userProfile?.subscriptionStatus === "active"
											? "Already Subscribed"
											: "Subscribe Now"}
									</Button>
								</CardFooter>
							</Card>
						</div>
						<div className='mx-auto max-w-2xl text-center'>
							<h2 className='text-2xl font-bold mb-4'>
								Frequently Asked Questions
							</h2>
							<div className='space-y-4 text-left'>
								<div>
									<h3 className='font-bold'>
										How does the editing process work?
									</h3>
									<p className='text-muted-foreground'>
										After you generate an AI draft, our professional editors
										review and refine it to match your voice and business goals.
										You'll receive the edited post within 48 hours.
									</p>
								</div>
								<div>
									<h3 className='font-bold'>Can I cancel my subscription?</h3>
									<p className='text-muted-foreground'>
										Yes, you can cancel your subscription at any time. You'll
										continue to have access to the service until the end of your
										current billing period.
									</p>
								</div>
								<div>
									<h3 className='font-bold'>
										What if I don't use all 4 posts in a month?
									</h3>
									<p className='text-muted-foreground'>
										Posts don't roll over to the next month, but you can always
										generate unlimited AI drafts to save for later editing.
									</p>
								</div>
								<div>
									<h3 className='font-bold'>Do you offer refunds?</h3>
									<p className='text-muted-foreground'>
										We offer a 7-day money-back guarantee if you're not
										satisfied with our service.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className='border-t py-6 md:py-8'>
				<div className='container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between'>
					<div className='text-center md:text-left'>
						<p className='text-sm text-muted-foreground'>
							&copy; {new Date().getFullYear()} LinkedIn Ghostwriter. All rights
							reserved.
						</p>
					</div>
					<div className='flex gap-4'>
						<Link
							href='/terms'
							className='text-sm text-muted-foreground hover:underline'
						>
							Terms
						</Link>
						<Link
							href='/privacy'
							className='text-sm text-muted-foreground hover:underline'
						>
							Privacy
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
