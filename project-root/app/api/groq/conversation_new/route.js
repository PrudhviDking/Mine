import mongooseConnect from '@/lib/mongoose';
import Conversation from '@/models/Conversation';
import { randomUUID } from 'crypto';

export async function POST(req) {
  try {
    const { uid } = await req.json();
    if (!uid) return new Response(JSON.stringify({ error: 'Missing uid' }), { status: 400 });

    await mongooseConnect();
    const slotId = randomUUID();

    const conversation = await Conversation.create({
      uid,
      slotId,
      title: 'New Chat',
      messages: [],
    });

    return new Response(JSON.stringify(conversation), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('NEW conversation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}