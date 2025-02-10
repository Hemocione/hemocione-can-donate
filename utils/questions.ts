import type { AnswerValue, DonationIntent } from "~/server/models/formResponse";

interface Question {
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

const questions: Question[] = [
  {
    question: "Você pesa 50kg ou mais?",
    slug: "weight",
    description:
      "O peso é um fator crítico para garantir que a doação não afete sua saúde. Um peso mínimo é necessário para a segurança do doador.",
    failingResponses: ["negative", "unknown"],
    failingReason:
      "O peso mínimo para doação é de 50 kg. Isso é essencial para garantir que a quantidade de sangue coletada seja segura para você.",
    image: "images/weight.png",
  },
  {
    question: "Você tem entre 16 e 69 anos?",
    slug: "age",
    description:
      "Para sua segurança, há idades mínima e máxima para doação de sangue. Menores de 18 anos devem apresentar consentimento formal do responsável legal.",
    anonymousOnly: true,
    failingResponses: ["negative", "unknown"],
    failingReason:
      "A idade mínima para doação é de 16 anos e a máxima é de 69 anos. Isso assegura que você esteja em condições adequadas para o procedimento.",
    image: "images/age.png",
  },
  {
    question: "Você se alimentou bem hoje?",
    slug: "ateToday",
    description: "Alimentação adequada é essencial para uma doação segura.",
    donationIntents: ["today"],
    failingResponses: ["negative", "unknown"],
    failingReason:
      "É fundamental estar bem alimentado para evitar reações adversas durante ou após a doação.",
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
      "Essa pergunta é crucial para garantir a segurança de todos. Atividades sexuais de risco podem aumentar o risco de transmissão de doenças infecciosas.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Atividades sexuais de risco podem comprometer a segurança da doação e a saúde dos receptores.",
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
      "Tatuagens ou piercings realizados nos últimos 6 meses podem representar um risco maior de infecção, o que impede a doação.",
    image: "images/tattooOrPiercing.png",
  },
  {
    question:
      "Morou ou viajou para fora do Brasil (em áreas de risco) ou para Amazônia Legal nos últimos 12 meses?",
    slug: "traveledAbroad",
    description:
      "Viagens recentes para fora do Brasil ou para a Amazônia Legal podem apresentar riscos de exposição a doenças endêmicas, como malária, febre amarela e outras, que podem comprometer a segurança da doação.",
    donationIntents: ["today", "soon"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Viagens recentes para áreas de risco impedem a doação de sangue temporariamente.",
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
      "Piercings em áreas sensíveis podem representar um maior risco de infecção, o que impede a doação.",
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

export function getFailingQuestionsForContext(
  answers: Record<string, Answer>,
  donationIntent: DonationIntent | null,
  isAnonymous: boolean
) {
  const questions = getQuestionsFromContext(donationIntent, isAnonymous);
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
