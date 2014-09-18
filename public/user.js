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
        init: function(name){
            this.name = name;
        },
        /**
         * Получить имя пользователя
         * @returns {string}
         */
        getName: function(){
            return this.name;
        }
    });
    return User;
});