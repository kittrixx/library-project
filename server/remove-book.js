// remove-book.js
//
// Удаляет книгу с указанным id из books.json.
//
// Запуск:
//   node remove-book.js 38
//
// (число в конце — это id книги, которую нужно удалить)

const fs = require('fs');
const path = require('path');

const BOOK_ID_TO_REMOVE = Number(process.argv[2]);

if (!BOOK_ID_TO_REMOVE) {
  console.error('Укажите id книги для удаления, например: node remove-book.js 38');
  process.exit(1);
}

const BOOKS_FILE = path.join(__dirname, 'books.json');
const BOOKS_BACKUP_FILE = path.join(__dirname, `books.backup-before-remove-${BOOK_ID_TO_REMOVE}.json`);

const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));

// Резервная копия на всякий случай
fs.writeFileSync(BOOKS_BACKUP_FILE, JSON.stringify(books, null, 2), 'utf8');

const bookToRemove = books.find(b => b.id === BOOK_ID_TO_REMOVE);

if (!bookToRemove) {
  console.log(`Книга с id=${BOOK_ID_TO_REMOVE} не найдена. Ничего не изменено.`);
  process.exit(0);
}

console.log(`Удаляю книгу: "${bookToRemove.title}" (id=${bookToRemove.id})`);
console.log(`  coverImage: ${bookToRemove.coverImage}`);
console.log(`  pdfUrl: ${bookToRemove.pdfUrl}`);

const updatedBooks = books.filter(b => b.id !== BOOK_ID_TO_REMOVE);

fs.writeFileSync(BOOKS_FILE, JSON.stringify(updatedBooks, null, 2), 'utf8');

console.log(`\n✅ Готово. Было книг: ${books.length}, стало: ${updatedBooks.length}`);
console.log(`Резервная копия (на случай, если передумаете): ${BOOKS_BACKUP_FILE}`);
console.log('\nНе забудьте вручную удалить файлы с диска (если ещё не удалили):');
if (bookToRemove.coverImage) console.log(`  - server${bookToRemove.coverImage}`);
if (bookToRemove.pdfUrl) console.log(`  - server${bookToRemove.pdfUrl}`);
