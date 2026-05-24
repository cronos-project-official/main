import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection, getDocs, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
 * 🔒 SECURITY REMINDER — Firebase API Key
 * -------------------------------------------------------
 * API Key นี้ปลอดภัยให้ใช้ใน client-side ได้ แต่ต้องทำ 2 ขั้นตอนนี้ด้วย:
 *
 * 1. เปิด Google Cloud Console → APIs & Services → Credentials
 *    → คลิก API Key → ตั้ง "Application restrictions" เป็น HTTP referrers
 *    → เพิ่ม: https://cronos-project-official.github.io/*
 *
 * 2. ตั้ง Firebase Security Rules ใน Firestore และ Storage ให้เฉพาะ
 *    ผู้ใช้ที่ login แล้วเท่านั้นที่ write ได้:
 *
 *    Firestore Rules:
 *      allow read: if true;
 *      allow write: if request.auth != null;
 *
 *    Storage Rules:
 *      allow read: if true;
 *      allow write: if request.auth != null;
 * -------------------------------------------------------
 */
const firebaseConfig = {
  apiKey:            "AIzaSyDo76SIYbRkdZVbQXGahhpugx5WvovEl7o",
  authDomain:        "cronos-project-official.firebaseapp.com",
  projectId:         "cronos-project-official",
  storageBucket:     "cronos-project-official.firebasestorage.app",
  messagingSenderId: "876838621532",
  appId:             "1:876838621532:web:28ebeafb7889406bb2b199",
  measurementId:     "G-1CY0TKQPNB"
};

const fbApp   = initializeApp(firebaseConfig);
const db      = getFirestore(fbApp);
const auth    = getAuth(fbApp);
// expose ให้ฟังก์ชัน global ใช้งานได้
window.__db      = db;
window.__auth    = auth;
window.__fsFn    = { doc, setDoc, deleteDoc, collection };

// ── AUTH FUNCTIONS ──
window.__adminLogin = async function(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
};
window.__adminLogout = async function() {
  return signOut(auth);
};
onAuthStateChanged(auth, user => {
  window.__currentUser = user || null;
  // ซ่อน/แสดงปุ่มตามสถานะ login
  const fab      = document.getElementById('admin-fab');
  const loginBtn = document.getElementById('admin-login-btn');
  if (fab)      fab.style.display      = user ? 'flex'  : 'none';
  if (loginBtn) loginBtn.style.display = user ? 'none'  : 'flex';
});

// ── REALTIME LISTENERS ──
onSnapshot(collection(db, 'news'), snap => {
  window.newsData = [];
  snap.forEach(d => window.newsData.push(d.data()));
  window.newsData.sort((a,b)=>b.id-a.id);
  if(typeof renderNews==='function') renderNews();
  if(typeof renderAdminNews==='function') renderAdminNews();
});

onSnapshot(collection(db, 'partners'), snap => {
  window.partnerData = [];
  snap.forEach(d => window.partnerData.push(d.data()));
  window.partnerData.sort((a,b)=>a.id-b.id);
  if(typeof renderPartners==='function') renderPartners();
  if(typeof renderAdminPartners==='function') renderAdminPartners();
});

// sync counter doc
async function loadCounters(){
  const d = await getDoc(doc(db,'meta','counters'));
  if(d.exists()){
    const o=d.data();
    window.nextNewsId    = o.news    || 10;
    window.nextPartnerId = o.partner || 10;
  }
}
loadCounters();

window.__saveCounters = async function(){
  const {doc:d,setDoc:s} = window.__fsFn;
  await s(d(window.__db,'meta','counters'),{news:window.nextNewsId,partner:window.nextPartnerId});
};
