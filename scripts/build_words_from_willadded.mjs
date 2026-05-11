/**
 * willaddednewwords.txt (JSON flashcard export) -> words_YYYY_MM_DD.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const INPUT = path.join(root, "willaddednewwords.txt");

/** DD.MM.YYYY -> words_YYYY_MM_DD.json */
function defaultOutFromDate(dateTr) {
  const [d, m, y] = dateTr.split(".").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  return path.join(root, `words_${y}_${pad(m)}_${pad(d)}.json`);
}

const argDate = process.argv[2];
const argOut = process.argv[3];
const DATE_TR = argDate && /^\d{2}\.\d{2}\.\d{4}$/.test(argDate) ? argDate : "11.05.2026";
const OUT = argOut ? path.resolve(argOut) : defaultOutFromDate(DATE_TR);

const TOKEN_PRON = {
  a: "e",
  about: "ebaut",
  addition: "edişın",
  adj: "ec",
  adv: "adv",
  age: "eyc",
  all: "ol",
  also: "olsou",
  apart: "apart",
  as: "ez",
  because: "bikoz",
  but: "bat",
  by: "bay",
  case: "keys",
  comes: "kamz",
  concerning: "kınsörniğ",
  consequence: "kansikvens",
  considering: "kınsidıriğ",
  contrast: "kantrast",
  contrary: "kantreri",
  despite: "dispayt",
  even: "ivın",
  except: "iksept",
  fact: "fakt",
  far: "far",
  for: "for",
  from: "from",
  given: "givın",
  grounds: "graundz",
  help: "help",
  how: "hau",
  however: "hav evır",
  if: "if",
  in: "in",
  inasmuch: "inazmaç",
  indeed: "indid",
  instead: "insted",
  ir: "ir",
  irrespective: "iristpektiv",
  is: "iz",
  it: "it",
  likewise: "layk vays",
  matter: "mater",
  means: "minz",
  namely: "neympli",
  no: "nou",
  notably: "noudebli",
  of: "ov",
  on: "on",
  other: "adr",
  particularly: "partikyularli",
  pertaining: "pıteyniğ",
  regardless: "rigardles",
  regard: "rigard",
  regarding: "rigardiğ",
  regards: "rigardz",
  respect: "rispekt",
  result: "rizalt",
  saving: "seyviğ",
  seeing: "siyiğ",
  similarly: "similerli",
  since: "sins",
  so: "sou",
  specifically: "spesifikli",
  spite: "spayt",
  such: "saç",
  than: "den",
  that: "dt",
  the: "dı",
  though: "dou",
  through: "tru",
  time: "taym",
  to: "tu",
  up: "ap",
  via: "vaya",
  when: "ven",
  with: "viz",
  words: "vords",
  especially: "ispeli",
  actually: "akçuali",
};

function stripTermForWord(term) {
  let t = term.replace(/^\*/, "").trim();
  const paren = t.match(/\(([^)]*)\)\s*$/);
  if (paren) {
    const inner = paren[1];
    if (/[ğüşöçıİıĞÜŞÖÇ]|[a-z]{1,3}\s*başka|anlam/i.test(inner)) {
      t = t.replace(/\s*\([^)]*\)\s*$/, "").trim();
    } else {
      const innerClean = inner.replace(/[^a-zA-Z\s]/g, " ").trim();
      const base = t.replace(/\s*\([^)]*\)\s*$/, "").trim();
      t = `${base} ${innerClean}`.trim();
    }
  }
  return t.replace(/\s+/g, " ").toLowerCase();
}

function grammarToType(g) {
  const m = {
    EDAT: "Edat",
    BAĞLAÇ: "İfade",
    "CÜMLE ZARFI": "Zarf",
    "AÇIKLAMA ZARFI": "Zarf",
    FANTBOYS: "İfade",
    "PARALEL YAPI": "İfade",
    "BAĞLAÇ / EDAT": "İfade",
    "BAĞLAÇ / EDAT / CÜMLE ZARFI": "İfade",
    "BAĞLAÇ / CÜMLE ZARFI": "İfade",
    "BAĞLAÇ / CÜMLE ZARFI / EDAT": "İfade",
    "CÜMLE BAŞINDA DEVRİK": "İfade",
  };
  return m[g] || "İfade";
}

function meaningFromTr(s) {
  return s
    .replace(/\s*●\s*/g, "; ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr-TR");
}

function fallbackPron(w) {
  if (!w || w.length < 2) return w;
  return w
    .replace(/ph/gi, "f")
    .replace(/th(?![r])/gi, "z")
    .replace(/ch/gi, "ç")
    .replace(/sh/gi, "ş")
    .replace(/wh/gi, "v")
    .replace(/qu/gi, "kv")
    .replace(/oo/gi, "u")
    .replace(/ee/gi, "i")
    .replace(/ea/gi, "i")
    .replace(/ou/gi, "au")
    .replace(/ow/gi, "au")
    .replace(/igh/gi, "ay")
    .replace(/tion/gi, "şın")
    .replace(/sion/gi, "jın")
    .replace(/ture/gi, "çır");
}

function pronouncePhrase(phrase) {
  const words = phrase
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return words
    .map((w) => {
      const key = w.replace(/[^a-z']/g, "");
      if (TOKEN_PRON[key]) return TOKEN_PRON[key];
      return fallbackPron(key);
    })
    .filter(Boolean)
    .join(" ");
}

const raw = fs.readFileSync(INPUT, "utf8").trim();
if (!raw.startsWith("{")) {
  console.error("Beklenen JSON; kelime=anlam satırları değil.");
  process.exit(1);
}

const data = JSON.parse(raw);
const items = data.items || [];

const out = items.map((it) => {
  const word = stripTermForWord(it.term);
  const pronunciation = pronouncePhrase(word);
  const meaning = meaningFromTr(it.meaningTr || "");

  return {
    word,
    pronunciation,
    type: grammarToType(it.grammar),
    meaning,
    v2: { form: null, pronunciation: null },
    v3: { form: null, pronunciation: null },
    gerundInfinitive: null,
    examples: [
      {
        sentence: it.contextEn,
        meaning: it.contextTr,
      },
    ],
    date: DATE_TR,
  };
});

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("Yazıldı:", OUT, "tarih:", DATE_TR, "öğe:", out.length);
