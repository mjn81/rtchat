'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { FC } from 'react';

interface BackButtonProps {}

const BackButton: FC<BackButtonProps> = () => {
  const router = useRouter();
  return (
		<button onClick={() => router.replace('/chat')}>
			<ChevronLeft className="lg:hidden w-8 h-8" />
		</button>
	);
};

export default BackButton;
