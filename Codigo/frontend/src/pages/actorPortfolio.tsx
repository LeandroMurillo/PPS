import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { Alert, Box, CircularProgress } from '@mui/material';

import { listarMisActoresApi, obtenerActor, type ActorDetalle } from '../api/actores';
import ActorPortfolioView from '../components/actorPortfolioView';
import { useAuth } from '../context/AuthContext';
import { buildSlugConId, parseIdDesdeSlug } from '../utils/slug';

export default function ActorPortfolio() {
	const navigate = useNavigate();
	const { actorSlug = '' } = useParams<{ actorSlug: string }>();
	const [searchParams] = useSearchParams();
	const volverA = searchParams.get('from') || '/actores';
	const { user } = useAuth();

	const [actor, setActor] = useState<ActorDetalle | null>(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isMyActor, setIsMyActor] = useState(false);

	const actorId = parseIdDesdeSlug(actorSlug);

	useEffect(() => {
		const controller = new AbortController();

		async function loadActor() {
			if (!actorId) {
				setError('El identificador del actor no es válido.');
				setCargando(false);
				return;
			}

			try {
				setCargando(true);
				setError(null);

				const result = await obtenerActor(actorId, controller.signal);

				setActor(result.data);

				const canonicalSlug = buildSlugConId(result.data.id, result.data.nombre);
				if (actorSlug !== canonicalSlug) {
					const searchStr = volverA && volverA !== '/actores' ? `?from=${encodeURIComponent(volverA)}` : '';
					navigate(`/actores/${canonicalSlug}${searchStr}`, { replace: true });
				}
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					setError(error instanceof Error ? error.message : 'No se pudo cargar el portafolio.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setCargando(false);
				}
			}
		}

		loadActor();

		return () => controller.abort();
	}, [actorId, actorSlug, navigate, volverA]);

	// Verificar pertenencia real del actor consultando la API autenticada del usuario
	useEffect(() => {
		if (!user || !actorId) {
			setIsMyActor(false);
			return;
		}

		if (user.rol === 'ADMIN' || user.rol === 'MODERADOR') {
			setIsMyActor(true);
			return;
		}

		let isMounted = true;
		listarMisActoresApi({ limit: 100 })
			.then((res) => {
				if (isMounted) {
					const belongsToUser = res.data?.some((a) => a.id === actorId);
					setIsMyActor(Boolean(belongsToUser));
				}
			})
			.catch(() => {
				if (isMounted) {
					setIsMyActor(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [user, actorId]);

	const canViewPrivateInfo = Boolean(isMyActor || (user && (user.rol === 'ADMIN' || user.rol === 'MODERADOR')));

	if (cargando) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !actor) {
		return (
			<Box sx={{ p: 4, maxWidth: 900, margin: '0 auto' }}>
				<Alert severity="error">{error ?? 'No se encontró el actor solicitado.'}</Alert>
			</Box>
		);
	}

	return (
		<ActorPortfolioView
			actor={actor}
			volverA={volverA}
			canViewPrivateInfo={canViewPrivateInfo}
			initialShowAllInfo={canViewPrivateInfo && searchParams.get('from') === '/mis-actores'}
		/>
	);
}
