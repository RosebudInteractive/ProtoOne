if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль User
 * @module User
 */
define(function(User) {

    var User = Class.extend({
        /**
         * Инициализация
         * @alias module:User
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