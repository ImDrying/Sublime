import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC25MNk0UMhBpkohdopTgMfJsUa_NfdAF8",
  authDomain: "sublimeweb-218bd.firebaseapp.com",
  projectId: "sublimeweb-218bd",
  storageBucket: "sublimeweb-218bd.firebasestorage.app",
  messagingSenderId: "890539966515",
  appId: "1:890539966515:web:1ee3148963464ba5312346",
  measurementId: "G-WPCDNV2XWH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
