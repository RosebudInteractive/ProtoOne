if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/clientConnection' ,
        './memDB/memDBController','./memDB/memDataBase','./baseControls/controlMgr', './baseControls/aComponent',
        '../ProtoControls/button', '../ProtoControls/matrixGrid','../ProtoControls/container', '../ProtoControls/propEditor', '../ProtoControls/dbNavigator', '../ProtoControls/edit',
        './connection/user', './connection/session', './connection/connect', './connection/visualContext' ],
    function(ClientConnection, MemDBController, MemDataBase, ControlMgr, AComponent,
        Button, MatrixGrid, Container, PropEditor, DbNavigator, Edit,
        User, Session, Connect, VisualContext) {
        var UccelloClt = Class.extend({

            init: function(options){
                var that = this;
				this.pvt = {};
                this.pvt.sessionId = options.sessionId;
                this.pvt.user = null;
                this.pvt.clientConnection = new ClientConnection();
                this.pvt.typeGuids = {};
				this.pvt.dbcontext = null;


                this.getClient().connect(options.host, options.sessionId,  function(result){
                    that.pvt.sessionId = result.sessionId;
                    that.pvt.user = result.user;
                    document.location.hash = '#sid='+sessionId;
                    that.pvt.typeGuids["af419748-7b25-1633-b0a9-d539cada8e0d"] = Button;
                    that.pvt.typeGuids["827a5cb3-e934-e28c-ec11-689be18dae97"] = MatrixGrid;
                    that.pvt.typeGuids["1d95ab61-df00-aec8-eff5-0f90187891cf"] = Container;
                    that.pvt.typeGuids["a0e02c45-1600-6258-b17a-30a56301d7f1"] = PropEditor;
                    that.pvt.typeGuids["38aec981-30ae-ec1d-8f8f-5004958b4cfa"] = DbNavigator;
                    that.pvt.typeGuids["dccac4fc-c50b-ed17-6da7-1f6230b5b055"] = User;
                    that.pvt.typeGuids["70c9ac53-6fe5-18d1-7d64-45cfff65dbbb"] = Session;
                    that.pvt.typeGuids["66105954-4149-1491-1425-eac17fbe5a72"] = Connect;
                    that.pvt.typeGuids["d5fbf382-8deb-36f0-8882-d69338c28b56"] = VisualContext;
                    that.pvt.typeGuids["5f27198a-0dd2-81b1-3eeb-2834b93fb514"] = ClientConnection;
                    that.pvt.typeGuids["f79d78eb-4315-5fac-06e0-d58d07572482"] = Edit;
                    that.createController();
                    if (options.callback)
                        options.callback();
                });
            },

            createController: function(done){
                var that = this;
                this.pvt.clientConnection.socket.send({action:"getGuids", type:'method'}, function(result){

                    that.pvt.guids = result;

                    // создаем  контроллер и бд
                    that.pvt.controller = new MemDBController();
                    that.pvt.controller.event.on({
                        type: 'applyDeltas',
                        subscriber: this,
                        callback: function(args){
                            renderControls();
                            getContexts();
                        }
                    });

                    // создаем системную бд
                    that.pvt.dbsys = that.pvt.controller.newDataBase({name:"System", proxyMaster : {connect: that.pvt.clientConnection.socket, guid: that.pvt.guids.masterSysGuid}});
                    that.pvt.cmsys = new ControlMgr(that.pvt.dbsys);

                    // создаем мастер базу для clientConnection
                    that.pvt.dbclient = that.pvt.controller.newDataBase({name:"MasterClient", kind: "master"});
                    that.pvt.cmclient = new ControlMgr(that.pvt.dbclient);
                    new AComponent(that.pvt.cmclient);
                    new VisualContext(that.pvt.cmclient);
                    new ClientConnection(that.pvt.cmclient);
                    that.pvt.clientConnection.init(that.pvt.cmclient, {});

                });
            },
			
			getClient: function() {
				return this.pvt.clientConnection;
			},
			
			getController: function() {
				return this.pvt.controller;
			},
			
			getSysDB: function() {
				return this.pvt.dbsys; 
			},
			
			getContextCM: function() {
				return this.pvt.controlMgr;
			},
			
			// получить конструктор по его guid
			getConstr: function(guid) {
				return this.pvt.typeGuids[guid];
			},

            createComponent: function(obj) {
                var g = obj.getTypeGuid();
                var options = {parent:'#result'};

                // метод обработки изменений для PropEditor
                if (g == "a0e02c45-1600-6258-b17a-30a56301d7f1") {
                    options.change = function(){
                        sendDeltas();
                        renderControls();
                    };
                }

                // DbNavigator для системной бд
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    options.db = uccelloClt.getSysDB(); //myApp.dbsys;
                }
				// TODO!! временно, надо научиться передавать контекст!!!
                new uccelloClt.pvt.typeGuids[g](uccelloClt.pvt.controlMgr, { objGuid: obj.getGuid() }, options);
            },
			
			selectContext: function(guid,root,callback) {
				function done() {
					dbcontext = controller.newDataBase({name:"Slave"+guid, proxyMaster : { connect: socket, guid: guid}}, function(){
						dbcontext.subscribeRoot(root, function(){
							callback();
							//currContext = guid + '|' + root;					
							//getContexts();
							//renderControls();
						}, that.createComponent);
					});
					that.pvt.controlMgr = new ControlMgr(dbcontext);
				}
				
				var dbcontext = this.pvt.dbcontext;
				var controller = this.getController();
				var that = this;

				if (dbcontext)
					controller.delDataBase(dbcontext.getGuid(), done);
				else
					done();			
			}			
			
        });
        return UccelloClt;
    }
);