document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.querySelector('.date-input');
  const dateButton = document.querySelector('.date-button'); // <-- Новый селектор
  const chosenDate = document.querySelector('.chosen-date');
  const weekContainer = document.querySelector('.week');

  if (!dateInput || !dateButton || !chosenDate || !weekContainer) {
    console.warn('Не все элементы найдены.');
    return;
  }

  const daysOfWeek = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  function fillWeekDays(baseDate) {
    const startOfWeek = getStartOfWeek(new Date(baseDate));
    const weekDays = weekContainer.querySelectorAll('.week-day');

    weekDays.forEach((dayElement, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);

      const dayNameEl = dayElement.querySelector('.week-day-name');
      const dayDateEl = dayElement.querySelector('.week-date');

      const dayIndex = currentDate.getDay(); // 0 = воскресенье
      dayNameEl.textContent = daysOfWeek[dayIndex];
      dayDateEl.textContent = currentDate.getDate();

      dayElement.dataset.date = currentDate.toISOString().split('T')[0];

      dayElement.classList.remove('chosen-day');
      if (currentDate.toDateString() === baseDate.toDateString()) {
        dayElement.classList.add('chosen-day');
      }
    });
  }

  function updateChosenDate(date) {
    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    chosenDate.textContent = `${dayOfWeek}, ${day} ${month} ${year} года`;
  }

  // --- Клик теперь по .date-button ---
  dateButton.addEventListener('click', () => {
    dateInput.click(); // Открывает календарь
  });

  dateInput.addEventListener('change', () => {
    const selectedDateStr = dateInput.value;
    if (!selectedDateStr) return;

    const selectedDate = new Date(selectedDateStr);
    if (!isNaN(selectedDate)) {
      updateChosenDate(selectedDate);
      fillWeekDays(selectedDate);
    }
  });

  weekContainer.addEventListener('click', (event) => {
    const clickedDay = event.target.closest('.week-day');
    if (!clickedDay) return;

    const selectedDateStr = clickedDay.dataset.date;
    const selectedDate = new Date(selectedDateStr);

    if (!isNaN(selectedDate)) {
      dateInput.value = selectedDateStr;
      updateChosenDate(selectedDate);

      weekContainer.querySelectorAll('.week-day').forEach(day => {
        day.classList.remove('chosen-day');
      });
      clickedDay.classList.add('chosen-day');
    }
  });

  const today = new Date();
  updateChosenDate(today);
  fillWeekDays(today);
});