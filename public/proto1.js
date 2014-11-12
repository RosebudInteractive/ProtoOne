
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
var myApp = {};
var typeGuids = {};
var contextGuid = 0, currContext=null, dbcontext = null;
var uccelloClt = null;


// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt', './uccello/baseControls/ControlMgr' ],
        function(UccelloClt, ControlMgr){

            uccelloClt = new UccelloClt({host:"ws://"+url('hostname')+":8081", sessionId:sessionId, callback: function(){
                if (uccelloClt.user) {
                    $('#login').hide(); $('#logout').show();
                } else {
                    $('#logout').hide(); $('#login').show();
                }
                myApp = uccelloClt.myApp;
                clientConnection = uccelloClt.clientConnection;
                socket = uccelloClt.clientConnection.socket;
                typeGuids = uccelloClt.typeGuids;
            }});


            subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера
                myApp.dbsys.subscribeRoot(myApp.guids.sysRootGuid, function(result){
                    renderControls();
                    getContexts();
                });
            }

            createComponent = function(obj) {
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
                    options.db = myApp.dbsys;
                }

                new typeGuids[g](myApp.controlMgr, { objGuid: obj.getGuid() }, options);
            }

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

            renderControls = function(cm) {
                if (!cm) cm = myApp.controlMgr;
                if (!cm) return;
                cm.render();
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

                if (!cm) cm = myApp.controlMgr;
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

                var control = new typeGuids[guid](cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:'#result'});
                myApp.controller.genDeltas(cm.getDB().getGuid());
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
            function sendDeltas(force) {
                if ($('#autoSendDelta').is(':checked') || force)
                    myApp.controller.genDeltas(dbcontext.getGuid());
            }

            /**
             * Создать контекст
             * @param guid
             */
            createContext = function(guid) {
                $('#result').empty();
                socket.send({action:"createContext", type:'method', contextGuid:guid}, function(result){
                    selectContext(result.masterGuid, result.myRootContGuid);
                });
            }

            /**
             * Выбрать контекст
             * @param guid
             */
            selectContext = function(guid, root) {

                function done() {
                    $('#result').empty();
                    dbcontext = myApp.controller.newDataBase({name:"Slave"+guid, proxyMaster : { connect: socket, guid: guid}}, function(){
                        dbcontext.subscribeRoot(root, function(){
                            currContext = guid + '|' + root;
                            getContexts();
                            renderControls();
                        }, createComponent);
                    });
                    myApp.controlMgr = new ControlMgr(dbcontext);
                }

                if (dbcontext)
                    myApp.controller.delDataBase(dbcontext.getGuid(), done);
                else
                    done();
            }

            /**
             * Получить контексты и отобразить в комбо
             */
            getContexts = function() {
                var sel = $('#userContext');
                sel.empty();

                for (var i = 0, len = myApp.dbsys.countRoot(); i < len; i++) {
                    var root = myApp.dbsys.getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var option = $('<option/>');
                                option.val(item.get('DataBase')+'|'+item.get('Root')).html(item.get('Name'));
                                sel.append(option);
                            }
                            sel.val(currContext);
                            return;
                        }
                    }
                }
            }

            /**
             * Создать клиентский контекст
             * @param guid
             */
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

                serializeForm = function(){
                    if (!dbcontext || !currContext) return;
                    var root = dbcontext.getObj(currContext.split('|')[1]);
                    console.log(dbcontext.serialize(root));
                }
        }
    );
});

$(function(){

    // высота окошка результатов
    function fixHeight() {
        var h = $(window).height();
        $('#result').height(h-80);
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
        var guids = $(this).val().split('|');
        selectContext(guids[0], guids[1]);
    });
});
