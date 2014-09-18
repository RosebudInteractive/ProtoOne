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

    var Socket = Class.extend({

        /**
         * Инициализация объекта
         * @constructor
         * @alias module:Socket
         * @param url {string} url=для клиента, ws=для сервера
         * @param options {object} {}
         */
        init: function (url, options) {
            var that = this;
            // опции
            this.options = {
                side: options.side?options.side:'client', // создаем объект для сервера или клиента
                open: options.open?options.open:null,   // вызвать метод при открытии сокета
                close: options.close?options.close:null,// вызвать метод при закрытии сокета
                router: options.router?options.router:null // вызвать метод при получении сообщения от сервера
            };

            if (this.options.side == 'client') {
                this.socket = new WebSocket(url);
                this.socket.onmessage = function() { that.receive.apply(that, arguments); };
                this.socket.onclose = function() { that.close.apply(that, arguments); };
                this.socket.onopen = function() { that.open.apply(that, arguments); };
            } else {
                this.socket = url;
                this.socket.on('message', function() { that.receive.apply(that, arguments);});
                this.socket.on('close', function() { that.close.apply(that, arguments);});
                this.socket.on('open', function() { that.open.apply(that, arguments); });
            }

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
            var msgId = this.options.side == 'client' ? ++this.msgId : --this.msgId;
            if (!obj.msgId)// добавляем в объект отправки серверу msgId
                obj.msgId = msgId;
            this.messages[msgId] = {callback:callback, time:Date.now()}; // сохраняем колбек
            this.socket.send(JSON.stringify(obj));
        },

        /**
         * Вызывается при открытии соединения
         * @param event
         */
        open: function(event){
            if (this.options.open)
                this.options.open(event);
        },

        /**
         * Вызывается по приходу сообщений
         * @param event
         */
        receive: function(event){
            var data = JSON.parse(this.options.side == 'client' ? event.data : event);

            // обработчик
            if (this.options.router) {
                // вызов роутера
                var result = this.options.router(data);

                // если требуется возврат результата
                if (data.type == 'method') {
                    result.msgId = data.msgId;
                    this.send(result);
                }
            }

            // если есть такой ID вызываем сохраненный колбек
            if (data.msgId && this.messages[data.msgId]) {
                var msg = this.messages[data.msgId];
                delete this.messages[data.msgId];
                if (msg.callback)
                    msg.callback(data);
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