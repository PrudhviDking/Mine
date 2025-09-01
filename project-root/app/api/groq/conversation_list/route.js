import mongooseConnect from '@/lib/mongoose';
import Conversation from '@/models/Conversation';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url, 'http://localhost');
    const uid = searchParams.get('uid');
    if (!uid) return new Response(JSON.stringify({ error: 'Missing uid' }), { status: 400 });

    await mongooseConnect();
    const conversations = await Conversation.find({ uid }).sort({ updatedAt: -1 });

    return new Response(JSON.stringify(conversations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('LIST conversations error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}