import * as React from 'react';
import { Navigate, useParams } from 'react-router';

export default function AdminSubcategoriasPage() {
	const { categoriaId } = useParams<{ categoriaId: string }>();

	return <Navigate to={categoriaId ? `/categorias/${categoriaId}` : '/categorias'} replace />;
}
