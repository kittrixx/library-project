import React, { useState } from 'react'; 
// Подключаем React и хук useState для управления состоянием

// --- CSS-анимация, записанная в строку (будет вставлена в <style>) ---
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

// --- Иконки-компоненты (возвращают SVG) ---
// Принимают пропс gId для использования общего градиента
const CatalogIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M4 19V5C4 3.895 4.895 3 6 3H19.4C19.7 3 20 3.3 20 3.6V16.4C20 16.7 19.7 17 19.4 17H6C4.9 17 4 17.9 4 19ZM4 19C4 20.1 4.9 21 6 21H20" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M9 8H15M9 12H13" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const FavoritesIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const ReviewsIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C9.5 21 7.5 20.25 6 19L3 21L4.5 16.5C3.5 15 3 13.25 3 11.5C3 6.25 7.25 2 12.5 2C17.75 2 21 6.25 21 11.5Z" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const NotificationIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M18 8C18 6.4 17.3 4.8 16.2 3.7C15.1 2.6 13.5 2 12 2C10.5 2 8.9 2.6 7.8 3.7C6.7 4.8 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 21C10.5 21.7 11.2 22 12 22C12.8 22 13.5 21.7 14 21" stroke={`url(#${gId})`} strokeWidth="1.8"/>
  </svg>
);

const LibraryIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M12 3V21M3 8H21M3 16H21" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const SupportIcon = ({ gId }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <path d="M21 15V16.6C21 17.8 21 18.4 20.7 18.9C20.5 19.3 20.2 19.7 19.7 19.9C19.3 20.2 18.7 20.2 17.4 20.2H6.5C5.3 20.2 4.7 20.2 4.2 19.9C3.8 19.7 3.4 19.3 3.2 18.9C3 18.4 3 17.8 3 16.6V15M7 9H17M7 5H17" stroke={`url(#${gId})`} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

// --- Иконки-символы настроения (принимают active и color) ---
const SymbolCozy = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 3v2M10 3v2M14 3v2" /></svg>);
const SymbolEnergy = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const SymbolFocus = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>);
const SymbolFlow = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12c3 0 3-6 6-6s3 6 6 6 3-6 6-6" stroke={active ? "white" : color} strokeWidth="2.5" strokeLinecap="round" /><path d="M3 16c3 0 3-4 6-4s3 4 6 4 3-4 6-4" stroke={active ? "white" : color} strokeWidth="2.5" strokeLinecap="round" opacity={active ? "1" : "0.7"} /></svg>);
const SymbolRomance = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
const SymbolInspiration = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke={active ? "white" : color} strokeWidth="2.5" strokeLinecap="round" /></svg>);
const SymbolNostalgia = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={active ? "white" : color} strokeWidth="2" /><path d="M12 6v6l4 2" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const SymbolLightness = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17" y1="15" x2="9" y2="23" /></svg>);
const SymbolPsychology = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20M12 2a10 10 0 0 1 10 10" /></svg>);
const SymbolKids = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /></svg>);
const SymbolMystery = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z" /><path d="M12 22v-3" /></svg>);
const SymbolFantasy = ({ active, color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></svg>);

// --- Основной компонент About ---
const About = () => {
  // Хук состояния: activeMood хранит выбранный объект настроения или null
  const [activeMood, setActiveMood] = useState(null);
  const gId = 'mainIconGradient'; // идентификатор для градиента

  // Массив данных для кнопок настроения
  const moods = [
    { sym: SymbolCozy, label: 'Уют', color: '#fff9f2', accent: 'var(--pink)', result: 'Расслабляющая атмосфера: неспешная классика или теплый роман' },
    { sym: SymbolEnergy, label: 'Энергия', color: '#f8f4ff', accent: '#8e2de2', result: 'Заряд бодрости: мотивирующий нон-фикшн и бизнес-литература' },
    { sym: SymbolFocus, label: 'Фокус', color: '#f1f2f6', accent: '#2d3436', result: 'Глубокая концентрация: затягивающий детектив или научная фантастика' },
    { sym: SymbolFlow, label: 'Поток', color: '#f0fff4', accent: '#00b894', result: 'Плавное чтение: легкая поэзия или короткие рассказы' },
    { sym: SymbolNostalgia, label: 'Ностальгия', color: '#fffaf0', accent: '#7f8c8d', result: 'Приятные воспоминания: исторические книги, мемуары и классическая проза' },
    { sym: SymbolInspiration, label: 'Вдохновение', color: '#fffde6', accent: '#e67e22', result: 'Творческий подъем: биографии, искусство и философская проза' },
    { sym: SymbolRomance, label: 'Романтика', color: '#fff5f7', accent: '#ff758c', result: 'Сентиментальное настроение: любовные романы и драмы' },
    { sym: SymbolLightness, label: 'Легкость', color: '#f4f9f9', accent: '#3498db', result: 'Отдых и разгрузка: юмористические рассказы, приключения и комиксы' },
    { sym: SymbolFantasy, label: 'Магия', color: '#ede9fe', accent: '#7c3aed', result: 'Фэнтези: невероятные миры и захватывающие приключения' },
    { sym: SymbolPsychology, label: 'Глубина', color: '#e0f2fe', accent: '#0284c7', result: 'Познание: глубокая психология и саморазвитие' },
    { sym: SymbolKids, label: 'Свет', color: '#fef3c7', accent: '#d97706', result: 'Детство: добрые сказки и искренние истории' },
    { sym: SymbolMystery, label: 'Интрига', color: '#f3f4f6', accent: '#374151', result: 'Загадка: запутанные сюжеты и детективы' }
  ];

  // Возвращаемый JSX (разметка)
  return (
    <div className="fade-in-container" style={{ position: 'relative', maxWidth: '1140px', margin: '60px auto', padding: '80px 50px', backgroundColor: 'var(--white)', borderRadius: '45px', boxShadow: '0 50px 120px rgba(0,0,0,0.07)', color: 'var(--text)', fontFamily: "'Montserrat', sans-serif", textAlign: 'center', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.03)' }}>
      {/* Вставляем CSS-стили анимации внутрь компонента */}
      <style>{animationStyles}</style>
      {/* Определяем градиент для иконок (используется в stroke) */}
      <svg width="0" height="0"><defs><linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: 'var(--pink)' }} /><stop offset="100%" style={{ stopColor: '#8e2de2' }} /></linearGradient></defs></svg>
      
      {/* Декоративные фоновые пятна (blur) */}
      <div style={{ position: 'absolute', top: '5%', left: '-25%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(255,107,142,0.3) 0%, transparent 65%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '35%', right: '-25%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(142,45,226,0.25) 0%, transparent 65%)', filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-15%', left: '15%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(0,184,148,0.2) 0%, transparent 65%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }}></div>

      {/* Основной контент (выше по z-index) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: 'var(--text)', marginBottom: '24px', fontSize: '48px', fontWeight: '800', letterSpacing: '-1.5px' }}>
          О сайте <span style={{ background: 'linear-gradient(90deg, var(--pink), #8e2de2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Цифовая библиотека</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-light)', marginBottom: '70px', maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto', fontWeight: '400', lineHeight: '1.7' }}>
          Мы верим, что технологии должны делать чтение приятным и доступным. Наша библиотека — это пространство, которое вы настраиваете под себя.
        </p>

        {/* Сетка из 6 карточек (удобный поиск, личный архив и т.д.) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {[ // массив объектов с иконкой, заголовком и описанием
            { i: CatalogIcon, t: 'Удобный поиск', d: 'Ищите нужные книги за пару секунд, используя гибкие фильтры и категории.' },
            { i: FavoritesIcon, t: 'Личный архив', d: 'Ваши полки с любимыми книгами и ключевыми цитатами всегда под рукой.' },
            { i: ReviewsIcon, t: 'Комьюнити', d: 'Делитесь впечатлениями и читайте отзывы других людей.' },
            { i: NotificationIcon, t: 'Оповещения', d: 'Будем держать в курсе добавления новых книг и обновлений каталога.' },
            { i: LibraryIcon, t: 'Своя полка', d: 'Стройте личную библиотеку, создавайте подборки и редактируйте каталог под себя.' },
            { i: SupportIcon, t: 'Поддержка', d: 'Возникли вопросы или что-то пошло не так? Напишите нам, мы быстро поможем.' }
          ].map((item, idx) => ( // перебираем массив, для каждого создаём карточку
            <div key={idx} style={{ padding: '35px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid #f2f2f2', borderRadius: '32px', textAlign: 'center', transition: 'all 0.4s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ marginBottom: '10px' }}><item.i gId={gId} /></div>
              <h3 style={{ fontSize: '21px', fontWeight: '700', marginTop: '12px', marginBottom: '12px' }}>{item.t}</h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-light)', margin: 0 }}>{item.d}</p>
            </div>
          ))}
        </div>

        {/* Блок выбора настроения */}
        <div style={{ position: 'relative', backgroundColor: activeMood ? activeMood.color : '#fbfbfb', border: '1.5px solid #efefef', borderRadius: '40px', padding: '70px 40px', transition: 'background-color 0.8s ease', overflow: 'hidden' }}>
          {/* Пульсирующий круг за текстом (анимация moodPulse) — появляется только при активном настроении */}
          {activeMood && (<div style={{ position: 'absolute', top: '50%', left: '50%', width: '120px', height: '120px', backgroundColor: activeMood.accent, borderRadius: '50%', transform: 'translate(-50%, -50%)', animation: 'moodPulse 2s infinite', opacity: 0.12, zIndex: 0 }}></div>)}
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text)', marginBottom: '40px', position: 'relative', zIndex: 1 }}>Настрой атмосферу чтения</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '45px', position: 'relative', zIndex: 1 }}>
            {moods.map((m, i) => {
              const isActive = activeMood?.label === m.label; // проверяем, выбрано ли это настроение
              return (
                <button key={i} onClick={() => setActiveMood(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '20px 28px', flex: '0 1 220px', backgroundColor: isActive ? m.accent : '#ffffff', border: '1px solid #f0f0f0', borderRadius: '26px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: isActive ? `0 25px 50px ${m.accent}40` : '0 4px 15px rgba(0,0,0,0.03)', transform: isActive ? 'scale(1.03)' : 'scale(1)' }}>
                  <m.sym active={isActive} color={m.accent} />
                  <span style={{ fontSize: '18px', fontWeight: '700', color: isActive ? '#fff' : '#444' }}>{m.label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ minHeight: '40px', position: 'relative', zIndex: 1 }}>
            {activeMood ? ( // если выбрано настроение, показываем рекомендацию
              <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.19, 1, 0.22, 1)' }}>
                <span style={{ color: activeMood.accent, fontSize: '22px', fontWeight: '700' }}>{activeMood.result}</span>
              </div>
            ) : ( // иначе выводим подсказку
              <span style={{ color: '#aaa', fontSize: '16px', fontWeight: '500', fontStyle: 'italic' }}>Выберите подходящее настроение, чтобы получить рекомендацию</span>
            )}
          </div>
        </div>
        
        <p style={{ fontSize: '18px', marginTop: '60px', color: 'var(--text)', fontWeight: '600', opacity: 0.6 }}>Приятного погружения в мир литературы!</p>
        {/* Дополнительные CSS-анимации (slideUp и moodPulse) */}
        <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes moodPulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; } 100% { transform: translate(-50%, -50%) scale(9); opacity: 0; } }`}</style>
      </div>
    </div>
  );
};

export default About; // экспортируем компонент для использования в других файлах