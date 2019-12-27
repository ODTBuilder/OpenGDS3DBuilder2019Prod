/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc 압축된 다수의 OBJ 파일을 서버로 전송하고 변환된 b3dm을 불러온다.
 * @class gb3d.io.MultiOBJManager
 * @memberof gb3d.io
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.MultiOBJManager = function(obj) {
	var that = this;
	var options = obj;
	this.test = options.test;
	this.locale = options.locale ? options.locale : "en";
	this.url = obj.url ? obj.url : undefined;
	this.gb3dMap = options.gb3dMap instanceof gb3d.Map ? options.gb3dMap : undefined;
	this.translation = {
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"upload" : {
			"ko" : "업로드",
			"en" : "Upload"
		},
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"notice" : {
			"ko" : "obj의 압축파일을 업로드 해주세요. (*.obj)",
			"en" : "Please upload a compressed file of obj format. (* .obj)"
		},
		"title" : {
			"ko" : "압축된 obj파일 불러오기",
			"en" : "Import with zip file(*.obj)"
		}
	};

	obj.width = 368;
	obj.autoOpen = false;
	obj.title = this.translation.title[this.locale];
	// obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	var body = this.getModalBody();
	var notice = $("<div>").text(this.translation.notice[this.locale]);
	this.inputFile = $("<input>").attr({
		"type" : "file"
	});
	this.complete = $("<div>");
	$(body).append(notice).append(this.inputFile).append(this.complete);

	var footer = this.getModalFooter();
	var cancelBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]).click(function() {
		that.close();
	});
	var uploadBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(this.translation.upload[this.locale]).click(function() {
		that.upload();
	});
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(uploadBtn).append(cancelBtn);
	$(footer).append(buttonArea);
}
gb3d.io.MultiOBJManager.prototype = Object.create(gb.modal.ModalBase.prototype);
gb3d.io.MultiOBJManager.prototype.constructor = gb3d.io.MultiOBJManager;

/**
 * 선택한 파일을 업로드한다.
 * 
 * @method gb3d.io.MultiOBJManager#upload
 */
gb3d.io.MultiOBJManager.prototype.upload = function() {
	var that = this;
	this.load3DTiles(this.test);
	// var params = {
	// "key1" : "val1",
	// "key2" : "val2",
	// };
	//
	// var finalParams = {};
	// $.extend(finalParams, params, {});
	//
	// var form = $("<form>");
	// var formData = new FormData(form[0]);
	// formData.append("file", this.inputFile);
	// var keys = Object.keys(finalParams);
	// for (var i = 0; i < keys.length; i++) {
	// formData.append(keys[i], finalParams[keys[i]]);
	// }
	//
	// $.ajax({
	// url : this.getUploadURL(),
	// method : "POST",
	// enctype : 'multipart/form-data',
	// contentType : false,
	// data : formData,
	// processData : false,
	// beforeSend : function() {
	// // $("body").css("cursor", "wait");
	// that.showSpinner(true, that);
	// },
	// complete : function() {
	// // $("body").css("cursor", "default");
	// that.showSpinner(false, that);
	// },
	// success : function(data) {
	// console.log(data);
	// that.printMessage(that.translation.succ[that.locale]);
	// // modal.close();
	// // that.open();
	// // that.resultTable(data.layers);
	// // that.callback();
	// },
	// error : function(jqXHR, textStatus, errorThrown) {
	// that.printMessage(that.translation.err[that.locale]);
	// }
	// });
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb.versioning.Repository#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 표시할 모달 객체
 */
gb3d.io.MultiOBJManager.prototype.showSpinner = function(show, modal) {
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
 * 업로드할 주소를 반환한다.
 * 
 * @method gb3d.io.MultiOBJManager#getUploadURL
 * @return {String} 업로드 URL
 */
gb3d.io.MultiOBJManager.prototype.getUploadURL = function() {
	return this.url;
};

/**
 * 업로드 메세지를 출력한다.
 * 
 * @method gb3d.io.MultiOBJManager#printMessage
 * @param {String} msg - 표시할 메세지
 */
gb3d.io.MultiOBJManager.prototype.printMessage = function(msg) {
	$(this.complete).empty();
	$(this.complete).text(msg);
};

/**
 * 변환된 3d tiles를 추가한다.
 * 
 * @method gb3d.io.MultiOBJManager#load3DTiles
 * @param {String} url - 3d tiles url
 */
gb3d.io.MultiOBJManager.prototype.load3DTiles = function(url) {
	var that = this;
	that.close();
	var tileset = new Cesium.Cesium3DTileset({
		url : url
	});
	that.getGb3dMap().getCesiumViewer().scene.primitives.add(tileset);
	that.getGb3dMap().getCesiumViewer().zoomTo(tileset);

};

/**
 * gb3d.Map 객체를 반환한다.
 * 
 * @method gb3d.io.MultiOBJManager#getGb3dMap
 * @return {gb3d.Map} 3d Map
 */
gb3d.io.MultiOBJManager.prototype.getGb3dMap = function() {
	return this.gb3dMap;
};

/**
 * gb3d.Map 객체를 설정한다.
 * 
 * @method gb3d.io.MultiOBJManager#setGb3dMap
 * @return {gb3d.Map} 3d Map
 */
gb3d.io.MultiOBJManager.prototype.setGb3dMap = function(map) {
	this.gb3dMap = map;
};