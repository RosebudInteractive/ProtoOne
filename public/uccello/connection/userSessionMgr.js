if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./session', './connect', './user', '../system/event'],
    function(Session, Connect, User,Event) {
        var UserSessionMgr = Class.extend({

            init: function(router){
                this.sessions = {};
                this.connects = {};
                this.users = {};
                this.sessionId = 0;
                this.userId = 0;
				this.event = new Event();

                // функции роутера
                var that = this;
                router.add('connect', function(){ return that.routerConnect.apply(that, arguments); });
                router.add('authenticate', function(){ return that.routerAuthenticate.apply(that, arguments); });
                router.add('deauthenticate', function(){ return that.routerDeauthenticate.apply(that, arguments); });
            },

            /**
             * Подключение с клиента
             * @param data
             * @returns {object}
             */
            routerConnect: function(data) {
                // подключаемся к серверу с клиента
                var result =  this.connect(data.socket, {client:data}, data.sid);

                // обработка события закрытия коннекта
                var connect = this.getConnect(data.connectId);
                connect.event.on({
                    type: 'socket.close',
                    subscriber: this,
                    callback: function(args){
                        connect.getSession().getUser().getData().controller.onDisconnect(args.connId);
                        this.removeConnect(args.connId);
                    }
                });
                return result;
            },

            /**
             * Авторизация
             * @param data
             * @returns {object}
             */
            routerAuthenticate: function(data) {
                var session = this.getConnect(data.connectId).getSession();
                var result = {user:this.authenticate(data.connectId, session.getId(), data.name, data.pass)};
                return result;
            },

            /**
             * Деавторизация
             * @param data
             * @returns {object}
             */
            routerDeauthenticate: function(data) {
                var session = this.getConnect(data.connectId).getSession();
                return this.deauthenticate(session.getId());
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
                var connect = new Connect(socket.getConnectId(), socket,  {sessionID:sessionId, userAgent:data.client.agent, stateReady:1});
                this.addConnect(connect);
                session.addConnect(connect);

                // Если возвращен user, то это означает, что сессия авторизована и соответствует пользователю с логином user.user
                var result = {sessionId: sessionId};
                var user = session.getUser();
                if (user.isAuthenticated())
                    result.user = {user: user.getName(), loginTime: user.getLoginTime()};

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
                //data.user = user;
                var session = new Session(sessionId, user);
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
                var user = new User('noname'+userId);
				
				// генерируем событие на создание нового пользователя, чтобы привязать к нему контекст
				this.event.fire({
                   type: 'newUser',
                   target: user,
				   blalba: 1
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
             * @returns {object}
             */
            authenticate: function(connectId, sessionId, user, pass) {
                if (user.substr(0, 4) == 'user' && pass == '123') {
                    var userObj = this.getUser(user);
                    var session = this.getSession(sessionId);
                    if (userObj) {
                        this.removeUser(session.getUser().getName());
                    } else {
                        userObj = session.getUser();
                        userObj.setName(user);
                    }
                    userObj.addSession(session);
                    userObj.setAuthenticated(true);
                    userObj.setLoginTime(Date.now());
                    return {user: userObj.getName(), loginTime: userObj.getLoginTime()};
                }
                return null;
            },

            /**
             * деаутентификация для сессии - сессия отключается от “именованного” пользователя и создается noname-пользователь,
             * то есть процесс, обратный аутентификации.
             * TODO - в будущем нужно оповещать все коннекты о деаутентификации
             * @param sessionId
             */
            deauthenticate: function(sessionId) {
                var session = this.getSession(sessionId);

                // удаляем у именованного
                session.getUser().removeSession(sessionId);

                // создаем noname
                var user = this._newUser();

                // сессию привязываем к юзеру
                user.addSession(session);
                session.setUser(user);
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
                this.users[user.getName()] = {item:user, date:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')};
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