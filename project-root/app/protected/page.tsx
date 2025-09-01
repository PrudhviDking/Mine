'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Protected() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW: conversation slots
  const [conversations, setConversations] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/login');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  // Load slots when user changes
  useEffect(() => {
    if (!user) return;
    const fetchSlots = async () => {
      const res = await axios.get('/api/conversation_list', { params: { uid: user.uid } });
      setConversations(res.data);
      if (res.data.length > 0) setActiveSlot(res.data[0].slotId);
    };
    fetchSlots();
  }, [user]);

  // Load messages when slot changes
  useEffect(() => {
    if (!user || !activeSlot) return;
    const fetchMessages = async () => {
      const res = await axios.get('/api/conversation_get', { params: { uid: user.uid, slotId: activeSlot } });
      setMessages(res.data?.messages ?? []);
    };
    fetchMessages();
  }, [user, activeSlot]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const newConversation = async () => {
    const res = await axios.post('/api/conversation_new', { uid: user.uid });
    setConversations((prev) => [res.data, ...prev]);
    setActiveSlot(res.data.slotId);
    setMessages([]);
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !user || !activeSlot) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post('/api/groq', { message: query });
      const botMessage = { sender: 'bot', text: res.data.reply };

      await axios.post('/api/conversation_post', {
        uid: user.uid,
        slotId: activeSlot,
        userMessage: query,
        botMessage: res.data.reply,
      });

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❌ Error fetching/saving conversation.' },
      ]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex">
      {/* Sidebar for slots */}
      <div className="w-64 bg-white border-r p-4">
        <button
          onClick={newConversation}
          className="mb-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          + New Chat
        </button>
        {conversations.map((c) => (
          <div
            key={c._id.toString()} // ✅ always unique from MongoDB
            onClick={() => setActiveSlot(c.slotId)}
            className={`p-2 rounded cursor-pointer mb-2 ${
              activeSlot === c.slotId ? 'bg-blue-300' : 'bg-gray-200'
            }`}
          >
            {c.name || `Conversation ${c.slotId}`}
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 p-6 flex flex-col items-center">
        <div className="max-w-xl w-full bg-white rounded shadow p-6 mb-4">
          <h1 className="text-xl font-bold mb-2 text-center">🔒 Protected Page</h1>
          {user && <p className="mb-4 text-center">Welcome, <strong>{user.email}</strong>!</p>}
          <button
            onClick={handleLogout}
            className="mb-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
          </button>

          {/* Messages */}
          <div className="mb-4 max-h-64 overflow-y-auto border p-4 rounded bg-gray-100">
            {messages.length === 0 && <p className="text-center text-gray-500">Start chatting...</p>}
            {messages.map((msg, i) => (
              <pre
                key={i}
                className={`whitespace-pre-wrap mb-2 p-2 rounded ${
                  msg.sender === 'user' ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-900'
                }`}
              >
                <strong>{msg.sender === 'user' ? 'You' : 'GROQ Bot'}:</strong> {msg.text}
              </pre>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={sendQuery} className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter GROQ query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow p-2 border rounded"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}s