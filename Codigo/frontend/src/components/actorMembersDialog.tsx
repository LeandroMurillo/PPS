import * as React from 'react';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Paper,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';

import {
	agregarIntegranteApi,
	agregarIntegranteNoRegistradoApi,
	editarIntegranteApi,
	editarIntegranteNoRegistradoApi,
	eliminarIntegranteApi,
	eliminarIntegranteNoRegistradoApi,
	listarIntegrantesApi,
	type IntegranteApiItem,
} from '../api/actores';
import { notify } from '../utils/toast';
import type { MyActor } from '../pages/misActores';

function getMemberKey(member: IntegranteApiItem): string {
	return member.tipo === 'REGISTRADO'
		? `usuario-${member.idUsuario}`
		: `sin-cuenta-${member.idIntegranteNoRegistrado}`;
}

type Props = {
	open: boolean;
	actor: MyActor | null;
	onClose: () => void;
};

export default function ActorMembersDialog({ open, actor, onClose }: Props) {
	const [integrantes, setIntegrantes] = React.useState<IntegranteApiItem[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
	const [deletingKey, setDeletingKey] = React.useState<string | null>(null);

	// Estado para agregar nuevo integrante
	const [memberType, setMemberType] = React.useState<'REGISTRADO' | 'NO_REGISTRADO'>('NO_REGISTRADO');
	const [nombre, setNombre] = React.useState('');
	const [apellido, setApellido] = React.useState('');
	const [email, setEmail] = React.useState('');
	const [rol, setRol] = React.useState('Integrante');

	// Estado para edición inline de un integrante
	const [editingMember, setEditingMember] = React.useState<IntegranteApiItem | null>(null);
	const [editNombre, setEditNombre] = React.useState('');
	const [editApellido, setEditApellido] = React.useState('');
	const [editEmail, setEditEmail] = React.useState('');
	const [editRol, setEditRol] = React.useState('');

	const loadMembers = React.useCallback(async (actorId: number) => {
		try {
			setLoading(true);
			const res = await listarIntegrantesApi(actorId);
			setIntegrantes(res?.data ?? []);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'No se pudieron cargar los integrantes.';
			notify.error(errMsg);
			setIntegrantes([]);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		if (!open || !actor) return;

		setMemberType('NO_REGISTRADO');
		setNombre('');
		setApellido('');
		setEmail('');
		setRol('Integrante');
		setEditingMember(null);

		void loadMembers(actor.id);
	}, [open, actor?.id, loadMembers]);

	const handleAddMember = async () => {
		if (!actor) return;
		if (memberType === 'REGISTRADO' && !email.trim()) return;
		if (memberType === 'NO_REGISTRADO' && (!nombre.trim() || !apellido.trim())) return;

		setSubmitting(true);
		try {
			if (memberType === 'REGISTRADO') {
				await agregarIntegranteApi(actor.id, {
					email: email.trim(),
					rol: rol.trim() || 'Integrante',
				});
			} else {
				await agregarIntegranteNoRegistradoApi(actor.id, {
					nombre: nombre.trim(),
					apellido: apellido.trim(),
					email: email.trim() || null,
					rol: rol.trim() || 'Integrante',
				});
			}

			notify.success('Integrante agregado correctamente.');
			setNombre('');
			setApellido('');
			setEmail('');
			setRol('Integrante');
			await loadMembers(actor.id);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al agregar integrante.';
			notify.error(errMsg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleStartEdit = (member: IntegranteApiItem) => {
		setEditingMember(member);
		setEditNombre(member.nombre);
		setEditApellido(member.apellido);
		setEditEmail(member.email ?? '');
		setEditRol(member.rol);
	};

	const handleSaveEdit = async () => {
		if (!actor || !editingMember || !editRol.trim()) return;

		setSubmitting(true);
		try {
			if (editingMember.tipo === 'REGISTRADO' && editingMember.idUsuario) {
				await editarIntegranteApi(actor.id, editingMember.idUsuario, {
					rol: editRol.trim(),
				});
			} else if (editingMember.idIntegranteNoRegistrado) {
				await editarIntegranteNoRegistradoApi(actor.id, editingMember.idIntegranteNoRegistrado, {
					nombre: editNombre.trim(),
					apellido: editApellido.trim(),
					email: editEmail.trim() || null,
					rol: editRol.trim(),
				});
			}

			notify.success('Integrante modificado correctamente.');
			setEditingMember(null);
			await loadMembers(actor.id);
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al modificar integrante.';
			notify.error(errMsg);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteMember = async (member: IntegranteApiItem) => {
		if (!actor) return;

		const memberKey = getMemberKey(member);
		setDeletingKey(memberKey);
		try {
			if (member.tipo === 'REGISTRADO' && member.idUsuario) {
				await eliminarIntegranteApi(actor.id, member.idUsuario);
			} else if (member.idIntegranteNoRegistrado) {
				await eliminarIntegranteNoRegistradoApi(actor.id, member.idIntegranteNoRegistrado);
			}
			notify.success('Integrante eliminado.');
			setIntegrantes((prev) => prev.filter((item) => getMemberKey(item) !== memberKey));
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : 'Error al eliminar integrante.';
			notify.error(errMsg);
		} finally {
			setDeletingKey(null);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle fontWeight={700}>Gestionar integrantes: {actor?.nombre}</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={3}>
					<Typography variant="body2" color="text.secondary">
						Administrá las personas que forman parte del actor, tengan o no una cuenta en la plataforma.
					</Typography>

					{/* Formulario de alta aislado */}
					<Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
						<Typography variant="subtitle2" fontWeight={700} gutterBottom>
							Agregar integrante
						</Typography>
						<ToggleButtonGroup
							exclusive
							size="small"
							value={memberType}
							onChange={(_event, value: 'REGISTRADO' | 'NO_REGISTRADO' | null) => {
								if (value) setMemberType(value);
							}}
							sx={{ mt: 1, mb: 1 }}
						>
							<ToggleButton value="REGISTRADO">Usuario registrado</ToggleButton>
							<ToggleButton value="NO_REGISTRADO">Persona sin cuenta</ToggleButton>
						</ToggleButtonGroup>

						<Grid container spacing={2} sx={{ mt: 0.5 }}>
							{memberType === 'NO_REGISTRADO' && (
								<>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											size="small"
											required
											label="Nombre"
											value={nombre}
											onChange={(e) => setNombre(e.target.value)}
										/>
									</Grid>
									<Grid size={{ xs: 12, md: 6 }}>
										<TextField
											fullWidth
											size="small"
											required
											label="Apellido"
											value={apellido}
											onChange={(e) => setApellido(e.target.value)}
										/>
									</Grid>
								</>
							)}
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									fullWidth
									size="small"
									required={memberType === 'REGISTRADO'}
									type="email"
									label={
										memberType === 'REGISTRADO'
											? 'Correo del usuario registrado'
											: 'Correo electrónico (opcional)'
									}
									placeholder="ejemplo@correo.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 12, md: 6 }}>
								<TextField
									fullWidth
									size="small"
									label="Rol o función en el proyecto"
									placeholder="Ej. Músico, Director, Prensa, Técnico"
									value={rol}
									onChange={(e) => setRol(e.target.value)}
								/>
							</Grid>
							<Grid size={{ xs: 12 }}>
								<Button
									variant="contained"
									size="small"
									startIcon={<GroupIcon />}
									onClick={handleAddMember}
									disabled={
										submitting ||
										!rol.trim() ||
										(memberType === 'REGISTRADO'
											? !email.trim()
											: !nombre.trim() || !apellido.trim())
									}
								>
									{submitting ? <CircularProgress size={18} /> : 'Agregar integrante'}
								</Button>
							</Grid>
						</Grid>
					</Paper>

					{/* Lista de integrantes */}
					<Typography variant="subtitle2" fontWeight={700}>
						Integrantes vinculados ({integrantes.length})
					</Typography>

					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress size={32} />
						</Box>
					) : integrantes.length === 0 ? (
						<Alert severity="info">No se encontraron integrantes para este actor.</Alert>
					) : (
						<Stack spacing={1.5} divider={<Divider />}>
							{integrantes.map((member) => {
								const memberKey = getMemberKey(member);
								const isEditing = editingMember && getMemberKey(editingMember) === memberKey;

								return isEditing ? (
									<Paper key={memberKey} variant="outlined" sx={{ p: 2 }}>
										<Grid container spacing={2}>
											{member.tipo === 'NO_REGISTRADO' && (
												<>
													<Grid size={{ xs: 12, sm: 6 }}>
														<TextField
															fullWidth
															required
															size="small"
															label="Nombre"
															value={editNombre}
															onChange={(e) => setEditNombre(e.target.value)}
														/>
													</Grid>
													<Grid size={{ xs: 12, sm: 6 }}>
														<TextField
															fullWidth
															required
															size="small"
															label="Apellido"
															value={editApellido}
															onChange={(e) => setEditApellido(e.target.value)}
														/>
													</Grid>
													<Grid size={{ xs: 12, sm: 6 }}>
														<TextField
															fullWidth
															size="small"
															type="email"
															label="Correo (opcional)"
															value={editEmail}
															onChange={(e) => setEditEmail(e.target.value)}
														/>
													</Grid>
												</>
											)}
											<Grid size={{ xs: 12, sm: 6 }}>
												<TextField
													fullWidth
													required
													size="small"
													label="Rol o función"
													value={editRol}
													onChange={(e) => setEditRol(e.target.value)}
												/>
											</Grid>
											<Grid size={{ xs: 12 }}>
												<Stack direction="row" spacing={1} justifyContent="flex-end">
													<Button
														size="small"
														onClick={() => setEditingMember(null)}
														disabled={submitting}
													>
														Cancelar
													</Button>
													<Button
														variant="contained"
														size="small"
														onClick={handleSaveEdit}
														disabled={
															submitting ||
															!editRol.trim() ||
															(member.tipo === 'NO_REGISTRADO' &&
																(!editNombre.trim() || !editApellido.trim()))
														}
													>
														Guardar cambios
													</Button>
												</Stack>
											</Grid>
										</Grid>
									</Paper>
								) : (
									<Stack
										key={memberKey}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={2}
									>
										<Stack
											direction="row"
											spacing={1.5}
											alignItems="center"
											sx={{ minWidth: 0 }}
										>
											<Avatar
												sx={{
													bgcolor: member.esDueño ? 'primary.main' : 'secondary.main',
													width: 36,
													height: 36,
													fontSize: 14,
												}}
											>
												{member.nombre.charAt(0)}
												{member.apellido?.charAt(0) || ''}
											</Avatar>
											<Box sx={{ minWidth: 0 }}>
												<Stack direction="row" spacing={1} alignItems="center">
													<Typography variant="body2" fontWeight={600}>
														{member.nombre} {member.apellido}
													</Typography>
													{member.esDueño && (
														<Chip
															label="Dueño Principal"
															size="small"
															color="primary"
															sx={{ height: 20, fontSize: 10 }}
														/>
													)}
													{member.tipo === 'NO_REGISTRADO' && (
														<Chip
															label="Sin cuenta"
															size="small"
															variant="outlined"
															sx={{ height: 20, fontSize: 10 }}
														/>
													)}
												</Stack>
												<Typography variant="caption" color="text.secondary">
													{member.email ? `📧 ${member.email} · ` : ''}Rol: {member.rol}
												</Typography>
											</Box>
										</Stack>

										<Stack direction="row" spacing={0.5}>
											<IconButton
												size="small"
												color="primary"
												onClick={() => handleStartEdit(member)}
												aria-label={`Editar a ${member.nombre} ${member.apellido}`}
											>
												<EditIcon fontSize="small" />
											</IconButton>
											{!member.esDueño && (
												<IconButton
													size="small"
													color="error"
													onClick={() => handleDeleteMember(member)}
													disabled={deletingKey !== null}
													aria-label={`Eliminar a ${member.nombre} ${member.apellido}`}
												>
													{deletingKey === memberKey ? (
														<CircularProgress size={18} />
													) : (
														<DeleteOutlineIcon fontSize="small" />
													)}
												</IconButton>
											)}
										</Stack>
									</Stack>
								);
							})}
						</Stack>
					)}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button variant="contained" onClick={onClose}>
					Cerrar
				</Button>
			</DialogActions>
		</Dialog>
	);
}