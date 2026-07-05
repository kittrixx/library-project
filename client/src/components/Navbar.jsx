import React, { useState, useRef, useEffect } from 'react';
import logo from '../assets/logo.jpg';

/**
 * Компонент навигационной панели (Navbar)
 * 
 * Пропсы (входные данные):
 * - setView – функция для переключения страниц (принимает имя страницы)
 * - user – данные залогиненного пользователя или null, если не авторизован
 * - onLogout – функция выхода из системы
 * - notificationsCount – количество непрочитанных уведомлений (по умолчанию 0)
 * - onResetNotifications – функция для отметки всех уведомлений прочитанными
 * - notifications – массив уведомлений для отображения в выпадающем списке
 */
function Navbar({ setView, user, onLogout, notificationsCount = 0, onResetNotifications, notifications = [] }) {
  // Состояние: открыт ли выпадающий список уведомлений (true/false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ссылка на контейнер колокольчика и списка уведомлений, 
  // чтобы определить клики вне этой области (для автоматического закрытия)
  const dropdownRef = useRef(null);

  // Массив пунктов главного меню (ярлык и идентификатор страницы)
  const links = [
    { label: 'Главная', page: 'home' },
    { label: 'О сайте', page: 'about' },
    { label: 'Каталог', page: 'catalog' }, 
    { label: 'Команда', page: 'team' },
  ];

  // Хук эффекта, который выполняется один раз при монтировании компонента
  // Добавляет слушатель кликов по документу, чтобы закрывать дропдаун при клике вне его
  useEffect(() => {
    // Функция проверяет, был ли клик за пределами контейнера dropdownRef
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); // Закрываем список
      }
    }
    // Прикрепляем слушатель к событию mousedown
    document.addEventListener("mousedown", handleClickOutside);
    // Убираем слушатель при размонтировании компонента (чистка)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Пустой массив зависимостей – эффект запускается только один раз

  return (
    // Основной контейнер навигационной панели
    <nav style={{
      width: '100%',                   // Растягиваем на всю ширину
      backgroundColor: 'var(--white)', // Фон – белый (цвет из глобальных переменных)
      display: 'flex',                 // Включаем Flexbox
      justifyContent: 'space-between', // Логотип слева, меню справа
      alignItems: 'center',            // Выравнивание по вертикали по центру
      padding: '0 40px',               // Отступы по бокам
      height: '120px',                 // Фиксированная высота
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)', // Лёгкая тень
      position: 'sticky',              // Панель прилипает к верху
      top: 0,                          // Прилипаем к верхнему краю
      zIndex: 100,                     // Поверх остальных элементов
    }}>
      {/* Левая часть: логотип и название */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',         // Расстояние между логотипом и текстом
        flexShrink: 0        // Блок не сжимается при нехватке места
      }}>
        <img 
          src={logo} 
          alt="Логотип" 
          style={{ 
            height: '90px', 
            objectFit: 'contain' // Картинка масштабируется без искажений
          }} 
        />
        <span style={{ 
          color: 'var(--text)',           // Основной цвет текста
          fontSize: '28px',               // Крупный шрифт
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: '900',              // Максимальная жирность
          letterSpacing: '-0.5px',        // Слегка сжатый межбуквенный интервал
          textTransform: 'lowercase',     // Все буквы строчные
          lineHeight: '1'                 // Убираем лишние межстрочные интервалы
        }}>
          цифровая библиотека
        </span>
      </div>

      {/* Навигационные ссылки (список кнопок) */}
      <ul style={{ 
        display: 'flex',          // Горизонтальное расположение
        listStyle: 'none',        // Убираем маркеры списка
        gap: '6px',               // Расстояние между кнопками
        alignItems: 'center',     // Вертикальное выравнивание
        margin: 0, 
        padding: 0 
      }}>
        {/* Пункты меню из массива links */}
        {links.map((link) => (
          <li key={link.label}>
            <button
              onClick={() => setView && setView(link.page)} // Переключаем страницу
              style={navLinkButtonStyle}  // Базовые стили кнопки (вынесены ниже)
              onMouseOver={(e) => { 
                // При наведении – розовый фон и розовый текст
                e.target.style.background = 'var(--pink-light)'; 
                e.target.style.color = 'var(--pink)'; 
              }}
              onMouseOut={(e) => { 
                // При уходе мыши – возвращаем прозрачный фон и тёмный текст
                e.target.style.background = 'none'; 
                e.target.style.color = 'var(--text)'; 
              }}
            >
              {link.label}
            </button>
          </li>
        ))}

        {/* Кнопка «Личный кабинет» – отображается только если пользователь залогинен */}
        {user && (
          <li>
            <button
              onClick={() => setView('profile')}
              style={navLinkButtonStyle}
              onMouseOver={(e) => { 
                e.target.style.background = 'var(--pink-light)'; 
                e.target.style.color = 'var(--pink)'; 
              }}
              onMouseOut={(e) => { 
                e.target.style.background = 'none'; 
                e.target.style.color = 'var(--text)'; 
              }}
            >
              Личный кабинет
            </button>
          </li>
        )}

        {/* Блок уведомлений (колокольчик + выпадающий список) – только для залогиненных пользователей */}
        {user && (
          <li 
            style={{ 
              position: 'relative',          // Для позиционирования абсолютного списка внутри
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              marginLeft: '6px' 
            }} 
            ref={dropdownRef}                // Привязываем ссылку к этому контейнеру
          >
            {/* Кнопка-колокольчик */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Переключение видимости списка
              style={{ 
                ...navLinkButtonStyle,      // Расширяем базовый стиль
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '12px 16px',
                // Активное состояние: если список открыт – розовый фон и текст
                background: isDropdownOpen ? 'var(--pink-light)' : 'none',
                color: isDropdownOpen ? 'var(--pink)' : 'var(--text)'
              }}
              onMouseOver={(e) => { 
                e.target.style.background = 'var(--pink-light)'; 
                e.target.style.color = 'var(--pink)'; 
              }}
              onMouseOut={(e) => { 
                // При уходе мыши возвращаем стиль, но если дропдаун открыт – оставляем активный вид
                if (!isDropdownOpen) { 
                  e.target.style.background = 'none'; 
                  e.target.style.color = 'var(--text)'; 
                } 
              }}
            >
              {/* Векторная иконка колокольчика (SVG) */}
              <svg 
                width="26" 
                height="26" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"   // Наследует цвет текста кнопки
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ display: 'block' }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>

              {/* Бейдж с количеством непрочитанных уведомлений – показываем, если больше 0 */}
              {notificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '4px',
                  background: 'var(--pink)',
                  color: 'var(--white)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '2px 5px',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {notificationsCount}
                </span>
              )}
            </button>

            {/* Выпадающий список уведомлений – показывается, если isDropdownOpen === true */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',    // Привязываем к родителю (относительно li)
                right: 0,                // Прижимаем к правому краю
                top: '60px',             // Отступ сверху (чтобы не перекрывать кнопку)
                background: 'var(--white)',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                width: '320px',
                zIndex: 1000,            // Поверх остального
                padding: '20px',
                border: '1px solid var(--border)',
                maxHeight: '400px',      // Ограничение по высоте
                overflowY: 'auto'        // Скролл, если уведомлений много
              }}>
                {/* Заголовок и кнопка «Отметить как прочитанные» */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '15px', 
                  borderBottom: '1px solid var(--border)', 
                  paddingBottom: '10px' 
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '15px', 
                    fontWeight: '800', 
                    color: 'var(--text)' 
                  }}>
                    Уведомления
                  </h4>
                  
                  {/* Кнопка появляется, если есть хотя бы одно уведомление */}
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        if (onResetNotifications) onResetNotifications(); // Сбрасываем все уведомления
                        setIsDropdownOpen(false); // Закрываем дропдаун
                      }} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '12px', 
                        color: 'var(--pink)', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        padding: 0,
                        fontFamily: 'inherit'
                      }}
                      title="Отметить все как прочитанные"
                    >
                      ✓ Отметить как прочитанные
                    </button>
                  )}
                </div>

                {/* Тело списка: либо сообщение о пустоте, либо список уведомлений */}
                {notifications.length === 0 ? (
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px', 
                    color: 'var(--text-light)', 
                    textAlign: 'center', 
                    padding: '20px 0' 
                  }}>
                    Уведомлений пока нет
                  </p>
                ) : (
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px' 
                  }}>
                    {/* Перебираем массив уведомлений и выводим каждый */}
                    {notifications.map((note, index) => (
                      <li key={index} style={{ 
                        fontSize: '12px', 
                        padding: '10px 12px', 
                        background: 'var(--pink-light)', 
                        borderRadius: '10px', 
                        color: 'var(--text)', 
                        lineHeight: '1.4' 
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          gap: '10px' 
                        }}>
                          <span style={{ flex: 1 }}>{note.text}</span> {/* Текст уведомления */}
                          <span style={{ 
                            fontSize: '10px', 
                            color: 'var(--text-light)', 
                            whiteSpace: 'nowrap' // Не переносить время на новую строку
                          }}>
                            {note.time} {/* Время уведомления (приходит из данных) */}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        )}

        {/* Кнопка входа/выхода */}
        <li>
          {user ? (
            // Если пользователь залогинен – кнопка «Выход» с именем
            <button 
              onClick={onLogout} 
              style={{ 
                ...navAuthButtonStyle, 
                background: 'var(--pink-light)', 
                color: 'var(--pink)' 
              }}
              onMouseOver={(e) => { 
                e.target.style.opacity = '0.9'; 
                e.target.style.transform = 'translateY(-1px)'; // Лёгкое смещение вверх
              }} 
              onMouseOut={(e) => { 
                e.target.style.opacity = '1'; 
                e.target.style.transform = 'none'; 
              }}
            >
              Выход ({user.fullName.split(' ')[0]}) {/* Отображаем только имя (первое слово) */}
            </button>
          ) : (
            // Если пользователь не залогинен – кнопка «Войти»
            <button 
              onClick={() => setView && setView('auth')} 
              style={navAuthButtonStyle} 
              onMouseOver={(e) => { 
                e.target.style.opacity = '0.9'; 
                e.target.style.transform = 'translateY(-1px)'; 
              }} 
              onMouseOut={(e) => { 
                e.target.style.opacity = '1'; 
                e.target.style.transform = 'none'; 
              }}
            >
              Войти
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}

// Стиль для обычных кнопок в навигационном меню
const navLinkButtonStyle = { 
  background: 'none', 
  border: 'none', 
  color: 'var(--text)', 
  fontFamily: "'Montserrat', sans-serif", 
  cursor: 'pointer', 
  padding: '10px 16px', 
  borderRadius: '8px', 
  fontSize: '15px', 
  fontWeight: '600', 
  transition: 'all 0.2s',   // Плавные изменения при наведении
  whiteSpace: 'nowrap'      // Текст не переносится
};

// Стиль для главной кнопки входа/выхода (более заметная)
const navAuthButtonStyle = { 
  background: 'var(--pink)', 
  border: 'none', 
  color: 'var(--white)', 
  fontFamily: "'Montserrat', sans-serif", 
  cursor: 'pointer', 
  padding: '12px 26px', 
  borderRadius: '8px', 
  fontSize: '15px', 
  fontWeight: '700', 
  marginLeft: '12px',       // Отступ слева, чтобы отделить от меню
  transition: 'all 0.2s' 
};

export default Navbar;