if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var SessionController = Class.extend({
            init: function(){
                this.session = {};
                this.connects = {};
            },
            addSession: function(id, session){
                this.session[id] = session;
            },
            addConnect: function(id, connect){
                this.connects[id] = connect;
            },
            getSession: function(id){
                return this.session[id];
            },
            getConnect: function(id){
                return this.connects[id];
            }
        });
        return SessionController;
    }
);