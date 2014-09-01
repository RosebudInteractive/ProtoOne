if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(['./user'], function(User) {
    var Admin = User.extend({
        init: function(name){
            this._super(name);
            this.isAdmin = true;
        }
    });
    return Admin;
});