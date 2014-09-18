if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль Сессий
 * @module Session
 */
define(function(Session) {

   
    var Session = Class.extend({

        /**
         * Инициализация объекта
         * @constructor
         * @alias module:Session
         * @param id {string} ID сессии
         */
        init: function(id) {
            this.id = id;
            this.connects = [];
        },

        /**
         * Получить ID сессии
         * @returns {string}
         */
        getId: function() {
            return this.id;
        },

        /**
         * Добавить коннект в данную сессию
         * @param conn {object} Объект Connect
         * @returns {object}
         */
        addConnect: function(conn) {
            this.connects.push(conn);
            return true;
        },

        /**
         * Получить коннекты данной сессии
         * @returns {Array}
         */
        getConnects: function() {
            return this.connects;
        },

        /**
         * Удалить коннект по ID
         * @param id {string} ID удаляемого коннекта
         * @returns {boolean}
         */
        removeConn: function (id) {
            for (var i = 0, len = this.connects.length; i < len; i++) {
                if (this.connects[i].getId() == id) {
                    this.connects.splice(i, 1);
                    return true;
                }
            }
            return false;
        },

        /**
         * Поиск коннекта по ID
         * @param id {string} ID коннекта
         * @returns {object|null}
         */
        findConnect: function (id) {
            for (var i in this.connects) {
                if (this.connects[i].getId() == id)
                    return this.connects[i];
                break;
            }
            return null;
        }
    });

    return Session;
});