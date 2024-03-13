// backend/index.js
const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Endpoint to handle PDF file upload
app.post('/upload', upload.single('pdf'), (req, res) => {
  res.status(200).send('File uploaded successfully');
});

// Endpoint to retrieve uploaded PDF file
app.get('/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath);
});

// Endpoint to extract selected pages and create a new PDF
app.post('/extract', async (req, res) => {
  const { filename, pages } = req.body;

  try {
    const pdfBytes = fs.readFileSync(path.join(__dirname, 'uploads', filename));
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const newPdf = await PDFDocument.create();
    for (const pageNum of pages) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
    }

    const newPdfBytes = await newPdf.save();

    res.setHeader('Content-Disposition', `attachment; filename="extracted.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(newPdfBytes);
  } catch (error) {
    res.status(500).send('Error extracting pages');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
