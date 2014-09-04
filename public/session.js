if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(function(Session) {

    var Session = Class.extend({

        init: function(id) {
            this.id = id;
            this.connects = [];
        },

        getId: function() {
            return this.id;
        },

        addConnect: function(conn) {
            this.connects.push(conn);
            return true;
        },

        getConnects: function() {
            return this.connects;
        },

        removeConn: function (id) {
            for (var i = 0, len = this.connects.length; i < len; i++) {
                if (this.connects[i].getId() == id) {
                    this.connects.splice(i, 1);
                    return true;
                }
            }
            return false;
        },

        findConnect: function (id) {
            for (var i in this.connects) {
                if (this.connects[i].getId() == id)
                    return this.connects[i];
                break;
            }
            return null;
        }
    });

    return Session;
});