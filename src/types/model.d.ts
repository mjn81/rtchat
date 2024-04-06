
// Define the types for the 'type' field
enum MessageType {
	Text = 'text',
	Image = 'image',
	File = 'file',
	Audio = 'audio',
}

interface IUser {
	id: string;
	email: string;
	name: string;
	image: string;
	emailVerified: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Define the interface for the Message document
interface IMessage {
	_id: string;
	text: string;
	chatRoomId: string;
	type: MessageType;
	sender: string;
	createdAt: Date;
	updatedAt: Date;
}
