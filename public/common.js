/**
 * Выполнение команды
 * @param command Формат comand param1,param2,...paramN
 */
function runCommand(command, viewResult, clearConsole) {
    var func = (command.substring(0, command.indexOf(' '))).trim();
    var params = (command.substring(command.indexOf(' ')+1)).trim();
    if (func == "") {
        func = command.trim();
        params = "";
    }

    if (eval("typeof " + func) !== 'function'){
        $('#result').append('<p>Функция `'+func+'` не найдена</p>');
        return false;
    }

    var result = eval(func+'('+params+')');
    if (viewResult)
        $('#result').append('<p>Результат '+ func +'('+params+'): '+result+' </p>');
    if (clearConsole)
        $('#console').val('');
    return true;
}


// инициализация
$(function(){
    function fixHeight() {
        $('#result').height($(window).height()-90);
        $('#console').width('100%');
    };
    fixHeight();
    $(window).resize(fixHeight);

    // click enter
    $("#console").keyup(function(event){
        if(event.keyCode == 13){
            event.preventDefault();
            event.stopPropagation();
            runCommand($('#console').val(), false, true);
        }
    });
});

// работа с сокетами
if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}
// создать подключение
var socket = new WebSocket("ws://"+url('hostname')+":8081");
var ping = null;
socket.onopen = function(event) {
    // отправляем сообщение что подключились
    socket.send(JSON.stringify({action:'connect', sid: $.url('?sid'), agent:navigator.userAgent}));
    // пингует раз в секунду сервер раз в секунду
    ping = setInterval(function(){
        socket.send(JSON.stringify({action:'ping', sid: $.url('?sid')}));
    }, 1000);
};

// обработчик входящих сообщений
socket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    switch (data.action) {
        case 'sessions':
            console.log(data.sessions);
            break;
        case 'send':
            console.log(data.str, data.timedelta+'мс');
            break;
        case 'savelog':
            console.log(data.str);
            break;
    }
};

// при закрытии сокета убираем пинг
socket.onclose = function(){
    if (ping)
        clearInterval(ping);
    console.log('socket closed');
};

// команда SESSIONS (S)
var s = S = SESSIONS = function(){
    socket.send(JSON.stringify({action:'sessions', sid: $.url('?sid')}));
};

// команда SEND "СТРОКА"
var send = SEND = function(str){
    socket.send(JSON.stringify({action:'send', sid: $.url('?sid'), str: str, time:Date.now()}));
};

// команда SAVELOG
var savelog = SAVELOG = function(str){
    socket.send(JSON.stringify({action:'savelog', sid: $.url('?sid')}));
};