import mongooseConnect from '@/lib/mongoose';
import Conversation from '@/models/Conversation';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const uid = searchParams.get('uid');
    const slotId = searchParams.get('slotId');

    if (!uid || !slotId) {
      return new Response(JSON.stringify({ error: 'Missing uid or slotId' }), { status: 400 });
    }

    await mongooseConnect();

    let conversation = await Conversation.findOne({ uid, slotId });

    if (!conversation) {
      conversation = await Conversation.create({
        uid,
        slotId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return new Response(JSON.stringify(conversation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET conversation error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}