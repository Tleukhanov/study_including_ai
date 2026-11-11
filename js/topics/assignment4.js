/* Тема 5 — Assignment 4: ML и нейросети */
window.TOPICS.push({
  id: "assignment4",
  num: "A4",
  short: "Assignment 4",
  kicker: "Assignment 4 · Machine Learning & Neural Networks",
  title: "Робот: baseline, нейросеть и проверка на обобщение",
  summary:
    "24 строки, 4 признака, 2 класса. Почему 100% accuracy — ловушка и какие тесты отделяют обучение от запоминания.",
  accent: "#f472b6",
  source: "Assignment_4_ML_KZ.ipynb · 18 train + 6 test, RANDOM_STATE=42",
  theory: [
    {
      title: "Данные и постановка",
      html: `
        <p>Задача — предсказать устойчивость робота на поверхности: <code>Stable = 1</code> (устойчиво) или <code>0</code> (неустойчиво).</p>
        <div class="table-wrap"><table>
          <tr><th>Признак</th><th>Смысл</th><th>Диапазон</th></tr>
          <tr><td><code>Vibration</code></td><td>вибрация</td><td class="num">0.2–0.9</td></tr>
          <tr><td><code>Slip</code></td><td>проскальзывание</td><td class="num">0.1–0.95</td></tr>
          <tr><td><code>SurfaceGrip</code></td><td>сцепление с поверхностью</td><td class="num">0.3–0.9</td></tr>
          <tr><td><code>ObstacleRate</code></td><td>частота препятствий</td><td class="num">0.1–0.95</td></tr>
        </table></div>
        <p>Всего 24 строки: 12 класса 1 и 12 класса 0. Train — ID 1–18, test — ID 19–24.</p>
        <div class="callout bad"><b>Ключевая особенность:</b> в тесте все 6 объектов класса 0. Значит, метрики для класса 1 на нём не определены.</div>
      `,
    },
    {
      title: "Baseline: с чем сравнивать",
      html: `
        <p><b>Baseline</b> — простейшая модель, с которой сравнивают всё остальное. Без него «хорошая» accuracy ничего не значит.</p>
        <ul>
          <li><code>DummyClassifier(strategy="most_frequent")</code> — всегда самый частый класс;</li>
          <li><code>DummyClassifier(constant=0)</code> — всегда класс 0;</li>
          <li><b>Logistic Regression</b> — линейная граница;</li>
          <li><b>Decision Tree</b> — правила вида <code>Slip &lt;= 0.65</code>.</li>
        </ul>
        <p>Если дерево и «всегда 0» дают одинаковую accuracy, модель не превзошла baseline, даже если число выглядит красиво.</p>
      `,
    },
    {
      title: "Метрики и ловушка одного класса",
      html: `
        <div class="formula">Precision(1) = TP / (TP + FP)
Recall(1)    = TP / (TP + FN)
F1(1)        = 2·P·R / (P + R)
Macro-F1     = (F1(0) + F1(1)) / 2</div>
        <p>Если в тесте нет класса 1, то <code>TP = 0</code>, и precision/recall/F1 для класса 1 равны 0 (или не определены).</p>
        <div class="callout warn"><b>Скрытая ловушка sklearn:</b> <code>f1_score(average="macro")</code> по умолчанию учитывает только классы, которые есть в <code>y_true</code> или <code>y_pred</code>. Если класс 1 отсутствует, macro-F1 = 1.0. Чтобы учесть оба класса, передают <code>labels=[0, 1]</code> — тогда результат 0.50.</div>
      `,
    },
    {
      title: "Нейросеть: MLP 4 → hidden → 1",
      html: `
        <p>Маленький перцептрон: 4 входа, один скрытый слой, 1 выход. Активация ReLU, оптимизатор Adam, backpropagation, <code>max_iter=5000</code>.</p>
        <div class="formula">4 → (8,) → 1     (базовая конфигурация)</div>
        <p>Перед обучением признаки стандартизуются <code>StandardScaler</code>. Проверяются конфигурации <code>(2,)</code>, <code>(8,)</code>, <code>(16,)</code> и <code>learning_rate_init</code> 0.01 / 0.001.</p>
        <div class="callout"><b>Проблема:</b> на 18 обучающих объектах любая конфигурация даёт 1.000 на тесте. Датасет слишком мал, чтобы гиперпараметры проявили себя.</div>
      `,
    },
    {
      title: "Стресс-тесты: шум, новый регион, permutation",
      html: `
        <p><b>1. Шум.</b> К тестовым признакам добавляют гауссов шум σ и повторяют 300 раз. Проверяет устойчивость границы решения.</p>
        <p><b>2. Leave-region-out.</b> Из обучения убирают средний диапазон <code>Slip ∈ (0.45, 0.75)</code> и тестируют именно на нём. Если модель выучила порог, она провалится; если выучила монотонную зависимость — справится.</p>
        <p><b>3. Permutation test.</b> Метки случайно перемешивают и повторяют CV. Если качество падает до уровня случая, сигнал в данных настоящий.</p>
        <div class="formula">реальные метки: CV = 1.000 / 0.950
перемешанные:  CV = 0.617 / 0.545</div>
      `,
    },
    {
      title: "Learning vs memorization vs understanding",
      html: `
        <ul>
          <li><b>Learning</b> — модель нашла закономерность, которая работает на новых данных.</li>
          <li><b>Memorization</b> — модель запомнила обучающие примеры, но не обобщает.</li>
          <li><b>Understanding</b> — модель знает причинно-следственный механизм, а не только корреляцию.</li>
        </ul>
        <p>В этой работе модель выучила одно правило <code>Slip &lt;= 0.65 → Stable</code>. Она <b>училась</b>, но не <b>поняла</b>: почему именно Slip, а не Vibration, — из модели не следует.</p>
        <div class="callout"><b>Вывод:</b> accuracy 1.0 не доказывает понимание. Нужны контролируемые эксперименты: leave-region-out, permutation, шум.</div>
      `,
    },
  ],
  tasks: [
    {
      title: "A. Данные и дисбаланс классов",
      question: `
        <p>Опишите датасет: сколько строк, признаков, классов? Как разделены train/test? Какие признаки самые информативные?</p>
      `,
      hint: `
        <p>Сначала выпиши четыре базовых числа: строки, признаки, баланс классов, размеры train/test.</p>
        <p>Для информативности смотри на <b>стандартизованную разницу</b> средних между классами: чем больше модуль, тем сильнее признак различает классы. Не путай модуль с направлением — знак показывает, в какую сторону.</p>
        <p>Отдельно отметь, каких классов нет в тесте.</p>
      `,
      answer: `
        <div class="kv">
          <div><b>24</b><span>строки</span></div>
          <div><b>4</b><span>признака</span></div>
          <div><b>12 / 12</b><span>класс 1 / класс 0</span></div>
          <div><b>18 / 6</b><span>train / test</span></div>
        </div>
        <p>Train — ID 1–18 (12 класса 1, 6 класса 0). Test — ID 19–24, все класса 0.</p>
        <p><b>Стандартизованная разница</b> между классами:</p>
        <div class="table-wrap"><table>
          <tr><th>Признак</th><th class="num">Разница</th><th>Вывод</th></tr>
          <tr><td><code>SurfaceGrip</code></td><td class="num">2.03 SD</td><td>самый информативный</td></tr>
          <tr><td><code>Slip</code></td><td class="num">−1.78 SD</td><td>сильный, обратная связь</td></tr>
          <tr><td><code>ObstacleRate</code></td><td class="num">−1.96 SD</td><td>сильный</td></tr>
          <tr><td><code>Vibration</code></td><td class="num">0.16 SD</td><td>почти не различает классы</td></tr>
        </table></div>
        <div class="callout warn"><b>Дисбаланс в тесте:</b> только класс 0. Это делает accuracy 1.0 почти неизбежной для любой модели, которая умеет говорить «0».</div>
      `,
    },
    {
      title: "B. Baseline: результаты и правило дерева",
      question: `
        <p>Сравните Dummy, Logistic Regression и Decision Tree. Какое правило выучило дерево? Что показывают коэффициенты логистической регрессии?</p>
      `,
      hint: `
        <p>Смотри не на accuracy, а на строку Dummy: если она такая же, тест не различает модели.</p>
        <ul>
          <li>Правило дерева ищи в текстовом экспорте <code>export_text</code> — там будет один порог.</li>
          <li>Коэффициенты LR стандартизованы: сравнивай модули, а знак читай как направление связи.</li>
          <li>Macro-F1 считай с <code>labels=[0, 1]</code>, иначе sklearn пропустит отсутствующий класс.</li>
        </ul>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>Модель</th><th class="num">Accuracy</th><th class="num">F1(1)</th><th class="num">Recall(0)</th><th class="num">Macro-F1 [0,1]</th></tr>
          <tr><td>Dummy (constant=0)</td><td class="num">1.0</td><td class="num">0.0</td><td class="num">1.0</td><td class="num">0.5</td></tr>
          <tr><td>Logistic Regression</td><td class="num">1.0</td><td class="num">0.0</td><td class="num">1.0</td><td class="num">0.5</td></tr>
          <tr><td>Decision Tree (depth=3)</td><td class="num">1.0</td><td class="num">0.0</td><td class="num">1.0</td><td class="num">0.5</td></tr>
        </table></div>
        <p><b>Дерево выучило ровно одно правило:</b></p>
        <pre class="code">|--- Slip &lt;= 0.65
|   |--- class: 1
|--- Slip &gt;  0.65
|   |--- class: 0</pre>
        <p><b>Коэффициенты логистической регрессии</b> (стандартизованные):</p>
        <div class="table-wrap"><table>
          <tr><th>Признак</th><th class="num">Коэффициент</th></tr>
          <tr><td>Vibration</td><td class="num">+0.08</td></tr>
          <tr><td>Slip</td><td class="num">−0.82</td></tr>
          <tr><td>SurfaceGrip</td><td class="num">+1.12</td></tr>
          <tr><td>ObstacleRate</td><td class="num">−0.93</td></tr>
          <tr><td>intercept</td><td class="num">+1.52</td></tr>
        </table></div>
        <div class="callout bad"><b>Главный вывод:</b> accuracy 1.0 у всех, включая Dummy. Тест не различает модели. Macro-F1 с <code>labels=[0,1]</code> = 0.50 — как у «всегда 0».</div>
      `,
    },
    {
      title: "B2. Почему accuracy 1.0 — не доказательство",
      question: `
        <p>Объясните, почему 100% accuracy на тесте не означает, что модель хороша. Приведите два независимых аргумента.</p>
      `,
      hint: `
        <p>Первый аргумент — про состав теста: какие классы там есть и что сделает модель «всегда 0».</p>
        <p>Второй — про метрику: чему равен <code>TP</code> для класса 1 и почему precision/recall/F1 теряют смысл. Проверь, что даёт macro-F1 с <code>labels=[0,1]</code>.</p>
        <p>Аргументы должны быть независимы: один про данные, другой про метрику.</p>
      `,
      answer: `
        <ol class="steps">
          <li><b>В тесте только один класс.</b> Все 6 объектов — класса 0. Модель «всегда 0» получает те же 6/6. Значит, тест не проверяет способность находить класс 1.</li>
          <li><b>Метрика для класса 1 не определена.</b> Precision/recall/F1 считаются через TP, а TP = 0. Macro-F1 по умолчанию игнорирует отсутствующий класс и даёт 1.0; с <code>labels=[0,1]</code> — 0.50.</li>
        </ol>
        <p>Дополнительный аргумент: правило <code>Slip &lt;= 0.65</code> идеально делит train, но данных всего 18. Такой результат достижим и запоминанием, и настоящей закономерностью.</p>
        <div class="callout"><b>Что нужно:</b> тест с обоими классами, баланс, отложенная область значений и проверка на шуме.</div>
      `,
    },
    {
      title: "C. Нейросеть и гиперпараметры",
      question: `
        <p>Какие конфигурации MLP проверялись? Что показали test accuracy, CV и шум σ=0.15?</p>
      `,
      hint: `
        <p>Заполни таблицу по столбцам: конфигурация, test accuracy, CV, точность на шуме.</p>
        <p>Обрати внимание, что test и CV одинаковы у всех — это <b>ceiling effect</b>. Сравни различия на шуме со стандартным отклонением: если разница меньше σ, вывод о лучшей конфигурации делать нельзя.</p>
        <p>В конце назови причину: размер датасета.</p>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>Конфигурация</th><th class="num">Test acc</th><th class="num">Macro-F1 [0,1]</th><th class="num">CV acc</th><th class="num">Шум σ=0.15</th></tr>
          <tr><td>(8,), lr=0.01 — базовая</td><td class="num">1.0</td><td class="num">0.5</td><td class="num">1.000</td><td class="num">0.998 ± 0.019</td></tr>
          <tr><td>(2,)</td><td class="num">1.0</td><td class="num">0.5</td><td class="num">1.000</td><td class="num">0.994 ± 0.030</td></tr>
          <tr><td>(16,)</td><td class="num">1.0</td><td class="num">0.5</td><td class="num">1.000</td><td class="num">0.993 ± 0.034</td></tr>
          <tr><td>lr=0.001</td><td class="num">1.0</td><td class="num">0.5</td><td class="num">1.000</td><td class="num">0.998 ± 0.019</td></tr>
        </table></div>
        <p>Все конфигурации дают одинаковый test accuracy: сработал «потолок» (ceiling effect). Разница видна только на шуме и находится в пределах стандартного отклонения.</p>
        <div class="callout warn"><b>Вывод:</b> датасет слишком мал для сравнения гиперпараметров. Нужно в 10–100 раз больше данных или более сложная задача.</div>
      `,
    },
    {
      title: "D. Шумовой стресс-тест",
      question: `
        <p>Как меняется accuracy при σ от 0 до 0.25? Какая модель самая устойчивая и какая — самая хрупкая?</p>
      `,
      hint: `
        <p>Читай таблицу по строкам: у какой модели accuracy падает медленнее всего при росте σ?</p>
        <p>Хрупкость объясняй через правило модели: дерево использует один порог <code>Slip ≈ 0.65</code>, поэтому шум легко перекидывает объект через границу. LR и MLP используют все признаки, поэтому ошибаются более распределённо.</p>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>σ</th><th class="num">Logistic Regression</th><th class="num">Decision Tree</th><th class="num">MLP (8,)</th></tr>
          <tr><td>0.00</td><td class="num">1.000</td><td class="num">1.000</td><td class="num">1.000</td></tr>
          <tr><td>0.05</td><td class="num">1.000</td><td class="num">0.971</td><td class="num">1.000</td></tr>
          <tr><td>0.10</td><td class="num">0.998</td><td class="num">0.939</td><td class="num">1.000</td></tr>
          <tr><td>0.15</td><td class="num">0.981</td><td class="num">0.884</td><td class="num">0.998</td></tr>
          <tr><td>0.20</td><td class="num">0.944</td><td class="num">0.839</td><td class="num">0.984</td></tr>
          <tr><td>0.25</td><td class="num">0.898</td><td class="num">0.791</td><td class="num">0.957</td></tr>
        </table></div>
        <p>MLP устойчивее всех, дерево — самое хрупкое: оно смотрит только на <code>Slip</code> и резко меняет ответ near границы 0.65. На σ=0.15 дерево чаще всего ошибается на ID 20 (<code>Slip=0.70</code>, всего 0.05 от порога) — 37.3% прогонов.</p>
        <div class="callout"><b>Логистическая регрессия</b> использует все 4 признака, поэтому её ошибки распределены: худший случай — ID 19 с 6.7%.</div>
      `,
    },
    {
      title: "E. Leave-region-out и permutation",
      question: `
        <p>Что показывают два контрольных эксперимента: обучение без среднего диапазона Slip и перемешивание меток?</p>
      `,
      hint: `
        <p>Для leave-region-out: из обучения убирают середину диапазона <code>Slip</code>, а тестируют именно на ней. Спроси, что сделает модель, выучившая жёсткий порог, и что — модель, выучившая монотонную зависимость.</p>
        <p>Для permutation: перемешивание разрушает связь признаков с меткой. Сравни CV с уровнем случайного угадывания с учётом дисбаланса 12:6.</p>
        <p>Вывод делай по двум тестам вместе, а не по одному.</p>
      `,
      answer: `
        <p><b>Leave-region-out.</b> Из train убрали <code>Slip ∈ (0.45, 0.75)</code>, осталось 13 строк; тест — 6 строк из этого диапазона.</p>
        <div class="table-wrap"><table>
          <tr><th>Модель</th><th class="num">Accuracy</th><th>Ошибка</th></tr>
          <tr><td>Logistic Regression</td><td class="num">1.000</td><td>—</td></tr>
          <tr><td>Decision Tree</td><td class="num">0.833</td><td>ID 12</td></tr>
          <tr><td>MLP (8,)</td><td class="num">1.000</td><td>—</td></tr>
        </table></div>
        <p>Дерево выучило жёсткий порог, поэтому в «вырезанном» регионе ошибается. Линейная модель и сеть интерполируют монотонную зависимость.</p>
        <p><b>Permutation.</b> 5-fold CV на реальных и перемешанных метках (20 повторов):</p>
        <div class="formula">Logistic Regression: 1.000  vs  0.617 ± 0.053
Decision Tree:       0.950  vs  0.545 ± 0.139</div>
        <p>При перемешивании качество падает почти до уровня случайного угадывания (с поправкой на дисбаланс 12:6). Значит, сигнал в данных настоящий, а не артефакт.</p>
        <div class="callout ok"><b>Комбинированный вывод:</b> Slip — реальный предиктор, но дерево запоминает порог, а LR/MLP обобщают. Оба теста нужны вместе.</div>
      `,
    },
    {
      title: "F. Философия: обучение, запоминание, понимание",
      question: `
        <p>Модель достигла 100% accuracy. Можно ли утверждать, что она «поняла» задачу? Аргументируйте через learning / memorization / understanding.</p>
      `,
      hint: `
        <p>Разведи три критерия и для каждого приведи своё доказательство:</p>
        <ul>
          <li><b>learning</b> — правило работает на новых строках;</li>
          <li><b>memorization</b> — 18 строк и тест только из класса 0;</li>
          <li><b>understanding</b> — знает ли модель, почему признак важен.</li>
        </ul>
        <p>Используй результаты leave-region-out и permutation: они отделяют обучение от запоминания. Accuracy 1.0 сама по себе не аргумент.</p>
      `,
      answer: `
        <div class="table-wrap"><table>
          <tr><th>Критерий</th><th>Доказательство</th><th>Вердикт</th></tr>
          <tr><td>Learning</td><td>Правило <code>Slip &lt;= 0.65</code> работает на новых строках</td><td>да</td></tr>
          <tr><td>Memorization</td><td>18 строк, тест только из класса 0</td><td>возможно</td></tr>
          <tr><td>Understanding</td><td>Модель не знает, почему Slip важен; Vibration весит +0.08</td><td>нет</td></tr>
        </table></div>
        <p>Accuracy 1.0 достигается и моделью, и правилом «всегда 0». Поэтому одного числа недостаточно. Нужны leave-region-out (Tree 0.833 против LR/MLP 1.000) и permutation (CV падает до 0.617/0.545).</p>
        <div class="callout"><b>Итог:</b> модель <b>училась</b>, но не <b>поняла</b>. Она нашла корреляцию, а не механизм. Для робота это означает: при смене поверхности или датчиков поведение может стать опасным.</div>
        <p><b>Практическая рекомендация:</b> в сомнительных случаях предсказывать «неустойчиво» — цена ложной стабильности выше цены ложной тревоги.</p>
      `,
    },
  ],
  quiz: [
    {
      q: "Сколько строк и признаков в датасете Assignment 4?",
      options: ["24 строки, 4 признака", "18 строк, 4 признака", "24 строки, 6 признаков", "60 строк, 2 признака"],
      correct: 0,
      explain: "24 строки, признаки Vibration, Slip, SurfaceGrip, ObstacleRate. Train 18, test 6.",
    },
    {
      q: "Какие классы содержатся в тестовой выборке (ID 19–24)?",
      options: ["Только класс 0", "Только класс 1", "По 3 объекта каждого класса", "Классы 0 и 1 в пропорции 2:1"],
      correct: 0,
      explain: "Все 6 тестовых объектов — класса 0. Поэтому метрики для класса 1 не определены.",
    },
    {
      q: "Чему равен Macro-F1 при labels=[0,1] у Logistic Regression?",
      options: ["0.50", "1.00", "0.00", "0.75"],
      correct: 0,
      explain:
        "F1(0)=1.0, F1(1)=0.0, среднее = 0.50. Без labels=[0,1] sklearn игнорирует отсутствующий класс и даёт 1.0.",
    },
    {
      q: "Почему Dummy (constant=0) получает accuracy 1.0?",
      options: [
        "Все тестовые объекты действительно класса 0",
        "Dummy обучается на тесте",
        "Accuracy считается только по классу 1",
        "Это ошибка sklearn",
      ],
      correct: 0,
      explain: "Модель всегда говорит 0, и все 6 тестовых ответов совпадают. Это и есть ловушка теста.",
    },
    {
      q: "Какое правило выучило Decision Tree?",
      options: ["Slip <= 0.65 → класс 1", "Vibration <= 0.5 → класс 1", "SurfaceGrip > 0.8 → класс 0", "ObstacleRate <= 0.4 → класс 1"],
      correct: 0,
      explain: "Дерево глубины 3 свелось к одному порогу по Slip; остальные признаки не использовались.",
    },
    {
      q: "Какой признак сильнее всего различает классы (стандартизованная разница)?",
      options: ["SurfaceGrip (2.03 SD)", "Vibration (0.16 SD)", "Slip (−1.78 SD)", "ObstacleRate (−1.96 SD)"],
      correct: 0,
      explain: "SurfaceGrip имеет наибольшую стандартизованную разницу — 2.03 SD.",
    },
    {
      q: "Какой признак почти не различает классы?",
      options: ["Vibration (0.16 SD)", "SurfaceGrip (2.03 SD)", "Slip (−1.78 SD)", "ObstacleRate (−1.96 SD)"],
      correct: 0,
      explain: "Разница всего 0.16 SD. Неудивительно, что коэффициент логистической регрессии для Vibration лишь +0.08.",
    },
    {
      q: "Чему равна CV accuracy логистической регрессии?",
      options: ["1.000", "0.950", "0.617", "0.833"],
      correct: 0,
      explain: "5-fold CV на train: LR 1.000, Decision Tree 0.950. 0.617 — уже перемешанные метки.",
    },
    {
      q: "Какая модель хуже всех держится при шуме σ = 0.20?",
      options: ["Decision Tree — 0.839", "Logistic Regression — 0.944", "MLP — 0.984", "Dummy — 1.000"],
      correct: 0,
      explain: "Дерево опирается на один порог Slip=0.65, поэтому шум легко перекидывает объекты через границу.",
    },
    {
      q: "Что показал leave-region-out для Decision Tree?",
      options: ["0.833 — ошибка на ID 12", "1.000 — идеально", "0.617 — как случай", "0.500 — половина"],
      correct: 0,
      explain: "LR и MLP дали 1.000, дерево — 0.833: оно запомнило порог и не интерполировало в вырезанный диапазон.",
    },
    {
      q: "Что означает падение CV с 1.000 до 0.617 при перемешивании меток?",
      options: [
        "Сигнал в данных настоящий, а не случайный",
        "Модель переобучилась",
        "В данных ошибка разметки",
        "Permutation улучшает модель",
      ],
      correct: 0,
      explain:
        "Если перемешать метки, связь признаков с классом исчезает. Падение до уровня случая подтверждает, что исходная связь была реальной.",
    },
    {
      q: "Какой вывод о модели соответствует данным?",
      options: [
        "Она выучила закономерность, но не поняла причинный механизм",
        "Она полностью поняла физику движения робота",
        "Она ничего не выучила",
        "Accuracy 1.0 доказывает понимание",
      ],
      correct: 0,
      explain:
        "Модель нашла порог по Slip, но не знает, почему он важен. Learning есть, understanding — нет.",
    },
  ],
});
