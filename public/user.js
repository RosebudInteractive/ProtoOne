if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль User
 * @module User
 */
define(function() {

    var User = Class.extend(/** @lends module:User.User.prototype */{
        /**
         * Инициализация
         * @constructs
         * @param {string} name Имя пользователя
         */
        init: function(name) {
            this.name = name;
            this._logged = false;
        },
        /**
         * Получить имя пользователя
         * @returns {string}
         */
        getName: function() {
            return this.name;
        },

        login: function(name, pass) {
            if (name == 'user' && pass == '123') {
                this._logged = true;
            }
            return false;
        },

        /**
         * Залогинен ли пользователь
         */
        isLogged: function() {
            return this._logged;
        }
    });
    return User;
});