
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var clientConnection = null, socket = null;
var sessionId = $.url('#sid');
var typeGuids = {};
var contextGuid = 0, currContext=null, currRoot=null;
var uccelloClt = null;
var masterGuid = null;
var rootsGuids = null;
var resultForm = '#result0';
var dataRoots = [];

// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt', './uccello/controls/controlMgr' ],
        function(UccelloClt, ControlMgr){
		
			this.tabCount = 0;

            uccelloClt = new UccelloClt({host:"ws://"+url('hostname')+":8081", sessionId:sessionId, container:'#result0', callback: function(){
                if (uccelloClt.getLoggedUser()) {
                    $('#login').hide(); $('#logout').show();
                } else {
                    $('#logout').hide(); $('#login').show();
                }
                clientConnection = uccelloClt.getClient();
                socket = uccelloClt.getClient().socket;
                typeGuids = uccelloClt.typeGuids;
            }});


            subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера
				
				// TODO переделать uccelloClt.pvt.guids.
                uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    renderControls();
                    getContexts();
                });
            }

            sendAndRender = function(){
                    sendDeltas();
                    renderControls();
            }

            createComponent = function(obj) {
                var g = obj.getTypeGuid();
                var options = {parent:resultForm};
                var params = {objGuid: obj.getGuid()};

                // метод обработки изменений для PropEditor
                if (g == "a0e02c45-1600-6258-b17a-30a56301d7f1") {
                    params.change = sendAndRender;
                }

                // DbNavigator
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    params.db = uccelloClt.getSysDB(); //myApp.dbsys;
                    params.change = sendAndRender;
                }

                new typeGuids[g](myApp.controlMgr, params);
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

                new typeGuids[g](myApp.cmclientcontext, { objGuid: obj.getGuid() }, options);
            }
			*/

            renderControls = function(cm, renderRoot) {
                var roots = [];
                roots = cm? [currRoot] : (renderRoot?[renderRoot]:rootsGuids);

                if (roots)
                for(var i=0, len=roots.length; i<len; i++) {
                    cm = uccelloClt.getContextCM(roots[i]);
                    cm.render();
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
            addControl = function(guid, ini, cm) {

                if (!cm) cm = uccelloClt.getContextCM(currRoot); //myApp.controlMgr;
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

				var constr = uccelloClt.getConstr(guid);
                var control = new constr(cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:resultForm});
				//uccelloClt.getController().genDeltas(cm.getDB().getGuid());
				sendDeltas(false);
                renderControls(cm);
            }

            /**
             * Удалить контрол
             * @param guid
             * @param cm
             */
            delControl = function(guid, cm) {
                if (!cm) cm = uccelloClt.getContextCM(currRoot);
                cm.del(guid);
				uccelloClt.getController().genDeltas(cm.getDB().getGuid());
                renderControls(cm);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            getSessions = function() {
                socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                    $('#result').append('<p>' + JSON.stringify(result.sessions) + ' </p>');
                });
            }

            /**
             * Логин
             * @param name
             * @param pass
             */
            login = function(name, pass){
                clientConnection.authenticate(name, pass, function(result){
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
            logout = function(){
                clientConnection.deauthenticate(function(){
                    $('#login').show(); $('#logout').hide();
                });
                return false;
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
					uccelloClt.getController().genDeltas(uccelloClt.getContextCM(currRoot).getDB().getGuid());
            }

            /**
             * Создать серверный контекст
             * @param guid - гуид ресурса, который загружается в контекст
             */
            createContext = function(guid) {
                $(resultForm).empty();
				uccelloClt.getClient().createSrvContext(guid, function(result){
                    masterGuid = result.masterGuid;
                    rootsGuids = result.roots;
                    //createTabs();
                    selectContext(masterGuid);
                });
            }

            createTabs = function() {
                $('#tabs').empty();
                $('#container').empty();
                for(var i=0; i<rootsGuids.length; i++) {
                    $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                    $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                }
                fixHeight();
            }

            createNewTab = function() {
				
				var i = this.tabCount;
                //$('#tabs').empty();
                //$('#container').empty();
                //for(var i=0; i<rootsGuids.length; i++) {
				$('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
				$('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                //}
                fixHeight();
				this.tabCount++;
				return "#result"+i;
            }
			
			
            createRoot = function(){
                if (!currRoot) return;
                uccelloClt.getClient().createRoot(currContext, function(result){
                    rootsGuids.push(result.rootGuid);
                    createTabs();
                    selectContext(currContext);
                });
            }
			
			setProps = function() {
				
			}

            /**
             * Выбрать контекст
             * @param guid
             */
            selectContext = function(guid) {
                $(resultForm).empty();
                uccelloClt.selectContext(guid, this.createNewTab, function(renderRoot) {
                    currContext = guid;
                    currRoot = rootsGuids[0];
                    getContexts();
                    renderControls(null, renderRoot);
                } );
            }

            /**
             * Получить контексты и отобразить в комбо
             */
            getContexts = function() {
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
                            sel.val(currContext);
                            return;
                        }
                    }
                }
            }

            selectRoot = function(root) {
                currRoot = root;
            }

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
                        socket.send({action: "loadRes", type: 'method'}, function (result) {

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
                            var context = new VisualContext(myApp.cmclient, {parent: clientConnection, colName: "VisualContext",
                                ini: {fields: {Id: guid, Name: 'contextClient' + guid, DataBase: db.getGuid(), Root: db.getObj("ac949125-ce74-3fad-5b4a-b943e3ee67c6").getGuid()}}});

                            cm.render();
                        });
                    });
                }
				*/

                serializeForm = function(){
                    if (!currContext) return;
                    var root = uccelloClt.getContextCM(currRoot).getDB().getObj(currRoot);
                    console.log(uccelloClt.getContextCM(currRoot).getDB().serialize(root));
                }

                loadQuery = function(){
                    if (!currContext) return;
                    // запрашиваем данные
                    uccelloClt.getClient().query(masterGuid, function(result2){
                        dataRoots.push(result2.rootGuid);
                        uccelloClt.getContextCM(currRoot).getDB().subscribeRoots(result2.rootGuid, function () {
                        }, function () {
                        });
                    });
                }
        }
    );
});

$(function(){

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
        currContext = $(this).val();
        // запросить гуиды рутов
        uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
            rootsGuids = result.roots;
            createTabs();
            selectContext(currContext);
        });
    });

    selectTab = function (i){
        $('.tabs').removeClass('active');
        $($('.tabs')[i]).addClass('active');
        $('.tabs-page').hide();
        $($('.tabs-page')[i]).show();
        resultForm = '#result'+i; //(i>0?i:'');
        uccelloClt.options.container = resultForm;
        currRoot = rootsGuids[i];
    }
});
