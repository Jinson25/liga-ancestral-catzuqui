// Definición centralizada de roles para la liga
// Puedes importar este archivo donde necesites validar roles o mostrar nombres amigables

export type Rol = 'presidente' | 'secretario' | 'tribunal' | 'vocal' | 'equipo' | 'admin_liga';

export const ROLES: { value: Rol; label: string; description: string }[] = [
  { value: 'presidente', label: 'Presidente', description: 'Gestiona toda la liga, aprueba equipos y jugadores.' },
  { value: 'secretario', label: 'Secretario', description: 'Gestiona documentos y validaciones administrativas.' },
  { value: 'tribunal', label: 'Tribunal Penal', description: 'Aprueba/rechaza sanciones y carnets.' },
  { value: 'vocal', label: 'Vocal', description: 'Apoya en la gestión y validación de información.' },
  { value: 'equipo', label: 'Equipo', description: 'Usuario representante de un equipo.' },
  { value: 'admin_liga', label: 'Administrador', description: 'Acceso total para soporte o emergencias.' },
];

// Utilidad para mostrar el nombre amigable de un rolexport function getRolLabel(rol: Rol) {
  return ROLES.find(r => r.value === rol)?.label || rol;
}

// Utilidad para mostrar la descripción de un rol
export function getRolDescription(rol: Rol) {
  return ROLES.find(r => r.value === rol)?.description || '';
}
