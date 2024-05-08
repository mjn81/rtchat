'use client';
import { ArrowBigDownDash } from 'lucide-react';
import React, { FC } from 'react'
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DownloadButtonProps {

}

const DownloadButton:FC<DownloadButtonProps> = () => {
  const onDownload = () => {
		toast.error('Coming Soon! In the meantime, use the web interface.');
	};
  return (
		<button
			onClick={onDownload}
			className={cn(
				buttonVariants({
					size: 'lg',
				}),
				'font-semibold group bg-foreground hover:bg-accent-foreground'
			)}
		>
			<ArrowBigDownDash className="w-5 h-5 mr-1" />
			Download App
		</button>
	);
}

export default DownloadButton