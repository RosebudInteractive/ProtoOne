if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль Сессий
 * @module Session
 */
define(
    ['./event'],
    function(event) {

    var Session = Class.extend(/** @lends module:Session.Session.prototype */{

        /**
         * Инициализация объекта
         * @constructs
         * @param id {string} ID сессии
         * @param data {object} данные сессии
         */
        init: function(id, data) {
            this.event = new event(this);
            this.id = id;
            this.data = data;
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
         * Удалить коннект по ID
         * @param id {string} ID удаляемого коннекта
         * @returns {boolean}
         */
        removeConn: function (id) {
            if (this.connects[id])
                delete this.connects[id];
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

        setData: function(data){
            this.data = data;
        },

        getData: function(){
            return this.data;
        }
    });

    return Session;
});