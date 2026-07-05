import React, { useState } from 'react';

// ============================================================
// 1. СТИЛИ ДЛЯ АНИМАЦИИ (скопировано из Home.jsx)
// ============================================================
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

// ============================================================
// 2. ОБЪЕКТ ICONS — набор SVG-иконок
// ============================================================
const Icons = {
  Heart: ({ filled = false, ...props }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'var(--pink)' : 'none'}
        stroke={filled ? 'var(--pink)' : 'var(--text-light)'}
        strokeWidth="1.5"
      />
    </svg>
  ),
  Pencil: (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="var(--pink)"
      />
    </svg>
  ),
  Star: ({ filled = false, ...props }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? '#ffb100' : 'none'}
        stroke={filled ? '#ffb100' : '#ccc'}
        strokeWidth="1.5"
      />
    </svg>
  ),
  Quote: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4"></path>
      <path d="M16 3v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V3"></path>
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
        fill="currentColor"
      />
    </svg>
  ),
  Trash: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
};

// ============================================================
// 3. ОСНОВНОЙ КОМПОНЕНТ ПРОФИЛЯ
// ============================================================
function Profile({ 
  user,
  onLogout,
  favorites,
  myReviews,
  onRemoveFavorite,
  booksList,
  onDeleteQuote,
  onDeleteReview
}) {
  const [activeSection, setActiveSection] = useState(null);

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return fullName.slice(0, 2).toUpperCase();
  };

  const booksWithQuotes = booksList?.filter(book => book.quotes && book.quotes.length > 0) || [];

  return (
    <>
      <style>{animationStyles}</style>

      <div
        className="fade-in-container"
        style={{
          width: '800px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: '40px auto',
          padding: '40px 32px',
          background: 'var(--white)',
          borderRadius: '32px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,142,0.25) 0%, transparent 60%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,182,193,0.35) 0%, transparent 60%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--pink-light), var(--pink))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--white)',
                boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
                marginBottom: '16px',
              }}
            >
              {getInitials(user?.fullName)}
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px', color: 'var(--text)' }}>
              {user?.fullName || 'Пользователь'}
            </h2>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-light)' }}>
              {user?.email || 'email@example.com'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <button
              onClick={() => setActiveSection(activeSection === 'favorites' ? null : 'favorites')}
              style={{
                ...cardButtonStyle,
                background: activeSection === 'favorites' ? 'var(--pink-light)' : 'var(--white)',
                borderColor: activeSection === 'favorites' ? 'var(--pink)' : 'var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <Icons.Heart filled={activeSection === 'favorites'} />
                <span style={{ fontWeight: '600', fontSize: '15px', flex: 1 }}>Избранное</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--pink)' }}>
                  {favorites?.length || 0}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection(activeSection === 'reviews' ? null : 'reviews')}
              style={{
                ...cardButtonStyle,
                background: activeSection === 'reviews' ? 'var(--pink-light)' : 'var(--white)',
                borderColor: activeSection === 'reviews' ? 'var(--pink)' : 'var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <Icons.Pencil />
                <span style={{ fontWeight: '600', fontSize: '15px', flex: 1 }}>Отзывы</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--pink)' }}>
                  {myReviews?.length || 0}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection(activeSection === 'quotes' ? null : 'quotes')}
              style={{
                ...cardButtonStyle,
                background: activeSection === 'quotes' ? 'var(--pink-light)' : 'var(--white)',
                borderColor: activeSection === 'quotes' ? 'var(--pink)' : 'var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <Icons.Quote />
                <span style={{ fontWeight: '600', fontSize: '15px', flex: 1 }}>Цитаты</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--pink)' }}>
                  {booksWithQuotes.reduce((acc, book) => acc + book.quotes.length, 0)}
                </span>
              </div>
            </button>
          </div>

          {/* ============================================================
              ОБЁРТКА С МАКСИМАЛЬНОЙ ВЫСОТОЙ (МЕСТО ПО ФАКТУ ДОБАВЛЕНИЯ)
          ============================================================ */}
          <div style={{ maxHeight: activeSection ? '400px' : '0px', overflowY: 'auto', marginBottom: activeSection ? '32px' : '0px', transition: 'all 0.3s ease' }}>
            {activeSection === 'favorites' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
                  <Icons.Heart filled style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Избранные книги
                </h3>
                {favorites?.length === 0 ? (
                  <p style={emptyMessageStyle}>Вы ещё не добавили ни одной книги в избранное</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {favorites.map((book) => (
                      <div key={book.id} style={{ ...itemCardStyle, width: '100%', boxSizing: 'border-box' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text)' }}>
                            «{book.title}»
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--pink)', fontWeight: '500' }}>
                            {book.author}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFavorite(book.id)}
                          style={removeButtonStyle}
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'reviews' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
                  <Icons.Pencil style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Мои отзывы
                </h3>
                {myReviews?.length === 0 ? (
                  <p style={emptyMessageStyle}>Вы ещё не написали ни одного отзыва</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myReviews.map((rev, index) => (
                      <div key={index} style={{ ...itemCardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>
                            «{rev.bookTitle}»
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', gap: '2px' }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icons.Star key={i} filled={i < rev.rating} />
                              ))}
                            </span>
                            <button onClick={() => onDeleteReview(index)} style={{ ...removeButtonStyle, padding: '4px 8px', fontSize: '12px' }}>
                              <Icons.Trash />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                          {rev.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'quotes' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
                  <Icons.Quote style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Любимые цитаты
                </h3>
                {booksWithQuotes.length === 0 ? (
                  <p style={emptyMessageStyle}>Вы ещё не добавили ни одной цитаты</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {booksWithQuotes.map((book) => (
                      <div key={book.id} style={{ background: '#fff0f5', padding: '20px', borderRadius: '24px', border: '1px solid #ffb6c1' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: 'var(--text)' }}>
                          «{book.title}» <span style={{ fontSize: '13px', color: 'var(--pink)', fontWeight: '500' }}>{book.author}</span>
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {book.quotes.map((quote, idx) => (
                            <div key={idx} style={{ background: 'var(--white)', padding: '14px 18px', borderRadius: '14px', borderLeft: '4px solid var(--pink)', fontSize: '14px', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                              <span style={{ color: 'var(--text)', lineHeight: '1.5' }}>«{quote}»</span>
                              {onDeleteQuote && (
                                <button 
                                  onClick={() => onDeleteQuote(book.id, idx)} 
                                  style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px', opacity: 0.7, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                  title="Удалить цитату"
                                >
                                  <Icons.Trash />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#f87171';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            <Icons.Logout />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// 13. ВЫНЕСЕННЫЕ СТИЛИ
// ============================================================
const cardButtonStyle = {
  padding: '16px 20px',
  borderRadius: '16px',
  border: '1.5px solid var(--border)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.25s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  background: 'var(--white)',
  color: 'var(--text)',
};

const itemCardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'var(--pink-light)',
  padding: '16px 20px',
  borderRadius: '14px',
  border: '1px solid transparent',
  transition: 'border 0.2s',
};

const removeButtonStyle = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '6px 14px',
  cursor: 'pointer',
  fontSize: '13px',
  color: 'var(--text-light)',
  fontFamily: 'inherit',
  transition: '0.2s',
};

const emptyMessageStyle = {
  color: 'var(--text-light)',
  textAlign: 'center',
  padding: '32px 20px',
  background: 'var(--pink-light)',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: '500',
};

export default Profile;