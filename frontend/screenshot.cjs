const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
        
        console.log('Wait 3 seconds...');
        await new Promise(r => setTimeout(r, 3000));
        
        await page.screenshot({ path: 'screenshot.png' });
        console.log('Screenshot saved to screenshot.png');
        
        await browser.close();
    } catch (err) {
        console.error('Puppeteer Script Error:', err);
    }
})();
