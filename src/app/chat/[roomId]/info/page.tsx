'use client'

import type { FC } from 'react';

interface RoomInfoProps {
  
}

const RoomInfo: FC<RoomInfoProps> = () => {
  return (
		<div className="flex justify-center items-center absolute w-screen h-screen z-50 bg-black bg-opacity-60 inset-0">
			<div className="animate-go-down max-w-md w-full m-3 relative bg-white p-4 rounded-md">
        
      </div>
		</div>
	);
}

export default RoomInfo;