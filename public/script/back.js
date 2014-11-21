(function( $ ){
    var options = {
        server : '/upload-fix'
    }
    var $wrap = $('#uploader'),
        $queue =  $wrap.find( '.filelist' ),
        $progress = $wrap.find( '.progress').hide(),
        $filePicker = $('#filePicker'),
        $filePickerInput = $('#filePicker').find('input'),
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
        var form = new FormData();
        form.append("inputFile", inputFile);
        //视图
        var $li = $('<div class="item" data-name=""><p class="imgWrap"></p></div>');
        $li.appendTo($queue);
        state = 'uploading';
        //上传
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
            if (res.success) {
                var imgUrl = res.thumbUrl;
                var temp = '<img src="' + imgUrl + '" alt="">';
                $li.find('.imgWrap').append(temp);
                $filePickerInput.val('');
            }
        }).fail(function () {
            alert('服务器故障，上传失败');
        }).always(function () {
            state = 'pedding';
        });
    });

    function updateProgress(e) {
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
