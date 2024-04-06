import AddFriendForm from '@/components/form/AddFriend';
import React, { type FC } from 'react';

interface SendProps {
  
}

const Send: FC<SendProps> = () => {
  return <div className='flex justify-center items-center absolute w-screen h-screen z-50 bg-black bg-opacity-60 inset-0'>
    <AddFriendForm />
  </div>;
}

export default Send;