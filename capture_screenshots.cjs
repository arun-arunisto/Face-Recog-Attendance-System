const puppeteer = require('./frontend/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1600,1050',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // Helper to click sidebar nav
  async function clickNavLink(text, waitMs = 2500) {
    console.log(`Clicking nav link containing: "${text}"...`);
    const links = await page.$$('aside a');
    for (const l of links) {
      const linkText = await page.evaluate(el => el.textContent, l);
      if (linkText.includes(text)) {
        await l.click();
        await new Promise(r => setTimeout(r, waitMs));
        return true;
      }
    }
    console.warn(`Could not find nav link for "${text}"`);
    return false;
  }

  // 1. Login Page
  console.log('1. Capturing Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login_page.png') });

  // Login as Admin using Demo button
  console.log('Logging in as Admin via Demo button...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Admin Demo')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Sign In')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3500));

  // 2. Admin Dashboard
  console.log('2. Capturing Admin Dashboard...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_admin_dashboard.png') });

  // 3. Live Recognition Scanner
  console.log('3. Capturing Live Recognition...');
  await clickNavLink('Live Recognition', 3500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_live_recognition.png') });

  // 4. Students List
  console.log('4. Capturing Students Management...');
  await clickNavLink('Students', 2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_student_management.png') });

  // 5. Add New Student Form
  console.log('5. Capturing Student Registration Form...');
  // Find "Add Student" or button with plus icon
  const addButtons = await page.$$('main a, main button');
  for (const ab of addButtons) {
    const t = await page.evaluate(el => el.textContent, ab);
    if (t.includes('Add Student') || t.includes('New Student')) {
      await ab.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_student_registration.png') });

  // 6. Student Detail Page
  console.log('6. Capturing Student Detail Profile...');
  await clickNavLink('Students', 2000);
  // Click first student row
  const detailLinks = await page.$$('main a[href^="/admin/students/"]');
  if (detailLinks.length > 0) {
    await detailLinks[0].click();
    await new Promise(r => setTimeout(r, 2000));
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_student_detail.png') });

  // 7. Face Registration Modal
  console.log('7. Capturing Face Registration Modal...');
  await clickNavLink('Students', 2000);
  // Find a button to register face
  const buttonsInMain = await page.$$('main table button, main button');
  for (const btn of buttonsInMain) {
    const title = await page.evaluate(el => el.getAttribute('title') || el.textContent, btn);
    if (title && (title.includes('Face') || title.includes('Biometric') || title.includes('Capture'))) {
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_face_registration_modal.png') });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 8. Attendance Records
  console.log('8. Capturing Attendance Records...');
  await clickNavLink('Attendance Records', 2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_attendance_records.png') });

  // 9. Analytics Dashboard
  console.log('9. Capturing Analytics Dashboard...');
  await clickNavLink('Analytics', 3000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_analytics_dashboard.png') });

  // 10. Reports Export
  console.log('10. Capturing Reports Export...');
  await clickNavLink('Reports', 2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_reports_export.png') });

  // 11. Camera Management
  console.log('11. Capturing Camera Management...');
  await clickNavLink('Cameras', 2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_camera_management.png') });

  // 12. Audit Logs
  console.log('12. Capturing Audit Logs...');
  await clickNavLink('Audit Logs', 2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_audit_logs.png') });

  // 13. System Settings
  console.log('13. Capturing System Settings...');
  await clickNavLink('Settings', 2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_system_settings.png') });

  // Logout Admin
  console.log('Logging out Admin...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Sign Out')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // Login as Student
  console.log('Logging in as Student via Demo button...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Student Demo')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Sign In')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3500));

  // 14. Student Dashboard
  console.log('14. Capturing Student Dashboard...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_student_dashboard.png') });

  // 15. Student Personal Attendance
  console.log('15. Capturing Student Attendance History...');
  await clickNavLink('My Attendance', 2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_student_attendance.png') });

  // 16. Student Attendance Calendar
  console.log('16. Capturing Student Attendance Calendar...');
  await clickNavLink('Attendance Calendar', 2500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_student_calendar.png') });

  // 17. Student Profile
  console.log('17. Capturing Student Profile...');
  await clickNavLink('My Profile', 2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_student_profile.png') });

  // 18. Swagger OpenAPI Docs
  console.log('18. Capturing Swagger OpenAPI Docs...');
  await page.goto('http://localhost:8000/api/docs/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18_swagger_api_docs.png') });

  // 19. ReDoc Documentation
  console.log('19. Capturing ReDoc Documentation...');
  await page.goto('http://localhost:8000/api/redoc/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '19_redoc_api_docs.png') });

  console.log('=== All 19 real screenshots captured successfully! ===');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
