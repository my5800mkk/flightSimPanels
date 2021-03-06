var fs = require('fs');
var uglify = require('uglify-js');
var Measure = require('../services/Measure');

function getCommonCode(list) {
    var file,
        folder = __dirname + "/../services/common/",
        filename,
        fileStat,
        files = fs.readdirSync(folder);

    for (file in files) {
        if (files.hasOwnProperty(file)) {
            filename = files[file];
            if (!(/.*\.js/.test(filename))) {
                //not a javascript file. discard
                continue;
            }
            fileStat = fs.statSync(folder + filename);
            if( fileStat.isDirectory() ) {
                continue;
            }
            list.push(fs.readFileSync(folder + filename, 'utf8'));
            //list.push(uglify.minify(folder + filename, 'utf8').code);
        }
    }
    return list;
}

function getMeasureEntities(suffix, list) {
    var measures = Measure.getRegisteredMeasures(),
        idx,
        measure;
    for(idx in measures) {
        if(measures.hasOwnProperty(idx)){
            measure = measures[idx];
            try {
                list.push( fs.readFileSync(__dirname + '/../services/measures/' + measure.name + '/client/' + measure.name + '.' + suffix, 'utf8') );
                //list.push(uglify.minify(__dirname + '/../services/measures/' + measure.name + '/client/' + measure.name + '.' + suffix, 'utf8').code);
            } catch( error ) {}
        }
    }
    return list;
}


/**
 * This operation has to be moved at build time, along with CSS and templates parsing
 */
function addWidgets() {
    //add the registered widgets code to the page
    var scripts = [];
    getCommonCode(scripts);
    getMeasureEntities('js', scripts);
    return scripts.join('\n');
}

function addCss() {
    //add the registered widgets code to the page
    var scripts = [];
    getMeasureEntities('css', scripts);
    return scripts.join('\n');
}


function getCode(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(addWidgets());
}


function getCss(req, res) {
    res.setHeader('Content-Type', 'text/css');
    res.send(addCss());
}

exports.init = function (app) {
    app.get('/widgets/code', getCode);
    app.get('/widgets/css', getCss);
    return this;
};