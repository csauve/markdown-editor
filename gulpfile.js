var gulp = require("gulp");
var sass = require("gulp-sass");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");

gulp.task("build-js", function() {
  return browserify("./src/app.jsx")
    .transform("babelify", {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(gulp.dest("./dist"));
});

gulp.task("build-styles", function() {
  return gulp.src("./src/styles.scss")
    .pipe(sass())
    .pipe(gulp.dest("./dist"));
});

gulp.task("default", ["build-js", "build-styles"], function() {
  gulp.watch(["./src/**/*.scss"], ["build-styles"]);
  gulp.watch(["./src/**/*.js", "./src/**/*.jsx"], ["build-js"]);
});