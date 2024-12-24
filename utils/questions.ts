import type { DonationIntent } from "~/server/models/formResponse";

interface Question {
  question: String;
  slug: String;
  description: String;
  anonymousOnly?: Boolean;
  donationIntents?: DonationIntent[];
  failingResponses: String[]; // Para comparar e ver se alguma pergunta falha
  //Se alguma falhar, salva o forms como falha, se não, não
  failingReason: String;
  image: string;
}

const questions: Question[] = [
  {
    question: "Você tem 50kg ou mais?",
    slug: "weight",
    description:
      "O peso mínimo para doar sangue é 50kg para garantir sua segurança durante o procedimento.",
    failingResponses: ["negative", "unknown"],
    failingReason: "Peso insuficiente para doar sangue.",
    image: "images/weight.png",
  },
  {
    question: "Você tem 16 anos ou mais?",
    slug: "age",
    description:
      "A idade mínima para doação de sangue é 16 anos, com consentimento dos responsáveis.",
    anonymousOnly: true,
    failingResponses: ["negative", "unknown"],
    failingReason: "Idade insuficiente para doação de sangue.",
    image: "images/age.png",
  },
  {
    question: "Você se alimentou bem hoje?",
    slug: "ateToday",
    description:
      "Estar bem alimentado é essencial para garantir sua segurança durante a doação.",
    donationIntents: ["today"],
    failingResponses: ["negative", "unknown"],
    failingReason: "É necessário estar bem alimentado para doar sangue.",
    image: "images/ateToday.png",
  },
  {
    question: "Você teve uma boa noite de sono?",
    slug: "sleptOk",
    description:
      "Dormir bem ajuda a manter seus níveis de energia e segurança para a doação.",
    donationIntents: ["today"],
    failingResponses: ["negative", "unknown"],
    failingReason: "Uma boa noite de sono é essencial para doar sangue.",
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
    question: "Você participou de atividades sexuais de risco nos últimos 3 meses?",
    slug: "sexRisk",
    description:
      "Atividades sexuais de risco podem representar um perigo à segurança do receptor do sangue.",
    donationIntents: ["today", "this-week"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Atividades sexuais de risco impedem a doação de sangue.",
    image: "images/sexRisk.png",
  },
  {
    question: "Você fez tatuagem ou piercing nos últimos 6 meses?",
    slug: "tattooOrPiercing",
    description:
      "Tatuagens ou piercings recentes podem apresentar riscos à saúde durante o período de cicatrização.",
    donationIntents: ["today", "this-week"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Tatuagens ou piercings recentes impedem a doação de sangue.",
    image: "images/tattooOrPiercing.png",
  },
  {
    question: "Morou ou viajou para fora do Brasil (em áreas de risco) ou para Amazônia Legal nos últimos 12 meses?",
    slug: "traveledAbroad",
    description:
      "Viagens recentes para fora do Brasil ou para a Amazônia Legal podem apresentar riscos de exposição a doenças endêmicas, como malária, febre amarela e outras, que podem comprometer a segurança da doação.",
    donationIntents: ["today", "this-week"],
    failingResponses: ["positive", "unknown"],
    failingReason:
      "Viagens recentes para áreas de risco impedem a doação de sangue temporariamente para garantir a segurança do receptor.",
    image: "images/traveledAbroad.png",
  },  
  {
    question: "Você possui piercing na boca ou genital?",
    slug: "mouthPiercing",
    description:
      "Piercings nessas áreas podem apresentar riscos de infecção para o doador.",
    donationIntents: ["today", "this-week"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Piercings na boca ou genital impedem a doação de sangue.",
    image: "images/mouthPiercing.svg",
  },
  {
    question: "Você fez algum tratamento médico nos últimos 6 meses?",
    slug: "medicalTreatmentOrSurgery",
    description:
      "Tratamentos médicos recentes podem afetar sua saúde e a qualidade do sangue doado.",
    donationIntents: ["today", "this-week"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Tratamentos médicos recentes impedem a doação de sangue.",
    image: "images/medicalTreatmentOrSurgery.png",
  },
  {
    question: "Você tem alguma viagem agendada para áreas de risco (fora do Brasil ou Amazônia Legal)?",
    slug: "futureAvailability",
    description:
      "Viagens para locais com maior risco à contração de doenças podem impedir a sua doação.",
    donationIntents: ["future"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Viagens para locais de risco impedem a doação, confira a possibilidade de doar antes.",
    image: "images/traveledAbroad.png",
  },
  {
    question: "Você tem algum tratamento médico planejado?",
    slug: "plannedTreatments",
    description:
      "Tratamentos médicos planejados podem interferir na sua capacidade de doar sangue.",
    donationIntents: ["future"],
    failingResponses: ["positive", "unknown"],
    failingReason: "Tratamentos médicos planejados podem interferir na doação.",
    image: "images/plannedTreatments.png",
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

export default questions;

//funcao getQuestionsFromContext que vai a intent e o modo
//vai so filtrar la nos getters
