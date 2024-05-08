import { UserPlus, MessageCirclePlus } from 'lucide-react';
import CreateRoomForm from '@/components/form/CreateRoomForm';
import AddFriendForm from '@/components/form/AddFriend';

export const SIDEBAR_OPTIONS: SideBarOption[] = [
	{
		id: 1,
		name: 'Create room',
		icon: MessageCirclePlus,
		form: CreateRoomForm,
	},
	{ id: 2, name: 'Add friend', icon: UserPlus, form: AddFriendForm },
];