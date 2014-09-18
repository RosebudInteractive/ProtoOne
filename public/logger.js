if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль Логирования
 * @module Logger
 */
define(function(Logger) {

    var Logger = Class.extend({

        /**
         * Инициализация объекта
         * @constructor
         * @alias module:Logger
         */
        init: function() {
            this.logs = [];
        },

        /**
         * Добавить в лог
         * @param log {object}
         */
        addLog: function(log) {
            log.timestamp = Date.now();
            this.logs.push(log);
        },

        /**
         * Получить лог
         * @returns {Array}
         */
        getLogs: function() {
            return this.logs;
        },


        /**
         * Сохранить лог в файл
         * @param file
         */
        saveLog: function(file, done) {
            var fs = require('fs');
            var js2xmlparser = require("js2xmlparser");
            var log = js2xmlparser("log", {row:this.logs});
            fs.writeFile(file, log, function (err) {
                if (err) throw 'ошибка записи файла: ' + err;
                done('Файл лога записан: ' + file);
            });
        }

    });

    return Logger;
});