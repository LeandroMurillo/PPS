import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
	hasNext: boolean;
	cargando: boolean;
	onLoadMore: () => void;
	rootMargin?: string;
}

/**
 * Hook de Scroll Infinito basado en IntersectionObserver.
 * Monitorea un elemento sentinel y dispara onLoadMore cuando el usuario se aproxima al final de la página.
 */
export function useInfiniteScroll(
	sentinelRef: React.RefObject<HTMLElement | null>,
	{ hasNext, cargando, onLoadMore, rootMargin = '300px' }: UseInfiniteScrollOptions,
) {
	const fetchEnCursoRef = useRef(false);

	useEffect(() => {
		fetchEnCursoRef.current = cargando;
	}, [cargando]);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasNext) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting && hasNext && !fetchEnCursoRef.current) {
					fetchEnCursoRef.current = true;
					onLoadMore();
				}
			},
			{ rootMargin },
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	}, [sentinelRef, hasNext, onLoadMore, rootMargin]);
}
