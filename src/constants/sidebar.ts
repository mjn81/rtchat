import { UserPlus, ListPlus, Cog } from 'lucide-react';
import CreateRoomForm from '@/components/form/CreateRoomForm';
import AddFriendForm from '@/components/form/AddFriend';

export const SIDEBAR_OPTIONS: SideBarOption[] = [
	{ id: 1, name: 'Create room', icon: ListPlus, form: CreateRoomForm },
	{ id: 2, name: 'Add friend', icon: UserPlus, form: AddFriendForm },
];