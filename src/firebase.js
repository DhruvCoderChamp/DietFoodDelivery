
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDuoIXZu2HudJSNFy8EjvC4rlfVavC6VPw",
  authDomain: "my-morning-delivery.firebaseapp.com",
  projectId: "my-morning-delivery",
  storageBucket: "my-morning-delivery.firebasestorage.app",
  messagingSenderId: "276665369137",
  appId: "1:276665369137:web:8158a34313c3356b490b10"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
