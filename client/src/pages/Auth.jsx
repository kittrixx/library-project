import React, { useState } from 'react';
// Импортируем React и хук useState. useState позволяет создавать переменные,
// изменения которых автоматически перерисовывают интерфейс (как "реактивные" данные).

function Auth({ setUser, setView }) {
  // Компонент Auth — это функция, которая возвращает разметку.
  // setUser и setView — это функции, переданные из родительского компонента.
  // Они нужны, чтобы сообщить приложению, кто вошёл и какую страницу показать.
  // По сути, это "каналы связи" с главным приложением.

  // --- Состояния (переменные, влияющие на отображение) ---
  const [isLogin, setIsLogin] = useState(true);
  // isLogin: true — показываем форму входа, false — форму регистрации.
  // setIsLogin — функция для изменения isLogin.
  // Начальное значение true (вход).

  const [email, setEmail] = useState('');
  // email: хранит то, что пользователь ввёл в поле "Электронная почта".
  // setEmail обновляет email при каждом нажатии клавиши.

  const [password, setPassword] = useState('');
  // password: аналогично для пароля.

  const [fullName, setFullName] = useState('');
  // fullName: для поля ФИО (используется только при регистрации).

  const [isLoading, setIsLoading] = useState(false);
  // isLoading: флаг, показывающий, идёт ли сейчас отправка запроса на сервер.
  // Используется, чтобы заблокировать кнопку и показать текст "Загрузка...".

  const [error, setError] = useState(null);
  // error: хранит текст ошибки, если она произошла. null — ошибки нет.

  // --- Обработчик переключения между вкладками "Войти" и "Регистрация" ---
  const handleTabToggle = (loginState) => {
    // loginState — true или false (какую вкладку активировать)
    setIsLogin(loginState);   // меняем режим
    setEmail('');            // очищаем все поля
    setPassword('');
    setFullName('');
    setError(null);          // сбрасываем предыдущую ошибку
  };

  // --- Обработчик отправки формы (клик по кнопке или Enter) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Отменяем стандартную перезагрузку страницы при отправке формы
    setIsLoading(true); // Включаем состояние загрузки (кнопка блокируется)
    setError(null);     // Сбрасываем старую ошибку

    // Формируем объект с данными пользователя в зависимости от режима
    const userData = isLogin
      ? { email, password }                      // если вход — только email и пароль
      : { fullName, email, password };          // если регистрация — добавляем ФИО

    // Адрес сервера: берём из переменной окружения или используем локальный
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      // Отправляем POST-запрос на сервер с помощью fetch
      const response = await fetch(`${API_URL}/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData), // превращаем объект в JSON-строку
      });

      // Ждём ответ от сервера и парсим его как JSON
      const data = await response.json();

      // Если ответ не успешный (код не 2xx) — выбрасываем ошибку
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка сервера');
      }

      // Всё хорошо: сохраняем токен и данные пользователя в localStorage
      // (это хранилище браузера, данные остаются после перезагрузки страницы)
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      // В зависимости от режима сообщаем родительскому компоненту о результате
      if (isLogin) {
        // Если вход — передаём пользователя и флаг "авторизован" (true)
        setUser(data.user, true);
        setView('profile'); // переключаем на страницу профиля
      } else {
        // Если регистрация — флаг "не авторизован" (false) и показываем домашнюю страницу
        setUser(data.user, false);
        setView('home');
      }
    } catch (err) {
      // Если произошла ошибка (сеть, сервер, валидация) — показываем понятное сообщение
      setError(err.message === 'Failed to fetch' ? 'Сервер (порт 3001) не отвечает' : err.message);
    } finally {
      // В любом случае (успех или ошибка) выключаем состояние загрузки
      setIsLoading(false);
    }
  };

  // --- Объекты со стилями для полей ввода и подписей ---
  // В React можно писать стили прямо в JavaScript и передавать через атрибут style
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    color: 'var(--text)',
    background: 'rgba(255,255,255,0.7)',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
  };

  // --- Возвращаемая разметка (JSX) ---
  // JSX похож на HTML, но с некоторыми отличиями (className вместо class, camelCase для стилей)
  return (
    <>
      {/* Встроенные CSS-стили для этого компонента */}
      <style>
        {`
          .auth-sunrise {
            background: #ffe4e9; /* статичный нежно-розовый фон */
            height: calc(100vh - 90px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 20px 20px;
            box-sizing: border-box;
            overflow-y: auto;
          }
          .auth-glass-card {
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            padding: 28px 32px;
            width: 100%;
            max-width: 440px;
            transition: all 0.3s ease;
          }
          @media (max-width: 500px) {
            .auth-glass-card {
              padding: 20px 16px;
              border-radius: 20px;
            }
          }
        `}
      </style>

      <div className="auth-sunrise">
        <div className="auth-glass-card">
          {/* Переключатель вкладок (Войти / Регистрация) */}
          <div
            style={{
              display: 'flex',
              marginBottom: '20px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <button
              onClick={() => handleTabToggle(true)}
              style={{
                flex: 1,
                padding: '10px',
                background: isLogin ? 'var(--pink)' : 'transparent',
                color: isLogin ? 'var(--white)' : 'var(--text-light)',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderRadius: isLogin ? '12px 0 0 12px' : '0',
              }}
            >
              Войти
            </button>
            <button
              onClick={() => handleTabToggle(false)}
              style={{
                flex: 1,
                padding: '10px',
                background: !isLogin ? 'var(--pink)' : 'transparent',
                color: !isLogin ? 'var(--white)' : 'var(--text-light)',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderRadius: !isLogin ? '0 12px 12px 0' : '0',
              }}
            >
              Регистрация
            </button>
          </div>

          {/* Заголовок формы — меняется в зависимости от режима */}
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              color: 'var(--text)',
              fontSize: '22px',
              fontWeight: '800',
              letterSpacing: '-0.3px',
            }}
          >
            {isLogin ? 'Авторизация' : 'Регистрация'}
          </h2>

          {/* Блок с ошибкой — отображается только если error не null */}
          {error && (
            <div
              style={{
                background: 'rgba(255, 230, 235, 0.8)',
                color: 'var(--pink)',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '14px',
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center',
                border: '1px solid rgba(231, 58, 152, 0.15)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {error}
            </div>
          )}

          {/* Сама форма */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Поле ФИО — показывается только при регистрации */}
            {!isLogin && (
              <div>
                <label style={labelStyle}>ФИО</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
            )}

            {/* Поле для email — всегда показано */}
            <div>
              <label style={labelStyle}>Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="username@spbgasu.ru"
                required
              />
            </div>

            {/* Поле для пароля — всегда показано */}
            <div>
              <label style={labelStyle}>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Укажите пароль"
                required
              />
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isLoading} // блокируем, если идёт загрузка
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--pink)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '15px',
                marginTop: '6px',
                fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(231, 58, 152, 0.25)',
                transition: 'transform 0.15s, box-shadow 0.2s',
              }}
              // Эффекты при наведении мыши (анимация без CSS)
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(231, 58, 152, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 58, 152, 0.25)';
              }}
            >
              {isLoading ? 'Загрузка...' : isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Ссылка для быстрого переключения между входом и регистрацией (под формой) */}
          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-light)' }}>
              {isLogin ? 'Нет аккаунта? ' : 'Уже зарегистрированы? '}
            </span>
            <span
              style={{
                color: 'var(--pink)',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
              onClick={() => handleTabToggle(!isLogin)}
            >
              {isLogin ? 'Создать аккаунт' : 'Войти'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;
// Экспортируем компонент, чтобы его можно было использовать в других файлах