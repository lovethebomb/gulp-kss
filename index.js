var path     = require('path'),
    fs       = require('fs'),
    dargs    = require('dargs'),
    gutil    = require('gulp-util'),
    kss      = require('kss'),
    spawn    = require('win-spawn'),
    assign   = require('object-assign'),
    File     = require('vinyl'),
    Readable = require('stream').Readable;

// var gulp = require('gulp');
// var through = require('through');
// var gulpless = require('gulp-less');
// var marked = require('marked');
// var handlebars = require('handlebars');
// var PluginError = gutil.PluginError;
// var File = gutil.File;
// var util = require('util');

// var handlebarHelpers = require('./handlebarHelpers');

function formatMsg (msg, tempDir) {
    msg = msg.replace(new RegExp((tempDir) + '/?', 'g'), '');
    msg = msg.trim();
    return msg;
}

function newErr (err, opts) {
    return new gutil.PluginError('gulp-kss', err, opts);
}

function isDirectory(source) {
    return fs.lstatSync(source).isDirectory()
}

module.exports = function (source, options) {

    'use strict';
    // if (!opt) opt = {};
    // if (!opt.templateDirectory) opt.templateDirectory = __dirname + '/node_modules/kss/lib/template';
    // if (!opt.kssOpts) opt.kssOpts = {};

    var stream = new Readable({objectMode: true}),
        cwd = process.cwd(),
        numFolders = source.length,
        command,
        args,
        base,
        destDir,
        compileMappings,
        command,
        defaults = {
            template: './node-modules/kss/lib/template/',
            destination: './docs/styleguide/',
            custom: [],
            helpers:  '',
            source: []
        };

    stream._read = function () {};
    options = assign(defaults, options);

    // Do we have one source or an array?
    for (numFolders>0;numFolders--;) {
        if (isDirectory(source[numFolders])) {
            defaults.source.unshift(source[numFolders]);
        } else {
            stream.emit('error', newErr('we only support folders for right now'));
        }
    }
    // if (fs.lstatSync(source).isDirectory()) {
    //     console.log('dirs: ' + source.length);
    // }

    args = dargs(options);//.concat(compileMappings);

    // console.log(args);

    command = __dirname + '/node_modules/.bin/kss-node';
    var kss = spawn(command, args);

    kss.stdout.setEncoding('utf8');
    kss.stderr.setEncoding('utf8');

    // kss stdout: successful compile messages
    // bundler stdout: bundler not installed, no gemfile, correct version of kss not installed
    kss.stdout.on('data', function (data) {
        var msg = formatMsg(data, destDir);
        // var isError = [
        //     matchkssErr,
        //     matchNoBundler,
        //     matchNoGemfile,
        //     matchNoBundledkss
        // ].some(function (match) {
        //     return match.test(msg);
        // });

        console.log(msg)

        // if (isError) {
        //     stream.emit('error', newErr(msg));
        // } else {
        //     gutil.log('gulp-kss stdout:', msg);
        // }
    });

    kss.stderr.on('data', function (data) {
        var msg = formatMsg(data, destDir);
        console.log(msg);
        // stream.emit('error', newErr(msg));
        // gutil.log('gulp-kss stderr:', msg);
    });

    // spawn error: no kss executable
    kss.on('close', function (code) {
        // err.message = msgNoKss;
        console.log(code);
        // stream.emit('error', newErr(err));
    });
    // return false;
};