// -------------------------
// This is a page only logged-in users can see
// If you are not logged in, you will be sent to the Login page
// -------------------------
'use client'

import { useEffect, useState } from "react"; // for tracking state and side effects
import { auth } from "@/firebase"; // our Firebase Auth instance
import { onAuthStateChanged } from "firebase/auth"; // detects if user logs in/out
import { useRouter } from "next/navigation"; // for redirecting

export default function Protected() {
  const router = useRouter();

  // Store logged-in user info
  const [user, setUser] = useState(null);

  // Runs when page loads
  useEffect(() => {
    // This function watches the login state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If no one is logged in, send to Login page
        router.push("/login");
      } else {
        // If logged in, save user info
        setUser(currentUser);
      }
    });

    // Cleanup listener when leaving the page
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded shadow-lg text-center">
        <h1 className="text-xl font-bold mb-2">🔒 Protected Page</h1>
        {user && <p>Welcome, <strong>{user.email}</strong>!</p>}
      </div>
    </div>
  );
}