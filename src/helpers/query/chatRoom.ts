import { chatRoomMembers } from "@/db/schema"
import { nanoid } from 'nanoid';
export const addMembersToChatRoom = async (chatRoomId: string, memberIds: string[]) => {
  try {
    const members: any[] = [];
    for (const memberId of memberIds) {
      members.push({
        chatRoomId,
        userId: memberId,
      });
    }
    await db?.insert(chatRoomMembers).values(members);
  }
  catch (e) {
    console.error(e);
  }
}

export const generateChatRoomUrl = (name: string) => {
  return name.replace(/\s/g, '_').toLowerCase()+nanoid(10);
}