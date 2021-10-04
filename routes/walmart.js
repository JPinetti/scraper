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
    page.setDefaultNavigationTimeout(0);
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
    await page.setViewport({ width: 1200, height: 900 });
    await page.goto(link);

    await page.exposeFunction('clickMouse', (x, y) => page.mouse.click(x, y));
    await page.exposeFunction('waitForTimeout', (ms) =>
      page.waitForTimeout(ms),
    );

    const info = await page.evaluate(async () => {
      const title = document.querySelector('h1').innerText;
      let images = [];
      let price = '';

      if (document.querySelector('.price-currency')) {
        const priceCurrency =
          document.querySelector('.price-currency').innerText;
        const priceCharacteristic = document.querySelector(
          '.price-characteristic',
        ).innerText;
        const priceMantissa =
          document.querySelector('.price-mantissa').innerText;
        const elementsWithPhoto = document.querySelectorAll(
          '.prod-alt-image-carousel-image--left',
        );

        images = [...elementsWithPhoto].map((item) => {
          const re = /\?.*$/;
          const img = item.src.replace(re, '');
          return img;
        });

        price = `${priceCurrency}${priceCharacteristic}.${priceMantissa}`;
      }

      if (document.querySelector('span[itemprop="price"]')) {
        price = document.querySelector('span[itemprop="price"]').innerText;

        const elementsWithPhoto = document.querySelectorAll(
          'div.tc > button.pa0.ma0.bn.bg-white.b--white.br0.pb3.pointer > img',
        );

        images = [...elementsWithPhoto].map((item) => {
          const re = /\?.*$/;
          const img = item.src.replace(re, '');
          return img;
        });
      }

      return {
        title,
        price,
        images,
      };
    });

    res.send(info);
  } catch (error) {
    await browser.close();
    return res.status(500).json(error);
  }
});

module.exports = router;
