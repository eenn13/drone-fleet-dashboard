import { test, expect } from '@playwright/test';

test.describe('Drone Mission Full Flow', () => {
  function generateSerialNumber(prefix: string): string {
    const paddedPrefix = prefix.padEnd(4, '0').slice(0, 4);
    const random = Date.now().toString().slice(-4);
    return `SKY-${paddedPrefix}-${random}`;
  }

  test('should create a drone, schedule a mission, and complete it', async ({ page }) => {
    // 1. Dashboard'a git
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=Drone Filosu').first()).toBeVisible({ timeout: 15000 });
    
    // 2. "Yeni Drone" butonuna tıkla
    await page.click('button:has-text("Yeni Drone")');
    await expect(page.locator('text=Yeni Drone Ekle')).toBeVisible({ timeout: 10000 });
    
    // 3. Drone formunu doldur
    const serialNumber = generateSerialNumber('TEST');
    console.log('Serial number:', serialNumber);
    
    await page.fill('input[placeholder="SKY-XXXX-XXXX"]', serialNumber);
    await page.locator('label:has-text("Model")').locator('..').locator('select').selectOption('MATRICE_300');
    await page.locator('label:has-text("Durum")').locator('..').locator('select').selectOption('AVAILABLE');
    await page.fill('input[type="number"]', '0');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);
    const futureStr = futureDate.toISOString().split('T')[0];
    
    const dateInputs = await page.locator('input[type="date"]').all();
    await dateInputs[0].fill(todayStr);
    await dateInputs[1].fill(futureStr);
    
    // 4. "Ekle" butonuna tıkla
    await page.click('button:has-text("Ekle")');
    await expect(page.locator('text=Yeni Drone Ekle')).not.toBeVisible({ timeout: 5000 });
    
    // 5. Dronelar sayfasına git
    await page.click('text=Dronelar');
    await page.waitForLoadState('networkidle');
    
    // 6. Drone'u kontrol et
    await page.fill('input[placeholder="Drone ara (Seri No, Model)..."]', serialNumber);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${serialNumber}`)).toBeVisible({ timeout: 10000 });
    
    // 7. "Görevler" sekmesine git
    await page.click('text=Görevler');
    await page.waitForLoadState('networkidle');
    
    // 8. "Yeni Görev" butonuna tıkla
    await page.click('button:has-text("Yeni Görev")');
    await expect(page.locator('text=Yeni Görev Ekle')).toBeVisible({ timeout: 10000 });
    
    // 9. Görev formunu doldur
    const missionName = `E2E Test ${Date.now().toString().slice(-4)}`;
    console.log('Mission name:', missionName);
    
    await page.fill('input[placeholder="Örn: Rüzgar Türbini İnceleme - Osmaniye"]', missionName);
    await page.locator('label:has-text("Görev Tipi")').locator('..').locator('select').selectOption('WIND_TURBINE_INSPECTION');
    await page.fill('input[placeholder="Pilot adını girin"]', 'E2E Pilot');
    await page.fill('input[placeholder="Görev konumunu girin"]', 'E2E Location');
    
    // Drone seç
    await page.click('.react-select__control');
    await page.keyboard.type(serialNumber);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    
    // Tarihler
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + 2);
    const startStr = startDate.toISOString().split('T')[0];
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endStr = endDate.toISOString().split('T')[0];
    
    const dateInputs2 = await page.locator('input[type="date"]').all();
    await dateInputs2[0].fill(startStr);
    await dateInputs2[1].fill(endStr);
    
    // 10. "Ekle" butonuna tıkla ve API response'unu yakala
    const [response] = await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/missions'),
        { timeout: 15000 }
      ),
      page.click('button:has-text("Ekle")')
    ]);
    
    const responseData = await response.json();
    console.log('Mission API Response Status:', response.status());
    console.log('Mission API Response Data:', responseData);
    
    // 11. Modal kapanana kadar bekle
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Yeni Görev Ekle')).not.toBeVisible({ timeout: 5000 });
    
    // 12. ✅ Sayfayı yenile ve görevi ara
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 13. Görevi arama ile bul
    await page.fill('input[placeholder="Drone ara (Seri No, Model)..."]', missionName);
    await page.waitForTimeout(2000);
    
    // 14. Görevin listeye eklendiğini kontrol et
    await expect(page.locator(`text=${missionName}`)).toBeVisible({ timeout: 10000 });
  });

  test('should filter missions by status', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Görevler');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Filtrele")');
    await expect(page.locator('text=Gelişmiş Filtreleme')).toBeVisible({ timeout: 10000 });
    
    await page.locator('label:has-text("Durum")').locator('..').locator('select').selectOption('COMPLETED');
    await page.click('button:has-text("Uygula")');
    
    await expect(page.locator('text=Tamamlandı').first()).toBeVisible({ timeout: 10000 });
    
    await page.click('button:has-text("Filtrele")');
    await expect(page.locator('text=Gelişmiş Filtreleme')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Temizle")');
    
    await expect(page.locator('text=Görev Görünümü')).toBeVisible({ timeout: 10000 });
  });

  test('should delete a drone', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dronelar');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Yeni Drone")');
    await expect(page.locator('text=Yeni Drone Ekle')).toBeVisible({ timeout: 5000 });
    
    const serialNumber = generateSerialNumber('DEL');
    console.log('Delete serial number:', serialNumber);
    
    await page.fill('input[placeholder="SKY-XXXX-XXXX"]', serialNumber);
    await page.locator('label:has-text("Model")').locator('..').locator('select').selectOption('MATRICE_300');
    await page.locator('label:has-text("Durum")').locator('..').locator('select').selectOption('AVAILABLE');
    await page.fill('input[type="number"]', '0');
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);
    const futureStr = futureDate.toISOString().split('T')[0];
    
    const dateInputs = await page.locator('input[type="date"]').all();
    await dateInputs[0].fill(todayStr);
    await dateInputs[1].fill(futureStr);
    
    const [droneResponse] = await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/drones'),
        { timeout: 15000 }
      ),
      page.click('button:has-text("Ekle")')
    ]);
    
    await expect(page.locator('text=Yeni Drone Ekle')).not.toBeVisible({ timeout: 5000 });
    
    await page.fill('input[placeholder="Drone ara (Seri No, Model)..."]', serialNumber);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${serialNumber}`)).toBeVisible({ timeout: 10000 });
    
    await page.click('button[title="Sil"]:first-of-type');
    await expect(page.locator('text=Drone Sil')).toBeVisible({ timeout: 10000 });
    
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/drones') && response.status() === 204,
        { timeout: 15000 }
      ),
      page.click('button:has-text("Evet, Sil")')
    ]);
    
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${serialNumber}`)).not.toBeVisible({ timeout: 10000 });
  });
});