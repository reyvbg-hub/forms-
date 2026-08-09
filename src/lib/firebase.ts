import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0524948767",
  appId: "1:943634594537:web:c9e7574038852db1ee8e78",
  apiKey: "AIzaSyDC99dlq9evKh6K6aU9Pui81jAlnSm-j_I",
  authDomain: "gen-lang-client-0524948767.firebaseapp.com",
  storageBucket: "gen-lang-client-0524948767.firebasestorage.app",
  messagingSenderId: "943634594537",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Assuming you created the db explicitly.
export const db = getFirestore(app, "ai-studio-bbc2e923-809f-4cc0-8ae0-0553a58f43f0");
export const googleProvider = new GoogleAuthProvider();
