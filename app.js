'use strict'

var mime = require('mime'),
    fs = require('fs'),
    path = require('path'),
    port = process.env.PORT || 3000,
    app = require('http').createServer(function (req, res) {
        var url = 'app' + req.url.replace(/\/$/, '/index.html');

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

io.sockets.on('connection', function (socket) {
    socket.on('add', function (data) {
        data.id = socket.id;
        socket.broadcast.emit('request-update', data);
    });
    socket.on('update', function (data) {
        data.id = socket.id;
        socket.broadcast.emit('update', data);
    });
    socket.on('inputStart', function (data) {
        data.id = socket.id;
        socket.broadcast.emit('inputStart', data);
    });
    socket.on('inputEnd', function (data) {
        data.id = socket.id;
        socket.broadcast.emit('inputEnd', data);
    });
    socket.on('remove', remove);
    socket.on('disconnect', remove);

    function remove() {
        io.sockets.emit('remove', socket.id);
    }
});

var enemyList = [
    // 'Piyo',
    'Ai',
    'Ps',
    'Ai',
    'Ps',
    'Pr',
    'Ae',
    // 'Usagi'
],
    enemyListLen = enemyList.length;
    
function addEnemy() {
    io.sockets.emit('addEnemy', enemyList[Math.random() * enemyListLen | 0]);
}

(function loop() {
    setTimeout(addEnemy, Math.random() * 2000);
    setTimeout(loop, 3000);
})();