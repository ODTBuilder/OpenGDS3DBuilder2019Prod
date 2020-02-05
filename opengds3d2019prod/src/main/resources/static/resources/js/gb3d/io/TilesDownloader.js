/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc TilesDownloader 객체를 정의한다. 압축된 B3DM 파일을 서버로 전송한다. 전송한 B3DM을 렌더링한다. 편집을 위해변환된 GLB파일을
 * 불러온다.
 * @class gb3d.io.TilesDownloader
 * @memberof gb3d.io
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.TilesDownloader = function(obj) {
	var that = this;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"download" : {
			"ko" : "다운로드",
			"en" : "Download"
		},
		"errdown" : {
			"ko" : "다운로드 중 오류가 발생하였습니다.",
			"en" : "There was an error downloading."
		},
		"err" : {
			"ko" : "오류",
			"en" : "Error"
		}
	};
	var options = obj ? obj : {};
	this.locale = options.locale ? options.locale : "en";
	this.downloadTilesUrl = options.downloadTilesUrl ? options.downloadTilesUrl : undefined;

};
gb3d.io.TilesDownloader.prototype.constructor = gb3d.io.TilesDownloader;

/**
 * 선택한 타일을 다운로드한다.
 * 
 * @method gb3d.io.TilesDownloader#download
 */
gb3d.io.TilesDownloader.prototype.downloadTiles = function(jsonURL, fileName) {
	var that = this;
	var params = {
		"path" : jsonURL
	};

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
	    if (this.readyState == 4 && this.status == 200){
	      
	      var filename =  fileName+".zip";
	       var disposition = xhr.getResponseHeader('Content-Disposition');
	         if (disposition && disposition.indexOf('attachment') !== -1) {
	             var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
	             var matches = filenameRegex.exec(disposition);
	             if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
	         }
	      
	        //this.response is what you're looking for
	        console.log(this.response, typeof this.response);
	        this.response = this.response.slice(0, this.response, "application/zip");
	        var a = document.createElement("a");
	        var url = URL.createObjectURL(this.response);
	        a.href = url;
	        a.download = filename;
	        document.body.appendChild(a);
	        a.click();
	        window.URL.revokeObjectURL(url);
	    }
	}
	xhr.open('POST', this.getDownloadTilesURL());
	xhr.responseType = 'blob'; // !!필수!!
	
	var form = $("<form>");
	var formData = new FormData(form[0]);
	var keys = Object.keys(params);
	for (var i = 0; i < keys.length; i++) {
		formData.append(keys[i], params[keys[i]]);
	}
	xhr.send(formData);
	
//	$.ajax({
//		url : this.getDownloadTilesURL(),
//		type : "POST",
//		contentType : "application/json; charset=UTF-8",
//		dataType : 'binary',
//		data : JSON.stringify(params),
//		beforeSend : function() {
//			$("body").css("cursor", "wait");
//			// that.showSpinner(true, that);
//		},
//		complete : function() {
//			$("body").css("cursor", "auto");
//			// that.showSpinner(false, that);
//		},
//		success : function(data) {
//			// console.log(data);
//			$("body").css("cursor", "auto");
//			// 파일 다운로드
//			var blob = new Blob(data);
//			var link = document.createElement('a');
//			link.href = window.URL.createObjectURL(blob);
//			link.download = "myTileset.zip";
//			link.click();
//		},
//		error : function(jqXHR, textStatus, errorThrown) {
//			$("body").css("cursor", "auto");
//			if (jqXHR.responseJSON) {
//				if (jqXHR.responseJSON.status) {
//					that.errorModal(jqXHR.responseJSON.status);
//				}
//			} else {
//				that.messageModal(that.translation["err"][that.locale], that.translation["errdown"][that.locale] + "<br>" + jqXHR.status + " " + jqXHR.statusText);
//			}
//		}
//	});
};

/**
 * 선택한 파일을 업로드한다.
 * 
 * @method gb3d.io.TilesDownloader#upload
 */
gb3d.io.TilesDownloader.prototype.upload = function() {
	var that = this;
	var params = {
		"key1" : "val1",
		"key2" : "val2",
	};

	var finalParams = {};
	$.extend(finalParams, params, {});

	var form = $("<form>");
	var formData = new FormData(form[0]);
	formData.append("file", this.inputFile);
	var keys = Object.keys(finalParams);
	for (var i = 0; i < keys.length; i++) {
		formData.append(keys[i], finalParams[keys[i]]);
	}

	$.ajax({
		url : this.getUploadURL(),
		method : "POST",
		enctype : 'multipart/form-data',
		contentType : false,
		data : formData,
		processData : false,
		beforeSend : function() {
			// $("body").css("cursor", "wait");
			that.showSpinner(true, that);
		},
		complete : function() {
			// $("body").css("cursor", "default");
			that.showSpinner(false, that);
		},
		success : function(data) {
			console.log(data);
			// that.printMessage(that.translation.succ[that.locale]);
			// modal.close();
			// that.open();
			// that.resultTable(data.layers);
			// that.callback();
		},
		error : function(jqXHR, textStatus, errorThrown) {
			// that.printMessage(that.translation.err[that.locale]);
		}
	});
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb3d.io.TilesDownloader#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 표시할 모달 객체
 */
gb3d.io.TilesDownloader.prototype.showSpinner = function(show, modal) {
	if (show) {
		var spinnerArea = $("<div>").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x")).addClass("gb-spinner-wrap").addClass("gb-spinner-body").css({
			"padding-top" : "50px"
		});
		$(modal.getModal()).append(spinnerArea);
	} else {
		$(modal.modal).find(".gb-spinner-wrap").remove();
	}
};

/**
 * 다운로드할 주소를 반환한다.
 * 
 * @method gb3d.io.TilesDownloader#getDownloadTilesURL
 * @return {String} 타일 다운로드 URL
 */
gb3d.io.TilesDownloader.prototype.getDownloadTilesURL = function() {
	return this.downloadTilesUrl;
};

/**
 * 에러 메세지를 표시한다
 * 
 * @method gb3d.io.TilesDownloader#errorModal
 * @param {string} code - 오류 코드
 */
gb3d.io.TilesDownloader.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @method gb3d.io.TilesDownloader#messageModal
 * @param {string} title - 모달의 타이틀
 * @param {string} msg - 보여줄 메세지
 */
gb3d.io.TilesDownloader.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").html(msg).addClass("gb-geoserver-msgmodal-body");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text("OK");
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 310,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};