const { Router } = require('express');
const puppeteer = require('puppeteer');
const useProxy = require('puppeteer-page-proxy');
const { proxyRequest } = require('puppeteer-proxy');

const router = Router();

const PUPPETEER_OPTIONS = {
  headless: true,
  args: ['--disable-setuid-sandbox', '--no-sandbox'],
};

const openConnection = async () => {
  const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(60000);

  return { browser, page };
};

const closeConnection = async (page, browser) => {
  page && (await page.close());
  browser && (await browser.close());
};

router.post('/', async (req, res) => {
  const { link } = req.body;

  let { browser, page } = await openConnection();

  await page.setRequestInterception(true);
  try {
    console.log('----------process.env.PROXY', process.env.PROXY);
    await useProxy(page, process.env.PROXY);

    console.log('----------useProxy', link);

    page.on('request', async (request) => {
      await proxyRequest({
        page,
        proxyUrl: process.env.PROXY,
        request,
      });
    });

    await page.goto(link, { waitUntil: 'domcontentloaded' });

    console.log('----------goto');

    page.on('response', async (response) => {
      if (response.url().includes('productClientOnlyProduct')) {
        if (!response.ok()) {
          const error = await response.text();

          await closeConnection(page, browser);

          res.status(500).json(error);
        } else {
          const data = await response.json();

          await closeConnection(page, browser);

          res.status(200).send(data);
        }
      }
    });

    await page.waitForTimeout(5000);
    await page.reload();
  } catch (err) {
    await closeConnection(page, browser);
    res.status(500).send(err.message ?? err);
  }
});

// router.post('/', async (req, res) => {
//   const { link } = req.body;

//   let { browser, page } = await openConnection();
//   try {
//     // await useProxy(page, process.env.PROXY);

//     await page.goto(link, { waitUntil: 'load' });

//     page.on('response', async (response) => {
//       if (response.url().includes('productClientOnlyProduct')) {
//         if (!response.ok()) {
//           const error = await response.text();

//           await closeConnection(page, browser);

//           res.status(500).json(error);
//         } else {
//           const data = await response.json();

//           await closeConnection(page, browser);

//           res.status(200).send(data);
//         }
//       }
//     });

//     await page.waitForTimeout(5000);
//     await page.reload();
//   } catch (err) {
//     await closeConnection(page, browser);
//     res.status(500).send(err.message ?? err);
//   }
// });

module.exports = router;
