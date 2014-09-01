/**
 * Модуль генерации случайных чисел
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./module2'], function(Module2) {

    function Module1(){
    }

    /**
     * Случайное число целое
     * @param low нижний порог
     * @param high верхний порог
     * @returns {number}
     */
    Module1.prototype.getRandomInt = function(low, high){
        var module2 = new Module2();
        var randFloat = module2.getRandomFloat(low, high);
        return Math.floor(randFloat);
    }

    return Module1;
});