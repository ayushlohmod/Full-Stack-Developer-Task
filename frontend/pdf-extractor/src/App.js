// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [extractedPdf, setExtractedPdf] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('pdf', file);
  
    try {
      await axios.post('http://localhost:5001/upload', formData);
      alert('File uploaded successfully');
    } catch (error) {
      if (error.response) {
        console.error('Server responded with error:', error.response.data);
        alert('Error uploading file: ' + error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Error uploading file: No response received from the server');
      } else {
        console.error('Error setting up request:', error.message);
        alert('Error uploading file: ' + error.message);
      }
    }
  };

  const handleExtract = async () => {
    try {
      const response = await axios.post('http://localhost:5001/extract', {
        filename: file.name,
        pages: pages
      }, {
        responseType: 'blob'
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      setExtractedPdf(URL.createObjectURL(pdfBlob));
    } catch (error) {
      alert('Error extracting pages');
    }
  };

  return (
    <div className="App">
      <h1>PDF Extractor</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {file && (
        <div>
          <h2>Select pages to extract:</h2>
          {[...Array(10).keys()].map(pageNum => (
            <label key={pageNum}>
              <input
                type="checkbox"
                value={pageNum + 1}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (e.target.checked) {
                    setPages(prevPages => [...prevPages, page]);
                  } else {
                    setPages(prevPages => prevPages.filter(p => p !== page));
                  }
                }}
              />
              Page {pageNum + 1}
            </label>
          ))}
          <button onClick={handleExtract}>Extract Pages</button>
        </div>
      )}
      {extractedPdf && (
        <div>
          <h2>Extracted PDF:</h2>
          <a href={extractedPdf} download="extracted.pdf">Download Extracted PDF</a>
        </div>
      )}
    </div>
  );
}

export default App;
