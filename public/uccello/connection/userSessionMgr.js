if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memDBController', '../controls/controlMgr', '../controls/aComponent', '../controls/aControl', './session', './connect', './user', '../system/event',
        './visualContext'],
    function(MemDBController, ControlMgr, AComponent, AControl, Session, Connect, User, Event, VisualContext) {
        var UserSessionMgr = Class.extend({

            init: function(router, options){
                this.sessions = {};
                this.connects = {};
                this.users = {};
                this.sessionId = 0;
                this.userId = 0;
				this.event = new Event();
                this.options = options;
				this.rpc = options.rpc;
				this.proxyServer =  options.proxyServer;

                // системные объекты
                this.dbcsys = new MemDBController(router);
                this.dbsys = this.dbcsys.newDataBase({name: "System", kind: "master", guid:'fb41702c-faba-b5c0-63a8-8d553bfe54a6'});
                this.cmsys = new ControlMgr(this.dbsys);

                // создаем метаинфо
                new AComponent(this.cmsys);
                new User(this.cmsys);
                new Session(this.cmsys);
                new Connect(this.cmsys);
                new VisualContext(this.cmsys);

                // функции роутера
                var that = this;
                router.add('connect', function(){ return that.routerConnect.apply(that, arguments); });
                router.add('authenticate', function(){ return that.routerAuthenticate.apply(that, arguments); });
                router.add('deauthenticate', function(){ return that.routerDeauthenticate.apply(that, arguments); });
                router.add('createContext', function(){ return that.routerCreateContext.apply(that, arguments); });
            },
			
			getController: function() {
				return this.dbcsys;
			},

            /**
             * Подключение с клиента
             * @param data
             * @returns {object}
             */
            routerConnect: function(data, done) {
                // подключаемся к серверу с клиента
                var result =  this.connect(data.socket, {client:data}, data.sid);

                // обработка события закрытия коннекта
                var connect = this.getConnect(data.connectId);
                var that = this;
                connect.event.on({
                    type: 'socket.close',
                    subscriber: this,
                    callback: function(args){
                        that.getController().onDisconnect(args.connId);
                        that.removeConnect(args.connId);
                    }
                });
                done(result);
            },

            /**
             * Авторизация
             * @param data
             * @returns {object}
             */
            routerAuthenticate: function(data, done) {
                var session = this.getConnect(data.connectId).getSession();
                this.authenticate(data.connectId, session.getId(), data.name, data.pass, done);
            },

            /**
             * Деавторизация
             * @param data
             * @returns {object}
             */
            routerDeauthenticate: function(data, done) {
                var session = this.getConnect(data.connectId).getSession();
                this.deauthenticate(session.getId(), done);
            },



            /**
             * Создать серверный контекст
             * @param data
             * @param done
             */
            routerCreateContext: function(data, done) {
                var that = this;
                var user = this.getConnect(data.connectId).getSession().getUser();
				console.log("connectID "+data.connectId);
                var controller = this.getController();
                var context = new VisualContext(this.cmsys, {parent: user, colName: "VisualContext", socket: this.getConnect(data.connectId).getConnection(), rpc: this.rpc, proxyServer: this.proxyServer,
                    ini: {fields: {Id: data.contextGuid, Name: 'context'+data.contextGuid, Kind: "master"}}});
                var result = {masterGuid: context.dataBase(), roots: controller.getDB(context.dataBase()).getRootGuids(), vc: context.getGuid()};
                controller.genDeltas(this.dbsys.getGuid());
                done(result);
            },

            /**
             * Загрузить ресурс
             * @returns {obj}
             */
            loadRes: function (guidRoot) {
                var dbc = this.dbcsys;
				var datamodelGuid = dbc.guid();
				var datasetGuid = dbc.guid();
				var datasetGuid2 = dbc.guid();
                var hehe = {
                    "$sys": {
                        "guid": guidRoot,
                        "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                    },
                    "fields": {
                        "Id": 11,
                        "Name": "MainContainer"
                    },
                    "collections": {
                        "Children": [
                            {
                                "$sys": {
                                    "guid": datamodelGuid,
                                    "typeGuid": "5e89f6c7-ccc2-a850-2f67-b5f5f20c3d47"
                                },
                                "fields": {
                                    "Id": 127,
                                    "Name": "DataModel"
                                },
                                "collections": {"Datasets": [
                                    {
                                        "$sys": {
                                            "guid": datasetGuid,
                                            "typeGuid": "3f3341c7-2f06-8d9d-4099-1075c158aeee"
                                        },
                                        "fields": {
                                            "Id": 122,
                                            "Name": "Dataset"
                                        },
                                        "collections": {}
                                    },
                                    {
                                        "$sys": {
                                            "guid": datasetGuid2,
                                            "typeGuid": "3f3341c7-2f06-8d9d-4099-1075c158aeee"
                                        },
                                        "fields": {
                                            "Id": 123,
                                            "Name": "Dataset2"
                                        },
                                        "collections": {}
                                    }
                                ]}
                            },
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "ff7830e2-7add-e65e-7ddf-caba8992d6d8"
                                },
                                "fields": {
                                    "Id": 22,
                                    "Name": "Grid",
                                    "Top": "67",
                                    "Left": "330",
                                    "Width":700,
                                    "Height":160,
                                    "Dataset":datasetGuid
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                },
                                "fields": {
                                    "Id": 22,
                                    "Name": "MyFirstButton1",
                                    "Top": "50",
                                    "Left": "30",
                                    "Caption": "OK"
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "827a5cb3-e934-e28c-ec11-689be18dae97"
                                },
                                "fields": {
                                    "Id": 33,
                                    "Name": "MatrixGrid",
                                    "Top": "60",
                                    "Left": "50",
                                    "HorCells": 3,
                                    "VerCells": 4
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "a0e02c45-1600-6258-b17a-30a56301d7f1"
                                },
                                "fields": {
                                    "Id": 44,
                                    "Name": "PropEditor",
                                    "Top": "10",
                                    "Left": "900"
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "38aec981-30ae-ec1d-8f8f-5004958b4cfa"
                                },
                                "fields": {
                                    "Id": 55,
                                    "Name": "DbNavigator",
                                    "Top": "240",
                                    "Left": "20",
                                    "Nlevels": 3,
                                    "RootElem": "fc13e2b8-3600-b537-f9e5-654b7418c156",
                                    "Level": 0
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                                },
                                "fields": {
                                    "Id": 100,
                                    "Name": "Container2",
                                    "Width":500,
                                    "Height":50,
                                    "Top": "5",
                                    "Left": "230"
                                },
                                "collections": {
                                    "Children": [
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                            },
                                            "fields": {
                                                "Id": 101,
                                                "Name": "Button1",
                                                "Top": "5",
                                                "Left": "30",
                                                "Caption": "Button1"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                            },
                                            "fields": {
                                                "Id": 101,
                                                "Name": "Button2",
                                                "Top": "5",
                                                "Left": "130",
                                                "Caption": "Button2"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                                            },
                                            "fields": {
                                                "Id": 100,
                                                "Name": "Container3",
                                                "Width":220,
                                                "Height":50,
                                                "Top": "5",
                                                "Left": "230"
                                            },
                                            "collections": {
                                                "Children": [
                                                    {
                                                        "$sys": {
                                                            "guid": dbc.guid(),
                                                            "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                                        },
                                                        "fields": {
                                                            "Id": 103,
                                                            "Name": "Button3.1",
                                                            "Top": "5",
                                                            "Left": "30",
                                                            "Caption": "Button3.1"
                                                        },
                                                        "collections": {}
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": dbc.guid(),
                                                            "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                                        },
                                                        "fields": {
                                                            "Id": 104,
                                                            "Name": "Button3.2",
                                                            "Top": "5",
                                                            "Left": "130",
                                                            "Caption": "Button3.2"
                                                        },
                                                        "collections": {}
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                };
                return hehe;
            },

            /**
             * Подключаемся к серверу с клиента
             * @param {object} socket
             * @param {object} data Данные в формате {client:{...}}
             * @param {number=} sessionId
             */
            connect: function(socket, data, sessionId) {

                var session = this.getSession(sessionId);

                // если не указан номер сессии или не найдена создаем новую
                if (!session) {
                    sessionId = this._newSession();
                    session = this.getSession(sessionId);
                }

                // добавляем коннект в общий список и в сессию
				var ini =  { fields: {Id:socket.getConnectId(), Name: "C"+socket.getConnectId()}}
                var connect = new Connect(this.cmsys, {parent:session, colName: "Connects", ini: ini, /*id:socket.getConnectId()*/ ws:socket,  /*sessionID:sessionId*/ userAgent:data.client.agent, stateReady:1});
                this.addConnect(connect);
                session.addConnect(connect);

                // Если возвращен user, то это означает, что сессия авторизована и соответствует пользователю с логином user.user
                var result = {sessionId: sessionId};
                var user = session.getUser();
                if (user.authenticated())
                    result.user = {user: user.name(), loginTime: user.loginTime()};

                return result;
            },

            /**
             * Cоздает новую сессию с неавторизованным пользователем и возвращает идентификатор этой сессии
             * @returns {number}
             * @private
             */
            _newSession: function() {
                var user = this._newUser();
                var sessionId = ++this.sessionId;
                var session = new Session(this.cmsys, {parent:user, colName: "Sessions", ini: { fields: {Id:sessionId, Name: "S"+sessionId}}});
                this.addSession(session);
                this.addUser(user);
                user.addSession(session);
                return sessionId;
            },

            /**
             * Создать noname-пользователя
             * @private
             */
            _newUser: function() {
                var userId = ++this.userId;
                //var user = new User(this.cmsys, {name:'noname'+userId});
				var user = new User(this.cmsys, { ini: { fields: { Id: userId, Name: 'noname'+userId } }}); //    name:'noname'+userId});
				
				// генерируем событие на создание нового пользователя, чтобы привязать к нему контекст
				this.event.fire({
                   type: 'newUser',
                   target: user
                });
				
                return user;
            },

            /**
             *  Аутентификация - если успешно, ищется пользователь с именем user и если найден - сессия подключается к нему,
             *  а noname-пользователь удаляется из списка. Если нет, то noname-пользователь получает имя user.
             *  Возвращает объект {user: string, loginTime: dateTime}
             * @param connectId
             * @param sessionId
             * @param user
             * @param pass
             */
            authenticate: function(connectId, sessionId, user, pass, done) {
                var that = this;
                this.options.authenticate(user, pass, function(err, result){
                    if (result) {
                        var userObj = that.getUser(user);
                        var session = that.getSession(sessionId);
                        if (userObj) {
                            that.removeUser(session.getUser().name());
                        } else {
                            userObj = session.getUser();
                            //userObj.setName(user);
							userObj.name(user);
                        }
                        userObj.addSession(session);
                        userObj.authenticated(true);
                        userObj.loginTime(Date.now());
						// рассылка дельт 1/9/14
						that.dbcsys.genDeltas(that.dbsys.getGuid());
                        done({user:{user: userObj.name(), loginTime: userObj.loginTime()}});
                    }
					//TODO почему без ELSE?
                    done({user:null});
                });
            },

            /**
             * деаутентификация для сессии - сессия отключается от “именованного” пользователя и создается noname-пользователь,
             * то есть процесс, обратный аутентификации.
             * TODO - в будущем нужно оповещать все коннекты о деаутентификации
             * @param sessionId
             */
            deauthenticate: function(sessionId, done) {
                var session = this.getSession(sessionId);

                // удаляем у именованного
                session.getUser().removeSession(sessionId);

                // создаем noname
                var user = this._newUser();

                // сессию привязываем к юзеру
                user.addSession(session);
                //session.setUser(user);
                done({});
            },

            /**
             * принудительное отключение сессии - все коннекты сессии также принудительно отключаются
             * @param sessionId
             */
            disconnect: function(sessionId) {
                var session = this.getSession(sessionId);
                var user = session.getUser();
                var sessions = user.getSessions();
                for(var i in sessions) {
                    this.removeSession(sessions[i].getId());
                    user.removeSession(sessions[i].getId())
                }
            },



            addSession: function(session){
                this.sessions[session.getId()] = {item:session, date:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')};
            },
            getSessions: function(){
                return this.sessions;
            },
            getSession: function(id){
                return this.sessions[id] ? this.sessions[id].item : null;
            },
            removeSession: function(id){
                if (this.sessions[id])
                    delete this.sessions[id];
            },
            /**
             * общее число сессий
             */
            countSession: function() {
                return Object.keys(this.sessions).length;
            },

            addConnect: function(connect){
                this.connects[connect.getId()] = {item:connect, date:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')};
            },
            getConnect: function(id){
                return this.connects[id] ? this.connects[id].item : null;
            },
            getConnectDate: function(id){
                return this.connects[id] ? this.connects[id].date : null;
            },
            removeConnect: function(id){
                if (this.connects[id])
                    delete this.connects[id];
            },
            /**
             * общее число коннектов
             */
            countConnect: function() {
                return Object.keys(this.connects).length;
            },

            addUser: function(user){
                this.users[user.name()] = {item:user, date:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')};
            },
            getUser: function(name){
                return this.users[name] ? this.users[name].item : null;
            },
            removeUser: function(name){
                if (this.users[name])
                    delete this.users[name];
            },
            /**
             * общее число пользователей
             */
            countUser: function() {
                return Object.keys(this.users).length;
            }

        });
        return UserSessionMgr;
    }
);