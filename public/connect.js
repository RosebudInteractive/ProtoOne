if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(Connect) {

    var Connect = function (id, params){
        this.id = id;
        this.params = params;
        this.numRequest = 0;
        this.lastPingTime = null;
    }

    Connect.prototype.getParams = function(){
        return this.params;
    }

    Connect.prototype.getId = function(){
        return this.id;
    }

    Connect.prototype.getRequest = function(){
        return this.numRequest;
    }

    Connect.prototype.addRequest = function(){
        return ++this.numRequest;
    }

    Connect.prototype.setLastPing = function(){
        this.lastPingTime = Date.now();
        return this.lastPingTime;
    }

    return Connect;
});