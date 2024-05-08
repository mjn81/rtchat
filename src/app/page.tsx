import DownloadButton from '@/components/DownloadButton';
import { Logo } from '@/components/Logo';
import { buttonVariants } from '@/components/ui/button';
import { COMING_SOON_FEATURES } from '@/constants/features';
import { authOptions } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
	ArrowRight,
	MessageSquareDashed,
	MessageSquareHeart,
	MessageSquareText,
} from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function Home() {
	const session = await getServerSession(authOptions);
	const isLoggedIn = !!session;
	
	return (
		<main className="min-h-screen bg-gray-50">
			<header className="px-3 min-h-14 border-b border-border sticky flex items-center justify-between inset-x-0 top-0 z-30 w-full bg-background/75 backdrop-blur-lg transition-all">
				<nav className="flex gap-7">
					<Logo />
					<ul className="text-sm flex items-center font-semibold">
						<Link href="#coming-soon" className="text-gray-800">
							Coming Soon!
						</Link>
					</ul>
				</nav>
				<section>
					<Link
						href={isLoggedIn ? '/chat' : '/login'}
						className={cn(
							buttonVariants({
								variant: 'default',
							}),
							'font-semibold group'
						)}
					>
						{isLoggedIn ? 'Go to Chats' : 'Get Started'}
						<ArrowRight
							aria-hidden
							className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
						/>
					</Link>
				</section>
			</header>
			<div className="animate-pulse mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 shadow-md transition-all bg-background hover:bg-background/50 overflow-hidden backdrop-blur py-1.5 px-3 border border-border rounded-full absolute top-16 -translate-x-1/2 left-1/2 text-xs text-gray-700 font-bold">
				RTChat is now in <span className="text-primary ml-0.5">beta</span>!
			</div>
			<section className="isolate overflow-hidden relative text-center mx-auto h-[calc(100vh-2rem)] px-3 flex flex-col items-center justify-center gap-2">
				<div className="max-w-5xl space-y-6">
					<h1 className="text-foreground font-bold text-4xl lg:text-5xl xl:text-6xl tracking-tight">
						Experience Seamless Communication with{' '}
						<span className="text-primary">RTChat</span>
					</h1>
					<p className="max-w-3xl mx-auto text-gray-800 tracking-tighter leading-6 text-base lg:text-lg xl:text-xl">
						Chat with Ease, Stay Anonymous. Enjoy Real-Time, Secure
						Conversations Worldwide—Connect, Communicate, and Remain
						Confidential, Anytime, Anywhere.
					</p>
				</div>
				<div className="flex flex-col md:flex-row items-center justify-center mt-4 gap-4">
					<DownloadButton />
					<Link
						href={isLoggedIn ? '/chat' : '/login'}
						className={cn(
							buttonVariants({
								variant: 'default',
								size: 'lg',
							}),
							'max-md:w-full shadow-lg font-semibold group'
						)}
					>
						{isLoggedIn ? 'Go to Chats' : 'Get Started'}
						<ArrowRight
							aria-hidden
							className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
						/>
					</Link>
				</div>
				{/* design */}

				<MessageSquareHeart className="w-3/4 h-3/4 absolute -z-10 top-0 -left-1/4 text-muted-foreground/10" />
				<MessageSquareText className=" w-1/2 h-1/2 absolute -z-10 -scale-x-100 top-20 -right-[15%] text-muted-foreground/10" />
				<MessageSquareDashed className="w-3/4 h-3/4 absolute -z-10 top-[68%]  text-muted-foreground/5" />

				<div className="animate-blob-left transform-gpu origin-center -z-20 mix-blend-multiply filter blur-xl absolute top-[10%] left-[19%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-indigo-300/20"></div>
				<div className="animate-blob-right transform-gpu origin-center animation-delay-2000 -z-20 mix-blend-multiply filter blur-xl absolute top-[20%] right-[18%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-amber-300/20"></div>
				<div className="animate-blob transform-gpu origin-center animation-delay-4000 -z-20 mix-blend-multiply filter blur-xl absolute top-[35%] left-[30%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-rose-300/20"></div>
			</section>

			<section
				id="coming-soon"
				className="min-h-[calc(100vh-5rem)] bg-muted border-y-2 border-muted flex flex-col items-center py-16 px-4"
			>
				<h2 className="mx-auto text-center text-foreground font-bold text-4xl  lg:text-5xl tracking-tight">
					Coming Soon!
				</h2>
				<p className="text-center mt-5 mb-3 text-muted-foreground tracking-tight leading-6 text-sm lg:text-base xl:text-lg">
					See What Exciting New Features and Enhancements We&apos;re Bringing to
					You Soon!
				</p>
				<div className="flex-1 grid grid-cols-1 place-items-center lg:grid-cols-3 gap-6 mt-10">
					{COMING_SOON_FEATURES.map(
						({ title, description, id, icon: Icon }) => (
							<div
								key={id}
								className="bg-background p-6 xl:p-8 2xl:p-10 items-center col-span-1 overflow-hidden max-w-sm border border-border rounded-lg shadow-lg"
							>
								<section className="flex items-center gap-2 mb-3">
									{<Icon className="text-primary" />}
									<h4 className="text-xl font-bold text-gray-700">{title}</h4>
								</section>
								<p className="text-muted-foreground leading-7 font-light">
									{description}
								</p>
							</div>
						)
					)}
				</div>
			</section>

			<footer className="min-h-16 text-center flex items-center justify-center gap-3 mx-auto">
				<h3 className="text-muted-foreground text-sm font-semibold">
					Made by{' '}
					<a href="https://devmjn.com" className="underline font-bold">
						Mjn
					</a>
				</h3>
			</footer>
		</main>
	);
}
