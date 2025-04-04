const express = require('express');
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const schedule = require('node-schedule');

const app = express();
const TELEGRAM_BOT_TOKEN = '7688220876:AAEdlJxaqWj9ZBaJsKU_b8Mxu0oBSC99CPY'
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const cors = require('cors');
app.use(cors());
const domain = 'https://school-planner.netlify.app';

app.use(express.json());

// Обработка команды /start
bot.start(async (ctx) => {
    const userId = ctx.from.id;

    try {
        await ctx.reply('Нажмите, чтобы открыть приложение.', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Открыть",
                            web_app: {
                                url: `${domain}/#/`
                            }
                        }
                    ],
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });

        // Отправление запроса на регистрацию на сервер
        const url = 'https://flask.stk8s.66bit.ru/register';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'telegram_id': userId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Регистрация прошла успешно:', data);
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
    }
});

// Обработка обновлений от Telegram
app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body)
        .then(() => res.status(200).send('Update processed'))
        .catch((error) => {
            console.error('Ошибка при обработке обновления:', error);
            res.status(500).send('Internal Server Error');
        });
});


//2025-03-26T14:48:27.090Z - время в iso формате
app.post('/schedule', (req, res) => {
    const { telegram_id, date, time, message, start_time = '19:05:00' } = req.body;
    console.log(telegram_id, date, time, message)

    const isoString = parseDate(date, time, start_time);
    console.log(isoString)

    /*const schedule_time = new Date(time);
    const currentDateTime = new Date();
    const isoString = currentDateTime.toISOString();*/

    // Запланировать отправку сообщения
    try {
        const job = schedule.scheduleJob(isoString, async function () {
            await sendMessage(telegram_id, message);
        });
        res.status(201).json({
            message: 'Message scheduled successfully!',
            scheduledTime: isoString
        });
    } catch (error) {
        console.error('Error scheduling message:', error);
        res.status(500).send('Failed to schedule message.');
    }
});

const sendMessage = async (telegram_id, message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = {
        chat_id: telegram_id,
        text: message,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        console.log('Message sent:', data);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

function parseDate(date, notification_time, start_time) {
    const baseTime = start_time.split(':').map(Number);
    const [year, month, day] = date.split('-').map(Number);
    const baseDate = new Date(Date.UTC(year, month - 1, day, ...baseTime, 0));
    baseDate.setMinutes(baseDate.getMinutes() - notification_time);
  
    const offset = 5 * 60;
    baseDate.setMinutes(baseDate.getMinutes() - offset);
  
    return baseDate.toISOString();
  }

// Запуск бота
bot.launch();

// Запуск сервера
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});
