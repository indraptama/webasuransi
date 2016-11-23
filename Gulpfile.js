var gulp = require('gulp');
var postcss = require('gulp-postcss');
var jade = require('gulp-pug');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');


var cssnext = require('postcss-cssnext');
var mqpacker = require('css-mqpacker');
var cssImport = require('postcss-import');
var resType = require('postcss-responsive-type');

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var notify = require('gulp-notify');
var assign = require('lodash.assign');
var gutil = require('gulp-util');
var uncss = require('gulp-uncss');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var ghPages = require('gulp-gh-pages');



gulp.task('default',['jade','css','js','browser-sync'], function() {
    gulp.watch('./src/index.css', ['css']);
    gulp.watch('./src/css/**/*.css', ['css']);
    gulp.watch('./src/html/**/*.jade', ['jade']);
});
gulp.task('build', ['jadeBuild','cssBuild','jsBuild']);
gulp.task('buildAndDeploy', ['jadeBuild','cssBuild','jsBuild','deploy']);



// Github deploy
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

/**
 * Compile CSS File
 */

gulp.task('css', function() {
    var processor = [
        cssImport(),
        resType(),
        cssnext(),
        mqpacker()
    ];
    return gulp.src('./src/css/style.css')
        //.pipe(duoTask())
        .pipe(postcss(processor))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({stream:true}))
});


/**
 * Compile HTML File
 */

// Function Jade
gulp.task('jade', function() {
    return gulp.src('./src/html/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist/'))
        .pipe(reload({stream:true}))
});


// Function Browser-sync reload
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './dist/'
        }
    });
});


var customOpts = {
  entries: ['./src/js/app.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    //.pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
    .pipe(reload({stream: true}));
}

//  BUILD tasks


gulp.task('jadeBuild', function() {
    return gulp.src('./src/html/*.jade')
        .pipe(jade())
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist/'))
        .pipe(reload({stream:true}))
});

gulp.task('cssBuild', function() {
    var processor = [
        cssImport(),
        resType(),
        cssnext(),
        mqpacker()
    ];
    return gulp.src('./src/css/style.css')
        //.pipe(duoTask())
        .pipe(postcss(processor))
        .pipe(uncss({
          html: ['dist/*.html']
        }))
        .pipe(cssnano())
        .pipe(plumber.stop())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({stream:true}))
});

gulp.task('jsBuild', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './src/js/app.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'));
});
