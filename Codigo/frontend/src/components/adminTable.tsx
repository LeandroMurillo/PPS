import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

import type { SortDirection } from '../api/admin';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export type AdminColumn<T, S extends string> = {
	id: string;
	label: string;
	sortBy?: S;
	minWidth?: number;
	align?: 'left' | 'right' | 'center';
	render: (row: T) => React.ReactNode;
};

type AdminTableProps<T, S extends string> = {
	columns: AdminColumn<T, S>[];
	rows: T[];
	getRowId: (row: T) => React.Key;
	total: number;
	page: number;
	pageSize: number;
	sortBy: S;
	sortDir: SortDirection;
	loading: boolean;
	error: string | null;
	emptyMessage: string;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	onSortChange: (sortBy: S, sortDir: SortDirection) => void;
	onRowClick?: (row: T) => void;
	selectedRowIds?: React.Key[];
	onSelectionChange?: (selectedIds: React.Key[]) => void;
	showTopPagination?: boolean;
	toolbarActions?: React.ReactNode;
	infiniteScroll?: boolean;
	hasMore?: boolean;
};

export default function AdminTable<T, S extends string>({
	columns,
	rows,
	getRowId,
	total,
	page,
	pageSize,
	sortBy,
	sortDir,
	loading,
	error,
	emptyMessage,
	onPageChange,
	onPageSizeChange,
	onSortChange,
	onRowClick,
	selectedRowIds = [],
	onSelectionChange,
	showTopPagination = false,
	toolbarActions,
	infiniteScroll = false,
	hasMore = false,
}: AdminTableProps<T, S>) {
	const sentinelRef = React.useRef<HTMLTableRowElement | null>(null);
	const selectable = Boolean(onSelectionChange);
	const selectedRowIdSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds]);
	const visibleRowIds = React.useMemo(() => rows.map((row) => getRowId(row)), [getRowId, rows]);
	const selectedVisibleRowIds = visibleRowIds.filter((id) => selectedRowIdSet.has(id));
	const allVisibleRowsSelected = visibleRowIds.length > 0 && selectedVisibleRowIds.length === visibleRowIds.length;
	const someVisibleRowsSelected = selectedVisibleRowIds.length > 0 && !allVisibleRowsSelected;

	useInfiniteScroll(sentinelRef, {
		hasNext: Boolean(infiniteScroll && hasMore),
		cargando: loading,
		onLoadMore: () => onPageChange(page + 1),
	});

	const handleSort = (columnSortBy: S) => {
		onSortChange(columnSortBy, sortBy === columnSortBy && sortDir === 'ASC' ? 'DESC' : 'ASC');
	};

	const handleToggleVisibleRows = (checked: boolean) => {
		if (!onSelectionChange) return;

		const nextSelectedIds = checked
			? Array.from(new Set([...selectedRowIds, ...visibleRowIds]))
			: selectedRowIds.filter((id) => !visibleRowIds.includes(id));

		onSelectionChange(nextSelectedIds);
	};

	const handleToggleRow = (rowId: React.Key, checked: boolean) => {
		if (!onSelectionChange) return;

		onSelectionChange(
			checked ? Array.from(new Set([...selectedRowIds, rowId])) : selectedRowIds.filter((id) => id !== rowId),
		);
	};

	const pagination = infiniteScroll ? (
		<Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
			Mostrando {rows.length} de {total}
		</Typography>
	) : (
		<TablePagination
			component="div"
			count={total}
			page={page}
			rowsPerPage={pageSize}
			rowsPerPageOptions={[]}
			onPageChange={(_event, nextPage) => onPageChange(nextPage)}
			onRowsPerPageChange={onPageSizeChange ? (event) => onPageSizeChange(Number(event.target.value)) : undefined}
			labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
			sx={{ flexShrink: 0 }}
		/>
	);

	const topToolbar = (
		<Box
			sx={{
				position: 'sticky',
				top: 0,
				zIndex: 3,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1,
				minHeight: 52,
				pl: selectable ? 1 : 2,
				pr: 1,
				bgcolor: 'background.paper',
				borderBottom: 1,
				borderColor: 'divider',
				boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
				overflowX: 'auto',
			}}
		>
			{selectable ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
					<Checkbox
						color="primary"
						checked={allVisibleRowsSelected}
						indeterminate={someVisibleRowsSelected}
						disabled={rows.length === 0}
						onChange={(event) => handleToggleVisibleRows(event.target.checked)}
						inputProps={{ 'aria-label': 'Seleccionar filas visibles' }}
					/>
					{toolbarActions}
				</Box>
			) : (
				<Box />
			)}
			{pagination}
		</Box>
	);

	return (
		<Paper variant="outlined" sx={{ overflow: 'visible', position: 'relative' }}>
			{loading && <LinearProgress sx={{ position: 'absolute', inset: '0 0 auto', zIndex: 2 }} />}
			{error && (
				<Box sx={{ p: 2 }}>
					<Alert severity="error">{error}</Alert>
				</Box>
			)}
			{showTopPagination && topToolbar}
			<TableContainer sx={{ overflowX: 'auto' }}>
				<Table size="small" aria-label="Listado administrativo">
					<TableHead>
						<TableRow>
							{selectable && (
								<TableCell padding="checkbox">
									{!showTopPagination && (
										<Checkbox
											color="primary"
											checked={allVisibleRowsSelected}
											indeterminate={someVisibleRowsSelected}
											disabled={rows.length === 0}
											onChange={(event) => handleToggleVisibleRows(event.target.checked)}
											inputProps={{ 'aria-label': 'Seleccionar filas visibles' }}
										/>
									)}
								</TableCell>
							)}
							{columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align}
									sx={{ minWidth: column.minWidth, fontWeight: 700, whiteSpace: 'nowrap' }}
								>
									{column.sortBy ? (
										<TableSortLabel
											active={sortBy === column.sortBy}
											direction={sortBy === column.sortBy && sortDir === 'DESC' ? 'desc' : 'asc'}
											onClick={() => handleSort(column.sortBy as S)}
										>
											{column.label}
										</TableSortLabel>
									) : (
										column.label
									)}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading && rows.length === 0
							? Array.from({ length: Math.min(pageSize, 8) }, (_, index) => (
									<TableRow key={`skeleton-${index}`}>
										{selectable && (
											<TableCell padding="checkbox">
												<Skeleton variant="rounded" width={22} height={22} />
											</TableCell>
										)}
										{columns.map((column) => (
											<TableCell key={column.id}>
												<Skeleton />
											</TableCell>
										))}
									</TableRow>
								))
							: rows.map((row) => {
									const rowId = getRowId(row);

									return (
										<TableRow
											hover
											key={rowId}
											selected={selectedRowIdSet.has(rowId)}
											onClick={() => onRowClick?.(row)}
											onKeyDown={(event) => {
												if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
													event.preventDefault();
													onRowClick(row);
												}
											}}
											tabIndex={onRowClick ? 0 : undefined}
											sx={{ cursor: onRowClick ? 'pointer' : undefined }}
										>
											{selectable && (
												<TableCell padding="checkbox">
													<Checkbox
														color="primary"
														checked={selectedRowIdSet.has(rowId)}
														onClick={(event) => event.stopPropagation()}
														onKeyDown={(event) => event.stopPropagation()}
														onChange={(event) =>
															handleToggleRow(rowId, event.target.checked)
														}
														inputProps={{ 'aria-label': `Seleccionar fila ${rowId}` }}
													/>
												</TableCell>
											)}
											{columns.map((column) => (
												<TableCell key={column.id} align={column.align}>
													{column.render(row)}
												</TableCell>
											))}
										</TableRow>
									);
								})}
						{infiniteScroll && (
							<TableRow ref={sentinelRef} sx={{ height: 24 }}>
								<TableCell
									colSpan={columns.length + (selectable ? 1 : 0)}
									align="center"
									sx={{ borderBottom: 'none', py: 1 }}
								>
									{loading && rows.length > 0 && <CircularProgress size={24} />}
								</TableCell>
							</TableRow>
						)}
						{!loading && !error && rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={columns.length + (selectable ? 1 : 0)}>
									<Typography color="text.secondary" align="center" sx={{ py: 8 }}>
										{emptyMessage}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{!showTopPagination && pagination}
		</Paper>
	);
}
