
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBlBZZNzC2I4HGwGTIRerlZd9oZ10lRUIE",
  authDomain: "my-morning-delivery.firebaseapp.com",
  projectId: "my-morning-delivery",
  storageBucket: "my-morning-delivery.firebasestorage.app",
  messagingSenderId: "276665369137",
  appId: "1:276665369137:web:8158a34313c3356b490b10"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
