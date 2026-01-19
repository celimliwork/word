// in / on / at - teori ve oyun

const prepRules = [
  {
    prep: "in",
    title: "Sınırları belli kapalı alanlar / iç kısım",
    desc:
      "Dört tarafı (ve çoğu zaman üstü) belli, içine girebildiğin alanlarda ve bir şeyin içinde olduğunda kullanılır.",
    examples: [
      "in the park",
      "in the building",
      "in the sea / in the river",
      "in the house / in the school / in the kitchen",
      "in the box / in the fridge / in the oven",
      "in the story / in the book / in the newspaper",
      "in bed",
      "in the street",
      "in the sky",
      "in a car / in a taxi / in a helicopter / in a boat",
      "in a lift / in an elevator",
      "in a row",
      "in my pocket / in my wallet",
      "in the garden / in the yard / in the balcony",
      "in the city center",
      "in the dining room",
      "in the class",
      "in the national team / in the team",
      "in a group / in a club",
      "in the country / in Turkey / in England",
      "in the city / in Istanbul"
    ]
  },
  {
    prep: "on",
    title: "Yüzeyler, üzerine temas, çizgi / yol",
    desc:
      "Bir şeyin yüzeyine temas ettiğinde, üzerinde durduğunda veya çizgi/yol gibi üstü açık alanlarda kullanılır.",
    examples: [
      "on the wall / on the ceiling / on the floor",
      "on the page",
      "on the left / on the right",
      "on the ground floor / on the first floor",
      "on the chair",
      "on a horse / on a camel",
      "on TV / on the radio / on the channel",
      "on the way",
      "on the carpet / on the cover / on the door",
      "on the menu",
      "on a bus / on a train / on a plane / on a ship",
      "on a bicycle / on a motorbike",
      "on the street",
      "on your own"
    ]
  },
  {
    prep: "at",
    title: "Belirli nokta / etkinlik / kurum",
    desc:
      "Haritada bir nokta gibi düşündüğün yerler, etkinlikler ve kurum binalarının “lokasyonu” için kullanılır.",
    examples: [
      "at the hospital / at the restaurant",
      "at the station / at the bus station",
      "at the airport / at the seaside",
      "at the sea (gemide yolculuk yaparken)",
      "at the window / at the entrance",
      "at the end of the street",
      "at the party / at the meeting",
      "at the bottom of / at the side",
      "at the corner",
      "at home",
      "at school (lokasyon olarak)",
      "at the cinema",
      "at Microsoft / at Google / at [şirket adı]",
      "at night",
      "at temperature",
      "at the end of"
    ]
  },
  {
    prep: "mix",
    title: "Sabit ifadeler ve zamanlar",
    desc:
      "Bazı zamanlarda ve kalıplaşmış ifadelerde hangi edatın geldiği ezberlenir.",
    examples: [
      "in summer",
      "on holiday",
      "on average",
      "in the middle of",
      "on TV / on the channel",
      "on your own",
      "at night",
      "at the end of"
    ]
  }
];

const prepQuestions = [
  {
    sentence: "We are having a picnic ___ the park.",
    answer: "in",
    explanation: "Park, sınırları belli bir alandır → in the park."
  },
  {
    sentence: "She is waiting ___ the bus station.",
    answer: "at",
    explanation: "Belirli bir nokta ve kurum → at the bus station."
  },
  {
    sentence: "There is a picture ___ the wall.",
    answer: "on",
    explanation: "Resim duvarın yüzeyine temas eder → on the wall."
  },
  {
    sentence: "I left my keys ___ my pocket.",
    answer: "in",
    explanation: "Cep, içi olan kapalı bir alan → in my pocket."
  },
  {
    sentence: "They are sitting ___ the floor.",
    answer: "on",
    explanation: "Üzerine oturduğumuz yüzey → on the floor."
  },
  {
    sentence: "He works ___ the city center.",
    answer: "in",
    explanation: "Şehrin merkezi sınırları olan bir bölge → in the city center."
  },
  {
    sentence: "I will meet you ___ the corner of the street.",
    answer: "at",
    explanation: "Sokak köşesi tam bir nokta olarak düşünülür → at the corner."
  },
  {
    sentence: "She is standing ___ the balcony.",
    answer: "on",
    explanation:
      "Balkon hem bir yüzey hem de platform gibidir, çoğunlukla on the balcony denir."
  },
  {
    sentence: "They are sitting ___ the garden.",
    answer: "in",
    explanation:
      "Bahçe, çevresi belli bir alandır, içinde bulunursun → in the garden."
  },
  {
    sentence: "He is already ___ the train.",
    answer: "on",
    explanation:
      "Toplu taşıma araçlarında (bus, train, plane, ship) genelde on kullanılır → on the train."
  },
  {
    sentence: "She is ___ the car.",
    answer: "in",
    explanation:
      "Ayakta durulamayan araçlarda in kullanılır (car, taxi, small boat) → in the car."
  },
  {
    sentence: "We are ___ the cinema, the film is starting.",
    answer: "in",
    explanation:
      "Salonun içindeysen → in the cinema. Sadece konumdan bahsederken at the cinema denir."
  },
  {
    sentence: "He is ___ school right now.",
    answer: "at",
    explanation:
      "Genel olarak ‘okulda’ lokasyonundan bahsediyorsak → at school."
  },
  {
    sentence: "The kids are ___ the classroom.",
    answer: "in",
    explanation:
      "Sınırları belli kapalı bir oda → in the classroom / in the class."
  },
  {
    sentence: "The news is ___ TV right now.",
    answer: "on",
    explanation: "Ekran/yayın yüzeyi mantığıyla → on TV."
  },
  {
    sentence: "We usually go away ___ summer.",
    answer: "in",
    explanation: "Mevsimlerde in kullanılır → in summer."
  },
  {
    sentence: "They are ___ holiday this week.",
    answer: "on",
    explanation: "Tatil ifadesiyle kalıp → on holiday."
  },
  {
    sentence: "He is standing ___ the window, looking outside.",
    answer: "at",
    explanation:
      "Pencerenin yanında, nokta gibi konum: at the window (görsel temas)."
  },
  {
    sentence: "We are ___ the end of the street.",
    answer: "at",
    explanation: "Sokağın sonu yine bir nokta gibi → at the end of the street."
  },
  {
    sentence: "She is sitting ___ the chair.",
    answer: "on",
    explanation: "Sandalye bir yüzey gibi düşünülür → on the chair."
  },
  {
    sentence: "He works ___ Microsoft.",
    answer: "at",
    explanation: "Şirketler ve kurumlar için → at Microsoft / at Google / at [şirket adı]."
  },
  {
    sentence: "She plays ___ the national team.",
    answer: "in",
    explanation: "Ekip, takım, grup gibi içinde bulunduğun organizasyonlar için → in the team / in the national team / in a group."
  },
  {
    sentence: "They live ___ Turkey.",
    answer: "in",
    explanation: "Ülkeler ve şehirler için → in the country / in Turkey / in England / in Istanbul."
  }
];

let currentQuestionIndex = -1;
let correctCount = 0;
let totalCount = 0;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let shuffledQuestions = shuffle(prepQuestions);

function renderPrepRules() {
  const container = document.getElementById("prepRulesContainer");
  if (!container) return;

  container.innerHTML = "";

  prepRules.forEach((rule) => {
    const card = document.createElement("div");
    card.className = "prep-rule-card";

    const pillClass =
      rule.prep === "in" ? "in" : rule.prep === "on" ? "on" : rule.prep === "at" ? "at" : "";
    const pillLabel =
      rule.prep === "mix" ? "KALIPLAR" : rule.prep.toUpperCase();

    card.innerHTML = `
      <div class="prep-rule-header">
        <span class="prep-pill ${pillClass}">${pillLabel}</span>
        <div class="prep-rule-title">${rule.title}</div>
      </div>
      <div class="prep-rule-desc">${rule.desc}</div>
      <div class="prep-examples-title">Örnek yer ve mekanlar</div>
      <div class="prep-examples">
        ${rule.examples
          .map((ex) => `<span class="prep-example-chip">${ex}</span>`)
          .join("")}
      </div>
    `;

    container.appendChild(card);
  });
}

function updatePrepScore() {
  const scoreEl = document.getElementById("prepScore");
  if (!scoreEl) return;
  if (totalCount === 0) {
    scoreEl.textContent = "";
    return;
  }
  const percent = Math.round((correctCount / totalCount) * 100);
  scoreEl.textContent = `Skorun: ${correctCount}/${totalCount} (%${percent})`;
}

function loadNextQuestion() {
  const sentenceEl = document.getElementById("prepSentence");
  const feedbackEl = document.getElementById("prepFeedback");
  const explanationEl = document.getElementById("prepExplanation");
  const optionButtons = document.querySelectorAll(".prep-option-btn");

  if (!sentenceEl || !feedbackEl || !explanationEl) return;

  // yeni soru
  currentQuestionIndex++;
  if (currentQuestionIndex >= shuffledQuestions.length) {
    shuffledQuestions = shuffle(prepQuestions);
    currentQuestionIndex = 0;
  }

  const q = shuffledQuestions[currentQuestionIndex];
  const parts = q.sentence.split("___");
  sentenceEl.innerHTML = `
    ${parts[0]}<span class="prep-blank">___</span>${parts[1] || ""}
  `;

  feedbackEl.textContent = "";
  feedbackEl.className = "prep-feedback";
  explanationEl.style.display = "none";
  explanationEl.textContent = "";

  optionButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct", "wrong");
  });
}

function handleOptionClick(e) {
  const chosen = e.currentTarget.getAttribute("data-value");
  const q = shuffledQuestions[currentQuestionIndex];
  if (!q) return;

  const feedbackEl = document.getElementById("prepFeedback");
  const explanationEl = document.getElementById("prepExplanation");
  const optionButtons = document.querySelectorAll(".prep-option-btn");

  optionButtons.forEach((btn) => {
    btn.disabled = true;
    const val = btn.getAttribute("data-value");
    if (val === q.answer) {
      btn.classList.add("correct");
    } else if (val === chosen && chosen !== q.answer) {
      btn.classList.add("wrong");
    }
  });

  totalCount++;
  if (chosen === q.answer) {
    correctCount++;
    feedbackEl.textContent = "Doğru! 👍";
    feedbackEl.className = "prep-feedback correct";
  } else {
    feedbackEl.textContent = `Yanlış. Doğru cevap: "${q.answer}".`;
    feedbackEl.className = "prep-feedback wrong";
  }

  explanationEl.style.display = "block";
  explanationEl.textContent = q.explanation;

  updatePrepScore();
}

function initPrepTabs() {
  const tabs = document.querySelectorAll(".prep-tab");
  const sections = document.querySelectorAll(".prep-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");

      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      tab.classList.add("active");
      const target = document.getElementById(targetId);
      if (target) target.classList.add("active");
    });
  });
}

function initPrepGame() {
  const optionButtons = document.querySelectorAll(".prep-option-btn");
  optionButtons.forEach((btn) => {
    btn.addEventListener("click", handleOptionClick);
  });

  const nextBtn = document.getElementById("prepNextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      loadNextQuestion();
    });
  }

  loadNextQuestion();
}

document.addEventListener("DOMContentLoaded", () => {
  renderPrepRules();
  initPrepTabs();
  initPrepGame();
});

