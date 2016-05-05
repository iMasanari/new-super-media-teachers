'use strict'

var mime = require('mime'),
    fs = require('fs'),
    path = require('path'),
    port = process.env.PORT || 3000,
    app = require('http').createServer(function (req, res) {
        var url = 'app' + req.url.replace(/\/$/, '/index.html');

        if (isGameStarted && url === 'app/index.html') {
            url = 'app/watch.html';
        }
        console.log('> ' + url);

        fs.readFile(url, function (err, data) {
            if (err) {
                res.writeHead(500);
                res.end('Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': mime.lookup(url)
            });
            res.end(data);
        })
    });

app.listen(port);
console.log('Server running at http://localhost:' + port + '/');

var io = require('socket.io').listen(app);

var isGameStarted = false;

io.sockets.on('connection', function (socket) {
    socket.on('add', function (data) {
        data.id = socket.id;
        socket.broadcast.emit('request-update', data);
    });
    socket.on('update', function (data) {
        data.id = socket.id;
        io.to('test').emit('update', data);
        // socket.broadcast.emit('update', data);
    });
    socket.on('join', function(roomName) {
        socket.join(roomName);
    });
    socket.on('inputStart', function (data) {
        data.id = socket.id;
        io.to('test').emit('inputStart', data);
    });
    socket.on('inputEnd', function (data) {
        data.id = socket.id;
        io.to('test').emit('inputEnd', data);
    });
    socket.on('request-enemy', function (name) {
        io.sockets.emit('addEnemy', name);
        
        // 5秒間、敵の自動追加を止める
        isAutoEnemyStop = true;
        clearTimeout(autoEnemyStopTimerId);
        
        autoEnemyStopTimerId = setTimeout(function() {
            isAutoEnemyStop = false;
        }, 5000);
    });
    socket.on('game-start', function (isStart) {
        io.sockets.emit('game-start', isStart);
        
        isGameStarted = isStart;
    });
    socket.on('set-life', function (num) {
        io.sockets.emit('set-life', num);
    });
    socket.on('point', function (data) {
        io.to('test').emit('point', data);
        
    });
    socket.on('auto-enemy-list', function (list) {
        autoEnemyList = list;
        autoEnemyListLen = autoEnemyList.length;
    });
    socket.on('remove', remove);
    socket.on('disconnect', remove);

    function remove() {
        io.to('test').emit('remove', socket.id);
    }
});

var autoEnemyList = ['Ai', 'Ps', 'Pr', 'Ae'],
    autoEnemyListLen = autoEnemyList.length,
    isAutoEnemyStop = false,
    autoEnemyStopTimerId;

function addEnemy() {
    if (autoEnemyListLen && !isAutoEnemyStop) {
        io.sockets.emit('addEnemy', autoEnemyList[Math.random() * autoEnemyListLen | 0]);
    }
}

(function loop() {
    setTimeout(addEnemy, Math.random() * 2000);
    setTimeout(loop, 3000);
})();