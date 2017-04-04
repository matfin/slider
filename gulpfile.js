const 	gulp	= require('gulp'),
		uglify	= require('gulp-uglify');

gulp.task('default', () => {
	return gulp
	.src('_src/slider.js')
	.uglify()
	.pipe(gulp.dest('dist/slider.js'));
});