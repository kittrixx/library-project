// fix-pdf-content-type.js
//
// Проблема: PDF, загруженные в Cloudinary с resource_type: 'raw',
// не всегда отдают правильный Content-Type: application/pdf,
// из-за чего браузер (особенно Firefox) отказывается показывать их
// "внутри" страницы через <embed>/<object> (ошибка NS_ERROR_WONT_HANDLE_CONTENT).
//
// Решение: перезалить те же файлы в Cloudinary с resource_type: 'image'
// (Cloudinary официально поддерживает PDF под этим типом именно для
// корректного онлайн-просмотра), используя уже существующие ссылки
// как источник — без необходимости искать файлы на диске заново.
//
// Запуск: node fix-pdf-content-type.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BOOKS_FILE = path.join(__dirname, 'books.json');
const BOOKS_BACKUP_FILE = path.join(__dirname, 'books.backup-before-pdf-fix.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function fixPdf(book) {
  if (!book.pdfUrl || !book.pdfUrl.includes('res.cloudinary.com')) {
    return { skipped: true, reason: 'нет облачной ссылки на PDF' };
  }
  if (!book.pdfUrl.includes('/raw/upload/')) {
    return { skipped: true, reason: 'уже не raw (возможно, уже исправлено)' };
  }

  const result = await cloudinary.uploader.upload(book.pdfUrl, {
    resource_type: 'image', // ключевое отличие от предыдущей миграции
    folder: 'library/pdfs_fixed',
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  });

  book.pdfUrl = result.secure_url;
  return { skipped: false };
}

async function main() {
  console.log('📚 Читаю books.json...');
  const books = readJSON(BOOKS_FILE);

  writeJSON(BOOKS_BACKUP_FILE, books);
  console.log(`✅ Резервная копия сохранена: ${BOOKS_BACKUP_FILE}`);

  let fixed = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  for (const book of books) {
    try {
      const res = await fixPdf(book);
      if (res.skipped) {
        skipped++;
        console.log(`⏭️  Пропущено: "${book.title}" (${res.reason})`);
      } else {
        fixed++;
        console.log(`✅ Исправлено: "${book.title}"`);
      }
    } catch (err) {
      failed++;
      errors.push({ book: book.title, reason: err.message });
      console.error(`❌ Ошибка для "${book.title}":`, err.message);
    }
  }

  writeJSON(BOOKS_FILE, books);

  console.log('\n========== ИТОГ ==========');
  console.log(`✅ Исправлено: ${fixed}`);
  console.log(`⏭️  Пропущено: ${skipped}`);
  console.log(`❌ Ошибок: ${failed}`);
  if (errors.length > 0) {
    console.log('\nСписок ошибок:');
    errors.forEach(e => console.log(`  - "${e.book}": ${e.reason}`));
  }
  console.log('\nbooks.json обновлён. Резервная копия: books.backup-before-pdf-fix.json');
}

main().catch(err => {
  console.error('Критическая ошибка:', err);
  process.exit(1);
});
