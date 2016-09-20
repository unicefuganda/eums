var args = require('yargs').argv,
  gulp = require('gulp'),
  fs = require('fs'),
  semver = require('semver'),
  concat = require('gulp-concat'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  shell = require('gulp-shell'),
  jshint = require('gulp-jshint'),
  bump = require('gulp-bump'),
  karma = require('gulp-karma'),
  rimraf = require('gulp-rimraf'),

// file globs
source = ['src/**/*.js', 'src/*.js'],
build = ['build/**/*.js', 'build/*.js'],

// package bumping variables
type = args.bump || 'patch',
pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
incVersion = semver.inc(pkg.version, type);

// clean build folder
function clean () {
  return gulp.src(build)
    .pipe(rimraf());
}
gulp.task('clean', clean);

// compile source files to build folder
function buildsrc () {
  return gulp.src(source)
    .pipe(ngAnnotate())
    .pipe(concat('angular-gs-capitalize.js'))
    .pipe(gulp.dest('build'))
    .pipe(rename('angular-gs-capitalize.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
}
gulp.task('build', ['clean'], buildsrc);

// bump package version
function bumpver () {
  return gulp.src('*.json')
    .pipe(bump({ version: incVersion }))
    .pipe(gulp.dest('./'));
}
gulp.task('bump', ['lint', 'spec.src', 'spec.build'], bumpver);

// lint source files
function lint () {
  return gulp.src(source)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
}
gulp.task('lint', lint);

// run specs for either build or source files
var specFiles = [
  'bower_components/angular/angular.js',
  'bower_components/angular-mocks/angular-mocks.js',
  'test/**/*.spec.js',
  'test/*.spec.js'
];

function spec (files) {
  return function () {
    return gulp.src(specFiles.concat(files))
      .pipe(karma({
        configFile: 'karma.conf.js',
        action: 'run'
      }));
  };
}
gulp.task('spec.src', spec(source));
gulp.task('spec.build', ['build'], spec(build));

// commit new build files and package/bower files with newly bumped version
// push to repository
function commit () {
  return shell.task([
    'hub init',
    'hub add build/*',
    'hub add package.json',
    'hub add bower.json',
    'hub commit -m "Bump version: '+ incVersion +' :clap::clap::clap::grin:"',
    'hub push origin head'
  ]);
}
gulp.task('commit', ['build', 'bump'], commit());

gulp.task('release', ['lint', 'spec.src', 'clean', 'build', 'spec.build', 'bump', 'commit']);
