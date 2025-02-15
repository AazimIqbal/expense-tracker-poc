import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA-hekhpfsN1yH2xNQB-yff65k_MhMAOzo",
    authDomain: "expense-tracker-f5bce.firebaseapp.com",
    databaseURL: "https://expense-tracker-f5bce-default-rtdb.firebaseio.com",
    projectId: "expense-tracker-f5bce",
    storageBucket: "expense-tracker-f5bce.firebasestorage.app",
    messagingSenderId: "971767415674",
    appId: "1:971767415674:web:53f7e641c16d8fc93e4cc3",
    measurementId: "G-J5ZRFFZ374"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
