import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@toolpad/core/AppProvider';
import type { UsuarioSession } from '../api/auth';

const STORAGE_KEY = 'mosaico_cultural_user_session';
const TOKEN_STORAGE_KEY = 'mosaico_cultural_token';

type AuthContextType = {
	user: UsuarioSession | null;
	token: string | null;
	session: Session | null;
	login: (user: UsuarioSession, token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	session: null,
	login: () => {},
	logout: () => {},
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

	const login = (newUser: UsuarioSession, newToken: string) => {
		setUser(newUser);
		setToken(newToken);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
	};

	const session: Session | null = user
		? {
				user: {
					id: String(user.idUsuario),
					name: `${user.nombre} ${user.apellido}`,
					email: user.email,
					image: `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
						`${user.nombre}+${user.apellido}`,
					)}`,
				},
			}
		: null;

	return <AuthContext.Provider value={{ user, token, session, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
	return useContext(AuthContext);
}
