import React from 'react';

// ИМПОРТИРУЕМ КАРТИНКИ ИЗ ПАПКИ ASSETS
// Каждый import подгружает изображение и сохраняет его в переменную,
// которую мы потом используем как путь к файлу.
import photoSofiya from '../assets/Sofiya.jpg';
import photoKristina from '../assets/Kristina.jpg';
import photoSimeon from '../assets/Simeon.jpg';

// Анимация плавного появления (такая же, как в Home и Profile)
// Здесь мы храним CSS-код в виде строки (используем обратные кавычки для многострочности).
// Позже этот код будет вставлен в тег <style> на странице.
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

// Основной компонент Team — это функция, которая возвращает JSX-разметку.
function Team() {
  // Массив объектов с данными о членах команды.
  // Каждый объект содержит id (уникальный ключ), роль, имя, описание и картинку.
  // Это наши "данные", которые мы будем отображать в карточках.
  const teamMakers = [
    { 
      id: 1, 
      role: 'Backend Developer', 
      name: 'Фурман Софья', 
      desc: 'Настройка сервера Node.js, маршрутизация Express, работа с базой данных JSON и загрузка файлов через Multer.',
      image: photoSofiya
    },
    { 
      id: 2, 
      role: 'UI/UX Designer / Верстальщик', 
      name: 'Хлебникова Кристина', 
      desc: 'Создание структуры проекта, адаптивная верстка на CSS Grid и Flexbox, визуальный дизайн страниц, эффекты анимации при наведении.',
      image: photoKristina
    },
    { 
      id: 3, 
      role: 'Frontend State & Integration', 
      name: 'Зенков Симеон', 
      desc: 'Клиентский роутинг, интеграция с API через fetch(), обработка состояний загрузки/ошибок и сохранение сессии в localStorage.',
      image: photoSimeon
    }
  ];

  // Возвращаем JSX — это похоже на HTML, но пишется внутри JavaScript.
  return (
    // <>...</> — это фрагмент (обёртка без лишнего DOM-элемента).
    <>
      {/* Вставляем тег <style> с нашей анимацией. 
          Фигурные скобки {} позволяют вставить JavaScript-выражение,
          в данном случае — строку с CSS. */}
      <style>{animationStyles}</style>

      {/* Основной контейнер секции. 
          className — аналог class в HTML (в React используем className,
          потому что class — зарезервированное слово в JS).
          Применяем класс fade-in-container для анимации появления.
          style — объект со стилями (как инлайн-стили, но в формате JS). */}
      <div 
        className="fade-in-container"
        style={{ 
          width: '100%', 
          maxWidth: '1300px', 
          margin: '0 auto', 
          padding: '50px 20px', 
          textAlign: 'center',
          background: 'transparent'
        }}
      >
        {/* Заголовок секции со своими стилями */}
        <h2 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          marginBottom: '30px', 
          color: '#1e293b',
          letterSpacing: '0.5px'
        }}>
          Команда разработчиков проекта
        </h2>

        {/* Контейнер для карточек: используем flex, чтобы выстроить их в ряд.
            flexWrap: 'wrap' — перенос на новую строку при нехватке места.
            justifyContent: 'center' — центрируем по горизонтали.
            gap — расстояние между карточками.
            alignItems: 'stretch' — выравниваем по высоте (все карточки одинаковой высоты). */}
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '40px',
          alignItems: 'stretch'
        }}>
          {/* Метод map перебирает массив teamMakers и для каждого элемента создаёт карточку.
              member — текущий объект из массива.
              key — обязательный атрибут для React, чтобы отслеживать изменения в списке.
              Возвращаем JSX-разметку одной карточки. */}
          {teamMakers.map(member => (
            <div 
              key={member.id} 
              style={{
                // flex: '1 1 300px' — карточка может расти и сжиматься, но базовая ширина 300px.
                flex: '1 1 300px',
                maxWidth: '360px',
                backgroundColor: '#ffffff',
                // Градиенты для создания красивого розово-персикового фона с бликами.
                backgroundImage: 'radial-gradient(circle at top right, rgba(252, 165, 165, 0.25) 0%, transparent 55%), radial-gradient(circle at bottom left, rgba(251, 204, 232, 0.4) 0%, transparent 55%)',
                padding: '40px 30px',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03), 0 4px 10px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                // transition — анимация для плавного изменения transform и box-shadow при наведении.
                transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                cursor: 'pointer',
                position: 'relative', // чтобы внутренние абсолютные блоки позиционировались относительно карточки.
                overflow: 'hidden'     // скрываем всё, что выходит за границы.
              }}
              // onMouseEnter — событие, когда мышь наводится на карточку.
              // Меняем стили: поднимаем карточку вверх и усиливаем тень.
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.04)';
              }}
              // onMouseLeave — событие, когда мышь уходит с карточки.
              // Возвращаем исходные стили.
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.03), 0 4px 10px rgba(0, 0, 0, 0.02)';
              }}
            >
              {/* Декоративные элементы — цветные размытые пятна (блики).
                  Они позиционированы абсолютно внутри карточки и не влияют на содержимое. */}
              <div style={{ position: 'absolute', top: '-15%', left: '-50%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,107,142,0.15) 0%, transparent 65%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', top: '25%', right: '-55%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(255,182,193,0.2) 0%, transparent 65%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', bottom: '-30%', left: '5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,218,185,0.25) 0%, transparent 65%)', filter: 'blur(25px)', zIndex: 0, pointerEvents: 'none' }}></div>

              {/* Блок для аватарки — круг с фоном-изображением.
                  backgroundImage: url(${member.image}) — используем переменную member.image,
                  которая содержит путь к картинке. */}
              <div style={{ 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%',
                marginBottom: '28px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `url(${member.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}>
              </div>

              {/* Имя участника — выводим из объекта member */}
              <h4 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#0f172a', 
                margin: '0 0 6px 0',
                letterSpacing: '0.2px'
              }}>
                {member.name}
              </h4>

              {/* Роль — стилизованная подпись */}
              <span style={{ 
                display: 'inline-block',
                fontSize: '12px', 
                fontWeight: '800', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#be185d',
                marginBottom: '20px'
              }}>
                {member.role}
              </span>

              {/* Описание */}
              <p style={{ 
                fontSize: '14px', 
                color: '#475569', 
                lineHeight: '1.6',
                fontWeight: '400',
                maxWidth: '280px'
              }}>
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Экспортируем компонент, чтобы его можно было использовать в других файлах.
export default Team;