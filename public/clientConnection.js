if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * ClientConnection
 * @module ClientConnection
 */
define(function() {

    var ClientConnection = Class.extend(/** @lends module:ClientConnection.ClientConnection.prototype */{
        /**
         * Инициализация объекта
         * @constructs
         */
        init: function() {

        },

        /**
         * подключить к серверной части, без логина, возвращает идентификатор сессии и имя пользователя если сессия авторизована
         * (см. описание userSessionMgr.connect, которая вызывается из данного метода)
         * @param url
         * @param sessionId
         */
        connect: function(url, sessionId) {

        },

        authenticate: function(user, pass) {

        },

        deauthenticate: function() {

        },

        disconnect: function() {

        },

        getUser: function() {

        },

        getSession: function() {

        },

        getConnect: function() {

        }
    });

    return ClientConnection;
});