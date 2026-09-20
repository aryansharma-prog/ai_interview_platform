const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  logger.warn('pdf-parse module not loaded, falling back to text stream reading');
}

/**
 * Extracts raw text from an uploaded resume file (PDF, TXT, MD, DOC).
 */
async function extractRawText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      if (pdfParse) {
        const data = await pdfParse(dataBuffer);
        if (data && data.text && data.text.trim().length > 20) {
          return data.text.trim();
        }
      }
    }

    // Default fallback: read plain text or utf-8 stream
    const content = fs.readFileSync(filePath, 'utf-8');
    // If binary chars are found, strip them to readable ASCII/Unicode text
    return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
  } catch (err) {
    logger.error(`Resume text extraction error on ${filePath}: ${err.message}`);
    return `[Resume Document: ${path.basename(filePath)}]`;
  }
}

module.exports = { extractRawText };
