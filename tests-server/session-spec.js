var Session = require('../public/uccello/connection/session');
var Connect = require('../public/uccello/connection/connect');

var connect = new Connect(1, {}, {});
describe('Unit Connect', function() {
    it('getId', function() {
        expect(connect.getId()).toEqual(1);
    });
    it('addRequest', function() {
        var reqs1 = connect.getRequest();
        connect.addRequest();
        var reqs2 = connect.getRequest();
        expect(reqs2-reqs1).toEqual(1);
    });
    it('setLastPing', function() {
        var now = Date.now();
        connect.setLastPing(now);
        var lastPingTime = connect.getParams().lastPingTime;
        expect(now).toEqual(lastPingTime);
    });
});

var session = new Session(1);
describe('Unit Session', function() {
    it('getId', function() {
        expect(session.getId()).toEqual(1);
    });
    it('addConnect', function() {
        session.addConnect({connect:1});
        expect(session.getConnects().length).toEqual(1);
    });
});