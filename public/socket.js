if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль работы с сокетами
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
         */
        init: function (url) {
            this.socket = new WebSocket(url, options);
            this.onmessage = $.proxy(this.message, this);
            this.onclose = $.proxy(this.close, this);
            this.onopen = $.proxy(this.open, this);

            // опции
            this.options = options;
            this.msgId = 0;
            this.messages = {};

        },

        isEnabled: function () {
            return window.WebSocket;
        },

        send:  function (obj, callback) {
            var msgId = this.msgId++;
            obj['msgId'] = msgId;
            this.messages[msgId] = {callback:callback, time:Date.now()};
            this.socket.send(JSON.stringify(obj));
        },

        open: function(event){
            var that = this;
            if (this.options.open)
                this.options.open();
        },

        message: function(event, messageFunc){
            var data = JSON.parse(event.data);
            if (this.options.message)
                this.options.message(data);
            // если есть такой ID
            if (data.msgId && this.messages[data.msgId]) {
                if (this.messages[data.msgId].callback)
                    this.messages[data.msgId].callback();
                delete this.messages[data.msgId];
            }

        },

        close: function(event){
            if (this.options.close)
                this.options.close(event);
        }
    });

    return Socket;
});