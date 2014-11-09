
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
var dbc=null, dbsl=null, dbs2=null, dbsys=null, guids=null, propEditor = null;

var myApp = {};
var MemDBController=null, MemDataBase=null, ControlMgr=null;
var typeGuids = {};

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
                createController();
            });
        }
    );
});

function createController(done){
    socket.send({action:"getGuids", type:'method'}, function(result){
        guids = result;
        // создаем  контроллер и бд
        dbc = new MemDBController();
        myApp.controller = dbc;
        dbc.event.on({
            type: 'applyDeltas',
            subscriber: this,
            callback: function(args){
                renderControls();
            }
        });

        /*var cb = subscribeRoot;
        dbsl = dbc.newDataBase({name:"Slave1", proxyMaster : { connect: socket, guid: guids.masterGuid}},cb);
        myApp.controlMgr = new ControlMgr(dbsl);
        console.log('контроллер:', dbc);
        console.log('база данных B:', dbsl);
*/
        // создаем системную бд
        dbsys = dbc.newDataBase({name:"System", proxyMaster : {connect: socket, guid: guids.masterSysGuid}});
        myApp.cmsys = new ControlMgr(dbsys);


    });
}

/*
function subscribeRoot() {
    // подписываемся на корневой объект контейнера
    dbsl.subscribeRoot(guids.myRootContGuid, function(result){
        renderControls();
    }, createComponent);
}
*/

/*function subscribeRootSys() {
    // подписываемся на корневой объект контейнера
    console.log('база данных Sys:', dbsys.getObj("fc13e2b8-3600-b537-f9e5-654b7418c156"));
    dbsys.subscribeRoot(guids.sysRootGuid, function(result){
        renderControls();
    });
}*/

/*
function createDataBase2() {
    dbs2 = dbc.newDataBase({name:"Slave2", proxyMaster : { connect: socket, guid: dbsl.getGuid()}});
    dbs2.subscribeRoot(guids.myRootContGuid, function(result){
        renderControls();
    }, createComponent);
    console.log('база данных C:', dbs2);
}
*/

function createComponent(obj) {
    var g = obj.getTypeGuid();
    var options = {parent:'#result'};

    // метод обработки изменений для PropEditor
    if (g == "a0e02c45-1600-6258-b17a-30a56301d7f1") {
        options.change = function(){
            sendDeltas();
            renderControls(false);
        };
    }

    // DbNavigator для системной бд
    if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
        options.db = dbsys;
    }

    new typeGuids[g](myApp.controlMgr, { objGuid: obj.getGuid() }, options);
}

function renderControls(renderEditor) {
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
    //myRootCont.addToCol("Children", newb);
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
var dbcontext = null;
function createContext(guid) {
    socket.send({action:"createContext", type:'method', contextGuid:guid}, function(result){
        dbcontext = dbc.newDataBase({name:"Slave"+guid, proxyMaster : { connect: socket, guid: result.masterGuid}}, function(){
            dbcontext.subscribeRoot(result.myRootContGuid, function(){
                renderControls();
            }, createComponent);
        });
        myApp.controlMgr = new ControlMgr(dbcontext);
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
});
