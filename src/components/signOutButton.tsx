'use client';
import type { ButtonHTMLAttributes, FC } from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Loader2, LogOut } from 'lucide-react';

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
	return (
		<Button
			{...props}
			variant="ghost"
			onClick={async () => {
				setIsSigningOut(true);

				try {
					await signOut();
				} catch (error) {
					toast.error('There was a problem signing out.Try later.');
				} finally {
					setIsSigningOut(false);
				}
			}}
		>
			{isSigningOut ? (
				<Loader2 className="animate-spin h-4 w-4" />
			) : (
				<LogOut className="h-5 w-5" />
			)}
		</Button>
	);
};

export default SignOutButton;
