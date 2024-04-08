
// Define the types for the 'type' field
enum MessageType {
	Text = 'text',
	Image = 'image',
	File = 'file',
	Audio = 'audio',
}
type User = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	emailVerified: Date | null;
};
