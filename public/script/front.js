(function( $ ){
    var options = {
        server : '/upload'
    }
    var $wrap = $('#uploader'),
        $queue =  $wrap.find( '.filelist' ),
        $progress = $wrap.find( '.progress').hide(),
        $filePicker = $('#filePicker'),
        $filePickerInput = $('#filePicker').find('input'),
        mimetype = '',
        state = 'pedding';

    $filePicker.on('click','label',function(){
        $filePickerInput.trigger('click');
    });
    $filePickerInput.on('change',function(){
        if(state == 'uploading'){
            alert('请等待上一张图片上传完成');
            return;
        }
        $progress.show();
        var inputFile = $filePickerInput[0].files[0];
        canvasResize(inputFile, {
            width: 1000,
            height: 1000,
            crop: false,
            quality: 100,
            rotate: 0,
            callback: function (data, width, height) {
                //视图
                var $li = $('<div class="item" data-name=""><p class="imgWrap"></p></div>');
                $li.appendTo($queue);
                state = 'uploading';
                //上传
                var file = canvasResize('dataURLtoBlob', data);
                mimetype = file.type;
                if($.os.android){
                    var reader = new FileReader();
                    reader.onload = function() {
                        uploadData(this.result,$li);
                    };
                    reader.readAsArrayBuffer(file);
                }else{
                    var form = new FormData();
                    form.append("file", file);
                    uploadData(form,$li);
                }
            }
        })
    });

    function uploadData(data,$elem){
        $.ajax({
            type: 'POST',
            url: options.server+'?mimetype='+mimetype,
            data: data,
            contentType: false,
            processData: false,
            beforeSend: function (xhr) {
                console.log(xhr);
                xhr.setRequestHeader("pragma", "no-cache");
                if($.os.android) xhr.overrideMimeType('application/octet-stream');
            },
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", updateProgress, false);
                return xhr;
            }
        }).done(function (res) {
            //渲染缩略图
            if (res.success) {
                var imgUrl = res.thumbUrl;
                var temp = '<img src="' + imgUrl + '" alt="">';
                $elem.find('.imgWrap').append(temp);
                $filePickerInput.val('');
            }

        }).fail(function () {
            alert('服务器故障，上传失败');
        }).always(function () {
            state = 'pedding';
        });
    }

    function updateProgress(e) {
        console.log(e)
        if (e.lengthComputable) {
            var loaded = Math.ceil((e.loaded / e.total) * 100);
            var spans = $progress.children();
            spans.eq( 0 ).text(loaded + '%' );
            spans.eq( 1 ).css( 'width',loaded + '%' );

            if(loaded == 100){
                spans.eq( 0 ).text( '0%' );
                spans.eq( 1 ).css( 'width', '0%' );
                $progress.hide();
            }
        }
    }

})(Zepto);
