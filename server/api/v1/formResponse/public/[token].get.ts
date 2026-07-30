import { defineEventHandler } from "h3";
import { FormResponse } from "~/server/models/formResponse";
import { buildPublicComprovante } from "~/server/utils/publicComprovante";

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token;

  // 404 identico para token ausente, malformado, inexistente e formulario nao
  // finalizado: nao revelar se um comprovante existe.
  const notFound = () =>
    createError({ statusCode: 404, statusMessage: "Comprovante not found" });

  if (!token || !TOKEN_PATTERN.test(token)) throw notFound();

  // select explicito — nao trazer o documento inteiro para a memoria do
  // handler. Defesa em profundidade junto de buildPublicComprovante, que
  // garante o shape da resposta.
  const doc = await FormResponse.findOne({ publicToken: token })
    .select("user.name finishedAt status")
    .lean();

  const comprovante = buildPublicComprovante(doc);
  if (!comprovante) throw notFound();

  return comprovante;
});
