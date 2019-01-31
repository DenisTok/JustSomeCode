const express = require('express');
const router = express.Router();
const connection = require('../db').connection;

async function tokenExist(uToken) { //функция проверки токене
    if (uToken.length == 64) { //проверяем длину, если !=64 то возвращаем false
        try { // подключаемся к БД, селектим всё или нечего из таблицы. 
            let rows = connection.oneOrNone(
                `SELECT idusers, uemail, urole, utoken FROM users WHERE utoken = $1`,
                [uToken]);
            if (await rows === null) { //Если нам вернулось из таблицы ничего,
                return false //  то значит скорее всего токен не правильный или его нет, возвращаем false,
            } else {
                return true  // иначе, вернем true
            }
        } catch (err) {
            return false //ошибка на шаге доступа к базе данных
        }
    } else {
        return false // если длина токена !=64 то возвращаем false
    }
}

router.post('/', async (req, res) => { //логин По токену post
    if (await tokenExist(req.body.utoken)) { // Если токен не нашли в базе или ошибка там какая то, 
                                             // отправляем статус 401 и не начинаем подключение к БД
        try { // Подключаемся к БД, получаем и передаем данные пользователя.
            let rows = connection.oneOrNone(
                `SELECT idusers, urole, uemail, utoken FROM users WHERE utoken = $1;`,
                [req.body.utoken]);
            res.send(await rows);
        } catch (err) {
            res.sendStatus(400);
        }        
    } else {
        res.sendStatus(401);
    }
});



module.exports = router;