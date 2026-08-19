import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

import { env } from './env.js';

function initializeFirebaseAdmin(): void {
	if (getApps().length > 0) return;

	if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
		throw new Error('FIREBASE_NOT_CONFIGURED');
	}

	initializeApp({
		credential: cert({
			projectId: env.FIREBASE_PROJECT_ID,
			clientEmail: env.FIREBASE_CLIENT_EMAIL,
			privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
		}),
	});
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
	initializeFirebaseAdmin();
	return getAuth().verifyIdToken(idToken, true);
}
