
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var rimraf = require('rimraf');
var archiver = require('archiver');
const Spark = require('node-sparky');
const sparky = new Spark({
    token: 'OTA4Njc5OGUtYjA4NC00NGJkLWEyY2MtMjI3NjQ2NmEyNGMxZWY2MzU3NTItODMz',
    webhookSecret: 'ohtacomytaco!',
});
// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + '/tacolog.zip');
var archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });
  
  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function() {
    console.log('Data has been drained');
  });
  
  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });
  
  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });
  
  // pipe archive data to the file
  archive.pipe(output);
// configure app to use bodyParser()
// this will let us get the data from a POST


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here
router.route('/sftp')

    // create a bear (accessed at POST http://localhost:8080/api/sftp)
    .post(function(req, res) {

        zip().then(res => {
            spark(req.body.sparkid).then(res => {
                remove();
            })
        })
        console.log(req.body.sparkid);
        res.json({"message": "processing.."});
    })
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);


async function zip(){
// append files from a sub-directory, putting its contents at the root of archive
archive.directory('subdir/', false);
return archive.finalize();

}

async function spark(req){
        return sparky.contentCreate('./tacolog.zip')
        .then(file => sparky.messageSend(
            {
            "roomId": req,
            "text": ' '}, file))
        .catch(err => console.error('sparkerr'+err));
}

async function remove(){
    delay(200).then(
    rimraf('./subdir', function () { console.log('done'); }));

}

function delay(delay) {
    return new Promise ( function ( fulfill ) {
      setTimeout( fulfill, delay )
    })
}