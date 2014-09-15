if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль работы с сокетами
 * Пример инициализации:
 * var socket = new Socket(url, {open: function(event){}, close:function(event){}, message: function(data){}});
 * @module Socket
 */
define(function(Socket) {

    /**
     * @class Socket
     */
    var Socket = Class.extend({

        /**
         * Инициализация объекта
         * @constructor
         * @alias module:Socket
         * @param url {string}
         * @param options {object} {}
         */
        init: function (url) {
            this.socket = new WebSocket(url, options);
            this.onmessage = $.proxy(this.message, this);
            this.onclose = $.proxy(this.close, this);
            this.onopen = $.proxy(this.open, this);

            // опции
            this.options = {
                open: options.open?options.open:null,   // вызвать метод при открытии сокета
                close: options.close?options.close:null,// вызвать метод при закрытии сокета
                message: options.message?options.message:null // вызвать метод при получении сообщения от сервера
            };
            this.msgId = 0;
            this.messages = {};

        },

        /**
         * Проверка на поддержку WebSocket в клиенте
         * @returns {boolean}
         */
        isEnabled: function () {
            return window.WebSocket;
        },

        /**
         * Отправка сообщений серверу с уникальным msgId
         * @param obj
         * @param callback
         */
        send:  function (obj, callback) {
            var msgId = this.msgId++;
            obj['msgId'] = msgId; // добавляем в объект отправки серверу msgId
            this.messages[msgId] = {callback:callback, time:Date.now()}; // сохраняем колбек
            this.socket.send(JSON.stringify(obj));
        },

        /**
         * Вызывается при открытии соединения
         * @param event
         */
        open: function(event){
            var that = this;
            if (this.options.open)
                this.options.open();
        },

        /**
         * Вызывается по приходу сообщений от сервера
         * @param event
         */
        message: function(event){
            var data = JSON.parse(event.data);
            if (this.options.message)
                this.options.message(data);
            // если есть такой ID вызываем сохраненный колбек
            if (data.msgId && this.messages[data.msgId]) {
                if (this.messages[data.msgId].callback)
                    this.messages[data.msgId].callback();
                delete this.messages[data.msgId];
            }
        },

        /**
         * Вызывается при закрытии соединения
         * @param event
         */
        close: function(event){
            if (this.options.close)
                this.options.close(event);
        }
    });

    return Socket;
});