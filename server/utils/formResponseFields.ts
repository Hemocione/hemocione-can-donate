// Allowlist explicita dos campos que o front realmente consome.
//
// O handler devolvia o documento INTEIRO, sem autenticacao nenhuma: incluia
// user.email, client.ip, client.geolocation e o mapa completo de respostas de
// triagem — que sao dado de saude — sob um _id que e ObjectId, logo
// parcialmente enumeravel.
//
// Allowlist e nao denylist de proposito: falha FECHADO quando alguem
// acrescentar campo sensivel novo ao schema.
export const FRONTEND_FIELDS = [
  "mode",
  "user.name",
  "user.id",
  "donationIntent",
  "answers",
  "autoFilledAnswers",
  "startedAt",
  "finishedAt",
  "status",
  "failedQuestions",
  "integration",
  // Campo introduzido pelo PR do comprovante publico. Selecionar um path que
  // ainda nao existe no schema e no-op no Mongo, entao este arquivo funciona
  // nas duas ordens de merge.
  "publicToken",
].join(" ");
