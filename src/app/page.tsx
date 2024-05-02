import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  return (
		<main className="min-h-screen bg-gray-50">
			<header className="px-3 min-h-14 border-b border-border sticky flex items-center justify-between inset-x-0 top-0 z-30 w-full bg-background/75 backdrop-blur-lg transition-all">
				<nav>
					<Link href="/" className="font-bold text-gray-700">
						{/* <Image width={56} height={56} src="/logo.svg" alt="rtchat-logo" /> */}
						<span className="text-primary">RT</span>
						Chat
					</Link>
					<ul></ul>
				</nav>
				<section>
					<Link
						href={isLoggedIn ? '/chat' : '/login'}
						className={cn(
							buttonVariants({
								variant: 'default',
								size: 'sm',
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
			<div className=" animate-pulse mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 shadow-md transition-all bg-background hover:bg-background/50 overflow-hidden backdrop-blur py-1.5 px-3 border border-border rounded-full absolute top-16 -translate-x-1/2 left-1/2 text-xs text-gray-700 font-bold">
				RTChat is now in <span className="text-primary ml-0.5">beta</span>!
			</div>
			<section className="isolate overflow-hidden relative text-center mx-auto h-[calc(100vh-2rem)] px-3 flex flex-col items-center justify-center gap-2">
				<h1 className="text-foreground font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">
					Experience Seamless Communication with{' '}
					<span className="text-primary">RTChat</span>
				</h1>
				<p className="text-muted-foreground tracking-tighter leading-6 text-base lg:text-lg xl:text-xl">
					Real-Time Chatting Made Simple and Efficient
				</p>
				<Link
					href={isLoggedIn ? '/chat' : '/login'}
					className={cn(
						buttonVariants({
							variant: 'default',
						}),
						'mt-4 font-semibold group shadow-lg shadow-primary/30'
					)}
				>
					{isLoggedIn ? 'Go to Chats' : 'Get Started'}
					<ArrowRight
						aria-hidden
						className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
					/>
				</Link>
				<div className="animate-blob-left transform-gpu origin-center -z-10 mix-blend-multiply filter blur-xl absolute top-[10%] left-[19%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-indigo-300/20"></div>
				<div className="animate-blob-right transform-gpu origin-center animation-delay-2000 -z-10 mix-blend-multiply filter blur-xl absolute top-[20%] right-[18%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-amber-300/20"></div>
				<div className="animate-blob transform-gpu origin-center animation-delay-4000 -z-10 mix-blend-multiply filter blur-xl absolute top-[35%] left-[30%] w-[40%] md:w-[30%] lg:w-[25%] aspect-square rounded-full bg-rose-300/20"></div>
			</section>

			<section className="flex flex-col items-center min-h-[calc(100vh-3rem)] py-10 px-3">
				<h2 className="mx-auto text-center text-foreground font-bold text-3xl  lg:text-4xl tracking-tight">
					Coming Soon!
				</h2>
				<p className="text-center mt-2 mb-5 text-muted-foreground tracking-tight leading-6 text-sm lg:text-base xl:text-lg">
					See What Exciting New Features and Enhancements We&apos;re Bringing to
					You Soon!
				</p>
				<div className="flex-1 grid grid-cols-1 place-items-center xl:grid-cols-3 gap-6">
					<div className="p-8 flex flex-col gap-3 items-center col-span-1 overflow-hidden max-w-sm h-[400px] border border-border rounded-lg shadow-lg">
						<h4 className="text-xl font-bold text-gray-700">
							End to end encryption!
						</h4>
						<p className="text-muted-foreground leading-7">
							We are excited to introduce End-to-End Encryption in our next
							update! This new feature ensures that only you and your
							conversation partner can read what is sent, and nobody in between,
							not even our team. Elevate your privacy and secure your
							communications effortlessly. Stay tuned for this enhancement,
							designed to protect your conversations and bring you peace of
							mind.
						</p>
					</div>
					<div className="p-8 flex flex-col gap-3 items-center col-span-1 overflow-hidden max-w-sm h-[400px] border border-border rounded-lg shadow-lg">
						<h4 className="text-xl font-bold text-gray-700">Dark Mode!</h4>
						<p className="text-muted-foreground leading-7">
							Get ready for a more comfortable viewing experience with our new
							Dark Mode feature! This update brings a sleek, eye-friendly
							interface to our application, perfect for night-time usage or in
							low-light conditions. Dark Mode not only helps reduce eye strain
							but also conserves battery life on mobile devices. Switch to Dark
							Mode and enjoy a stylish, modern look that’s easier on your eyes
							and your device’s battery.
						</p>
					</div>
					<div className="p-8 flex flex-col gap-3 items-center col-span-1 overflow-hidden max-w-sm h-[400px] border border-border rounded-lg shadow-lg">
						<h4 className="text-xl font-bold text-gray-700">Media Messages!</h4>
						<p className="text-muted-foreground leading-7">
							Introducing Media Messages: Now you can enrich your chats by
							sending images, videos, and files directly within conversations.
							Perfect for sharing moments, collaborating on projects, or just
							having fun, our new feature makes communication more dynamic and
							expressive. Start enjoying a richer chat experience today!
						</p>
					</div>
				</div>
			</section>

			<footer className="min-h-16 text-center flex items-center justify-center gap-3 mx-auto">
				<h3 className="text-muted-foreground text-sm font-semibold">
					Made by{' '}
					<a href="https://github.com/mjn81" className="underline font-bold">
						Mjn
					</a>
				</h3>
			</footer>
		</main>
	);
}
