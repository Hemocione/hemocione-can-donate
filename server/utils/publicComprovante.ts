const NAME_FALLBACK = "Doador(a)";

export type PublicComprovante = {
  displayName: string;
  finishedAt: Date;
  status: "able-to-donate" | "unable-to-donate";
};

/**
 * Primeiro nome + inicial do sobrenome. O primeiro nome isolado seria fraco
 * como prova de identidade; o nome completo seria exposicao desnecessaria numa
 * URL publica.
 */
export function formatDisplayName(fullName?: string | null): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return NAME_FALLBACK;
  const [first, ...rest] = parts;
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

/**
 * Allowlist explicita: constroi o objeto publico campo por campo em vez de
 * remover campos de um documento inteiro. Uma denylist falharia ABERTA quando
 * alguem acrescentasse campo sensivel novo ao schema do FormResponse.
 */
export function buildPublicComprovante(doc: unknown): PublicComprovante | null {
  if (!doc || typeof doc !== "object") return null;

  const candidate = doc as {
    finishedAt?: Date | null;
    status?: string;
    user?: { name?: string | null } | null;
  };

  if (!candidate.finishedAt) return null;
  if (
    candidate.status !== "able-to-donate" &&
    candidate.status !== "unable-to-donate"
  ) {
    return null;
  }

  return {
    displayName: formatDisplayName(candidate.user?.name),
    finishedAt: candidate.finishedAt,
    status: candidate.status,
  };
}
