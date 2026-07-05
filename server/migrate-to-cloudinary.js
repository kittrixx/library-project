// migrate-to-cloudinary.js
//
// Разовый скрипт: загружает все существующие PDF (из папки pdfs/)
// и обложки (из папки covers/) в Cloudinary, а затем обновляет
// books.json так, чтобы coverImage и pdfUrl указывали на облачные ссылки.
//
// КАК ЗАПУСТИТЬ:
//   1. Положите этот файл в папку server/ (рядом с app.js)
//   2. Убедитесь, что в server/.env есть:
//        CLOUDINARY_CLOUD_NAME=...
//        CLOUDINARY_API_KEY=...
//        CLOUDINARY_API_SECRET=...
//   3. Установите зависимости (если ещё не установлены):
//        npm install cloudinary dotenv
//   4. Запустите:
//        node migrate-to-cloudinary.js
//   5. Скрипт создаст файл books.backup.json (копия старого books.json на всякий случай)
//      и перезапишет books.json новыми ссылками.

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
const BOOKS_BACKUP_FILE = path.join(__dirname, 'books.backup.json');

function readJSON(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Загружает один локальный файл в Cloudinary.
// resourceType: 'raw' для PDF, 'image' для обложек.
async function uploadFile(localPath, resourceType, folder) {
  return cloudinary.uploader.upload(localPath, {
    resource_type: resourceType,
    folder: folder, // например "library/pdfs" или "library/covers"
    use_filename: true,
    unique_filename: false,
    overwrite: false,
  });
}

async function migrate() {
  console.log('📚 Читаю books.json...');
  const books = readJSON(BOOKS_FILE);

  // Делаем резервную копию на всякий случай
  writeJSON(BOOKS_BACKUP_FILE, books);
  console.log(`✅ Резервная копия сохранена: ${BOOKS_BACKUP_FILE}`);

  const notFound = [];
  const uploaded = [];

  for (const book of books) {
    // --- Обложка ---
    if (book.coverImage && book.coverImage.startsWith('/covers/')) {
      const fileName = decodeURIComponent(book.coverImage.replace('/covers/', ''));
      const localPath = path.join(__dirname, 'covers', fileName);

      if (fs.existsSync(localPath)) {
        try {
          console.log(`⬆️  Загружаю обложку: ${fileName}`);
          const result = await uploadFile(localPath, 'image', 'library/covers');
          book.coverImage = result.secure_url;
          uploaded.push(fileName);
        } catch (err) {
          console.error(`❌ Ошибка загрузки обложки ${fileName}:`, err.message);
          notFound.push({ book: book.title, file: fileName, type: 'cover', reason: err.message });
        }
      } else {
        console.warn(`⚠️  Файл обложки не найден на диске: ${localPath}`);
        notFound.push({ book: book.title, file: fileName, type: 'cover', reason: 'файл не найден' });
      }
    }

    // --- PDF ---
    if (book.pdfUrl && book.pdfUrl.startsWith('/pdfs/')) {
      const fileName = decodeURIComponent(book.pdfUrl.replace('/pdfs/', ''));
      const localPath = path.join(__dirname, 'pdfs', fileName);

      if (fs.existsSync(localPath)) {
        try {
          console.log(`⬆️  Загружаю PDF: ${fileName}`);
          const result = await uploadFile(localPath, 'raw', 'library/pdfs');
          book.pdfUrl = result.secure_url;
          uploaded.push(fileName);
        } catch (err) {
          console.error(`❌ Ошибка загрузки PDF ${fileName}:`, err.message);
          notFound.push({ book: book.title, file: fileName, type: 'pdf', reason: err.message });
        }
      } else {
        console.warn(`⚠️  Файл PDF не найден на диске: ${localPath}`);
        notFound.push({ book: book.title, file: fileName, type: 'pdf', reason: 'файл не найден' });
      }
    }
  }

  writeJSON(BOOKS_FILE, books);

  console.log('\n========== ИТОГ ==========');
  console.log(`✅ Успешно загружено файлов: ${uploaded.length}`);
  console.log(`❌ Не удалось обработать: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log('\nСписок проблемных файлов (нужно проверить вручную):');
    notFound.forEach(item => {
      console.log(`  - [${item.type}] "${item.book}" -> ${item.file} (${item.reason})`);
    });
  }

  console.log('\n📄 books.json обновлён. Резервная копия старого файла: books.backup.json');
  console.log('Проверьте books.json, а затем можно удалить локальные папки pdfs/ и covers/ (если всё загрузилось).');
}

migrate().catch(err => {
  console.error('Критическая ошибка миграции:', err);
  process.exit(1);
});
