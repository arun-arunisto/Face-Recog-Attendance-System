const puppeteer = require('./frontend/node_modules/puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');

  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Admin Demo')) {
      console.log('Clicking Admin Demo button...');
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  console.log('Email value:', await page.evaluate(() => document.querySelector('input[type=email]').value));

  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Sign In')) {
      console.log('Clicking Sign In...');
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));
  console.log('Current URL:', page.url());
  console.log('Body text sample:', (await page.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n/g, ' '));
  await browser.close();
})();
