import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@toolpad/core/AppProvider';
import { signOut } from 'firebase/auth';
import type { UsuarioSession } from '../api/auth';
import { SESSION_INVALIDATED_EVENT } from '../api/client';
import { firebaseAuth } from '../config/firebase';

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
	const { CUIL: _c, fechaNacimiento: _f, fotoDniUrl: _d, ...safeUser } = user;
	void _c;
	void _f;
	void _d;
	return safeUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
		if (user) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUserForStorage(user)));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [user]);

	useEffect(() => {
		if (token) {
			localStorage.setItem(TOKEN_STORAGE_KEY, token);
		} else {
			localStorage.removeItem(TOKEN_STORAGE_KEY);
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

	const getAvatarConfig = (genero?: string) => {
		if (genero === 'F' || genero === 'MF') {
			return {
				style: 'lorelei',
				backgroundColor: ['f9d5e5', 'f7c6d9', 'f2d7d5'],
			};
		}
		if (genero === 'M' || genero === 'FM') {
			return {
				style: 'micah',
				backgroundColor: ['dbeafe', 'c7d2fe', 'e0f2fe'],
			};
		}
		return {
			style: 'initials',
			backgroundColor: ['e5e7eb', 'd1d5db', 'f3f4f6'],
		};
	};

	const avatarConfig = getAvatarConfig(user?.genero);

	const session: Session | null = user
		? {
				user: {
					id: String(user.idUsuario),
					name: `${user.nombre} ${user.apellido}`,
					email: user.email,
					image: `https://api.dicebear.com/10.x/${avatarConfig.style}/svg?seed=${encodeURIComponent(
						`${user.nombre} ${user.apellido}`,
					)}&backgroundColor=${avatarConfig.backgroundColor.join(',')}`,
				},
			}
		: null;

	return (
		<AuthContext.Provider value={{ user, token, session, login, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	return useContext(AuthContext);
}
