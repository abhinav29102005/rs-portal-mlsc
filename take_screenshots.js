const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  // -- FACULTY SNAPSHOTS --
  let context = await browser.createBrowserContext();
  let page = await context.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Logging in as faculty...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.click('#dummy-faculty-btn');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Go to dashboard
  console.log("Navigating to faculty dashboard...");
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000)); // wait for layout/animations
  await page.screenshot({ path: 'faculty_dashboard.png' });
  
  // Go to mentors/matching
  console.log("Navigating to faculty mentors...");
  await page.goto('http://localhost:3000/mentors', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'faculty_mentors.png' });
  
  await context.close();

  // -- STUDENT SNAPSHOTS --
  context = await browser.createBrowserContext();
  page = await context.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Logging in as student...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.click('#dummy-student-btn');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Go to discover
  console.log("Navigating to student discover...");
  await page.goto('http://localhost:3000/discover', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'student_discover.png' });
  
  await context.close();
  await browser.close();
  console.log("Done capturing screenshots.");
})();
