if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(function(Connect) {
    var Connect = Class.extend({

        init: function (id, ws, params) {
            this.id = id;
            this.ws = ws;
            this.params = {
                connectTime: params.connectTime || Date.now(),
                userAgent: params.userAgent || '',
                numRequest: params.numRequest || 0,
                stateReady: params.stateReady || 0,
                lastPingTime: params.numRequest || null
            };
        },

        getParams: function () {
            return this.params;
        },

        getId: function () {
            return this.id;
        },

        getRequest: function () {
            return this.params.numRequest;
        },

        addRequest: function () {
            return ++this.params.numRequest;
        },

        setLastPing: function () {
            this.params.lastPingTime = Date.now();
            return this.params.lastPingTime;
        },

        setStateReady: function (stateReady) {
            this.params.stateReady = stateReady;
            return this.params.stateReady;
        }
    });

    return Connect;
});