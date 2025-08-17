'use client'

import { useEffect, useState } from 'react';
import axios from 'axios'; // NEW: For sending POST requests to the backend GROQ API
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Protected() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [query, setQuery] = useState('');
  
  // NEW: Store chat messages between user and GROQ bot
  const [messages, setMessages] = useState([]);

  // NEW: Loading state to disable input during API call
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/login');
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // NEW: Send user query to backend GROQ API and update chat messages
  const sendQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user's message to chat history immediately
    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // POST request to backend API with user's query
      const res = await axios.post('/api/groq', { message: query });

      // Add bot's reply to chat history (response from GROQ)
      const botMessage = {
        sender: 'bot',
        text: res.data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Show error message if API call fails
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '❌ Error fetching data from GROQ.' },
      ]);
    } finally {
      setLoading(false);
      setQuery(''); // Clear input after sending
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center">
      <div className="max-w-xl w-full bg-white rounded shadow p-6 mb-4">
        <h1 className="text-xl font-bold mb-2 text-center">🔒 Protected Page</h1>
        {user && <p className="mb-4 text-center">Welcome, <strong>{user.email}</strong>!</p>}
        <button
          onClick={handleLogout}
          className="mb-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>

        {/* NEW: Chat message area */}
        <div className="mb-4 max-h-64 overflow-y-auto border p-4 rounded bg-gray-100">
          {/* Show placeholder if no messages yet */}
          {messages.length === 0 && <p className="text-center text-gray-500">Ask a GROQ query below...</p>}

          {/* Display each message with different styles for user and bot */}
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

        {/* NEW: Input form for GROQ queries */}
        <form onSubmit={sendQuery} className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter GROQ query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow p-2 border rounded"
            disabled={loading} // Disable input while waiting for bot reply
          />
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}