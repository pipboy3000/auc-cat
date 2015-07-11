/* jshint strict: false */
/* jshint node: true */

var autoprefixer = require('gulp-autoprefixer');
var browserify   = require('browserify');
var browserSync  = require('browser-sync').create();
var buffer       = require('vinyl-buffer');
var del          = require('del');
var envify       = require('envify/custom');
var ghPages      = require('gulp-gh-pages');
var gulp         = require('gulp');
var path         = require('path');
var riot         = require('riotify');
var runSequence  = require('run-sequence');
var sass         = require('gulp-sass');
var source       = require('vinyl-source-stream');
var sourcemaps   = require('gulp-sourcemaps');
var watchify     = require('watchify');

var $ = {
  dist: "./dist/",
  app:  "./src/app.js",
  html: "./src/**/*.html",
  js:   "./src/js/*.js",
  scss: "./src/scss/**/*.scss",
  tag:  "./src/tag/*.tag",
  env:  "development"
};

function compile(watch) {
  var bundler  = watchify(browserify($.app), {debug: true})
                    .transform(envify({NODE_ENV: $.env}))
                    .transform(riot, {type: 'es6'});

  function rebundle() {
    bundler.bundle()
    .on('error', function(err) { console.error(err); this.emit('end'); })
    .pipe(source(path.basename($.app)))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest($.dist));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
}

gulp.task('clean', function(cb) { del([$.dist], cb); });
gulp.task('jsBuild', function() { return compile(); });
gulp.task('jsWatch', function() { return watch(); });

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: $.dist
    },
    files: [$.dist]
  });

  gulp.watch($.html, ['html']);
  gulp.watch($.scss, ['sass']);
  gulp.watch([$.js, $.tag], ['jsBuild']);
});

gulp.task('sass', function() {
  var include = require('node-normalize-scss').with('./node_modules/csstyle');

  gulp.src($.scss)
  .pipe(sass({includePaths: include})
        .on('error', function(err) { console.log(err); }))
  .pipe(autoprefixer({
    browsers: ['> 1%', 'last 2 versions', 'Android 4'],
    cascade: false
  }))
  .pipe(gulp.dest($.dist))
  .pipe(browserSync.stream());
});

gulp.task('html', function() {
  gulp.src($.html)
  .pipe(gulp.dest($.dist));
});

gulp.task('deploy', function(cb) {
  $.env = "production";
  runSequence('clean', ['html', 'sass', 'jsBuild'], cb);
  // return gulp.src('./dist/**/*')
  //            .pipe(ghPages());
});

gulp.task('default', function(cb) {
  runSequence('clean', ['html', 'sass', 'jsWatch'], 'serve', cb);
});
