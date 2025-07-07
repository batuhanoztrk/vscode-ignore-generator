# Test Suite Documentation

Bu dosya, Ignore Generator VS Code uzantısı için oluşturulan kapsamlı test suite'ini açıklar.

## Test Yapısı

### Test Dosyaları

1. **`extension.test.ts`** - Ana birim testler
   - Extension aktivasyonu
   - Komut kayıt işlemleri
   - Dosya türü seçimi
   - Template seçimi
   - Dosya oluşturma işlemleri
   - Hata yönetimi
   - Kullanıcı etkileşimi iptali

2. **`integration.test.ts`** - Entegrasyon testleri
   - Tam iş akışı testleri
   - Gerçek dünya senaryoları
   - Performans ve kenar durumları

3. **`test-utils.ts`** - Test yardımcı fonksiyonları
   - Mock veri sağlayıcıları
   - Test kurulum fonksiyonları
   - VS Code API mock'ları

## Test Kapsamı

### ✅ Extension Lifecycle
- ✅ Extension aktivasyonu
- ✅ Komut kaydı
- ✅ Extension deaktivasyonu

### ✅ File Type Selection
- ✅ Ignore types dosyasından okuma
- ✅ Geçersiz formatları filtreleme
- ✅ QuickPick UI etkileşimi
- ✅ Kullanıcı seçimi iptali

### ✅ Template Management
- ✅ Template listesi okuma
- ✅ Kategori bazlı sıralama
- ✅ Alfabetik sıralama
- ✅ Çoklu template seçimi
- ✅ Template dosyası okuma
- ✅ Eksik template dosyası yönetimi

### ✅ File Operations
- ✅ Yeni dosya oluşturma
- ✅ Mevcut dosyaya ekleme (append)
- ✅ Dosya üzerine yazma (overwrite)
- ✅ Kullanıcı seçimi (Overwrite/Append/Cancel)
- ✅ Dosya yolu oluşturma
- ✅ Içerik formatlaması

### ✅ Error Handling
- ✅ Workspace bulunamama hatası
- ✅ Dosya yazma hataları
- ✅ Template listesi okuma hataları
- ✅ Template bulunamama
- ✅ Boş template listesi

### ✅ User Experience
- ✅ QuickPick konfigürasyonu
- ✅ Uyarı mesajları
- ✅ Bilgi mesajları
- ✅ Hata mesajları
- ✅ Dosya editörde açılması

### ✅ Integration Scenarios
- ✅ Tam iş akışı testleri
- ✅ Çoklu template ile dosya oluşturma
- ✅ Farklı ignore dosya türleri
- ✅ Mevcut dosyaya ekleme
- ✅ Kategori bazlı template seçimi
- ✅ Büyük template setleri
- ✅ Özel karakterler içeren template'ler

### ✅ Edge Cases
- ✅ Boş template'ler
- ✅ Unicode karakterler
- ✅ Özel semboller
- ✅ Boşluk içeren dosya adları
- ✅ Büyük template koleksiyonları

## Test Utilities

### MockFileSystem
Dosya sistemi işlemlerini simüle eden mock sınıf:
- Dosya okuma/yazma/ekleme işlemleri
- Dosya varlığı kontrolü
- Bellek tabanlı dosya yönetimi

### VSCodeMockHelper
VS Code API'lerini mock'layan yardımcı sınıf:
- QuickPick etkileşimleri
- Mesaj dialog'ları
- Workspace yönetimi
- Text document işlemleri

### Mock Data Providers
Test için standart mock verileri:
- Ignore dosya türleri
- Template listeleri
- Template içerikleri

## Test Çalıştırma

### Tüm Testleri Çalıştırma
```bash
npm test
```

### Sadece Birim Testler
```bash
npm run test -- --grep "Extension Test Suite"
```

### Sadece Entegrasyon Testleri
```bash
npm run test -- --grep "Integration Tests"
```

### Test Coverage
```bash
npm run test:coverage
```

## Test Geliştirme

### Yeni Test Ekleme
1. İlgili test dosyasına yeni `test()` bloku ekleyin
2. Gerekli mock'ları kurun
3. Test senaryosunu uygulayın
4. Sonuçları doğrulayın

### Mock Data Ekleme
1. `test-utils.ts` dosyasında `defaultMockData` objesini güncelleyin
2. Yeni template içerikleri ekleyin
3. Gerekirse yeni yardımcı fonksiyonlar oluşturun

### Best Practices
- Her test bağımsız olmalı
- Mock'lar test başında kurulmalı
- Test sonunda temizlik yapılmalı
- Anlamlı test isimleri kullanın
- Edge case'leri unutmayın

## Test Metrikleri

- **Toplam Test Sayısı**: 35+ test
- **Test Kategorileri**: 8 ana kategori
- **Code Coverage**: %95+ hedefleniyor
- **Test Süresi**: ~5-10 saniye
- **Mock Objeler**: 15+ mock helper

## Bilinen Sınırlamalar

1. **VS Code API Mocking**: Tüm VS Code API'leri tam olarak mock'lanamıyor
2. **File System**: Gerçek dosya sistemi işlemleri test edilmiyor
3. **UI Testing**: Gerçek kullanıcı etkileşimi test edilmiyor
4. **Performance**: Büyük dosyalar için performans test edilmiyor

## İyileştirme Önerileri

1. **E2E Testler**: Gerçek VS Code instance'ı ile test
2. **Performance Tests**: Büyük template setleri için performans
3. **Visual Tests**: UI component'lerin görsel testleri
4. **Accessibility**: Erişilebilirlik testleri