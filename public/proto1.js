
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var contextGuid = 0;
var uccelloClt = null;

// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt', './uccello/controls/controlMgr' ],
        function(UccelloClt, ControlMgr){

            var that = this;
			this.tabCount = 0;
            this.currContext=null;
            this.currRoot=null;
            this.masterGuid=null;
            this.rootsGuids=null;
            this.rootsContainers={};
            this.resultForm = '#result0';

            uccelloClt = new UccelloClt({host:"ws://"+url('hostname')+":8081", sessionId:$.url('#sid'), container:'#result0', callback: function(){
                if (uccelloClt.getLoggedUser()) {
                    $('#login').hide(); $('#logout').show();
                } else {
                    $('#logout').hide(); $('#login').show();
                }
            }});


            // --------------------------------------------------------------------------------------------------------
            // --------------------- Глобальные методы для кнопок управления -----------------------------------------
            // --------------------------------------------------------------------------------------------------------

            /**
             * subscribe user
             */
            window.subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера
				// TODO переделать uccelloClt.pvt.guids.
                uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    renderControls();
                    that.getContexts();
                });
            }


            /**
             * Рендер контролов
             * @param cm
             * @param renderRoot
             */
            window.renderControls = function(cm, renderRoot) {
                var roots = [];
                roots = cm? [that.currRoot] : (renderRoot?[renderRoot]:that.rootsGuids);

                if (roots)
                for(var i=0, len=roots.length; i<len; i++) {
                    cm = uccelloClt.getContextCM(roots[i]);
                    cm.render(undefined, {rootContainer: '#result'+that.rootsContainers[roots[i]]});
                }

                // редактирование ячеек грида
                $(".divCell").editable(function(value, settings) {
                    return(value);
                }, {
                    type    : 'textarea',
                    submit  : 'OK',
                    placeholder: '',
                    width      : '100px',
                    height     : '20px'
                });
            }

            var addControlId = 1000;
            window.addControl = function(guid, ini, cm) {

                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

				var constr = uccelloClt.getConstr(guid);
                var control = new constr(cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:that.resultForm});
				//uccelloClt.getController().genDeltas(cm.getDB().getGuid());
				sendDeltas(false);
                renderControls(cm);
            }

            /**
             * Удалить контрол
             * @param guid
             * @param cm
             */
            window.delControl = function(guid, cm) {
                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                cm.del(guid);
				uccelloClt.getController().genDeltas(cm.getDB().getGuid());
                renderControls(cm);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            window.getSessions = function() {
                uccelloClt.getClient().socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                    $('#result').append('<p>' + JSON.stringify(result.sessions) + ' </p>');
                });
            }

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass){
                uccelloClt.getClient().authenticate(name, pass, function(result){
                    if (result.user) {
                        $('#login').hide(); $('#logout').show();
                        $('#loginForm').hide();
                        $('#loginError').hide();

                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#loginError').html('Неправильный логин или пароль').show();
                    }
                });
            }

            /**
             * Выход
             */
            window.logout = function(){
                uccelloClt.getClient().deauthenticate(function(){
                    $('#login').show(); $('#logout').hide();
                });
                return false;
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            window.sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
					uccelloClt.getController().genDeltas(uccelloClt.getContextCM(that.currRoot).getDB().getGuid());
            }

            /**
             * Создать серверный контекст
             * @param guid - гуид ресурса, который загружается в контекст
             */
            window.createContext = function(guid) {
                $(that.resultForm).empty();
				uccelloClt.getClient().createSrvContext(guid, function(result){
                    that.masterGuid = result.masterGuid;
                    that.rootsGuids = result.roots;
                    that.tabCount = that.rootsGuids.length;
                    that.selectContext(that.masterGuid);
                });
            }

            /**
             * Выбрать рут
             * @param i
             */
            window.selectTab = function (i){
                $('.tabs').removeClass('active');
                $($('.tabs')[i]).addClass('active');
                $('.tabs-page').hide();
                $($('.tabs-page')[i]).show();
                that.resultForm = '#result'+i;
                that.currRoot = that.rootsGuids[i];
            }


            /**
             * Создать рут
             */
            window.createRoot = function(){
                if (!that.currRoot) return;
                uccelloClt.getClient().createRoot(that.currContext, function(result){
                    that.rootsGuids.push(result.rootGuid);
                    that.createTabs();
                    that.selectContext(that.currContext);
                });
            }

            /**
             * Сериализовать форму и вывести в консоль
             */
            window.serializeForm = function(){
                if (!that.currContext) return;
                var root = uccelloClt.getContextCM(that.currRoot).getDB().getObj(that.currRoot);
                console.log(uccelloClt.getContextCM(that.currRoot).getDB().serialize(root));
            }

            /**
             * Кнопка query
             */
            loadQuery = function(){
                if (!that.currContext) return;
                // запрашиваем данные
                uccelloClt.getClient().query(that.masterGuid, function(result2){
                    uccelloClt.getContextCM(that.currRoot).getDB().subscribeRoots(result2.rootGuid, function () {
                    }, function () {
                    });
                });
            }

            // ---------------------------------------------------------------------------------------------------------

            /**
             * Создать переключатели рутов
             */
            this.createTabs = function() {
                $('#tabs').empty();
                $('#container').empty();
                this.rootsContainers={};
                for(var i=0; i<that.rootsGuids.length; i++) {
                    $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                    $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                    that.rootsContainers[that.rootsGuids[i]] = i;
                }
                fixHeight();
            }

            /**
             * Создать переключать рута
             * @returns {string}
             */
            this.createTab = function() {
                var i = this.tabCount;
                $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                that.rootsContainers[that.rootsGuids[i]] = i;
                fixHeight();
                this.tabCount++;
                return "#result"+i;
            }


            /**
             * Выбрать контекст
             * @param guid
             */
            this.selectContext = function(guid) {
                $(that.resultForm).empty();
                that.currContext = guid;
                that.currRoot = that.rootsGuids[0];
                that.tabCount = 0;
                $('#tabs').empty();
                $('#container').empty();
                uccelloClt.selectContext(guid, function(renderRoot) {
					this.createTab();
                    renderControls(null, renderRoot);
                });
            }

            /**
             * Получить контексты и отобразить в комбо
             */
            this.getContexts = function() {
                var sel = $('#userContext');
                sel.empty();

                for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                    var root = uccelloClt.getSysDB().getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var option = $('<option/>');
                                option.val(item.get('DataBase')).html(item.get('Name'));
                                sel.append(option);
                            }
                            sel.val(that.currContext);
                            return;
                        }
                    }
                }
            }





            /*
             createComponentClient = function(obj) {
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
             options.db = myApp.dbclientcontext;
             }

             new uccelloClt.typeGuids[g](myApp.cmclientcontext, { objGuid: obj.getGuid() }, options);
             }
             */

            /**
             * Создать клиентский контекст
             * @param guid
             */
			 /*
            createClientContext = function(guid) {
                require(
                    ['./uccello/connection/clientConnection', './uccello/connection/visualContext', './uccello/baseControls/aComponent',
                        './uccello/baseControls/aControl', './ProtoControls/container', './ProtoControls/button',
                        './ProtoControls/matrixGrid',  './ProtoControls/propEditor',   './ProtoControls/dbNavigator',   './ProtoControls/edit'  ],
                    function(ClientConnection, VisualContext, AComponent, AControl, AContainer, AButton, AMatrixGrid, PropEditor, DBNavigator, AEdit) {
                        uccelloClt.getClient().socket.send({action: "loadRes", type: 'method'}, function (result) {
                            // create db and cm
                            myApp.dbclientcontext = myApp.controller.newDataBase({name: "Master", kind: "master"});
                            var db = myApp.dbclientcontext;
                            myApp.cmclientcontext = new ControlMgr(db);
                            var cm = myApp.cmclientcontext;

                            // metainfo
                            new AComponent(cm);
                            new AControl(cm);
                            new AContainer(cm);
                            new AButton(cm);
                            new AEdit(cm);
                            new AMatrixGrid(cm);
                            new PropEditor(cm);
                            new DBNavigator(cm);
                            new VisualContext(cm);
                            new ClientConnection(cm);

                            db.deserialize(result.res, {db: db}, createComponentClient);

                            // создаем контекст
                            var context = new VisualContext(myApp.cmclient, {parent: uccelloClt.getClient(), colName: "VisualContext",
                                ini: {fields: {Id: guid, Name: 'contextClient' + guid, DataBase: db.getGuid(), Root: db.getObj("ac949125-ce74-3fad-5b4a-b943e3ee67c6").getGuid()}}});

                            cm.render();
                        });
                    });
                }
				*/



            // ----------------------------------------------------------------------------------------------------
            // ---------------------- Функции обработчики хтмл объектов -------------------------------------------

            // высота окошка результатов
            fixHeight = function() {
                var h = $(window).height();
                $('.tabs-page').height(h-120);
                $('#editor').height(h-100);
                $('#console').width('100%');
            };
            fixHeight();
            $(window).resize(fixHeight);

            // форма логина
            $('#login').click(function(e){
                e.stopPropagation();
                if ($('#loginForm').is(':visible')) {
                    $('#loginForm').hide();
                } else {
                    var offset = $(this).offset();
                    offset.top += 20;
                    $('#loginForm').show().offset(offset);
                }
                return false;
            });
            $(window).click(function(){$('#loginForm').hide();});
            $('#loginForm').click(function(e){e.stopPropagation();});

            $('#userContext').change(function(){
                that.currContext = $(this).val();
                // запросить гуиды рутов
                uccelloClt.getClient().socket.send({action:"getRootGuids", db:that.currContext, rootKind:'res', type:'method'}, function(result) {
                    that.rootsGuids = result.roots;
                    that.createTabs();
                    that.selectContext(that.currContext);
                });
            });

            // ----------------------------------------------------------------------------------------------------

        }
    );
});

