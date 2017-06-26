'use strict';

const 	gulp 		= require('gulp'),
		babel		= require('gulp-babel'),
		rename		= require('gulp-rename'),
		jshint		= require('gulp-jshint'),
		babelmin	= require('gulp-babel-minify');

gulp.task('build', () => {
	return gulp
	.src('./_src/slider.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('minify', () => {
	return gulp
	.src('./_src/slider.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(babelmin({
		presets: ['es2015']
	}))
	.pipe(rename('slider.min.js'))
	.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build', 'minify']);


