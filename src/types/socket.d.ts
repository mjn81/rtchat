type PushSocketInput = {
  message: IMessage,
  id: string,
} 

type DeleteUserSocketPayload = {
  memberId: string;
  roomId: string;
}