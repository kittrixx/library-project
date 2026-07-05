import React from 'react';

/**
 * Компонент Footer (подвал сайта).
 * Содержит контактную информацию (телефон, почту), копирайт и кнопку прокрутки наверх.
 */
function Footer() {
  /**
   * Функция плавной прокрутки страницы к самому верху.
   * Вызывается при клике на кнопку "▲".
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,                // прокрутить до верхней границы окна
      behavior: 'smooth'     // плавная анимация
    });
  };

  // Размер кнопки "Наверх" в пикселях (квадрат, т.к. ширина = высота)
  const buttonSize = 56;
  // Нижний отступ футера, используется также для позиционирования кнопки
  const footerPaddingBottom = 32;

  return (
    <footer
      style={{
        width: '100%',                      // на всю ширину родителя
        backgroundColor: 'var(--white)',    // цвет фона (из CSS-переменной)
        borderTop: '2px solid var(--pink-light)', // верхняя граница
        padding: `48px 20px ${footerPaddingBottom}px 20px`, // отступы: сверху, справа, снизу (из переменной), слева
        marginTop: 'auto',                  // прижимает футер к низу при flex-контейнере
        display: 'flex',                    // используем flex-верстку
        flexDirection: 'column',            // элементы вертикально
        alignItems: 'center',               // центрируем по горизонтали
        gap: '24px',                        // расстояние между дочерними блоками
        fontFamily: 'inherit',              // наследуем шрифт от родителя
        position: 'relative'                // нужно для абсолютного позиционирования кнопки внутри футера
      }}
    >
      {/* Блок контактов (телефон и почта) — расположен в одну строку, при узком экране переносится */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',                 // перенос на следующую строку при нехватке места
          justifyContent: 'center',         // центрируем по горизонтали
          alignItems: 'center',             // выравниваем по вертикали
          gap: '24px',                      // промежуток между блоками телефона и почты
          fontSize: '16px',
          color: 'var(--text)'              // цвет текста из CSS-переменной
        }}
      >
        {/* Блок с телефоном */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'                     // расстояние между иконкой и текстом
          }}
        >
          {/* Круглая подложка с эмодзи 📞 */}
          <span
            style={{
              background: 'var(--pink-light)', // светлый розовый фон
              width: '36px',
              height: '36px',
              borderRadius: '50%',              // круглая форма
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'                  // размер эмодзи
            }}
          >
            📞
          </span>
          <span>Телефон:</span>
          {/* Ссылка для звонка по номеру (на мобильных открывается набор номера) */}
          <a
            href="tel:+79215984922"
            style={{
              color: 'var(--pink)',           // основной розовый цвет
              textDecoration: 'none',          // убираем подчёркивание
              fontWeight: '800',               // жирный шрифт
              letterSpacing: '-0.2px'          // небольшое сжатие букв
            }}
          >
            +7 (921) 598-49-22
          </a>
        </div>

        {/* Блок с почтой */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Круглая подложка с эмодзи ✉️ */}
          <span
            style={{
              background: 'var(--pink-light)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
          >
            ✉️
          </span>
          <span>Почта:</span>
          {/* Ссылка для отправки письма (открывает почтовый клиент) */}
          <a
            href="mailto:furmansss123@gmail.com"
            style={{
              color: 'var(--pink)',
              textDecoration: 'none',
              fontWeight: '800',
              letterSpacing: '-0.2px'
            }}
          >
            furmansss123@gmail.com
          </a>
        </div>
      </div>

      {/* Блок копирайта */}
      <div
        style={{
          color: 'var(--text-light)',   // светлый цвет текста
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.5px',       // увеличенный интервал между буквами
          textTransform: 'uppercase',   // все буквы заглавные
          opacity: 0.8                  // небольшая прозрачность
        }}
      >
        © Цифровая библиотека 2026
      </div>

      {/* Кнопка "Наверх" — абсолютно позиционирована в правом нижнем углу футера */}
      <button
        onClick={scrollToTop}           // при клике запускаем прокрутку наверх
        style={{
          position: 'absolute',         // позиционируется относительно футера (у которого relative)
          right: '24px',                // отступ справа
          bottom: `${footerPaddingBottom}px`, // отступ снизу совпадает с нижним отступом футера
          background: 'var(--pink-light)',
          color: 'var(--pink)',
          border: 'none',               // убираем стандартную рамку кнопки
          width: `${buttonSize}px`,     // ширина из переменной
          height: `${buttonSize}px`,    // высота из переменной
          borderRadius: '50%',          // круглая форма
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',            // курсор-указатель при наведении
          fontSize: '32px',             // размер стрелки
          fontWeight: '900',            // максимальная жирность
          lineHeight: '1',              // чтобы стрелка не смещалась по высоте
          transition: 'all 0.3s ease',  // плавный переход для всех свойств при изменениях
          outline: 'none',              // убираем обводку при фокусе
          boxShadow: '0 4px 10px rgba(var(--pink-rgb), 0.3)' // тень с использованием RGB-переменной
        }}
        aria-label="Наверх"             // метка для скринридеров
        // Обработчик при наведении мыши — кнопка приподнимается и усиливается тень
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 6px 15px rgba(var(--pink-rgb), 0.5)';
        }}
        // Обработчик при уходе мыши — возвращаем исходные стили
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(var(--pink-rgb), 0.3)';
        }}
      >
        ▲
      </button>
    </footer>
  );
}

// Экспортируем компонент для использования в других частях приложения
export default Footer;