var express = require('express');
var app = express();

// Serve static files
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000, function () {
  console.log('Server listening on port 3000!');
});
