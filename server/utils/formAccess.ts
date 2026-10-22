// Formulario com dono so aceita o dono; formulario anonimo segue aberto
export function canAccessForm(
  formUserId: string | null | undefined,
  requesterId: string | null
): boolean {
  if (!formUserId) return true;
  return formUserId === requesterId;
}
