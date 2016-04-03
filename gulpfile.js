var gulp = require('gulp'),
    typescript = require('gulp-typescript');

var server = (function() {
    var exec = require('child_process').exec,
        process;

    return function() {
        if (process) {
            process.kill('SIGHUP');
        }

        process = exec('node app.js');

        process.stdout.on('data', function(data) {
            console.log(data);
        });
        process.stderr.on('data', function(data) {
            console.log(data);
        });
        process.on('close', function(code) {
            // console.log('closing code: ' + code);
        });
    }
} ());

gulp.task('default', ['typescript', 'server', 'watch']);

gulp.task('server', function() {
    server();
});

gulp.task('typescript', function() {
    gulp.src(['typescript/main.ts'])
        .pipe(typescript({
            target: "ES5", removeComments: true, out: "main.js"
        }))
        .pipe(gulp.dest('app/js/'));
});

gulp.task('watch', function() {
    gulp.watch("app.js", ['server']);
    gulp.watch("typescript/*.ts", ["typescript"]);
});