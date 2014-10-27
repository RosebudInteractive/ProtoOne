if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль User
 * @module User
 */
define(
    ['../baseControls/aComponent'],
    function(AComponent) {

    var User = AComponent.extend(/** @lends module:User.User.prototype */{

        className: "User",
        classGuid: "dccac4fc-c50b-ed17-6da7-1f6230b5b055",
        metaFields: [ {fname:"Id", ftype:"int"}, {fname:"Name", ftype:"string"}, {fname:"Authenticated", ftype:"boolean"} ],
        metaCols: [ {cname: "Sessions", ctype: "control"} ],

        /**
         * Инициализация
         * @constructs
         */
        init: function(cm, params) {
            this._super(cm, params);

            if (params==undefined) return; // в этом режиме только создаем метаинфо
            this.pvt.data = {};
            this.name = params.name;
            this.loginTime = false;
            this._isAuthenticated = false;
            this.sessions = {};
        },

        /**
         * Добавить сессию пользователя
         * @param session
         */
        addSession: function(session){
            this.sessions[session.getId()] = {item:session, date:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')};
        },

        getSession: function(id){
            return this.sessions[id] ? this.sessions[id].item : null;
        },

        getSessions: function(){
            return this.sessions;
        },

        countSession: function(){
            return Object.keys(this.sessions).length;
        },
		
		getData: function() {
			return this.pvt.data;
		},

        /**
         * Удалить сессию по ID
         * @param id
         */
        removeSession: function(id){
            if (this.sessions[id])
                delete this.sessions[id];
        },

        /**
         * Изменить имя пользователя
         * @param name {string}
         */
        setName: function(name) {
            this.name = name;
        },

        /**
         * Получить имя пользователя
         * @returns {string}
         */
        getName: function() {
            return this.name;
        },

        /**
         * Установить таймстамп логина
         * @returns {number}
         */
        setLoginTime: function(loginTime) {
            this.loginTime = loginTime;
        },

        /**
         * Получить таймстамп логина
         * @returns {number}
         */
        getLoginTime: function() {
            return this.loginTime;
        },


        /**
         * Залогинен
         * @param val {boolean}
         */
        setAuthenticated: function(val) {
            this._isAuthenticated = val;
        },

        /**
         * Залогинен ли пользователь
         */
        isAuthenticated: function() {
            return this._isAuthenticated;
        }
    });
    return User;
});