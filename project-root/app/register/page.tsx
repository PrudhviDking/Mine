// -------------------------
// This page lets new users create an account
// -------------------------

// Import React's useState function to store and update form input values
'use client'

import { useState } from "react";

// Import Firebase's "create account" function
import { createUserWithEmailAndPassword } from "firebase/auth";

// Import the `auth` service we made in firebase.js
import { auth } from "@/firebase";

// Import the tool that lets us change pages in Next.js
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter(); // lets us redirect to other pages

  // Create variables to store what the user types in the form
  const [email, setEmail] = useState("");       // user's email
  const [password, setPassword] = useState(""); // user's password
  const [message, setMessage] = useState("");   // message for success or errors

  // This runs when the user clicks "Sign Up"
  const handleRegister = async (e) => {
    e.preventDefault(); // stop page from refreshing
    try {
      // Create the account in Firebase
      await createUserWithEmailAndPassword(auth, email, password);

      // Show success message
      setMessage("✅ Registration successful!");

      // Redirect user to the protected page after signing up
      router.push("/protected");
    } catch (err) {
      // If there's an error, show the error message
      setMessage("❌ " + err.message);
    }
  };

  return (
    // Outer container that centers the form on the page
    <div className="flex justify-center items-center h-screen bg-gray-100">
      
      {/* The form box */}
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Register</h1>
        
        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email} // current email value
          onChange={(e) => setEmail(e.target.value)} // update email
        />

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password} // current password value
          onChange={(e) => setPassword(e.target.value)} // update password
        />

        {/* Sign Up button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>

        {/* Message box for errors or success */}
        {message && <p className="mt-3 text-center">{message}</p>}
      </form>
    </div>
  );
}