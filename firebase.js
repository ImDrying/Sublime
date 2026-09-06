import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC25MNk0UMhBpkohdopTgMfJsUa_NfdAF8",
  authDomain: "sublimeweb-218bd.firebaseapp.com",
  projectId: "sublimeweb-218bd",
  storageBucket: "sublimeweb-218bd.firebasestorage.app",
  messagingSenderId: "890539966515",
  appId: "1:890539966515:web:1ee3148963464ba5312346",
  measurementId: "G-WPCDNV2XWH"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const analyticsReady = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);
