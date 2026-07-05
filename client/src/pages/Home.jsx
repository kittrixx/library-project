import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Адрес сервера: берём из переменной окружения (на хостинге) или локальный (при разработке)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

function Home({ setView, onAddMyReview, user, allReviews, addReview }) {
  const [searchResultBook, setSearchResultBook] = useState(null);
  const [searchError, setSearchError] = useState('');

  const [reviewName, setReviewName] = useState('');
  const [reviewBook, setReviewBook] = useState('Портрет Дориана Грея');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [allBookTitles, setAllBookTitles] = useState([]);

  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/books?_=` + Date.now())
      .then(res => res.json())
      .then(data => {
        const titles = data.map(book => book.title).sort();
        setAllBookTitles(titles);
      })
      .catch(err => console.error('Ошибка загрузки списка книг:', err));
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка авторизации
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Для отправки отзыва необходимо войти в аккаунт!');
      if (setView) setView('auth');
      return;
    }
    
    // Проверка заполнения полей
    if (!reviewName || !reviewText) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      // Вызываем глобальную функцию добавления отзыва
      await addReview({
        name: reviewName,
        bookTitle: reviewBook,
        text: reviewText,
        rating: reviewRating
      });
      
      // Очищаем форму
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      
      alert('Спасибо! Ваш отзыв сохранён.');

    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при сохранении отзыва. Проверьте соединение с сервером.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackEmail || !feedbackMessage) {
      setFeedbackStatus('Заполните все поля');
      return;
    }

    setFeedbackStatus('Отправка...');

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: feedbackEmail,
          message: feedbackMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке');
      }

      setFeedbackStatus('Сообщение отправлено! Мы свяжемся с вами.');
      setFeedbackEmail('');
      setFeedbackMessage('');

    } catch (error) {
      console.error('Ошибка:', error);
      setFeedbackStatus('Ошибка при отправке. Попробуйте позже.');
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      setSearchError('');
      setSearchResultBook(null);
      return;
    }

    setSearchError('');
    setSearchResultBook(null);

    try {
      const response = await fetch(`${API_URL}/api/books?_=` + Date.now());
      const allBooks = await response.json();

      const normalizedQuery = query.toLowerCase();
      const MIN_QUERY_LENGTH = 3;

      const splitWords = (text) => 
        text.toLowerCase().split(/[\s,.:;!?()«»"'-]+/).filter(Boolean);

      const matchesQuery = (text) => {
        if (!text) return false;
        if (normalizedQuery.length < MIN_QUERY_LENGTH) return false;

        const normalizedText = text.toLowerCase();
        const textWords = splitWords(normalizedText);
        const queryWords = splitWords(normalizedQuery);

        if (textWords.includes(normalizedQuery)) return true;
        if (normalizedText.startsWith(normalizedQuery)) return true;

        if (queryWords.length <= 1) {
          return textWords.some(word => word.startsWith(normalizedQuery));
        }

        return queryWords.every(qWord => 
          qWord.length > 0 && textWords.some(tWord => tWord.startsWith(qWord))
        );
      };

      const foundBook = allBooks.find(book => 
        matchesQuery(book.title) || matchesQuery(book.author)
      );

      if (foundBook) {
        setSearchResultBook(foundBook);
        setSearchError('');
      } else {
        setSearchResultBook(null);
        setSearchError(`Книга "${query}" не найдена в каталоге.`);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setSearchError('Ошибка при поиске. Попробуйте позже.');
    }
  };

  const features = [
    { img: 'https://i.pinimg.com/736x/e0/77/14/e077143a0cbcca8aec200692ba6484fa.jpg', title: 'Удобный поиск', desc: 'Быстрый доступ к любой книге из нашей коллекции по автору или названию.' },
    { img: 'https://i.pinimg.com/1200x/97/12/3e/97123ebe1c5ddc30cc82c6c9a06778e0.jpg', title: 'Подробные описания', desc: 'Аннотации, которые помогут понять суть произведения до начала чтения.' },
    { img: 'https://i.pinimg.com/736x/37/d0/60/37d0607c643a6fe00c977815889bf2e1.jpg', title: 'Оценки и отзывы', desc: 'Возможность изучить впечатления других читателей и поделиться своими.' },
    { img: 'https://i.pinimg.com/736x/51/9f/e2/519fe2b05f7e157ee435e2c7d28acfe7.jpg', title: 'Скачивание книг', desc: 'Сохраняйте книги или добавляйте свои.' }
  ];

  // Модальное окно поиска через портал
  const SearchModal = () => {
    if (!searchResultBook) return null;
    return ReactDOM.createPortal(
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(58, 32, 64, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'var(--white)',
          width: '90%',
          maxWidth: '600px',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          position: 'relative',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '16px', color: 'var(--pink)' }}>
            Книга найдена:
          </h3>

          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginBottom: '20px',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '100px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {searchResultBook.coverImage ? (
                <img
                  src={searchResultBook.coverImage}
                  alt={searchResultBook.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '40px', color: '#ccc' }}>📖</span>
              )}
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
                «{searchResultBook.title}»
              </h4>
              <p style={{ color: 'var(--pink)', fontWeight: '700' }}>{searchResultBook.author}</p>
              <span style={{
                fontSize: '12px',
                background: 'var(--pink-light)',
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                marginTop: '6px',
                fontWeight: '600'
              }}>
                {searchResultBook.genre}
              </span>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--text)',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            {searchResultBook.desc}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setSearchResultBook(null)}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--white)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                localStorage.setItem('highlightBookId', searchResultBook.id);
                if (searchResultBook.genre) {
                  localStorage.setItem('highlightBookGenre', searchResultBook.genre);
                  localStorage.setItem('catalogGenreFilter', searchResultBook.genre);
                }
                setSearchResultBook(null);
                setSearchQuery('');
                if (setView) {
                  setView('catalog', { 
                    bookId: searchResultBook.id, 
                    genre: searchResultBook.genre 
                  });
                }
              }}
              style={{
                flex: 2,
                padding: '14px',
                background: 'var(--pink)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Перейти в каталог
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="fade-in-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{animationStyles}</style>
      
      <section style={{
        backgroundColor: 'var(--bg-pink-banner)',
        padding: '60px 40px 80px 40px',
        textAlign: 'center',
        width: '100%',
        borderRadius: '0 0 40px 40px',
        boxShadow: '0 4px 20px rgba(231, 58, 152, 0.02)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '42px', 
            color: 'var(--text)', 
            marginBottom: '24px', 
            lineHeight: '1.4', 
            fontWeight: '900',
            letterSpacing: '-0.5px'
          }}>
            Коллекция произведений, {' '}
            <span style={{ 
              color: '#D46A9B',
              fontWeight: '900',
              background: '#FAEBF1',
              padding: '2px 14px',
              borderRadius: '12px',
              display: 'inline-block',
              marginTop: '10px'
            }}>
              проверенная временем и поколениями.
            </span>
            Здесь вы найдете книгу по душе!
          </h1>
          
          <div style={{
            position: 'relative',
            maxWidth: '750px',
            margin: '50px auto 0 auto'
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '-40px',
              right: '-40px',
              bottom: '-40px',
              background: 'rgba(231, 58, 152, 0.45)',
              filter: 'blur(150px)',
              borderRadius: '220px',
              zIndex: 0,
              pointerEvents: 'none'
            }} />

            <form onSubmit={handleSearchSubmit} style={{
              position: 'relative',
              display: 'flex',
              background: 'var(--white)',
              borderRadius: '50px',
              padding: '12px 14px',
              boxShadow: '0 0 30px rgba(231, 58, 152, 0.4), 0 8px 30px rgba(231, 58, 152, 0.12)',
              border: '1px solid var(--border)',
              zIndex: 1
            }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название книги или автора..." 
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', padding: '0 28px', fontSize: '18px', fontFamily: 'inherit', color: 'var(--text)' }}
              />
              <button type="submit" style={{ background: 'var(--pink)', color: 'var(--white)', border: 'none', borderRadius: '30px', padding: '16px 40px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Найти
              </button>
            </form>
          </div>

          {searchError && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#ffe6eb',
              color: 'var(--pink)',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              border: '1px solid rgba(231, 58, 152, 0.2)',
              maxWidth: '600px',
              margin: '20px auto 0 auto'
            }}>
              {searchError}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: '1400px', width: '100%', padding: '60px 40px' }}>
        
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' }}>
            Возможности сайта
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {features.map((f, i) => (
              <div 
                key={i} 
                style={{ 
                  position: 'relative', 
                  background: 'var(--white)', 
                  padding: '30px', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border)', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'var(--pink)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '150px', height: '150px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--pink-light)', flexShrink: 0 }}>
                    <img src={f.img} alt={f.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5', fontWeight: '500' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '60px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '60px' }}>
          
          <div style={{ 
            background: 'var(--white)', 
            padding: '30px', 
            borderRadius: '16px', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow)' 
          }}>
            
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700' }}>
              Оставить отзыв
            </h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Ваше имя</label>
                  <input 
                    type="text" 
                    value={reviewName} 
                    onChange={(e) => setReviewName(e.target.value)} 
                    style={inputStyle} 
                    placeholder="Иван Иванов" 
                    required 
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Выберите книгу</label>
                  <select 
                    value={reviewBook} 
                    onChange={(e) => setReviewBook(e.target.value)} 
                    style={inputStyle}
                  >
                    {allBookTitles.length === 0 ? (
                      <option value="">Загрузка книг...</option>
                    ) : (
                      allBookTitles.map((title, index) => (
                        <option key={index} value={title}>«{title}»</option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label style={labelStyle}>Ваша оценка</label>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    fontSize: '30px', 
                    cursor: 'pointer', 
                    padding: '8px 0',
                    userSelect: 'none'
                  }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ 
                          color: star <= (hoverRating || reviewRating) ? '#ffb100' : '#e2e8f0',
                          transition: 'all 0.15s ease',
                          transform: star <= (hoverRating || reviewRating) ? 'scale(1.1)' : 'scale(1)',
                          display: 'inline-block'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Ваш отзыв</label>
                  <textarea 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    style={{ 
                      ...inputStyle, 
                      height: '100px', 
                      resize: 'vertical',
                      minHeight: '80px',
                      maxHeight: '200px'
                    }} 
                    placeholder="Поделитесь впечатлениями о книге..." 
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  style={{
                    ...buttonStyle,
                    background: 'var(--pink)',
                    color: 'var(--white)',
                    padding: '14px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(231, 58, 152, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: 'none',
                    fontWeight: '700',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(231, 58, 152, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 58, 152, 0.3)';
                  }}
                >
                  Опубликовать отзыв
                </button>
              </form>
            ) : (
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #fef2f6 0%, #fce8ef 100%)',
                borderRadius: '16px',
                minHeight: '280px',
                textAlign: 'center',
                border: '2px dashed rgba(231, 58, 152, 0.2)'
              }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
                
                <h4 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  Доступно только для авторизованных пользователей
                </h4>
                
                <p style={{ 
                  fontSize: '14px', 
                  color: 'var(--text-light)',
                  maxWidth: '320px',
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Войдите в свой аккаунт, чтобы оставлять отзывы, 
                  сохранять книги в избранное и управлять своей библиотекой.
                </p>
                
                <button 
                  onClick={() => setView('auth')}
                  style={{
                    padding: '14px 40px',
                    background: 'var(--pink)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 6px 20px rgba(231, 58, 152, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(231, 58, 152, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 58, 152, 0.3)';
                  }}
                >
                  Войти в аккаунт
                </button>
                
                <p style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-light)',
                  marginTop: '16px'
                }}>
                  Ещё нет аккаунта?{' '}
                  <span 
                    onClick={() => setView('auth')}
                    style={{ 
                      color: 'var(--pink)', 
                      fontWeight: '700',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px'
                    }}
                  >
                    Зарегистрироваться
                  </span>
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700' }}>
              Последние отзывы читателей
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '400', 
                color: 'var(--text-light)',
                marginLeft: '8px'
              }}>
                ({allReviews.length})
              </span>
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              maxHeight: '420px', 
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {allReviews.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: 'var(--text-light)',
                  background: 'var(--pink-light)',
                  borderRadius: '12px'
                }}>
                  <p style={{ fontSize: '16px' }}>Пока нет отзывов</p>
                  <p style={{ fontSize: '14px' }}>Будьте первым, кто поделится впечатлениями!</p>
                </div>
              ) : (
                allReviews.map(r => (
                  <div 
                    key={r.id} 
                    style={{ 
                      background: 'var(--white)', 
                      padding: '20px', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = 'var(--pink)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{r.name}</strong>
                      <span style={{ color: '#ffb100', letterSpacing: '1px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--pink)', 
                      fontWeight: '700', 
                      marginBottom: '8px' 
                    }}>
                      {r.bookTitle.startsWith('«') ? r.bookTitle : `«${r.bookTitle}»`}
                    </div>
                    <p style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-light)', 
                      lineHeight: '1.5',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {r.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--pink-light)', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--pink)' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '700' }}>Остались вопросы или предложения?</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '24px', fontWeight: '500' }}>
            Напишите администрации цифровой библиотеки
          </p>
          <form onSubmit={handleFeedbackSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="email" 
              value={feedbackEmail} 
              onChange={(e) => setFeedbackEmail(e.target.value)} 
              style={inputStyle} 
              placeholder="Ваш Email для связи" 
              required 
            />
            <textarea 
              value={feedbackMessage} 
              onChange={(e) => setFeedbackMessage(e.target.value)} 
              style={{ ...inputStyle, height: '80px', resize: 'none' }} 
              placeholder="Текст вашего сообщения..." 
              required
            />
            <button 
              type="submit" 
              style={{ 
                ...buttonStyle, 
                background: 'var(--text)', 
                color: 'var(--white)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Отправить сообщение
            </button>
          </form>
          {feedbackStatus && (
            <div style={{ 
              marginTop: '15px', 
              padding: '12px 20px',
              borderRadius: '10px',
              backgroundColor: feedbackStatus.includes('отправлено') ? '#dcfce7' : 
                              feedbackStatus.includes('Ошибка') ? '#fee2e2' : 
                              feedbackStatus.includes('Отправка') ? '#fef3c7' : '#f3f4f6',
              color: feedbackStatus.includes('отправлено') ? '#16a34a' : 
                     feedbackStatus.includes('Ошибка') ? '#dc2626' : 
                     feedbackStatus.includes('Отправка') ? '#d97706' : '#374151'
            }}>
              {feedbackStatus}
            </div>
          )}
        </div>

      </div>

      {/* Модальное окно поиска (через портал) */}
      <SearchModal />
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--text)' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' };
const buttonStyle = { width: '100%', padding: '11px', background: 'var(--pink)', color: 'var(--white)', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' };

export default Home;
