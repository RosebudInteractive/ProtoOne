if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {

    function Module2(){

    }

    Module2.prototype.getRandomFloat = function(low, high) {
        return Math.random() * (high - low) + low;
    }

    return Module2;
});
