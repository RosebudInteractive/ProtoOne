if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memDBController', '../baseControls/controlMgr', '../baseControls/aComponent', '../baseControls/aControl', './session', './connect', './user', '../system/event',
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
                /**
                 * Загрузить ресурс
                 * @returns {obj}
                 */
                function loadRes(guidRoot) {
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
                            "Children": {
                                "0": {
                                    "$sys": {
                                        "guid": that.dbcsys.guid(),
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
                                "1": {
                                    "$sys": {
                                        "guid":  that.dbcsys.guid(),
                                        "typeGuid": "827a5cb3-e934-e28c-ec11-689be18dae97"
                                    },
                                    "fields": {
                                        "Id": 33,
                                        "Name": "Grid",
                                        "Top": "60",
                                        "Left": "50",
                                        "HorCells": 3,
                                        "VerCells": 4
                                    },
                                    "collections": {}
                                },
                                "2": {
                                    "$sys": {
                                        "guid":  that.dbcsys.guid(),
                                        "typeGuid": "a0e02c45-1600-6258-b17a-30a56301d7f1"
                                    },
                                    "fields": {
                                        "Id": 44,
                                        "Name": "PropEditor",
                                        "Top": "10",
                                        "Left": "700"
                                    },
                                    "collections": {}
                                },
                                "3": {
                                    "$sys": {
                                        "guid":  that.dbcsys.guid(),
                                        "typeGuid": "38aec981-30ae-ec1d-8f8f-5004958b4cfa"
                                    },
                                    "fields": {
                                        "Id": 55,
                                        "Name": "DbNavigator",
                                        "Top": "240",
                                        "Left": "20"
                                    },
                                    "collections": {}
                                }
                            }
                        }
                    };
                    return hehe;
                }


                /**
                 * Создать базу данных
                 * @param dbc
                 * @param options
                 * @returns {object}
                 */
                function createDb(dbc, options){
                    var db = dbc.newDataBase(options);
                    var cm = new ControlMgr(db);

                    // meta
                    new AComponent(cm);
                    new AControl(cm);

                    // загружать динамически
                    var AContainer = require('../../../public/ProtoControls/container');
                    var AButton = require('../../../public/ProtoControls/button');
                    var AEdit = require('../../../public/ProtoControls/edit');
                    var AMatrixGrid = require('../../../public/ProtoControls/matrixGrid');
                    var PropEditor = require('../../../public/ProtoControls/propEditor');
                    var DBNavigator = require('../../../public/ProtoControls/dbNavigator');
                    new AContainer(cm);
                    new AButton(cm);
                    new AEdit(cm);
                    new AMatrixGrid(cm);
                    new PropEditor(cm);
                    new DBNavigator(cm);

                    //this.loadControls();
                    var roots = [ that.dbcsys.guid(),  that.dbcsys.guid()];
                    var hehe1 = loadRes(roots[0]);
                    var hehe2 = loadRes(roots[1]);
                    db.deserialize(hehe1, {db: db, cm:cm});
                    db.deserialize(hehe2, {db: db, cm:cm});
                    return {cm:cm, db:db, roots: [db.getObj(roots[0]).getGuid(), db.getObj(roots[1]).getGuid()]};
                }

                var user = this.getConnect(data.connectId).getSession().getUser();
                var controller = this.getController();
                var r = createDb(controller, {name: "Master", kind: "master"});
                var context1 = new VisualContext(r.cm, {parent: user, colName: "VisualContext",
                    ini: {fields: {Id: data.contextGuid, Name: 'context'+data.contextGuid, DataBase: r.db.getGuid(), Root:r.roots[0]}}});
                var context2 = new VisualContext(r.cm, {parent: user, colName: "VisualContext",
                    ini: {fields: {Id: data.contextGuid+1, Name: 'context'+data.contextGuid+1, DataBase: r.db.getGuid(), Root:r.roots[1]}}});
                var result = {masterGuid: r.db.getGuid(), roots:r.roots};
                controller.genDeltas(this.dbsys.getGuid());
                done(result);
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