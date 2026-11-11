/* Тема 2 — Практика 6: Bayes, Bayesian networks, HMM */
window.TOPICS.push({
  id: "bayes",
  num: "06",
  short: "Bayes & HMM",
  kicker: "Практика 6 · Probabilistic Reasoning",
  title: "Байес, байесовские сети и скрытые марковские модели",
  summary:
    "От таблицы на 100 случаев до фильтрации HMM: как обновлять убеждение о состоянии робота, если сенсор ошибается.",
  accent: "#a78bfa",
  source: "Practice6_Methodological_Guidelines_Kazakh.docx · все числа сверены",
  theory: [
    {
      title: "Формула Байеса",
      html: `
        <p>Байесовское обновление переворачивает условную вероятность:</p>
        <div class="formula">P(H | E) = P(E | H) · P(H) / P(E)</div>
        <p>где <code>P(H)</code> — априорная вероятность (prior), <code>P(E|H)</code> — правдоподобие (likelihood), <code>P(H|E)</code> — апостериорная вероятность (posterior).</p>
        <p>Знаменатель раскладывается по формуле полной вероятности:</p>
        <div class="formula">P(E) = P(E|H)·P(H) + P(E|¬H)·P(¬H)</div>
        <div class="callout"><b>Нормализация:</b> можно считать только два ненормированных score и разделить на их сумму. Это тот же Байес, но без отдельного вычисления P(E).</div>
      `,
    },
    {
      title: "Таблица на 100 случаев",
      html: `
        <p>Пусть в 30 из 100 случаев на пути есть препятствие, в 70 — путь свободен. Сенсор говорит BLOCKED в 80% случаев препятствия и в 20% случаев свободного пути.</p>
        <div class="table-wrap"><table>
          <tr><th>Реальное состояние</th><th class="num">BLOCKED</th><th class="num">CLEAR</th><th class="num">Всего</th></tr>
          <tr><td>Препятствие (O)</td><td class="num">24</td><td class="num">6</td><td class="num">30</td></tr>
          <tr><td>Свободно (C)</td><td class="num">14</td><td class="num">56</td><td class="num">70</td></tr>
          <tr><td><b>Всего</b></td><td class="num">38</td><td class="num">62</td><td class="num">100</td></tr>
        </table></div>
        <p>Среди 38 сообщений BLOCKED только 24 соответствуют реальному препятствию:</p>
        <div class="formula">P(O | BLOCKED) = 24 / 38 = 0.6316 ≈ 63.16%</div>
        <div class="callout warn"><b>Base rate fallacy:</b> <code>P(BLOCKED|O)=0.8</code> и <code>P(O|BLOCKED)=0.6316</code> — разные величины. Вторая учитывает, что препятствия редки (30%).</div>
      `,
    },
    {
      title: "Байесовская сеть",
      html: `
        <p><b>Байесовская сеть</b> — направленный ациклический граф (DAG), где узлы — переменные, а стрелки — вероятностные зависимости. Совместное распределение факторизуется по родителям:</p>
        <div class="formula">P(X₁, …, Xₙ) = Πᵢ P(Xᵢ | Parents(Xᵢ))</div>
        <p>Для цепочки <code>Weather → Environment → Sensor</code>:</p>
        <div class="formula">P(W, E, S) = P(W) · P(E|W) · P(S|E)</div>
        <p>Каждый узел хранит <b>CPT</b> (conditional probability table). Сумма вероятностей в каждой строке CPT равна 1.</p>
        <div class="callout"><b>Условная независимость:</b> если известен <code>Environment</code>, то <code>Sensor</code> не зависит от <code>Weather</code>. Поэтому прямой стрелки Weather → Sensor нет — она не добавила бы информации.</div>
      `,
    },
    {
      title: "HMM: скрытые состояния и наблюдения",
      html: `
        <p><b>Скрытая марковская модель</b> (Hidden Markov Model) описывает последовательность скрытых состояний <code>sₜ</code> и наблюдений <code>oₜ</code>. Компоненты:</p>
        <ul>
          <li>начальное распределение <code>P(s₀)</code>;</li>
          <li>матрица переходов <code>P(sₜ | sₜ₋₁)</code>;</li>
          <li>матрица эмиссий <code>P(oₜ | sₜ)</code>.</li>
        </ul>
        <p>Два допущения: состояние зависит только от предыдущего состояния (Markov), а наблюдение — только от текущего состояния.</p>
        <div class="formula">P(s₀, s₁, …, o₁, o₂, …) = P(s₀) Πₜ P(sₜ|sₜ₋₁) · P(oₜ|sₜ)</div>
        <p>В отличие от одного байесовского обновления, HMM использует переходы, потому что состояние меняется во времени.</p>
      `,
    },
    {
      title: "Фильтрация: predict → update",
      html: `
        <p>На каждом шаге t делаем два действия.</p>
        <p><b>1. Predict</b> — распространяем убеждение через переходы (для t ≥ 2):</p>
        <div class="formula">predicted_O = 0.70 · previous_O + 0.20 · (1 − previous_O)
predicted_C = 1 − predicted_O</div>
        <p><b>2. Update</b> — учитываем наблюдение и нормируем:</p>
        <div class="formula">score_O = P(reading | O) · predicted_O
score_C = P(reading | C) · predicted_C
posterior_O = score_O / (score_O + score_C)</div>
        <div class="callout warn"><b>Особый случай t₁:</b> перехода ещё не было, поэтому <code>predicted_O = P(O) = 0.30</code>. Применять матрицу переходов к начальному распределению на t₁ — ошибка.</div>
      `,
    },
    {
      title: "Эмиссии и переходы: как читать числа",
      html: `
        <div class="table-wrap"><table>
          <tr><th>Переход</th><th class="num">→ O</th><th class="num">→ C</th></tr>
          <tr><td>Из O</td><td class="num">0.70</td><td class="num">0.30</td></tr>
          <tr><td>Из C</td><td class="num">0.20</td><td class="num">0.80</td></tr>
        </table></div>
        <div class="table-wrap"><table>
          <tr><th>Скрытое состояние</th><th class="num">P(BLOCKED | ·)</th><th class="num">P(CLEAR | ·)</th></tr>
          <tr><td>O (препятствие)</td><td class="num">0.80</td><td class="num">0.20</td></tr>
          <tr><td>C (свободно)</td><td class="num">0.20</td><td class="num">0.80</td></tr>
        </table></div>
        <p>Матрица переходов несимметрична: препятствие «залипает» с вероятностью 0.70, а свободный путь — с 0.80. Это важно для прогноза: после CLEAR модель быстрее возвращается к вере в свободный путь.</p>
      `,
    },
  ],
  tasks: [
    {
      title: "A1. Таблица 100 случаев",
      question: `
        <p>В 30 из 100 случаев на пути препятствие, в 70 — путь свободен. Сенсор BLOCKED: <code>P(BLOCKED|O)=0.80</code>, <code>P(BLOCKED|C)=0.20</code>. Заполните таблицу и найдите <code>P(O|BLOCKED)</code> и <code>P(O|CLEAR)</code>.</p>
      `,
      hint: `
        <p>Строй таблицу «реальное состояние × показание сенсора» в абсолютных числах, а не в вероятностях.</p>
        <ul>
          <li>Для каждой строки умножь её итог на вероятности сенсора: 30 — на 0.8 и 0.2, 70 — на 0.2 и 0.8.</li>
          <li>Сложи столбцы и подели нужную клетку на итог столбца — это и есть posterior.</li>
        </ul>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>Реальное состояние</th><th class="num">BLOCKED</th><th class="num">CLEAR</th><th class="num">Всего</th></tr>
          <tr><td>Препятствие</td><td class="num">30·0.8 = 24</td><td class="num">30·0.2 = 6</td><td class="num">30</td></tr>
          <tr><td>Свободно</td><td class="num">70·0.2 = 14</td><td class="num">70·0.8 = 56</td><td class="num">70</td></tr>
          <tr><td><b>Всего</b></td><td class="num">38</td><td class="num">62</td><td class="num">100</td></tr>
        </table></div>
        <div class="formula">P(O | BLOCKED) = 24 / 38 = 0.6316 ≈ 63.16%
P(O | CLEAR)   =  6 / 62 = 0.0968 ≈  9.68%</div>
        <p>Сообщение BLOCKED повышает вероятность препятствия с 30% до 63.16%, а CLEAR снижает её до 9.68%.</p>
      `,
    },
    {
      title: "A2. Те же числа через формулы",
      question: `
        <p>Проверьте результат A1 формулой полной вероятности и теоремой Байеса. Объясните, почему <code>P(BLOCKED|O)</code> и <code>P(O|BLOCKED)</code> не равны.</p>
      `,
      hint: `
        <p>Знаменатель Байеса — полная вероятность показания:</p>
        <div class="formula">P(BLOCKED) = P(BLOCKED|O)·P(O) + P(BLOCKED|C)·P(C)</div>
        <p>Затем раздели <code>P(BLOCKED|O)·P(O)</code> на этот знаменатель.</p>
        <p>Для объяснения подумай, какая из величин учитывает базовую частоту препятствий, а какая — только работу сенсора. Посчитай, сколько сигналов BLOCKED ложные.</p>
      `,
      answer: `
        <div class="formula">P(BLOCKED) = 0.80·0.30 + 0.20·0.70 = 0.24 + 0.14 = 0.38
P(O|BLOCKED) = 0.24 / 0.38 = 0.6316</div>
        <div class="formula">P(CLEAR) = 0.20·0.30 + 0.80·0.70 = 0.06 + 0.56 = 0.62
P(O|CLEAR) = 0.06 / 0.62 = 0.0968</div>
        <p><b>Почему не равны.</b> <code>P(BLOCKED|O)</code> — доля препятствий, которые сенсор распознал. <code>P(O|BLOCKED)</code> — доля сообщений BLOCKED, за которыми действительно есть препятствие. Во втором случае учитывается базовая частота: препятствия редки (30%), а ложные срабатывания на свободном пути (20% от 70 случаев) дают 14 лишних сигналов.</p>
        <div class="callout"><b>Проверка:</b> 24 + 14 = 38 сигналов BLOCKED, из них истинных 24 → 24/38 = 63.16%.</div>
      `,
    },
    {
      title: "B. Байесовская сеть из трёх узлов",
      question: `
        <p>Постройте сеть <code>Weather → Robot Environment → Sensor Reading</code>. Укажите значения узлов, родителей и CPT. Проверьте, что <code>P(Obstacle) = 0.30</code>, если <code>P(dry)=0.6</code>, <code>P(rain)=0.4</code>, <code>P(Obstacle|dry)=0.20</code>, <code>P(Obstacle|rain)=0.45</code>.</p>
      `,
      hint: `
        <p>Нарисуй три узла цепочкой и для каждого выпиши CPT: у Weather — безусловные вероятности, у Environment — две строки по погоде, у Sensor — две строки по состоянию среды.</p>
        <p>Проверку <code>P(Obstacle)=0.30</code> делай по формуле полной вероятности, взвесив 0.20 и 0.45 на 0.6 и 0.4.</p>
        <p>Отдельно проверь суммы в каждой строке CPT: они должны равняться 1.</p>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>Узел</th><th>Значения</th><th>Родитель</th><th>Смысл стрелки</th></tr>
          <tr><td>Weather</td><td>dry / rain</td><td>—</td><td>внешняя причина</td></tr>
          <tr><td>Robot Environment</td><td>obstacle / clear</td><td>Weather</td><td>погода влияет на вероятность препятствия</td></tr>
          <tr><td>Sensor Reading</td><td>BLOCKED / CLEAR</td><td>Robot Environment</td><td>сенсор зависит от реального состояния пути</td></tr>
        </table></div>
        <div class="table-wrap"><table>
          <tr><th>Weather</th><th class="num">P(Obstacle)</th><th class="num">P(Clear)</th></tr>
          <tr><td>dry</td><td class="num">0.20</td><td class="num">0.80</td></tr>
          <tr><td>rain</td><td class="num">0.45</td><td class="num">0.55</td></tr>
        </table></div>
        <div class="formula">P(Obstacle) = 0.60·0.20 + 0.40·0.45 = 0.12 + 0.18 = 0.30</div>
        <p><b>Почему нет стрелки Weather → Sensor.</b> При известном состоянии среды сенсор не зависит от погоды: <code>P(S | E, W) = P(S | E)</code>. Прямая стрелка дублировала бы зависимость и усложняла CPT без выигрыша.</p>
        <div class="callout"><b>CPT сенсора:</b> при obstacle — 0.80/0.20 в пользу BLOCKED; при clear — 0.20/0.80. Суммы в строках равны 1.</div>
      `,
    },
    {
      title: "C. HMM: t1–t4 полностью",
      question: `
        <p>Начальное <code>P(O)=0.30</code>. Переходы: <code>P(Oₜ|Oₜ₋₁)=0.70</code>, <code>P(Oₜ|Cₜ₋₁)=0.20</code>. Эмиссии: <code>P(BLOCKED|O)=0.80</code>, <code>P(BLOCKED|C)=0.20</code>. Наблюдения: t1 BLOCKED → t2 CLEAR → t3 BLOCKED → t4 BLOCKED. Заполните таблицу.</p>
      `,
      hint: `
        <p>На каждом шаге два действия: <b>predict</b>, затем <b>update</b>.</p>
        <ul>
          <li>На t1 перехода нет — <code>predicted = 0.30</code>.</li>
          <li>Для t ≥ 2: <code>predicted = 0.7·posterior_prev + 0.2·(1 − posterior_prev)</code>.</li>
          <li>Update: умножь predicted на эмиссию для O и для C, сложи и нормируй.</li>
          <li>В следующий шаг переноси <b>posterior</b>, а не predicted.</li>
        </ul>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>t</th><th>Наблюдение</th><th class="num">predicted P(O)</th><th class="num">score O</th><th class="num">score C</th><th class="num">сумма</th><th class="num">posterior P(O)</th></tr>
          <tr><td>1</td><td>BLOCKED</td><td class="num">0.3000</td><td class="num">0.2400</td><td class="num">0.1400</td><td class="num">0.3800</td><td class="num">0.6316</td></tr>
          <tr><td>2</td><td>CLEAR</td><td class="num">0.5158</td><td class="num">0.1032</td><td class="num">0.3874</td><td class="num">0.4905</td><td class="num">0.2103</td></tr>
          <tr><td>3</td><td>BLOCKED</td><td class="num">0.3052</td><td class="num">0.2441</td><td class="num">0.1390</td><td class="num">0.3831</td><td class="num">0.6372</td></tr>
          <tr><td>4</td><td>BLOCKED</td><td class="num">0.5186</td><td class="num">0.4149</td><td class="num">0.0963</td><td class="num">0.5112</td><td class="num">0.8117</td></tr>
        </table></div>
        <p><b>t1.</b> Переход не применяем: <code>predicted=0.30</code>. Веса: <code>0.8·0.3=0.24</code> и <code>0.2·0.7=0.14</code>. Posterior <code>0.24/0.38=0.6316</code>.</p>
        <p><b>t2.</b> <code>predicted = 0.7·0.6316 + 0.2·0.3684 = 0.5158</code>. CLEAR: <code>0.2·0.5158=0.1032</code> и <code>0.8·0.4842=0.3874</code>. Posterior <code>0.1032/0.4905=0.2103</code>.</p>
        <p><b>t3.</b> <code>predicted = 0.7·0.2103 + 0.2·0.7897 = 0.3052</code>. BLOCKED: <code>0.8·0.3052=0.2441</code> и <code>0.2·0.6948=0.1390</code>. Posterior <code>0.6372</code>.</p>
        <p><b>t4.</b> <code>predicted = 0.7·0.6372 + 0.2·0.3628 = 0.5186</code>. BLOCKED: <code>0.8·0.5186=0.4149</code> и <code>0.2·0.4814=0.0963</code>. Posterior <code>0.8117</code>.</p>
        <div class="callout ok"><b>Ответ:</b> после двух BLOCKED подряд уверенность в препятствии выросла до <b>81.17%</b>, хотя один CLEAR на t2 временно снизил её до 21.03%.</div>
      `,
    },
    {
      title: "D1. Сдвиг априорной вероятности",
      question: `
        <p>Вызовите <code>bayes(prior, 0.80, 0.20)</code> для prior = 0.10, 0.30, 0.50, 0.70. Как меняется posterior и почему?</p>
      `,
      hint: `
        <p>Используй ту же формулу, но оставь prior переменной:</p>
        <div class="formula">posterior = 0.8p / (0.8p + 0.2(1 − p))</div>
        <p>Подставь четыре значения p. Обрати внимание на p = 0.5: posterior должен совпасть с чувствительностью сенсора 0.8.</p>
        <p>Для объяснения проверь знак производной или просто сравни соседние строки таблицы.</p>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>prior P(O)</th><th class="num">posterior P(O|BLOCKED)</th></tr>
          <tr><td>0.10</td><td class="num">0.3077</td></tr>
          <tr><td>0.30</td><td class="num">0.6316</td></tr>
          <tr><td>0.50</td><td class="num">0.8000</td></tr>
          <tr><td>0.70</td><td class="num">0.9032</td></tr>
        </table></div>
        <div class="formula">posterior = 0.8·p / (0.8·p + 0.2·(1−p))</div>
        <p>Функция монотонно растёт по prior: чем выше начальная вера в препятствие, тем сильнее то же самое наблюдение её подтверждает. При p = 0.5 posterior = 0.8 — ровно чувствительность сенсора.</p>
        <div class="callout"><b>Проверка:</b> при p = 0.1: 0.08/(0.08+0.18)=0.3077; при p = 0.7: 0.56/(0.56+0.06)=0.9032.</div>
      `,
    },
    {
      title: "D2. Рост ложных срабатываний",
      question: `
        <p>Поменяйте <code>P(BLOCKED|C)</code> с 0.20 на 0.40 (и <code>P(CLEAR|C)</code> с 0.80 на 0.60), prior = 0.30. Сравните с базовым результатом 0.6316. Как меняется доверие к сигналу?</p>
      `,
      hint: `
        <p>Меняется только вероятность ложного срабатывания, prior остаётся 0.30.</p>
        <div class="formula">числитель = 0.8 · 0.3
знаменатель = 0.8 · 0.3 + 0.4 · 0.7</div>
        <p>Сравни новый знаменатель с базовым 0.38: во сколько раз выросло число ложных сигналов? Это и объясняет падение доверия.</p>
      `,
      answer: `
        <div class="formula">P(BLOCKED) = 0.8·0.3 + 0.4·0.7 = 0.24 + 0.28 = 0.52
P(O|BLOCKED) = 0.24 / 0.52 = 0.4615</div>
        <div class="callout bad"><b>Ответ:</b> posterior падает с <b>63.16%</b> до <b>46.15%</b>. Сигнал BLOCKED перестаёт быть надёжным: ложные срабатывания почти сравниваются с истинными.</div>
        <p>Интуиция: при 30% препятствий ожидается 24 истинных сигнала и 28 ложных. Поэтому сообщение BLOCKED уже не даёт перевеса — вероятность препятствия даже ниже 50%.</p>
      `,
    },
    {
      title: "D3. Python-код фильтрации",
      question: `
        <p>Напишите функцию <code>bayes()</code> и цикл фильтрации HMM для наблюдений B → C → B → B. Сравните вывод с таблицей из задачи C.</p>
      `,
      hint: `
        <p>Раздели код на две части: чистую функцию одного обновления и цикл по времени.</p>
        <ul>
          <li><code>bayes(prior, p_if_o, p_if_c)</code> возвращает <code>score_o / (score_o + score_c)</code>.</li>
          <li>В цикле для <code>t == 1</code> не применяй переход, иначе поедет весь столбец.</li>
          <li>Печатай <code>predicted</code>, <code>posterior</code> и <code>1 − posterior</code> с 4 знаками.</li>
        </ul>
      `,
      answer: `
<pre class="code"><span class="c"># Только стандартная библиотека Python.</span>
<span class="k">def</span> bayes(prior_obstacle, p_reading_if_obstacle, p_reading_if_clear):
    <span class="s">"""Posterior probability of an obstacle after one reading."""</span>
    score_o = prior_obstacle * p_reading_if_obstacle
    score_c = (1.0 - prior_obstacle) * p_reading_if_clear
    <span class="k">return</span> score_o / (score_o + score_c)

observations = [<span class="s">"BLOCKED"</span>, <span class="s">"CLEAR"</span>, <span class="s">"BLOCKED"</span>, <span class="s">"BLOCKED"</span>]
emission = {
    <span class="s">"BLOCKED"</span>: (0.80, 0.20),   <span class="c"># P(reading | O), P(reading | C)</span>
    <span class="s">"CLEAR"</span>:   (0.20, 0.80),
}

p_obstacle = 0.30          <span class="c"># начальное убеждение</span>
<span class="k">for</span> t, reading <span class="k">in</span> enumerate(observations, start=1):
    <span class="k">if</span> t == 1:
        predicted_o = p_obstacle          <span class="c"># без перехода на t1</span>
    <span class="k">else</span>:
        predicted_o = 0.70 * p_obstacle + 0.20 * (1.0 - p_obstacle)

    likelihood_o, likelihood_c = emission[reading]
    p_obstacle = bayes(predicted_o, likelihood_o, likelihood_c)
    print(t, reading, f<span class="s">"{predicted_o:.4f}"</span>,
          f<span class="s">"{p_obstacle:.4f}"</span>, f<span class="s">"{1 - p_obstacle:.4f}"</span>)</pre>
        <p>Вывод:</p>
<pre class="code">1 BLOCKED 0.3000 0.6316 0.3684
2 CLEAR   0.5158 0.2103 0.7897
3 BLOCKED 0.3052 0.6372 0.3628
4 BLOCKED 0.5186 0.8117 0.1883</pre>
        <div class="callout warn"><b>Типичная ошибка:</b> применить переход на t1. Тогда predicted будет 0.41 вместо 0.30, и весь столбец posterior сместится.</div>
      `,
    },
    {
      title: "E. Вопросы для обсуждения",
      question: `
        <p>1) Почему BLOCKED не доказывает препятствие? 2) Что означает <code>P(O|CLEAR)</code>? 3) Зачем HMM переходы, если одиночному Байесу они не нужны? 4) Что будет при росте ложных срабатываний? 5) Чем скрытое состояние отличается от наблюдения?</p>
      `,
      hint: `
        <p>Отвечай по одному пункту, каждый раз называя механизм, а не только число.</p>
        <ul>
          <li>Для 1–2 используй false positive и false negative: какие клетки таблицы они занимают?</li>
          <li>Для 3 вспомни, что состояние меняется между шагами и его нужно сначала предсказать.</li>
          <li>Для 4 сошлись на задачу D2: больше ложных — ниже posterior.</li>
          <li>Для 5 раздели «что есть на самом деле» и «что сообщает сенсор».</li>
        </ul>
      `,
      answer: `
        <ol class="steps">
          <li><b>BLOCKED не доказывает препятствие,</b> потому что сенсор ошибается: 20% свободных путей он называет закрытыми. Posterior 63.16%, а не 100%.</li>
          <li><b><code>P(O|CLEAR) = 9.68%</code></b> — если сенсор сказал «путь свободен», остаётся почти 10% шанс, что препятствие всё-таки есть (пропуск, false negative).</li>
          <li><b>Переходы нужны HMM,</b> потому что состояние меняется между шагами: убеждение на t−1 нужно перенести на t до учёта нового наблюдения. Одиночный Байес рассматривает один момент времени, без динамики.</li>
          <li><b>При росте ложных срабатываний</b> posterior падает (0.6316 → 0.4615 при 0.40), и одному сигналу BLOCKED нельзя доверять.</li>
          <li><b>Скрытое состояние</b> — реальное, но ненаблюдаемое положение дел (obstacle/clear). <b>Наблюдение</b> — то, что сообщает сенсор (BLOCKED/CLEAR); оно связано с состоянием вероятностно и может ошибаться.</li>
        </ol>
      `,
    },
  ],
  quiz: [
    {
      q: "Таблица 100 случаев: 24 истинных BLOCKED и 14 ложных. Чему равно P(O | BLOCKED)?",
      options: ["63.16%", "80.0%", "30.0%", "9.68%"],
      correct: 0,
      explain: "24 / (24 + 14) = 24 / 38 = 0.6316. 80% — это P(BLOCKED|O), другая условная вероятность.",
    },
    {
      q: "Чему равна полная вероятность P(BLOCKED) при P(O)=0.3, P(BLOCKED|O)=0.8, P(BLOCKED|C)=0.2?",
      options: ["0.38", "0.24", "0.62", "0.80"],
      correct: 0,
      explain: "0.8·0.3 + 0.2·0.7 = 0.24 + 0.14 = 0.38.",
    },
    {
      q: "Почему P(BLOCKED|O) = 0.80, а P(O|BLOCKED) = 0.6316?",
      options: [
        "Это разные направления условия; вторая учитывает базовую частоту препятствий 30%",
        "Одно из чисел посчитано с ошибкой",
        "Потому что вероятности всегда меньше 1",
        "Потому что сенсор ошибается в 20% случаев",
      ],
      correct: 0,
      explain:
        "P(BLOCKED|O) — чувствительность сенсора. P(O|BLOCKED) — апостериорная вероятность и зависит от prior. При prior 0.3 они не совпадают.",
    },
    {
      q: "Если P(BLOCKED|C) вырастет с 0.20 до 0.40, что произойдёт с P(O | BLOCKED) при prior 0.3?",
      options: ["Упадёт до 46.15%", "Вырастет до 80%", "Не изменится", "Станет 100%"],
      correct: 0,
      explain: "0.24 / (0.24 + 0.28) = 0.4615. Больше ложных срабатываний — меньше доверия к сигналу.",
    },
    {
      q: "Чему равно P(O | CLEAR) в базовой модели?",
      options: ["9.68%", "63.16%", "20%", "30%"],
      correct: 0,
      explain: "6 / 62 = 0.0968. CLEAR сильно снижает вероятность препятствия, но не обнуляет её.",
    },
    {
      q: "Как байесовская сеть представляет совместное распределение?",
      options: [
        "Произведением условных вероятностей P(Xᵢ | Parents(Xᵢ))",
        "Суммой всех CPT",
        "Только через матрицу переходов",
        "Равномерным распределением по всем узлам",
      ],
      correct: 0,
      explain: "P(X₁,…,Xₙ) = Π P(Xᵢ | Parents(Xᵢ)). Граф задаёт, какие условия входят в каждую CPT.",
    },
    {
      q: "Почему в сети Weather → Environment → Sensor нет стрелки Weather → Sensor?",
      options: [
        "При известном Environment сенсор условно независим от Weather",
        "Потому что Weather — скрытая переменная",
        "Потому что стрелки разрешены только в одну сторону",
        "Потому что Sensor — родитель Environment",
      ],
      correct: 0,
      explain:
        "P(S | E, W) = P(S | E). Прямая стрелка не добавила бы зависимости и только усложнила бы CPT.",
    },
    {
      q: "Почему на t1 в HMM не применяют матрицу переходов?",
      options: [
        "До t1 ещё нет предыдущего состояния; используют начальное P(O)=0.30",
        "Потому что сенсор на t1 всегда врёт",
        "Потому что переходы применяются только после последнего шага",
        "Потому что P(O)=0 на старте",
      ],
      correct: 0,
      explain:
        "Переход описывает P(sₜ|sₜ₋₁). На первом шаге предыдущего состояния нет, поэтому predicted_O = prior = 0.30.",
    },
    {
      q: "Чему равен predicted P(O) на t3 (после t2 с posterior 0.2103)?",
      options: ["0.3052", "0.2103", "0.5158", "0.6372"],
      correct: 0,
      explain: "0.7·0.2103 + 0.2·(1−0.2103) = 0.1472 + 0.1579 = 0.3052.",
    },
    {
      q: "Чему равен posterior P(O) на t4 после двух BLOCKED подряд?",
      options: ["0.8117", "0.6372", "0.5186", "0.2103"],
      correct: 0,
      explain:
        "predicted = 0.7·0.6372 + 0.2·0.3628 = 0.5186; веса 0.8·0.5186 = 0.4149 и 0.2·0.4814 = 0.0963; posterior = 0.8117.",
    },
  ],
});
