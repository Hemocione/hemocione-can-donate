import type { AnswerValue, DonationIntent } from "~/server/models/formResponse";

export interface Question {
  question: string;
  slug: string;
  description: string;
  anonymousOnly?: Boolean;
  donationIntents?: DonationIntent[];
  failingResponses: string[]; // Para comparar e ver se alguma pergunta falha
  //Se alguma falhar, salva o forms como falha, se não, não
  failingReason: string;
  image: string;
}

const ageQuestion: Question = {
  question: "Você tem entre 16 e 69 anos?",
  slug: "age",
  description:
    "Para sua segurança, há idades mínima e máxima para doação de sangue. Menores de 18 anos devem apresentar consentimento formal do responsável legal.",
  anonymousOnly: true,
  failingResponses: ["negative", "unknown"],
  failingReason:
    "A idade mínima para doação é de 16 anos e a máxima é de 69 anos. Isso assegura que você esteja em condições adequadas para o procedimento.",
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
    question: "Você fez tatuagem ou piercing nos últimos 6 meses?",
    slug: "tattooOrPiercing",
    description:
      "Tatuagens e piercings podem aumentar o risco de infecções. Precisamos garantir que você esteja saudável para doar.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Tatuagens ou piercings recentes podem representar um risco de infecção, impedindo a doação temporariamente.",
    image: "images/tattooOrPiercing.png",
  },
  {
    question:
      "Você morou ou viajou para fora do Brasil (em áreas de risco) ou para Amazônia Legal nos últimos 12 meses?",
    slug: "traveledAbroad",
    description:
      "Viagens recentes para fora do Brasil ou para a Amazônia Legal podem apresentar riscos de exposição a doenças endêmicas, como malária, febre amarela e outras, que podem comprometer a segurança da doação. Exemplos de áreas de risco incluem: África (Nigéria, Gana, Camarões, República Democrática do Congo), América do Sul (Amazonas, Acre, Peru, Colômbia, Venezuela) e Sudeste Asiático (Tailândia, Vietnã, Indonésia, Malásia). Para mais informações, consulte o hemocentro local.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Viagens para áreas de risco podem aumentar a possibilidade de infecções, tornando necessária a avaliação cuidadosa dessas situações.",
    image: "images/traveledAbroad.png",
  },
  {
    question:
      "Você possui algum piercing na boca, nariz ou região genital, ou retirou um há menos de 12 meses?",
    slug: "mouthPiercing",
    description:
      "Piercings em áreas sensíveis podem aumentar o risco de infecções. É importante garantir que você esteja saudável para a doação.",
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

export function getQuestionsFromContext(
  donationIntent: DonationIntent | null,
  isAnonymous: boolean
): Question[] {
  return questions.filter(
    (question) =>
      (!question.anonymousOnly || isAnonymous) &&
      (!question.donationIntents ||
        (donationIntent && question.donationIntents.includes(donationIntent)))
  );
}

interface Answer {
  value?: AnswerValue | null;
}

export function getFilteredQuestions(answersSlugs: string[]) {
  return questions.filter((question) => answersSlugs.includes(question.slug));
}

export function getFailingQuestionsForContext(
  answers: Record<string, Answer>,
  donationIntent: DonationIntent | null,
  isAnonymous: boolean
) {
  let questions = getQuestionsFromContext(donationIntent, isAnonymous);
  const alreadyHasAgeQuestion = questions.find((q) => q.slug === "age");
  if (!alreadyHasAgeQuestion) {
    questions = [ageQuestion].concat(questions);
  }
  return (
    (Object.keys(answers)
      .map((answerSlug) => {
        const question = questions.find((q) => q.slug === answerSlug);
        const answer = answers[answerSlug];
        if (
          question &&
          answer.value &&
          question.failingResponses.includes(answer.value)
        ) {
          return question;
        }
      })
      .filter(Boolean) as Question[]) || []
  );
}

export default questions;

//funcao getQuestionsFromContext que vai a intent e o modo
//vai so filtrar la nos getters
