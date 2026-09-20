const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

/**
 * Renders an interview Result document to a PDF file and returns its relative URL.
 */
async function generateResultPdf(result, interview, user) {
  const uploadDir = path.join(process.cwd(), env.upload.dir, 'results');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `result-${result._id}.pdf`;
  const filePath = path.join(uploadDir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('AI Interview Platform — Result Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Candidate: ${user.name}`);
    doc.text(`Category: ${interview.category}${interview.topic ? ' / ' + interview.topic : ''}`);
    doc.text(`Difficulty: ${interview.difficulty}`);
    doc.text(`Date: ${new Date(result.createdAt).toDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Scores');
    doc.fontSize(12).text(`Overall Score: ${result.overallScore}`);
    doc.text(`Confidence: ${result.confidence}`);
    doc.text(`Communication: ${result.communication}`);
    doc.text(`Technical Accuracy: ${result.technicalAccuracy}`);
    doc.text(`Problem Solving: ${result.problemSolving}`);
    doc.moveDown();

    doc.fontSize(14).text('Strong Areas');
    doc.fontSize(12).text(result.strongAreas.join(', ') || '—');
    doc.moveDown();

    doc.fontSize(14).text('Weak Areas');
    doc.fontSize(12).text(result.weakAreas.join(', ') || '—');
    doc.moveDown();

    doc.fontSize(14).text('Suggestions');
    result.suggestions.forEach((s) => doc.fontSize(12).text(`• ${s}`));

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return `/${env.upload.dir}/results/${fileName}`;
}

module.exports = { generateResultPdf };
