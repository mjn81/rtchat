'use client';
import { FC, useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';

interface LoginProps {}
type OAuthLoginMethods = 'google' | 'github';

const Login: FC<LoginProps> = () => {
	const [isLoading, setIsLoading] = useState<OAuthLoginMethods | null>(null);
	async function loginWithOAuth(method: OAuthLoginMethods) {
		setIsLoading(method);
		try {
			await signIn(method);
		} catch (error) {
			console.log(error);
			toast.error('Something went wrong with your login.');
		} finally {
			setIsLoading(null);
		}
	}
	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-5 h-screen">
				<div className="px-4 lg:px-6 col-span-2 w-full h-full flex flex-col items-center justify-center mx-auto max-w-md space-y-8 ">
					<div className="w-full flex flex-col items-center lg:items-start">
						<Image
							className="lg:absolute lg:inset-0"
							src="/logo.svg"
							alt="RTChat"
							width={128}
							height={128}
						/>
						<h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
							Welcome <span className="text-primary">Back!</span>
						</h2>
						<p className='text-muted-foreground font-light leading-5 text-sm mt-2'>
							If you don&apos;t have an account already. Don&apos;t worry just click bellow and we will take care of it.
						</p>
					</div>
					<div className="space-y-3 w-full">
						<Button
							onClick={() => loginWithOAuth('google')}
							disabled={!!isLoading}
							type="button"
							variant="outline"
							className="max-w-sm mx-auto w-full text-sm"
						>
							{isLoading === 'google' ? (
								<Loader2 className="w-4 h-4 animate-spin mr-1" />
							) : (
								<Image
									src="/google.svg"
									width={20}
									height={20}
									alt="google_login"
									className="mr-1"
								/>
							)}
							Google
						</Button>
						<Button
							onClick={() => loginWithOAuth('github')}
							disabled={!!isLoading}
							type="button"
							variant="outline"
							className="max-w-sm mx-auto w-full text-sm"
						>
							{isLoading ==='github' ? (
								<Loader2 className="w-4 h-4 animate-spin mr-1" />
							) : (
								<Image
									src="/github-mark.svg"
									width={20}
									height={20}
									alt="github_login"
									className="mr-1"
								/>
							)}
							Github
						</Button>
					</div>
				</div>
				<div
					aria-hidden
					className="h-full w-full login-image relative aspect-square overflow-hidden hidden lg:block lg:col-span-3 bg-indigo-500 border-l-2 shadow-inner border-r-indigo-600"
				>
					<div className="absolute inset-0 w-full h-full bg-indigo-900/80" />
				</div>
			</div>
		</>
	);
};

export default Login;
