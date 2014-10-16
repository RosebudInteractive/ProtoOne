if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * ClientConnection
 * @module ClientConnection
 */
define(['uccello/connection/socket'], function(Socket) {

    var ClientConnection = Class.extend(/** @lends module:ClientConnection.ClientConnection.prototype */{
        /**
         * Инициализация объекта
         * @constructs
         */
        init: function() {
            this.socket = null;
            this.sessionId = null;
            this.connected = false;
        },

        /**
         * подключить к серверной части, без логина, возвращает идентификатор сессии и имя пользователя если сессия авторизована
         * (см. описание userSessionMgr.connect, которая вызывается из данного метода)
         * @param url
         * @param sessionId
         */
        connect: function(url, sessionId, callback) {
            var that = this;
            this.sessionId = sessionId;
            that.socket = new Socket(url, {
                open: function(){ // при открытии соединения
                    that.connected = true;
                    // отправляем сообщение что подключились
                    that.socket.send({action:'connect', type:'method', sid: sessionId, agent:navigator.userAgent}, callback);
                },
                close: function(){
                    that.connected = false;
                },
                router: function(data){
                    console.log('сообщение с сервера:', data);
                    var result = {};
                    switch (data.action) {
                        case 'error': // ошибки
                            console.log(data.error);
                            break;
                        case 'sendDelta':
                            dbc.applyDeltas(data.dbGuid, data.srcDbGuid, data.delta);
                            break;
                    }
                    return result;
                }
            });
        },

        authenticate: function(user, pass, callback) {
            if (!this.connected)
                return false;
            this.socket.send({action:'authenticate', type:'method', name:user, pass:pass, sid: this.sessionId}, callback);
        },

        deauthenticate: function(callback) {
            this.socket.send({action:'deauthenticate', type:'method', sid: this.sessionId}, callback);
        },

        disconnect: function(callback) {
            this.socket.send({action:'disconnect', type:'method', sid: this.sessionId}, callback);
        },

        getUser: function(callback) {
            this.socket.send({action:'getUser', type:'method', sid: this.sessionId}, function(result){
                callback(result.item);
            });
        },

        getSession: function(callback) {
            this.socket.send({action:'getSession', type:'method', sid: this.sessionId}, function(result){
                callback(result.item);
            });
        },

        getConnect: function(callback) {
            this.socket.send({action:'getConnect', type:'method', sid: this.sessionId}, function(result){
                callback(result.item);
            });
        }
    });

    return ClientConnection;
});