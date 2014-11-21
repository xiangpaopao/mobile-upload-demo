/**
 * Created by 14100377 on 2014/10/31.
 */
(function( $ ){
    var options = {
        //配置项
        fileNumLimit: 6,
        fileSingleSizeLimit:5  * 1024 * 1024,    // 5 M
        server : '/upload'
    }

    var $wrap = $('#uploader'),
        $queue =  $wrap.find( '.filelist' ),
        $progress = $wrap.find( '.progress' ).hide(),
        $imgNum = $('#imgNum'),
        $maxSize = $('#maxSize'),
        $filePicker = $('#filePicker'),
        $filePickerText = $('#filePickerText'),
        $imgsArr = $('#imgsArr'),
        $filePickerInput = $('#filePicker').find('input'),
        fileCount = 0,
    // 可能有pedding, uploading.
        state = 'pedding',
        $submitBtn = $('#submitBtn'),
        $downloadBtn = $('#downloadBtn');

    $filePicker.on('click','label',function(){
        $filePickerInput.trigger('click');
    });
    $filePickerInput.on('change',function(){
        doUpload2();
        //sendAsBlob();
    });
    //删除
    $queue.on('click','.item',function(){
        var me = this;
        AlertBox({
            title: '删除照片',
            msg:'确定删除这张照片吗？',
            confirm:function(){
                $(me).remove();
                fileCount --;
                updateDataView();
            }
        })
    });

    //表单
    $submitBtn.on('click',function(){
        $.ajax({
            type: 'POST',
            url:'/form',
            data: $('#imgForm').serialize()
        }).done(function (res) {
            if(true){
                AlertBox({
                    type:'onceConfirm',
                    title: '上传成功!'
                });
            }
        }).fail(function () {
            AlertBox({
                type:'onceConfirm',
                title: '抱歉，上传失败'
            });
        });
    })
    //初始化UI
    $imgNum.text(options.fileNumLimit);
    $maxSize.text(options.fileSingleSizeLimit/1024/1024);
    //
    function parseJson( str ) {
        var json;
        try {
            json = JSON.parse( str );
        } catch ( ex ) {
            json = {};
        }
        return json;
    }
    function doUpload(){
        if(state == 'uploading'){
            AlertBox({
                msg:'请等待上一张图片上传完成'
            });
            return;
        }
        var file = $filePickerInput[0].files[0];
        if(file.size > options.fileSingleSizeLimit){
            AlertBox({
                msg:'上传图片不能大于5M'
            });
            return;
        }
        canvasResize(file, {
            width: 1000,
            height: 1000,
            crop: false,
            quality: 100,
            rotate: 0,
            callback: function (data, width, height) {
                var form = new FormData();
                var f = canvasResize('dataURLtoBlob', data);
                form.append("fileName", file.name);
                form.append("file", f);
                $progress.show();
                var $li = $('<div class="item" data-name="">' +
                '<div class="sn-html5-loading"><div class="blueball"></div><div class="orangeball"></div></div>' +
                '<p class="imgWrap"></p></div>');
                $li.appendTo($queue);
                var $loading = $queue.find('.sn-html5-loading');
                state = 'uploading';
                $.ajax({
                    type: 'POST',
                    url: options.server,
                    data: form,
                    contentType: false,
                    processData: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("pragma", "no-cache");
                    },
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", updateProgress, false);
                        return xhr;
                    }
                }).done(function (res) {
                    //渲染缩略图
                    console.log(res)
                    if (res.success) {
                        var imgUrl = res.thumbUrl;
                        var temp = '<img src="' + imgUrl + '" alt="">';
                        $li.find('.imgWrap').append(temp);
                        $loading.remove();
                        fileCount++;
                        $filePickerInput.val('');
                        updateDataView();
                    }

                }).fail(function () {
                    AlertBox({
                        msg: '服务器故障，上传失败'
                    });
                }).always(function () {
                    state = 'pedding';
                    resetProgress();
                });
            }
        })
    };

    var sendAsBlob = function() {

        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.open('POST', '/upload3', true);
        ajaxRequest.setRequestHeader('Content-Type', 'application/json');

        ajaxRequest.onreadystatechange = function() {
            if (ajaxRequest.readyState == 4) {
                alert('Response: \n' + ajaxRequest.responseText);
            }
        };

        var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

        if(BlobBuilder) {
            // android
            var oBuilder = new BlobBuilder();
            var aFileParts = ['{ "text": "test" }'];
            oBuilder.append(aFileParts[0]);
            var blob = oBuilder.getBlob("text\/plain"); // the blob

        } else {
            // everyone else
            var blob = new Blob(['{ "text": "test" }'], { 'type': 'text/plain' });
        }

        ajaxRequest.send(blob);
    };

    var str2ab_blobreader = function(str, callback) {
        var blob;
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
        if (typeof(BlobBuilder) !== 'undefined') {
            var bb = new BlobBuilder();
            bb.append(str);
            blob = bb.getBlob();
        } else {
            blob = new Blob([str]);
        }
        var f = new FileReader();
        f.onload = function(e) {
            callback(e.target.result)
        }
        f.readAsArrayBuffer(blob);
    }


    function doUpload2() {
        var file = $filePickerInput[0].files[0];
        canvasResize(file, {
            width: 1000,
            height: 1000,
            crop: false,
            quality: 100,
            rotate: 0,
            callback: function (data, width, height) {
                var form = new FormData();
                var f = canvasResize('dataURLtoBlob', data);
                form.append('hehe','heh');
                form.append('file',f);
                var reader = new FileReader();

                reader.onload = function() {
                    var buffer = this.result;
                    $.ajax({
                        type: 'POST',
                        url: '/upload3',
                        data: buffer,
                        contentType: false,
                        processData: false,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("pragma", "no-cache");
                        }
                    }).done(function (res) {
                        console.log('ok')
                    }).fail(function () {
                    }).always(function () {
                    });
                };
                reader.readAsArrayBuffer(f);
            }
        });


    }


    function resetProgress(){
        var spans = $progress.children();
        spans.eq( 0 ).text( '0%' );
        spans.eq( 1 ).css( 'width', '0%' );
        $progress.hide();
    }

    //TODO:进度条样式未确定，暂时不做
    function updateProgress(e) {
        if (e.lengthComputable) {
            var loaded = Math.ceil((e.loaded / e.total) * 100);
            var spans = $progress.children();
            spans.eq( 0 ).text(loaded + '%' );
            spans.eq( 1 ).css( 'width',loaded + '%' );
        }
    }
    function updateDataView(){
        $imgNum.text(options.fileNumLimit - fileCount);
        //绑定表单中图片数据
        var imgArr = [];
        $queue.find('.item img').each(function(){
            imgArr.push($(this).attr('src'));
        })
        if(fileCount == 0){
            $filePickerText.show();
        }else{
            $filePickerText.hide();
        }

        $imgsArr.val(imgArr.toString());
        if(fileCount >= options.fileNumLimit){
            $filePicker.hide();
        }else{
            $filePicker.show();
        }
    }

    //下载
    $downloadBtn.on('click',function(){
        if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
            var o = new Date;
            window.setTimeout(function() {
                var n = new Date;
                if (5e3 > n - o) {
                    if (navigator.userAgent.match(/MicroMessenger/i))
                        return void (window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.suning.mobile.ebuy&g_f=992129");
                    window.location = "https://itunes.apple.com/cn/app/id424598114?l=en&mt=8"
                } else
                    window.close()
            }, 25), window.location = "com.suning.SuningEbuy://"
        } else if (navigator.userAgent.match(/android/i)) {
            if (navigator.userAgent.match(/MicroMessenger/i))
                return void (window.location = "http://a.app.qq.com/o/simple.jsp?pkgname=com.suning.mobile.ebuy&g_f=992129");
            window.location = "http://mapp.suning.com/a.php?s=qrcode/offline&f=ygznwpdt&pack=com.suning.mobile.ebuy"
        }
    })
})(Zepto);
