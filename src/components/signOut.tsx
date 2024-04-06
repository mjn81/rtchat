'use client'
import { signOut } from 'next-auth/react';
import type { FC } from 'react';

interface SignOutProps {
  
}

const SignOut: FC<SignOutProps> = () => {
  return (
		<button
			onClick={async () => {

				try {
					await signOut();
				} catch (error) {
					// toast.error('There was a problem signing out.Try later.');
				}
			}}
    >
      Sign Out
    </button>
	);
}

export default SignOut;