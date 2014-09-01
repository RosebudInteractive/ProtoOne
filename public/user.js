if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(function(User) {
    var User = Class.extend({
        init: function(name){
            this.name = name;
        },
        getName: function(){
            return this.name;
        }
    });
    return User;
});