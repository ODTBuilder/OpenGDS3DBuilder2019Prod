/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc B3DMManager 객체를 정의한다.
 * 
 * @class gb3d.io.B3DMManager
 * @memberof gb3d.io
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.B3DMManager = function(obj) {
	var that = this;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"upload" : {
			"ko" : "업로드",
			"en" : "Upload"
		},
		"upb3dm" : {
			"ko" : "3D Tiles 업로드(B3DM)",
			"en" : "Upload 3D Tiles(B3DM)"
		}
	};
	var options = obj ? obj : {};
	this.locale = options.locale ? options.locale : "en";
	this.uploadURL = options.url ? options.url : undefined;

	obj.width = 500;
	obj.autoOpen = false;
	obj.title = this.translation.upb3dm[this.locale];
	// obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	var body = this.getModalBody();
	var inputFile = $("<input>").attr({
		"type" : "file"
	});
	$(body).append(inputFile);

	var footer = this.getModalFooter();
	var cancelBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.cancel[this.locale]).click(function(){
		that.close();
	});
	var uploadBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(this.translation.upload[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(uploadBtn).append(cancelBtn);
	$(footer).append(buttonArea);
};
gb3d.io.B3DMManager.prototype = Object.create(gb.modal.ModalBase.prototype);
gb3d.io.B3DMManager.prototype.constructor = gb3d.io.B3DMManager;