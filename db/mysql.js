/**
 * Работа с mysql
 */
var define = require('amdefine')(module);
var Class = require('class.extend');
var mysql = require('mysql');
var mysqlUtilities = require('mysql-utilities');

define(function() {
    var Mysql = Class.extend({
        init: function(name){
            this.connection = null;
        },

        /**
         * Подключение к БД
         * @param config
         * @returns {object} коннект
         */
        connect: function(config) {
            var that = this;
            this.connection = mysql.createConnection(config);
            this.connection.connect(function(err) {
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    return;
                }
                console.log('connected as id ' + that.connection.threadId);
            });
            mysqlUtilities.upgrade(this.connection);
            mysqlUtilities.introspection(this.connection);
            return this.connection;
        }
    });
    return Mysql;
});