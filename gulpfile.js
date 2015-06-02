
var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var sources = [
    'src/scroll.prefix',
    'src/scroll.js',
    'src/utils/animate.js',
    'src/utils/scroller.js',
    'src/utils/easy-scroller.js',
    'src/**/*.js',
    'src/scroll.postfix'
];
gulp.task('build', function () {
    var i = 0;
    return gulp.src(sources)
        .pipe(concat('scroll.js'))
        .pipe(replace(/[\'\"]use strict[\'\"]\;?/g, function (a, b, c) {
            return i++ == 0 ? "'use strict';" : "";
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('./dist'));
});
gulp.task('watch', function () {
    gulp.watch(sources, ['build']);
});
gulp.task('serve', ['build', 'watch']);