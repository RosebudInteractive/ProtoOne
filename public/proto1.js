
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var clientConnection = null, socket = null;
var guids = null, propEditor = null, dbcontext = null;
var sessionId = $.url('#sid');
var myApp = {};
var MemDBController=null, MemDataBase=null, ControlMgr=null;
var typeGuids = {};
var contextGuid = 0, currContext=null;

// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/connection/clientConnection' ,'./uccello/memDB/memDBController','./uccello/memDB/memDataBase','./uccello/baseControls/controlMgr','./ProtoControls/button', './ProtoControls/matrixGrid',
            './ProtoControls/container', './ProtoControls/propEditor', './ProtoControls/dbNavigator',
            './uccello/connection/user', './uccello/connection/session', './uccello/connection/connect', './uccello/connection/visualContext' ],
        function(ClientConnection,m1,m2,m3,b,g,c,pe,dn,user,session,connect,context){
            clientConnection = new ClientConnection();
            clientConnection.connect("ws://"+url('hostname')+":8081", sessionId,  function(result){
                if (result.user) {
                    $('#login').hide(); $('#logout').show();
                } else {
                    $('#logout').hide(); $('#login').show();
                }
                socket = clientConnection.socket;
                sessionId = result.sessionId;
                document.location.hash = '#sid='+sessionId;
                MemDBController = m1;
                MemDataBase = m2;
                ControlMgr = m3;
                typeGuids["af419748-7b25-1633-b0a9-d539cada8e0d"] = b;
                typeGuids["827a5cb3-e934-e28c-ec11-689be18dae97"] = g;
                typeGuids["1d95ab61-df00-aec8-eff5-0f90187891cf"] = c;
                typeGuids["a0e02c45-1600-6258-b17a-30a56301d7f1"] = pe;
                typeGuids["38aec981-30ae-ec1d-8f8f-5004958b4cfa"] = dn;
                typeGuids["dccac4fc-c50b-ed17-6da7-1f6230b5b055"] = user;
                typeGuids["70c9ac53-6fe5-18d1-7d64-45cfff65dbbb"] = session;
                typeGuids["66105954-4149-1491-1425-eac17fbe5a72"] = connect;
                typeGuids["d5fbf382-8deb-36f0-8882-d69338c28b56"] = context;
                typeGuids["5f27198a-0dd2-81b1-3eeb-2834b93fb514"] = ClientConnection;
                createController();
            });
        }
    );
});

function createController(done){
    socket.send({action:"getGuids", type:'method'}, function(result){
        guids = result;
        // создаем  контроллер и бд
        myApp.controller = new MemDBController();
        myApp.controller.event.on({
            type: 'applyDeltas',
            subscriber: this,
            callback: function(args){
                renderControls();
                getContexts();
            }
        });

        // создаем системную бд
        myApp.dbsys = myApp.controller.newDataBase({name:"System", proxyMaster : {connect: socket, guid: guids.masterSysGuid}});
        myApp.cmsys = new ControlMgr(myApp.dbsys);

        // создаем мастер базу для clientConnection
        myApp.dbclient = myApp.controller.newDataBase({name:"MasterClient", kind: "master"});
        myApp.cmclient = new ControlMgr(myApp.dbclient);
        require(
            ['./uccello/connection/clientConnection', './uccello/connection/visualContext', './uccello/baseControls/aComponent'],
            function(ClientConnection, VisualContext, AComponent) {
                new AComponent(myApp.cmclient);
                new VisualContext(myApp.cmclient);
                new ClientConnection(myApp.cmclient);
                clientConnection.init(myApp.cmclient, {});
            });

    });
}

function subscribeRootSys() {
    // подписываемся на корневой объект контейнера
    myApp.dbsys.subscribeRoot(guids.sysRootGuid, function(result){
        renderControls();
        getContexts();
    });
}

function createComponent(obj) {
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

function createComponentClient(obj) {
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

function renderControls() {
    if (!myApp.controlMgr) return;
    myApp.controlMgr.render();
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

function addButton() {
    var myRootCont;
    var gl = myApp.controlMgr._getCompGuidList();
    for (var f in gl)
        if (gl[f].getClassName() == "Container") { myRootCont=gl[f]; break; }

    var d={fields: {"Id": 99, "Name": "MysecButton2", "Caption": "OK111", "Left":"300", "Top":"150"}}
    var newb = new typeGuids["af419748-7b25-1633-b0a9-d539cada8e0d"](myApp.controlMgr, {parent: myRootCont, colName: "Children", ini:d },{parent:'#result'});
    var db = newb.getObj().getDB();
    myApp.controller.genDeltas(db.getGuid());
    renderControls();
}

/**
 * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
 * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
 * в мемо поле по кнопке (трассировка)
 */
function getSessions() {
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
function login(name, pass){
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
function logout(){
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
function createContext(guid) {
    $('#result').empty();
    socket.send({action:"createContext", type:'method', contextGuid:guid}, function(result){
        selectContext(result.masterGuid, result.myRootContGuid);
    });
}

/**
 * Выбрать контекст
 * @param guid
 */
function selectContext(guid, root) {

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
function getContexts() {
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
function createClientContext(guid) {
    require(
        ['./uccello/connection/clientConnection', './uccello/connection/visualContext', './uccello/baseControls/aComponent',
            './uccello/baseControls/aControl', './ProtoControls/container', './ProtoControls/button',
            './ProtoControls/matrixGrid',  './ProtoControls/propEditor',   './ProtoControls/dbNavigator'  ],
        function(ClientConnection, VisualContext, AComponent, AControl, AContainer, AButton, AMatrixGrid, PropEditor, DBNavigator) {
            socket.send({action: "loadRes", type: 'method'}, function (result) {

                // create db and cm
                myApp.dbclientcontext = myApp.controller.newDataBase({name: "Master", kind: "master"});
                myApp.cmclientcontext = new ControlMgr(db);
                var db = myApp.dbclientcontext;
                var cm = myApp.cmclientcontext;

                // metainfo
                new AComponent(cm);
                new AControl(cm);
                new AContainer(cm);
                new AButton(cm);
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
