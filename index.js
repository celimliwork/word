// ==================== GLOBAL STATE ====================
let wordsData = [];
let filteredWordsData = [];
let currentPage = 1;
const CARDS_PER_PAGE = 20;
let currentMode = "full";
let selectedDate = "all";
let longPressTimer = null;
const LONG_PRESS_DURATION = 500;
const STORAGE_KEY = "wordCardAppState";

// ==================== LOCALSTORAGE ====================
function saveState() {
  const state = {
    currentMode: currentMode,
    selectedDate: selectedDate,
    currentPage: currentPage,
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

  // Kaydedilmiş değeri seç
  modeSelect.value = currentMode;

  modeSelect.addEventListener("change", (e) => {
    currentMode = e.target.value;
    currentPage = 1;
    renderCards();
    saveState(); // Durumu kaydet
  });
}

// ==================== FILTERING ====================
function applyFilters() {
  // Dosya zaten tarihe göre yüklendiği için sadece kopyala
  // Eğer "all" seçiliyse tüm kelimeler, değilse sadece seçilen tarihteki kelimeler
  filteredWordsData = [...wordsData];

  // Ek filtreleme sadece "all" modunda gerekli değil çünkü dosya zaten tarihe göre yüklendi
  // Ama yine de kontrol edelim (güvenlik için)
  if (selectedDate === "today") {
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, "0")}.${String(
      today.getMonth() + 1
    ).padStart(2, "0")}.${today.getFullYear()}`;
    filteredWordsData = filteredWordsData.filter(
      (word) => word.date === todayStr
    );
  } else if (selectedDate !== "all") {
    // Seçilen tarihe göre filtrele (dosya zaten yüklendi ama yine de kontrol et)
    filteredWordsData = filteredWordsData.filter(
      (word) => word.date === selectedDate
    );
  }

  // Sayfa numarasının geçerli olup olmadığını kontrol et
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
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const pageData = filteredWordsData.slice(startIndex, endIndex);

  if (pageData.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Bu filtreye uygun kelime bulunamadı.</div></div>';
    return;
  }

  container.innerHTML = pageData.map((word) => createCardHTML(word)).join("");

  // Event listener'ları ekle
  attachCardListeners();
  updatePagination();
}

function createCardHTML(word) {
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

  cardHTML += "</div>";
  return cardHTML;
}

function createFullModeHTML(word, typeClass) {
  let html = `
                ${
                  word.type
                    ? `<span class="type-badge type-${typeClass}">${word.type}</span>`
                    : ""
                }
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
                        ? `<div class="pronunciation">${word.pronunciation}</div>`
                        : ""
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
                ${
                  word.type
                    ? `<span class="type-badge type-${typeClass}">${word.type}</span>`
                    : ""
                }
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
                        ? `<div class="pronunciation">${word.pronunciation}</div>`
                        : ""
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
                ${
                  word.type
                    ? `<span class="type-badge type-${typeClass} hidden-field" data-reveal="en" style="display: none;">${word.type}</span>`
                    : ""
                }
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
                    <div class="pronunciation" style="display: none;">${
                      word.pronunciation || ""
                    }</div>
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
  // Kartları yeniden render et - bu şekilde tüm kartlar orijinal gizli durumlarına döner
  const scrollPosition = window.scrollY || window.pageYOffset;
  renderCards();
  // Scroll pozisyonunu koru (DOM güncellemesi sonrası)
  setTimeout(() => {
    window.scrollTo(0, scrollPosition);
  }, 0);
}

// ==================== SPEECH API ====================
function speakText(text) {
  if (!text || text === "-") return;

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Tarayıcınız seslendirme özelliğini desteklemiyor.");
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

  const paginationText = `Sayfa ${currentPage} / ${totalPages} (${startIndex}-${endIndex} / ${filteredWordsData.length})`;
  
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
      resetCards();
    });
  }
  
  // Aşağıdaki buton
  const resetBtn = document.getElementById("resetCardsBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetCards();
    });
  }
}

// ==================== INITIALIZATION ====================
async function init() {
  loadState(); // İlk yüklemede kaydedilmiş durumu yükle
  
  initializeModeSelect();
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
}

// Sayfa yüklendiğinde başlat
init();
