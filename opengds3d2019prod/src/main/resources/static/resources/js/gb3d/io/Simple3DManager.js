/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
/**
 * @classdesc Simple3DManager 객체를 정의한다. 2D 레이어에 기반한 3D 모델 변환을 요청한다. 변환된 b3dm을 불러온다
 * @class gb3d.io.Simple3DManager
 * @memberof gb3d.io
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.Simple3DManager = function(obj) {
	var options = obj;
	/**
	 * 3D Tiles 변환 요청 주소를 저장한 변수
	 * 
	 * @type {String}
	 */
	this.url = options.url ? options.url : undefined;

	/**
	 * 레이어 정보 요청 URL
	 * 
	 * @type {String}
	 */
	this.layerInfoUrl = options.layerInfoUrl ? options.layerInfoUrl : undefined;

	/**
	 * TilesetManager 객체
	 * 
	 * @type {gb3d.edit.TilesetManager}
	 */
	this.tilesetManager = options.tilesetManager ? options.tilesetManager : undefined;

	/**
	 * 표시될 언어 값을 저장한 변수
	 * 
	 * @type {String}
	 */
	this.locale = options.locale ? options.locale : "en";

	/**
	 * 다중언어 객체
	 * 
	 * @type {Object}
	 */
	this.translation = {
		"400" : {
			"ko" : "요청값 잘못입력",
			"en" : "Bad request"
		},
		"404" : {
			"ko" : "페이지 없음",
			"en" : "Not found"
		},
		"405" : {
			"ko" : "요청 타입 에러",
			"en" : "Method not allowed"
		},
		"406" : {
			"ko" : "요청 형식 에러",
			"en" : "Not acceptable"
		},
		"407" : {
			"ko" : "프록시 에러",
			"en" : "Proxy authentication required"
		},
		"408" : {
			"ko" : "요청시간 초과",
			"en" : "Request timeout"
		},
		"415" : {
			"ko" : "지원하지 않는 타입 요청",
			"en" : "Unsupported media type"
		},
		"500" : {
			"ko" : "서버 내부 오류",
			"en" : "Internal server error"
		},
		"600" : {
			"ko" : "로그인을 해주세요",
			"en" : "Please log in"
		},
		"600" : {
			"ko" : "로그인을 해주세요",
			"en" : "Please log in"
		},
		"601" : {
			"ko" : "미 입력 값이 존재합니다",
			"en" : "You have not entered any required parameters"
		},
		"602" : {
			"ko" : "서버 이름 또는 URL이 중복됩니다",
			"en" : "Server name or URL are duplicated"
		},
		"603" : {
			"ko" : "다시 로그인을 해주세요",
			"en" : "Please log in again"
		},
		"604" : {
			"ko" : "잘못 입력한 정보가 있습니다",
			"en" : "You have entered wrong information"
		},
		"605" : {
			"ko" : "해당 서버가 존재하지 않습니다",
			"en" : "The server does not exist"
		},
		"606" : {
			"ko" : "일부 성공 또는 실패하였습니다.",
			"en" : "Some have succeed or failed"
		},
		"607" : {
			"ko" : "해당 작업공간, 저장소가 존재하지 않습니다",
			"en" : "Workspace or datastore does not exist"
		},
		"608" : {
			"ko" : "올바른 파일을 넣어 주세요",
			"en" : "Please input the correct file"
		},
		"609" : {
			"ko" : "레이어가 중복됩니다",
			"en" : "Duplicate layers"
		},
		"610" : {
			"ko" : "레이어 발행이 실패하였습니다",
			"en" : "Publishing layer failed"
		},
		"611" : {
			"ko" : "Geoserver와 연결이 안정적이지 않습니다",
			"en" : "The connection with geoserver is not stable"
		},
		"612" : {
			"ko" : "작업공간에 레이어가 존재하지 않습니다",
			"en" : "The is no layer in the workspace"
		},
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
		},
		"lineto3d" : {
			"ko" : "라인스트링 레이어 3차원 변환",
			"en" : "LineString to 3D Objects"
		},
		"polygonto3d" : {
			"ko" : "폴리곤 레이어 3차원 변환",
			"en" : "Polygon to 3D Objects"
		},
		"building" : {
			"ko" : "빌딩",
			"en" : "Building"
		},
		"road" : {
			"ko" : "도로",
			"en" : "Road"
		},
		"pole" : {
			"ko" : "전신주",
			"en" : "Telegraph pole"
		},
		"callbox" : {
			"ko" : "공중전화박스",
			"en" : "Call box"
		},
		"notset" : {
			"ko" : "선택안함",
			"en" : "Not set"
		},
		"err" : {
			"ko" : "오류",
			"en" : "Error"
		},
		"dtype" : {
			"ko" : "높이값 설정",
			"en" : "Depth setting"
		},
		"wtype" : {
			"ko" : "너비값 설정",
			"en" : "Width setting"
		},
		"htype" : {
			"ko" : "높이값 설정",
			"en" : "Height setting"
		},
		"rtype" : {
			"ko" : "반지름값 설정",
			"en" : "Radius setting"
		},
		"featureattr" : {
			"ko" : "피처 속성",
			"en" : "Feature attribute"
		},
		"typevalue" : {
			"ko" : "깊이값 입력",
			"en" : "Input depth"
		},
		"attrselect" : {
			"ko" : "속성명 선택",
			"en" : "Attribute"
		},
		"type1" : {
			"ko" : "유형1",
			"en" : "Type1"
		},
		"type2" : {
			"ko" : "유형2",
			"en" : "Type2"
		}
	}
}
/**
 * 포인트 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showPointTo3DModal
 * @param {String} geo - 등록한 GeoServer 이름
 * @param {String} work - 레이어가 포함된 워크스페이스 이름
 * @param {String} store - 레이어가 포함된 데이터스토어 이름
 * @param {String} layer - 레이어 이름
 * @param {Function} callback - 요청이 완료된 후 수행될 콜백 함수
 */
gb3d.io.Simple3DManager.prototype.showPointTo3DModal = function(geo, work, store, layer, callback) {
	var that = this;
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

	var widthTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.wtype[this.locale]);
	var widthOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var widthOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var widthType = $("<select>").addClass("gb-form").append(widthOpt1).append(widthOpt2);
	var widthTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(widthType);
	var widthTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(widthTypeLabel).append(widthTypeInputArea);

	var attrLabelWidth = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKeyWidth = $("<select>").addClass("gb-form");
	var attrKeyInputAreaWidth = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKeyWidth);
	var attrKeyAreaWidth = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabelWidth).append(attrKeyInputAreaWidth);

	var widthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.width[this.locale]);
	var widthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var widthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(widthInput);
	var widthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(widthLabel).append(widthInputArea);

	var heightTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.htype[this.locale]);
	var heightOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var heightOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var heightType = $("<select>").addClass("gb-form").append(heightOpt1).append(heightOpt2);
	var heightTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(heightType);
	var heightTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(heightTypeLabel).append(heightTypeInputArea);

	var attrLabelHeight = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKeyHeight = $("<select>").addClass("gb-form");
	var attrKeyInputAreaHeight = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKeyHeight);
	var attrKeyAreaHeight = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabelHeight).append(attrKeyInputAreaHeight);

	var heightLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.height[this.locale]);
	var heightInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var heightInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(heightInput);
	var heightArea = $("<div>").addClass("gb3d-modal-to3d-row").append(heightLabel).append(heightInputArea);

	var boxParamArea = $("<div>").append(widthTypeArea).append(widthArea).append(attrKeyAreaWidth).append(heightTypeArea).append(heightArea).append(attrKeyAreaHeight);

	var radiusTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.rtype[this.locale]);
	var radiusOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var radiusOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var radiusType = $("<select>").addClass("gb-form").append(radiusOpt1).append(radiusOpt2);
	var radiusTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusType);
	var radiusTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusTypeLabel).append(radiusTypeInputArea);

	var attrLabelRadius = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKeyRadius = $("<select>").addClass("gb-form");
	var attrKeyInputAreaRadius = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKeyRadius);
	var attrKeyAreaRadius = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabelRadius).append(attrKeyInputAreaRadius);

	var radiusLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.radius[this.locale]);
	var radiusInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var radiusInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusInput);
	var radiusArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusLabel).append(radiusInputArea);

	var cylinderParamArea = $("<div>").append(radiusTypeArea).append(attrKeyAreaRadius).append(radiusArea);

	var depthTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.dtype[this.locale]);
	var depthOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var depthOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var depthType = $("<select>").addClass("gb-form").append(depthOpt1).append(depthOpt2);
	var depthTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthType);
	var depthTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthTypeLabel).append(depthTypeInputArea);

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var attrLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKey = $("<select>").addClass("gb-form");
	var attrKeyInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKey);
	var attrKeyArea = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabel).append(attrKeyInputArea);

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "callbox").text(this.translation.callbox[this.locale]);
	var opt3 = $("<option>").attr("value", "pole").text(this.translation.pole[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2).append(opt3);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthTypeArea).append(depthArea).append(attrKeyArea).append(textureArea);

	var body = $("<div>").append(typeArea).append(boxParamArea).append(cylinderParamArea).append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	$(depthType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(depthArea).show();
			$(attrKeyArea).hide();
		} else if (val === "fix") {
			$(depthArea).hide();
			$(attrKeyArea).show();
		}
	});
	$(depthType).trigger("change");

	$(widthType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(widthArea).show();
			$(attrKeyAreaWidth).hide();
		} else if (val === "fix") {
			$(widthArea).hide();
			$(attrKeyAreaWidth).show();
		}
	});
	$(widthType).trigger("change");

	$(heightType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(heightArea).show();
			$(attrKeyAreaHeight).hide();
		} else if (val === "fix") {
			$(heightArea).hide();
			$(attrKeyAreaHeight).show();
		}
	});
	$(heightType).trigger("change");

	$(radiusType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(radiusArea).show();
			$(attrKeyAreaRadius).hide();
		} else if (val === "fix") {
			$(radiusArea).hide();
			$(attrKeyAreaRadius).show();
		}
	});
	$(radiusType).trigger("change");

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
		var type = $(typeSelect).val();
		var geom = {
			"geometry2d" : "Point",
			"geometry3d" : type,
			"texture" : $(textureSelect).val()
		};
		if (type === "box") {
			geom["widthType"] = $(widthType).val();
			if ($(widthType).val() === "default") {
				geom["widthValue"] = $(widthInput).val();
			} else if ($(widthType).val() === "fix") {
				geom["widthValue"] = $(attrKeyWidth).val();
			}
			geom["heightType"] = $(heightType).val();
			if ($(heightType).val() === "default") {
				geom["heightValue"] = $(heightInput).val();
			} else if ($(heightType).val() === "fix") {
				geom["heightValue"] = $(attrKeyHeight).val();
			}
			geom["depthType"] = $(depthType).val();
			if ($(depthType).val() === "default") {
				geom["depthValue"] = $(depthInput).val();
			} else if ($(depthType).val() === "fix") {
				geom["depthValue"] = $(attrKey).val();
			}
		} else if (type === "cylinder") {
			geom["radiusType"] = $(radiusType).val();
			if ($(radiusType).val() === "default") {
				geom["radiusValue"] = $(radiusInput).val();
			} else if ($(radiusType).val() === "fix") {
				geom["radiusValue"] = $(attrKeyRadius).val();
			}
			geom["depthType"] = $(depthType).val();
			if ($(depthType).val() === "default") {
				geom["depthValue"] = $(depthInput).val();
			} else if ($(depthType).val() === "fix") {
				geom["depthValue"] = $(attrKey).val();
			}
		}
		that.get3DTileset(geo, work, store, layer, geom, pointModal, callback);
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

	this.getLayerInfo(geo, work, layer, attrKey, pointModal);
	this.getLayerInfo(geo, work, layer, attrKeyWidth, pointModal);
	this.getLayerInfo(geo, work, layer, attrKeyHeight, pointModal);
	this.getLayerInfo(geo, work, layer, attrKeyRadius, pointModal);
};

/**
 * 라인스트링 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showLineStringTo3DModal
 * @param {String} geo - 등록한 GeoServer 이름
 * @param {String} work - 레이어가 포함된 워크스페이스 이름
 * @param {String} store - 레이어가 포함된 데이터스토어 이름
 * @param {String} layer - 레이어 이름
 * @param {Function} callback - 요청이 완료된 후 수행될 콜백 함수
 */
gb3d.io.Simple3DManager.prototype.showLineStringTo3DModal = function(geo, work, store, layer, callback) {
	var that = this;

	var radiusTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.wtype[this.locale]);
	var radiusOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var radiusOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var radiusType = $("<select>").addClass("gb-form").append(radiusOpt1).append(radiusOpt2);
	var radiusTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusType);
	var radiusTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusTypeLabel).append(radiusTypeInputArea);

	var radiusLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.width[this.locale]);
	var radiusInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var radiusInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(radiusInput);
	var radiusArea = $("<div>").addClass("gb3d-modal-to3d-row").append(radiusLabel).append(radiusInputArea);

	var attrLabelRadius = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKeyRadius = $("<select>").addClass("gb-form");
	var attrKeyInputAreaRadius = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKeyRadius);
	var attrKeyAreaRadius = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabelRadius).append(attrKeyInputAreaRadius);

	var cylinderParamArea = $("<div>").append(radiusTypeArea).append(radiusArea).append(attrKeyAreaRadius);

	var depthTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.dtype[this.locale]);
	var depthOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var depthOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var depthType = $("<select>").addClass("gb-form").append(depthOpt1).append(depthOpt2);
	var depthTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthType);
	var depthTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthTypeLabel).append(depthTypeInputArea);

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var attrLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKey = $("<select>").addClass("gb-form");
	var attrKeyInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKey);
	var attrKeyArea = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabel).append(attrKeyInputArea);

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "road1").text(this.translation.road[this.locale] + ":" + this.translation.type1[this.locale]);
//	var opt3 = $("<option>").attr("value", "road2").text(this.translation.road[this.locale] + ":" + this.translation.type2[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthTypeArea).append(depthArea).append(attrKeyArea).append(textureArea);

	var body = $("<div>").append(cylinderParamArea).append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	$(depthType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(depthArea).show();
			$(attrKeyArea).hide();
		} else if (val === "fix") {
			$(depthArea).hide();
			$(attrKeyArea).show();
		}
	});
	$(depthType).trigger("change");

	$(radiusType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(radiusArea).show();
			$(attrKeyAreaRadius).hide();
		} else if (val === "fix") {
			$(radiusArea).hide();
			$(attrKeyAreaRadius).show();
		}
	});
	$(radiusType).trigger("change");

	var lineModal = new gb.modal.ModalBase({
		"title" : this.translation.lineto3d[this.locale],
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
		var geom = {
			"geometry2d" : "LineString",
			"texture" : $(textureSelect).val()
		};
		geom["widthType"] = $(radiusType).val();
		if ($(radiusType).val() === "default") {
			geom["widthValue"] = $(radiusInput).val();
		} else if ($(radiusType).val() === "fix") {
			geom["widthValue"] = $(attrKeyRadius).val();
		}
		geom["depthType"] = $(depthType).val();
		if ($(depthType).val() === "default") {
			geom["depthValue"] = $(depthInput).val();
		} else if ($(depthType).val() === "fix") {
			geom["depthValue"] = $(attrKey).val();
		}
		that.get3DTileset(geo, work, store, layer, geom, lineModal, callback);
	});

	this.getLayerInfo(geo, work, layer, attrKey, lineModal);
	this.getLayerInfo(geo, work, layer, attrKeyRadius, lineModal);

};

/**
 * 폴리곤 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showLineStringTo3DModal
 * @param {String} geo - 등록한 GeoServer 이름
 * @param {String} work - 레이어가 포함된 워크스페이스 이름
 * @param {String} store - 레이어가 포함된 데이터스토어 이름
 * @param {String} layer - 레이어 이름
 * @param {Function} callback - 요청이 완료된 후 수행될 콜백 함수
 */
gb3d.io.Simple3DManager.prototype.showPolygonTo3DModal = function(geo, work, store, layer, callback) {
	var that = this;

	var depthTypeLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.dtype[this.locale]);
	var depthOpt1 = $("<option>").attr("value", "default").text(this.translation.typevalue[this.locale]);
	var depthOpt2 = $("<option>").attr("value", "fix").text(this.translation.featureattr[this.locale]);
	var depthType = $("<select>").addClass("gb-form").append(depthOpt1).append(depthOpt2);
	var depthTypeInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthType);
	var depthTypeArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthTypeLabel).append(depthTypeInputArea);

	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var attrLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.attrselect[this.locale]);
	var attrKey = $("<select>").addClass("gb-form");
	var attrKeyInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(attrKey);
	var attrKeyArea = $("<div>").addClass("gb3d-modal-to3d-row").append(attrLabel).append(attrKeyInputArea);

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "building").text(this.translation.building[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthTypeArea).append(depthArea).append(attrKeyArea).append(textureArea);

	var body = $("<div>").append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	$(depthType).change(function() {
		var val = $(this).val();
		if (val === "default") {
			$(depthArea).show();
			$(attrKeyArea).hide();
		} else if (val === "fix") {
			$(depthArea).hide();
			$(attrKeyArea).show();
		}
	});
	$(depthType).trigger("change");
	var polygonModal = new gb.modal.ModalBase({
		"title" : this.translation.polygonto3d[this.locale],
		"width" : 500,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		polygonModal.close();
	});
	$(okBtn).click(function() {
		console.log(geo, work, store, layer);
		var geom = {
			"geometry2d" : "Polygon",
			"texture" : $(textureSelect).val()
		};
		geom["depthType"] = $(depthType).val();
		if ($(depthType).val() === "default") {
			geom["depthValue"] = $(depthInput).val();
		} else if ($(depthType).val() === "fix") {
			geom["depthValue"] = $(attrKey).val();
		}
		that.get3DTileset(geo, work, store, layer, geom, polygonModal, callback);
	});

	this.getLayerInfo(geo, work, layer, attrKey, polygonModal);
};

/**
 * 업로드할 주소를 반환한다.
 * 
 * @method gb3d.io.Simple3DManager#get3DTilesetURL
 * @return {String} 업로드 URL
 */
gb3d.io.Simple3DManager.prototype.get3DTilesetURL = function() {
	return this.url;
};

/**
 * 3D Tileset을 요청한다
 * 
 * @method gb3d.io.Simple3DManager#get3DTileset
 * @param {String} geo - 등록한 GeoServer 이름
 * @param {String} work - 레이어가 포함된 워크스페이스 이름
 * @param {String} store - 레이어가 포함된 데이터스토어 이름
 * @param {String} layer - 레이어 이름
 * @param {Object} geom - 2D - 3D 변환 정보
 * @param {gb.modal.Base} modal - 3D 변환 설정 모달
 * @param {Function} callback - 요청이 완료된 후 수행될 콜백 함수
 */
gb3d.io.Simple3DManager.prototype.get3DTileset = function(geo, work, store, layer, geom, modal, callback) {
	var that = this;
	var layerid = geo + ":" + work + ":" + store + ":" + layer;

	var url = this.get3DTilesetURL();
	var params = {
		"serverName" : geo,
		"workspace" : work,
		"datastore" : store,
		"layerName" : layer
	};

	params["geometry2d"] = geom["geometry2d"];
	if (geom["depthType"]) {
		params["depthType"] = geom["depthType"] ? geom["depthType"] : undefined;
	}
	if (geom["depthValue"]) {
		params["depthValue"] = geom["depthValue"] ? geom["depthValue"] : undefined;
	}
	params["texture"] = geom["texture"];
	if (geom.geometry2d === "Point") {
		params["geometry3d"] = geom["geometry3d"];
		if (geom["geometry3d"] === "box") {
			if (geom["widthType"]) {
				params["widthType"] = geom["widthType"] ? geom["widthType"] : undefined;
			}
			if (geom["widthValue"]) {
				params["widthValue"] = geom["widthValue"] ? geom["widthValue"] : undefined;
			}
			if (geom["widthAttr"]) {
				params["widthAttr"] = geom["widthAttr"] ? geom["widthAttr"] : undefined;
			}
			
			if (geom["heightType"]) {
				params["heightType"] = geom["heightType"] ? geom["heightType"] : undefined;
			}
			if (geom["heightValue"]) {
				params["heightValue"] = geom["heightValue"] ? geom["heightValue"] : undefined;
			}
			if (geom["heightAttr"]) {
				params["heightAttr"] = geom["heightAttr"] ? geom["heightAttr"] : undefined;
			}
		} else if (geom["geometry3d"] === "cylinder") {
			if (geom["radiusType"]) {
				params["radiusType"] = geom["radiusType"] ? geom["radiusType"] : undefined;
			}
			if (geom["radiusValue"]) {
				params["radiusValue"] = geom["radiusValue"] ? geom["radiusValue"] : undefined;
			}
			if (geom["radiusAttr"]) {
				params["radiusAttr"] = geom["radiusAttr"] ? geom["radiusAttr"] : undefined;
			}
		}
	} else if (geom.geometry2d === "LineString") {
		if (geom["widthType"]) {
			params["widthType"] = geom["widthType"] ? geom["widthType"] : undefined;
		}
		if (geom["widthValue"]) {
			params["widthValue"] = geom["widthValue"] ? geom["widthValue"] : undefined;
		}
	}
	console.log(layerid);
	var callback2 = function() {
		modal.close();

		$.ajax({
			url : url,
			method : "POST",
			data : JSON.stringify(params),
			contentType : "application/json; charset=UTF-8",
			beforeSend : function() {
				$("body").css("cursor", "wait");
				modal.showSpinner(true);
			},
			complete : function() {
				$("body").css("cursor", "auto");
				modal.showSpinner(false);
			},
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				modal.close();
				var success = data.succ;
				var path = data.path;
				if (success) {
//					 var path ="http://175.116.181.34:8888/guest/upload/20200106_171731/3dtiles/tileset.json";
					that.getTilesetManager().addTileset(path, layerid);
				}
			}
		}).fail(function(xhr, status, errorThrown) {
			modal.showSpinner(false);
			$("body").css("cursor", "auto");
			if (xhr.responseJSON) {
				if (xhr.responseJSON.status) {
					that.errorModal(xhr.responseJSON.status);
				}
			} else {
				that.messageModal(that.translation["err"][that.locale], xhr.status + " " + xhr.statusText);
			}
		});
	};

	// 2d============
	if (typeof callback === "function") {
		callback(layerid, callback2);
	}
	// 2d============
};

/**
 * 에러 메세지를 표시한다
 * 
 * @method gb3d.io.Simple3DManager#errorModal
 * @param {String} code - 오류 코드
 */
gb3d.io.Simple3DManager.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @method gb3d.io.Simple3DManager#messageModal
 * @param {String} title - 모달의 타이틀
 * @param {String} msg - 보여줄 메세지
 */
gb3d.io.Simple3DManager.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").append(msg).addClass("gb-geoserver-msgmodal-body");
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

/**
 * 타일셋 매니저 객체를 반환한다
 * 
 * @method gb3d.io.Simple3DManager#getTilesetManager
 * @return {gb3d.edit.TilesetManager} - 타일셋 매니저 객체
 */
gb3d.io.Simple3DManager.prototype.getTilesetManager = function() {
	return this.tilesetManager;
}

/**
 * 레이어 정보 조회 URL을 반환한다
 * 
 * @method gb3d.io.Simple3DManager#getLayerInfoUrl
 * @return {string} - 레이어 정보 조회 URL
 */
gb3d.io.Simple3DManager.prototype.getLayerInfoUrl = function() {
	return this.layerInfoUrl;
}

/**
 * 레이어 정보 조회 URL을 반환한다
 * 
 * @method gb3d.io.Simple3DManager#getLayerInfo
 * @param {String} geo - 등록한 GeoServer 이름
 * @param {String} work - 레이어가 포함된 워크스페이스 이름
 * @param {String} layer - 레이어 이름
 * @param {HTMLElement} select - 속성키 셀렉트 박스
 * @param {gb.modal.Base} modal - 속성 조회 후 스피너를 감출 모달
 * @return {Object} - 레이어 정보
 */
gb3d.io.Simple3DManager.prototype.getLayerInfo = function(geo, work, layer, select, modal) {
	var that = this;
	var url = this.getLayerInfoUrl();
	var params = {
		"serverName" : geo,
		"workspace" : work,
		// "datastore" : store,
		"geoLayerList" : typeof layer === "string" ? [ layer ] : Array.isArray(layer) ? layer : undefined
	};

	$.ajax({
		// url : url + "&" + jQuery.param(params),
		// method : "POST",
		// contentType : "application/json; charset=UTF-8",
		url : url,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify(params),
		beforeSend : function() {
			$("body").css("cursor", "wait");
			modal.showSpinner(true);
		},
		complete : function() {
			$("body").css("cursor", "auto");
			modal.showSpinner(false);
		},
		success : function(data, textStatus, jqXHR) {
			console.log(data);
			$("body").css("cursor", "auto");
			var list = data;
			if (list.length === 1) {
				var attr = list[0].attInfo;
				var keys = Object.keys(attr);
				$(select).empty();
				for (var i = 0; i < keys.length; i++) {
					var opt = $("<option>").attr("value", keys[i]).text(keys[i]);
					$(select).append(opt);
				}
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		modal.showSpinner(false);
		$("body").css("cursor", "auto");
		if (xhr.responseJSON) {
			if (xhr.responseJSON.status) {
				that.errorModal(xhr.responseJSON.status);
			}
		} else {
			that.messageModal(that.translation["err"][that.locale], xhr.status + " " + xhr.statusText);
		}

	});
}
