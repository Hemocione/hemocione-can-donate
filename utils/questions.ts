import type { AnswerValue, DonationIntent } from "~/server/models/formResponse";

interface Answer {
  value?: AnswerValue | null;
}

export type Answers = Record<string, Answer | undefined>;

export interface Question {
  question: string;
  slug: string;
  description: string;
  donationIntents?: DonationIntent[];
  // Pergunta condicional: so entra no questionario quando a condicao vale para
  // as respostas atuais.
  showIf?: (answers: Answers) => boolean;
  failingResponses: string[]; // Para comparar e ver se alguma pergunta falha
  //Se alguma falhar, salva o forms como falha, se não, não
  failingReason: string;
  image: string;
}

// Portaria GM/MS nº 11.685/2026 (vigente desde 30/09/2026): a primeira doacao
// continua limitada a 60 anos, 11 meses e 29 dias, e nao existe mais idade
// maxima para quem ja doou antes.
//
// "Nao" na pergunta de idade nao reprova sozinho: abre `priorDonation`, que
// separa quem tem mais de 60 e ja doou (apto) de quem tem menos de 16 ou nunca
// doou (inapto).
const ageQuestion: Question = {
  question: "Você tem entre 16 e 60 anos?",
  slug: "age",
  description:
    "A idade mínima para doação é de 16 anos. Menores de 18 anos devem apresentar consentimento formal do responsável legal. A primeira doação deve acontecer até os 60 anos, 11 meses e 29 dias.",
  failingResponses: ["unknown"],
  failingReason:
    "Precisamos saber sua idade: a idade mínima para doação é de 16 anos, e a primeira doação deve acontecer até os 60 anos, 11 meses e 29 dias.",
  image: "images/age.png",
};

const priorDonationQuestion: Question = {
  question: "Você tem mais de 60 anos e já doou sangue alguma vez?",
  slug: "priorDonation",
  description:
    "Quem já doou sangue antes pode continuar doando depois dos 60 anos, sem idade máxima, se estiver com boa saúde e for considerado apto na avaliação clínica do hemocentro.",
  showIf: (answers) => answers.age?.value === "negative",
  failingResponses: ["negative", "unknown"],
  failingReason:
    "A idade mínima para doação é de 16 anos, e a primeira doação deve acontecer até os 60 anos, 11 meses e 29 dias. Depois dos 60 anos, só pode doar quem já doou sangue antes.",
  image: "images/age.png",
};

const questions: Question[] = [
  {
    question: "Você pesa 50kg ou mais?",
    slug: "weight",
    description:
      "O peso é um fator crítico para garantir que a doação não afete sua saúde. Um peso mínimo é necessário para garantir a segurança do doador.",
    failingResponses: ["negative", "unknown"],
    failingReason:
      "Um peso mínimo de 50 kg é essencial para garantir que a quantidade de sangue coletada seja segura para você.",
    image: "images/weight.png",
  },
  ageQuestion,
  priorDonationQuestion,
  {
    question: "Você se alimentou bem hoje?",
    slug: "ateToday",
    description: "Uma alimentação adequada é essencial para uma doação segura. Isso significa consumir refeições balanceadas que incluam carboidratos, proteínas e vitaminas. Exemplos incluem frutas, vegetais e carnes magras. Além disso, é importante manter-se bem hidratado, bebendo água. Evite alimentos gordurosos ou bebidas alcoólicas nas horas que antecedem a doação.",
    donationIntents: ["today"],
    failingResponses: ["negative", "unknown"],
    failingReason:
      "Uma alimentação inadequada e a desidratação podem levar a reações adversas durante ou após a doação, comprometendo sua saúde e a qualidade do sangue doado.",
    image: "images/ateToday.png",
  },
  {
    question:
      "Você dormiu bem nas últimas 24 horas, com pelo menos 6 horas de sono contínuo?",
    slug: "sleptOk",
    description:
      "Um descanso adequado é fundamental para garantir sua disposição e segurança durante a doação de sangue.",
    donationIntents: ["today"],
    failingResponses: ["negative", "unknown"],
    failingReason:
      "O descanso insuficiente pode afetar sua segurança e bem-estar durante a doação.",
    image: "images/sleptOk.png",
  },
  {
    question: "Você ingeriu bebidas alcoólicas nas últimas 12 horas?",
    slug: "alcohol",
    description:
      "Não é permitido doar sangue após consumir bebidas alcoólicas para garantir sua saúde e a qualidade do sangue doado.",
    donationIntents: ["today"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Não é permitido doar sangue após ingestão de álcool.",
    image: "images/alcohol.png",
  },
  {
    question:
      "Você participou de alguma atividade sexual de risco nos últimos 3 meses?",
    slug: "sexRisk",
    description:
      "Essa pergunta é importante para garantir a segurança de todos. Atividades sexuais de risco podem aumentar a possibilidade de transmissão de infecções. Exemplos: relações sexuais sem proteção, múltiplos parceiros, contato com usuários de drogas ou pessoas com infecções sexualmente transmissíveis (ISTs).",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Atividades sexuais de risco podem comprometer a segurança da doação e a saúde dos receptores, tornando necessária a avaliação cuidadosa dessas situações.",
    image: "images/sexRisk.png",
  },
  {
    question:
      "Você fez tatuagem, maquiagem definitiva, piercing, botox, preenchimento ou microagulhamento nos últimos 7 dias?",
    slug: "tattooOrPiercing",
    description:
      "Esses procedimentos podem aumentar o risco de infecções. Se o procedimento foi feito num local que cumpre as normas de segurança, você pode doar depois de 7 dias. Se o hemocentro não conseguir avaliar a segurança do local, o prazo é de 4 meses. Piercing na boca ou na região genital tem uma regra própria, na próxima pergunta.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Tatuagens ou piercings recentes podem representar um risco de infecção, impedindo a doação temporariamente.",
    image: "images/tattooOrPiercing.png",
  },
  {
    question:
      "Você esteve em área com risco de malária (Amazônia Legal ou áreas de risco fora do Brasil) nos últimos 30 dias?",
    slug: "traveledAbroad",
    description:
      "Quem mora ou esteve em área endêmica de malária, ou teve contato com mata, bosque ou floresta nessas regiões, deve esperar 30 dias para doar. Exemplos de áreas de risco incluem: África (Nigéria, Gana, Camarões, República Democrática do Congo), América do Sul (Amazonas, Acre, Peru, Colômbia, Venezuela) e Sudeste Asiático (Tailândia, Vietnã, Indonésia, Malásia). Para mais informações, consulte o hemocentro local.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Quem esteve em área com risco de malária deve esperar 30 dias antes de doar.",
    image: "images/traveledAbroad.png",
  },
  {
    question:
      "Você possui algum piercing na boca ou região genital, ou retirou um há menos de 4 meses?",
    slug: "mouthPiercing",
    description:
      "Piercings em áreas sensíveis podem aumentar o risco de infecções. Você pode doar 4 meses depois de retirar o piercing.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Piercings recentes em áreas sensíveis podem representar um risco de infecção, impedindo a doação temporariamente.",
    image: "images/mouthPiercing.svg",
  },
  {
    question:
      "Você fez algum tratamento médico, dentário, endoscópico ou operação nos últimos 6 meses?",
    slug: "medicalTreatmentOrSurgery",
    description:
      "Tratamentos médicos ou cirurgias recentes podem afetar sua capacidade de doar. Precisamos garantir que você esteja completamente recuperado.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Tratamentos ou cirurgias recentes podem comprometer sua saúde e a segurança da doação.",
    image: "images/medicalTreatmentOrSurgery.png",
  },
];

// Perguntas que valem para a intencao e as respostas atuais. E o conjunto que o
// formulario precisa ter respondido para terminar, inclusive as respostas que o
// servidor preencheu pelo cadastro do Hemocione ID.
export function getApplicableQuestions(
  donationIntent: DonationIntent | null,
  answers: Answers = {}
): Question[] {
  return questions.filter(
    (question) =>
      (!question.donationIntents ||
        (donationIntent && question.donationIntents.includes(donationIntent))) &&
      (!question.showIf || question.showIf(answers))
  );
}

// Perguntas que a pessoa responde na tela: as aplicaveis menos as que o
// servidor ja preencheu (`autoFilledAnswers`, so no modo logado).
export function getQuestionsFromContext(
  donationIntent: DonationIntent | null,
  answers: Answers = {},
  autoFilledSlugs: string[] = []
): Question[] {
  return getApplicableQuestions(donationIntent, answers).filter(
    (question) => !autoFilledSlugs.includes(question.slug)
  );
}

export function getFilteredQuestions(answersSlugs: string[]) {
  return questions.filter((question) => answersSlugs.includes(question.slug));
}

export function getFailingQuestionsForContext(
  answers: Answers,
  donationIntent: DonationIntent | null
): Question[] {
  return getApplicableQuestions(donationIntent, answers).filter((question) => {
    const value = answers[question.slug]?.value;
    return Boolean(value && question.failingResponses.includes(value));
  });
}

// Estado do formulario para as respostas atuais: termina quando todas as
// perguntas aplicaveis tem resposta.
export function evaluateAnswers(
  answers: Answers,
  donationIntent: DonationIntent | null
) {
  const relevantSlugs = getApplicableQuestions(donationIntent, answers).map(
    (q) => q.slug
  );
  const finished = relevantSlugs.every((slug) => Boolean(answers[slug]));
  const failedQuestions = finished
    ? getFailingQuestionsForContext(answers, donationIntent).map((q) => q.slug)
    : [];
  return { finished, relevantSlugs, failedQuestions };
}

export default questions;

//funcao getQuestionsFromContext que vai a intent e o modo
//vai so filtrar la nos getters
