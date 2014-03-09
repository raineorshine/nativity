gulp = require('gulp')
gutil = require('gulp-util')
coffee = require('gulp-coffee')
uglify = require('gulp-uglify')
rename = require('gulp-rename')
rename = require('gulp-clean')

gulp.task 'scripts', ->
	gulp.src('src/*.coffee')
		.pipe(coffee().on('error', gutil.log))
		.pipe gulp.dest('./')
		.pipe uglify()
		.pipe rename({ suffix: '.min' })
		.pipe gulp.dest('./')

gulp.task 'watch', ->
	gulp.watch ['src/**/*.coffee'], ['scripts']

gulp.task 'clean', ->
	gulp.clean 'README.html'

gulp.task 'default', ['scripts', 'clean']