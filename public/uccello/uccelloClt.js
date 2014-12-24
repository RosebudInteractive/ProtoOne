if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./connection/clientConnection' ,
        './memDB/memDBController','./memDB/memDataBase','./controls/controlMgr', './controls/aComponent',
        '../ProtoControls/button', '../ProtoControls/matrixGrid','../ProtoControls/container', '../ProtoControls/propEditor', '../ProtoControls/dbNavigator', '../ProtoControls/edit', '../ProtoControls/grid', '../ProtoControls/dataset',
        './connection/user', './connection/session', './connection/connect', './connection/visualContext',
        './dataman/dataContact', './dataman/dataCompany', './dataman/dataRoot','./system/rpc'
    ],
    function(ClientConnection, MemDBController, MemDataBase, ControlMgr, AComponent,
        Button, MatrixGrid, Container, PropEditor, DbNavigator, Edit, Grid, Dataset,
        User, Session, Connect, VisualContext,
        DataContact, DataCompany, DataRoot,Rpc
        ) {
        var UccelloClt = Class.extend({

            init: function(options){
                var that = this;
				this.pvt = {};
                this.pvt.sessionId = options.sessionId;
                this.pvt.user = null;
				var rpc = this.pvt.rpc = new Rpc( { router: this.pvt.router } );

                var clt = this.pvt.clientConnection = new ClientConnection();
                this.pvt.typeGuids = {};
				this.pvt.dbcontext = null;
                this.pvt.controlMgr = {};
				this.pvt.vc = null; // VisualContext
                this.options = options;

                this.getClient().connect(options.host, options.sessionId,  function(result){
                    that.pvt.sessionId = result.sessionId;
                    that.pvt.user = result.user;
                    document.location.hash = '#sid='+options.sessionId;

                    // TODO: загружать динамически
                    that.pvt.typeGuids["af419748-7b25-1633-b0a9-d539cada8e0d"] = Button;
                    that.pvt.typeGuids["827a5cb3-e934-e28c-ec11-689be18dae97"] = MatrixGrid;
                    that.pvt.typeGuids["1d95ab61-df00-aec8-eff5-0f90187891cf"] = Container;
                    that.pvt.typeGuids["a0e02c45-1600-6258-b17a-30a56301d7f1"] = PropEditor;
                    that.pvt.typeGuids["38aec981-30ae-ec1d-8f8f-5004958b4cfa"] = DbNavigator;
                    that.pvt.typeGuids["f79d78eb-4315-5fac-06e0-d58d07572482"] = Edit;
                    that.pvt.typeGuids["ff7830e2-7add-e65e-7ddf-caba8992d6d8"] = Grid;
                    that.pvt.typeGuids["3f3341c7-2f06-8d9d-4099-1075c158aeee"] = Dataset;

                    that.pvt.typeGuids["dccac4fc-c50b-ed17-6da7-1f6230b5b055"] = User;
                    that.pvt.typeGuids["70c9ac53-6fe5-18d1-7d64-45cfff65dbbb"] = Session;
                    that.pvt.typeGuids["66105954-4149-1491-1425-eac17fbe5a72"] = Connect;
                    that.pvt.typeGuids["d5fbf382-8deb-36f0-8882-d69338c28b56"] = VisualContext;
                    that.pvt.typeGuids["5f27198a-0dd2-81b1-3eeb-2834b93fb514"] = ClientConnection;

                    that.pvt.typeGuids["73596fd8-6901-2f90-12d7-d1ba12bae8f4"] = DataContact;
                    that.pvt.typeGuids["59583572-20fa-1f58-8d3f-5114af0f2c51"] = DataCompany;
                    that.pvt.typeGuids["87510077-53d2-00b3-0032-f1245ab1b74d"] = DataRoot;
                    that.createController();
                    if (options.callback)
                        options.callback();
						
					that.pvt.clientConnection.socket.send({action:"testIntf", type:'method'}, function(result){
						console.log("POPO: "+result.intf);
						var guidServer = "d3d7191b-3b4c-92cc-43d4-a84221eb35f5";
						that.pvt.servInterface = result.intf;
						that.pvt.proxyServer = rpc._publProxy(guidServer, clt.socket, result.intf); // публикуем прокси серверного интерфейса
					//result.func
					});

				});

            },

            createController: function(done){
                var that = this;
                this.pvt.clientConnection.socket.send({action:"getGuids", type:'method'}, function(result){

                    that.pvt.guids = result;

                    // создаем  контроллер и бд
                    that.pvt.controller = new MemDBController();
					console.log(that.pvt.controller.guid());
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
			
			getContext: function() {
				return this.pvt.vc;
			},
			
			getContextCM: function(rootGuid) {
				return this.pvt.vc.getContextCM(rootGuid);
			},
			
			// получить конструктор по его guid
			getConstr: function(guid) {
				return this.pvt.typeGuids[guid];
			},

            /**
             * Добавить конструктор
             * @param obj
             */
			addConstr: function(obj) {
				this.pvt.typeGuids[obj.classGuid] = obj;
			},

            getLoggedUser: function(){
                return this.pvt.user;
            },

			setContext: function(params, cbfinal) {
                var that = this;
				function done() {
					var s = that.pvt.clientConnection.socket;
					var p = { typeGuids: that.pvt.typeGuids, socket: s, rpc: that.pvt.rpc, proxyServer: that.pvt.proxyServer}
					p.side = params.side;
					if (p.side == "server") {
						that.pvt.serverContext = params.vc;
						p.vc = params.vc;
						p.ini = {fields:{Kind: "slave", MasterGuid: params.guid}};
					}
					else {
						p.ini = {fields:{Kind: "master"}};
					}
					//p.rpc = null;
					var vc = new VisualContext(that.pvt.cmclient, p, cbfinal);
					that.pvt.vc = vc;
					that.pvt.vcproxy = vc.getProxy();
				}
				
				var controller = this.getController();
				if (this.pvt.vc)
					this.pvt.vc.dispose(done); //delDataBase(this.pvt.dbcontext.getGuid(), done);
				else
					done();			
			}
			
        });
        return UccelloClt;
    }
);