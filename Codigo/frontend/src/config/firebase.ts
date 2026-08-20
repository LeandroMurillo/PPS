import { getApp, getApps, initializeApp } from 'firebase/app';
import {
	browserLocalPersistence,
	browserSessionPersistence,
	getAuth,
	GoogleAuthProvider,
	indexedDBLocalPersistence,
	setPersistence,
} from 'firebase/auth';

const rawConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseConfigured = Boolean(
	rawConfig.apiKey && rawConfig.authDomain && rawConfig.projectId && rawConfig.appId,
);

if (!isFirebaseConfigured) {
	console.warn(
		'[Firebase] Faltan variables de entorno de Firebase (VITE_FIREBASE_*). Asegurate de configurar tu archivo .env.',
	);
}

const firebaseConfig = {
	apiKey: rawConfig.apiKey || 'mock-api-key',
	authDomain: rawConfig.authDomain || 'mock-auth-domain.firebaseapp.com',
	projectId: rawConfig.projectId || 'mock-project-id',
	appId: rawConfig.appId || '1:123456789:web:mock',
	messagingSenderId: rawConfig.messagingSenderId || '123456789',
};

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

// La persistencia se configura sobre la única instancia de Auth. Si el navegador
// no ofrece IndexedDB (por ejemplo, en navegación privada), se usan alternativas.
void setPersistence(firebaseAuth, indexedDBLocalPersistence).catch(() =>
	setPersistence(firebaseAuth, browserLocalPersistence).catch(() =>
		setPersistence(firebaseAuth, browserSessionPersistence).catch(() => undefined),
	),
);

// Localiza los correos generados por Firebase. La interfaz del controlador de
// acciones se sirve desde nuestra ruta /auth/action y se configura en Console.
firebaseAuth.languageCode = 'es-419';
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
