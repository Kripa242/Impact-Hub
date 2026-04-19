import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
 
const firebaseConfig = {
  apiKey: "AIzaSyBXGxJ3PF1dYoSNO-E0U6sn_gMNmdi3OCk",
  authDomain: "impacthub-c50e1.firebaseapp.com",
  projectId: "impacthub-c50e1",
  storageBucket: "impacthub-c50e1.firebasestorage.app",
  messagingSenderId: "350030033510",
  appId: "1:350030033510:web:1a4a1a2e5a01049625f3a7",
};
 
const app = initializeApp(firebaseConfig);
 
export const auth = getAuth(app);
export const db = getFirestore(app);
