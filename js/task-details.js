// Управление тегами задачи
const color = '#FCBC02';
const maxWidth = 300;
const inputElement = document.getElementById('inputField');

function handleClickOnTagEmblem() {
    const tagEmblem = document.querySelector('.task-tag-emblem');
    const outputElement = document.getElementById('output');

    if (!tagEmblem) return;

    tagEmblem.addEventListener('click', (evt) => {
        evt.preventDefault();
        let enteredWord = inputElement.value.trim();

        if (enteredWord !== '') {
            if (getTotalWidth(outputElement) <= maxWidth) {
                addTagWithRemoveOption(outputElement, enteredWord);
                inputElement.value = '';
            } else {
                alert('Всё доступное место занято!');
            }
        }
    });
}

function getTotalWidth(container) {
    let totalWidth = 0;
    Array.from(container.children).forEach(child => {
        totalWidth += child.offsetWidth;
    });
    return totalWidth;
}

function addTagWithRemoveOption(container, tagText) {
    const wordBlock = document.createElement('div');
    wordBlock.className = 'word-block';
    wordBlock.style.backgroundColor = color;
    wordBlock.textContent = tagText;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '✖';
    Object.assign(closeButton.style, {
        fontSize: '16px',
        width: '4px',
        height: '4px',
        cursor: 'pointer',
        marginLeft: '5px',
        border: 'none',
        background: 'none'
    });

    closeButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        wordBlock.remove();
    });

    wordBlock.appendChild(closeButton);
    container.appendChild(wordBlock);
}

function updateMinutesLabel(value) {
    const minutesLabel = document.getElementById('minutes-label');
    const numberValue = parseInt(value);
    const lastTwoDigits = numberValue % 100;

    if ([11, 12, 13, 14].includes(lastTwoDigits)) {
        minutesLabel.textContent = 'минут';
    } else if (lastTwoDigits % 10 === 1) {
        minutesLabel.textContent = 'минуту';
    } else if ([2, 3, 4].includes(lastTwoDigits % 10)) {
        minutesLabel.textContent = 'минуты';
    } else {
        minutesLabel.textContent = 'минут';
    }
}

function updatePriorityStyle(priority) {
    const select = document.getElementById('inputFieldPriority');
    select.classList.remove('not-matter', 'normal', 'matter');
    if (priority) {
        select.value = priority;
        select.classList.add(priority);
    }
}

function getSelectedTags() {
    const tagElements = document.querySelectorAll('#output .word-block');
    return Array.from(tagElements).map(el => el.textContent.replace('✖', '').trim());
}

function validateDateTime() {
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.querySelector('.task-time');
    const errorDate = document.getElementById('date-error');
    const errorDateTime = document.getElementById('datetime-error');

    errorDate.style.display = 'none';
    errorDateTime.style.display = 'none';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!dateInput.value) {
        errorDate.textContent = 'Пожалуйста, укажите дату';
        errorDate.style.display = 'block';
        return false;
    }

    const selectedDate = new Date(dateInput.value);
    if (selectedDate < today) {
        errorDate.textContent = 'Нельзя указывать дату из прошлого';
        errorDate.style.display = 'block';
        return false;
    }

    if (timeInput.value) {
        const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(timeInput.value)) {
            errorDateTime.textContent = 'Некорректный формат времени';
            errorDateTime.style.display = 'block';
            return false;
        }

        if (selectedDate.getTime() === today.getTime()) {
            const [hours, minutes] = timeInput.value.split(':').map(Number);
            const selectedTime = new Date();
            selectedTime.setHours(hours, minutes, 0, 0);
            if (selectedTime < now) {
                errorDateTime.textContent = 'Нельзя указывать время из прошлого';
                errorDateTime.style.display = 'block';
                return false;
            }
        }
    }

    return true;
}

// Загрузка данных задачи
document.addEventListener('DOMContentLoaded', () => {
    const taskData = localStorage.getItem('current_task_data');
    if (!taskData) {
        window.location.href = 'index.html';
        return;
    }

    const task = JSON.parse(taskData);

    document.querySelector('.name-task').value = task.name || '';
    document.querySelector('.desc-task').value = task.description || '';
    document.getElementById('dateInput').value = task.date || '';
    document.querySelector('.task-time').value = task.task_time || '';
    document.querySelector('.time-notification').value = task.notification_time || '1';

    if (task.task_priority) updatePriorityStyle(task.task_priority);

    const tagsContainer = document.querySelector('#output');
    const tagsArray = typeof task.list_tags === 'string'
        ? task.list_tags.split(',')
        : (task.list_tags || []);
    tagsArray.forEach(tag => tag.trim() && addTagWithRemoveOption(tagsContainer, tag.trim()));

    updateMinutesLabel(document.querySelector('.time-notification').value);

    handleClickOnTagEmblem();

    document.querySelector('.time-notification').addEventListener('change', function () {
        updateMinutesLabel(this.value);
    });

    document.getElementById('inputFieldPriority').addEventListener('change', function () {
        updatePriorityStyle(this.value);
    });
});

// Обработчик кнопки "Назад"
document.getElementById('backButton').addEventListener('click', () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const user_id = Number(params.get('id'));
        window.location.href = `index.html?id=${user_id}`;
    }
});

// Единый submit-обработчик
document.getElementById('darkTaskForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateDateTime()) {
        return;
    }

    const updatedTask = {
        name: document.querySelector('.name-task').value,
        description: document.querySelector('.desc-task').value,
        task_priority: document.getElementById('inputFieldPriority').value,
        date: document.getElementById('dateInput').value,
        task_time: document.querySelector('.task-time').value,
        notification_time: document.querySelector('.time-notification').value,
        list_tags: getSelectedTags()
    };

    console.log('Обновленные данные задачи:', updatedTask);

    // Сюда можно добавить отправку данных на сервер
    // saveTaskChanges(updatedTask);
});

// Запрет скролла на iOS (опционально)
document.addEventListener('touchmove', function (event) {
    if (event.touches && event.touches[0].clientY > 0) {
        event.preventDefault();
    }
}, { passive: false });
