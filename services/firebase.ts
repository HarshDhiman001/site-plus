import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore, doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc, orderBy, limit, increment } from "firebase/firestore";
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

export const trackGlobalAudit = async (url: string, type: string) => {
    try {
        // 1. Log the individual hit in a chronological collection
        const logRef = collection(db, "global_audits_log");
        await addDoc(logRef, {
            url,
            type,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });

        // 2. Increment the total counter for this specific URL
        // We sanitize the URL to use as a document ID (Firebase IDs can't have /)
        const sanitizedUrl = url.replace(/[^a-zA-Z0-0]/g, '_').toLowerCase();
        const siteRef = doc(db, "site_stats", sanitizedUrl);
        await setDoc(siteRef, {
            url: url,
            hitCount: increment(1),
            lastAuditedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error tracking global audit:", error);
    }
};

export const getUrlHitCount = async (url: string): Promise<number> => {
    try {
        const sanitizedUrl = url.replace(/[^a-zA-Z0-0]/g, '_').toLowerCase();
        const siteRef = doc(db, "site_stats", sanitizedUrl);
        const docSnap = await getDocs(query(collection(db, "site_stats"), where("url", "==", url)));

        // Simpler approach for single doc fetch
        const snapshot = await getDocs(query(collection(db, "site_stats"), where("url", "==", url)));
        if (!snapshot.empty) {
            return snapshot.docs[0].data().hitCount || 0;
        }
    } catch (error) {
        console.error("Error getting URL hit count:", error);
    }
    return 0;
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
