"""
words.json dosyasını tarihlere göre ayıran script
Her gün için ayrı dosya oluşturur: words_YYYY_MM_DD.json
"""
import json
import os
from collections import defaultdict

def split_words_by_date(input_file='words.json'):
    """words.json dosyasını tarihlere göre ayırır (gün bazlı)"""
    
    # Dosyayı oku
    with open(input_file, 'r', encoding='utf-8') as f:
        words = json.load(f)
    
    # Tarihlere göre grupla (YYYY_MM_DD formatında)
    words_by_date = defaultdict(list)
    
    for word in words:
        date = word.get('date', '')
        if date:
            # DD.MM.YYYY formatından YYYY_MM_DD çıkar
            try:
                parts = date.split('.')
                if len(parts) == 3:
                    day, month, year = parts
                    date_key = f"{year}_{month}_{day}"
                    words_by_date[date_key].append(word)
            except:
                # Tarih formatı hatalıysa 'unknown' klasörüne ekle
                words_by_date['unknown'].append(word)
        else:
            words_by_date['unknown'].append(word)
    
    # Her gün için dosya oluştur
    created_files = []
    for date_key, date_words in words_by_date.items():
        filename = f"words_{date_key}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(date_words, f, ensure_ascii=False, indent=2)
        created_files.append(filename)
        print(f"[OK] {filename} olusturuldu ({len(date_words)} kelime)")
    
    # Ana dosyayı yedekle
    if os.path.exists(input_file):
        backup_file = f"{input_file}.backup2"
        with open(input_file, 'r', encoding='utf-8') as src:
            with open(backup_file, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        print(f"\n[OK] Yedek olusturuldu: {backup_file}")
    
    # Index dosyası oluştur (hangi tarihlerin hangi dosyalarda olduğunu gösterir)
    index = {
        "files": sorted(created_files),
        "dates": sorted([k for k in words_by_date.keys() if k != 'unknown'])
    }
    with open('words_index.json', 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"[OK] words_index.json olusturuldu")
    
    print(f"\nToplam {len(words)} kelime {len(created_files)} dosyaya bolundu.")
    return created_files

if __name__ == '__main__':
    split_words_by_date()
