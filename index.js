//Lets require/import the HTTP module
var http = require('http');
var url = require('url');
var express = require('express');
var fs      = require('fs');
var pdf2img = require('pdf2img');
var request = require('request');
var schedule = require('node-schedule');
var path = require('path');
var exec = require('child_process').exec,child;

var app = express();

app.use('/static',express.static(__dirname + '/output'));

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 1);
var inputurl, query;

//Lets define a port we want to listen to
const PORT=3030; 

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

var j = schedule.scheduleJob(rule, function(){
    files = getDirectories(__dirname + '/output/');
    lastHourTime = new Date().addHours(-1).valueOf();
    console.log(new Date().valueOf()-new Date().addHours(-1).valueOf())
    files.forEach(function(folder) {
        console.log(parseInt(folder)-parseInt(lastHourTime));
        if(parseInt(folder)-parseInt(lastHourTime) <= 0) {
            delPath = __dirname + '/output/' + folder;
            child = exec('rm -rf ' + delPath,function(err,out) { 
                if(!err) {
                    console.log(delPath + ' folder deleted!');
                }
            });
        }
    });
    
    console.log('Folder deletion executed!');
});

//We need a function which handles requests and send response
function handleRequest(request, response){
    query = url.parse(request.url,true).query;
    var currentTime = new Date().valueOf();
    var dirPath = __dirname + '/output/' + currentTime;
    
    if(query.pdfurl != undefined){
        if (!fs.existsSync(dirPath)){
            fs.mkdirSync(dirPath);
        }
        
        var inputUrl = query.pdfurl;
        var outputUrl = request.protocol + '://' + request.headers.host + '/static/';
        var filePath = dirPath + '/file.pdf';

        var file = fs.createWriteStream(filePath);
        var request = http.get(inputUrl, function(response) {
            response.pipe(file);

            file.on('finish', function() {
                processPDF(dirPath, outputUrl);
                file.close();  // close() is async
            });
        });
    }
    
    response.end('It Works!! Path Hit: ' + inputurl);
}

function processPDF(input, output) {
    console.log(query)
    var filePath = input + '/file.pdf';
    pdf2img.setOptions({
      type: (query.filetype) ? query.filetype : 'png',                      // png or jpeg, default png 
      size: 1400,                       // default 1024 
      density: 600,                     // default 600 
      outputdir: input, // mandatory, outputdir must be absolute path 
      targetname: 'page'                // the prefix for the generated files, optional 
    });

    pdf2img.convert(filePath, function(err, info) {
      if (err) console.log(err)
      else {
          info.forEach(function(page) {
              tmpData = page.path.split('/output/');
              page.path = output + tmpData[1];
          });
          console.log(info);
      }
    });   
}

//Lets start our server
app.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

app.get("/pdf2image", function(req, res) {
    handleRequest(req, res)
});