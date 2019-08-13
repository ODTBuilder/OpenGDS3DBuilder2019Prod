/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc Simple3DManager 객체를 정의한다. 2D 레이어에 기반한 3D 모델 변환을 요청한다. 변환된 b3dm을
 *            불러온다
 * 
 * @class gb3d.io.Simple3DManager
 * @memberof gb3d.io
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.Simple3DManager = function(obj) {
	var options = obj;
	this.url = obj.url ? obj.url : undefined;
	this.locale = options.locale ? options.locale : "en";
	this.translation = {
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"type" : {
			"ko" : "타입",
			"en" : "Type"
		},
		"box" : {
			"ko" : "박스",
			"en" : "Box"
		},
		"cylinder" : {
			"ko" : "실린더",
			"en" : "Cylinder"
		},
		"width" : {
			"ko" : "너비",
			"en" : "Width"
		},
		"height" : {
			"ko" : "높이",
			"en" : "Height"
		},
		"depth" : {
			"ko" : "깊이",
			"en" : "Depth"
		},
		"radius" : {
			"ko" : "반경",
			"en" : "Radius"
		},
		"texture" : {
			"ko" : "텍스쳐",
			"en" : "Texture"
		},
		"top" : {
			"ko" : "윗면",
			"en" : "Top"
		},
		"side" : {
			"ko" : "옆면",
			"en" : "Side"
		},
		"pointto3d" : {
			"ko" : "포인트 레이어 3차원 변환",
			"en" : "Point to 3D Objects"
		}
	}
}
/**
 * 포인트 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showPointTo3DModal
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.showPointTo3DModal = function(layer) {
	var typeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.type[this.locale]);

	var box = $("<option>").attr({
		"value" : "box"
	}).text(this.translation.box[this.locale]);
	var cylinder = $("<option>").attr({
		"value" : "cylinder"
	}).text(this.translation.cylinder[this.locale]);
	var typeSelect = $("<select>").append(box).append(cylinder).addClass("gb-form");
	var typeSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(typeSelect);

	var typeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(typeLabel).append(typeSelectArea);

	var widthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.width[this.locale]);
	var widthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var widthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(widthInput);

	var widthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(widthLabel).append(widthInputArea);

	var heightLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.height[this.locale]);
	var heightInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var heightInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(heightInput);

	var heightArea = $("<div>").addClass("gb3d-modal-to3d-row").append(heightLabel).append(heightInputArea);

	var boxParamArea = $("<div>").append(widthArea).append(heightArea);

	var radiusLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.radius[this.locale]);
	var radiusInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var radiusInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusInput);

	var radiusArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusLabel).append(radiusInputArea);

	var cylinderParamArea = $("<div>").append(radiusArea);

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var textureLabelTop = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale] + ":" + this.translation.top[this.locale]);
	var textureTopSelect = $("<div>").addClass("gb-form");
	var textureSelectTopArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureTopSelect);

	var textureTopArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelTop).append(textureSelectTopArea);

	var textureLabelSide = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(
			this.translation.texture[this.locale] + ":" + this.translation.side[this.locale]);
	var textureSelectSide = $("<div>").addClass("gb-form");
	var textureSelectSideArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelectSide);

	var textureSideArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelSide).append(textureSelectSideArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureTopArea).append(textureSideArea);

	var body = $("<div>").append(typeArea).append(boxParamArea).append(cylinderParamArea).append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var pointModal = new gb.modal.ModalBase({
		"title" : this.translation.pointto3d[this.locale],
		"width" : 500,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		pointModal.close();
	});
	$(okBtn).click(function() {
		console.log("ok");
	});

	$(typeSelect).change(function() {
		var val = $(this).val();
		if (val === "box") {
			$(boxParamArea).show();
			$(cylinderParamArea).hide();
		} else if (val === "cylinder") {
			$(boxParamArea).hide();
			$(cylinderParamArea).show();
		}
	});

	$(typeSelect).trigger("change");
};

/**
 * 라인스트링 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showLineStringTo3DModal
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.showLineStringTo3DModal = function(layer) {
	var radiusLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.radius[this.locale]);
	var radiusInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var radiusInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusInput);

	var radiusArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusLabel).append(radiusInputArea);

	var cylinderParamArea = $("<div>").append(radiusArea);

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var textureLabelTop = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale] + ":" + this.translation.top[this.locale]);
	var textureTopSelect = $("<div>").addClass("gb-form");
	var textureSelectTopArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureTopSelect);

	var textureTopArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelTop).append(textureSelectTopArea);

	var textureLabelSide = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(
			this.translation.texture[this.locale] + ":" + this.translation.side[this.locale]);
	var textureSelectSide = $("<div>").addClass("gb-form");
	var textureSelectSideArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelectSide);

	var textureSideArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelSide).append(textureSelectSideArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureTopArea).append(textureSideArea);

	var body = $("<div>").append(cylinderParamArea).append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var lineModal = new gb.modal.ModalBase({
		"title" : this.translation.pointto3d[this.locale],
		"width" : 500,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		lineModal.close();
	});
	$(okBtn).click(function() {
		console.log("ok");
	});
};

/**
 * 폴리곤 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showLineStringTo3DModal
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.showPolygonTo3DModal = function(layer) {

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var textureLabelTop = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale] + ":" + this.translation.top[this.locale]);
	var textureTopSelect = $("<div>").addClass("gb-form");
	var textureSelectTopArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureTopSelect);

	var textureTopArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelTop).append(textureSelectTopArea);

	var textureLabelSide = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(
			this.translation.texture[this.locale] + ":" + this.translation.side[this.locale]);
	var textureSelectSide = $("<div>").addClass("gb-form");
	var textureSelectSideArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelectSide);

	var textureSideArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabelSide).append(textureSelectSideArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureTopArea).append(textureSideArea);

	var body = $("<div>").append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var polygonModal = new gb.modal.ModalBase({
		"title" : this.translation.pointto3d[this.locale],
		"width" : 500,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		polygonModal.close();
	});
	$(okBtn).click(function() {
		console.log("ok");
	});
};

/**
 * 요청 전 레이어 속성정보를 불러온다
 * 
 * @method gb3d.io.Simple3DManager#loadLayerInfo
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.loadLayerInfo = function() {

}

/**
 * 2D 에서 3D로 변환을 요청한다
 * 
 * @method gb3d.io.Simple3DManager#load3DTiles
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.load3DTiles = function() {

}

/**
 * 업로드할 주소를 반환한다.
 * 
 * @method gb3d.io.Simple3DManager#getUploadURL
 * @return {String} 업로드 URL
 */
gb3d.io.Simple3DManager.prototype.getUploadURL = function() {
	return this.url;
};