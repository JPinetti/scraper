const { Router } = require('express');
const puppeteer = require('puppeteer');

const router = Router();

router.post('/', async (req, res) => {
  const { link } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setExtraHTTPHeaders({
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
      'upgrade-insecure-requests': '1',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,en;q=0.8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
      'Access-Control-Max-Age': '0',
      'Content-Security-Policy':
        'default-src *; connect-src *; script-src *; object-src *;',
      'X-Content-Security-Policy':
        'default-src *; connect-src *; script-src *; object-src *;',
      'X-Webkit-CSP':
        "default-src *; connect-src *; script-src 'unsafe-inline' 'unsafe-eval' *; object-src *;",
    });
    // await page.setViewport({ width: 1200, height: 900 });
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    const obj = {};

    page.on('response', async (response) => {
      if (response.url().includes('az/products')) {
        const {
          payload: { products },
        } = await response.json();
        obj['product'] = products[0];
      }

      if (response.url().includes('v2/products?')) {
        const {
          payload: { products },
        } = await response.json();
        obj['product'] = products[0];
      }

      if (response.url().includes('images')) {
        const { Images } = await response.json();
        obj['images'] = Images;
      }

      if (Object.keys(obj).length === 2) {
        await browser.close();
        res.status(200).send(obj);
      }
    });

    await page.waitForTimeout(5000);
    await page.reload();

    await page.waitForTimeout(30000);
    await browser.close();
  } catch (error) {
    res.status(500).json(error.message ?? error);
  }

  await browser.close();
  res.status(500).json({ message: 'scraper server no response' });
});

module.exports = router;
