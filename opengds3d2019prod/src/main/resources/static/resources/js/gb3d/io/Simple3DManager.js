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
	
	this.url = options.url ? options.url : undefined;
	this.tilesetManager = options.tilesetManager ? options.tilesetManager : undefined;
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
gb3d.io.Simple3DManager.prototype.showPointTo3DModal = function(geo, work, store, layer) {
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

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "callbox").text(this.translation.callbox[this.locale]);
	var opt3 = $("<option>").attr("value", "pole").text(this.translation.pole[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2).append(opt3);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureArea);

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
		var type = $(typeSelect).val(); 
		var geom = {
			"geometry2d" : "Point",
			"geometry3d" : type,
			"depth" : $(depthInput).val(),
			"texture" : $(textureSelect).val()
		};
		if (type === "box") {
			geom["width"] = $(widthInput).val();
			geom["height"] = $(heightInput).val();
		} else if (type === "cylinder") {
			geom["radius"] = $(radiusInput).val();
		}
		that.get3DTileset(geo, work, store, layer, geom, pointModal);
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
gb3d.io.Simple3DManager.prototype.showLineStringTo3DModal = function(geo, work, store, layer) {
	var that = this;
	var radiusLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.width[this.locale]);
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

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "road1").text(this.translation.road[this.locale]+":"+this.translation.type1[this.locale]);
	var opt3 = $("<option>").attr("value", "road2").text(this.translation.road[this.locale]+":"+this.translation.type1[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2).append(opt3);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureArea);

	var body = $("<div>").append(cylinderParamArea).append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

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
			"depth" : $(depthInput).val(),
			"texture" : $(textureSelect).val(),
			"radius" : parseFloat($(radiusInput).val())/2
		};
		that.get3DTileset(geo, work, store, layer, geom, lineModal);
	});
};

/**
 * 폴리곤 대응 3d 객체 종류 선택 모달을 보여줌
 * 
 * @method gb3d.io.Simple3DManager#showLineStringTo3DModal
 * @param {ol.layer.Layer}
 *            layer - 속성을 참조할 레이어
 */
gb3d.io.Simple3DManager.prototype.showPolygonTo3DModal = function(geo, work, store, layer) {
	var that = this;
	
	var depthLabel = $("<span>").addClass("gb3d-modal-to3d-label").text(this.translation.depth[this.locale]);
	var depthInput = $("<input>").attr({
		"type" : "number"
	}).addClass("gb-form");
	var depthInputArea = $("<span>").addClass("gb3d-modal-to3d-value").append(depthInput);
	var depthArea = $("<div>").addClass("gb3d-modal-to3d-row").append(depthLabel).append(depthInputArea);

	var textureLabel = $("<span>").addClass("gb3d-modal-to3d-label").addClass("gb3d-modal-to3d-label-texture").text(this.translation.texture[this.locale]);
	var opt1 = $("<option>").attr("value", "notset").text(this.translation.notset[this.locale]);
	var opt2 = $("<option>").attr("value", "building").text(this.translation.building[this.locale]);
	var textureSelect = $("<select>").addClass("gb-form").append(opt1).append(opt2);
	var textureSelectArea = $("<span>").addClass("gb3d-modal-to3d-value").append(textureSelect);

	var textureArea = $("<div>").addClass("gb3d-modal-to3d-row").append(textureLabel).append(textureSelectArea);

	var commonParamArea = $("<div>").append(depthArea).append(textureArea);

	var body = $("<div>").append(commonParamArea);

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(this.translation.ok[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

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
			"depth" : $(depthInput).val(),
			"texture" : $(textureSelect).val()
		};
		that.get3DTileset(geo, work, store, layer, geom, polygonModal);
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
 */
gb3d.io.Simple3DManager.prototype.get3DTileset = function(geo, work, store, layer, geom, modal) {
	var that = this;
	var url = this.get3DTilesetURL();
	var params = {
			"serverName" : geo,
			"workspace" : work,
			"datastore" : store,
			"layer" : layer
	};
	params["geometry2d"] = geom["geometry2d"];
	params["depth"] = geom["depth"];
	params["texture"] = geom["texture"];
	if (geom.geometry2d === "Point") {
		params["geometry3d"] = geom["geometry3d"];
		if(geom["geometry3d"] === "box"){
			params["width"] = geom["width"];
			params["height"] = geom["height"];
		} else if(geom["geometry3d"] === "cylinder"){
			params["radius"] = geom["radius"];
		}
	} else if (geom.geometry2d === "LineString") {
		params["radius"] = geom["radius"];	
	}
	
	$.ajax({
		url : url + "&" + jQuery.param(params),
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
			modal.showSpinner(true);
		},
		complete : function() {
			$("body").css("cursor", "auto");
			modal.showSpinner(false);
		},
		success : function(data,textStatus,jqXHR) {
			console.log(data);
			modal.close();
			that.getTilesetManager().addTileset("${pageContext.request.contextPath}/resources/testtileset/TilesetWithTreeBillboards/tileset.json", "testLayerTile3", "testLayer");
		}		
	}).fail(function(xhr, status, errorThrown) {
		modal.showSpinner(false);
		$("body").css("cursor", "auto");
		if (xhr.responseJSON) {
			if (xhr.responseJSON.status) {
				that.errorModal(xhr.responseJSON.status);		
			}
		} else {
			that.messageModal(that.translation["err"][that.locale], xhr.status+" "+xhr.statusText);
		}
		
	});
};

/**
 * 에러 메세지를 표시한다
 * 
 * @method gb3d.io.Simple3DManager#errorModal
 * @param {string}
 *            code - 오류 코드
 */
gb3d.io.Simple3DManager.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
* 오류 메시지 창을 생성한다.
* 
* @method gb3d.io.Simple3DManager#messageModal
* @param {string}
*            title - 모달의 타이틀
* @param {string}
*            msg - 보여줄 메세지
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