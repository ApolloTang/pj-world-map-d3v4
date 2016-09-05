/* global */
'use strict';

var gulp               = require('gulp');
var browserify         = require('browserify');
var connect            = require('gulp-connect');
var sourcemaps         = require('gulp-sourcemaps');
var uglify             = require('gulp-uglify');
var cleanCSS           = require('gulp-clean-css');
var vinylSource        = require('vinyl-source-stream');
var buffer             = require('vinyl-buffer');
var gulpif             = require('gulp-if');
var pump               = require('pump');
var yargs              = require('yargs');
var babelify           = require('babelify');
var less               = require('gulp-less');
var rename             = require('gulp-rename');
var errorify           = require('errorify');
var historyApiFallback = require('connect-history-api-fallback');


// shelljs import and configuration
require('shelljs/global');
config.fatal = true;


// ----------------------- //

var buildDir = 'builds/';

var argv = yargs
    .option('target', {
        alias: 't',
        describe: 'Built target',
        choices: ['development', 'production'],
        default: 'development'
    })
    .option('serverport', {
        alias: 's',
        describe: 'server port',
        default: 7777
    })
    .option('livereloadport', {
        alias: 'l',
        describe: 'livereload port',
        default: 47777
    })
    .help('help')
    .argv;
var buildTarget = argv.target;
var serverPort = argv.serverport;
var livereloadPort = argv.livereloadport;


var debugMode = true;


gulp.task('initialize', function(cb) {
    var err = null;
    echo('Initializing ... ');

    try {
        if (test('-d', buildDir)) {
            echo('Found build folder');
            echo('Clearing build folder ... ');
            rm('-rf', buildDir+'/*');
            echo('Copying content of static folder to '+buildDir+' ...');
            cp('-R', 'src/statics/*', buildDir);
        } else {
            echo('Build folder does not exist');
            echo('creating folder with name '+buildDir+' ...');
            mkdir('-p', buildDir);
            echo('copying static folder to '+buildDir+' ...');
            cp('-R', 'src/statics/*', buildDir);
        }
    } catch (error) {
        echo('************ Error initializing ************')
        err = error;
    }

    setTimeout(function(){
        console.log('Done inititializing');
        cb(err)
    }, 2000);
});


gulp.task('js', function(cb) {
    var browserifyOption = {
        entries: [  './src/js/index.js' ],
        debug: (buildTarget === 'development')
    };
    var babalifyConf = {
        presets: ["es2015", "react"],
        "plugins": ["transform-object-rest-spread"]
    };

    var b  = browserify(browserifyOption)
        .plugin(errorify, function(err){console.log(err)})
        .transform(babelify.configure(babalifyConf))
        .bundle()
        // .on('error', onError)  // This is nolonger necessary because we are now using errorify
        .pipe(vinylSource('bundle.js'))

    pump([
        b,
        buffer(),
        sourcemaps.init({loadMaps: (buildTarget === 'development')}),
        uglify(),
        gulpif( (buildTarget === 'development'), sourcemaps.write('./')),
        gulp.dest(buildDir),
        connect.reload()
    ], cb);
});

gulp.task('less', function(cb){
    // cleanCSS configuration
    var conf_cleanCSS = { debug: true, sourceMap: true};
    var cb_cleanCSS = function(details) {
            console.log('css original size: ', details.name + ': ' + details.stats.originalSize);
            console.log('css minified size: ', details.name + ': ' + details.stats.minifiedSize);
    };

    pump([
        gulp.src('./src/less/index.less'),
        sourcemaps.init({loadMaps: true}),
        less(),
        rename('style.css'),
        cleanCSS(conf_cleanCSS, cb_cleanCSS),
        gulpif( (buildTarget === 'development'), sourcemaps.write('./')),
        gulp.dest(buildDir),
        connect.reload()
    ], cb)
});


gulp.task('watch', ['initialize'], function(){
    console.log('watch fired...')
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/less/**/*.less', ['less']);
});

gulp.task('connect', ['initialize'], function(){
    const conf_historyApiFallback = {
        verbose: debugMode,
        rewrites: [{
            from: /\/[^.]*$/,
            to: function(context) {
                // console.log('****** context: ', context);
                return '/index.html';
            }
        }],
        disableDotRule: false
    };
    connect.server({
        root: buildDir,
        // open: { browser: 'Google Chrome'} // Option open does not work in gulp-connect v 2.*. Please read "readme" https://github.com/AveVlad/gulp-connect}
        port: serverPort,
        livereload: {port : livereloadPort},
        middleware: function(connect, opt) { return [ historyApiFallback(conf_historyApiFallback)]; }
    });
});

gulp.task('default', ['initialize',  'js', 'less', 'watch',  'connect'], function(){
    console.log('All done');
});


function onError(err) {
    console.log('ERROR: ', err.toString());
    console.log('ERROR: ', err.codeFrame);
    this.emit('end');
}
