//var im = require('imagemagick'),
//path = require('path');
//
//var upload_path = path.join(__dirname, 'public/uploads/');
//
//im.readMetadata(path.join(upload_path, 'll.jpg'), function(err, metadata){
//    if (err) throw err;
//    console.log('Shot at '+metadata.exif.orientation);
//})
//
//im.resize({
//    srcPath: path.join(upload_path, 'll.jpg'),
//    dstPath: path.join(upload_path, '222.jpg'),
//    width:   256
//}, function(err, stdout, stderr){
//    if (err) throw err;
//    console.log('resized kittens.jpg to fit within 256x256px');
//});

//var gm = require('gm'),
//    path = require('path');
//
//var upload_path = path.join(__dirname, 'public/uploads/');
//
//gm(path.join(upload_path, 'll.jpg'))
//    .noProfile()
//    .autoOrient()
//    .thumbnail(350, 350)
//    .write(path.join(upload_path, '222.jpg'), function(err){
//        if (err) return console.dir(arguments)
//        console.log(this.outname + " created  ::  " + arguments[3])
//    }
//)