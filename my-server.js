var exec = require('child_process').exec,
    process;

module.exports = function(cmd) {
    if (process) {
        process.kill('SIGHUP');
    }

    process = exec(cmd);

    process.stdout.on('data', function(data) {
        console.log(data);
    });
    process.stderr.on('data', function(data) {
        console.log(data);
    });
    // process.on('close', function(code) {
    //     console.log('closing code: ' + code);
    // });
}
