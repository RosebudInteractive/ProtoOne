if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(function(User) {
    /**
     * User class
     * Модуль пользователей
     * @exports User
     */
    var User = Class.extend({
        /**
         * Инициализация
         * @class User
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