var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    busboy = require('connect-busboy'),
    gm = require('gm'),
    swig = require('swig'),
    utility = require('utility'),
    bodyParser = require('body-parser');

var app = express();
app.use(busboy());
app.engine('html', swig.renderFile);
swig.setDefaults({cache: false});
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.raw({limit:10000000}));
app.use(busboy({ immediate: true }));

app.post('/upload', function(req, res) {
    var extension,
        mimetype = req.query['mimetype'];
    switch (mimetype){
        case 'image/gif':
            extension = 'gif';
            break;
        case 'image/jpeg':
            extension = 'jpg';
            break;
        case 'image/png':
            extension = 'png';
            break;
    }
    var filename = utility.md5(String((new Date()).getTime())) + String(parseInt(Math.random()*1000)) + '.' + extension;
    var upload_path = path.join(__dirname, 'public/uploads/');
    var base_url    = '/uploads/';
    var filePath    = path.join(upload_path, filename);
    var fileUrl     = base_url + filename;

    if(req.header('content-type')){
        //非安卓
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log(fieldname,filename);

            file.on('end', function () {
                res.json({
                    success: true,
                    thumbUrl:fileUrl
                });
            });
            file.pipe(fs.createWriteStream(filePath));
        });
        req.pipe(req.busboy);
    }else{
        var imagedata = '';
        req.setEncoding('binary');
        req.on('data', function (chunk) {
            imagedata += chunk
        });
        req.on('end', function (chunk) {
            fs.writeFile(filePath, imagedata, 'binary', function(err){
                if (err) throw err
                console.log('File saved.');
                res.json({
                    success: true,
                    thumbUrl:fileUrl
                });
            })
        });
    }
});

app.post('/upload-fix', function(req, res) {
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var extension;
        switch (mimetype){
            case 'image/gif':
                extension = 'gif';
                break;
            case 'image/jpeg':
                extension = 'jpg';
                break;
            case 'image/png':
                extension = 'png';
                break;
        }
        var filename = utility.md5(String((new Date()).getTime())) + String(parseInt(Math.random()*1000));
        var thumb_filename = filename +  '_thumb';
        var upload_path = path.join(__dirname, 'public/uploads/');
        var base_url    = '/uploads/';
        var filePath    = path.join(upload_path, filename  + '.' + extension);
        var fileUrl     = base_url + thumb_filename + '.' + extension;

        file.on('end', function () {
            gm(filePath)
                .autoOrient()
                .thumbnail(200, 200)
                .write(path.join(upload_path, thumb_filename  + '.' + extension), function(err){
                    if (err) return console.dir(arguments)
                    console.log(this.outname + " created  ::  " + arguments[3])
                    res.json({
                        success: true,
                        thumbUrl:fileUrl
                    });
                }
            )
        });
        file.pipe(fs.createWriteStream(filePath));
    });
    req.pipe(req.busboy);
});

app.get('/', function (req, res) {
    var html = [
        '<p>手机传图--前端修正 <a href="/front">Go</a></p>',
        '<p>手机传图--后端修正 <a href="/back">Go</a></p>'
    ].join('');
    res.send(html);
});
app.get('/front', function (req, res) {
    res.render('front');
});
app.get('/back', function (req, res) {
    res.render('back');
});

app.listen(3001,function(){
    console.log('star with 3001');
});
