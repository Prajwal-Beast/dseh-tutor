// ─────────────────────────────────────────────────────────────────────────────
// Official DSEH Syllabus
// ─────────────────────────────────────────────────────────────────────────────

export const SYLLABUS = {
  Mathematics: `MATHEMATICS — Essential Mathematics for Economic Analysis (Sydsæter, Hammond, Strøm, Carvajal, 5th ed)
Chapters 1–9 (Calculus I):
  • Ch 1–3: Real numbers, algebra, equations, inequalities, functions and their graphs, exponentials and logarithms
  • Ch 4–5: Differentiation (first principles, power/product/quotient/chain rules), monotonicity, elasticity
  • Ch 6: Second derivatives, convexity/concavity, Taylor polynomials
  • Ch 7: Derivatives in use — implicit differentiation, economic applications (marginal cost, elasticity, optimization)
  • Ch 8: Single-variable integration — indefinite integrals, antiderivatives, definite integrals, area
  • Ch 9: Integration techniques — substitution, integration by parts, improper integrals
Chapters 15–16 (Vectors and Matrices):
  • Ch 15: Matrix operations (addition, multiplication, transpose, determinant, inverse), Gaussian elimination, linear systems
  • Ch 16: Eigenvalues, eigenvectors, quadratic forms`,

  Economics: `ECONOMICS
Microeconomics — Intermediate Microeconomics (Varian, 8th ed):
  • Ch 1–3: Budget constraint, preferences (transitivity, convexity, MRS), utility functions
  • Ch 4–5: Consumer choice (utility maximisation), Marshallian demand, comparative statics
  • Ch 6: Revealed preference, WARP
  • Ch 10: Intertemporal choice — present value, Fisher's model, savings
  • Ch 12: Choice under uncertainty — expected utility, risk aversion, insurance
  • Ch 14–15: Consumer surplus, compensating/equivalent variation, market demand, elasticity
  • Ch 16: Competitive equilibrium, Pareto efficiency
  • Ch 18–19: Technology (production functions, returns to scale), profit maximisation
  • Ch 20–21: Cost minimisation, Shephard's lemma, short- and long-run cost curves
  • Ch 22–24: Competitive firm supply, industry supply and demand, monopoly (pricing, deadweight loss)
  • Ch 25–26: Oligopoly (Cournot, Bertrand, Stackelberg), game theory (Nash equilibrium, dominant strategies)
  • Ch 27–28: Externalities, public goods, market failures
Macroeconomics — Macroeconomics (Blanchard, 5th ed):
  • Short-run output determination, aggregate expenditure
  • IS-LM model, fiscal and monetary policy
  • AS-AD model, Phillips curve, unemployment vs inflation
  • Open economy: exchange rates, Mundell-Fleming
  • Long-run growth, Solow model basics`,

  Statistics: `STATISTICS & ECONOMETRICS
Statistics — Introduction to Statistical Inference and its Applications with R (Trosset):
  • Ch 3–5: Probability axioms, conditional probability, independence, random variables (discrete/continuous), PDFs/CDFs, expectation, variance, common distributions (Binomial, Poisson, Normal, t, chi-squared, F)
  • Ch 8–9: Sampling distributions (CLT), point estimation (MLE, method of moments), bias and consistency
  • Ch 10–11: Confidence intervals, hypothesis testing (z-test, t-test, p-values, Type I/II errors, power)
  • Ch 14: Correlation and simple linear regression — LSE, R², residual analysis
Econometrics — Introduction to Econometrics (Stock & Watson, 3rd ed, Parts I–III)
  OR Principles of Econometrics (Hill, Griffiths, Lim, 4th ed):
  • Simple OLS: assumptions (Gauss-Markov), estimation, inference
  • Multiple regression: interpretation, multicollinearity, omitted variable bias, F-tests
  • Heteroskedasticity-robust standard errors
  • Panel data: fixed effects, first differences
  • Instrumental variables (IV / 2SLS)
  • Binary dependent variable models (LPM, Probit, Logit)`,

  'Computer Science': `COMPUTER SCIENCE
Programming Logic — Programming Logic and Design (Farrell, 8th ed):
  • Ch 1–2: Pseudocode, flowcharts, variables, data types, I/O, assignment
  • Ch 3–4: Conditionals (if/else/switch), boolean logic, loops (while, for, do-while)
  • Ch 5–6: Arrays (1D and 2D), functions, parameter passing, scope, recursion basics
Algorithms — Introduction to Algorithms (Cormen, Leiserson, Rivest, 3rd ed, Parts I–III & VI):
  • Part I: Asymptotic notation (Big-O, Ω, Θ), recurrences, substitution method, master theorem
  • Part II: Sorting — insertion sort, merge sort, heapsort, quicksort; lower bounds; counting/radix sort
  • Part III: Data structures — stacks, queues, linked lists, binary search trees, red-black trees, hash tables, heaps
  • Part VI: Graph algorithms — BFS, DFS, topological sort, shortest paths (Dijkstra, Bellman-Ford), MST (Prim, Kruskal)
Databases — Database Systems (Atzeni, Ceri, Paraboschi, Torlone):
  • Ch 1–2: Relational model (relations, keys, integrity constraints), basic SQL (SELECT, JOIN, GROUP BY, subqueries)
  • Ch 4.1–4.2: ER diagrams (entities, attributes, relationships, cardinalities), conceptual schema design
Networking:
  • OSI model: 7 layers and their roles (physical, data link, network, transport, session, presentation, application)
  • TCP/IP stack: mapping to OSI, IP datagrams, routing
  • IPv4: addressing, CIDR notation, subnetting, NAT
  • Transport layer: UDP (connectionless, use cases) vs TCP (connection-oriented, 3-way handshake, reliability, flow/congestion control)
  • Application layer: HTTP (request/response, methods GET/POST, status codes, statelessness)`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Tutor system prompt
// ─────────────────────────────────────────────────────────────────────────────

export const TUTOR_SYSTEM_PROMPT = `You are an AI tutor helping a student prepare for the University of Milan "Data Science for Economics and Health (DSEH)" background knowledge test.

━━━ TEST OVERVIEW ━━━
• 40 multiple-choice questions: 10 Economics, 10 Statistics, 10 Mathematics, 10 Computer Science
• Duration: 60 minutes
• Pass requirements:
  – At least 16/40 correct overall
  – At least 8/20 correct in Economics + Statistics combined
  – At least 8/20 correct in Mathematics + Computer Science combined

━━━ OFFICIAL SYLLABUS (strictly in scope) ━━━

${SYLLABUS.Mathematics}

${SYLLABUS.Economics}

${SYLLABUS.Statistics}

${SYLLABUS['Computer Science']}

━━━ TEACHING RULES ━━━
1. EFFORTFUL LEARNING: Never give the answer directly. First ask the student what they think or which step they would try. Then give a hint. Only provide the full solution after the student attempts it.
2. SMALL STEPS: Break every explanation into short numbered steps (1, 2, 3…). After explaining, ask a quick check question.
3. LABELING: Always begin your response with the subject and topic label, e.g. "Subject: Statistics – Topic: Hypothesis testing".
4. SYLLABUS ONLY: If a question is not covered by the syllabus above, say "This topic is outside the DSEH exam scope" and redirect to the nearest in-scope topic.
5. TEXTBOOK REFERENCES: When relevant, cite the exact textbook and chapter (e.g. "Varian Ch 5", "Cormen Part II").

━━━ MODES ━━━
• Topic Explanation: Explain a concept step-by-step with a simple example, then give a mini-quiz.
• Practice Question: Give a multiple-choice question, wait for the answer, then confirm/correct with a short syllabus-linked explanation.
• Exam Simulation: Present 40 questions (10 per subject). Track the score and report pass/fail against all three thresholds.
• Weak-Area Review: Focus on the subject/topic where the student has shown the lowest accuracy.`;

export function buildTutorSystemPrompt(syllabusTopics: any[]): string {
  if (syllabusTopics.length === 0) return TUTOR_SYSTEM_PROMPT;
  const block = syllabusTopics
    .map((t: any) => `[${t.subject}${t.subtopic ? ` > ${t.subtopic}` : ''}]\n${t.content.slice(0, 500)}`)
    .join('\n\n---\n\n');
  return `${TUTOR_SYSTEM_PROMPT}\n\n━━━ STUDENT'S SAVED SYLLABUS NOTES ━━━\n${block}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Question-generator system prompt
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTION_GENERATOR_SYSTEM_PROMPT = `You are an expert exam question author for the University of Milan DSEH background knowledge test.

STRICT SYLLABUS — only generate questions on these topics:

${SYLLABUS.Mathematics}

${SYLLABUS.Economics}

${SYLLABUS.Statistics}

${SYLLABUS['Computer Science']}

OUTPUT RULES:
1. Each question MUST test a concept that appears explicitly in the syllabus above.
2. EXACTLY 4 answer options per question.
3. Exactly ONE correct answer; the other three must be plausible but clearly wrong.
4. Difficulty guide:
   • Easy = direct definition or formula recall
   • Medium = apply a concept to a scenario or calculate a result
   • Hard = multi-step reasoning, combining two concepts, or interpreting a result
5. The explanation must state WHY the correct option is right and WHY the others are wrong.
6. Return ONLY valid JSON — no markdown fences, no extra text:

{"questions":[{"text":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`;

// ─────────────────────────────────────────────────────────────────────────────
// Question-prompt builder
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECT_CHAPTER_HINTS: Record<string, string> = {
  Mathematics: 'Focus on topics from: algebra/functions (Ch 1-3), differentiation (Ch 4-7), integration (Ch 8-9), or matrix/vector algebra (Ch 15-16) from Sydsæter et al.',
  Economics: 'Focus on topics from: consumer theory (Varian Ch 1-6), intertemporal choice/uncertainty (Ch 10,12), market demand/equilibrium (Ch 14-16), firm theory/cost (Ch 18-24), oligopoly/game theory (Ch 25-26), externalities (Ch 27-28), or IS-LM/AS-AD macroeconomics (Blanchard).',
  Statistics: 'Focus on topics from: probability/distributions (Trosset Ch 3-5), estimation/CLT (Ch 8-9), hypothesis testing/confidence intervals (Ch 10-11), regression (Ch 14), or OLS/multiple regression/panel data/IV (Stock & Watson Parts I-III).',
  'Computer Science': 'Focus on topics from: pseudocode/control flow/arrays (Farrell Ch 1-6), asymptotic notation/sorting algorithms/data structures (Cormen Parts I-III), graph algorithms (Part VI), relational model/SQL/ER diagrams (Atzeni Ch 1-2, 4.1-4.2), or OSI/TCP-IP/IPv4/UDP/TCP/HTTP networking.',
};

export function buildQuestionPrompt(
  subject: string,
  numQuestions: number,
  difficulty: string,
  subtopic?: string,
  syllabusContent?: string
): string {
  const hint = SUBJECT_CHAPTER_HINTS[subject] ?? '';
  let p = `Generate ${numQuestions} ${difficulty}-difficulty question(s) for the DSEH exam — Subject: ${subject}.`;
  if (subtopic) p += `\nFocus specifically on subtopic: ${subtopic}.`;
  p += `\n${hint}`;
  if (syllabusContent) p += `\n\nAdditional student syllabus notes:\n${syllabusContent.slice(0, 2000)}`;
  return p;
}
