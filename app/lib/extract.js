const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_CHARS = 60000;
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.heic', '.tif', '.tiff']);
const SUPPORTED = new Set(['.pdf', '.docx', '.txt', '.md', '.markdown', '.rtf', ...IMAGE_EXTS]);
const MIN_TEXT_CHARS = 40;
const OCR_TIMEOUT_MS = 120000;

function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdf(buffer) {
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
    verbosity: 0,
  }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join(''));
  }
  await doc.destroy();
  return pages.join('\n\n');
}

async function extractDocx(buffer) {
  const mammoth = require('mammoth');
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

function stripRtf(text) {
  return text
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\'[0-9a-f]{2}/gi, '')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '');
}

// Runs the native OCR helper (macOS Vision). Resolves to the recognized text, or throws.
function runOcr(ocrPath, filePath) {
  return new Promise((resolve, reject) => {
    if (!ocrPath || !fs.existsSync(ocrPath)) return reject(new Error('OCR is not available in this build'));
    execFile(ocrPath, [filePath], { timeout: OCR_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || err.message || 'OCR failed').trim()));
      resolve(stdout);
    });
  });
}

// Returns { text, truncated, ocr }. Throws an Error with a user-facing message on failure.
// ocrPath: path to the OCR helper; used for images and for PDFs without a text layer (scans).
async function extractTextFromFile(filePath, { ocrPath } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED.has(ext)) {
    throw new Error(`Unsupported file type "${ext || 'unknown'}". Use PDF, DOCX, TXT, MD or an image, or paste the text.`);
  }
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_BYTES) throw new Error('That file is larger than 8 MB. Paste the text instead.');

  let raw = '';
  let usedOcr = false;
  const ocr = async () => {
    try {
      const out = await runOcr(ocrPath, filePath);
      usedOcr = true;
      return out;
    } catch (err) {
      throw new Error(
        `This looks like a scan or image and text recognition failed (${err.message}). Paste the text instead.`
      );
    }
  };

  if (IMAGE_EXTS.has(ext)) {
    raw = await ocr();
  } else {
    const buffer = fs.readFileSync(filePath);
    try {
      if (ext === '.pdf') raw = await extractPdf(buffer);
      else if (ext === '.docx') raw = await extractDocx(buffer);
      else if (ext === '.rtf') raw = stripRtf(buffer.toString('utf8'));
      else raw = buffer.toString('utf8');
    } catch (err) {
      throw new Error(`Could not read that ${ext.slice(1).toUpperCase()} file (${err.message || 'unknown error'}). Paste the text instead.`);
    }
    if (ext === '.pdf' && normalizeText(raw).length < MIN_TEXT_CHARS) raw = await ocr();
  }

  const text = normalizeText(raw);
  if (text.length < MIN_TEXT_CHARS) {
    throw new Error(
      usedOcr
        ? 'No readable text was found, even with text recognition. Try a clearer scan or paste the text.'
        : 'The file has almost no text. Paste the text instead.'
    );
  }
  return { ...clampText(text), ocr: usedOcr };
}

function clampText(text) {
  const clean = normalizeText(text);
  return clean.length > MAX_TEXT_CHARS
    ? { text: clean.slice(0, MAX_TEXT_CHARS), truncated: true }
    : { text: clean, truncated: false };
}

module.exports = { extractTextFromFile, clampText, normalizeText, MAX_TEXT_CHARS, SUPPORTED, IMAGE_EXTS };
