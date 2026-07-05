import React, { useState, useEffect, useRef, memo } from 'react';
import ReactDOM from 'react-dom';

// Обновленные стили: 1.2 секунды для максимальной плавности 
const animationStyles = `
  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  .fade-in-container {
    animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1);
    animation-fill-mode: forwards;
  }
`;

// --- Компоненты модальных окон (вынесены наружу) ---

// Модалка добавления книги
const AddBookModal = memo(({ 
  isOpen, 
  onClose, 
  newTitle, setNewTitle,
  newAuthor, setNewAuthor,
  newGenre, setNewGenre,
  newDesc, setNewDesc,
  newPdfFile, setNewPdfFile,
  newCoverFile, setNewCoverFile,
  pdfInputRef, coverInputRef,
  handleCreateBook,
  isSubmitting
}) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(28, 12, 36, 0.6)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{ 
        background: 'var(--white)', width: '90%', maxWidth: '720px',
        borderRadius: '28px', padding: '24px',
        boxShadow: '0 30px 70px rgba(0,0,0,0.25)', position: 'relative'
      }}>
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: 'none', fontSize: '22px',
          cursor: 'pointer', color: 'var(--text-light)'
        }}>✕</button>

        <h3 style={{ 
          fontSize: '22px', fontWeight: '800', marginBottom: '20px',
          color: 'var(--pink)', textAlign: 'center', letterSpacing: '-0.5px'
        }}>Загрузка новой книги</h3>
        
        <form onSubmit={handleCreateBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Название произведения</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              style={inputStyle} placeholder="Например: Маленький принц" required />
          </div>
          <div>
            <label style={labelStyle}>Автор</label>
            <input type="text" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)}
              style={inputStyle} placeholder="Например: Антуан де Сент-Экзюпери" required />
          </div>
          <div>
            <label style={labelStyle}>Жанр</label>
            <input type="text" value={newGenre} onChange={(e) => setNewGenre(e.target.value)}
              style={inputStyle} placeholder="Например: Классика, Детектив, Поэзия..." required />
          </div>
          <div>
            <label style={labelStyle}>Описание</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              style={{ ...inputStyle, height: '70px', resize: 'none' }}
              placeholder="Поделитесь описанием книги..." required />
          </div>

          <div>
            <label style={labelStyle}>Прикрепить PDF-файл книги</label>
            <input type="file" accept=".pdf" ref={pdfInputRef}
              onChange={(e) => setNewPdfFile(e.target.files[0])} style={{ display: 'none' }} required />
            <button type="button" onClick={() => pdfInputRef.current.click()} style={{
              width: '100%', padding: '10px', borderRadius: '14px',
              border: '2px dashed var(--pink)', background: 'var(--pink-light)',
              color: 'var(--pink)', fontFamily: 'inherit', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s'
            }}>
              {newPdfFile ? newPdfFile.name : 'Нажмите, чтобы выбрать PDF файл'}
            </button>
          </div>

          <div>
            <label style={labelStyle}>Обложка книги (JPG/PNG)</label>
            <input type="file" accept=".jpg,.jpeg,.png" ref={coverInputRef}
              onChange={(e) => setNewCoverFile(e.target.files[0])} style={{ display: 'none' }} required />
            <button type="button" onClick={() => coverInputRef.current.click()} style={{
              width: '100%', padding: '10px', borderRadius: '14px',
              border: '2px dashed var(--pink)', background: 'var(--pink-light)',
              color: 'var(--pink)', fontFamily: 'inherit', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s'
            }}>
              {newCoverFile ? newCoverFile.name : 'Нажмите, чтобы выбрать обложку'}
            </button>
          </div>

          <button type="submit" disabled={isSubmitting} style={{
            ...buttonStyle, padding: '14px', fontSize: '15px', borderRadius: '14px',
            marginTop: '4px', boxShadow: '0 8px 20px rgba(231, 58, 152, 0.3)',
            opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}>
            {isSubmitting ? 'Публикация...' : 'Опубликовать книгу'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
});

// Модалка деталей книги
const BookDetailsModal = memo(({
  selectedBook,
  onClose,
  user,
  myReviews,          
  onDeleteReview,   
  onAddQuote,
  onDeleteQuote,
  onAddNotification,
  onAddMyReview,
  onBookUpdated,
  sourceList,
  setSelectedBook,
  API_URL,
  setReadingBookUrl,
  setIsReadingOpen,
  newQuoteText, setNewQuoteText,
  modalUserName, setModalUserName,
  modalReviewText, setModalReviewText,
  modalRating, setModalRating,
  modalHoverRating, setModalHoverRating,
  handleAddModalReview
}) => {
  if (!selectedBook) return null;

  const handleAddQuoteLocal = (e) => {
    e.preventDefault();
    if (!user) {
      if (onAddNotification) onAddNotification('Войдите в профиль, чтобы добавлять цитаты.');
      return;
    }
    if (!newQuoteText.trim()) return;
    if (onAddQuote) onAddQuote(selectedBook.id, newQuoteText.trim());
    setNewQuoteText('');
    if (onAddNotification) onAddNotification(`Цитата добавлена в книгу «${selectedBook.title}».`);
  };

  const handleDeleteQuoteLocal = (bookId, quoteIndex) => {
    if (!user) {
      if (onAddNotification) onAddNotification('Войдите в профиль, чтобы удалять цитаты.');
      return;
    }
    if (onDeleteQuote) onDeleteQuote(bookId, quoteIndex);
    if (onAddNotification) onAddNotification(`Цитата удалена из книги «${selectedBook.title}».`);
  };

  return ReactDOM.createPortal(
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(28, 12, 36, 0.5)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{ 
        background: 'var(--white)', width: '90%', maxWidth: '950px',
        maxHeight: '85vh', borderRadius: '32px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'var(--pink-light)', border: 'none', width: '40px', height: '40px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--pink)', fontSize: '18px', zIndex: 10,
          transition: 'transform 0.2s'
        }}>✕</button>
        
        <div style={{ overflowY: 'auto', padding: '40px 48px', flex: 1 }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div style={{ width: '200px', height: '280px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', flexShrink: 0 }}>
              <img src={selectedBook.coverImage} alt={selectedBook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', display: 'block' }}>{selectedBook.genre}</span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px', color: 'var(--text)', lineHeight: '1.2' }}>{selectedBook.title}</h3>
              <p style={{ fontSize: '16px', color: 'var(--text-light)', margin: '0 0 24px', fontWeight: '700' }}>{selectedBook.author}</p>
              <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.7', margin: '0 0 32px' }}>{selectedBook.desc}</p>
              
              <button 
                onClick={() => {
                  if (!selectedBook.pdfUrl) {
                    if (onAddNotification) onAddNotification(`К сожалению, PDF-файл для книги «${selectedBook.title}» ещё не загружен.`);
                    return;
                  }
                  setReadingBookUrl(selectedBook.pdfUrl);
                  setIsReadingOpen(true);
                }} 
                style={{ 
                  padding: '16px 40px', borderRadius: '16px', border: 'none',
                  background: 'var(--text)', color: 'var(--white)', fontWeight: '800',
                  fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--pink)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--text)'}
              >
                Читать онлайн
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '32px', marginBottom: '32px' }}>
            <h4 style={sectionTitleStyle}>Цитаты из произведения</h4>
            
            {user ? (
              <form onSubmit={handleAddQuoteLocal} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" value={newQuoteText} onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Добавьте свою любимую фразу..." required
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'var(--white)' }} 
                />
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--pink)', color: 'var(--white)', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(231, 58, 152, 0.2)' }}>Сохранить</button>
              </form>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--pink)', marginTop: '8px', fontWeight: '700', marginBottom: '20px' }}>Чтобы добавлять цитаты, пожалуйста, войдите в профиль.</p>
            )}

            {selectedBook.quotes && selectedBook.quotes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedBook.quotes.map((quote, qIdx) => (
                  <div key={qIdx} style={{ background: '#fdf2f8', borderLeft: '4px solid var(--pink)', padding: '16px 20px', borderRadius: '0 16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text)', fontStyle: 'italic', lineHeight: '1.5' }}>«{quote.text || quote}»</p>
                    {user && (
                      <button onClick={() => handleDeleteQuoteLocal(selectedBook.id, qIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5} title="Удалить цитату">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-light)', fontStyle: 'italic' }}>К этой книге пока не добавлено ни одной цитаты.</p>
            )}
          </div>

          <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <h4 style={sectionTitleStyle}>Рецензии и отзывы</h4>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)' }}>Всего отзывов: {selectedBook.reviews ? selectedBook.reviews.length : 0}</span>
            </div>

            {user ? (
              <form onSubmit={handleAddModalReview} style={{ background: 'var(--pink-light)', padding: '24px', borderRadius: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--pink)' }}>Оставить отзыв</h5>
                <div>
                  <label style={labelStyle}>Ваше имя</label>
                  <input type="text" value={modalUserName} onChange={(e) => setModalUserName(e.target.value)} style={inputStyle} placeholder="Имя" required />
                </div>
                <div>
                  <label style={labelStyle}>Оценка</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setModalRating(star)} onMouseEnter={() => setModalHoverRating(star)} onMouseLeave={() => setModalHoverRating(0)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'transform 0.15s ease' }}>
                        <span style={{ color: star <= (modalHoverRating || modalRating) ? '#ffb100' : '#d1d5db', fontSize: '26px' }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Ваш отзыв</label>
                  <textarea value={modalReviewText} onChange={(e) => setModalReviewText(e.target.value)} style={{ ...inputStyle, height: '90px', resize: 'none' }} placeholder="Поделитесь впечатлениями..." required />
                </div>
                <button type="submit" style={{ ...buttonStyle, padding: '12px', fontSize: '14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(231, 58, 152, 0.2)' }}>Отправить отзыв</button>
              </form>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--pink)', marginTop: '8px', fontWeight: '700', marginBottom: '24px' }}>Чтобы оставлять отзывы, пожалуйста, войдите в профиль.</p>
            )}

<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
  {selectedBook.reviews && selectedBook.reviews.length > 0 ? (
    selectedBook.reviews.map((rev, idx) => (
      <div key={idx} style={{ padding: '20px', background: '#f9fafb', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{rev?.user}</strong>
            {/* Кнопка удаления только для своих отзывов */}
            {user && rev?.user === user.fullName && (
              <button
                onClick={() => {
                  if (window.confirm('Удалить этот отзыв?')) {
                    // Находим индекс отзыва в myReviews
                    const reviewIndex = myReviews.findIndex(r => 
                      r.bookTitle === selectedBook.title && 
                      r.text === rev.text && 
                      r.rating === rev.rating
                    );
                    if (reviewIndex !== -1 && onDeleteReview) {
                      onDeleteReview(reviewIndex);
                      // Обновляем selectedBook локально
                      const updatedBook = {
                        ...selectedBook,
                        reviews: selectedBook.reviews.filter((_, i) => i !== idx)
                      };
                      setSelectedBook(updatedBook);
                    }
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Удалить
              </button>
            )}
          </div>
          <span style={{ color: '#ffb100', fontSize: '15px' }}>
            {'★'.repeat(rev?.rating || 0)}{'☆'.repeat(5 - (rev?.rating || 0))}
          </span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>{rev?.text}</p>
      </div>
    ))
  ) : (
    <p style={{ fontSize: '14px', color: 'var(--text-light)', fontStyle: 'italic' }}>Пока никто не оставил отзыв. Будьте первыми!</p>
  )}
</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

// Модалка читалки
const ReadingModal = memo(({ isOpen, onClose, selectedBook, readingBookUrl, API_URL }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(28, 12, 36, 0.8)', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '60px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafafa' }}>
        <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>Чтение онлайн: {selectedBook?.title}</span>
        <button onClick={onClose} style={{ background: 'var(--text)', color: 'var(--white)', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Закрыть читалку</button>
      </div>
      {readingBookUrl ? (
        <object data={readingBookUrl} type="application/pdf" style={{ width: '100%', height: '100%', display: 'block' }}>
          <embed src={readingBookUrl} type="application/pdf" style={{ width: '100%', height: '100%' }} />
        </object>
      ) : (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>Файл не найден</div>
      )}
    </div>,
    document.body
  );
});

// --- Основной компонент Catalog ---

function Catalog({ 
  user, 
  favorites, 
  onAddFavorite, 
  onAddMyReview, 
  onAddNotification, 
  booksList, 
  onBookAdded, 
  onBookDeleted,   
  onBookUpdated,   
  onAddQuote, 
  onDeleteQuote,
  allReviews, 
  addReview,
  myReviews,        // <-- ДОБАВЬТЕ
  onDeleteReview    // <-- ДОБАВЬТЕ
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [internalBooksList, setInternalBooksList] = useState([]);
  const displayedBooksList = booksList !== undefined ? booksList : internalBooksList;

  const [animatedGenre, setAnimatedGenre] = useState(null);

  const [allGenres, setAllGenres] = useState(['Все жанры']);
  const [allAuthors, setAllAuthors] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState('Все жанры');
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddingOpen, setIsAddingOpen] = useState(false);

  const [isAuthorsVisible, setIsAuthorsVisible] = useState(false);

  const [isReadingOpen, setIsReadingOpen] = useState(false);
  const [readingBookUrl, setReadingBookUrl] = useState(null);

  const [newQuoteText, setNewQuoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для формы добавления книги
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPdfFile, setNewPdfFile] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);

  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [modalUserName, setModalUserName] = useState('');
  const [modalReviewText, setModalReviewText] = useState('');
  const [modalRating, setModalRating] = useState(5);
  const [modalHoverRating, setModalHoverRating] = useState(0);

  // Инициализация списков жанров и авторов на основе списка книг
  useEffect(() => {
    const sourceList = booksList !== undefined ? booksList : internalBooksList;
    if (!sourceList || sourceList.length === 0) return;

    const genreSet = new Set();
    sourceList.forEach(book => {
      if (book.genre) genreSet.add(book.genre.trim());
    });
    const sortedGenres = ['Все жанры', ...Array.from(genreSet).sort((a, b) => a.localeCompare(b))];
    setAllGenres(sortedGenres);

    const authorMap = new Map();
    sourceList.forEach(book => {
      if (book.author && !authorMap.has(book.author)) {
        authorMap.set(book.author, {
          name: book.author,
          url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(book.author)}`, 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(book.author)}&background=random&size=128&bold=true`
        });
      }
    });
    setAllAuthors(Array.from(authorMap.values()));
  }, [booksList, internalBooksList]);

  // Загрузка данных, если они получаются внутри компонента
  useEffect(() => {
    if (booksList !== undefined) return;

    fetch(`${API_URL}/api/books?_=` + Date.now())
      .then(response => response.json())
      .then(data => {
        const initializedData = data.map(book => ({
          ...book,
          quotes: book.quotes || []
        }));
        setInternalBooksList(initializedData);
      })
      .catch(err => console.error('Ошибка загрузки книг в каталог:', err));
  }, [API_URL, booksList]);

  useEffect(() => {
    const sourceList = booksList !== undefined ? booksList : internalBooksList;
    if (sourceList.length === 0) return;

    const highlightBookId = localStorage.getItem('highlightBookId');
    const catalogGenreFilter = localStorage.getItem('catalogGenreFilter');

    if (catalogGenreFilter) {
      setSelectedGenre(catalogGenreFilter);
    }

    if (highlightBookId) {
      const bookToOpen = sourceList.find(book => String(book.id) === String(highlightBookId));
      if (bookToOpen) {
        setSelectedBook(bookToOpen);
      }
    }

    localStorage.removeItem('highlightBookId');
    localStorage.removeItem('highlightBookGenre');
    localStorage.removeItem('catalogGenreFilter');
  }, [internalBooksList, booksList]);

  // Синхронизация выбранной книги при внешних изменениях
  useEffect(() => {
    if (selectedBook) {
      const sourceList = booksList !== undefined ? booksList : internalBooksList;
      const freshBook = sourceList.find(b => b.id === selectedBook.id);
      if (freshBook) {
        setSelectedBook(freshBook);
      }
    }
  }, [booksList, internalBooksList, selectedBook?.id]);

  const sourceList = booksList !== undefined ? booksList : internalBooksList;

  const filteredBooks = selectedGenre === 'Все жанры' 
    ? sourceList 
    : sourceList.filter(book => book.genre && book.genre.trim().toLowerCase() === selectedGenre.trim().toLowerCase());

  const filteredAuthors = selectedGenre === 'Все жанры'
    ? allAuthors
    : Array.from(
        new Set(
          filteredBooks
            .filter(book => book.author)
            .map(book => book.author)
        )
      ).map(authorName => {
        const existingAuthor = allAuthors.find(a => a.name === authorName);
        return existingAuthor || {
          name: authorName,
          url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(authorName)}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random&size=128&bold=true`
        };
      });

  const isFavorite = (bookId) => favorites?.some(b => b.id === bookId);

  const handleDownload = (pdfUrl, title) => {
    if (!pdfUrl) {
      if (onAddNotification) {
        onAddNotification(`К сожалению, PDF-файл для книги «${title}» ещё не загружен.`);
      }
      return;
    }
    const fullUrl = pdfUrl;
    const link = document.createElement('a');
    link.href = fullUrl;
    const fileName = pdfUrl.split('/').pop() || `${title}.pdf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFavoriteClick = (book) => {
    if (onAddFavorite) {
      onAddFavorite(book);
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setAnimatedGenre(genre);
    setTimeout(() => setAnimatedGenre(null), 800);
  };

  // Обработчик отправки отзыва в модалке (передаётся в BookDetailsModal)
  const handleAddModalReview = async (e) => {
    e.preventDefault();
    
    // Проверка авторизации
    if (!user) {
      if (onAddNotification) onAddNotification('Для отправки отзыва необходимо войти в аккаунт!');
      return;
    }
    
    // Проверка заполнения полей
    if (!modalUserName || !modalReviewText) {
      if (onAddNotification) onAddNotification('Заполните все поля для отзыва.');
      return;
    }

    try {
      // Вызываем глобальную функцию добавления отзыва
      await addReview({
        name: modalUserName,
        bookTitle: selectedBook.title,
        text: modalReviewText,
        rating: modalRating
      });
      
      // Очищаем форму
      setModalUserName('');
      setModalReviewText('');
      setModalRating(5);
      
      // Уведомление об успехе добавляется внутри addReview

    } catch (error) {
      console.error('Ошибка:', error);
      if (onAddNotification) onAddNotification('Ошибка при сохранении отзыва.');
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 
    if (!newTitle || !newAuthor || !newGenre || !newDesc || !newPdfFile || !newCoverFile) {
      if (onAddNotification) onAddNotification('Заполните все поля, прикрепите PDF и обложку для новой книги.');
      return;
    }
    if (!user) {
      if (onAddNotification) onAddNotification('Войдите в профиль, чтобы добавлять книги.');
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', newPdfFile);
      const uploadRes = await fetch(`${API_URL}/api/upload-pdf`, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Ошибка загрузки PDF');
      const uploadData = await uploadRes.json();
      const pdfUrl = uploadData.filePath;

      const coverForm = new FormData();
      coverForm.append('file', newCoverFile);
      const coverRes = await fetch(`${API_URL}/api/upload-cover`, { method: 'POST', body: coverForm });
      if (!coverRes.ok) throw new Error('Ошибка загрузки обложки');
      const coverData = await coverRes.json();
      const coverImage = coverData.filePath;

      const token = localStorage.getItem('userToken');
      const newBookData = { 
        title: newTitle.trim(), 
        author: newAuthor.trim(), 
        genre: newGenre.trim(), 
        desc: newDesc.trim(), 
        pdfUrl, 
        coverImage, 
        reviews: [],
        quotes: [], 
        owner: user?.id || 'admin'
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newBookData)
      });
      if (!response.ok) throw new Error('Ошибка при сохранении книги');
      const data = await response.json();

      const createdBook = data.book || data;
      const completeCreatedBook = { 
        ...createdBook, 
        quotes: createdBook.quotes || [],
        genre: newGenre.trim(),
        author: newAuthor.trim()
      };

      const trimmedCreatedGenre = completeCreatedBook.genre ? completeCreatedBook.genre.trim() : '';
      if (trimmedCreatedGenre && !allGenres.includes(trimmedCreatedGenre)) {
        const sortedGenres = [...allGenres, trimmedCreatedGenre].sort((a, b) => {
          if (a === 'Все жанры') return -1;
          if (b === 'Все жанры') return 1;
          return a.localeCompare(b);
        });
        setAllGenres(sortedGenres);
      }

      const authorExists = allAuthors.some(a => a.name === completeCreatedBook.author);
      if (completeCreatedBook.author && !authorExists) {
        const newAuthorObj = {
          name: completeCreatedBook.author,
          url: `https://ru.wikipedia.org/wiki/${encodeURIComponent(completeCreatedBook.author)}`, 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(completeCreatedBook.author)}&background=random&size=128&bold=true`
        };
        setAllAuthors([...allAuthors, newAuthorObj]);
      }

      if (onBookAdded) {
        onBookAdded(completeCreatedBook);
      } else {
        setInternalBooksList(prev => [...prev, completeCreatedBook]);
      }

      if (trimmedCreatedGenre) setSelectedGenre(trimmedCreatedGenre);

      setNewTitle(''); setNewAuthor(''); setNewGenre(''); setNewDesc('');
      setNewPdfFile(null); setNewCoverFile(null);
      setIsAddingOpen(false);
      if (onAddNotification) onAddNotification(`В библиотеку успешно добавлена новая книга: «${completeCreatedBook.title}».`);

    } catch (error) {
      console.error('Ошибка:', error);
      if (onAddNotification) onAddNotification('Ошибка при добавлении книги. Проверьте соединение с сервером.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Вы уверены, что хотите удалить книгу «${bookTitle}»?`)) return;
    const token = localStorage.getItem('userToken');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/books/${bookId}`, { method: 'DELETE', headers });
      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Неизвестная ошибка сервера');
        throw new Error(`Статус ${response.status}: ${errorData}`);
      }

      const deletedBook = sourceList.find(book => book.id === bookId);
      const updatedBooksList = sourceList.filter(book => book.id !== bookId);
      if (selectedBook && selectedBook.id === bookId) setSelectedBook(null);

      if (onBookDeleted) {
        onBookDeleted(updatedBooksList);
      } else if (booksList === undefined) {
        setInternalBooksList(updatedBooksList);
      }

      if (deletedBook) {
        const authorStillUsed = updatedBooksList.some(book => book.author === deletedBook.author);
        if (!authorStillUsed) {
          setAllAuthors(prev => prev.filter(a => a.name !== deletedBook.author));
        }
        const genreStillUsed = updatedBooksList.some(book => book.genre && deletedBook.genre && book.genre.trim().toLowerCase() === deletedBook.genre.trim().toLowerCase());
        if (!genreStillUsed) {
          setAllGenres(prev => prev.filter(g => g.trim().toLowerCase() !== (deletedBook.genre || '').trim().toLowerCase()));
          if (selectedGenre.trim().toLowerCase() === (deletedBook.genre || '').trim().toLowerCase()) {
            setSelectedGenre('Все жанры');
          }
        }
      }
      if (onAddNotification) onAddNotification(`Книга «${bookTitle}» успешно удалена из каталога.`);
    } catch (error) {
      console.error('Детали ошибки при удалении книги:', error);
      if (onAddNotification) onAddNotification('Ошибка при удалении книги. Пожалуйста, проверьте консоль разработчика.');
    }
  };

  const handleOpenAdd = () => {
    if (!user) {
      if (onAddNotification) onAddNotification('Войдите в профиль, чтобы добавлять книги.');
      return;
    }
    setIsAddingOpen(true);
  };

  return (
    <div className="fade-in-container" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '60px 40px' }}>
      <style>{animationStyles}</style>
      <style>{`
        @keyframes popBookFromShelf {
          0% { opacity: 0; transform: scale(0.2) translateY(15px) rotate(-20deg); }
          40% { opacity: 1; transform: scale(1.3) translateY(-65px) rotate(8deg); }
          70% { opacity: 1; transform: scale(1.15) translateY(-80px) rotate(-4deg); }
          100% { opacity: 0; transform: scale(0.85) translateY(-100px) rotate(2deg); }
        }
        .pop-book-svg-wrapper {
          position: absolute; top: -25px; left: 50%; transform: translateX(-50%);
          width: 56px; height: 56px;
          animation: popBookFromShelf 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: none; z-index: 15;
          filter: drop-shadow(0 10px 15px rgba(231, 58, 152, 0.4));
        }
      `}</style>

      {/* Заголовок + увеличенная кнопка "Добавить книгу" */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '38px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Каталог книг</h2>
        {user && (
          <button 
            onClick={handleOpenAdd} 
            style={{ 
              padding: '18px 40px',           // увеличенный паддинг
              borderRadius: '30px', 
              border: 'none',
              background: 'var(--text)', 
              color: 'var(--white)', 
              fontFamily: 'inherit', 
              fontWeight: '700', 
              fontSize: '17px',               // увеличенный шрифт
              cursor: 'pointer',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55)',
              transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.55)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить книгу
          </button>
        )}
      </div>

      {/* Блок авторов */}
      <div style={{ marginBottom: '50px' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '8px' }}
          onClick={() => setIsAuthorsVisible(!isAuthorsVisible)}
        >
          <h3 style={{ ...sectionTitleStyle, marginBottom: 0, cursor: 'pointer', userSelect: 'none' }}>
            Авторы ({filteredAuthors.length})
          </h3>
          <span style={{ fontSize: '18px', color: 'var(--text-light)', transition: 'transform 0.2s', transform: isAuthorsVisible ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--pink)' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Хотите узнать больше об авторе? Раскройте список, нажмите на имя <span style={{ color: 'var(--pink)', fontWeight: '700' }}>автора</span> и изучите его биографию
        </p>
        <h3 style={{ ...sectionTitleStyle, marginBottom: 8, marginTop: 10 }}>Доступные книги ({filteredBooks.length})</h3>
        {isAuthorsVisible && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {filteredAuthors.map(author => (
              <div key={author.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--white)', padding: '6px 28px 6px 6px', borderRadius: '50px', boxShadow: '0 6px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
                <img src={author.avatar} alt={author.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', background: 'var(--pink-light)', flexShrink: 0 }} />
                <a href={author.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }} onMouseOver={(e) => e.target.style.color = 'var(--pink)'} onMouseOut={(e) => e.target.style.color = 'var(--text)'}>{author.name} ↗</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Основная область: две колонки */}
      <div className="catalog-main-row" style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
        {/* Левая колонка: список книг */}
        <div className="catalog-books-col" style={{ flex: '1', minWidth: '0' }}>
          <div className="catalog-books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px', marginBottom: '80px' }}>
            {filteredBooks.map((book) => (
              <div 
                key={book.id} 
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '140%', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                  <img src={book.coverImage} alt={book.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {user && user.id === book.owner && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id, book.title); }} style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', zIndex: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  )}
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: '1', background: 'var(--white)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{book.genre}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text)', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '52px' }}>{book.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: '0 0 16px', fontWeight: '600' }}>{book.author}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                    <button onClick={() => handleDownload(book.pdfUrl, book.title)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--text)', color: 'var(--white)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>Скачать</button>
                    <button onClick={() => setSelectedBook(book)} style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--white)', color: 'var(--text)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>Подробнее</button>
                    <button onClick={() => handleFavoriteClick(book)} style={{ width: '46px', height: '46px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(book.id) ? "var(--pink)" : "none"} stroke={isFavorite(book.id) ? "var(--pink)" : "var(--text-light)"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая колонка: только жанры */}
        <div className="catalog-genre-col" style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ marginBottom: '50px' }}>
            <h3 style={sectionTitleStyle}>Выбор жанра</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allGenres.map(genre => (
                <button 
                  key={genre} 
                  onClick={() => handleGenreSelect(genre)} 
                  style={{ 
                    padding: '16px 32px', borderRadius: '30px', border: 'none', 
                    backgroundColor: selectedGenre === genre ? 'var(--pink)' : 'var(--white)', 
                    color: selectedGenre === genre ? 'var(--white)' : 'var(--text)', 
                    fontFamily: 'inherit', fontWeight: '700', fontSize: '15px', cursor: 'pointer', position: 'relative', 
                    boxShadow: selectedGenre === genre ? '0 20px 60px rgba(231, 58, 152, 0.55)' : '0 5px 18px rgba(0, 0, 0, 0.06)', 
                    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  {genre}
                  {animatedGenre === genre && (
                    <div className="pop-book-svg-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: 'var(--pink)' }}>
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна (вынесены) */}
      <AddBookModal
        isOpen={isAddingOpen}
        onClose={() => setIsAddingOpen(false)}
        newTitle={newTitle} setNewTitle={setNewTitle}
        newAuthor={newAuthor} setNewAuthor={setNewAuthor}
        newGenre={newGenre} setNewGenre={setNewGenre}
        newDesc={newDesc} setNewDesc={setNewDesc}
        newPdfFile={newPdfFile} setNewPdfFile={setNewPdfFile}
        newCoverFile={newCoverFile} setNewCoverFile={setNewCoverFile}
        pdfInputRef={pdfInputRef} coverInputRef={coverInputRef}
        handleCreateBook={handleCreateBook}
        isSubmitting={isSubmitting}
      />

      <BookDetailsModal
        selectedBook={selectedBook}
        onClose={() => setSelectedBook(null)}
        user={user}
        myReviews={myReviews} 
        onDeleteReview={onDeleteReview} 
        onAddQuote={onAddQuote}
        onDeleteQuote={onDeleteQuote}
        onAddNotification={onAddNotification}
        onAddMyReview={onAddMyReview}
        onBookUpdated={onBookUpdated}
        sourceList={sourceList}
        setSelectedBook={setSelectedBook}
        API_URL={API_URL}
        setReadingBookUrl={setReadingBookUrl}
        setIsReadingOpen={setIsReadingOpen}
        newQuoteText={newQuoteText} setNewQuoteText={setNewQuoteText}
        modalUserName={modalUserName} setModalUserName={setModalUserName}
        modalReviewText={modalReviewText} setModalReviewText={setModalReviewText}
        modalRating={modalRating} setModalRating={setModalRating}
        modalHoverRating={modalHoverRating} setModalHoverRating={setModalHoverRating}
        handleAddModalReview={handleAddModalReview}
      />

      <ReadingModal
        isOpen={isReadingOpen}
        onClose={() => setIsReadingOpen(false)}
        selectedBook={selectedBook}
        readingBookUrl={readingBookUrl}
        API_URL={API_URL}
      />
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text)' };
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const sectionTitleStyle = { fontSize: '14px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px', fontWeight: '800' };
const cardStyle = { background: 'var(--white)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' };
const buttonStyle = { width: '100%', padding: '18px', borderRadius: '20px', border: 'none', background: 'var(--pink)', color: 'var(--white)', fontFamily: 'inherit', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', boxSizing: 'border-box' };

export default Catalog;