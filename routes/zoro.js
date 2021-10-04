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
    // await page.setViewport({ width: 1200, height: 900 });
    await page.goto(link, { waitUntil: 'domcontentloaded' });

    page.on('response', async (response) => {
      if (response.url().includes('product/?products=')) {
        const data = await response.json();
        res.status(200).send(data);
        await browser.close();
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
