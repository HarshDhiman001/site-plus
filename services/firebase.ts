import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore, doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { AuditData } from "../types";

const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const logAnalyticsEvent = (eventName: string, params?: any) => {
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
};

export const trackUserLogin = async (user: any) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
    }, { merge: true });

    // Track login history
    const loginRef = doc(db, "users", user.uid, "logins", new Date().toISOString());
    await setDoc(loginRef, {
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
    });
};

export const saveAuditResult = async (userId: string, auditData: AuditData) => {
    try {
        const auditsRef = collection(db, "users", userId, "audits");
        await addDoc(auditsRef, {
            ...auditData,
            savedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving audit result:", error);
    }
};

export const getUserAudits = async (userId: string): Promise<AuditData[]> => {
    try {
        const auditsRef = collection(db, "users", userId, "audits");
        const q = query(auditsRef, orderBy("timestamp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as AuditData);
    } catch (error) {
        console.error("Error getting user audits:", error);
        return [];
    }
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await trackUserLogin(result.user);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = () => signOut(auth);
