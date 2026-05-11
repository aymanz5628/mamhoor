import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, "report.html");
const outputPath = path.join(__dirname, "..", "mamhoor_technical_report.pdf");

async function generatePDF() {
  console.log("🚀 Starting PDF generation...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Load HTML file
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 60000 });

  // Wait for Mermaid rendering
  console.log("⏳ Waiting for Mermaid diagrams to render...");
  await page.waitForFunction(() => {
    const mermaidDivs = document.querySelectorAll(".mermaid");
    return Array.from(mermaidDivs).every((d) => d.querySelector("svg"));
  }, { timeout: 30000 }).catch(() => console.log("⚠️ Some Mermaid diagrams may not have rendered."));

  await new Promise((r) => setTimeout(r, 2000)); // Extra settle time

  console.log("📄 Generating PDF...");
  await page.pdf({
    path: outputPath,
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#999;font-family:sans-serif;">التقرير الفني الشامل — منصة ممهور</div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#999;font-family:sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });

  await browser.close();
  console.log(`✅ PDF saved to: ${outputPath}`);
}

generatePDF().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
