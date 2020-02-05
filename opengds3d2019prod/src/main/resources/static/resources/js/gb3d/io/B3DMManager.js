/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc B3DMManager 객체를 정의한다. 압축된 B3DM 파일을 서버로 전송한다. 전송한 B3DM을 렌더링한다. 편집을 위해변환된 GLB파일을 불러온다.
 * @class gb3d.io.B3DMManager
 * @memberof gb3d.io
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.B3DMManager = function(obj) {
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
		"upload" : {
			"ko" : "업로드",
			"en" : "Upload"
		},
		"upb3dm" : {
			"ko" : "3D Tiles 업로드(B3DM)",
			"en" : "Upload 3D Tiles(B3DM)"
		},
		"notice" : {
			"ko" : "3D Tiles 구조의 압축파일을 업로드 해주세요. (*.b3dm + tileset.json)",
			"en" : "Please upload a compressed file of 3D Tiles structure. (* .b3dm + tileset.json)"
		},
		"err" : {
			"ko" : "업로드 중 오류가 발생하였습니다.",
			"en" : "There was an error while uploading."
		},
		"succ" : {
			"ko" : "업로드를 완료하였습니다.",
			"en" : "Upload completed."
		}
	};
	var options = obj ? obj : {};
	this.locale = options.locale ? options.locale : "en";
	this.url = options.url ? options.url : undefined;
	this.tilesetManager = options.tilesetManager ? options.tilesetManager : undefined;

	obj.width = 368;
	obj.autoOpen = false;
	obj.title = this.translation.upb3dm[this.locale];
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
};
gb3d.io.B3DMManager.prototype = Object.create(gb.modal.ModalBase.prototype);
gb3d.io.B3DMManager.prototype.constructor = gb3d.io.B3DMManager;

/**
 * 선택한 파일을 업로드한다.
 * 
 * @method gb3d.io.B3DMManager#upload
 */
gb3d.io.B3DMManager.prototype.upload = function() {
	var that = this;
	var params = {
		"key1" : "val1",
		"key2" : "val2",
	};

	var form = $("<form>");
	var formData = new FormData(form[0]);
	formData.append("file", $(this.inputFile)[0].files[0]);

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
			if (data.succ === true) {
				that.close();
				// 타일 경로를 받아서
				var path = data.path;
				// 타일셋 추가 후 줌인
				that.getTilesetManager().addTileset(path, "temp", true);
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
			that.printMessage(that.translation.err[that.locale]);
		}
	});
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb3d.io.B3DMManager#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 표시할 모달 객체
 */
gb3d.io.B3DMManager.prototype.showSpinner = function(show, modal) {
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
 * @method gb3d.io.B3DMManager#getUploadURL
 * @return {String} 업로드 URL
 */
gb3d.io.B3DMManager.prototype.getUploadURL = function() {
	return this.url;
};

/**
 * 업로드 메세지를 출력한다.
 * 
 * @method gb3d.io.B3DMManager#printMessage
 * @param {String} msg - 표시할 메세지
 */
gb3d.io.B3DMManager.prototype.printMessage = function(msg) {
	$(this.complete).empty();
	$(this.complete).text(msg);
};

/**
 * 타일 매니저 객체를 반환한다.
 * 
 * @method gb3d.io.B3DMManager#getTilesetManager
 * @return {gb3d.edit.TilesetManager} 타일 매니저 객체
 */
gb3d.io.B3DMManager.prototype.getTilesetManager = function() {
	return this.tilesetManager;
};

/**
 * 타일 매니저 객체를 설정한다.
 * 
 * @method gb3d.io.B3DMManager#setTilesetManager
 * @param {gb3d.edit.TilesetManager} tm - 타일 매니저 객체
 */
gb3d.io.B3DMManager.prototype.setTilesetManager = function(tm) {
	this.tilesetManager = tm;
};