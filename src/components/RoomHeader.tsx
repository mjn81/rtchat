'use client';
import Image from 'next/image';
import React, { ReactElement, useState, type FC, type PropsWithChildren } from 'react';
import { type BaseModalProps } from './ui/Modal';

/// TODO: refactor modal component
interface RoomHeaderProps extends PropsWithChildren {
  roomName: string;
  membersCount?: number;
  roomImage: string;
  friendEmail?: string;
  isPrivate?: boolean;
	Modal: React.ElementType;
	modalProps: any;
}

const RoomHeader: FC<RoomHeaderProps> = ({ roomImage,Modal,modalProps, roomName, membersCount, friendEmail, children, isPrivate=false}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
	
  return (
		<>
			<div onClick={() => {
				setIsOpen(true);
			}} className="relative cursor-pointer flex items-center space-x-4">
				<div className="relative">
					<div className="relative w-8 h-8 sm:w-12 sm:h-12">
						<Image
							fill
							referrerPolicy="no-referrer"
							src={roomImage}
							alt={`${roomName} profile picture`}
							className="rounded-full"
						/>
					</div>
				</div>

				<div className="flex flex-col leading-tight">
					<div className="text-xl flex items-center">
						<span className="text-gray-700 mr-3 font-semibold">{roomName}</span>
					</div>

					<span className="text-sm text-gray-600">
						{isPrivate
							? friendEmail
							: !!membersCount && membersCount > 1
							? `${membersCount} members`
							: `1 member`}
					</span>
				</div>
				{children}
      </div>
      
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} {...modalProps} />
		</>
	);
}

export default RoomHeader;