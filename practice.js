// ==================== INDEXEDDB HELPERS ====================
const DB_NAME = "WordsPracticeDB";
const DB_VERSION = 1;
const STORE_NAME = "practiceWords";

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("word", "word", { unique: false });
      }
    };
  });
}

async function addWordToPractice(wordData) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Aynı kelime zaten var mı kontrol et
    const index = store.index("word");
    const request = index.getAll(wordData.word);

    request.onsuccess = () => {
      const existing = request.result;
      if (existing.length > 0) {
        resolve({ success: false, message: "Kelime zaten listede" });
        return;
      }

      // İlk cümleyi al
      const example = wordData.examples && wordData.examples.length > 0 
        ? {
            sentence: wordData.examples[0].sentence,
            meaning: wordData.examples[0].meaning
          }
        : null;

      const practiceWord = {
        word: wordData.word,
        pronunciation: wordData.pronunciation || "",
        meaning: wordData.meaning || "",
        example: example,
        addedAt: new Date().toISOString()
      };

      const addRequest = store.add(practiceWord);

      addRequest.onsuccess = () => {
        resolve({ success: true, id: addRequest.result });
      };

      addRequest.onerror = () => {
        reject(addRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getAllPracticeWords() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function deletePracticeWord(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve({ success: true });
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function clearAllPracticeWords() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve({ success: true });
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ==================== GLOBAL STATE ====================
let practiceWords = [];
let currentMode = "en-tr"; // "en-tr" or "tr-en"
let swipeStartX = null;
let swipeStartY = null;

// ==================== RENDERING ====================
function renderPracticeWords() {
  const container = document.getElementById("practiceContainer");
  
  if (practiceWords.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">Henüz kelime eklenmemiş. Ana sayfadan kelime ekleyin.</div></div>';
    return;
  }

  container.innerHTML = practiceWords.map((word, index) => {
    const isEnTrMode = currentMode === "en-tr";
    const cardHTML = isEnTrMode ? createEnTrCardHTML(word) : createTrEnCardHTML(word);
    
    return `<div class="practice-card" data-id="${word.id}" data-index="${index}">${cardHTML}</div>`;
  }).join("");

  // Swipe event listeners ekle
  attachSwipeListeners();
  attachClickListeners();
  
  // Kelime sayısını güncelle
  updateWordCount();
}

function updateWordCount() {
  const wordCountEl = document.getElementById("wordCount");
  if (wordCountEl) {
    wordCountEl.textContent = `${practiceWords.length} kelime`;
  }
}

function createEnTrCardHTML(word) {
  const exampleSentence = word.example ? word.example.sentence.replace(/'/g, "\\'") : "";
  return `
    <div class="practice-card-inner">
      <div class="practice-card-content">
        <div class="practice-word-main">
          <span class="practice-word-text">${word.word}</span>
          <button class="practice-sound-btn" onclick="speakPracticeWord('${word.word.replace(/'/g, "\\'")}')" title="Seslendir">🔊</button>
        </div>
        ${word.pronunciation ? `<div class="practice-pronunciation">${word.pronunciation}</div>` : ""}
      </div>
      <div class="practice-card-hidden" style="display: none;">
        <div class="practice-meaning">${word.meaning}</div>
        ${word.example ? `
          <div class="practice-example">
            <div class="practice-example-en" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <span>${word.example.sentence}</span>
              <button class="practice-sound-btn" style="flex-shrink: 0;" onclick="speakPracticeWord('${exampleSentence}')" title="Cümleyi Seslendir">🔊</button>
            </div>
            <div class="practice-example-tr">${word.example.meaning}</div>
          </div>
        ` : ""}
      </div>
      <div class="practice-card-placeholder">👆 Anlamı görmek için tıkla</div>
    </div>
  `;
}

function createTrEnCardHTML(word) {
  const exampleSentence = word.example ? word.example.sentence.replace(/'/g, "\\'") : "";
  return `
    <div class="practice-card-inner">
      <div class="practice-card-content">
        <div class="practice-meaning">${word.meaning}</div>
        ${word.example ? `
          <div class="practice-example">
            <div class="practice-example-tr">${word.example.meaning}</div>
          </div>
        ` : ""}
      </div>
      <div class="practice-card-hidden" style="display: none;">
        <div class="practice-word-main">
          <span class="practice-word-text">${word.word}</span>
          <button class="practice-sound-btn" onclick="speakPracticeWord('${word.word.replace(/'/g, "\\'")}')" title="Seslendir">🔊</button>
        </div>
        ${word.pronunciation ? `<div class="practice-pronunciation">${word.pronunciation}</div>` : ""}
        ${word.example ? `
          <div class="practice-example">
            <div class="practice-example-en" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <span>${word.example.sentence}</span>
              <button class="practice-sound-btn" style="flex-shrink: 0;" onclick="speakPracticeWord('${exampleSentence}')" title="Cümleyi Seslendir">🔊</button>
            </div>
          </div>
        ` : ""}
      </div>
      <div class="practice-card-placeholder">👆 Kelimeyi görmek için tıkla</div>
    </div>
  `;
}

function attachClickListeners() {
  document.querySelectorAll(".practice-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // Buton tıklaması değilse
      if (e.target.tagName !== "BUTTON") {
        toggleCard(card);
      }
    });
  });
}

function toggleCard(card) {
  const hidden = card.querySelector(".practice-card-hidden");
  const placeholder = card.querySelector(".practice-card-placeholder");
  
  if (hidden.style.display === "none") {
    hidden.style.display = "block";
    placeholder.style.display = "none";
  } else {
    hidden.style.display = "none";
    placeholder.style.display = "block";
  }
}

function attachSwipeListeners() {
  document.querySelectorAll(".practice-card").forEach(card => {
    let startX = null;
    let startY = null;
    let currentX = 0;

    card.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
      card.style.transition = "none";
    }, { passive: true });

    card.addEventListener("touchmove", (e) => {
      if (startX === null) return;
      
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = Math.abs(e.touches[0].clientY - startY);

      // Sadece yatay hareket varsa
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
        // Sadece sola sürükleme izin ver
        if (deltaX < 0) {
          currentX = deltaX;
          card.style.transform = `translateX(${currentX}px)`;
        }
      }
    }, { passive: false });

    card.addEventListener("touchend", () => {
      card.style.transition = "transform 0.3s ease";
      
      // Eğer sola sürükleme yeterliyse sil
      if (currentX < -100) {
        const id = parseInt(card.dataset.id);
        deleteWord(id);
      } else {
        // Geri getir
        card.style.transform = "translateX(0)";
      }
      
      startX = null;
      startY = null;
      currentX = 0;
    }, { passive: true });
  });
}

async function deleteWord(id) {
  try {
    await deletePracticeWord(id);
    await loadPracticeWords();
    renderPracticeWords();
  } catch (error) {
    console.error("Kelime silinirken hata:", error);
  }
}

async function clearAllWords() {
  if (!confirm("Tüm kelimeleri silmek istediğinizden emin misiniz?")) {
    return;
  }

  try {
    await clearAllPracticeWords();
    await loadPracticeWords();
    renderPracticeWords();
  } catch (error) {
    console.error("Kelimeler silinirken hata:", error);
  }
}

// ==================== SPEECH ====================
function speakPracticeWord(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
}

// ==================== MODE SELECTION ====================
function initializeModeSelect() {
  const modeSelect = document.getElementById("modeSelect");
  if (!modeSelect) return;

  modeSelect.value = currentMode;

  modeSelect.addEventListener("change", (e) => {
    currentMode = e.target.value;
    renderPracticeWords();
  });
}

// ==================== DATA LOADING ====================
async function loadPracticeWords() {
  try {
    await initDB();
    practiceWords = await getAllPracticeWords();
  } catch (error) {
    console.error("Kelimeler yüklenirken hata:", error);
    practiceWords = [];
  }
}

// ==================== CLEAR ALL ====================
function initializeClearAll() {
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (!clearAllBtn) return;

  clearAllBtn.addEventListener("click", () => {
    clearAllWords();
  });
}

// ==================== INITIALIZATION ====================
async function init() {
  await loadPracticeWords();
  initializeModeSelect();
  initializeClearAll();
  renderPracticeWords();
}

// Sayfa yüklendiğinde init çağır
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
