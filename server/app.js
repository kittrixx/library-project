require('dotenv').config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const TelegramBot = require('node-telegram-bot-api').default;
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Настройка Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Старые локальные папки больше не нужны для новых файлов,
// но оставляем статику на случай, если какие-то старые пути ещё используются.
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use('/covers', express.static(path.join(__dirname, 'covers')));

// Пути к файлам
const BOOKS_FILE = path.join(__dirname, "books.json");
const REVIEWS_FILE = path.join(__dirname, "reviews.json");
const FEEDBACK_FILE = path.join(__dirname, "feedback.json");
const USERS_FILE = path.join(__dirname, "users.json");

// Вспомогательные функции
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Ошибка чтения ${filePath}:`, error);
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// --- НАСТРОЙКА TELEGRAM БОТА ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// --- MIDDLEWARE ДЛЯ ПРОВЕРКИ АВТОРИЗАЦИИ ---
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Неавторизованный доступ. Пожалуйста, войдите в аккаунт.' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || !token.startsWith('token_')) {
    return res.status(401).json({ error: 'Недействительный токен.' });
  }
  const userId = Number(token.replace('token_', ''));
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Пользователь не найден.' });
  }
  req.user = user;
  next();
}

// --- ПАРСЕР ДЛЯ ПОИСКА АННОТАЦИИ ---
async function fetchBookDescription(title, author) {
  const searchQuery = `${title} ${author} аннотация книга`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const $ = cheerio.load(response.data);
    let description = '';
    const possibleSelectors = ['.Z0LcW', '.hgKElc', '.kno-rdesc span', '.s3u9d'];
    for (const selector of possibleSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        description = element.text().trim();
        break;
      }
    }
    if (description && description.length > 20) return description;
    return await fetchFromWikipedia(title, author);
  } catch (error) {
    console.error('Ошибка при парсинге:', error.message);
    return null;
  }
}

async function fetchFromWikipedia(title, author) {
  try {
    const wikiUrl = `https://ru.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const response = await axios.get(wikiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const paragraphs = $('.mw-parser-output > p');
    let description = '';
    paragraphs.each((i, elem) => {
      if (i < 3 && !$(elem).text().includes('Эта страница')) {
        description = $(elem).text().trim();
        return false;
      }
    });
    return description.length > 50 ? description : null;
  } catch (error) {
    return null;
  }
}

// --- Multer теперь хранит файл в памяти (не на диске), чтобы сразу отправить в Cloudinary ---
const upload = multer({ storage: multer.memoryStorage() });

// Загружает буфер файла в Cloudinary через поток
function uploadBufferToCloudinary(buffer, resourceType, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ---------- МАРШРУТЫ ----------

app.get("/", (req, res) => {
  res.send("Сервер работает ✅");
});

// Регистрация
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Заполните все поля" });
  }
  const users = readJSON(USERS_FILE);
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "Пользователь с таким email уже существует" });
  }
  const newUser = { id: Date.now(), fullName, email, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  const token = `token_${newUser.id}`;
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: "Регистрация прошла успешно!", token, user: userWithoutPassword });
});

// Вход
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Введите email и пароль" });
  }
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }
  const token = `token_${user.id}`;
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: "Вход выполнен успешно!", token, user: userWithoutPassword });
});

// Получить данные текущего пользователя
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }
  const token = authHeader.split(" ")[1];
  if (!token || !token.startsWith('token_')) {
    return res.status(401).json({ message: "Недействительный токен" });
  }
  const userId = Number(token.replace('token_', ''));
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Книги (публичные)
app.get("/api/books", (req, res) => {
  const books = readJSON(BOOKS_FILE);
  res.json(books);
});

// Загрузка PDF — теперь сразу в Cloudinary
app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'image', 'library/pdfs');
    res.json({ filePath: result.secure_url });
  } catch (error) {
    console.error('Ошибка загрузки PDF в Cloudinary:', error);
    res.status(500).json({ error: 'Не удалось загрузить файл в облако' });
  }
});

// Загрузка обложки — теперь сразу в Cloudinary
app.post('/api/upload-cover', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'image', 'library/covers');
    res.json({ filePath: result.secure_url });
  } catch (error) {
    console.error('Ошибка загрузки обложки в Cloudinary:', error);
    res.status(500).json({ error: 'Не удалось загрузить файл в облако' });
  }
});

// Поиск аннотации
app.get("/api/fetch-description", async (req, res) => {
  const { title, author } = req.query;
  if (!title || !author) {
    return res.status(400).json({ error: 'Не указано название или автор' });
  }
  try {
    const description = await fetchBookDescription(title, author);
    if (description) {
      res.json({ success: true, description });
    } else {
      res.json({ success: false, message: 'Не удалось найти аннотацию. Попробуйте ввести вручную.' });
    }
  } catch (error) {
    console.error('Ошибка парсинга:', error);
    res.status(500).json({ success: false, message: 'Ошибка на сервере при поиске аннотации.' });
  }
});

// Добавление книги (только для авторизованных)
app.post("/api/books", isAuthenticated, (req, res) => {
  const newBook = req.body;
  if (!newBook.title || !newBook.author || !newBook.genre) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }
  const books = readJSON(BOOKS_FILE);
  const maxId = books.reduce((max, book) => Math.max(max, book.id), 0);
  newBook.id = maxId + 1;
  if (!newBook.reviews) newBook.reviews = [];
  books.push(newBook);
  writeJSON(BOOKS_FILE, books);
  res.status(201).json({ message: `Книга "${newBook.title}" успешно добавлена`, book: newBook });
});

// Удаление книги (только для авторизованных)
app.delete("/api/books/:id", isAuthenticated, (req, res) => {
  const bookId = Number(req.params.id);
  let books = readJSON(BOOKS_FILE);
  const bookExists = books.some(book => book.id === bookId);
  if (!bookExists) {
    return res.status(404).json({ error: "Книга с таким ID не найдена" });
  }
  const updatedBooks = books.filter(book => book.id !== bookId);
  writeJSON(BOOKS_FILE, updatedBooks);
  res.json({ message: `Книга успешно удалена` });
});

// Отзывы (только для авторизованных)
app.get("/api/reviews", (req, res) => {
  const reviews = readJSON(REVIEWS_FILE);
  res.json(reviews);
});

app.post("/api/reviews", isAuthenticated, (req, res) => {
  const { name, bookTitle, text, rating } = req.body;
  if (!name || !bookTitle || !text || !rating) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }
  const reviews = readJSON(REVIEWS_FILE);
  const newReview = { 
    id: Date.now(), 
    name, 
    bookTitle, 
    text, 
    rating: Number(rating), 
    createdAt: new Date().toISOString(),
    userId: req.user.id
  };
  reviews.push(newReview);
  writeJSON(REVIEWS_FILE, reviews);

  const books = readJSON(BOOKS_FILE);
  const bookIndex = books.findIndex(b => b.title === bookTitle);
  if (bookIndex !== -1) {
    if (!books[bookIndex].reviews) books[bookIndex].reviews = [];
    books[bookIndex].reviews.push({ 
      user: name, 
      rating: Number(rating), 
      text: text,
      userId: req.user.id
    });
    writeJSON(BOOKS_FILE, books);
  }
  res.status(201).json({ message: "Отзыв сохранён", review: newReview });
});

app.post("/api/feedback", async (req, res) => {
  const { email, message } = req.body;
  
  console.log('📩 Получено сообщение обратной связи:', { email, message });
  
  if (!email || !message) {
    return res.status(400).json({ error: "Не все поля заполнены" });
  }

  // Сохраняем в файл
  let saved = false;
  try {
    const feedback = readJSON(FEEDBACK_FILE);
    const newFeedback = { 
      id: Date.now(), 
      email, 
      message, 
      createdAt: new Date().toISOString() 
    };
    feedback.push(newFeedback);
    writeJSON(FEEDBACK_FILE, feedback);
    saved = true;
    console.log('✅ Сообщение сохранено в feedback.json');
  } catch (error) {
    console.error('❌ Ошибка сохранения в файл:', error);
  }

  // Отправка в Telegram
  const telegramText = `📩 Новое сообщение с сайта!\n\n📧 Email: ${email}\n📝 Сообщение:\n${message}\n\n🕐 Дата: ${new Date().toLocaleString()}`;
  
  let telegramSent = false;
  let telegramError = null;
  
  try {
    console.log('📤 Отправка в Telegram...');
    console.log('  - Токен:', TELEGRAM_TOKEN ? `${TELEGRAM_TOKEN.substring(0, 10)}...` : 'ОТСУТСТВУЕТ');
    console.log('  - Chat ID:', TELEGRAM_CHAT_ID);
    
    const result = await bot.sendMessage(TELEGRAM_CHAT_ID, telegramText);
    telegramSent = true;
    console.log('✅ Сообщение отправлено в Telegram');
    console.log('  - Результат:', JSON.stringify(result).substring(0, 200));
  } catch (error) {
    telegramError = error.message;
    console.error('❌ Ошибка при отправке в Telegram:');
    console.error('  - Код:', error.code);
    console.error('  - Ответ:', error.response?.body);
    console.error('  - Сообщение:', error.message);
  }

  // Отправляем ответ клиенту
  res.status(201).json({ 
    success: true,
    saved: saved,
    telegramSent: telegramSent,
    message: telegramSent 
      ? "Сообщение отправлено! Мы свяжемся с вами." 
      : "Сообщение сохранено. Мы свяжемся с вами в ближайшее время.",
    ...(telegramError && { telegramError })
  });
});

// Тестовый эндпоинт для проверки Telegram
app.get("/api/test-telegram", async (req, res) => {
  try {
    console.log('🔄 Тестирование Telegram бота...');
    console.log('  - Токен:', TELEGRAM_TOKEN ? `${TELEGRAM_TOKEN.substring(0, 10)}...` : 'ОТСУТСТВУЕТ');
    console.log('  - Chat ID:', TELEGRAM_CHAT_ID);
    
    const result = await bot.sendMessage(
      TELEGRAM_CHAT_ID, 
      '✅ Тестовое сообщение от сервера библиотеки!',
      { parse_mode: 'HTML' }
    );
    
    console.log('✅ Тест успешен!');
    res.json({ 
      success: true, 
      message: 'Telegram бот работает!',
      result: result
    });
  } catch (error) {
    console.error('❌ Ошибка теста Telegram:');
    console.error('  - Код:', error.code);
    console.error('  - Ответ:', error.response?.body);
    console.error('  - Сообщение:', error.message);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.response?.body || 'Нет дополнительных деталей'
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
