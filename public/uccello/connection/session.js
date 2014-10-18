if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль Сессий
 * @module Session
 */
define(
    ['./../system/event'],
    function(event) {

    var Session = Class.extend(/** @lends module:Session.Session.prototype */{

        /**
         * Инициализация объекта
         * @constructs
         * @param id {string} ID сессии
         * @param user {object} пользователь сессии
         */
        init: function(id, user) {
            this.event = new event(this);
            this.id = id;
            this.user = user;
            this.connects = [];
            this.creationTime = Date.now();
            this.lastOpTime = Date.now();
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

            this.lastOpTime = Date.now();

            var that = this;

            // обработка события закрытия коннекта
            conn.event.on({
                type: 'socket.close',
                subscriber: this,
                callback: function(args){
                    that.removeConn(args.connId);

                }
            });

            // добавим ссылку на сессию
            conn.setSession(this);

            this.connects[conn.getId()] = conn;
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
         * получить коннект с идентификатором id
         * @param id {number}
         * @returns {object}
         */
        getConnect: function(id) {
            if (this.connects[id])
                return this.connects[id];
            return null;
        },

        /**
         * Удалить коннект по ID
         * @param id {number} ID удаляемого коннекта
         * @returns {boolean}
         */
        removeConn: function (id) {
            this.lastOpTime = Date.now();
            if (this.connects[id])
                delete this.connects[id];
        },

        /**
         * Количество коннектов
         * @returns {number}
         */
        countConnect: function () {
            return Object.keys(this.connects).length
        },

        /**
         * Поиск коннекта по ID
         * @param id {string} ID коннекта
         * @returns {object|null}
         */
        findConnect: function (id) {
            if (this.connects[id])
                return this.connects[id];
            return null;
        },

		// TODO УБРАТЬ ИЛИ ПЕРЕДЕЛАТЬ?
        setData: function(data){
            this.data = data;
        },

        getData: function() {
            return this.data;
        },

        getUser: function() {
            return this.user;
        },

        setUser: function(user) {
            this.user = user;
        },

        /**
         * вернуть таймстамп создания
         * @returns {timestamp}
         */
        getCreationTime: function() {
            return this.creationTime;
        },

        /**
         * вернуть таймстамп последней операции в текущей сессии
         * @returns {timestamp}
         */
        getLastOpTime: function() {
            return this.lastOpTime;
        }
    });

    return Session;
});