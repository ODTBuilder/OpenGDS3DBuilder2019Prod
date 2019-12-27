var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc 3차원 객체 편집 기능을 정의한다. 필수 라이브러리: jQuery, threeJS, Cesium,
 * {@link gb3d.edit.EditingToolBase}
 * @class gb3d.edit.EditingTool3D
 * @requires {@link gb3d.edit.EditingToolBase}
 * @memberof gb3d.edit
 * @param {Object} obj - 생성자 옵션
 * @param {gb3d.edit.EditingTool2D} obj.editingTool2D - 2D 편집 관리 객체
 * @param {gb3d.edit.ModelRecord} [obj.modelRecord] - Model 객체 편집 이력을 관리하는 객체
 * @param {gb3d.tree.OpenLayers} obj.otree - 레이어 관리 jstree 객체
 * @param {string} obj.getFeatureURL - Feature 객체 요청 url
 * @param {string} [obj.locale="en"] - 언어 코드
 * @author KIM HOCHUL
 * @date 2019. 12. 24
 * @version 0.01
 */

gb3d.edit.EditingTool3D = function(obj) {
	var that = this;
	gb3d.edit.EditingToolBase.call(this, obj);

	this.translation = {
			"notSupportHistory" : {
				"en" : "This layer is not support feature history",
				"ko" : "피처 이력을 지원하지 않는 레이어 입니다."
			},
			"alertSelectFeature" : {
				"en" : "you should select Feature",
				"ko" : "피처를 선택해 주세요."
			},
			"alertSelectOneLayer" : {
				"en" : "you must select only one Layer",
				"ko" : "레이어는 하나만 선택해야 합니다."
			},
			"returnMustArray" : {
				"en" : "The return type must be an array",
				"ko" : "리턴 객체는 배열이어야 합니다"
			},
			"editToolHint" : {
				"en" : "Please zoom in to edit",
				"ko" : "편집하시려면 확대해주세요"
			},
			"changes" : {
				"en" : "Changes",
				"ko" : "변경이력"
			},
			"add" : {
				"ko" : "추가",
				"en" : "Add"
			},
			"cancel" : {
				"ko" : "취소",
				"en" : "Cancel"
			},
			"delete" : {
				"ko" : "삭제",
				"en" : "Delete"
			},
			"deleteFeature" : {
				"ko" : "객체 삭제",
				"en" : "Delete Feature"
			},
			"notNullHint" : {
				"ko" : "빈 값이 허용되지않습니다.",
				"en" : "null values ​​are not allowed."
			},
			"valueHint" : {
				"ko" : "타입에 맞게 값을 입력해야합니다.",
				"en" : "You must enter a value for the type."
			},
			"tempLayer" : {
				"ko" : "Move 임시레이어",
				"en" : "Move temporary layer"
			},
			"deleteFeaturesHint" : {
				"ko" : "선택한 객체들을 정말로 삭제하시겠습니까?",
				"en" : "Are you sure you want to delete the selected features?"
			},
			"selectFeatureNum" : {
				"ko" : "선택된 객체 수",
				"en" : "Number of selected features"
			},
			"transformPointHint" : {
				"ko" : "Point객체는 변환 기능을 사용할 수 없습니다.",
				"en" : "Point objects can not use the transform function."
			},
			"requiredOption" : {
				"ko" : "은 필수 입력항목입니다.",
				"en" : "is a required field."
			}
		};
	
	// EditingTool3D 작업 표시줄 기본 항목
	var defaultList = [ {
		content : "Move(W key)",
		icon : "fas fa-arrows-alt fa-lg",
		clickEvent : function() {
			that.threeTransformControls.setMode("translate");
		},
		color : ""
	}, {
		content : "Scale(E key)",
		icon : "fas fa-expand fa-lg",
		clickEvent : function() {
			that.threeTransformControls.setMode("scale");
		},
		color : ""
	}, {
		content : "Rotate(R key)",
		icon : "fas fa-sync-alt fa-lg",
		clickEvent : function() {
			that.threeTransformControls.setMode("rotate");
		},
		color : ""
	}, {
		content : "Delete",
		icon : "fas fa-eraser fa-lg",
		clickEvent : function() {
// that.getMap().removeThreeObject(that.pickedObject_.uuid);
			var edit2d = that.getEditingTool2D();
			edit2d.remove();
		},
		color : ""
	}, {
		content : "Attach",
		icon : "fas fa-arrow-down fa-lg",
		clickEvent : function() {
			that.attachObjectToGround(that.pickedObject_);
		},
		color : ""
	} ];

	this.editingTool2D = obj.editingTool2D ? obj.editingTool2D : undefined;
	
	this.modelRecord = obj.modelRecord instanceof gb3d.edit.ModelRecord ? obj.modelRecord : undefined;

	this.otree = obj.otree ? obj.otree : undefined;
	
	this.treeElement = this.otree ? this.otree.getJSTreeElement() : undefined;
	
	this.getFeatureURL = obj.getFeatureURL ? obj.getFeatureURL : undefined;
	
	// 드래그 시작, 끝 위치
	this.dragStart = undefined;
	this.dragEnd = undefined;
	
	// 2D 피처 요청 정보
	this.parameters2d = {
		"request" : "GetFeature",
		"serverName": undefined,
		"workspace": undefined,
		"version" : gb.module.serviceVersion.WFS,
		"typeName" : undefined,
		"outputformat" : "application/json",
		"featureID" : undefined
	};
	
	// 3D 객체 정보
	this.objectAttr = {
			type : undefined,
			coordinate : [],
			extent : [],
			feature : undefined,
			id : undefined
	};

	// =====================================
	var typeSpan = $("<span>").addClass("Text").text("Type");
	var opt1 = $("<option>").attr("value", "box").text("Box");
	var opt2 = $("<option>").attr("value", "cylinder").text("Cylinder");
	var opt3 = $("<option>").attr("value", "circle").text("Circle");
	var opt4 = $("<option>").attr("value", "dodecahedron").text("Dodecahedron");
	var opt5 = $("<option>").attr("value", "icosahedron").text("Icosahedron");
	var typeSelect = $("<select>").addClass("form-control").append(opt1).append(opt2).append(opt3).append(opt4).append(opt5);
	var row1 = $("<div>").addClass("gb-object-row").attr("data-val", "type").append(typeSpan).append(typeSelect);
	
	var widthSpan = $("<span>").addClass("Text").text("Width");
	var widthInput = $("<input>").addClass("form-control").attr("value", 40);
	var row2 = $("<div>").addClass("gb-object-row").attr("data-val", "width").append(widthSpan).append(widthInput);

	var heightSpan = $("<span>").addClass("Text").text("Height");
	var heightInput = $("<input>").addClass("form-control").attr("value", 40);
	var row3 = $("<div>").addClass("gb-object-row").attr("data-val", "height").append(heightSpan).append(heightInput);
	
	var depthSpan = $("<span>").addClass("Text").text("Depth");
	var depthInput = $("<input>").addClass("form-control").attr("value", 40);
	var row4 = $("<div>").addClass("gb-object-row").attr("data-val", "depth").append(depthSpan).append(depthInput);
	
	var content = $("<div>").addClass("type-content").append(row2).append(row3).append(row4);
	
	var body = $("<div>").append(row1).append(content);
	
	
	var okBtn = 
		$("<button>")
			.css({
				"float" : "right"
			})
			.addClass("gb-button")
			.addClass("gb-button-primary")
			.text(that.translation.add[that.locale]);
	
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);
	
	var modalFooter = $("<div>").append(buttonArea);
	
	this.point3DModal = new gb.modal.ModalBase({
		"title" : "3D Object Attribute",
		"width" : 540,
		"autoOpen" : false,
		"body" : body,
		"footer" : modalFooter
	});
	this.point3DModal.modalHead.find("button").remove();
	
	$(typeSelect).on("change", function(e){
		var val = $(this).val();
		var content =  $(that.point3DModal.getModalBody()).find(".type-content");
		content.empty();

		var div, span, input;
		var options = optionsOfType[val];

		for(var i in options){
			span = $("<span class='Text'>").text(i);
			input = $("<input class='form-control' style='flex: 1;'>").val(options[i]);
			div = $("<div class='gb-object-row' data-val='" + i + "'>");
			div.append(span).append(input);
			content.append(div);
		}
	});
	
	okBtn.click(function(){
		var opt = {};

		opt.type = $(that.point3DModal.getModalBody()).find("select:first-child").val();
		$(that.point3DModal.getModalBody()).find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = $(d).find("input").val();
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****
		that.createPointObject(that.objectAttr.coordinate, that.objectAttr.extent, opt);

// $("#pointObjectCreateModal").modal("hide");
		that.point3DModal.close();
	});
	
	// =====================================
	
	var widthSpan = $("<span>").addClass("Text").text("Width");
	var widthInput = $("<input>").addClass("form-control").attr("value", 40);
	var row2 = $("<div>").addClass("gb-object-row").attr("data-val", "width").append(widthSpan).append(widthInput);
	
	var depthSpan = $("<span>").addClass("Text").text("Depth");
	var depthInput = $("<input>").addClass("form-control").attr("value", 40);
	var row4 = $("<div>").addClass("gb-object-row").attr("data-val", "depth").append(depthSpan).append(depthInput);
	
	var textureSpan = $("<span>").addClass("Text").text("Texture");
	var textureInput = $("<input>").addClass("form-control");
	var row5 = $("<div>").addClass("gb-object-row").attr("data-val", "texture").append(textureSpan).append(textureInput);
	
	var content = $("<div>").addClass("type-content").append(row2).append(row4).append(row5);
	
	var body = $("<div>").append(content);
	
	var okBtn = 
		$("<button>")
			.css({
				"float" : "right"
			})
			.addClass("gb-button")
			.addClass("gb-button-primary")
			.text(that.translation.add[that.locale]);
	
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);
	
	var modalFooter = $("<div>").append(buttonArea);
	
	this.line3DModal = new gb.modal.ModalBase({
		"title" : "3D Object Attribute",
		"width" : 540,
		"autoOpen" : false,
		"body" : body,
		"footer" : modalFooter
	});
	this.line3DModal.modalHead.find("button").remove();
	
	okBtn.click(function(){
		
		var opt = {
				width: 0,
				depth: 0
		};

		$(that.line3DModal.getModalBody()).find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = isNaN(parseFloat($(d).find("input").val())) ? 40 : parseFloat($(d).find("input").val());
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****
// that.createLineObject(that.objectAttr.coordinate, that.objectAttr.extent,
// opt);
// that.createPolygonObject(that.objectAttr.coordinate, that.objectAttr.extent,
// opt);
		that.createLineStringObjectOnRoad(that.objectAttr.coordinate, that.objectAttr.extent, opt);
// $("#pointObjectCreateModal").modal("hide");
		that.line3DModal.close();
	});
	
	// =====================================
	
	var depthSpan = $("<span>").addClass("Text").text("Depth");
	var depthInput = $("<input>").addClass("form-control").attr("value", 40);
	var row4 = $("<div>").addClass("gb-object-row").attr("data-val", "depth").append(depthSpan).append(depthInput);
	
	var textureSpan = $("<span>").addClass("Text").text("Texture");
	var textureInput = $("<input>").addClass("form-control");
	var row5 = $("<div>").addClass("gb-object-row").attr("data-val", "texture").append(textureSpan).append(textureInput);
	
	var content = $("<div>").addClass("type-content").append(row4).append(row5);
	
	var body = $("<div>").append(content);
	
	var okBtn = 
		$("<button>")
			.css({
				"float" : "right"
			})
			.addClass("gb-button")
			.addClass("gb-button-primary")
			.text(that.translation.add[that.locale]);
	
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);
	
	var modalFooter = $("<div>").append(buttonArea);
	
	this.polygon3DModal = new gb.modal.ModalBase({
		"title" : "3D Object Attribute",
		"width" : 540,
		"autoOpen" : false,
		"body" : body,
		"footer" : modalFooter
	});
	this.polygon3DModal.modalHead.find("button").remove();
	
	okBtn.click(function(){
		
		var opt = {
				depth: 0
		};

		$(that.polygon3DModal.getModalBody()).find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = $(d).find("input").val();
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****

		that.createPolygonObject(that.objectAttr.coordinate, that.objectAttr.extent, opt);

// $("#polygonObjectCreateModal").modal("hide");
		that.polygon3DModal.close();
	});
	
	// =============== modal event listener ===============
	$("#pointObjectCreateModal").modal({
		backdrop: "static",
		show: false
	});

	$("#lineObjectCreateModal").modal({
		backdrop: "static",
		show: false
	});

	$("#polygonObjectCreateModal").modal({
		backdrop: "static",
		show: false
	});

	var optionsOfType = {
			"box": {
				"width": 40,
				"height": 40,
				"depth": 40
			},
			"cylinder": {
				"radiusTop": 20,
				"radiusBottom": 20,
				"height": 40
			},
			"circle": {
				"radius": 20
			},
			"dodecahedron": {
				"radius": 20
			},
			"icosahedron": {
				"radius": 20
			}
	}

	$("#pointObjectCreateModal select").on("change", function(e){
		var val = $(this).val();
		var content = $("#pointObjectCreateModal .type-content");
		content.empty();

		var div, span, input;
		var options = optionsOfType[val];

		for(var i in options){
			span = $("<span class='Text'>").text(i);
			input = $("<input class='form-control' style='flex: 1;'>").val(options[i]);
			div = $("<div class='gb-object-row' data-val='" + i + "'>");
			div.append(span).append(input);
			content.append(div);
		}
	});

	$("#pointObjectConfirm").on("click", function(e){
		var opt = {};

		opt.type = $("#pointObjectCreateModal select:first-child").val();
		$("#pointObjectCreateModal").find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = $(d).find("input").val();
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****
		that.createPointObject(that.objectAttr.coordinate, that.objectAttr.extent, opt);

		$("#pointObjectCreateModal").modal("hide");
	});

	$("#lineObjectConfirm").on("click", function(e){
		var opt = {
				width: 0,
				depth: 0
		};

		$("#lineObjectCreateModal").find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = isNaN(parseFloat($(d).find("input").val())) ? 40 : parseFloat($(d).find("input").val());
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****
// that.createLineObject(that.objectAttr.coordinate, that.objectAttr.extent,
// opt);
// that.createPolygonObject(that.objectAttr.coordinate, that.objectAttr.extent,
// opt);
		that.createLineStringObjectOnRoad(that.objectAttr.coordinate, that.objectAttr.extent, opt);

		$("#lineObjectCreateModal").modal("hide");
	});

	$("#polygonObjectConfirm").on("click", function(e){
		var opt = {
				depth: 0
		};

		$("#polygonObjectCreateModal").find(".gb-object-row").each(function(i, d){
			if($(d).find("input").length !== 0){
				opt[$(d).data("val")] = $(d).find("input").val();
			} else if($(d).find("select").length !== 0){
				opt[$(d).data("val")] = $(d).find("select").val();
			}
		});

		// ***** 입력값 유효성 검사 필요 *****

		that.createPolygonObject(that.objectAttr.coordinate, that.objectAttr.extent, opt);

		$("#polygonObjectCreateModal").modal("hide");
	});
	// ====================================================

	// header element 생성
	this.createContent(defaultList);
	this.closeTool();
	this.headerTag.css({
		"width" : "80%"
	});

	var options = obj ? obj : {};
	this.map = options.map ? options.map : undefined;
	if (!(this.map instanceof gb3d.Map)) {
		console.error("gb3d.edit.EditingTool3D: 'map' is required option");
	} else {
		this.map.tools.edit3d = this;
	}

	this.materialOptions = options.materialOptions || [ "metalness", "roughness", "emissive", "skinning", "wireframe", "map", "normalMap", "emissiveMap", "opacity", "alphaTest" ];

	function transformRender() {
		that.map.renderThreeObj();
	}

	/**
	 * transform 컨트롤 선언
	 * 
	 * @private
	 * @type {THREE.TransformControls}
	 */
	this.threeTransformControls = new THREE.TransformControls(this.map.threeCamera, this.map.threeRenderer.domElement);
	
	/**
	 * 변경시 렌더링 함수 수행
	 * 
	 * @private
	 * @type {THREE.TransformControls}
	 */
	this.threeTransformControls.addEventListener('change', transformRender);
	
	// 드래그 이벤트 발생 시 수행
	this.threeTransformControls.addEventListener('dragging-changed', function(event) {
		that.updateAttributeTab(event.target.object);
	});

	// 3d 객체 변경 시 수행
	this.threeTransformControls.addEventListener('objectChange', function(e) {
		var object = e.target.object, mode = that.threeTransformControls.getMode();
		
		// ThreeJS 객체 Attribute 업데이트
		if (object !== undefined) {
			if (threeEditor.helpers[object.id] !== undefined) {
				threeEditor.helpers[object.id].update();
			}
			threeEditor.signals.refreshSidebarObject3D.dispatch(object);
		}

		switch (mode) {
		case "scale":
			if (object.geometry instanceof THREE.BufferGeometry || !object.geometry) {
				return;
			}
			that.modifyObject2Dfrom3D(object.geometry.vertices, object.uuid);
			break;
		case "rotate":
			break;
		case "translate":
			that.moveObject2Dfrom3D(object.position, object.uuid);
			break;
		default:
		}

		that.getMap().getThreeObjects().forEach(function(e) {
			if (e.getObject().uuid === object.uuid) {
				// 평면도 수정
				
				// 선택된 객체의 수정횟수를 증가시킨다.
				e.upModCount();
				
				var record = that.getModelRecord();
				record.update(e.getLayer(), e);
			}
		});
	});

	// transform 컨트롤 Three Scene에 추가
	this.map.threeScene.add(this.threeTransformControls);
	this.threeTransformControls.setSpace("local");

	var eventDiv = $(this.map.getBindingElement());
	var threeEventDiv = $(eventDiv).find(".gb3d-map-three-area");
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	this.pickedObject_ = undefined, pickedObjectColor = undefined;
	// ==========yijun start==========
	this.isDragging = false;
	this.isDown = false;
	// console.log("최초선언됨 다운: "+that.isDown+", 드래그: "+that.isDragging);
	// ==========yijun end==========

	// ThreeJS Object User Data 창 생성
	var ath1 = $("<th>").text("Name");
	var ath2 = $("<th>").text("Value");
	var atr = $("<tr>").append(ath1).append(ath2);
	var ahd = $("<thead>").append(atr);
	this.attrTB_ = $("<tbody>");
	var atb = $("<table>").addClass("gb-table").append(ahd).append(this.attrTB_);

	this.attrPop_ = new gb.panel.PanelBase({
		"target" : ".area-3d",
		"width" : 300,
		"positionX" : 5,
		"positionY" : 55,
		"autoOpen" : false,
		"body" : atb
	});

// $(this.attrPop_.getPanel()).find(".gb-panel-body").css({
// "max-height" : "400px",
// "overflow-y" : "auto"
// });

	function onDocumentMouseClick(event) {
		// that.isDown = false;
		if (that.isDragging) {
			that.isDragging = false;
			// console.log("클릭이벤트 다운: "+that.isDown+", 드래그: "+that.isDragging);
			return;
		}

		if (!that.getActiveTool()) {
			that.threeTransformControls.detach(that.pickedObject_);
			// that.updateAttributeTab(undefined);
			// that.updateStyleTab(undefined);
			// that.updateMaterialTab(undefined);
			that.pickedObject_ = undefined;
			return;
		}

		if (event.ctrlKey) {
			return;
		}

		event.preventDefault();
		// mouse 클릭 이벤트 영역 좌표 추출. 영역내에서의 좌표값을 추출해야하므로 offset 인자를 사용한다.
		mouse.x = (event.offsetX / eventDiv[0].clientWidth) * 2 - 1;
		mouse.y = (event.offsetY / eventDiv[0].clientHeight) * -2 + 1;

		var interObjs = [];
		var objects = that.map.getThreeObjects();
		for (var i = 0; i < objects.length; i++) {
			interObjs.push(objects[i].getObject());
		}
		raycaster.setFromCamera(mouse, that.map.threeCamera);
		var intersects = raycaster.intersectObjects(interObjs, true);

		if (that.pickedObject_) {
			// 이전에 선택된 객체 초기화
			that.threeTransformControls.detach(that.pickedObject_);
			that.syncUnselect(that.pickedObject_.uuid);
			// that.updateAttributeTab(undefined);
			// that.updateStyleTab(undefined);
			// that.updateMaterialTab(undefined);
			that.pickedObject_ = undefined;
		}

		if (intersects.length > 0) {
			// 새로 선택된 객체 TransformControl에 추가 및 수정 횟수 증가
			var object = intersects[0].object;
			that.pickedObject_ = object;
			that.selectedObject["three"]["object"] = intersects[0].object;
			that.selectedObject["three"]["distance"] = intersects[0].distance;
			// console.log("three 객체의 거리는: "+intersects[0].distance);
			that.applySelectedOutline(object);

			that.threeTransformControls.attach(object);

			that.syncSelect(object.uuid);
			// that.updateAttributeTab(object);
			// that.updateStyleTab(object);
			// that.updateMaterialTab(object);

			// ThreeJS Object User Data창 내용 갱신
			
// $(that.attrTB_).empty();
// var td1, td2, tform, tr;
// for ( var i in userData) {
// td1 = $("<td>").text(i);
//
// tform = $("<input>").addClass("gb-edit-sel-alist").attr({
// "type" : "text"
// }).css({
// "width" : "100%",
// "border" : "none"
// }).val(userData[i]).on("input", function(e) {
// var key = $(this).parent().prev().text();
// var val = $(this).val();
// userData[key] = val;
// });
//
// td2 = $("<td>").append(tform);
//
// tr = $("<tr>").append(td1).append(td2);
// that.attrTB_.append(tr);
// }
			var userData = object.userData;
			that.updateAttributePopup(userData);
			if (that.getActiveTool()) {
				that.attrPop_.setPositionY(55);
			} else {
				that.attrPop_.setPositionY(5);	
			}
			that.attrPop_.open();
			
			if (object.userData.object !== undefined) {
				// helper
				threeEditor.select(object.userData.object);
			} else {
				threeEditor.select(object);
			}

			that.silhouetteGreen.selected = [];
		} else {
			that.removeSelectedOutline();
			threeEditor.select(null);
			that.attrPop_.close();
		}

	}

	// ============ Event ==============
	eventDiv.on("click", onDocumentMouseClick);

	// ==============yijun start===============
	this.highlightObject = {
			"cesium" : {
				"object" : undefined,
				"distance" : undefined
			},
			"three" : {
				"object" : undefined,
				"distance" : undefined
			}
	};
	this.selectedObject = {
			"cesium" : {
				"object" : undefined,
				"distance" : undefined
			},
			"three" : {
				"object" : undefined,
				"distance" : undefined
			}
	};
	// ==============yijun end===============
	var cviewer = this.map.getCesiumViewer();

	// threejs 객체 드래그 오프시 선택되는 문제가 있음 -> 마우스다운/ 무브 탐지 by yijun
	cviewer.screenSpaceEventHandler.setInputAction(function onLeftDown(movement) {
		that.isDragging = false;
		that.isDown = true;
		that.dragStart = Cesium.Cartesian2.clone(movement.position);
		 console.log("왼클릭 눌림 다운: "+that.isDown+", 드래그: "+that.isDragging);
		console.log(movement);
		
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

	cviewer.screenSpaceEventHandler.setInputAction(function onLeftUp(movement) {
		that.isDown = false;
		 console.log("왼클릭 땜 다운: "+that.isDown+", 드래그: "+that.isDragging);
	}, Cesium.ScreenSpaceEventType.LEFT_UP);

	// Information about the currently selected feature
	this.selected = {
			feature : undefined,
			originalColor : new Cesium.Color()
	};

	// An entity object which will hold info about the currently selected
	// feature for infobox display
	this.selectedEntity = new Cesium.Entity();

	this.silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
	this.silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
	// Get default left click handler for when a feature is not picked on left
	// click
	this.clickHandler = cviewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
	if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(cviewer.scene)) {
		// Silhouettes are supported

		that.silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
		that.silhouetteBlue.uniforms.length = 0.01;
		that.silhouetteBlue.selected = [];

		that.silhouetteGreen.uniforms.color = Cesium.Color.LIME;
		that.silhouetteGreen.uniforms.length = 0.01;
		that.silhouetteGreen.selected = [];

		cviewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage([ that.silhouetteBlue, that.silhouetteGreen ]));

		// Silhouette a feature blue on hover.
		cviewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
			if (that.isDown) {
				that.dragEnd = Cesium.Cartesian2.clone(movement.endPosition);
				var dist = Cesium.Cartesian2.distance(that.dragStart, that.dragEnd);
				if (dist > 1) {
					that.isDragging = true;	
				}
				// console.log("왼다운 인식 됨 커서이동중 다운: "+that.isDown+", 드래그:
				// "+that.isDragging);
				// console.log(movement);
			}

			if (!that.getActiveTool()) {
				that.threeTransformControls.detach(that.pickedObject_);
				// that.updateAttributeTab(undefined);
				// that.updateStyleTab(undefined);
				// that.updateMaterialTab(undefined);
// that.pickedObject_ = undefined;
// return;
			}

			var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
			var slayer;
			var ctileset;
			if (slayers.length === 0) {
				return;
			} else if (slayers.length === 1) {
				slayer = slayers[0];
				var git = slayer.get("git");
				if (git) {
					var tileset = git.tileset;
					if (tileset) {
						ctileset = tileset.getCesiumTileset();
					}
				}
			} else {
				return;
			}
			// 카메라의 위치
			var camPos = that.map.getCamera().getCesiumCamera().positionWC;
			// 화면상의 커서가 보는 객체상의 포인트
			var point = that.map.getCesiumViewer().scene.pickPosition(movement.endPosition);
			// 두 점의 거리
			var distance = Cesium.Cartesian3.distance(camPos, point);
			// console.log("거리는: "+distance);
			// If a feature was previously highlighted, undo the highlight
			that.silhouetteBlue.selected = [];

			// Pick a new feature
			var pickedFeature = cviewer.scene.pick(movement.endPosition);

			if (pickedFeature) {
				if (pickedFeature.primitive !== ctileset) {
					return;
				}	
			}
			
			if (!Cesium.defined(pickedFeature)) {
				that.highlightObject["cesium"]["object"] = undefined;
				that.highlightObject["cesium"]["distance"] = undefined;
				return;
			}

			// var name = pickedFeature.getProperty('name');
			// if (!Cesium.defined(name)) {
			// name = pickedFeature.getProperty('id');
			// }

			that.highlightObject["cesium"]["object"] = pickedFeature;
			that.highlightObject["cesium"]["distance"] = distance;
			// console.log("cesium 객체의 거리는: "+distance);
			var isCloser = false;
			if (!that.highlightObject["three"]["object"] || !that.highlightObject["three"]["distance"]) {
				isCloser = true;
			} else if (!!that.highlightObject["three"]["object"] && !isNaN(that.highlightObject["three"]["distance"])) {
				if (that.highlightObject["cesium"]["distance"] <= that.highlightObject["three"]["distance"]) {
					isCloser = true;
				}
			}
			// Highlight the feature if it's not already selected.
			if (isCloser && pickedFeature !== that.selected.feature) {
				that.silhouetteBlue.selected = [ pickedFeature ];
				// that.highlightObject["three"]["object"] = undefined;
				// that.highlightObject["three"]["distance"] = undefined;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		// Silhouette a feature on selection and show metadata in the InfoBox.
		cviewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
			// console.log(movement);
			if (!that.getActiveTool()) {
				that.threeTransformControls.detach(that.pickedObject_);
				// that.updateAttributeTab(undefined);
				// that.updateStyleTab(undefined);
				// that.updateMaterialTab(undefined);
// that.pickedObject_ = undefined;
// return;
			}

			if (event.ctrlKey) {
				return;
			}

			var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
			var slayer;
			var ctileset;
			if (slayers.length === 0) {
				return;
			} else if (slayers.length === 1) {
				slayer = slayers[0];
				var git = slayer.get("git");
				if (git) {
					var tileset = git.tileset;
					if (tileset) {
						ctileset = tileset.getCesiumTileset();
					}
				}
			} else {
				return;
			}
			
			// If a feature was previously selected, undo the highlight
			that.silhouetteGreen.selected = [];

			// Pick a new feature
			var pickedFeature = cviewer.scene.pick(movement.position);
			
			if (pickedFeature) {
				if (pickedFeature.primitive !== ctileset) {
					return;
				}	
			}
			
			if (!Cesium.defined(pickedFeature)) {
				that.clickHandler(movement);
				that.attrPop_.close();
				that.getEditingTool2D().unselectFeature();
				return;
			}

			// Select the feature if it's not already selected
			if (that.silhouetteGreen.selected[0] === pickedFeature) {
				return;
			}

			// Save the selected feature's original color
			var highlightedFeature = that.silhouetteBlue.selected[0];
			if (pickedFeature === highlightedFeature) {
				that.silhouetteBlue.selected = [];
			}

			// Highlight newly selected feature
			that.silhouetteGreen.selected = [ pickedFeature ];

			// Set feature infobox description
			var propNames = pickedFeature.getPropertyNames();
			cviewer.selectedEntity = that.selectedEntity;
			var obj = {};
			for ( var i in propNames) {
				obj[propNames[i]] = pickedFeature.getProperty(propNames[i]);
			}
			console.log(obj);
			that.updateAttributePopup(obj);
			if (that.getActiveTool()) {
				that.attrPop_.setPositionY(55);
			} else {
				that.attrPop_.setPositionY(5);	
			}
			that.attrPop_.open();
			// 2D 피처 선택
			if (obj.hasOwnProperty("featureId")) {
				var fid = obj["featureId"];
				var edit2d = that.getEditingTool2D();
				edit2d.selectFeatureById(fid);
			}
			
			if (that.getActiveTool()) {
				// 편집이 활성화되어 있는 경우 glb 요청 후 완료시 b3dm 숨김
// var extras = pickedFeature.content.tile.extras;
// 2d feature, 3d feature 가져오기
// that.getGLBfromServer();
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	} else {
		// Silhouettes are not supported. Instead, change the feature color.

		// Information about the currently highlighted feature
		var highlighted = {
				feature : undefined,
				originalColor : new Cesium.Color()
		};

		// Color a feature yellow on hover.
		cviewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
			if (!that.getActiveTool()) {
				that.threeTransformControls.detach(that.pickedObject_);
				// that.updateAttributeTab(undefined);
				// that.updateStyleTab(undefined);
				// that.updateMaterialTab(undefined);
// that.pickedObject_ = undefined;
// return;
			}

			var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
			var slayer;
			var ctileset;
			if (slayers.length === 0) {
				return;
			} else if (slayers.length === 1) {
				slayer = slayers[0];
				var git = slayer.get("git");
				if (git) {
					var tileset = git.tileset;
					if (tileset) {
						ctileset = tileset.getCesiumTileset();
					}
				}
			} else {
				return;
			}
			
			// 카메라의 위치
			var camPos = that.map.getCamera().getCesiumCamera().positionWC;
			// 화면상의 커서가 보는 객체상의 포인트
			var point = that.map.getCesiumViewer().scene.pickPosition(movement.endPosition);
			// 두 점의 거리
			var distance = Cesium.Cartesian3.distance(camPos, point);
			// If a feature was previously highlighted, undo the highlight
			if (Cesium.defined(highlighted.feature)) {
				highlighted.feature.color = highlighted.originalColor;
				highlighted.feature = undefined;
			}
			// Pick a new feature
			var pickedFeature = viewer.scene.pick(movement.endPosition);
			
			if (pickedFeature) {
				if (pickedFeature.primitive !== ctileset) {
					return;
				}	
			}
			
			if (!Cesium.defined(pickedFeature)) {
				return;
			}

			that.highlightObject["cesium"]["object"] = pickedFeature;
			that.highlightObject["cesium"]["distance"] = distance;
			// console.log("cesium 객체의 거리는: "+distance);
			var isCloser = false;
			if (!that.highlightObject["three"]["object"] || !that.highlightObject["three"]["distance"]) {
				isCloser = true;
			} else if (!!that.highlightObject["three"]["object"] && !isNaN(that.highlightObject["three"]["distance"])) {
				if (that.highlightObject["cesium"]["distance"] <= that.highlightObject["three"]["distance"]) {
					isCloser = true;
				}
			}
			// Highlight the feature if it's not already selected.
			if (isCloser && pickedFeature !== that.selected.feature) {
				highlighted.feature = pickedFeature;
				Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
				pickedFeature.color = Cesium.Color.YELLOW;
			}

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		// Color a feature on selection and show metadata in the InfoBox.
		cviewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
			if (!that.getActiveTool()) {
				that.threeTransformControls.detach(that.pickedObject_);
				// that.updateAttributeTab(undefined);
				// that.updateStyleTab(undefined);
				// that.updateMaterialTab(undefined);
// that.pickedObject_ = undefined;
// return;
			}

			if (event.ctrlKey) {
				return;
			}

			var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
			var slayer;
			var ctileset;
			if (slayers.length === 0) {
				return;
			} else if (slayers.length === 1) {
				slayer = slayers[0];
				var git = slayer.get("git");
				if (git) {
					var tileset = git.tileset;
					if (tileset) {
						ctileset = tileset.getCesiumTileset();
					}
				}
			} else {
				return;
			}
			
			// If a feature was previously selected, undo the highlight
			if (Cesium.defined(that.selected.feature)) {
				that.selected.feature.color = that.selected.originalColor;
				that.selected.feature = undefined;
			}
			// Pick a new feature
			var pickedFeature = cviewer.scene.pick(movement.position);
			
			if (pickedFeature) {
				if (pickedFeature.primitive !== ctileset) {
					return;
				}	
			}
			
			if (!Cesium.defined(pickedFeature)) {
				that.clickHandler(movement);
				that.attrPop_.close();
				that.getEditingTool2D().unselectFeature();
				return;
			}
			// Select the feature if it's not already selected
			if (that.selected.feature === pickedFeature) {
				return;
			}
			that.selected.feature = pickedFeature;
			// Save the selected feature's original color
			if (pickedFeature === highlighted.feature) {
				Cesium.Color.clone(highlighted.originalColor, that.selected.originalColor);
				highlighted.feature = undefined;
			} else {
				Cesium.Color.clone(pickedFeature.color, that.selected.originalColor);
			}
			pickedFeature.color = Cesium.Color.LIME;
			cviewer.selectedEntity = that.selectedEntity;
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	this.renderPass = new THREE.RenderPass(that.map.getThreeScene(), that.map.getThreeCamera());
	that.map.getThreeComposer().addPass(that.renderPass);
	this.hoverOutlinePass = new THREE.OutlinePass(new THREE.Vector2(eventDiv[0].clientWidth, eventDiv[0].clientHeight), that.map.getThreeScene(), that.map.getThreeCamera());
	that.hoverOutlinePass.edgeStrength = 4;
	that.hoverOutlinePass.edgeThickness = 1;
	that.hoverOutlinePass.visibleEdgeColor.set("#0000ff");
	that.hoverOutlinePass.hiddenEdgeColor.set("#0000ff");
	that.map.getThreeComposer().addPass(that.hoverOutlinePass);
	this.clickOutlinePass = new THREE.OutlinePass(new THREE.Vector2(eventDiv[0].clientWidth, eventDiv[0].clientHeight), that.map.getThreeScene(), that.map.getThreeCamera());
	that.clickOutlinePass.edgeStrength = 4;
	that.clickOutlinePass.edgeThickness = 1;
	that.clickOutlinePass.visibleEdgeColor.set("#00FF00");
	that.clickOutlinePass.hiddenEdgeColor.set("#00FF00");
	that.map.getThreeComposer().addPass(that.clickOutlinePass);
// var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
// effectFXAA.uniforms[ 'resolution' ].value.set( 1 /eventDiv[0].clientWidth, 1/
// eventDiv[0].clientHeight );
// that.map.getThreeComposer().addPass( effectFXAA );

	var recursiveSelect = function(obj, uuid) {
		var result = false;
		if (obj instanceof THREE.Group) {
			if (obj.uuid === uuid) {
				result = true;
				return result;
			}
			var children = obj.children;
			for (var i = 0; i < children.length; i++) {
				result = recursiveSelect(obj.children[i], uuid);
				if (result) {
					break;
				}
			}
		} else if (obj instanceof THREE.Mesh) {
			if (obj.uuid === uuid) {
				result = true;
			}
		}
		return result;
	};

	var onDocumentMouseMove = function(event) {
		if (!that.getActiveTool()) {
			that.threeTransformControls.detach(that.pickedObject_);
			// that.updateAttributeTab(undefined);
			// that.updateStyleTab(undefined);
			// that.updateMaterialTab(undefined);
			that.pickedObject_ = undefined;
			return;
		}

		// event.preventDefault();
		// mouse 클릭 이벤트 영역 좌표 추출. 영역내에서의 좌표값을 추출해야하므로 offset 인자를 사용한다.
		mouse.x = (event.offsetX / eventDiv[0].clientWidth) * 2 - 1;
		mouse.y = (event.offsetY / eventDiv[0].clientHeight) * -2 + 1;

		// ================yijun start=================
		var interObjs = [];
		var objects = that.map.getThreeObjects();
		for (var i = 0; i < objects.length; i++) {
			interObjs.push(objects[i].getObject());
		}
		raycaster.setFromCamera(mouse, that.map.threeCamera);
		var intersects = raycaster.intersectObjects(interObjs, true);

		if (intersects.length > 0) {
			// 새로 선택된 객체 TransformControl에 추가 및 수정 횟수 증가
			var selectedObject = intersects[0];
			that.highlightObject["three"]["object"] = selectedObject.object;
			that.highlightObject["three"]["distance"] = selectedObject.distance;
			// console.log("three 객체의 거리는: "+selectedObject.distance);
			// var clicked = that.clickOutlinePass.selectedObjects;
			if (that.selectedObject["three"]["object"]) {
				var flag = recursiveSelect(that.selectedObject["three"]["object"], that.selectedObject["three"]["object"].uuid);
				if (flag) {
					// if (that.selectedObject["three"]["object"].uuid ===
					// selectedObject.object.uuid) {
					that.clickOutlinePass.selectedObjects = [];
				} else {
					that.clickOutlinePass.selectedObjects = [ that.selectedObject["three"]["object"] ];
				}
			}
			that.hoverOutlinePass.selectedObjects = [ selectedObject.object ];

		} else {
			that.highlightObject["three"]["object"] = undefined;
			that.highlightObject["three"]["distance"] = undefined;
			that.hoverOutlinePass.selectedObjects = [];
			// var clicked = that.clickOutlinePass.selectedObjects;
			if (that.selectedObject["three"]["object"]) {
				that.clickOutlinePass.selectedObjects = [ that.selectedObject["three"]["object"] ];
			}
		}

	}
	// =============yijun end===============
	eventDiv.on("mousemove", onDocumentMouseMove);

	$(document).on("keydown", function(e) {
		if (e.ctrlKey) {
			// Ctrl key 입력 시 기본 3차원 렌더링 함수를 비활성화하고 ThreeJS DIV의 마우스 이벤트를 활성화시킨다.
			cancelAnimationFrame(that.map.requestFrame);
			threeEventDiv.css("pointer-events", "auto");
		}

		switch (event.keyCode) {
		case 81: // Q
			that.threeTransformControls.setSpace(that.threeTransformControls.space === "local" ? "world" : "local");
			break;
		case 18: // Alt
			that.threeTransformControls.setTranslationSnap(100);
			that.threeTransformControls.setRotationSnap(THREE.Math.degToRad(15));
			break;
		case 87: // W
			that.threeTransformControls.setMode("translate");
			break;
		case 69: // E
			that.threeTransformControls.setMode("scale");
			break;
		case 82: // R
			that.threeTransformControls.setMode("rotate");
			break;
		case 187:
		case 107: // +, =, num+
			that.threeTransformControls.setSize(that.threeTransformControls.size + 0.1);
			break;
		case 189:
		case 109: // -, _, num-
			that.threeTransformControls.setSize(Math.max(that.threeTransformControls.size - 0.1, 0.1));
			break;
		case 88: // X
			that.threeTransformControls.showX = !that.threeTransformControls.showX;
			break;
		case 89: // Y
			that.threeTransformControls.showY = !that.threeTransformControls.showY;
			break;
		case 90: // Z
			that.threeTransformControls.showZ = !that.threeTransformControls.showZ;
			break;
			e
		case 32: // Spacebar
			that.threeTransformControls.enabled = !that.threeTransformControls.enabled;
			break;
		}
	}	);

	$(document).on("keyup", function(e) {
		if (e.which === 17) {
			// Ctrl key up 이벤트 발생 시 TransformControl와 ThreeJS DIV의 마우스 이벤트를
			// 비활성화하고 기본 3차원 렌더링 함수를 다시 활성화한다.
			if (that.pickedObject_) {
				// that.threeTransformControls.detach( pickedObject );
				// that.updateAttributeTab(undefined);
				// pickedObject = undefined;
			}
			// 기본 3차원 렌더링 함수 실행
			that.map.loop_();
			threeEventDiv.css("pointer-events", "none");
		}
	});
}
gb3d.edit.EditingTool3D.prototype = Object.create(gb3d.edit.EditingToolBase.prototype);
gb3d.edit.EditingTool3D.prototype.constructor = gb3d.edit.EditingTool3D;

/**
 * EditingTool 작업표시줄을 삭제한다.
 * 
 * @method gb3d.edit.EditingTool3D#editToolClose
 * @function
 */
gb3d.edit.EditingTool3D.prototype.editToolClose = function() {
	this.setActiveTool(false);
}

/**
 * EditingTool 작업표시줄을 표시한다.
 * 
 * @method gb3d.edit.EditingTool3D#editToolOpen
 * @function
 */
gb3d.edit.EditingTool3D.prototype.editToolOpen = function() {
	this.setActiveTool(true);
}

/**
 * EditingTool 작업표시줄 토글
 * 
 * @method gb3d.edit.EditingTool3D#editToolToggle
 * @function
 */
gb3d.edit.EditingTool3D.prototype.editToolToggle = function() {
	if (this.getActiveTool()) {
		this.editToolClose();
		this.attrPop_.setPositionY(5);
	} else {
		this.editToolOpen();
		this.attrPop_.setPositionY(55);
	}
}

/**
 * ThreeJS Object3D 객체의 Center를 지구 표면상에 위치시킨다.
 * 
 * @method gb3d.edit.EditingTool3D#attachObjectToGround
 * @param {THREE.Object3D} object - ThreeJS Object3D 객체
 * @function
 */
gb3d.edit.EditingTool3D.prototype.attachObjectToGround = function(object) {
	if (!object) {
		return;
	}

	var obj = object, threeObject = this.getMap().getThreeObjectByUuid(obj.uuid), feature = threeObject.getFeature(), extent = feature.getGeometry().getExtent(), x = extent[0] + (extent[2] - extent[0])
	/ 2, y = extent[1] + (extent[3] - extent[1]) / 2, centerCart = Cesium.Cartesian3.fromDegrees(x, y);

	obj.position.copy(centerCart);
}

/**
 * 선택된 three객체의 아웃라인을 표시한다
 * 
 * @method gb3d.edit.EditingTool3D#applySelectedOutline
 * @param {THREE.Object3D} object - ThreeJS Object3D 객체
 * @function
 */
gb3d.edit.EditingTool3D.prototype.applySelectedOutline = function(object) {
	that = this;
	that.selectedObject["three"]["object"] = object;
	that.selectedObject["three"]["distance"] = 0;
	that.hoverOutlinePass.selectedObjects = [];
	that.clickOutlinePass.selectedObjects = [ object ];
	that.silhouetteGreen.selected = [];
};

/**
 * 선택 해제된 three객체의 아웃라인을 삭제한다
 * 
 * @method gb3d.edit.EditingTool3D#removeSelectedOutline
 * @function
 */
gb3d.edit.EditingTool3D.prototype.removeSelectedOutline = function() {
	that = this;
	that.highlightObject["three"]["object"] = undefined;
	that.highlightObject["three"]["distance"] = undefined;
	that.selectedObject["three"]["object"] = undefined;
	that.selectedObject["three"]["distance"] = undefined;
	that.clickOutlinePass.selectedObjects = [];
};

/**
 * Object 생성을 위한 사전작업 수행 함수. Feature 정보를 저장하고 Feature type에 따른 모달을 생성한다.
 * 
 * @method gb3d.edit.EditingTool3D#createObjectByCoord
 * @param {string} type - Feature type
 * @param {ol.Feature} feature - Openlayers feature 객체
 * @param {string} treeid - jstree node id
 * @param {string} layer - layer 객체 id
 */
gb3d.edit.EditingTool3D.prototype.createObjectByCoord = function(type, feature, treeid, layer) {
	this.objectAttr.type = type;
	this.objectAttr.coordinate = feature.getGeometry().getCoordinates(true);
	this.objectAttr.extent = feature.getGeometry().getExtent();
	this.objectAttr.id = feature.getId();
	this.objectAttr.feature = feature;
	this.objectAttr.treeid = treeid;
	this.objectAttr.layer = layer;

	switch (type) {
	case "Point":
	case "MultiPoint":
// $("#pointObjectCreateModal").modal();
		this.point3DModal.open();
		break;
	case "LineString":
	case "MultiLineString":
// $("#lineObjectCreateModal").modal();
		this.line3DModal.open();
		break;
	case "Polygon":
	case "MultiPolygon":
// $("#polygonObjectCreateModal").modal();
		this.polygon3DModal.open();
		break;
	default:
		return;
	}
}

/**
 * 설정한 좌표값 위치에 타입에 따른 모델링된 3차원 객체를 생성한다.
 * 
 * @method gb3d.edit.EditingTool3D#createPointObject
 * @param {Array.<number>} arr - 좌표값
 * @param {Array.<number>} extent - minX, minY, maxX, maxY
 * @param {Object} option - 3차원 객체 생성 옵션
 * @param {string} option.type - 생성하려는 3차원 객체 모양(box, cylinder, circle, dodecahedron, icosahedron)
 * @param {string} option.width - 가로 길이
 * @param {string} option.height - 세로 길이
 * @param {string} option.depth - 높이
 * @param {string} option.radiusTop - 원통 윗부분의 지름. cylinder 에서만 사용
 * @param {string} option.radiusBottom - 원통 아랫부분의 지름. cylinder 에서만 사용
 * @param {string} option.radius - 생성하려는 3차원 객체 모양. circle, dodecahedron, icosahedron 에서 사용
 * @param {string} option.width - 생성하려는 3차원 객체 모양
 */
gb3d.edit.EditingTool3D.prototype.createPointObject = function(arr, extent, option) {
	var coord = arr, points = [], geometry, cart, obj3d, x = extent[0] + (extent[2] - extent[0]) / 2, y = extent[1] + (extent[3] - extent[1]) / 2, type = option.type || "box",
	centerCart = Cesium.Cartesian3.fromDegrees(x, y), centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	switch (type) {
	case "box":
		geometry = new THREE.BoxGeometry(parseInt(option.width || 40), parseInt(option.height || 40), parseInt(option.depth || 40));
		break;
	case "cylinder":
		geometry = new THREE.CylinderGeometry(parseInt(option.radiusTop), parseInt(option.radiusBottom), parseInt(option.height));
		break;
	case "circle":
		geometry = new THREE.CircleGeometry(parseInt(option.radius));
		break;
	case "dodecahedron":
		geometry = new THREE.DodecahedronGeometry(parseInt(option.radius));
		break;
	case "icosahedron":
		geometry = new THREE.IcosahedronGeometry(parseInt(option.radius));
		break;
	}

	geometry.vertices.forEach(function(vert, v) {
		if (option.depth) {
			vert.z += option.depth / 2;
		}
	});

	var frontSideMaterial = new THREE.MeshStandardMaterial({
		side : THREE.FrontSide
	});

	var latheMesh = new THREE.Mesh(geometry, frontSideMaterial);
	// latheMesh.scale.set(1, 1, 1);
	latheMesh.position.copy(centerCart);
	latheMesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
	this.getMap().getThreeScene().add(latheMesh);

	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	
	for ( var i in option) {
		if (i === "type") {
			continue;
		}
		latheMesh.userData[i] = option[i];
	}

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [ x, y ],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature,
		"treeid" : this.objectAttr.treeid,
		"layer" : this.objectAttr.layer
	});

	// Map에 ThreeJS 객체 추가
	this.getMap().addThreeObject(obj3d);

	var record = this.getModelRecord();
	record.create(obj3d.getLayer(), obj3d);

	return obj3d;
}

/**
 * 설정한 좌표값에 따른 직육면체의 3차원 객체를 생성한다.
 * 
 * @method gb3d.edit.EditingTool3D#createPolygonObject
 * @param {Array.<number>} arr - 좌표값
 * @param {Array.<number>} extent - minX, minY, maxX, maxY
 * @param {Object} option - 3차원 객체 생성 옵션
 * @param {string} option.depth - 높이
 */
gb3d.edit.EditingTool3D.prototype.createPolygonObject = function(arr, extent, option) {
	var that = this;
	var coord = arr, geometry, shape, cart, result, obj3d, depth = option.depth ? parseFloat(option.depth) : 50.0, x = extent[0] + (extent[2] - extent[0]) / 2, y = extent[1] + (extent[3] - extent[1])
			/ 2, centerCart = Cesium.Cartesian3.fromDegrees(x, y), centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	if (this.objectAttr.type === "MultiPolygon") {
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], [ x, y ], depth);
	} else if (this.objectAttr.type === "Polygon") {
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], [ x, y ], depth);
	} else {
		return;
	}

	geometry = new THREE.Geometry();
	// 이준 시작
	gb3d.Math.createUVVerticeOnPolygon(geometry, result);
	// 이준 끝
	// var bgeometry = new THREE.BufferGeometry();
	// bgeometry.fromGeometry(geometry);
	// console.log(bgeometry);
	var doubleSideMaterial = new THREE.MeshStandardMaterial({
		side : THREE.FrontSide
	});

	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
	latheMesh.position.copy(centerCart);
	console.log(latheMesh.quaternion);
	// 원점을 바라보도록 설정한다
// latheMesh.lookAt(new THREE.Vector3(0, 0, 0));
	latheMesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
	// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
	var quaternion = latheMesh.quaternion.clone();
	// 쿼터니언각을 뒤집는다
	quaternion.inverse();
	// 모든 지오메트리 버텍스에
	var vertices = latheMesh.geometry.vertices;
	for (var i = 0; i < vertices.length; i++) {
		var vertex = vertices[i];
		// 뒤집은 쿼터니언각을 적용한다
		vertex.applyQuaternion(quaternion);
	}

	// var vnh = new THREE.VertexNormalsHelper( latheMesh, 5 );
	// this.getThreeScene().add(vnh);

	// geometry.computeVertexNormals();
	geometry.computeFlatVertexNormals();
	geometry.computeFaceNormals();

	this.getMap().getThreeScene().add(latheMesh);
	geometry.computeBoundingSphere();

	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	latheMesh.userData.depth = depth;

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [ x, y ],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature,
		"treeid" : this.objectAttr.treeid,
		"layer" : this.objectAttr.layer
	});

	this.getMap().addThreeObject(obj3d);

	var record = this.getModelRecord();
	record.create(obj3d.getLayer(), obj3d);

	return obj3d;
}

/**
 * 설정한 좌표값에 따른 LinePolygon 3차원 객체를 생성한다.
 * 
 * @method gb3d.edit.EditingTool3D#createLineStringObjectOnRoad
 * @param {Array.<number>} arr - 좌표값
 * @param {Array.<number>} extent - minX, minY, maxX, maxY
 * @param {Object} option - 3차원 객체 생성 옵션
 * @param {string} option.width - 가로 길이
 * @param {string} option.depth - 높이
 */
gb3d.edit.EditingTool3D.prototype.createLineStringObjectOnRoad = function(arr, extent, option) {
	var that = this;
	var coord = arr, geometry, shape, cart, result, obj3d, depth = option.depth ? parseFloat(option.depth) : 50.0, x = extent[0] + (extent[2] - extent[0]) / 2, y = extent[1] + (extent[3] - extent[1])
			/ 2, centerCart = Cesium.Cartesian3.fromDegrees(x, y), centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	var feature = this.objectAttr.feature.clone();
	if (feature.getGeometry() instanceof ol.geom.LineString) {
		var beforeGeomTest = feature.getGeometry().clone();
		console.log(beforeGeomTest.getCoordinates().length);
		var beforeCoord = beforeGeomTest.getCoordinates();
		result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(beforeCoord, option["width"] / 2, [ x, y ], depth);
	} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {
		var beforeGeomTest = feature.getGeometry().clone();
		console.log(beforeGeomTest.getCoordinates().length);
		var beforeCoord = beforeGeomTest.getCoordinates();
		result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(beforeCoord[0], option["width"] / 2, [ x, y ], depth);
	}

	geometry = new THREE.Geometry();

	// 이준 시작
	gb3d.Math.createUVVerticeOnLineString(geometry, result);
	// 이준 끝

	var doubleSideMaterial = new THREE.MeshStandardMaterial({
		side : THREE.FrontSide
	});

	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
	// latheMesh.scale.set(1, 1, 1);
	latheMesh.position.copy(centerCart);
	// 원점을 바라보도록 설정한다
// latheMesh.lookAt(new THREE.Vector3(0, 0, 0));
	latheMesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
	// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
	var quaternion = latheMesh.quaternion.clone();
	// 쿼터니언각을 뒤집는다
	quaternion.inverse();
	// 모든 지오메트리 버텍스에
	var vertices = latheMesh.geometry.vertices;
	for (var i = 0; i < vertices.length; i++) {
		var vertex = vertices[i];
		// 뒤집은 쿼터니언각을 적용한다
		vertex.applyQuaternion(quaternion);
	}

	// geometry.computeVertexNormals();
	geometry.computeFlatVertexNormals();
	geometry.computeFaceNormals();

	this.getMap().getThreeScene().add(latheMesh);

	geometry.computeBoundingSphere();
	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	latheMesh.userData.depth = depth;

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [ x, y ],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature,
		"treeid" : this.objectAttr.treeid,
		"layer" : this.objectAttr.layer,
		"buffer" : option["width"] / 2
	});

	this.getMap().addThreeObject(obj3d);

	var record = this.getModelRecord();
	record.create(obj3d.getLayer(), obj3d);

	return obj3d;

}

/**
 * 3D 맵 객체를 반환한다.
 * 
 * @method gb3d.edit.EditingTool3D#getMap
 * @return {gb3d.Map} {@link gb3d.Map}
 */
gb3d.edit.EditingTool3D.prototype.getMap = function() {
	return this.map;
}

/**
 * attribute 팝업 객체를 반환한다.
 * 
 * @method gb3d.edit.EditingTool3D#getAttrPopup
 * @return {gb.panel.PanelBase} {@link gb.panel.PanelBase}
 */
gb3d.edit.EditingTool3D.prototype.getAttrPopup = function() {
	return this.attrPop_;
}

/**
 * ThreeJS Object를 선택한다.
 * 
 * @method gb3d.edit.EditingTool3D#selectThree
 * @param {string} uuid - ThreeJS Object ID
 * @return {gb3d.object.ThreeObject} 선택된 ThreeJS Object 반환
 */
gb3d.edit.EditingTool3D.prototype.selectThree = function(uuid){
	var that = this;
	var threeObject = this.getMap().getThreeObjectByUuid(uuid);
	if(!threeObject){
		return false;
	}

	var object = threeObject.getObject();
	this.pickedObject_ = object;
	this.threeTransformControls.attach( object );
	
	// ThreeJS Object 속성창 가시화
	that.updateAttributePopup(object.userData);
	that.attrPop_.open();
	
// this.updateAttributeTab( object );
// this.updateStyleTab( object );

	// 실루엣 생성
	this.applySelectedOutline(object);

	if ( object.userData.object !== undefined ) {
		// helper
		threeEditor.select( object.userData.object );
	} else {
		threeEditor.select( object );
	}

	return threeObject;
}

/**
 * ThreeJS Object와 연동된 Openlayers Feature를 선택한다.
 * 
 * @method gb3d.edit.EditingTool3D#selectFeature
 * @param {string} id - Openlayers Feature ID
 * @return {gb3d.object.ThreeObject} ThreeJS Object 반환
 */
gb3d.edit.EditingTool3D.prototype.selectFeature = function(id){
	var threeObject = this.getMap().getThreeObjectById(id);
	if(!threeObject){
		return false;
	}

	var edit2d = this.getEditingTool2D();
	if(edit2d instanceof gb3d.edit.EditingTool2D){
		if(!edit2d.interaction.select){
			return false;
		}
		edit2d.interaction.select.getFeatures().clear();
		edit2d.interaction.select.getFeatures().push( threeObject.getFeature() );
		return threeObject;
	} else {
		return false;
	}
}

/**
 * Cesium 객체 선택 초기화
 * 
 * @method gb3d.edit.EditingTool3D#unselectCesium
 */
gb3d.edit.EditingTool3D.prototype.unselectCesium = function(){
	var that = this;
	that.silhouetteBlue.selected = [];
	that.silhouetteGreen.selected = [];
	that.getMap().getCesiumViewer().selectedEntity = undefined;
	that.attrPop_.close();
};

/**
 * ThreeJS 객체 선택 취소
 * 
 * @method gb3d.edit.EditingTool3D#unselectThree
 * @param {string} uuid - ThreeJS Object ID
 * @return {gb3d.object.ThreeObject} ThreeJS Object 반환
 */
gb3d.edit.EditingTool3D.prototype.unselectThree = function(uuid){
	var that = this;
	var threeObject = this.getMap().getThreeObjectByUuid(uuid);
	if(!threeObject){
		return false;
	}

	this.pickedObject_ = threeObject.getObject();
	this.threeTransformControls.detach( threeObject.getObject() );
// this.updateAttributeTab( undefined );
// this.updateStyleTab( undefined );
	threeEditor.select( null );
	this.removeSelectedOutline();
	
	that.attrPop_.close();
	
	return threeObject;
}

/**
 * Openlayers Feature 선택 취소
 * 
 * @method gb3d.edit.EditingTool3D#unselectFeature
 * @param {string} id - Openlayers Feature ID
 * @return {gb3d.object.ThreeObject} ThreeJS Object 반환
 */
gb3d.edit.EditingTool3D.prototype.unselectFeature = function(id){
	var threeObject = this.getMap().getThreeObjectById(id);
	if(!threeObject){
		return false;
	}
	var edit2d = this.getEditingTool2D();
	if(edit2d instanceof gb3d.edit.EditingTool2D){
		if(!edit2d.interaction.select){
			return false;
		}
		edit2d.interaction.select.getFeatures().remove( threeObject.getFeature() );
		return threeObject;
	} else {
		return false;
	}
}

/**
 * ThreeJS Object ID 또는 Openlayers Feature ID 를 입력하여 연동된 객체를 선택 상태로 설정한다.
 * 
 * @method gb3d.edit.EditingTool3D#syncSelect
 * @param {string} id - ThreeJS Object ID 또는 Openlayers Feature ID
 */
gb3d.edit.EditingTool3D.prototype.syncSelect = function(id){
	var id = id;

	var threeObject = this.getMap().getThreeObjectById(id);

	if(!threeObject){
		threeObject = this.getMap().getThreeObjectByUuid(id);
		if(!threeObject){
			return;
		}

		this.selectFeature(threeObject.getFeature().getId());
	} else {
		this.selectThree(threeObject.getObject().uuid);
		
		// Openlayers Feature 선택 시 연동된 ThreeJS Object 위치로 3D Map 이동
// this.cesiumViewer.camera.flyTo({
// destination: Cesium.Cartesian3.fromDegrees(threeObject.getCenter()[0],
// threeObject.getCenter()[1],
// this.cesiumViewer.camera.positionCartographic.height),
// duration: 0
// });
	}
}

/**
 * ThreeJS Object ID 또는 Openlayers Feature ID 를 입력하여 연동된 객체를 비선택 상태로 설정한다.
 * 
 * @method gb3d.edit.EditingTool3D#syncUnselect
 * @param {string} id - ThreeJS Object ID 또는 Openlayers Feature ID
 */
gb3d.edit.EditingTool3D.prototype.syncUnselect = function(id){
	var id = id;

	var threeObject = this.getMap().getThreeObjectById(id);

	if(!threeObject){
		threeObject = this.getMap().getThreeObjectByUuid(id);
		if(!threeObject){
			return;
		}
	} else {
		this.unselectThree(threeObject.getObject().uuid);
	}
	if (threeObject) {
		this.unselectFeature(threeObject.getFeature().getId());		
	}
}

/**
 * ThreeJS Object와 연동된 Openlayers Feature를 특정 위치로 이동시킨다.
 * 
 * @method gb3d.edit.EditingTool3D#moveObject2Dfrom3D
 * @param {Array.<number>} center - 이동하려는 위치 좌표값
 * @param {string} uuid - ThreeJS Object ID
 */
gb3d.edit.EditingTool3D.prototype.moveObject2Dfrom3D = function(center, uuid){
	var id = uuid,
	centerCoord = center,
	carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerCoord),
	lon = Cesium.Math.toDegrees(carto.longitude),
	lat = Cesium.Math.toDegrees(carto.latitude),
	threeObject = this.getMap().getThreeObjectByUuid(id),
	geometry = threeObject.getFeature().getGeometry(),
	lastCenter = threeObject.getCenter(),
	deltaX = lon - lastCenter[0],
	deltaY = lat - lastCenter[1];

	geometry.translate(deltaX, deltaY);
	threeObject.setCenter([lon, lat]);
}

/**
 * ThreeJS Object vertices 값으로 Openlayers Feature를 변경한다.
 * 
 * @method gb3d.edit.EditingTool3D#modifyObject2Dfrom3D
 * @param {Array.<Object>} vertices - Openlayers Feature의 변경된 Coordinates 값
 * @param {string} uuid - ThreeJS Object ID
 */
gb3d.edit.EditingTool3D.prototype.modifyObject2Dfrom3D = function(vertices, uuid){
	var v = JSON.parse(JSON.stringify(vertices)),
	id = uuid,
	threeObject = this.getMap().getThreeObjectByUuid(id),
	position = threeObject.getObject().position,
	feature = threeObject.getFeature(),
	geometry = feature.getGeometry();

	var degrees = [];
	var cart, carto, lon, lat;
	for(var i = 0; i < v.length/2; i++){
		v[i].x += position.x;
		v[i].y += position.y;
		v[i].z += position.z;

		cart = new Cesium.Cartesian3(v[i].x, v[i].y, v[i].z);
		carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cart);

		lon = Cesium.Math.toDegrees(carto.longitude);
		lat = Cesium.Math.toDegrees(carto.latitude);

		degrees.push([lon, lat]);
	}
	degrees.push(degrees[0]);
// threeObject.getFeature().getGeometry().setCoordinates(degrees);
}

/**
 * Openlayers Feature Coordinates 값으로 ThreeJS Object를 이동시킨다.
 * 
 * @method gb3d.edit.EditingTool3D#moveObject3Dfrom2D
 * @param {string} id - Openlayers Feature ID
 * @param {Array.<number>} center - Openlayers Feature의 변경된 Center Coordinates 값
 * @param {Array.<number>} coord - Openlayers Feature의 변경된 Coordinates 값
 */
gb3d.edit.EditingTool3D.prototype.moveObject3Dfrom2D = function(id, center, coord){
	var that = this;
	var featureId = id;
	var featureCoord = coord;
	var threeObject = this.getMap().getThreeObjectById(featureId);
	if(!threeObject){
		return;
	}

	var type = threeObject.getType();

	var lastCenter = threeObject.getCenter();
	var position = threeObject.getObject().position;
	var lastCart = Cesium.Cartesian3.fromDegrees(lastCenter[0], lastCenter[1]);
	var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) + Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

	var centerCoord = center;
	var cart = Cesium.Cartesian3.fromDegrees(centerCoord[0], centerCoord[1]);

	var a, b, cp;
	switch(type){
	case "Point":
	case "MultiPoint":
		a = featureCoord;
		b = featureCoord;
		break;
	case "LineString":
		var feature = this.objectAttr.feature.clone();
		if (feature.getGeometry() instanceof ol.geom.LineString) {
			var beforeGeomTest = feature.getGeometry().clone();
			console.log(beforeGeomTest.getCoordinates().length);
			var beforeCoord = beforeGeomTest.getCoordinates();

			var tline = turf.lineString(beforeCoord);

			var tbuffered = turf.buffer(tline, threeObject.getBuffer(), {units : "meters"});
			console.log(tbuffered);
			var gjson = new ol.format.GeoJSON();
			var bfeature = gjson.readFeature(tbuffered);

			featureCoord = bfeature.getGeometry().getCoordinates(true);
		} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {

		}
		a = featureCoord[0][0];
		b = featureCoord[0][1];
		break;
	case "Polygon":
	case "MultiLineString":
		a = featureCoord[0][0];
		b = featureCoord[0][1];
		break;
	case "MultiPolygon":
		a = featureCoord[0][0][0];
		b = featureCoord[0][0][1];
		break;
	default:
		break;
	}

	if( type === "Point" || type === "MultiPoint" ){
		position.copy(new THREE.Vector3(cart.x + vec, cart.y + vec, cart.z + vec));
	} else {
		cp = gb3d.Math.crossProductFromDegrees(a, b, centerCoord);
		position.copy(new THREE.Vector3(cart.x + (cp.u/cp.s)*vec, cart.y + (cp.v/cp.s)*vec, cart.z + (cp.w/cp.s)*vec));
	}

	threeObject.upModCount();
	threeObject.setCenter(centerCoord);
	var record = that.getModelRecord();
	record.update(threeObject.getLayer(), threeObject);
}

/**
 * Openlayers Feature Coordinates 값으로 ThreeJS Object를 이동시킨다.
 * 
 * @method gb3d.edit.EditingTool3D#modify3DVertices
 * @param {Array.<number>} arr - Coordinates
 * @param {string} id - Openlayers Feature ID
 * @param {Array.<number>} extent - MinX, MinY, MaxX, MaxY
 * @param {Object} event
 */
gb3d.edit.EditingTool3D.prototype.modify3DVertices = function(arr, id, extent, event) {
	var that = this;
	var objects = this.getMap().getThreeObjects(),
	evt = event,
	coord = arr,
	featureId = id,
	ext = extent,
	x = ext[0] + (ext[2] - ext[0]) / 2,
	y = ext[1] + (ext[3] - ext[1]) / 2,
	points = [],
	threeObject,
	object = undefined,
	result,
	geometry,
	shape,
	geom,
	cart;

	var threeObject = this.getMap().getThreeObjectById(featureId);
	var isFile = threeObject.getIsFromFile();
	if(!threeObject){
		return;
	}

	var lastCenter = threeObject.getCenter();
	var position = threeObject.getObject().position;
	var lastCart = Cesium.Cartesian3.fromDegrees(lastCenter[0], lastCenter[1]);
// var lastCart = Cesium.Cartesian3.fromDegrees(x, y);
	var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) + Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

	// === 이준 시작 ===
	object = threeObject.getObject();
	if(object === undefined){
		return;
	}
	if(coord.length === 0){
		coord = threeObject.getFeature().getGeometry().getCoordinates(true);
	}
	var opt = object.userData;
	var center = [x, y];
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
	var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

	if (isFile) {
		if (evt.angle_ !== undefined && (evt.angle_ > 0 || evt.angle_ < 0) ) {
			// 회전
			object.rotateZ(evt.angle_);
			console.log(object.scale);
		} else if (evt.ratio_ !== undefined) {
			// 스케일
			object.scale.x = object.scale.x * evt.ratio_;
			object.scale.y = object.scale.y * evt.ratio_;
			object.scale.z = object.scale.z * evt.ratio_;
		}
		return;
	}
	var recursive = function(obj, result){
		if (obj instanceof THREE.Group) {
			var children = obj.children;
			for (var i = 0; i < children.length; i++) {
				result = recursive(children[i], result);
			}
		} else if (obj instanceof THREE.Mesh) {
			result.push(obj);
		}
		return result;
	};
	var meshes = recursive(object, []);
	for (var i = 0; i < meshes.length; i++) {
		geometry = meshes[i].geometry;

		if (opt.type === "MultiPoint" || opt.type === "Point") {
// geometry = new THREE.BoxGeometry(parseInt(opt.width), parseInt(opt.height),
// parseInt(opt.depth));
// geometry.vertices.forEach(function(vert, v){
// vert.z += opt.depth/2;
// });
// object.geometry = geometry;
			
			position.copy(new THREE.Vector3(centerCart.x, centerCart.y, centerCart.z));
			object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));

		} else {
			var a, b, cp;
			if(geometry instanceof THREE.Geometry){
				geometry = new THREE.Geometry();
				if(opt.type === "MultiPolygon"){
					if (!isFile) {
						result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], center, parseFloat(opt.depth));
						gb3d.Math.createUVVerticeOnPolygon(geometry, result);
						a = coord[0][0][0];
						b = coord[0][0][1];
					}
				} else if (opt.type === "Polygon") {
					if (!isFile) {
						result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], center, parseFloat(opt.depth));
						gb3d.Math.createUVVerticeOnPolygon(geometry, result);
						a = coord[0][0];
						b = coord[0][1];
					}
				} else if(opt.type === "MultiLineString"){
					if (!isFile) {
						result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord[0], threeObject.getBuffer(), center, parseFloat(opt.depth));
						gb3d.Math.createUVVerticeOnLineString(geometry, result);
						a = coord[0][0];
						b = coord[0][1];
					}
				} else if(opt.type === "LineString"){
					if (!isFile) {
						result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord, threeObject.getBuffer(), center, parseFloat(opt.depth));
						gb3d.Math.createUVVerticeOnLineString(geometry, result);
						a = coord[0];
						b = coord[1];
					}
				} else {
					return;
				}

// geometry.vertices = result.points;
// geometry.faces = result.faces;
				// geometry.translate(-centerCart.x, -centerCart.y,
				// -centerCart.z);

				object.lookAt(new THREE.Vector3(0,0,0));
// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
				// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
				var quaternion = object.quaternion.clone();
				// 쿼터니언각을 뒤집는다
				quaternion.inverse();
				// 모든 지오메트리 버텍스에
				var vertices = geometry.vertices;
				for (var i = 0; i < vertices.length; i++) {
					var vertex = vertices[i];
					// 뒤집은 쿼터니언각을 적용한다
					vertex.applyQuaternion(quaternion);
				}

				object.geometry = geometry;
				// compute face Normals
				geometry.computeFaceNormals();
			} else if (geometry instanceof THREE.BufferGeometry) {
				if(opt.type === "MultiPolygon"){
					if (!isFile) {
						result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], center, parseFloat(opt.depth));
						a = coord[0][0][0];
						b = coord[0][0][1];
					}
				} else if (opt.type === "Polygon") {
					if (!isFile) {
						result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], center, parseFloat(opt.depth));
						a = coord[0][0];
						b = coord[0][1];
					}
				} else if(opt.type === "MultiLineString"){
					if (!isFile) {
						result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord[0], threeObject.getBuffer(), center, parseFloat(opt.depth));
						a = coord[0];
						b = coord[1];
					}
				} else if(opt.type === "LineString"){
					if (!isFile) {
						result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord, threeObject.getBuffer(), center, parseFloat(opt.depth));
						a = coord[0];
						b = coord[1];
					}
				} else {
					return;
				}

				if (!isFile) {
					geometry = new THREE.Geometry();
					geometry.vertices = result.points;
					geometry.faces = result.faces;
					// geometry.translate(-centerCart.x, -centerCart.y,
					// -centerCart.z);

					object.lookAt(new THREE.Vector3(0,0,0));
// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
					// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
					var quaternion = object.quaternion.clone();
					// 쿼터니언각을 뒤집는다
					quaternion.inverse();
					// 모든 지오메트리 버텍스에
					var vertices = geometry.vertices;
					for (var i = 0; i < vertices.length; i++) {
						var vertex = vertices[i];
						// 뒤집은 쿼터니언각을 적용한다
						vertex.applyQuaternion(quaternion);
					}

					object.geometry = geometry;
					// compute face Normals
					geometry.computeFaceNormals();
				}
			}
			cp = gb3d.Math.crossProductFromDegrees(a, b, center);

// var lastCart = Cesium.Cartesian3.fromDegrees(x, y);
// var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) +
// Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

			position.copy(new THREE.Vector3(centerCart.x + (cp.u/cp.s)*vec, centerCart.y + (cp.v/cp.s)*vec, centerCart.z + (cp.w/cp.s)*vec));
// position.copy(new THREE.Vector3(lastCart.x, lastCart.y, lastCart.z));
// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		}
		// threeObject 수정 횟수 증가, Center 값 재설정
		threeObject.upModCount();
		threeObject.setCenter(center);
		var record = that.getModelRecord();
		record.update(threeObject.getLayer(), threeObject);
	}
	return geom;
};

/**
 * editing tool 2d 를 반환한다.
 * 
 * @method gb3d.edit.EditingTool3D#getEditingTool2D
 * @return {gb3d.edit.EditingTool2D}
 */
gb3d.edit.EditingTool3D.prototype.getEditingTool2D = function() {
	return typeof this.editingTool2D === "function" ? this.editingTool2D() : this.editingTool2D;
};

/**
 * 속성 정보창을 업데이트 한다.
 * 
 * @method gb3d.edit.EditingTool3D#updateAttributePopup
 * @param {Object} userData - ThreeJS Object 속성 정보
 */
gb3d.edit.EditingTool3D.prototype.updateAttributePopup = function(userData) {
	var that = this;
	var td1, td2, tform, tr;
	$(that.attrTB_).empty();
	for ( var i in userData) {
		td1 = $("<td>").text(i);

		tform = $("<input>").addClass("gb-edit-sel-alist").attr({
			"type" : "text"
		}).css({
			"width" : "100%",
			"border" : "none"
		}).val(userData[i]).on("input", function(e) {
			var key = $(this).parent().prev().text();
			var val = $(this).val();
			userData[key] = val;
		});

		td2 = $("<td>").append(tform);

		tr = $("<tr>").append(td1).append(td2);
		that.attrTB_.append(tr);
	}
};

/**
 * 3D 모델 레코드 객체를 반환한다.
 * 
 * @method gb3d.edit.EditingTool3D#getModelRecord
 * @return {gb3d.edit.ModelRecord}
 */
gb3d.edit.EditingTool3D.prototype.getModelRecord = function(){
	return this.modelRecord;
};

/**
 * 3D 모델 레코드 객체를 설정한다.
 * 
 * @method gb3d.edit.EditingTool3D#setModelRecord
 * @param {gb3d.edit.ModelRecord} record - 3D 모델 레코드 객체
 */
gb3d.edit.EditingTool3D.prototype.setModelRecord = function(record){
	this.modelRecord = record;
};

/**
 * 편집을 위한 객체의 obj를 요청한다
 * 
 * @method gb3d.edit.EditingTool3D#getOBJObjectFromB3DM
 * @param {string} fid - 파일 이름
 */
gb3d.edit.EditingTool3D.prototype.getOBJObjectFromB3DM = function(feature){
	var url = this.getOBJURL();
	var param = {
			"fid" : undefined
	};
	
	$.ajax({
		url : url + "&" + jQuery.param(params),
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "auto");
		},
		success : function(data, textStatus, jqXHR) {
			console.log(data);
			$("body").css("cursor", "auto");
			
		}
	}).fail(function(xhr, status, errorThrown) {
		$("body").css("cursor", "auto");
		if (xhr.responseJSON) {
			if (xhr.responseJSON.status) {
// that.errorModal(xhr.responseJSON.status);
				alert(xhr.responseJSON.status);
			}
		} else {
// that.messageModal(that.translation["err"][that.locale], xhr.status + " " +
// xhr.statusText);
			alert(xhr.statusText);
		}
	});
};

/**
 * tileset feature를 선택한다
 * 
 * @method gb3d.edit.EditingTool3D#selectTilesetFeature
 * @param {Cesium.Cesium3DTileFeature} feature - 피처
 */
gb3d.edit.EditingTool3D.prototype.selectTilesetFeature = function(feature){
	var that = this;
	var cviewer = this.map.getCesiumViewer();
	if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(cviewer.scene)) {

			// If a feature was previously selected, undo the highlight
			that.silhouetteGreen.selected = [];

			// Pick a new feature
// var pickedFeature = cviewer.scene.pick(movement.position);
			var pickedFeature = feature;
			if (!Cesium.defined(pickedFeature)) {
				that.clickHandler(movement);
				return;
			}

			// Select the feature if it's not already selected
			if (that.silhouetteGreen.selected[0] === pickedFeature) {
				return;
			}

			// Save the selected feature's original color
			var highlightedFeature = that.silhouetteBlue.selected[0];
			if (pickedFeature === highlightedFeature) {
				that.silhouetteBlue.selected = [];
			}

			// Highlight newly selected feature
			that.silhouetteGreen.selected = [ pickedFeature ];

			// Set feature infobox description
			var propNames = pickedFeature.getPropertyNames();
			cviewer.selectedEntity = that.selectedEntity;
			var obj = {};
			for ( var i in propNames) {
				obj[propNames[i]] = pickedFeature.getProperty(propNames[i]);
			}
			console.log(obj);
			that.updateAttributePopup(obj);
			if (that.getActiveTool()) {
				that.attrPop_.setPositionY(55);
			} else {
				that.attrPop_.setPositionY(5);	
			}
			that.attrPop_.open();
		
	} else {

			// If a feature was previously selected, undo the highlight
			if (Cesium.defined(that.selected.feature)) {
				that.selected.feature.color = that.selected.originalColor;
				that.selected.feature = undefined;
			}
			
			// Pick a new feature
			// var pickedFeature = cviewer.scene.pick(movement.position);
			var pickedFeature = feature;
			if (!Cesium.defined(pickedFeature)) {
				that.clickHandler(movement);
				return;
			}
			// Select the feature if it's not already selected
			if (that.selected.feature === pickedFeature) {
				return;
			}
			that.selected.feature = pickedFeature;
			// Save the selected feature's original color
			if (pickedFeature === highlighted.feature) {
				Cesium.Color.clone(highlighted.originalColor, that.selected.originalColor);
				highlighted.feature = undefined;
			} else {
				Cesium.Color.clone(pickedFeature.color, that.selected.originalColor);
			}
			pickedFeature.color = Cesium.Color.LIME;
			cviewer.selectedEntity = that.selectedEntity;
			
			// Set feature infobox description
			var propNames = pickedFeature.getPropertyNames();
			cviewer.selectedEntity = that.selectedEntity;
			var obj = {};
			for ( var i in propNames) {
				obj[propNames[i]] = pickedFeature.getProperty(propNames[i]);
			}
			console.log(obj);
			that.updateAttributePopup(obj);
			if (that.getActiveTool()) {
				that.attrPop_.setPositionY(55);
			} else {
				that.attrPop_.setPositionY(5);	
			}
			that.attrPop_.open();
	}
}

/**
 * tileset feature를 선택한다
 * 
 * @method gb3d.edit.EditingTool3D#getFeatureByIdFromServer
 * @param {string} server - Server name
 * @param {string} workspace - Workspace name
 * @param {string} fid - 피처 ID
 */
gb3d.edit.EditingTool3D.prototype.getFeatureByIdFromServer = function(server, work, fid){
	var that = this;
	that.parameters2d["serverName"] = server;
	that.parameters2d["workspace"] = work;
	that.parameters2d["featureID"] = fid;
	
	$.ajax({
		url : this.getFeatureURL,
		type : "GET",
		contentType : "application/json; charset=UTF-8",
		data : that.parameters2d,
		dataType : "JSON",
		success : function(data, textStatus, jqXHR) {
			console.log(data);
			var format = new ol.format.GeoJSON().readFeatures(data);
			
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log(errorThrown);
		}
	});
};

/**
 * 3D 객체 편집시 평면도를 업데이트
 * 
 * @method gb3d.edit.EditingTool3D#updateFloorPlan
 * @param {ol.Feature} selectedFeature - selected fearure
 * @param {gb3d.object.ThreeObject} threeObj - 업데이트할 객체
 */
gb3d.edit.EditingTool3D.updateFloorPlan = function(selectedFeature, threeObj) {
	var center = threeObj.getCenter();
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
	var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

	var floor = gb3d.io.ImporterThree.getFloorPlan(threeObj.getObject(), center, []);
	var features = turf.featureCollection(floor);
	var dissolved = undefined;
	try {
		dissolved = turf.dissolve(features);
	} catch (e) {
		// TODO: handle exception
		console.error(e);
		var bbox = turf.bbox(features);
		var bboxPolygon = turf.bboxPolygon(bbox);
		var geom = new ol.geom.Polygon(bboxPolygon.geometry.coordinates, "XY");
		var feature = new ol.Feature(geom);
// layer.getSource().addFeature(feature);
// threeObj["feature"] = feature;
		return;
	}
	var fea;
	if (dissolved) {
		if (dissolved.type === "FeatureCollection") {
			fea = [];
			for (var i = 0; i < dissolved.features.length; i++) {
				if (dissolved.features[i].geometry.type === 'Polygon') {
					if (layer.get("git").geometry === "Polygon") {
						var geom = new ol.geom.Polygon(dissolved.features[i].geometry.coordinates, "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon([ dissolved.features[i].geometry.coordinates ], "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					}
				} else if (dissolved.features[i].geometry.type === 'MultiPolygon') {
					if (layer.get("git").geometry === "Polygon") {
						var outer = dissolved.features[i].geometry.coordinates;
						// for (var j = 0; j < 1; j++) {
						var polygon = outer[0];
						var geomPoly = new ol.geom.Polygon(polygon, "XY");
						var feature = new ol.Feature(geomPoly);
						feature.setId(threeObj.getObject().uuid);
						fea.push(feature);
						threeObj["feature"] = feature;
						// }
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates, "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					}
				}

			}
			layer.getSource().addFeatures(fea);
		}
	}

	// var axisy1 = turf.point([ 90, 0 ]);
	// var pickPoint = turf.point(center);
	// var bearing = bearing = turf.bearing(pickPoint, axisy1);
	// console.log("y축 1과 객체 중점의 각도는: " + bearing);
	// // var zaxis = new THREE.Vector3(0, 0, 1);
	// // gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, zaxis,
	// // Cesium.Math.toRadians(bearing));
	// that.object.rotateZ(Cesium.Math.toRadians(bearing));
};

/**
 * 선택한 b3dm을 glb로 변환하여 편집화면에 불러온다
 * 
 * @method gb3d.edit.EditingTool3D#getGLBfromServer
 */
gb3d.edit.EditingTool3D.prototype.getGLBfromServer = function(layerFeature, tileFeature){
	var that = this;
	var params = {
		"featureId" : layerFeature.getId(),
		"objPath" : undefined
	};
	
	$.ajax({
		url : this.getGLBURL,
		type : "GET",
		contentType : "application/json; charset=UTF-8",
		data : params,
		dataType : "JSON",
		success : function(data, textStatus, jqXHR) {
			console.log(data);
			
		},
		error: function(jqXHR, textStatus, errorThrown){
			console.log(errorThrown);
		}
	});
};