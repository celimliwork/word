"""
willaddednewwords.txt dosyasındaki kelimeleri doğru aylık dosyaya ekler
"""
import json
import os
from datetime import datetime

def get_date_file(date_str):
    """Tarihe göre dosya adını döndürür (gün bazlı)"""
    # DD.MM.YYYY formatından YYYY_MM_DD çıkar
    try:
        parts = date_str.split('.')
        if len(parts) == 3:
            day, month, year = parts
            return f"words_{year}_{month}_{day}.json"
    except:
        pass
    return None

def add_words_from_file(input_file='willaddednewwords.txt', target_date=None):
    """willaddednewwords.txt'den kelimeleri okuyup doğru dosyaya ekler"""
    
    # Tarih belirtilmemişse bugünün tarihini kullan
    if not target_date:
        today = datetime.now()
        target_date = f"{today.day:02d}.{today.month:02d}.{today.year}"
    
    target_file = get_date_file(target_date)
    
    if not target_file:
        print(f"Hatali tarih formati: {target_date}")
        return
    
    # Mevcut kelimeleri yükle
    words = []
    if os.path.exists(target_file):
        with open(target_file, 'r', encoding='utf-8') as f:
            words = json.load(f)
    else:
        print(f"Yeni dosya olusturuluyor: {target_file}")
    
    # willaddednewwords.txt'yi oku
    if not os.path.exists(input_file):
        print(f"{input_file} bulunamadi!")
        return
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Kelimeleri parse et ve ekle
    new_words_count = 0
    for line in lines:
        line = line.strip()
        if not line or '=' not in line:
            continue
        
        # Format: kelime=anlam veya kelime: anlam
        if '=' in line:
            parts = line.split('=', 1)
        else:
            parts = line.split(':', 1)
        
        if len(parts) != 2:
            continue
        
        word_text = parts[0].strip()
        meaning = parts[1].strip()
        
        # Yeni kelime objesi oluştur (basit versiyon - detaylar manuel eklenebilir)
        new_word = {
            "word": word_text,
            "pronunciation": "",  # Manuel eklenmeli
            "type": "",  # Manuel eklenmeli
            "meaning": meaning,
            "v2": {"form": None, "pronunciation": None},
            "v3": {"form": None, "pronunciation": None},
            "gerundInfinitive": None,
            "examples": [],
            "date": target_date
        }
        
        words.append(new_word)
        new_words_count += 1
    
    # Dosyayı kaydet
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] {new_words_count} kelime {target_file} dosyasina eklendi.")
    print(f"[NOT] Telaffuz, tur ve ornek cumleler manuel olarak eklenmelidir.")

if __name__ == '__main__':
    import sys
    target_date = sys.argv[1] if len(sys.argv) > 1 else None
    add_words_from_file(target_date=target_date)
