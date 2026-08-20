import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@toolpad/core/AppProvider';
import { signOut } from 'firebase/auth';
import type { UsuarioSession } from '../api/auth';
import { SESSION_INVALIDATED_EVENT } from '../api/client';
import { firebaseAuth } from '../config/firebase';
import { AVATAR_STYLE_CHANGED_EVENT, getUserAvatarUrl } from '../utils/avatar';

const STORAGE_KEY = 'mosaico_cultural_user_session';
const TOKEN_STORAGE_KEY = 'mosaico_cultural_token';

type AuthContextType = {
	user: UsuarioSession | null;
	token: string | null;
	session: Session | null;
	login: (user: UsuarioSession, token: string) => void;
	logout: () => void;
	updateUser: (updatedUser: Partial<UsuarioSession>) => void;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	session: null,
	login: () => {},
	logout: () => {},
	updateUser: () => {},
});

function sanitizeUserForStorage(user: UsuarioSession): Partial<UsuarioSession> {
	const sanitized: Partial<UsuarioSession> = { ...user };
	delete (sanitized as { contrasenia?: string }).contrasenia;
	return sanitized;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [avatarVersion, setAvatarVersion] = useState(0);

	const [user, setUser] = useState<UsuarioSession | null>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? (JSON.parse(stored) as UsuarioSession) : null;
		} catch {
			return null;
		}
	});

	const [token, setToken] = useState<string | null>(() => {
		try {
			return localStorage.getItem(TOKEN_STORAGE_KEY);
		} catch {
			return null;
		}
	});

	useEffect(() => {
		try {
			if (user) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUserForStorage(user)));
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch {
			// ignore storage errors
		}
	}, [user]);

	useEffect(() => {
		try {
			if (token) {
				localStorage.setItem(TOKEN_STORAGE_KEY, token);
			} else {
				localStorage.removeItem(TOKEN_STORAGE_KEY);
			}
		} catch {
			// ignore storage errors
		}
	}, [token]);

	useEffect(() => {
		const invalidateSession = () => {
			setUser(null);
			setToken(null);
		};

		window.addEventListener(SESSION_INVALIDATED_EVENT, invalidateSession);
		return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, invalidateSession);
	}, []);

	useEffect(() => {
		const handleAvatarChange = () => {
			setAvatarVersion((v) => v + 1);
		};
		window.addEventListener(AVATAR_STYLE_CHANGED_EVENT, handleAvatarChange);
		return () => window.removeEventListener(AVATAR_STYLE_CHANGED_EVENT, handleAvatarChange);
	}, []);

	const login = (newUser: UsuarioSession, newToken: string) => {
		setUser(newUser);
		setToken(newToken);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		void signOut(firebaseAuth);
	};

	const updateUser = (updatedFields: Partial<UsuarioSession>) => {
		setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
	};

	const session: Session | null = React.useMemo(() => {
		if (!user) return null;
		return {
			user: {
				id: String(user.idUsuario),
				name: `${user.nombre} ${user.apellido}`,
				email: user.email,
				image: getUserAvatarUrl(user),
			},
		};
	}, [user, avatarVersion]);

	return (
		<AuthContext.Provider value={{ user, token, session, login, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	return useContext(AuthContext);
}
