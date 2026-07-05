import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Team from './pages/Team';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import About from './pages/About';

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const [view, setView] = useState(() => {
    return localStorage.getItem('currentView') || 'home';
  }); 
  //состояние для книги, которую читают онлайн
  const [readingBook, setReadingBook] = useState(null);
  //Единый список книг, доступный и для Catalog, и для Profile
  const [booksList, setBooksList] = useState([]);
  //состояние для отзывов
  const [allReviews, setAllReviews] = useState([]); 
  //состояние для пользователя
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  //Ref для отслеживания загруженного пользователя 
  const loadedUserIdRef = useRef(null);
  // Функция добавления книги в глобальный стейт, которая передается в Catalog
  const handleAddNewBook = (newBook) => {
    setBooksList(prevBooks => [...prevBooks, newBook]);
  };
  // Функция удаления книги из глобального стейта 
  const handleDeleteBookFromList = (updatedList) => {
    setBooksList(updatedList);
  };
  //Первонициализация или загрузка с сервера книг
  useEffect(() => {
    fetch(`${API_URL}/api/books?_=` + Date.now())
      .then(response => response.json())
      .then(data => {
        const initializedData = data.map(book => ({
          ...book,
          quotes: book.quotes || []
        }));
        // Проверяем наличие локальных данных(сохраненных пользователем)
        if (user && user.id) {
          const savedBooks = localStorage.getItem(`booksList_${user.id}`);
          if (savedBooks) {
            setBooksList(JSON.parse(savedBooks));
            return;
          }
        }
        setBooksList(initializedData);
      })
      .catch(error => console.error("Ошибка загрузки книг:", error));
  }, [API_URL, user?.id]);
    // Загрузка отзывов с сервера
  useEffect(() => {
    fetch(`${API_URL}/api/reviews?_=` + Date.now())
      .then(response => response.json())
      .then(data => {
        setAllReviews(data);
      })
      .catch(error => console.error("Ошибка загрузки отзывов:", error));
  }, [API_URL]);

  //Загрузка данных из localStorage при смене пользователя 
  useEffect(() => {
    if (user && user.id) {
      // Загружаем данные только если это новый пользователь
      if (loadedUserIdRef.current !== user.id) {
        loadedUserIdRef.current = user.id;
        
        const savedNotif = localStorage.getItem(`notifications_${user.id}`);
        setNotifications(savedNotif ? JSON.parse(savedNotif) : []);
        
        const savedFav = localStorage.getItem(`favorites_${user.id}`);
        setFavorites(savedFav ? JSON.parse(savedFav) : []);
        
        const savedReviews = localStorage.getItem(`myReviews_${user.id}`);
        setMyReviews(savedReviews ? JSON.parse(savedReviews) : []);
        
        const savedBooks = localStorage.getItem(`booksList_${user.id}`);
        if (savedBooks) {
          setBooksList(JSON.parse(savedBooks));
        }
      }
    } else {
      loadedUserIdRef.current = null;
      setNotifications([]);
      setFavorites([]);
      setMyReviews([]);
      setBooksList([]);
    }
  }, [user?.id]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        if (!response.ok) throw new Error('Сессия недействительна');
        return response.json();
      })
      .then(data => {
        if (data.id) {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } else {
          handleLogout();
        }
      })
      .catch(err => {
        console.error("Ошибка проверки сессии:", err);
        handleLogout();
      });
    }
  }, [API_URL]);

  useEffect(() => {
    if (user && user.id && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  useEffect(() => {
    if (user && user.id && favorites.length > 0) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user?.id]);

  // Сохраняем массив, даже если он пустой (чтобы удаление корректно синхронизировалось с localStorage)
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem(`myReviews_${user.id}`, JSON.stringify(myReviews));
    }
  }, [myReviews, user?.id]);

  // Сохранение списка книг (с цитатами) в localStorage при каждом его изменении
  useEffect(() => {
    if (user && user.id && booksList && booksList.length > 0) {
      localStorage.setItem(`booksList_${user.id}`, JSON.stringify(booksList));
    }
  }, [booksList, user?.id]);

  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  const handleSetUser = (userData, isLogin = true) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    const savedFav = localStorage.getItem(`favorites_${userData.id}`);
    setFavorites(savedFav ? JSON.parse(savedFav) : []);
    
    const savedReviews = localStorage.getItem(`myReviews_${userData.id}`);
    setMyReviews(savedReviews ? JSON.parse(savedReviews) : []);
    
    const savedNotif = localStorage.getItem(`notifications_${userData.id}`);
    setNotifications(savedNotif ? JSON.parse(savedNotif) : []);
    
    const savedBooks = localStorage.getItem(`booksList_${userData.id}`);
    if (savedBooks) {
      setBooksList(JSON.parse(savedBooks));
    }
    
    //Устанавливаем ref для предотвращения повторной загрузки
    loadedUserIdRef.current = userData.id;
    
    const name = userData.fullName?.split(' ')[0] || 'пользователь';
    if (isLogin) {
      addNotification(`С возвращением, ${name}!`);
    } else {
      addNotification(`Регистрация прошла успешно! Добро пожаловать, ${name}!`);
    }
  };

  const addNotification = (text) => {
    const newNotif = { id: Date.now(), text, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (user && user.id) {
      localStorage.removeItem(`notifications_${user.id}`);
    }
  };

  const handleAddFavorite = (book) => {
    if (!user) {
      alert('Сначала войдите в аккаунт, чтобы добавлять книги в избранное!');
      setView('auth');
      return;
    }
    const isFav = favorites.some(b => b.id === book.id);
    if (isFav) {
      setFavorites(favorites.filter(b => b.id !== book.id));
      addNotification(`Книга «${book.title}» удалена из избранного.`);
    } else {
      setFavorites([...favorites, book]);
      addNotification(`Книга «${book.title}» добавлена в избранное.`);
    }
  };

  const handleRemoveFavorite = (bookId, bookTitle) => {
    setFavorites(favorites.filter(b => b.id !== bookId));
    addNotification(`Книга "${bookTitle}" удалена из избранного`);
  };

  const handleAddMyReview = (review) => {
    if (user && user.id) {
      setMyReviews(prevReviews => [review, ...prevReviews]);
    } else {
      alert('Сначала войдите в аккаунт, чтобы оставлять отзывы!');
    }
  };

  const addReview = async (reviewData) => { 
    // Проверка авторизации
    const token = localStorage.getItem('userToken');
    if (!token) {
      addNotification('Для отправки отзыва необходимо войти в аккаунт!');
      return;
    }
    try {
      //Отправка запроса на сервер
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      //Обработка ошибки авторизации
      if (response.status === 401) {
        addNotification('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        setUser(null);
        setView('auth');
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      // Получаем созданный отзыв с сервера
      const data = await response.json();
      const newReview = data.review; 

      setAllReviews(prev => [newReview, ...prev]);
      //добавляем отзыв в конкретную книгу
      setBooksList(prevBooks =>
        prevBooks.map(book => {
          if (book.title === reviewData.bookTitle) {
            //Добавляем отзыв в массив reviews книги
            return {
              ...book,
              reviews: [newReview, ...(book.reviews || [])]
            };
          }
          return book;
        })
      );
      //Добавляем в "Мои отзывы" 
      if (user) {
        setMyReviews(prev => [{
          bookTitle: reviewData.bookTitle,
          text: reviewData.text,
          rating: reviewData.rating,
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
      addNotification(`Пользователь ${reviewData.name} оставил рецензию на книгу «${reviewData.bookTitle}».`);
      return newReview; //Возвращаем созданный отзыв
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      addNotification('Ошибка при сохранении отзыва. Проверьте соединение с сервером.');
      throw error;
    }
  };  

const handleDeleteReview = (index) => {
  // Находим отзыв, который нужно удалить
  const reviewToDelete = myReviews[index];
  if (!reviewToDelete) return;

  // 1. Удаляем из личных отзывов пользователя
  setMyReviews(prev => prev.filter((_, i) => i !== index));

  // 2. Удаляем из глобального списка всех отзывов (по совпадению полей)
  setAllReviews(prev => prev.filter(r => 
    !(r.bookTitle === reviewToDelete.bookTitle && 
      r.text === reviewToDelete.text && 
      r.rating === reviewToDelete.rating &&
      r.name === user?.fullName) // или r.name === user?.fullName, если в отзыве хранится имя
  ));

  // 3. Удаляем из списка книг (из конкретной книги)
  setBooksList(prevBooks =>
    prevBooks.map(book => {
      if (book.title === reviewToDelete.bookTitle) {
        // Фильтруем отзывы в книге
        const updatedReviews = book.reviews.filter(r => 
          !(r.text === reviewToDelete.text && 
            r.rating === reviewToDelete.rating &&
            r.user === user?.fullName) // проверяем по имени пользователя
        );
        return {
          ...book,
          reviews: updatedReviews
        };
      }
      return book;
    })
  );

  addNotification(`Отзыв о книге «${reviewToDelete.bookTitle}» удален.`);
};

  const handleAddQuote = (bookId, newQuote) => {
    setBooksList(prevBooks =>
      prevBooks.map(b => {
        if (b.id === bookId) {
          return { ...b, quotes: [...(b.quotes || []), newQuote] };
        }
        return b;
      })
    );
  };

  const handleDeleteQuote = (bookId, quoteIndex) => {
    setBooksList(prevBooks =>
      prevBooks.map(b => {
        if (b.id === bookId) {
          const newQuotes = b.quotes.filter((_, idx) => idx !== quoteIndex);
          return { ...b, quotes: newQuotes };
        }
        return b;
      })
    );
  };

  const handleLogout = () => {
    if (user && user.id) {
      localStorage.removeItem(`booksList_${user.id}`);
    }
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setNotifications([]);
    setFavorites([]);
    setMyReviews([]);
    setReadingBook(null);
    loadedUserIdRef.current = null;
    setView('home');
  };

  // Переключение в режим чтения книги онлайн
  const handleReadOnline = (book) => {
    setReadingBook(book);
    setView('reader');
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        setView={setView} 
        user={user} 
        onLogout={handleLogout} 
        notificationsCount={notifications.length}
        onResetNotifications={clearNotifications}
        notifications={notifications}
      />
      
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        {view === 'home' && (
          <Home 
            setView={setView} 
            onAddMyReview={handleAddMyReview} 
            user={user}
            allReviews={allReviews}    
            addReview={addReview}      
          />
        )}
        
        {view === 'catalog' && (
          <Catalog 
            user={user}
            favorites={favorites}
            onAddFavorite={handleAddFavorite}
            onAddMyReview={handleAddMyReview}
            onAddNotification={addNotification}
            booksList={booksList}
            onBookAdded={handleAddNewBook}
            onBookDeleted={handleDeleteBookFromList}
            onAddQuote={handleAddQuote}
            onDeleteQuote={handleDeleteQuote}
            onReadOnline={handleReadOnline}
            allReviews={allReviews}    
            addReview={addReview}   
            myReviews={myReviews}      
            onDeleteReview={handleDeleteReview} 
            key="catalog" 
          />
        )}

        {view === 'auth' && <Auth setUser={handleSetUser} setView={setView} />}
        {view === 'about' && <About />}
        {view === 'team' && <Team />}
        
        {view === 'profile' && (
          <Profile 
            user={user} 
            onLogout={handleLogout}
            favorites={favorites}
            myReviews={myReviews}
            onRemoveFavorite={handleRemoveFavorite}
            booksList={booksList}
            onDeleteQuote={handleDeleteQuote}
            onDeleteReview={handleDeleteReview}
          />
        )}

        {/* Страница онлайн-просмотра (читалки) */}
        {view === 'reader' && readingBook && (
          <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '60px 40px', flex: '1', boxSizing: 'border-box' }}>
            <button onClick={() => setView('catalog')} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', padding: '12px 24px', borderRadius: '16px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.color = 'var(--pink)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Назад в каталог
            </button>
            
            <div style={{ background: 'var(--white)', borderRadius: '28px', border: '1px solid var(--border)', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px', color: 'var(--text)', lineHeight: '1.2' }}>{readingBook.title}</h2>
              <p style={{ fontSize: '16px', color: 'var(--text-light)', margin: '0 0 32px', fontWeight: '700' }}>{readingBook.author}</p>
              
              <div style={{ borderRadius: '20px', overflow: 'hidden', border: '2px dashed #fce7f3', background: '#fdf2f8', padding: '32px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '16px', color: 'var(--pink)', fontWeight: '700', marginBottom: '24px', fontStyle: 'italic' }}>PDF-документ отображается в окне онлайн-просмотра</p>
                {readingBook.pdfUrl && (
                  <embed src={readingBook.pdfUrl} width="100%" height="650px" type="application/pdf" style={{ borderRadius: '12px', border: 'none' }} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer setView={setView} />
    </div>
  );
}

export default App;