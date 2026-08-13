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
	const onLoadMoreRef = useRef(onLoadMore);
	useEffect(() => {
		onLoadMoreRef.current = onLoadMore;
	}, [onLoadMore]);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasNext || cargando) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting && hasNext && !cargando) {
					onLoadMoreRef.current();
				}
			},
			{ rootMargin },
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	}, [sentinelRef, hasNext, cargando, rootMargin]);
}
