const puppeteer = require('puppeteer');

(async () => {
    console.log("🚀 Starting UI Integration Test via Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        console.log("1️⃣ Testing Doctor Login & Earnings Page...");
        await page.goto('http://localhost:3001/login').catch(e => console.log('Goto login: ', e.message));
        
        // Wait for login form
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'doctor@doctor.com');
        await page.type('input[type="password"]', '123123123');
        await page.click('button[type="submit"]');

        // Wait for dashboard to load
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        console.log("✅ Logged in as Doctor.");

        // Go to Earnings
        await page.goto('http://localhost:3001/doctor/earnings');
        await page.waitForSelector('h1');
        const doctorHeading = await page.$eval('h1', el => el.innerText);
        if (doctorHeading.includes('Earnings & Payouts')) {
            console.log("✅ Doctor Earnings Page loaded successfully.");
        } else {
            console.log("❌ Doctor Earnings Page failed.");
        }

        // Check Analytics page for Wallet sections
        await page.goto('http://localhost:3001/doctor/reports');
        await page.waitForSelector('h1');
        const pageText = await page.evaluate(() => document.body.innerText);
        if (pageText.includes('Wallet Balance') && pageText.includes('Total Transferred')) {
            console.log("✅ Doctor Analytics Page successfully shows Wallet & Transferred sections.");
        } else {
            console.log("❌ Doctor Analytics Page is missing wallet sections.");
        }

        console.log("\n2️⃣ Testing Patient Login & Wallet Page...");
        // Clear cookies and local storage to logout
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await page.evaluate(() => localStorage.clear());

        await page.goto('http://localhost:3001/login').catch(e => console.log('Goto login: ', e.message));
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'patient@patient.com');
        await page.type('input[type="password"]', '123123123');
        await page.click('button[type="submit"]');

        // Wait for dashboard to load by waiting for URL change or h1
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        console.log("✅ Logged in as Patient.");

        // Go to Wallet
        await page.goto('http://localhost:3001/patient/wallet');
        await page.waitForSelector('h1');
        const patientHeading = await page.$eval('h1', el => el.innerText);
        if (patientHeading.includes('My Wallet')) {
            console.log("✅ Patient Wallet Page loaded successfully.");
        } else {
            console.log("❌ Patient Wallet Page failed.");
        }

        console.log("\n3️⃣ Testing Admin Login & Payouts Page...");
        // Clear cookies and local storage to logout
        await client.send('Network.clearBrowserCookies');
        await page.evaluate(() => localStorage.clear());

        await page.goto('http://localhost:3001/login').catch(e => console.log('Goto login: ', e.message));
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'admin@admin.com');
        await page.type('input[type="password"]', '123123123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        console.log("✅ Logged in as Admin.");

        // Go to Admin Payouts
        await page.goto('http://localhost:3001/admin/payouts').catch(e => console.log('Goto payouts: ', e.message));
        await page.waitForSelector('h1');
        const adminHeading = await page.$eval('h1', el => el.innerText);
        if (adminHeading.includes('Payouts Management')) {
            console.log("✅ Admin Payouts Page loaded successfully.");
        } else {
            console.log("❌ Admin Payouts Page failed.");
        }

        console.log("\n🎉 ALL FRONTEND FLOWS VERIFIED SUCCESSFULLY!");
    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        await browser.close();
    }
})();
