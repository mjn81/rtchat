import { MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';
import React, { FC } from 'react';

interface LogoProps {}

export const LogoAbsolute: FC<LogoProps> = () => {
	return (
		<Link
			href="/chat"
			className="font-bold text-primary text-lg flex h-16 w-fit shrink-0 items-center"
		>
			<MessageSquareQuote className="text-primary w-10 h-10 lg:absolute lg:inset-5" />
		</Link>
	);
};

export const Logo: FC<LogoProps> = () => {
	return (
		<Link href='/' className='text-primary'>
			<MessageSquareQuote />
		</Link>
	);
}


