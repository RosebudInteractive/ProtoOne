if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/clientConnection' ,
        './memDB/memDBController','./memDB/memDataBase','./baseControls/controlMgr', './baseControls/aComponent',
        '../ProtoControls/button', '../ProtoControls/matrixGrid','../ProtoControls/container', '../ProtoControls/propEditor', '../ProtoControls/dbNavigator',
        './connection/user', './connection/session', './connection/connect', './connection/visualContext' ],
    function(ClientConnection, MemDBController, MemDataBase, ControlMgr, AComponent,
        Button, MatrixGrid, Container, PropEditor, DbNavigator,
        User, Session, Connect, VisualContext) {
        var UccelloClt = Class.extend({

            init: function(options){
                var that = this;
                this.sessionId = options.sessionId;
                this.user = null;
                this.clientConnection = new ClientConnection();
                this.typeGuids = {};
                this.myApp = {};

                this.clientConnection.connect(options.host, options.sessionId,  function(result){
                    that.sessionId = result.sessionId;
                    that.user = result.user;
                    document.location.hash = '#sid='+sessionId;
                    that.typeGuids["af419748-7b25-1633-b0a9-d539cada8e0d"] = Button;
                    that.typeGuids["827a5cb3-e934-e28c-ec11-689be18dae97"] = MatrixGrid;
                    that.typeGuids["1d95ab61-df00-aec8-eff5-0f90187891cf"] = Container;
                    that.typeGuids["a0e02c45-1600-6258-b17a-30a56301d7f1"] = PropEditor;
                    that.typeGuids["38aec981-30ae-ec1d-8f8f-5004958b4cfa"] = DbNavigator;
                    that.typeGuids["dccac4fc-c50b-ed17-6da7-1f6230b5b055"] = User;
                    that.typeGuids["70c9ac53-6fe5-18d1-7d64-45cfff65dbbb"] = Session;
                    that.typeGuids["66105954-4149-1491-1425-eac17fbe5a72"] = Connect;
                    that.typeGuids["d5fbf382-8deb-36f0-8882-d69338c28b56"] = VisualContext;
                    that.typeGuids["5f27198a-0dd2-81b1-3eeb-2834b93fb514"] = ClientConnection;
                    that.createController();
                    if (options.callback)
                        options.callback();
                });
            },

            createController: function(done){
                var that = this;
                this.clientConnection.socket.send({action:"getGuids", type:'method'}, function(result){

                    that.myApp.guids = result;

                    // создаем  контроллер и бд
                    that.myApp.controller = new MemDBController();
                    that.myApp.controller.event.on({
                        type: 'applyDeltas',
                        subscriber: this,
                        callback: function(args){
                            renderControls();
                            getContexts();
                        }
                    });

                    // создаем системную бд
                    that.myApp.dbsys = that.myApp.controller.newDataBase({name:"System", proxyMaster : {connect: that.clientConnection.socket, guid: that.myApp.guids.masterSysGuid}});
                    that.myApp.cmsys = new ControlMgr(that.myApp.dbsys);

                    // создаем мастер базу для clientConnection
                    that.myApp.dbclient = that.myApp.controller.newDataBase({name:"MasterClient", kind: "master"});
                    that.myApp.cmclient = new ControlMgr(that.myApp.dbclient);
                    new AComponent(myApp.cmclient);
                    new VisualContext(that.myApp.cmclient);
                    new ClientConnection(that.myApp.cmclient);
                    that.clientConnection.init(that.myApp.cmclient, {});

                });
            }
        });
        return UccelloClt;
    }
);