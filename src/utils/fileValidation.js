const fs = require('fs/promises');

const signatures = {
  'application/pdf': (buffer) => buffer.subarray(0, 5).toString() === '%PDF-',
  'image/jpeg': (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
};

async function hasValidFileSignature(file) {
  const buffer = await fs.readFile(file.path);
  return signatures[file.mimetype]?.(buffer) || false;
}

module.exports = { hasValidFileSignature };
