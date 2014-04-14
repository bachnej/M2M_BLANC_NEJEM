var http = require('http');
var fs = require('fs');
var mqtt = require('mqtt');
var path = require('path');


var mqttbroker = 'localhost';
var mqttport = 1883;

var index = 'index.html';


var mqttclient = mqtt.createClient(mqttport, mqttbroker);

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
	console.log('req.url :'+req.url);
	if(req.url == '/' || req.url == '/index'){
		fs.readFile('./index.html', 'utf-8', function(error, content) {
	        res.writeHead(200, {"Content-Type": "text/html"});
	        res.end(content);
    	});
	} else if(req.url == '/resume') {
		fs.readFile('./resume.html', 'utf-8', function(error, content) {
	        res.writeHead(200, {"Content-Type": "text/html"});
	        res.end(content);
    	});
	} else {
		res.writeHead(404,{"Content-Type": "text/html"});
		res.end('Page not found');
	}
    
});
/*
var HTTP_OK = 200,
    HTTP_ERR_UNKNOWN = 500,
    HTTP_ERR_NOT_FOUND = 404;


var server = http.createServer(function (req, res) {
	console.log('req.url :'+req.url);
    var filepath = '.' + (req.url == '/' ? index : req.url),
        fileext = path.extname(filepath); 

    path.exists(filepath, function (f) {
        if (f) {
            fs.readFile(filepath, function (err, content) {
                if (err) {
                    res.writeHead(HTTP_ERR_UNKNOWN);
                    res.end();
                } else {
                    res.writeHead(HTTP_OK, contentType(fileext));
                    res.end(content);
                }
            });
        } else {
            res.writeHead(HTTP_ERR_NOT_FOUND);
            res.end();
        }
    });
});*/


// Chargement de socket.io
var io = require('socket.io').listen(server);
var mongo = require('mongodb');

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    // Subscribe to topic
        socket.on('subscribe', function (data) {
            mqttclient.subscribe(data.topic);
        });

        socket.on('getAllData', function () {
        		console.log('getAllData asked');
        		var Server = mongo.Server,
	            Db = mongo.Db;
	            var tableau = [];
	            var db = new Db('test', new Server('127.0.0.1', 27017),{safe:false});

	            var onErr = function(err){
	             db.close();
	             console.log(err);
	            };

	            
	             db.open(function(err, db) {
	                console.log('OK connected to mongodb');
	              if(!err) {
	               db.collection('capteur', function(err, collection) {
	                if(!err){
	                 collection.find().toArray(function(err, docs) {
	                  if(!err){
	                   db.close();
	                   var intCount = docs.length;
	                   if(intCount > 0){
	                    for(var i=0; i<intCount;i++){
	                    	//console.log(docs[i].timestamp);
	                        tableau.push({x:docs[i].timestamp ,y: docs[i].payload});
	                    }
	                    console.log(tableau);
	             		socket.emit('resultat',{'res'  : tableau});
	                   }
	                  }
	                  else{onErr(err);}
	                 });//end collection.find
	                }
	                else{onErr(err);}
	               });//end db.collection
	              }
	              else{onErr(err);}
	             });// end db.open
	             
        });
			
		

    // Push the message to socket.io
    mqttclient.on('message', function(topic, payload) {
        //console.log('message recu'+topic+' '+payload);
        socket.emit('mqtt',
            {'topic'  : topic,
             'payload' : payload
            }
        );
    });
});


server.listen(8081);
