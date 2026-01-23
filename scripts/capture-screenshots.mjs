import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '../docs/screenshots');

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for the React Flow canvas to load
  await page.waitForSelector('.react-flow', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000)); // Extra wait for animations

  // 1. Main canvas view (Visual mode)
  console.log('Capturing main canvas...');
  await page.screenshot({
    path: join(screenshotsDir, 'main-canvas.png'),
    fullPage: false
  });

  // 2. Click on a node to show properties panel
  console.log('Capturing properties panel...');
  const nodes = await page.$$('.react-flow__node');
  if (nodes.length > 2) {
    await nodes[2].click(); // Click on LLM node
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: join(screenshotsDir, 'properties-panel.png'),
      fullPage: false
    });
  }

  // 3. Switch to Split view by clicking the center view toggle
  console.log('Capturing split view...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const splitBtn = buttons.find(btn => btn.textContent.includes('Split'));
    if (splitBtn) splitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: join(screenshotsDir, 'split-view.png'),
    fullPage: false
  });

  // 4. Switch to Code view
  console.log('Capturing code view...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const codeBtn = buttons.find(btn => {
      const text = btn.textContent || '';
      return text.includes('Code') && !text.includes('Split');
    });
    if (codeBtn) codeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: join(screenshotsDir, 'code-view.png'),
    fullPage: false
  });

  // 5. Back to Visual and interact with AI Assistant
  console.log('Capturing AI assistant interaction...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const visualBtn = buttons.find(btn => btn.textContent.includes('Visual'));
    if (visualBtn) visualBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Type in AI assistant
  const textarea = await page.$('textarea[placeholder*="Describe changes"]');
  if (textarea) {
    await textarea.type('Add a human approval step after the LLM');
    await page.screenshot({
      path: join(screenshotsDir, 'ai-assistant-input.png'),
      fullPage: false
    });

    // Submit and wait for response
    console.log('Capturing AI assistant response...');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000)); // Wait for AI response
    await page.screenshot({
      path: join(screenshotsDir, 'ai-assistant-response.png'),
      fullPage: false
    });
  }

  // 6. Capture the sidebar close-up
  console.log('Capturing sidebar...');
  const sidebar = await page.$('.w-64.bg-\\[\\#181825\\]');
  if (sidebar) {
    await sidebar.screenshot({
      path: join(screenshotsDir, 'sidebar.png')
    });
  }

  // 7. Capture a single node close-up
  console.log('Capturing node close-up...');
  const node = await page.$('.react-flow__node');
  if (node) {
    await node.screenshot({
      path: join(screenshotsDir, 'node-closeup.png')
    });
  }

  // 8. Capture the AI assistant panel close-up
  console.log('Capturing AI assistant panel...');
  const aiPanel = await page.$('.w-80.bg-\\[\\#181825\\]');
  if (aiPanel) {
    await aiPanel.screenshot({
      path: join(screenshotsDir, 'ai-panel.png')
    });
  }

  console.log('All screenshots captured successfully!');
  console.log(`Screenshots saved to: ${screenshotsDir}`);
  await browser.close();
}

captureScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
