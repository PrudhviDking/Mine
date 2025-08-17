import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYFrsU5aVL0f9qnB93evuujcJMG3ZBPxE",
  authDomain: "website-6d52c.firebaseapp.com",
  projectId: "website-6d52c",
  storageBucket: "website-6d52c.firebasestorage.app",
  messagingSenderId: "70944903279",
  appId: "1:70944903279:web:24f3a81fb0f8d00eef3d9a",
  measurementId: "G-PN77CTMK8S"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export { auth };

