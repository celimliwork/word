// ==================== GLOBAL STATE ====================
let wordsData = [];
let filteredWordsData = [];
let currentPage = 1;
let CARDS_PER_PAGE = 20;
let currentMode = "full";
let selectedDate = "all";
let searchTerm = "";
let longPressTimer = null;
const LONG_PRESS_DURATION = 500;
const STORAGE_KEY = "wordCardAppState";
let isReadingAllExamples = false; // Tüm cümleleri okuma durumu
let readAllTimeoutId = null; // Bekleme timeout ID'si
let isLearningMode = false; // Öğrenme modu durumu
let learningTimeoutId = null; // Öğrenme modu timeout ID'si
let currentLearningIndex = 0; // Şu an okunan kelime indeksi
let currentPageWords = []; // Mevcut sayfadaki kelimeler

// ==================== LOCALSTORAGE ====================
function saveState() {
  const state = {
    currentMode: currentMode,
    selectedDate: selectedDate,
    currentPage: currentPage,
    cardsPerPage: CARDS_PER_PAGE,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("localStorage kayıt hatası:", error);
  }
}

function loadState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.currentMode) currentMode = state.currentMode;
      if (state.selectedDate) selectedDate = state.selectedDate;
      if (state.currentPage) currentPage = state.currentPage;
      if (state.cardsPerPage) CARDS_PER_PAGE = state.cardsPerPage;
    }
  } catch (error) {
    console.error("localStorage yükleme hatası:", error);
  }
}

// ==================== DATA LOADING ====================
let wordsIndex = null;
let wordsIndexLoaded = false;
let dateFilterInitialized = false;
let totalWordsCount = 0;

async function loadWordsIndex() {
  // Eğer zaten yüklendiyse tekrar yükleme
  if (wordsIndexLoaded && wordsIndex) {
    return true;
  }

  try {
    const response = await fetch("words_index.json");
    wordsIndex = await response.json();
    wordsIndexLoaded = true;

    // Toplam kelime sayısını hesapla
    await calculateTotalWordsCount();

    return true;
  } catch (error) {
    console.error("Index dosyası yüklenirken hata:", error);
    return false;
  }
}

async function calculateTotalWordsCount() {
  if (!wordsIndex || !wordsIndex.files || wordsIndex.files.length === 0) {
    totalWordsCount = 0;
    updateTotalWordsDisplay();
    return;
  }

  try {
    let total = 0;
    // Tüm dosyalardaki kelime sayılarını topla
    for (const filename of wordsIndex.files) {
      try {
        const response = await fetch(filename);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            total += data.length;
          }
        }
      } catch (error) {
        // Dosya yüklenemezse sessizce devam et
        console.warn(`${filename} yüklenemedi, toplam sayıma dahil edilmedi`);
      }
    }
    totalWordsCount = total;
    updateTotalWordsDisplay();
  } catch (error) {
    console.error("Toplam kelime sayısı hesaplanırken hata:", error);
    totalWordsCount = 0;
    updateTotalWordsDisplay();
  }
}

function updateTotalWordsDisplay() {
  const totalWordsElement = document.getElementById("totalWordsCount");
  if (totalWordsElement) {
    totalWordsElement.textContent = `📊 Toplam ${totalWordsCount.toLocaleString(
      "tr-TR"
    )} kelime`;
  }
}

function getDateFromDateStr(dateStr) {
  // DD.MM.YYYY formatından YYYY_MM_DD çıkar
  try {
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}_${month}_${day}`;
    }
  } catch (e) {
    console.error("Tarih parse hatası:", e);
  }
  return null;
}

async function loadWordsFromFile(filename) {
  try {
    const response = await fetch(filename);

    // 404 veya diğer hata durumlarını kontrol et
    if (!response.ok) {
      console.warn(`${filename} bulunamadı (${response.status})`);
      return [];
    }

    // Content-Type kontrolü yap
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.warn(`${filename} JSON formatında değil`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // JSON parse hatası veya network hatası
    if (error instanceof SyntaxError) {
      console.warn(
        `${filename} JSON parse hatası - dosya bulunamadı veya geçersiz format`
      );
    } else {
      console.warn(`${filename} yüklenirken hata:`, error);
    }
    return [];
  }
}

async function loadWords() {
  try {
    // Index dosyasını yükle
    const indexLoaded = await loadWordsIndex();

    if (!indexLoaded || !wordsIndex || wordsIndex.files.length === 0) {
      // Index bulunamadı
      console.error("Index dosyası bulunamadı!");
      wordsData = [];
    } else {
      // Tarih filtresine göre dosya yükle
      if (selectedDate === "all") {
        // Tüm dosyaları yükle
        wordsData = [];
        for (const filename of wordsIndex.files) {
          const fileData = await loadWordsFromFile(filename);
          wordsData = wordsData.concat(fileData);
        }
      } else if (selectedDate === "today") {
        // Bugünün tarihine göre dosya yükle
        const today = new Date();
        const todayStr = `${String(today.getDate()).padStart(2, "0")}.${String(
          today.getMonth() + 1
        ).padStart(2, "0")}.${today.getFullYear()}`;
        const dateKey = getDateFromDateStr(todayStr);
        const filename = `words_${dateKey}.json`;
        wordsData = await loadWordsFromFile(filename);
      } else {
        // Seçilen tarihe göre dosya yükle
        const dateKey = getDateFromDateStr(selectedDate);
        if (dateKey) {
          const filename = `words_${dateKey}.json`;
          wordsData = await loadWordsFromFile(filename);

          // Dosya yoksa veya boşsa kullanıcıya bilgi ver
          if (wordsData.length === 0) {
            console.info(`${selectedDate} tarihi için kelime bulunamadı.`);
          }
        } else {
          wordsData = [];
        }
      }
    }

    // Tarih filtresini sadece ilk yüklemede oluştur
    // Tarih değiştiğinde dropdown'ı yeniden oluşturmaya gerek yok
    if (!dateFilterInitialized) {
      initializeDateFilter();
      setupDateFilterListener();
      dateFilterInitialized = true;
    } else {
      // Sadece seçili değeri güncelle (eğer dropdown'da varsa)
      const dateFilter = document.getElementById("dateFilter");
      if (dateFilter) {
        const savedDateExists = Array.from(dateFilter.options).some(
          (opt) => opt.value === selectedDate
        );
        if (savedDateExists) {
          dateFilter.value = selectedDate;
        } else {
          // Eğer kaydedilmiş tarih dropdown'da yoksa, varsayılan olarak "all" seç
          dateFilter.value = "all";
          selectedDate = "all";
          saveState(); // Güncellenmiş değeri kaydet
        }
      }
    }

    applyFilters();
    renderCards();
    updateStats();
    saveState(); // Durumu kaydet (sayfa numarası dahil)
  } catch (error) {
    console.error("Dosya yüklenirken hata:", error);
    document.getElementById("cardsContainer").innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-text">Dosya yüklenirken bir hata oluştu.</div></div>';
  }
}

// ==================== DATE FILTER ====================
function initializeDateFilter() {
  const dateFilter = document.getElementById("dateFilter");

  // Mevcut seçenekleri temizle (sadece "Tümünü Göster" kalsın)
  dateFilter.innerHTML = '<option value="all">Tümünü Göster</option>';

  // Bugünün tarihini al (DD.MM.YYYY formatında)
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, "0")}.${String(
    today.getMonth() + 1
  ).padStart(2, "0")}.${today.getFullYear()}`;

  // Bugün seçeneğini ekle
  const todayOption = document.createElement("option");
  todayOption.value = "today";
  todayOption.textContent = `Bugün (${todayStr})`;
  dateFilter.appendChild(todayOption);

  // Tarih seçeneklerini oluştur
  const dateSet = new Set(); // Tekrar eden tarihleri önlemek için

  // Önce dates alanından tarihleri al
  if (wordsIndex && wordsIndex.dates && Array.isArray(wordsIndex.dates)) {
    wordsIndex.dates.forEach((dateKey) => {
      // YYYY_MM_DD formatından DD.MM.YYYY formatına çevir
      const parts = dateKey.split("_");
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        const dateStr = `${day}.${month}.${year}`;
        if (!dateSet.has(dateStr) && dateStr !== todayStr) {
          dateSet.add(dateStr);
          const option = document.createElement("option");
          option.value = dateStr;
          option.textContent = dateStr;
          dateFilter.appendChild(option);
        }
      }
    });
  }

  // Eğer dates yoksa, dosya isimlerinden tarihleri çıkar
  if (wordsIndex && wordsIndex.files && Array.isArray(wordsIndex.files)) {
    wordsIndex.files.forEach((filename) => {
      // words_YYYY_MM_DD.json formatından tarih çıkar
      const match = filename.match(/words_(\d{4})_(\d{2})_(\d{2})\.json/);
      if (match) {
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const dateStr = `${day}.${month}.${year}`;
        if (!dateSet.has(dateStr) && dateStr !== todayStr) {
          dateSet.add(dateStr);
          const option = document.createElement("option");
          option.value = dateStr;
          option.textContent = dateStr;
          dateFilter.appendChild(option);
        }
      }
    });
  }

  // Eski format (ay bazlı) - geriye dönük uyumluluk
  if (wordsIndex && wordsIndex.months && Array.isArray(wordsIndex.months)) {
    wordsIndex.months.forEach((monthKey) => {
      const parts = monthKey.split("_");
      if (parts.length === 2) {
        const year = parts[0];
        const month = parts[1];
        const dateStr = `01.${month}.${year}`;
        if (!dateSet.has(dateStr) && dateStr !== todayStr) {
          dateSet.add(dateStr);
          const option = document.createElement("option");
          option.value = dateStr;
          option.textContent = `${month}.${year}`;
          dateFilter.appendChild(option);
        }
      }
    });
  }

  // Index yoksa mevcut wordsData'dan tarihleri al
  if (wordsData && wordsData.length > 0) {
    const uniqueDates = [
      ...new Set(wordsData.map((word) => word.date).filter((date) => date)),
    ].sort();
    uniqueDates.forEach((date) => {
      if (!dateSet.has(date) && date !== todayStr) {
        dateSet.add(date);
        const option = document.createElement("option");
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
      }
    });
  }

  // Tarihleri sırala (en yeni en üstte)
  const options = Array.from(dateFilter.options);
  const allOption = options[0]; // "Tümünü Göster"
  const todayOpt = options[1]; // "Bugün"
  const dateOptions = options.slice(2).sort((a, b) => {
    // DD.MM.YYYY formatını karşılaştır
    const dateA = a.value.split(".").reverse().join("");
    const dateB = b.value.split(".").reverse().join("");
    return dateB.localeCompare(dateA); // En yeni en üstte
  });

  dateFilter.innerHTML = "";
  dateFilter.appendChild(allOption);
  if (todayOpt) dateFilter.appendChild(todayOpt);
  dateOptions.forEach((opt) => dateFilter.appendChild(opt));

  // Kaydedilmiş değeri seç (eğer dropdown'da varsa)
  const savedDateExists = Array.from(dateFilter.options).some(
    (opt) => opt.value === selectedDate
  );
  if (savedDateExists) {
    dateFilter.value = selectedDate;
  } else {
    // Eğer kaydedilmiş tarih dropdown'da yoksa, varsayılan olarak "all" seç
    dateFilter.value = "all";
    selectedDate = "all";
    saveState(); // Güncellenmiş değeri kaydet
  }
}

// Date filter event listener'ı ayrı bir fonksiyonda
function setupDateFilterListener() {
  const dateFilter = document.getElementById("dateFilter");

  // Önceki listener'ları kaldırmak için clone yap
  const newDateFilter = dateFilter.cloneNode(true);
  dateFilter.parentNode.replaceChild(newDateFilter, dateFilter);

  // Yeni listener ekle
  const finalDateFilter = document.getElementById("dateFilter");
  finalDateFilter.addEventListener("change", async (e) => {
    // Tarih değiştiğinde okumayı durdur
    if (isReadingAllExamples) {
      stopReadingAllExamples();
    }
    selectedDate = e.target.value;
    currentPage = 1;
    // Tarih değiştiğinde yeni dosyayı yükle
    await loadWords();
    saveState(); // Durumu kaydet
  });
}

// ==================== MODE SELECTION ====================
function initializeModeSelect() {
  const modeSelect = document.getElementById("modeSelect");
  const readAllExamplesGroup = document.getElementById("readAllExamplesGroup");
  const readAllExamplesBtn = document.getElementById("readAllExamplesBtn");
  const startLearningGroup = document.getElementById("startLearningGroup");
  const startLearningBtn = document.getElementById("startLearningBtn");

  // Kaydedilmiş değeri seç
  modeSelect.value = currentMode;

  // Mod değiştiğinde butonları göster/gizle
  function toggleButtons() {
    if (currentMode === "tr-examples-only") {
      if (readAllExamplesGroup) readAllExamplesGroup.style.display = "block";
      if (startLearningGroup) startLearningGroup.style.display = "none";
    } else if (currentMode === "full") {
      if (readAllExamplesGroup) readAllExamplesGroup.style.display = "none";
      if (startLearningGroup) startLearningGroup.style.display = "block";
    } else {
      if (readAllExamplesGroup) readAllExamplesGroup.style.display = "none";
      if (startLearningGroup) startLearningGroup.style.display = "none";
    }
  }

  // İlk yüklemede butonları göster/gizle
  toggleButtons();

  modeSelect.addEventListener("change", async (e) => {
    // Mod değiştiğinde okumayı durdur
    if (isReadingAllExamples) {
      stopReadingAllExamples();
    }
    if (isLearningMode) {
      stopLearningMode();
    }
    currentMode = e.target.value;
    toggleButtons();
    applyFilters(); // Filtreleri yeniden uygula (yeni mod için gerekli - bu fonksiyon sayfa numarasını kontrol eder)
    renderCards();
    saveState(); // Durumu kaydet
  });

  // Tüm cümleleri okuma butonu
  if (readAllExamplesBtn) {
    readAllExamplesBtn.addEventListener("click", () => {
      readAllEnglishExamples();
    });
  }

  // Öğrenme başlat butonu
  if (startLearningBtn) {
    startLearningBtn.addEventListener("click", () => {
      startLearningMode();
    });
  }
}

// ==================== UTILITY FUNCTIONS ====================
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==================== FILTERING ====================
function applyFilters() {
  let tempFiltered = [];

  // Eğer "Sadece Türkçe Cümle" modu seçiliyse, kelimeleri tut (cümleleri renderCards'ta işleyeceğiz)
  if (currentMode === "tr-examples-only") {
    // wordsData zaten loadWords() içinde tarih filtresine göre yüklenmiş durumda
    // Sadece examples'ı olan kelimeleri filtrele
    tempFiltered = wordsData.filter((word) => {
      return word.examples && Array.isArray(word.examples) && word.examples.length > 0;
    });
  } else {
    // Normal mod için mevcut mantık
    // Dosya zaten tarihe göre yüklendiği için sadece kopyala
    // Eğer "all" seçiliyse tüm kelimeler, değilse sadece seçilen tarihteki kelimeler
    tempFiltered = [...wordsData];

    // Ek filtreleme sadece "all" modunda gerekli değil çünkü dosya zaten tarihe göre yüklendi
    // Ama yine de kontrol edelim (güvenlik için)
    if (selectedDate === "today") {
      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2, "0")}.${String(
        today.getMonth() + 1
      ).padStart(2, "0")}.${today.getFullYear()}`;
      tempFiltered = tempFiltered.filter(
        (word) => word.date === todayStr
      );
    } else if (selectedDate !== "all") {
      // Seçilen tarihe göre filtrele (dosya zaten yüklendi ama yine de kontrol et)
      tempFiltered = tempFiltered.filter(
        (word) => word.date === selectedDate
      );
    }
  }

  // Arama filtresini uygula
  if (searchTerm && searchTerm.trim() !== "") {
    const searchLower = searchTerm.toLowerCase().trim();
    filteredWordsData = tempFiltered.filter((word) => {
      // Kelime içinde ara
      const wordMatch = word.word && word.word.toLowerCase().includes(searchLower);
      // Anlam içinde ara
      const meaningMatch = word.meaning && word.meaning.toLowerCase().includes(searchLower);
      return wordMatch || meaningMatch;
    });
  } else {
    filteredWordsData = tempFiltered;
  }

  // Sayfa numarasının geçerli olup olmadığını kontrol et
  // Yeni mod için sayfalama kelime sayısına göre, normal mod için mevcut mantık
  const totalPages = Math.ceil(filteredWordsData.length / CARDS_PER_PAGE);
  const oldPage = currentPage;
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  } else if (currentPage < 1) {
    currentPage = 1;
  }
  
  // Sayfa numarası değiştiyse kaydet
  if (oldPage !== currentPage) {
    saveState();
  }
}

// ==================== CARD RENDERING ====================
function renderCards() {
  const container = document.getElementById("cardsContainer");
  
  // Eğer "Sadece Türkçe Cümle" modu seçiliyse, kelime bazlı sayfalama yap
  if (currentMode === "tr-examples-only") {
    // Sayfa kelimelerini al (20 kelime per sayfa)
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const pageWords = filteredWordsData.slice(startIndex, endIndex);

    if (pageWords.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Bu filtreye uygun kelime bulunamadı.</div></div>';
      return;
    }

    // Bu sayfadaki kelimelerin TÜM cümlelerini topla
    const pageExamples = [];
    pageWords.forEach((word) => {
      if (word.examples && Array.isArray(word.examples) && word.examples.length > 0) {
        word.examples.forEach((example) => {
          // sentence ve meaning'in hem string hem de boş olmadığını kontrol et
          if (example && example.sentence && example.sentence.trim() !== "" && example.meaning && example.meaning.trim() !== "") {
            pageExamples.push({
              type: "example",
              trSentence: example.meaning.trim(),
              enSentence: example.sentence.trim(),
              originalWord: word.word || "",
            });
          }
        });
      }
    });

    // Cümleleri karıştır (shuffle)
    const shuffledExamples = shuffleArray(pageExamples);

    // Kartları oluştur
    container.innerHTML = shuffledExamples.map((example) => createCardHTML(example)).join("");
  } else {
    // Normal mod için mevcut mantık
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const pageData = filteredWordsData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Bu filtreye uygun kelime bulunamadı.</div></div>';
      return;
    }

    container.innerHTML = pageData.map((word) => createCardHTML(word)).join("");
  }

  // Event listener'ları ekle
  attachCardListeners();
  updatePagination();
  
  // Mod değiştiğinde butonları göster/gizle
  const readAllExamplesGroup = document.getElementById("readAllExamplesGroup");
  const startLearningGroup = document.getElementById("startLearningGroup");
  if (readAllExamplesGroup) {
    if (currentMode === "tr-examples-only") {
      readAllExamplesGroup.style.display = "block";
    } else {
      readAllExamplesGroup.style.display = "none";
    }
  }
  if (startLearningGroup) {
    if (currentMode === "full") {
      startLearningGroup.style.display = "block";
    } else {
      startLearningGroup.style.display = "none";
    }
  }
}

function createCardHTML(word) {
  // Eğer example kartıysa (yeni mod için)
  if (word.type === "example") {
    const cardId = `card-example-${Math.random().toString(36).substr(2, 9)}`;
    let cardHTML = `<div class="word-card" id="${cardId}" data-word="${word.originalWord || ""}">`;
    cardHTML += createTrExamplesModeHTML(word, "");
    cardHTML += "</div>";
    return cardHTML;
  }

  // Normal kelime kartları için
  const cardId = `card-${word.word.replace(/\s+/g, "-")}`;
  const typeClass = word.type
    ? word.type.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")
    : "";

  let cardHTML = `<div class="word-card" id="${cardId}" data-word="${word.word}">`;

  // Moda göre içerik
  if (currentMode === "full") {
    cardHTML += createFullModeHTML(word, typeClass);
  } else if (currentMode === "en-tr") {
    cardHTML += createEnTrModeHTML(word, typeClass);
  } else if (currentMode === "tr-en") {
    cardHTML += createTrEnModeHTML(word, typeClass);
  }

  // "+" butonu ekle (hatırlamadıklarım listesine ekle)
  cardHTML += `<button class="add-to-practice-btn" onclick="addWordToPractice('${word.word.replace(/'/g, "\\'")}')" title="Hatırlamadıklarım Listesine Ekle">➕</button>`;

  cardHTML += "</div>";
  return cardHTML;
}

function createFullModeHTML(word, typeClass) {
  let html = `
                <div class="card-field">
                    <div class="word-main">
                        <span class="word-text">${word.word || "-"}</span>
                        ${
                          word.word
                            ? `<button class="sound-btn" onclick="speakText('${word.word.replace(
                                /'/g,
                                "\\'"
                              )}')" title="Seslendir">🔊</button>`
                            : ""
                        }
                    </div>
                    ${
                      word.pronunciation
                        ? `<div class="pronunciation">${word.pronunciation}${word.type ? `<span class="type-badge type-${typeClass}">${word.type}</span>` : ""}</div>`
                        : word.type ? `<div class="pronunciation"><span class="type-badge type-${typeClass}">${word.type}</span></div>` : ""
                    }
                </div>
                
                ${
                  word.meaning
                    ? `<div class="card-field">
                    <div class="field-value">${word.meaning}</div>
                </div>`
                    : ""
                }
            `;

  // Fiil formları
  if (word.v2?.form || word.v3?.form || word.gerundInfinitive) {
    html += '<div class="card-field"><div class="verb-forms">';
    if (word.v2?.form) {
      html += `<div class="verb-form-item"><span class="verb-form-label">V2:</span>${
        word.v2.form
      }${
        word.v2.pronunciation
          ? ` <span style="color: #6c757d; font-style: italic;">(${word.v2.pronunciation})</span>`
          : ""
      }</div>`;
    }
    if (word.v3?.form) {
      html += `<div class="verb-form-item"><span class="verb-form-label">V3:</span>${
        word.v3.form
      }${
        word.v3.pronunciation
          ? ` <span style="color: #6c757d; font-style: italic;">(${word.v3.pronunciation})</span>`
          : ""
      }</div>`;
    }
    if (word.gerundInfinitive) {
      html += `<div class="verb-form-item"><span class="verb-form-label">Gerund/Infinitive:</span>${word.gerundInfinitive}</div>`;
    }
    html += "</div></div>";
  }

  // Örnek cümleler
  if (word.examples && word.examples.length > 0) {
    html += '<div class="card-field"><div class="examples-list">';
    word.examples.forEach((ex) => {
      html += `
                        <div class="example-item">
                            <div class="example-sentence">
                                ${ex.sentence || "-"}
                                ${
                                  ex.sentence
                                    ? `<button class="sound-btn" style="width: 28px; height: 28px; font-size: 1rem; margin-left: auto;" onclick="speakText('${(
                                        ex.sentence || ""
                                      ).replace(
                                        /'/g,
                                        "\\'"
                                      )}')" title="Seslendir">🔊</button>`
                                    : ""
                                }
                </div>
                            <div class="example-meaning">${
                              ex.meaning || "-"
                            }</div>
            </div>
                    `;
    });
    html += "</div></div>";
  }

  return html;
}

function createEnTrModeHTML(word, typeClass) {
  let html = `
                <div class="card-field">
                    <div class="word-main">
                        <span class="word-text">${word.word || "-"}</span>
                        ${
                          word.word
                            ? `<button class="sound-btn" onclick="speakText('${word.word.replace(
                                /'/g,
                                "\\'"
                              )}')" title="Seslendir">🔊</button>`
                            : ""
                        }
                    </div>
                    ${
                      word.pronunciation
                        ? `<div class="pronunciation">${word.pronunciation}${word.type ? `<span class="type-badge type-${typeClass}">${word.type}</span>` : ""}</div>`
                        : word.type ? `<div class="pronunciation"><span class="type-badge type-${typeClass}">${word.type}</span></div>` : ""
                    }
                </div>

                <div class="card-field hidden-field" data-reveal="tr">
                    <div class="field-value hidden">👆</div>
                    <div class="field-value" style="display: none;">${
                      word.meaning || "-"
                    }</div>
                </div>
            `;

  // Örnek cümleler
  if (word.examples && word.examples.length > 0) {
    html += '<div class="card-field"><div class="examples-list">';
    word.examples.forEach((ex) => {
      html += `
                        <div class="example-item">
                            <div class="example-sentence">
                                ${ex.sentence || "-"}
                                ${
                                  ex.sentence
                                    ? `<button class="sound-btn" style="width: 28px; height: 28px; font-size: 1rem; margin-left: auto;" onclick="speakText('${(
                                        ex.sentence || ""
                                      ).replace(
                                        /'/g,
                                        "\\'"
                                      )}')" title="Seslendir">🔊</button>`
                                    : ""
                                }
                </div>
                            <div class="example-meaning hidden-field" data-reveal="tr">
                                <span class="field-value hidden">👆</span>
                                <span class="field-value" style="display: none;">${
                                  ex.meaning || "-"
                                }</span>
            </div>
            </div>
                    `;
    });
    html += "</div></div>";
  }

  return html;
}

function createTrEnModeHTML(word, typeClass) {
  let html = `
              
                <div class="card-field hidden-field" data-reveal="en">
                    <div class="word-main">
                        <span class="word-text hidden">👆</span>
                        <span class="word-text" style="display: none;">${
                          word.word || "-"
                        }</span>
                        ${
                          word.word
                            ? `<button class="sound-btn" style="display: none;" onclick="speakText('${word.word.replace(
                                /'/g,
                                "\\'"
                              )}')" title="Seslendir">🔊</button>`
                            : ""
                        }
                    </div>
                    <div class="pronunciation" style="display: none;">${word.pronunciation || ""}${word.type ? `<span class="type-badge type-${typeClass}">${word.type}</span>` : ""}</div>
        </div>

                <div class="card-field">
                    <div class="field-value">${word.meaning || "-"}</div>
        </div>
            `;

  // Örnek cümleler
  if (word.examples && word.examples.length > 0) {
    html += '<div class="card-field"><div class="examples-list">';
    word.examples.forEach((ex) => {
      html += `
                        <div class="example-item">
                            <div class="example-sentence hidden-field" data-reveal="en">
                                <span class="hidden" style="display: inline;">👆</span>
                                <span class="hidden-content" style="display: none;">${
                                  ex.sentence || "-"
                                }</span>
                                ${
                                  ex.sentence
                                    ? `<button class="sound-btn hidden-content" style="width: 28px; height: 28px; font-size: 1rem; margin-left: auto; display: none;" onclick="speakText('${(
                                        ex.sentence || ""
                                      ).replace(
                                        /'/g,
                                        "\\'"
                                      )}')" title="Seslendir">🔊</button>`
                                    : ""
                                }
    </div>
                            <div class="example-meaning">${
                              ex.meaning || "-"
                            }</div>
                        </div>
                    `;
    });
    html += "</div></div>";
  }

  return html;
}

function createTrExamplesModeHTML(exampleCard, typeClass) {
  // exampleCard: { type: "example", trSentence: "...", enSentence: "...", originalWord: "..." }
  let html = `
                <div class="card-field">
                    <div class="field-value">${exampleCard.trSentence || "-"}</div>
                </div>

                <div class="card-field hidden-field" data-reveal="en">
                    <div class="field-value hidden">👆</div>
                    <div class="field-value" style="display: none;">
                        <div class="example-sentence" style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            <span style="flex: 1;">${exampleCard.enSentence || "-"}</span>
                            ${
                              exampleCard.enSentence
                                ? `<button class="sound-btn" onclick="speakText('${(exampleCard.enSentence || "").replace(
                                    /'/g,
                                    "\\'"
                                  )}')" title="Seslendir">🔊</button>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `;

  return html;
}

// ==================== CARD INTERACTIONS ====================
function attachCardListeners() {
  const cards = document.querySelectorAll(".word-card");
  cards.forEach((card) => {
    // Tap/Click
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("sound-btn")) return;
      revealHiddenFields(card);
    });

    // Long press
    card.addEventListener("touchstart", (e) => {
      if (e.target.classList.contains("sound-btn")) return;
      longPressTimer = setTimeout(() => {
        revealHiddenFields(card);
      }, LONG_PRESS_DURATION);
    }, { passive: true });

    card.addEventListener("touchend", () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });

    card.addEventListener("touchcancel", () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });

    // Mouse long press (desktop)
    card.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("sound-btn")) return;
      longPressTimer = setTimeout(() => {
        revealHiddenFields(card);
      }, LONG_PRESS_DURATION);
    });

    card.addEventListener("mouseup", () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    card.addEventListener("mouseleave", () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
  });
}

function revealHiddenFields(card) {
  card.classList.add("revealed");
  const hiddenFields = card.querySelectorAll(".hidden-field");
  hiddenFields.forEach((field) => {
    // Gizli placeholder'ları gizle
    const hiddenElements = field.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => (el.style.display = "none"));

    // Gizli içerikleri göster (hidden-content class'ı veya display: none olanlar)
    const hiddenContent = field.querySelectorAll(".hidden-content");
    hiddenContent.forEach((el) => {
      el.style.display = "";
    });

    // Tüm gizli elementleri bul ve göster (display: none olanlar, hidden class'ı olmayanlar)
    const allElements = field.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el.style.display === "none" && !el.classList.contains("hidden")) {
        // Eğer button ise inline-flex, span ise inline, diğerleri için uygun display
        if (el.classList.contains("sound-btn")) {
          el.style.display = "flex";
        } else if (el.tagName === "SPAN" || el.tagName === "DIV") {
          el.style.display = "";
        } else {
          el.style.display = "";
        }
      }
    });

    // Field'ın kendisi gizliyse göster
    if (field.style.display === "none") {
      field.style.display = "";
    }
  });
}

function resetCards() {
  // Eğer "Sadece Türkçe Cümle" modundaysa, shuffle yap (mevcut sayfada kal)
  if (currentMode === "tr-examples-only") {
    const scrollPosition = window.scrollY || window.pageYOffset;
    renderCards(); // Bu shuffle yapacak ve mevcut sayfada kalacak
    // Scroll pozisyonunu koru (DOM güncellemesi sonrası)
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  } else {
    // Normal modlarda sadece görünen kartları gizle (revealed olanları kapat)
    // revealHiddenFields'in tam tersini yap: başlangıç durumuna geri döndür
    const cards = document.querySelectorAll(".word-card.revealed");
    cards.forEach((card) => {
      card.classList.remove("revealed");
      const hiddenFields = card.querySelectorAll(".hidden-field");
      hiddenFields.forEach((field) => {
        // 1. Tüm hidden class'ı olan elementleri göster (bunlar placeholder'lar - 👆)
        // revealHiddenFields bunları gizliyor, biz gösteriyoruz
        const hiddenElements = field.querySelectorAll(".hidden");
        hiddenElements.forEach((el) => {
          if (el.tagName === "SPAN") {
            el.style.display = "inline";
          } else {
            el.style.display = "";
          }
        });
        
        // 2. revealHiddenFields'in gösterdiği tüm elementleri gizle
        // revealHiddenFields: display: none olanları gösteriyor ve sound-btn'ları gösteriyor
        // Biz: display: none olmayanları (reveal edilmiş) gizliyoruz
        
        // 2a. field-value'ları kontrol et
        const fieldValues = field.querySelectorAll(".field-value");
        fieldValues.forEach((el) => {
          if (!el.classList.contains("hidden")) {
            // 👆 değilse ve görünürse gizle (başlangıçta display: none olmalı)
            if (el.style.display !== "none" && el.textContent.trim() !== "👆") {
              el.style.display = "none";
            }
          }
        });
        
        // 2b. word-text'leri kontrol et
        const wordTexts = field.querySelectorAll(".word-text");
        wordTexts.forEach((el) => {
          if (!el.classList.contains("hidden")) {
            // 👆 değilse ve görünürse gizle (başlangıçta display: none olmalı)
            if (el.style.display !== "none" && el.textContent.trim() !== "👆") {
              el.style.display = "none";
            }
          }
        });
        
        // 2c. pronunciation elementlerini gizle
        const pronunciations = field.querySelectorAll(".pronunciation");
        pronunciations.forEach((el) => {
          if (!el.classList.contains("hidden") && el.style.display !== "none") {
            el.style.display = "none";
          }
        });
        
        // 2d. word-main içindeki elementleri kontrol et (tr-en modu için özel)
        const wordMains = field.querySelectorAll(".word-main");
        wordMains.forEach((wordMain) => {
          // word-main içindeki tüm word-text'leri kontrol et
          const wordTextsInMain = wordMain.querySelectorAll(".word-text");
          wordTextsInMain.forEach((wt) => {
            if (!wt.classList.contains("hidden")) {
              // hidden olmayan word-text'ler başlangıçta display: none olmalı
              if (wt.style.display !== "none") {
                wt.style.display = "none";
              }
            }
          });
          // word-main içindeki sound-btn'ları gizle
          const soundBtnsInMain = wordMain.querySelectorAll(".sound-btn");
          soundBtnsInMain.forEach((btn) => {
            if (btn.style.display !== "none") {
              btn.style.display = "none";
            }
          });
        });
        
        // 2e. sound-btn'ları gizle (tüm hidden-field içindeki)
        const soundButtons = field.querySelectorAll(".sound-btn");
        soundButtons.forEach((el) => {
          if (el.style.display !== "none") {
            el.style.display = "none";
          }
        });
        
        // 2g. hidden-content class'ı olan elementleri gizle
        const hiddenContents = field.querySelectorAll(".hidden-content");
        hiddenContents.forEach((el) => {
          if (el.style.display !== "none") {
            el.style.display = "none";
          }
        });
        
        // 2h. type-badge'leri gizle (eğer hidden-field içindeyse ve başlangıçta display: none ise)
        const typeBadges = field.querySelectorAll(".type-badge");
        typeBadges.forEach((el) => {
          if (!el.classList.contains("hidden") && el.style.display !== "none") {
            el.style.display = "none";
          }
        });
        
        // 2i. example-sentence içindeki hidden-content span'ları gizle (tr-en modu için)
        const exampleSentences = field.querySelectorAll(".example-sentence");
        exampleSentences.forEach((exSentence) => {
          // hidden-content class'ı olan span'ları gizle
          const hiddenContentSpans = exSentence.querySelectorAll("span.hidden-content");
          hiddenContentSpans.forEach((span) => {
            if (span.style.display !== "none") {
              span.style.display = "none";
            }
          });
          // hidden olmayan ama görünür olan span'ları kontrol et (İngilizce cümle kısmı)
          const allSpans = exSentence.querySelectorAll("span");
          allSpans.forEach((span) => {
            if (!span.classList.contains("hidden") && !span.classList.contains("hidden-content")) {
              if (span.style.display !== "none" && span.textContent.trim() !== "👆") {
                span.style.display = "none";
              }
            }
          });
        });
      });
    });
  }
}

// ==================== SPEECH API ====================
function speakText(text, lang = "en-US", onEnd = null) {
  if (!text || text === "-") {
    if (onEnd) onEnd();
    return;
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
    if (onEnd) onEnd();
  }
}

// Öğrenme modu: Mevcut sayfadaki kelimeleri sırayla okur (İngilizce kelime + Türkçe anlam)
function startLearningMode() {
  if (currentMode !== "full") {
    return;
  }

  const startLearningBtn = document.getElementById("startLearningBtn");
  const originalText = "🎓 Öğrenme Başlat";

  // Eğer zaten öğrenme modu devam ediyorsa, durdur
  if (isLearningMode) {
    stopLearningMode();
    return;
  }

  // Mevcut sayfadaki kelimeleri al
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  currentPageWords = filteredWordsData.slice(startIndex, endIndex);

  if (currentPageWords.length === 0) {
    alert("Bu sayfada okunacak kelime bulunamadı.");
    return;
  }

  isLearningMode = true;
  currentLearningIndex = 0;
  startLearningBtn.textContent = "⏹️ Durdur";

  // İlk kelimeyi oku
  readNextWord();
}

function readNextWord() {
  if (!isLearningMode || currentLearningIndex >= currentPageWords.length) {
    stopLearningMode();
    return;
  }

  const word = currentPageWords[currentLearningIndex];
  
  if (!word || !word.word) {
    currentLearningIndex++;
    setTimeout(() => readNextWord(), 500);
    return;
  }

  const englishWord = word.word.trim();
  const turkishMeaning = word.meaning ? word.meaning.trim() : "";

  // Önce İngilizce kelimeyi oku
  speakText(englishWord, "en-US", () => {
    // İngilizce kelime bittikten sonra kısa bir bekleme
    setTimeout(() => {
      if (!isLearningMode) return;
      
      // Sonra Türkçe anlamı oku
      if (turkishMeaning && turkishMeaning !== "-") {
        speakText(turkishMeaning, "tr-TR", () => {
          // Türkçe anlam bittikten sonra bir sonraki kelimeye geç
          setTimeout(() => {
            if (!isLearningMode) return;
            currentLearningIndex++;
            readNextWord();
          }, 800); // Kelimeler arası bekleme
        });
      } else {
        // Anlam yoksa direkt bir sonraki kelimeye geç
        setTimeout(() => {
          if (!isLearningMode) return;
          currentLearningIndex++;
          readNextWord();
        }, 800);
      }
    }, 500); // İngilizce ve Türkçe arası bekleme
  });
}

function stopLearningMode() {
  isLearningMode = false;
  currentLearningIndex = 0;
  
  // Timeout'u temizle
  if (learningTimeoutId) {
    clearTimeout(learningTimeoutId);
    learningTimeoutId = null;
  }
  
  // Konuşmayı durdur
  window.speechSynthesis.cancel();
  
  // Butonu güncelle
  const startLearningBtn = document.getElementById("startLearningBtn");
  if (startLearningBtn) {
    startLearningBtn.textContent = "🎓 Öğrenme Başlat";
  }
}

// Tüm İngilizce cümleleri sırasıyla okuma fonksiyonu
function readAllEnglishExamples() {
  if (currentMode !== "tr-examples-only") {
    return;
  }

  const readAllBtn = document.getElementById("readAllExamplesBtn");
  const originalText = "🔊 Tüm İngilizce Cümleleri Oku";

  // Eğer zaten okuma devam ediyorsa, durdur
  if (isReadingAllExamples) {
    stopReadingAllExamples();
    return;
  }

  // Mevcut sayfadaki tüm kartları bul
  const cards = document.querySelectorAll(".word-card");
  if (cards.length === 0) {
    return;
  }

  // Her karttan İngilizce cümleyi çıkar
  const englishSentences = [];
  cards.forEach((card) => {
    const hiddenField = card.querySelector('.hidden-field[data-reveal="en"]');
    if (hiddenField) {
      // İngilizce cümle .field-value içindeki .example-sentence > span'de
      const fieldValue = hiddenField.querySelector(".field-value:not(.hidden)");
      if (fieldValue) {
        const exampleSentenceDiv = fieldValue.querySelector(".example-sentence");
        if (exampleSentenceDiv) {
          const sentenceSpan = exampleSentenceDiv.querySelector("span");
          if (sentenceSpan) {
            const sentence = sentenceSpan.textContent.trim();
            if (sentence && sentence !== "-" && sentence !== "👆") {
              englishSentences.push(sentence);
            }
          }
        }
      }
    }
  });

  if (englishSentences.length === 0) {
    alert("Okunacak İngilizce cümle bulunamadı.");
    return;
  }

  // Okuma durumunu başlat
  isReadingAllExamples = true;
  readAllBtn.textContent = "⏹️ Durdur";
  readAllBtn.disabled = false;

  // Cümleleri sırasıyla oku
  let currentIndex = 0;
  const DELAY_BETWEEN_SENTENCES = 1500; // 1.5 saniye bekleme

  function speakNextSentence() {
    // Eğer durdurulduysa devam etme
    if (!isReadingAllExamples) {
      return;
    }

    if (currentIndex >= englishSentences.length) {
      // Tüm cümleler okundu, butonu tekrar aktif et
      isReadingAllExamples = false;
      readAllBtn.disabled = false;
      readAllBtn.textContent = originalText;
      return;
    }

    const sentence = englishSentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Cümle bittiğinde bir sonrakine geç
    utterance.onend = () => {
      if (!isReadingAllExamples) {
        return;
      }
      currentIndex++;
      // Kısa bir bekleme sonrası bir sonraki cümleyi oku
      readAllTimeoutId = setTimeout(() => {
        speakNextSentence();
      }, DELAY_BETWEEN_SENTENCES);
    };

    // Hata durumunda da devam et
    utterance.onerror = () => {
      if (!isReadingAllExamples) {
        return;
      }
      currentIndex++;
      readAllTimeoutId = setTimeout(() => {
        speakNextSentence();
      }, DELAY_BETWEEN_SENTENCES);
    };

    window.speechSynthesis.speak(utterance);
  }

  // Önce mevcut konuşmaları durdur
  window.speechSynthesis.cancel();
  
  // İlk cümleyi oku
  speakNextSentence();
}

// Okumayı durdurma fonksiyonu
function stopReadingAllExamples() {
  isReadingAllExamples = false;
  
  // Bekleme timeout'unu iptal et
  if (readAllTimeoutId) {
    clearTimeout(readAllTimeoutId);
    readAllTimeoutId = null;
  }
  
  // Konuşmayı durdur
  window.speechSynthesis.cancel();
  
  // Butonu güncelle
  const readAllBtn = document.getElementById("readAllExamplesBtn");
  if (readAllBtn) {
    readAllBtn.textContent = "🔊 Tüm İngilizce Cümleleri Oku";
    readAllBtn.disabled = false;
  }
}

// ==================== PAGINATION ====================
function updatePagination() {
  const totalPages = Math.ceil(filteredWordsData.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE + 1;
  const endIndex = Math.min(
    currentPage * CARDS_PER_PAGE,
    filteredWordsData.length
  );

  // Yeni mod için sayfalama text'i
  let paginationText;
  if (currentMode === "tr-examples-only") {
    // Sayfadaki kelimelerin cümlelerini say
    const pageWords = filteredWordsData.slice(startIndex - 1, endIndex);
    let pageExampleCount = 0;
    pageWords.forEach((word) => {
      if (word.examples && Array.isArray(word.examples)) {
        pageExampleCount += word.examples.filter((ex) => 
          ex && ex.sentence && ex.sentence.trim() !== "" && ex.meaning && ex.meaning.trim() !== ""
        ).length;
      }
    });
    
    // Toplam cümle sayısını hesapla
    let totalExamples = 0;
    filteredWordsData.forEach((word) => {
      if (word.examples && Array.isArray(word.examples)) {
        totalExamples += word.examples.filter((ex) => 
          ex && ex.sentence && ex.sentence.trim() !== "" && ex.meaning && ex.meaning.trim() !== ""
        ).length;
      }
    });
    
    paginationText = `Sayfa ${currentPage} / ${totalPages} (${startIndex}-${endIndex}. kelimeler, ${pageExampleCount} cümle / Toplam ${filteredWordsData.length} kelime, ${totalExamples} cümle)`;
  } else {
    paginationText = `Sayfa ${currentPage} / ${totalPages} (${startIndex}-${endIndex} / ${filteredWordsData.length})`;
  }
  
  // Yukarıdaki pagination
  const paginationInfoTop = document.getElementById("paginationInfoTop");
  if (paginationInfoTop) {
    paginationInfoTop.textContent = paginationText;
  }
  
  // Aşağıdaki pagination
  document.getElementById("paginationInfo").textContent = paginationText;

  // Yukarıdaki butonlar
  const prevBtnTop = document.getElementById("prevBtnTop");
  const nextBtnTop = document.getElementById("nextBtnTop");
  if (prevBtnTop) prevBtnTop.disabled = currentPage === 1;
  if (nextBtnTop) nextBtnTop.disabled = currentPage >= totalPages;

  // Aşağıdaki butonlar
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function initializePagination() {
  // Sayfa değiştirme fonksiyonu
  const goToPage = (direction) => {
    // Sayfa değiştiğinde okumayı durdur
    if (isReadingAllExamples) {
      stopReadingAllExamples();
    }
    if (isLearningMode) {
      stopLearningMode();
    }
    
    const totalPages = Math.ceil(filteredWordsData.length / CARDS_PER_PAGE);
    if (direction === "prev" && currentPage > 1) {
      currentPage--;
      renderCards();
      window.scrollTo({ top: 0, behavior: "smooth" });
      saveState();
    } else if (direction === "next" && currentPage < totalPages) {
      currentPage++;
      renderCards();
      window.scrollTo({ top: 0, behavior: "smooth" });
      saveState();
    }
  };

  // Yukarıdaki butonlar
  const prevBtnTop = document.getElementById("prevBtnTop");
  const nextBtnTop = document.getElementById("nextBtnTop");
  if (prevBtnTop) {
    prevBtnTop.addEventListener("click", () => goToPage("prev"));
  }
  if (nextBtnTop) {
    nextBtnTop.addEventListener("click", () => goToPage("next"));
  }

  // Aşağıdaki butonlar
  document.getElementById("prevBtn").addEventListener("click", () => goToPage("prev"));
  document.getElementById("nextBtn").addEventListener("click", () => goToPage("next"));
}

// ==================== STATS ====================
function updateStats() {
  const statsDiv = document.getElementById("stats");
  
  // Yeni mod için farklı hesaplama
  if (currentMode === "tr-examples-only") {
    // Toplam cümle sayısını hesapla
    let totalExamples = 0;
    filteredWordsData.forEach((word) => {
      if (word.examples && Array.isArray(word.examples)) {
        totalExamples += word.examples.filter((ex) => 
          ex && ex.sentence && ex.sentence.trim() !== "" && ex.meaning && ex.meaning.trim() !== ""
        ).length;
      }
    });
    
    const wordCount = filteredWordsData.length;
    let statsText = `Toplam ${wordCount} kelime, ${totalExamples} cümle`;
    if (selectedDate !== "all") {
      statsText += ` | Filtrelenmiş: ${wordCount} kelime, ${totalExamples} cümle`;
    }
    statsDiv.textContent = statsText;
    return;
  }
  
  // Normal modlar için
  const totalWords = wordsData.length;
  const filteredCount = filteredWordsData.length;

  let statsText = `Toplam ${totalWords} kelime`;
  if (selectedDate !== "all") {
    statsText += ` | Filtrelenmiş: ${filteredCount} kelime`;
  } else {
    statsText += ` | Gösterilen: ${filteredCount} kelime`;
  }

  statsDiv.textContent = statsText;
}

// ==================== RESET BUTTON ====================
function initializeResetButton() {
  // Yukarıdaki buton
  const resetBtnTop = document.getElementById("resetCardsBtnTop");
  if (resetBtnTop) {
    resetBtnTop.addEventListener("click", () => {
      if (isReadingAllExamples) {
        stopReadingAllExamples();
      }
      if (isLearningMode) {
        stopLearningMode();
      }
      resetCards();
    });
  }
  
  // Aşağıdaki buton
  const resetBtn = document.getElementById("resetCardsBtn");
  if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (isReadingAllExamples) {
      stopReadingAllExamples();
    }
    if (isLearningMode) {
      stopLearningMode();
    }
    resetCards();
  });
}
}

// ==================== CARDS PER PAGE ====================
function initializeCardsPerPage() {
  const cardsPerPageSelect = document.getElementById("cardsPerPageSelect");
  if (!cardsPerPageSelect) return;

  // Kaydedilmiş değeri seç
  cardsPerPageSelect.value = CARDS_PER_PAGE;

  cardsPerPageSelect.addEventListener("change", (e) => {
    const newValue = parseInt(e.target.value);
    if (newValue && newValue > 0) {
      CARDS_PER_PAGE = newValue;
      currentPage = 1; // Sayfa başına kart değişince ilk sayfaya dön
      applyFilters();
      renderCards();
      saveState();
    }
  });
}

// ==================== SEARCH ====================
function initializeSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  let searchTimeout = null;

  searchInput.addEventListener("input", (e) => {
    // Debounce - kullanıcı yazmayı bıraktıktan 300ms sonra arama yap
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      searchTerm = e.target.value.trim();
      currentPage = 1; // Arama yapınca ilk sayfaya dön
      applyFilters();
      renderCards();
    }, 300);
  });

  // Enter'a basınca hemen ara
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTerm = e.target.value.trim();
      currentPage = 1;
      applyFilters();
      renderCards();
    }
  });
}

// ==================== ADD TO PRACTICE ====================
async function addWordToPractice(wordText) {
  // Kelimeyi wordsData'dan bul
  const word = wordsData.find(w => w.word === wordText);
  
  if (!word) {
    alert("Kelime bulunamadı!");
    return;
  }

  try {
    // IndexedDB'ye ekle
    const DB_NAME = "WordsPracticeDB";
    const DB_VERSION = 1;
    const STORE_NAME = "practiceWords";

    // DB'yi aç
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
          objectStore.createIndex("word", "word", { unique: false });
        }
      };
    });

    // Aynı kelime zaten var mı kontrol et
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("word");
    const existingRequest = index.getAll(word.word);

    await new Promise((resolve, reject) => {
      existingRequest.onsuccess = () => {
        const existing = existingRequest.result;
        if (existing.length > 0) {
          // alert("Bu kelime zaten listede!");
          resolve();
          return;
        }

        // İlk cümleyi al
        const example = word.examples && word.examples.length > 0 
          ? {
              sentence: word.examples[0].sentence,
              meaning: word.examples[0].meaning
            }
          : null;

        const practiceWord = {
          word: word.word,
          pronunciation: word.pronunciation || "",
          meaning: word.meaning || "",
          example: example,
          addedAt: new Date().toISOString()
        };

        const addRequest = store.add(practiceWord);
        addRequest.onsuccess = () => {
          // alert("✓ Kelime hatırlamadıklarım listesine eklendi!");
          resolve();
        };
        addRequest.onerror = () => reject(addRequest.error);
      };
      existingRequest.onerror = () => reject(existingRequest.error);
    });
  } catch (error) {
    console.error("Kelime eklenirken hata:", error);
    alert("Kelime eklenirken bir hata oluştu!");
  }
}

// ==================== INITIALIZATION ====================
async function init() {
  loadState(); // İlk yüklemede kaydedilmiş durumu yükle
  
  initializeModeSelect();
  initializeCardsPerPage();
  initializeSearch();
  initializePagination();
  initializeResetButton();
  await loadWords();
  
  // Tarih filtresinin değerini tekrar kontrol et ve kaydet
  // loadWords() içinde initializeDateFilter() çağrılıyor ama 
  // bazen selectedDate değeri dropdown'da olmayabilir
  const dateFilter = document.getElementById("dateFilter");
  if (dateFilter) {
    // Eğer dropdown'da selectedDate varsa ve değer farklıysa güncelle
    const savedDateExists = Array.from(dateFilter.options).some(
      (opt) => opt.value === selectedDate
    );
    if (savedDateExists && dateFilter.value !== selectedDate) {
      dateFilter.value = selectedDate;
      saveState();
    } else if (!savedDateExists && selectedDate !== "all") {
      // Eğer kaydedilmiş tarih dropdown'da yoksa, "all" seç ve kaydet
      dateFilter.value = "all";
      selectedDate = "all";
      saveState();
    }
  }

  // Kart sayısı seçici değerini güncelle
  const cardsPerPageSelect = document.getElementById("cardsPerPageSelect");
  if (cardsPerPageSelect) {
    cardsPerPageSelect.value = CARDS_PER_PAGE;
  }
}

// Sayfa yüklendiğinde başlat
init();
