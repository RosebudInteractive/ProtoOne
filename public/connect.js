if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль подключений
 * @module Connect
 */
define(function(Connect) {

    var Connect = Class.extend({


        /**
         * Инициализация объекта
         * @constructor
         * @alias module:Connect
         * @param id {string} ID коннекта
         * @param ws {object} Объект подключения
         * @param params {object} Параметры подлкючения
         */
        init: function (id, ws, params) {
            this.id = id;
            this.ws = ws;
            this.params = {
                connectTime: params.connectTime || Date.now(),
                userAgent: params.userAgent || '',
                numRequest: params.numRequest || 0,
                stateReady: params.stateReady || 0,
                lastPingTime: params.numRequest || null,
                pingCounter: params.pingCounter || 0
            };
        },

        /**
         * Получить подключение
         * @returns {object}
         */
        getConnection: function (){
            return this.ws;
        },

        /**
         * Получить параметры подключения
         * @returns {object}
         */
        getParams: function () {
            return this.params;
        },

        /**
         * Получить id подключения
         * @returns {string}
         */
        getId: function () {
            return this.id;
        },

        /**
         * Получить количество запросов к коннекту
         * @returns {integer}
         */
        getRequest: function () {
            return this.params.numRequest;
        },

        /**
         * Добавить запрос
         * @returns {number}
         */
        addRequest: function () {
            return ++this.params.numRequest;
        },

        /**
         * Установить дату последнего пинга
         * @param date {timestamp} Таймстамп
         * @returns {*}
         */
        setLastPing: function (date) {
            this.params.lastPingTime = date || Date.now();
            this.params.pingCounter++;
            return this.params.lastPingTime;
        },

        /**
         * Установить статус подключения
         * @param stateReady {integer} 0-ok, 1-отключен
         * @returns {integer}
         */
        setStateReady: function (stateReady) {
            this.params.stateReady = stateReady;
            return this.params.stateReady;
        }
    });

    return Connect;
});