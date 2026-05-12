const admin = require('firebase-admin');

let firebaseInitialized = false;

const initFirebase = () => {
    try {
        if (admin.apps.length) return admin;

        const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
        const googleCredsVar = process.env.GOOGLE_APPLICATION_CREDENTIALS;

        if (!serviceAccountVar && !googleCredsVar) {
            if (!firebaseInitialized) {
                console.warn('⚠️ [FIREBASE]: Missing credentials (FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS). Push notifications disabled.');
                firebaseInitialized = true;
            }
            return null;
        }

        let credential;
        if (serviceAccountVar) {
            try {
                const serviceAccount = JSON.parse(serviceAccountVar);
                credential = admin.credential.cert(serviceAccount);
            } catch (parseErr) {
                console.error('❌ [FIREBASE]: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseErr.message);
                return null;
            }
        } else {
            // Use GOOGLE_APPLICATION_CREDENTIALS from file path or default
            credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
            credential
        });

        console.log('✅ [FIREBASE]: Admin initialized successfully');
        firebaseInitialized = true;
        return admin;
    } catch (err) {
        if (!firebaseInitialized) {
            console.error('❌ [FIREBASE]: Initialization failed:', err.message);
            firebaseInitialized = true;
        }
        return null;
    }
};

const sendPushNotification = async (token, title, body, data = {}) => {
    if (!admin.apps.length) return;

    const message = {
        notification: { title, body },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('✅ [FIREBASE]: Push sent successfully');
        return response;
    } catch (err) {
        console.error('❌ [FIREBASE]: Push failed:', err.message);
    }
};

module.exports = { initFirebase, sendPushNotification };
