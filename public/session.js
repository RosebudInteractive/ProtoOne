if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(Session) {

    var Session = function (id){
        this.id = id;
        this.connects = [];
    }

    Session.prototype.getId = function(){
        return this.id;
    }

    Session.prototype.addConnect = function(conn){
        this.connects.push(conn);
        return true;
    }

    Session.prototype.getConnects = function(){
        return this.connects;
    }

    Session.prototype.removeConn = function(id){
        for(var i=0, len=this.connects.length; i<len; i++) {
            if (this.connects[i].getId() == id){
                this.connects.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    Session.prototype.findConnect = function(id){
        for(var i in this.connects) {
            if (this.connects[i].getId() == id)
                return this.connects[i];
            break;
        }
        return null;
    }

    return Session;
});