/* ============================================================
   AI-2 trainer — course metadata and topic registry.

   Each file in js/topics/ pushes one topic object into
   window.TOPICS. Topic shape:

   {
     id, num, short, kicker, title, summary, accent, source,
     theory: [{ title, html }],
     tasks:  [{ title, question, hint, answer }],
     quiz:   [{ q, options: [4], correct: index, explain }]
   }
   ============================================================ */

window.COURSE = {
  name: "AI-2",
  tagline: "Тренажёр по темам курса",
  description:
    "Теория, разобранные задачи и проверочные тесты по пяти темам: MDP, вероятностный вывод, классический ML и Computer Vision.",
};

window.TOPICS = [];
