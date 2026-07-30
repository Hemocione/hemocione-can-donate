/**
 * Resolve um path RELATIVO sobre uma base fixa, garantindo que o host da base
 * nunca seja trocado.
 *
 * Existe porque getRedirectURL e handleBtnClick fazem
 * navigateTo(url, { external: true }). Aceitar URL completa vinda de query
 * string abriria open-redirect: um atacante mandaria
 * ?returnPath=https://phish.example e o can-donate levaria o usuario logado
 * para la.
 */
export function buildAllowedUrl(
  base: string,
  relativePath: unknown,
): string | null {
  // relativePath vem de query string: param repetido
  // (?returnPath=a&returnPath=b) chega como array, e chamar metodo de string
  // nele estouraria dentro de um caminho de redirect.
  if (typeof relativePath !== "string") return null;
  if (!base || !relativePath) return null;

  // "//evil.com" e protocol-relative; "https://..." e absoluto; "javascript:"
  // e esquema. Nenhum deles e path relativo.
  if (relativePath.startsWith("//")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(relativePath)) return null;
  // "/../.." escaparia da raiz pretendida. Recusa em vez de clampar em
  // silencio.
  if (relativePath.includes("..")) return null;

  let baseUrl: URL;
  try {
    baseUrl = new URL(base);
  } catch {
    return null;
  }

  const normalized = relativePath.startsWith("/")
    ? relativePath
    : `/${relativePath}`;

  let resolved: URL;
  try {
    resolved = new URL(normalized, baseUrl);
  } catch {
    return null;
  }

  // Cinto e suspensorio: se qualquer coisa mudou host ou protocolo, recusa.
  if (resolved.host !== baseUrl.host || resolved.protocol !== baseUrl.protocol) {
    return null;
  }

  return resolved.toString();
}
