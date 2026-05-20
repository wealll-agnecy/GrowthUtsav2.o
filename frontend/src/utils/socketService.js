import apiClient from '../api/apiClient';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import {
    Timestamp,
    collection,
    deleteDoc,
    doc,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query,
    where
} from 'firebase/firestore';

const FIREBASE_ENV_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const getFirebaseConfig = () => {
    const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;
    if (rawConfig) {
        try {
            return JSON.parse(rawConfig);
        } catch (err) {
            console.error('[FIREBASE REALTIME] Invalid VITE_FIREBASE_CONFIG JSON:', err.message);
        }
    }

    return FIREBASE_ENV_CONFIG;
};

const normalizeTimestamp = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return null;
};

class FirebaseRealtimeService {
    constructor() {
        this.listeners = new Map();
        this.userId = null;
        this.userUnsubscribe = null;
        this.broadcastUnsubscribe = null;
        this.authReadyPromise = null;
        this.startedAt = null;
        this.seenRealtimeIds = new Set();
        this.warnedMissingConfig = false;
    }

    connect(userId) {
        const nextUserId = userId?.toString();
        if (!nextUserId) return this;

        if (this.userId === nextUserId && (this.userUnsubscribe || this.broadcastUnsubscribe)) {
            return this;
        }

        this.closeSubscriptions();
        this.userId = nextUserId;
        this.startedAt = Timestamp.fromDate(new Date(Date.now() - 1000));
        this.seenRealtimeIds.clear();
        this.initializeListeners();
        return this;
    }

    async initializeListeners() {
        const clients = this.getFirebaseClients();
        if (!clients || !this.userId) return;

        try {
            await this.ensureFirebaseAuth(clients.auth);
            if (!this.userId) return;

            this.listenToUserNotifications(clients.db);
            this.listenToBroadcasts(clients.db);
            this.emit('connect');
        } catch (err) {
            console.error('[FIREBASE REALTIME] Listener initialization failed:', err.message);
            this.emit('disconnect', err);
        }
    }

    getFirebaseClients() {
        const firebaseConfig = getFirebaseConfig();
        const hasRequiredConfig = firebaseConfig?.apiKey && firebaseConfig?.projectId && firebaseConfig?.appId;

        if (!hasRequiredConfig) {
            if (!this.warnedMissingConfig) {
                console.warn('[FIREBASE REALTIME] Missing frontend Firebase config. Realtime listeners are disabled.');
                this.warnedMissingConfig = true;
            }
            return null;
        }

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        return {
            app,
            auth: getAuth(app),
            db: getFirestore(app)
        };
    }

    async ensureFirebaseAuth(auth) {
        if (auth.currentUser?.uid === this.userId) return auth.currentUser;

        if (!this.authReadyPromise) {
            this.authReadyPromise = apiClient
                .get('/api/v1/auth/firebase-token')
                .then((res) => {
                    const token = res.data?.token;
                    if (!token) throw new Error('Firebase custom token missing');
                    return signInWithCustomToken(auth, token);
                })
                .finally(() => {
                    this.authReadyPromise = null;
                });
        }

        const credential = await this.authReadyPromise;
        return credential.user;
    }

    listenToUserNotifications(db) {
        const userNotificationsRef = collection(db, 'notifications', this.userId, 'items');
        const userQuery = query(
            userNotificationsRef,
            where('createdAt', '>=', this.startedAt),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        this.userUnsubscribe = onSnapshot(
            userQuery,
            (snapshot) => this.handleSnapshot(db, snapshot, { userScoped: true }),
            (err) => {
                console.error('[FIREBASE REALTIME] User notification listener failed:', err.message);
                this.emit('disconnect', err);
            }
        );
    }

    listenToBroadcasts(db) {
        const broadcastsRef = collection(db, 'broadcasts');
        const broadcastQuery = query(
            broadcastsRef,
            where('createdAt', '>=', this.startedAt),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        this.broadcastUnsubscribe = onSnapshot(
            broadcastQuery,
            (snapshot) => this.handleSnapshot(db, snapshot, { userScoped: false }),
            (err) => {
                console.error('[FIREBASE REALTIME] Broadcast listener failed:', err.message);
                this.emit('disconnect', err);
            }
        );
    }

    handleSnapshot(db, snapshot, options) {
        snapshot.docChanges().forEach((change) => {
            if (change.type !== 'added') return;

            const realtimeId = `${options.userScoped ? 'user' : 'broadcast'}:${change.doc.id}`;
            if (this.seenRealtimeIds.has(realtimeId)) return;
            this.seenRealtimeIds.add(realtimeId);

            const raw = change.doc.data();
            const eventName = raw.event || 'notification';
            const payload = raw.data && typeof raw.data === 'object' ? raw.data : raw;
            const createdAt = normalizeTimestamp(payload.createdAt) || normalizeTimestamp(raw.createdAt) || new Date().toISOString();

            this.emit(eventName, {
                ...payload,
                createdAt
            });

            if (options.userScoped && this.userId) {
                deleteDoc(doc(db, 'notifications', this.userId, 'items', change.doc.id)).catch((err) => {
                    console.warn('[FIREBASE REALTIME] Delivered notification cleanup failed:', err.message);
                });
            }
        });
    }

    emit(event, payload) {
        const handlers = this.listeners.get(event);
        if (!handlers) return;
        handlers.forEach((handler) => handler(payload));
    }

    on(event, handler) {
        if (!event || !handler) return this;
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return this;
    }

    off(event, handler) {
        if (!event) {
            this.listeners.clear();
            return this;
        }

        if (!this.listeners.has(event)) return this;

        if (handler) {
            this.listeners.get(event).delete(handler);
        } else {
            this.listeners.delete(event);
        }

        return this;
    }

    closeSubscriptions() {
        if (this.userUnsubscribe) {
            this.userUnsubscribe();
            this.userUnsubscribe = null;
        }

        if (this.broadcastUnsubscribe) {
            this.broadcastUnsubscribe();
            this.broadcastUnsubscribe = null;
        }
    }

    disconnect() {
        this.closeSubscriptions();
        this.userId = null;
        this.startedAt = null;
        this.seenRealtimeIds.clear();
        this.listeners.clear();

        const clients = this.getFirebaseClients();
        if (clients?.auth?.currentUser) {
            signOut(clients.auth).catch((err) => {
                console.warn('[FIREBASE REALTIME] Firebase sign-out failed:', err.message);
            });
        }
    }
}

const firebaseRealtimeService = new FirebaseRealtimeService();
export default firebaseRealtimeService;
