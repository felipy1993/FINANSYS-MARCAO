
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7gBIReX21LwH4Vj_GmiQh4shF5uLC8Rw",
  authDomain: "finansys-marcao.firebaseapp.com",
  projectId: "finansys-marcao",
  storageBucket: "finansys-marcao.firebasestorage.app",
  messagingSenderId: "905043458180",
  appId: "1:905043458180:web:a268ff97bd9000d6e06ad1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
