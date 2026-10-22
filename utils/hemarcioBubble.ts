export type HemarcioContext = {
  product: "can-donate";
  page: string;
};

const COMPROVANTE_PATH = /^\/comprovante(\/|$)/;

export const isHemarcioEnabled = (enabled: string | boolean | undefined) =>
  enabled === true || enabled === "true";

export const shouldShowHemarcioBubble = (input: {
  enabled: string | boolean | undefined;
  iframed: boolean;
  path: string;
}): boolean => {
  if (!isHemarcioEnabled(input.enabled)) return false;
  if (input.iframed) return false;
  return !COMPROVANTE_PATH.test(input.path);
};

export const hemarcioContextFor = (path: string): HemarcioContext => ({
  product: "can-donate",
  page: path,
});
