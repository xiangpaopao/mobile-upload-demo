/**
 * [AlertBox 弹框]
 * @param {[type]} type  弹框类型 doubleBtn/onceCancel/onceConfirm/mini
 * @param {[type]} alertCls  弹框class 可继承修改样式
 * @param {[type]} title 弹框标题
 * @param {[type]} msg 弹框内容
 * @param {[type]} cancelText 取消按钮文本
 * @param {[type]} confirmText 确认按钮文本
 * @param {[type]} cancel 取消按钮回调事件
 * @param {[type]} confirm 确认按钮回调事件
 * @param {[type]} callback 弹框回调事件
 */
;(function(root, factory, d){
    if (typeof module !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(root, d);
    } else if (typeof define === 'function' && define.amd) { // AMD / RequireJS
        define(factory(root, d));
    } else {
        root.AlertBox = factory.call(root, root, d);
    }
})(this, function(w, d){

	   'use strict';
       
        function AlertBox(opts){
            
            if(!(this instanceof AlertBox)){
                return  new AlertBox(opts).init();
            }

            this.opts = opts || {};
            this.type = this.opts.type || "doubleBtn";
            this.alertCls = this.opts.alertCls || "";
            this.title = this.opts.title || "温馨提示";
            this.msg = this.opts.msg || "";
            this.cancelText = this.opts.cancelText || "取消";
            this.confirmText = this.opts.confirmText || "确定";
            this.cancel = this.opts.cancel || "";
            this.confirm = this.opts.confirm || "";
            this.callback = this.opts.callback || "";
        }

        AlertBox.prototype = {
            constructor: AlertBox,
            getEl: function(supEl, el){
                return supEl.querySelector(el);
            },
            init: function(){
                var self = this ;
                self.setStyle();
                self.addAlertBox();
                self.type == "mini" ? self.minEvent() : self.alertEvent();
            },
            addAlertBox: function(){
                var self = this,
                    pos = self.getPos();
                self.getMask();
                self.getEl(d, "body").insertAdjacentHTML('beforeend', self.getHtml());
                self.alertBox = self.getEl(d, "#alertBox") ;
                self.alertBox.style.cssText = "width:"+ parseInt(pos.width - (2 * 25)) +"px;left:25px;top:"+ parseInt(pos.sTop + w.innerHeight/2 -self.alertBox.offsetHeight/2)+"px;";
                self.callback && typeof self.callback == "function" && self.callback();
            },
            setStyle: function(){
                var self = this,
               style = d.createElement("style"),
               cssStr = ".alert-box{position:absolute;left:0;padding:10px;background:#FFF;-webkit-box-sizing:border-box;z-index:100;}" +
                        ".alert-msg{padding:8px 0 12px 0;text-align:center;line-height:1.8;word-break:break-all;}" +
                        ".alert-title{text-align:center;font-size:14px;}" +
                        ".alert-btn{display:-webkit-box;}" +
                        ".alert-btn a{display:block;-webkit-box-flex:1;height:33px;border-radius:2px;line-height:33px;text-align:center;font-size:13px;}" +
                        ".alert-btn a.alert-cancel{border:1px solid #DCDCDC;background:#FFF;color:#707070;}" +
                        ".alert-btn a.alert-confirm{border:1px solid #FC7C26;background:#FC7C26;color:#FFF;}" +
                        ".alert-btn a i{display:inline-block;width:80px;text-align:center;}" +
                        ".alert-mini-box{background:rgba(0,0,0,.7);color:#fff;}" +
                        ".mr10{margin-right:10px;}";
                style.type= "text/css";
                style.innerText = cssStr;
                self.getEl(d, "head").appendChild(style);
            },
            getPos: function(){
                var wn = d.documentElement.offsetWidth || d.body.offsetWidth,
                    h = d.documentElement.offsetHeight || d.body.offsetHeight,
                    s = d.documentElement.scrollTop || d.body.scrollTop;
                if(w.innerHeight > h){
                    h = w.innerHeight;
                }
                return {
                    width: wn,
                    height: h,
                    sTop: s
                };
            },
            getHtml: function(){
                var self = this,
                    html = '';
                if(self.type != "mini"){
                    html += '<div class=\"alert-box ' + self.alertCls + '\" id="alertBox">' +
                            '<div class="alert-title">'+self.title+'</div>' +
                            '<div class="alert-msg">'+self.msg+'</div>' +
                            '<div class="alert-btn">';
                    switch(self.type){
                        case "doubleBtn" :
                            html += '<a href="javascript:;" class="alert-cancel mr10"><i>'+self.cancelText+'</i></a>' +
                                '<a href="javascript:;" class="alert-confirm"><i>'+self.confirmText+'</i></a>';
                            break;
                        case "onceCancel" :
                            html += '<a href="javascript:;" class="alert-cancel">'+self.cancelText+'</a>';
                            break;
                        case "onceConfirm" :
                            html += '<a href="javascript:;" class="alert-confirm">'+self.confirmText+'</a>';
                            break;
                    }
                    html += '</div></div>';
                } else{
                    html += '<div class=\"alert-box alert-mini-box ' + self.alertCls + '\"  id="alertBox"><div class="alert-msg">'+self.msg+'</div></div>';
                }
                return  html;
            },
            getMask: function(){
                var self = this,
                    pos = self.getPos(),
                    mask = d.createElement("div");
                mask.id = "alertMask";
                self.getEl(d, "body").appendChild(mask);
                mask.style.cssText = "position:absolute;left:0;top:0;width:"+ pos.width +"px;height:" + pos.height + "px;background:rgba(0,0,0,0.3);z-index:99";
                self.type == "mini" && (mask.style.backgroundColor = "rgba(255, 255, 255, 0)");
            },
            minEvent: function(){
                var self = this;
                setTimeout(function(){
                    if (navigator.userAgent.match(/iPhone/i)) {
                            $(self.alertBox).fadeOut(500, function(){
                                self.getEl(d, "body").removeChild(self.alertBox);
                             });
                    } else{
                        self.remove(self.alertBox);
                    }
                    self.remove(self.getEl(d, "#alertMask"));

                },2000);
            },
            alertEvent: function(){
                var self = this;
                if(self.alertBox){
                    var cancelBtn = self.getEl(self.alertBox, ".alert-cancel"),
                        confirmBtn = self.getEl(self.alertBox, ".alert-confirm");
                    cancelBtn && self.reset(cancelBtn, self.cancel) ;
                    confirmBtn && self.reset(confirmBtn, self.confirm);
                }
            },
            reset: function(el,type){
                var self = this;
                el.onclick = function(){
                    type && typeof type == "function" && type(this);
                    self.remove(self.alertBox);
                    self.remove(self.getEl(d, "#alertMask"));
                };
            },
            remove:function(el){
                this.getEl(d, "body").removeChild(el);
            }
        }
       
        return AlertBox;
        


}, document);