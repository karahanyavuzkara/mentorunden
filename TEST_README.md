# Test Documentation

Bu proje için yazılan testlerin dokümantasyonu.

## 📋 Test Kapsamı

### Backend Testleri

1. **Health Check Endpoint Test** (`backend/src/__tests__/routes/health.test.ts`)
   - Health check endpoint'inin doğru çalıştığını test eder
   - 200 status code döndüğünü doğrular
   - Response body'de `{ status: 'ok' }` olduğunu kontrol eder

2. **Booking Cancellation Endpoint Test** (`backend/src/__tests__/routes/bookings.test.ts`)
   - Booking cancellation endpoint'inin validasyonlarını test eder
   - `userId` eksikse 400 döndüğünü test eder
   - `bookingId` eksikse 400 döndüğünü test eder
   - Booking bulunamazsa 404 döndüğünü test eder

### Frontend Testleri

1. **Calendar Utilities Test** (`frontend/src/__tests__/lib/calendar.test.ts`)
   - `generateGoogleMeetLink()` - Google Meet link oluşturma
   - `generateGoogleCalendarLink()` - Google Calendar link oluşturma
   - `formatTime()` - Zaman formatlama
   - `formatDate()` - Tarih formatlama
   - `getAvailableSlotsForDate()` - Müsait slot hesaplama
     - Boş availability için boş array döndürme
     - Müsait slot'ları doğru hesaplama
     - Mevcut booking'lerle çakışan slot'ları hariç tutma
     - Geçmiş tarihler için boş array döndürme

2. **Video ID Extractor Test** (`frontend/src/__tests__/utils/videoIdExtractor.test.ts`)
   - YouTube video ID çıkarma fonksiyonunu test eder
   - Farklı YouTube URL formatlarını destekler:
     - `https://www.youtube.com/watch?v=VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`
     - `https://www.youtube.com/live/VIDEO_ID`
     - `https://www.youtube.com/embed/VIDEO_ID`
   - Query parametrelerini (`?si=...`) temizler
   - Boş string ve null/undefined input'ları handle eder

3. **ProtectedRoute Component Test** (`frontend/src/__tests__/components/ProtectedRoute.test.tsx`)
   - Authenticated kullanıcı için children render edilir
   - Unauthenticated kullanıcı için `/login`'e redirect edilir
   - Loading state'de spinner gösterilir

4. **AdminRoute Component Test** (`frontend/src/__tests__/components/AdminRoute.test.tsx`)
   - Admin kullanıcı için children render edilir
   - Non-admin kullanıcı için `/dashboard`'a redirect edilir
   - `is_admin` flag'i olan kullanıcılar için erişim sağlanır

## 🚀 Testleri Çalıştırma

### Backend Testleri

```bash
cd backend
npm install
npm test
```

Watch mode'da çalıştırmak için:
```bash
npm run test:watch
```

### Frontend Testleri

```bash
cd frontend
npm install
npm test
```

Watch mode'da çalıştırmak için:
```bash
npm run test:watch
```

## 📊 Test Coverage

Test coverage raporu almak için (henüz yapılandırılmadı):

```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

## 🧪 Test Stratejisi

### Unit Tests
- Utility fonksiyonlar (calendar.ts, videoIdExtractor)
- Component'ler (ProtectedRoute, AdminRoute)

### Integration Tests
- API endpoint'leri (health check, booking cancellation)
- Route protection logic

### Test Mocking
- Supabase client mock'lanır
- Next.js router mock'lanır
- Auth context mock'lanır
- Email service mock'lanır

## 📝 Test Yazma Kuralları

1. Her test dosyası `*.test.ts` veya `*.test.tsx` formatında olmalı
2. Test dosyaları `__tests__` klasöründe veya dosya yanında olabilir
3. Her test açıklayıcı bir `describe` bloğu içinde olmalı
4. Her test case açıklayıcı bir `it` veya `test` bloğu içinde olmalı
5. Mock'lar `beforeEach` içinde temizlenmeli

## 🔧 Troubleshooting

### "Cannot find module" hatası
```bash
# Dependencies'leri yeniden yükle
npm install
```

### "Jest encountered an unexpected token" hatası
- TypeScript dosyaları için `ts-jest` kullanıldığından emin ol
- `jest.config.js` dosyasının doğru yapılandırıldığından emin ol

### Frontend testlerinde "window is not defined" hatası
- `jest-environment-jsdom` yüklü olduğundan emin ol
- `jest.config.js`'de `testEnvironment: 'jest-environment-jsdom'` olduğundan emin ol

