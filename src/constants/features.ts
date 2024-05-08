import { GlobeLock, Link, MoonStar } from "lucide-react";

export const COMING_SOON_FEATURES = [
	{
		id: 1,
		title: 'End to end encryption!',
		description: `We're excited to announce that our next update will include End-to-End Encryption,
		 ensuring that only you and your conversation partner can read your messages. This enhancement will elevate your privacy and secure your
		 communications, giving you peace of mind. Stay tuned!`,
		icon: GlobeLock,
	},
	{
		id: 2,
		title: 'Dark Mode!',
		description: `Get ready for our new Dark Mode feature, designed for a more comfortable viewing experience in low-light conditions. 
		This update offers a sleek, eye-friendly interface that reduces eye strain and conserves battery life on mobile devices. 
		Switch to Dark Mode for a stylish, modern look that's easier on your eyes and battery.`,
		icon: MoonStar,
	},
	{
		id: 3,
		title: 'Media Messages!',
		description: `Introducing Media Messages: Now enhance your chats by sending images, videos, and files directly within conversations.
		 Ideal for sharing moments, collaborating, or just having fun, this new feature makes communication more dynamic and expressive.
		 Start enjoying a richer chat experience today!`,
		icon: Link ,
	},
];