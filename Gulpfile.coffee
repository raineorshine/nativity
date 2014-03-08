gulp = require('gulp')
gutil = require('gulp-util')
coffee = require('gulp-coffee')
uglify = require('gulp-uglify')
rename = require('gulp-rename')

gulp.task 'scripts', ->
	gulp.src('src/*.coffee')
		.pipe(coffee(bare: true).on('error', gutil.log))
		.pipe gulp.dest('./')
		.pipe uglify()
		.pipe rename({ suffix: '.min' })
		.pipe gulp.dest('./')

gulp.task 'watch', ->
	gulp.watch ['src/**/*.coffee'], ['scripts']

gulp.task 'default', ['scripts']