import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDEinp7uCNJB6AOj1-M6km72BogYcPCAP0",
    authDomain: "haq-agent.firebaseapp.com",
    projectId: "haq-agent",
    storageBucket: "haq-agent.firebasestorage.app",
    messagingSenderId: "386583802436",
    appId: "1:386583802436:web:56bb5e9e120d9295808211",
    measurementId: "G-ZRMTNDC9WK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
