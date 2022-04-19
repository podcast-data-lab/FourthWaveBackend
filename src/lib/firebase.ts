import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
require('dotenv').config('../../')

function initializeFirebase() {
    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    })
}

export const firebaseApp = initializeFirebase()

export const firebaseAuth = getAuth(firebaseApp)
