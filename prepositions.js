// in / on / at - teori ve oyun

const prepRules = [
  {
    prep: "in",
    title: "Sınırları belli kapalı alanlar / iç kısım & Zaman (geniş/uzun dönemler)",
    desc:
      "Dört tarafı (ve çoğu zaman üstü) belli, içine girebildiğin alanlarda ve bir şeyin içinde olduğunda kullanılır. Zaman için: mevsimler, aylar, yıllar, yüzyıllar, günün bölümleri (afternoon, morning) gibi geniş zaman dilimlerinde kullanılır.",
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
      "in the city / in Istanbul",
      "in spring / in summer / in autumn / in winter",
      "in January / in February / in March",
      "in 1998 / in 2024",
      "in the afternoon / in the morning",
      "in the 1990s",
      "in the next century",
      "in the ice age",
      "in the past / in the future",
      "in the mornings",
      "in a decade"
    ]
  },
  {
    prep: "on",
    title: "Yüzeyler, üzerine temas, çizgi / yol & Zaman (belirli günler/tarihler)",
    desc:
      "Bir şeyin yüzeyine temas ettiğinde, üzerinde durduğunda veya çizgi/yol gibi üstü açık alanlarda kullanılır. Zaman için: belirli günler (Sunday), gün adları ile birlikte kullanılan zamanlar (Sunday morning), belirli tarihler ve özel günlerde kullanılır.",
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
      "on your own",
      "on Sunday / on Fridays",
      "on Sunday morning",
      "on my birthday",
      "on Christmas Day",
      "on the 20th of June",
      "on 23 Dec. 2010",
      "on 6 March",
      "on Independence Day",
      "on New Year's Eve",
      "on Tuesday afternoon",
      "on 13th February"
    ]
  },
  {
    prep: "at",
    title: "Belirli nokta / etkinlik / kurum & Zaman (an/nokta zamanlar)",
    desc:
      "Haritada bir nokta gibi düşündüğün yerler, etkinlikler ve kurum binalarının \"lokasyonu\" için kullanılır. Zaman için: belirli saatler (5 am), günün bölümleri (noon, midnight, night), kısa zaman dilimleri (the moment, present, the same time) ve özel zamanlar (Christmas, Easter, the weekend) için kullanılır.",
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
      "at the end of",
      "at noon / at midnight",
      "at 5 am / at 3 pm",
      "at Christmas (Noel'de)",
      "at Easter (Paskalya)",
      "at present",
      "at the moment",
      "at the same time",
      "at the weekend",
      "at lunchtime / at breakfast time",
      "at New Year"
    ]
  },
  {
    prep: "mix",
    title: "Sabit ifadeler ve özel durumlar",
    desc:
      "Bazı kalıplaşmış ifadelerde hangi edatın geldiği ezberlenir.",
    examples: [
      "on holiday",
      "on average",
      "in the middle of",
      "on TV / on the channel",
      "on your own",
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
  },
  // Zaman soruları
  {
    sentence: "I was born ___ spring.",
    answer: "in",
    explanation: "Mevsimler için in kullanılır → in spring / in summer / in winter / in autumn."
  },
  {
    sentence: "We met ___ January last year.",
    answer: "in",
    explanation: "Aylar için in kullanılır → in January / in February / in March."
  },
  {
    sentence: "He graduated ___ 1998.",
    answer: "in",
    explanation: "Yıllar için in kullanılır → in 1998 / in 2024."
  },
  {
    sentence: "I usually have coffee ___ the afternoon.",
    answer: "in",
    explanation: "Günün bölümleri (afternoon, morning) için in kullanılır → in the afternoon / in the morning."
  },
  {
    sentence: "She was born ___ the 1990s.",
    answer: "in",
    explanation: "On yıllık dönemler için in kullanılır → in the 1990s / in the 2000s."
  },
  {
    sentence: "We will see this ___ the next century.",
    answer: "in",
    explanation: "Yüzyıllar için in kullanılır → in the next century / in the 21st century."
  },
  {
    sentence: "They lived ___ the ice age.",
    answer: "in",
    explanation: "Tarihi dönemler için in kullanılır → in the ice age / in the Middle Ages."
  },
  {
    sentence: "What will happen ___ the future?",
    answer: "in",
    explanation: "Geçmiş ve gelecek için in kullanılır → in the past / in the future."
  },
  {
    sentence: "The meeting is ___ Sunday.",
    answer: "on",
    explanation: "Belirli günler için on kullanılır → on Sunday / on Friday / on Mondays."
  },
  {
    sentence: "I work ___ Fridays.",
    answer: "on",
    explanation: "Tekrarlanan günler için on kullanılır → on Fridays / on Sundays."
  },
  {
    sentence: "We'll meet ___ Sunday morning.",
    answer: "on",
    explanation: "Gün adı ile birlikte zaman belirtildiğinde on kullanılır → on Sunday morning / on Tuesday afternoon."
  },
  {
    sentence: "I was born ___ my birthday.",
    answer: "on",
    explanation: "Özel günler için on kullanılır → on my birthday / on Independence Day."
  },
  {
    sentence: "We celebrate ___ Christmas Day.",
    answer: "on",
    explanation: "Belirli bayram günleri için on kullanılır → on Christmas Day / on New Year's Day."
  },
  {
    sentence: "The exam is ___ the 20th of June.",
    answer: "on",
    explanation: "Belirli tarihler için on kullanılır → on the 20th of June / on 6 March."
  },
  {
    sentence: "She arrived ___ 23 Dec. 2010.",
    answer: "on",
    explanation: "Belirli tarihler için on kullanılır → on 23 Dec. 2010 / on 13th February."
  },
  {
    sentence: "The party is ___ New Year's Eve.",
    answer: "on",
    explanation: "Özel geceler ve kutlamalar için on kullanılır → on New Year's Eve / on Christmas Eve."
  },
  {
    sentence: "I'll call you ___ Tuesday afternoon.",
    answer: "on",
    explanation: "Gün adı ile afternoon/evening/morning birlikte on kullanılır → on Tuesday afternoon."
  },
  {
    sentence: "I wake up ___ noon every day.",
    answer: "at",
    explanation: "Günün belirli noktaları için at kullanılır → at noon / at midnight / at night."
  },
  {
    sentence: "He called me ___ midnight.",
    answer: "at",
    explanation: "Gece yarısı ve gece için at kullanılır → at midnight / at night."
  },
  {
    sentence: "The train leaves ___ 5 am.",
    answer: "at",
    explanation: "Belirli saatler için at kullanılır → at 5 am / at 3 pm / at 9:30."
  },
  {
    sentence: "We usually celebrate ___ Christmas.",
    answer: "at",
    explanation: "Bayram dönemleri için (günün tamamı değil, genel dönem) at kullanılır → at Christmas / at Easter."
  },
  {
    sentence: "What did you do ___ Easter?",
    answer: "at",
    explanation: "Paskalya dönemi için at kullanılır → at Easter (Paskalya)."
  },
  {
    sentence: "I'm busy ___ present.",
    answer: "at",
    explanation: "Şu an için at kullanılır → at present / at the moment."
  },
  {
    sentence: "I can't talk ___ the moment.",
    answer: "at",
    explanation: "An/belirli an için at kullanılır → at the moment / at present."
  },
  {
    sentence: "We arrived ___ the same time.",
    answer: "at",
    explanation: "Aynı zaman noktası için at kullanılır → at the same time."
  },
  {
    sentence: "What are you doing ___ the weekend?",
    answer: "at",
    explanation: "Hafta sonu için at kullanılır → at the weekend / at weekends."
  },
  {
    sentence: "Let's meet ___ lunchtime.",
    answer: "at",
    explanation: "Yemek zamanları için at kullanılır → at lunchtime / at breakfast time / at dinnertime."
  },
  {
    sentence: "We celebrate ___ New Year.",
    answer: "at",
    explanation: "Yeni yıl kutlaması için at kullanılır → at New Year (genel dönem olarak)."
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
      <div class="prep-examples-title">Örnekler (yer/mekan ve zaman)</div>
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

