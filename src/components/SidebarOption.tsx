'use client'
import React, { FC } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { LucideIcon, UserPlus, ListPlus } from 'lucide-react';
import FriendRequestSidebarOption from '@/components/FriendRequestSidebarOption';
import CreateRoomForm from './form/CreateRoomForm';
import AddFriendForm from './form/AddFriend';

interface SidebarOptionProps {
  option: SideBarOption;
  Form: FC;
}
							
const SidebarOption: FC<SidebarOptionProps> = ({option, Form}) => {
  return (
		<Dialog>
			<DialogTrigger className=" text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group w-full flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold">
				<span className="text-gray-400 border-gray-200 group-hover:text-indigo-600 group-hover:border-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
					<option.icon className="h-4 w-4" />
				</span>
				<span className="truncate">{option.name}</span>
			</DialogTrigger>
      <DialogContent>
        <Form />
      </DialogContent>
		</Dialog>
	);
}

const sideBarOptions: SideBarOption[] = [
	{ id: 1, name: 'Create room',  icon: ListPlus, form: CreateRoomForm },
	{ id: 2, name: 'Add friend', icon: UserPlus, form: AddFriendForm },
];

interface SidebarOptionsProps {
  sessionId: string;
  unseenRequestCount: number;
}

const SidebarOptions: FC<SidebarOptionsProps> = ({sessionId, unseenRequestCount}) => {
  return (
		<ul role="list" className="-mx-2 mt-2 space-y-1">
			{sideBarOptions.map((option) => {
				return (
					<li key={option.id}>
						<SidebarOption option={option} Form={option.form} />
					</li>
				);
			})}
			<li>
				<FriendRequestSidebarOption
					sessionId={sessionId}
					initialUnseenRequestCount={unseenRequestCount}
				/>
			</li>
		</ul>
	);
}

export default SidebarOptions;