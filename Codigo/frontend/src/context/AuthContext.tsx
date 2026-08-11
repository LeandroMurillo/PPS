import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@toolpad/core/AppProvider';
import type { UsuarioSession } from '../api/auth';

const STORAGE_KEY = 'mosaico_cultural_user_session';

type AuthContextType = {
	user: UsuarioSession | null;
	session: Session | null;
	login: (user: UsuarioSession) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
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

	useEffect(() => {
		if (user) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUserForStorage(user)));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [user]);

	const login = (newUser: UsuarioSession) => {
		setUser(newUser);
	};

	const logout = () => {
		setUser(null);
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

	return (
		<AuthContext.Provider value={{ user, session, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	return useContext(AuthContext);
}
