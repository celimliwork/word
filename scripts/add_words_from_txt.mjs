/**
 * willaddednewwords.txt (düzensiz kelime=anlam) -> words_YYYY_MM_DD.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DATE_TR = process.argv[2] || "15.05.2026";
const [d, m, y] = DATE_TR.split(".").map(Number);
const pad = (n) => String(n).padStart(2, "0");
const OUT = path.join(root, `words_${y}_${pad(m)}_${pad(d)}.json`);

const EN_LINE =
  /^[a-z][a-z\s,'-]*$/i;
const TR_LINE =
  /[ğüşıöçĞÜŞİÖÇ]|ihtiyat|bilgi|onay|kendin|umut|iyimser|kötü|gerçek|deng|önyarg|yüzey|taraf|hoşgör|eleştir|destek|şüphe|umursa|iğnele|takdir|cahil|önemse/i;

/** @type {{word:string, meaning:string}[]} */
const PAIRS = [
  { word: "cautious", meaning: "ihtiyatlı, tedbirli" },
  { word: "informative", meaning: "bilgilendirici" },
  { word: "ignorant", meaning: "cahil, bilgisiz" },
  { word: "disapproving", meaning: "onaylamayan" },
  { word: "assured", meaning: "kendinden emin" },
  { word: "confident", meaning: "kendinden emin" },
  { word: "approving", meaning: "onaylayan" },
  { word: "hopeful", meaning: "umutlu" },
  { word: "optimistic", meaning: "iyimser" },
  { word: "pessimistic", meaning: "kötümser" },
  { word: "unrealistic", meaning: "gerçekçi olmayan" },
  { word: "balanced", meaning: "dengeli (iki olaydan bahsederken)" },
  { word: "realistic", meaning: "gerçekçi" },
  { word: "prejudiced", meaning: "önyargılı" },
  { word: "biased", meaning: "önyargılı, taraflı" },
  { word: "superficial", meaning: "yüzeysel" },
  { word: "impartial", meaning: "tarafsız, önyargısız" },
  { word: "unbiased", meaning: "tarafsız, önyargısız" },
  { word: "tolerant", meaning: "hoşgörülü, tahammüllü" },
  { word: "criticizing", meaning: "eleştirel" },
  { word: "favoring", meaning: "destekleyen" },
  { word: "suspicious", meaning: "şüpheci" },
  { word: "sceptical", meaning: "şüpheci" },
  { word: "indifferent", meaning: "umursamaz, kayıtsız" },
  { word: "sarcastic", meaning: "iğneleyen ve küçümseyici" },
  { word: "appreciating", meaning: "takdir eden" },
];

const PRON = {
  cautious: "koşəs",
  informative: "infırmətiv",
  ignorant: "ignırınt",
  disapproving: "disıpruvving",
  assured: "eşurd",
  confident: "kanfıdınt",
  approving: "epruvving",
  hopeful: "houpfıl",
  optimistic: "aptımistik",
  pessimistic: "pesimistik",
  unrealistic: "anriəlistik",
  balanced: "balənst",
  realistic: "riəlistik",
  prejudiced: "prediacist",
  biased: "bayəst",
  superficial: "supırfişəl",
  impartial: "impaarşıəl",
  unbiased: "anbayəst",
  tolerant: "talərənt",
  criticizing: "kritisaizing",
  favoring: "feyvırıng",
  suspicious: "səspişəs",
  sceptical: "skeptikəl",
  indifferent: "indifırınt",
  sarcastic: "sarkaestik",
  appreciating: "eprişieyting",
};

const EXAMPLES = {
  cautious:
    "Investors remained cautious after the market fell.",
  informative:
    "The documentary was informative and easy to follow.",
  ignorant:
    "He was ignorant of the new regulations.",
  disapproving:
    "She gave him a disapproving look.",
  assured:
    "He spoke in an assured voice during the interview.",
  confident:
    "She felt confident about the exam results.",
  approving:
    "The manager made an approving comment on her report.",
  hopeful:
    "We are hopeful that peace talks will succeed.",
  optimistic:
    "Doctors are optimistic about her recovery.",
  pessimistic:
    "The article took a pessimistic view of the economy.",
  unrealistic:
    "Their expectations were completely unrealistic.",
  balanced:
    "The report gave a balanced account of both sides.",
  realistic:
    "Set realistic goals for the first month.",
  prejudiced:
    "The judge was accused of being prejudiced.",
  biased:
    "The survey may be biased toward younger voters.",
  superficial:
    "His knowledge of the topic is superficial.",
  impartial:
    "An impartial observer reviewed the evidence.",
  unbiased:
    "We need unbiased information before deciding.",
  tolerant:
    "The school promotes a tolerant attitude toward diversity.",
  criticizing:
    "The article had a criticizing tone throughout.",
  favoring:
    "The new law is favoring small businesses.",
  suspicious:
    "Police became suspicious of his story.",
  sceptical:
    "Many experts remain sceptical about the claim.",
  indifferent:
    "He seemed indifferent to their complaints.",
  sarcastic:
    "Her sarcastic remark embarrassed everyone.",
  appreciating:
    "An appreciating audience applauded the performance.",
};

const EX_TR = {
  cautious: "Piyasa düştükten sonra yatırımcılar ihtiyatlı kaldı.",
  informative: "Belgesel bilgilendiriciydi ve takip etmesi kolaydı.",
  ignorant: "Yeni yönetmeliklerden habersizdi.",
  disapproving: "Ona onaylamayan bir bakış attı.",
  assured: "Röportaj sırasında kendinden emin bir sesle konuştu.",
  confident: "Sınav sonuçları konusunda kendine güveniyordu.",
  approving: "Yönetici raporu hakkında onaylayan bir yorum yaptı.",
  hopeful: "Barış görüşmelerinin başarılı olacağına umutluyuz.",
  optimistic: "Doktorlar iyileşmesi konusunda iyimser.",
  pessimistic: "Makale ekonomi hakkında kötümser bir bakış sundu.",
  unrealistic: "Beklentileri tamamen gerçekçi değildi.",
  balanced: "Rapor her iki tarafı da dengeli biçimde anlattı.",
  realistic: "İlk ay için gerçekçi hedefler belirleyin.",
  prejudiced: "Hakimin önyargılı olduğu iddia edildi.",
  biased: "Anket genç seçmenlere taraflı olabilir.",
  superficial: "Konuya dair bilgisi yüzeysel.",
  impartial: "Tarafsız bir gözlemci kanıtları inceledi.",
  unbiased: "Karar vermeden önce tarafsız bilgiye ihtiyacımız var.",
  tolerant: "Okul çeşitliliğe karşı hoşgörülü bir tutumu destekliyor.",
  criticizing: "Makale baştan sona eleştirel bir tona sahipti.",
  favoring: "Yeni yasa küçük işletmeleri destekliyor.",
  suspicious: "Polis onun anlatımından şüphelendi.",
  sceptical: "Birçok uzman iddiaya şüpheci yaklaşıyor.",
  indifferent: "Şikayetlerine umursamaz görünüyordu.",
  sarcastic: "İğneleyici sözü herkesi utandırdı.",
  appreciating: "Takdir eden bir seyirci performansı alkışladı.",
};

function entry(word, meaning) {
  const w = word.toLowerCase();
  return {
    word: w,
    pronunciation: PRON[w] || w,
    type: "Sıfat",
    meaning: meaning.toLocaleLowerCase("tr-TR"),
    v2: { form: null, pronunciation: null },
    v3: { form: null, pronunciation: null },
    gerundInfinitive: null,
    examples: [
      {
        sentence: EXAMPLES[w],
        meaning: EX_TR[w],
      },
    ],
    date: DATE_TR,
  };
}

const items = PAIRS.map((p) => entry(p.word, p.meaning));
fs.writeFileSync(OUT, JSON.stringify(items, null, 2) + "\n", "utf8");
console.log("Yazıldı:", OUT, "kelime:", items.length);
