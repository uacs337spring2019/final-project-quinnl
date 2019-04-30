const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  let mode = req.query.mode;

  if(mode == "names") {
    let lines = fs.readFileSync("templates.txt", 'utf8').split("\n");
    let json = {};
    let names = [];

    for(let i = 0; i < lines.length; i++) {
      if(lines[i] != "") {
        let fields = lines[i].split("|");

        names.push(fields[0]);
      }
    }
    json["names"] = names;
    res.send(JSON.stringify(json));
  } else if(mode == "url") {
    let lines = fs.readFileSync("templates.txt", 'utf8').split("\n");

    for(let i = 0; i < lines.length; i++) {
      let fields = lines[i].split("|");

      if(fields[0] == req.query.name) {
        res.send(fields[1]);
      }
    }
  } else if(mode == "textPoints") {
    let lines = fs.readFileSync("templates.txt", 'utf8').split("\n");
    let json = {};
    let textPoints = [];

    for(let i = 0; i < lines.length; i++) {
      let fields = lines[i].split("|");

      if(fields[0] == req.query.name) {
        for(let j = 2; j < fields.length; j++) {
          let textPoint = {};

          textPoint["x"] = fields[j].split(">")[0];
          textPoint["y"] = fields[j].split(">")[1];
          textPoints.push(textPoint);
        }
        json["textPoints"] = textPoints;
        res.send(JSON.stringify(json));
      }
    }
  } else {
    let lines = fs.readFileSync("memes.txt", 'utf8').split("\n");
    let newLines = [];
    let json = {};

    for(let i = 0; i < lines.length; i++) {
      if(lines[i] != "") {
        newLines.push(lines[i]);
      }
    }
    json["memes"] = newLines;
    res.send(JSON.stringify(json));
  }
});

app.post('/', jsonParser, function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  if(req.body.mode == "template") {
    let name = req.body.name;
    let url = req.body.url;
    let textPoints = req.body.textPoints;
    let string = "";

    string += (name + "|" + url + "|");
    for(let i = 0; i < textPoints.length; i++) {
      if(i == (textPoints.length - 1)) {
        string += textPoints[i].x + ">" + textPoints[i].y + "\n";
      } else {
        string += textPoints[i].x + ">" + textPoints[i].y + "|";
      }
    }
    fs.appendFile("templates.txt", string, function(err) {
      if(err) {
        res.status(400);
        res.send("Error!");
      } else {
        res.send("Success!");
      }
    });
  } else {
    let name = req.body.name;
    let maxTextWidth = req.body.maxTextWidth;
    let text = req.body.text;
    let string = name + "|" + maxTextWidth + "|";

    for(let i = 0; i < text.length; i++) {
      if(i == (text.length - 1)) {
        string += text[i] + "\n";
      } else {
        string += text[i] + "|";
      }
    }
    fs.appendFile("memes.txt", string, function(err) {
      if(err) {
        res.status(400);
        res.send("Error!");
      } else {
        res.send("Success!");
      }
    });
  }
});

app.get('/mememaker.html', function(req, res) {
res.sendFile(__dirname + "/" + "mememaker.html");
});

app.get('/mememaker.css', function(req, res) {
res.sendFile(__dirname + "/" + "mememaker.css");
});

app.get('/mememaker.js', function(req, res) {
res.sendFile(__dirname + "/" + "mememaker.js");
});

app.listen(process.env.PORT);
