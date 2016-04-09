var gulp = require('gulp'),
    typescript = require('gulp-typescript'),
    server = require('./my-server.js');

gulp.task('default', ['typescript', 'server', 'watch']);

gulp.task('server', function() {
    server('node app.js');
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