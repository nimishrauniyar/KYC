const path = require('path');
const fs = require('fs');
const { storageProvider } = require('../config/env');

async function getDocumentFile(document) {
  if (storageProvider === 'cloudinary' && document.filePath.startsWith('http')) {
    return { type: 'url', url: document.filePath };
  }

  if (storageProvider === 's3' && document.filePath.startsWith('http')) {
    return { type: 'url', url: document.filePath };
  }

  // Local filesystem storage fallback
  const absolutePath = path.isAbsolute(document.filePath)
    ? document.filePath
    : path.join(process.cwd(), document.filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error('Document file not found on storage server.');
  }

  return { type: 'local', absolutePath };
}

module.exports = { getDocumentFile };
