// Placement test questions - 50 preguntas para filtro real
export const PLACEMENT_QUESTIONS = [
  // A1 - Basic (0-3 correct)
  { q: "I ___ a student.", a: ["am", "is", "are"], c: 0, level: "A1" },
  { q: "She ___ from London.", a: ["come", "comes", "coming"], c: 1, level: "A1" },
  { q: "We ___ students.", a: ["is", "are", "am"], c: 1, level: "A1" },
  { q: "He ___ a teacher.", a: ["is", "are", "am"], c: 0, level: "A1" },
  
  // A2 - Elementary (4-10 correct)
  { q: "She ___ coffee every morning.", a: ["like", "likes", "liking"], c: 1, level: "A2" },
  { q: "They ___ to school yesterday.", a: ["go", "went", "goes"], c: 1, level: "A2" },
  { q: "I have ___ a book.", a: ["read", "reading", "readed"], c: 0, level: "A2" },
  { q: "She ___ English for 5 years.", a: ["study", "studies", "studied"], c: 1, level: "A2" },
  { q: "We ___ TV when he arrived.", a: ["watch", "were watching", "watching"], c: 1, level: "A2" },
  { q: "If I ___ rich, I would travel.", a: ["am", "was", "were"], c: 2, level: "A2" },
  { q: "She suggested ___ to the cinema.", a: ["to go", "going", "go"], c: 1, level: "A2" },
  
  // B1 - Pre-Intermediate (11-20 correct)
  { q: "By the time she arrived, we ___ waiting for 2 hours.", a: ["were", "had been", "have been"], c: 1, level: "B1" },
  { q: "He denied ___ the money.", a: ["steal", "to steal", "stealing"], c: 2, level: "B1" },
  { q: "The report must ___ by Friday.", a: ["submit", "submitting", "be submitted"], c: 2, level: "B1" },
  { q: "Despite ___ tired, she finished.", a: ["be", "being", "to be"], c: 1, level: "B1" },
  { q: "I'd rather you ___ tell anyone.", a: ["don't", "didn't", "wouldn't"], c: 0, level: "B1" },
  { q: "It's time we ___ a decision.", a: ["make", "made", "making"], c: 1, level: "B1" },
  { q: "She ___ English before moving.", a: ["studied", "was studying", "had studied"], c: 2, level: "B1" },
  { q: "Not only ___ he forget, he ignored me too.", a: ["did", "does", "had"], c: 0, level: "B1" },
  { q: "The more you practice, ___ you become.", a: ["good", "the better", "better"], c: 1, level: "B1" },
  
  // B2 - Intermediate (21-35 correct)
  { q: "I wish I ___ harder when young.", a: ["study", "studied", "had studied"], c: 2, level: "B2" },
  { q: "She can swim, and ___ her brother.", a: ["so can", "so does", "neither can"], c: 0, level: "B2" },
  { q: "He accused me of ___ lied.", a: ["have", "having", "to have"], c: 1, level: "B2" },
  { q: "No sooner ___ he arrived than it rained.", a: ["did", "had", "was"], c: 1, level: "B2" },
  { q: "You look as ___ you haven't slept.", a: ["that", "though", "if"], c: 1, level: "B2" },
  { q: "I can't get used to ___ so early.", a: ["wake", "waking", "woke"], c: 1, level: "B2" },
  { q: "Had she known, she ___ differently.", a: ["acts", "acted", "would act"], c: 2, level: "B2" },
  { q: "The book, ___ I read, was fascinating.", a: ["that", "who", "which"], c: 2, level: "B2" },
  { q: "She's been working ___ over a decade.", a: ["since", "for", "during"], c: 1, level: "B2" },
  { q: "___ their age, they behave immaturely.", a: ["Considering", "Despite", "Although"], c: 1, level: "B2" },
  { q: "The CEO demanded that the report ___ submitted.", a: ["be", "should be", "is"], c: 0, level: "B2" },
  { q: "If you ___ left earlier, you would have arrived on time.", a: ["had", "would have", "have"], c: 0, level: "B2" },
  { q: "The phenomenon ___ extensively studied.", a: ["has been", "is being", "was being"], c: 0, level: "B2" },
  { q: "She speaks fluently, as ___ her colleagues.", a: ["do", "does", "are"], c: 0, level: "B2" },
  { q: "___ a student, I had many difficulties.", a: ["As", "Being", "To be"], c: 0, level: "B2" },
  
  // C1 - Advanced (36+ correct)
  { q: "The minister's ___ to reform the system was met with resistance.", a: ["endeavour", "endeavor", "endeavoring"], c: 0, level: "C1" },
  { q: "The ___ of the evidence suggests foul play.", a: ["preponderance", "preponderant", "preponderate"], c: 0, level: "C1" },
  { q: "His ___ remarks about the issue were clearly inflammatory.", a: ["perspicacious", "tendentious", "circumspect"], c: 1, level: "C1" },
  { q: "The author's ___ style makes the complex subject accessible.", a: ["pellucid", "obfuscated", "esoteric"], c: 0, level: "C1" },
  { q: "Despite the CEO's ___, the company continued to decline.", a: ["machinations", "magnanimity", "malfeasance"], c: 1, level: "C1" },
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return questions
    return res.status(200).json({
      questions: PLACEMENT_QUESTIONS,
      total: PLACEMENT_QUESTIONS.length
    });
  }

  if (req.method === 'POST') {
    // Grade the test
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array required' });
    }

    let score = 0;
    answers.forEach((answer, index) => {
      if (PLACEMENT_QUESTIONS[index] && answer === PLACEMENT_QUESTIONS[index].c) {
        score++;
      }
    });

    // Determine level
    let level = 'A1';
    let levelIndex = 0;

    if (score >= 4 && score <= 10) {
      level = 'A2';
      levelIndex = 1;
    } else if (score >= 11 && score <= 20) {
      level = 'B1';
      levelIndex = 2;
    } else if (score >= 21 && score <= 35) {
      level = 'B2';
      levelIndex = 3;
    } else if (score >= 36) {
      level = 'C1';
      levelIndex = 4;
    }

    return res.status(200).json({
      score,
      total: PLACEMENT_QUESTIONS.length,
      level,
      levelIndex,
      percentage: Math.round((score / PLACEMENT_QUESTIONS.length) * 100)
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
