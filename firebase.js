import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { collection, getDocs, getFirestore, limit, query } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const FIREBASE_CONFIG_STORAGE_KEY = "sublime_firebase_connection_v1";

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyC25MNk0UMhBpkohdopTgMfJsUa_NfdAF8",
  authDomain: "sublimeweb-218bd.firebaseapp.com",
  projectId: "sublimeweb-218bd",
  storageBucket: "sublimeweb-218bd.firebasestorage.app",
  messagingSenderId: "890539966515",
  appId: "1:890539966515:web:1ee3148963464ba5312346",
  measurementId: "G-WPCDNV2XWH"
};

function parseFirebaseConfig(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  const raw = String(value).trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}
  const hostMatch = raw.match(/https?:\/\/([a-z0-9-]+)\.firebaseapp\.com/i);
  const projectMatch = raw.match(/(?:projectId=|project\/|projects\/)([a-z0-9-]+)/i);
  const projectId = hostMatch?.[1] || projectMatch?.[1] || raw.match(/^[a-z0-9-]{4,}$/i)?.[0];
  if (!projectId) return null;
  return { ...defaultFirebaseConfig, projectId, authDomain: `${projectId}.firebaseapp.com` };
}

export function getFirebaseConnectionConfig() {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    return parseFirebaseConfig(saved) || defaultFirebaseConfig;
  } catch {
    return defaultFirebaseConfig;
  }
}

export function getFirebaseConnectionText() {
  try {
    return localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY) || JSON.stringify(defaultFirebaseConfig, null, 2);
  } catch {
    return JSON.stringify(defaultFirebaseConfig, null, 2);
  }
}

export function setFirebaseConnectionConfig(value) {
  const parsed = parseFirebaseConfig(value);
  if (!parsed?.projectId || !parsed?.apiKey || !parsed?.appId) {
    throw new Error("Pega la configuración completa de Firebase: apiKey, projectId y appId.");
  }
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(parsed, null, 2));
  return parsed;
}

export function resetFirebaseConnectionConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
}

const firebaseConfig = getFirebaseConnectionConfig();
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const analyticsReady = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

export async function testFirebaseConnection() {
  const snap = await getDocs(query(collection(db, "productos"), limit(1)));
  return { ok: true, projectId: firebaseConfig.projectId, productos: snap.size };
}
