import { Message } from '@/db/schema';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import toast, { type Toast } from 'react-hot-toast';

interface UnseenChatToastProps {
  t: Toast,
  chatId: string, 
  senderImage: string,
  senderName: string,
  message: Message,
}

const UnseenChatToast: FC<UnseenChatToastProps> = ({t, chatId, senderImage, senderName, message }) => {
  return <div className={cn('max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
    {'animate-enter': t.visible, 'animate-leave': !t.visible}
  )}>
    <Link className='flex-1 w-0 p-4' onClick={() => toast.dismiss(t.id)} href={`/chat/${chatId}`}>
      <div className='flex items-start'>
        <div className='flex-shrink-0 pt-0.5'>
          <div className='relative h-10 w-10'>
            <Image fill referrerPolicy='no-referrer' className='rounded-full' src={senderImage} alt={`${senderName} profile picture`}></Image>
          </div>
        </div>
        <div className='ml-3 flex-1'>
          <p className='text-sm font-medium text-gray-900'>{senderName}</p>
          {/* adjust type for other file types */}
          <p className='mt-1 text-sm text-gray-500'>{message.text}</p>
        </div>
      </div>
    </Link>

    <div className='flex border-l border-gray-200'>
      <button onClick={() => toast.dismiss(t.id)}
        className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500'>
        Close
      </button>
    </div>
  </div>
};

export default UnseenChatToast;
