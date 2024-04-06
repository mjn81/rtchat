import { push } from "@/lib/utils";

export async function POST(req: Request) {
  const {message} = await req.json();
  try {
    await push(message, '112323');
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    }
  }
  return new Response('OK', {
		status: 201,
	});
}