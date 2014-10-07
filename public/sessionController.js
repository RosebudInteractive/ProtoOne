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
            addSession: function(session){
                this.session[session.getId()] = session;
            },
            addConnect: function(connect){
                this.connects[connect.getId()] = connect;
            },
            getSession: function(id){
                return this.session[id];
            },
            getConnect: function(id){
                return this.connects[id];
            },
            removeSession: function(id){
                if (this.session[id])
                delete this.session[id];
            },
            removeConnect: function(id){
                if (this.connects[id])
                    delete this.connects[id];
            }
        });
        return SessionController;
    }
);