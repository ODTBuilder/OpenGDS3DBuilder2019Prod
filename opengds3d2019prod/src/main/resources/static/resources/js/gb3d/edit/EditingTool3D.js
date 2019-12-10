var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc 3차원 객체 편집 기능을 정의한다. 필수 라이브러리: jQuery, fontawesome, openlayers,
 *            {@link gb3d.edit.EditingToolBase}
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

	// transform 컨트롤 선언
	this.threeTransformControls = new THREE.TransformControls(this.map.threeCamera, this.map.threeRenderer.domElement);
	// 변경시 렌더링 함수 수행
	this.threeTransformControls.addEventListener('change', transformRender);
	// 드래그 시
	this.threeTransformControls.addEventListener('dragging-changed', function(event) {
		that.updateAttributeTab(event.target.object);
	});

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
				// 선택된 객체의 수정횟수를 증가시킨다.
				e.upModCount();
				
				var record = that.getModelRecord();
				record.update(e.getLayer(), undefined, e);
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
		"width" : "300px",
		"positionX" : 5,
		"positionY" : 55,
		"autoOpen" : false,
		"body" : atb
	});

	$(this.attrPop_.getPanel()).find(".gb-panel-body").css({
		"max-height" : "400px",
		"overflow-y" : "auto"
	});

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
		// console.log("왼다운 다운: "+that.isDown+", 드래그: "+that.isDragging);
		console.log(movement);
	}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

	cviewer.screenSpaceEventHandler.setInputAction(function onLeftUp(movement) {
		that.isDown = false;
		// console.log("왼업 다운: "+that.isDown+", 드래그: "+that.isDragging);
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
	var clickHandler = cviewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
				that.isDragging = true;
				// console.log("왼다운 인식 됨 커서이동중 다운: "+that.isDown+", 드래그:
				// "+that.isDragging);
				// console.log(movement);
			}

			if (!that.getActiveTool()) {
				that.threeTransformControls.detach(that.pickedObject_);
				// that.updateAttributeTab(undefined);
				// that.updateStyleTab(undefined);
				// that.updateMaterialTab(undefined);
				that.pickedObject_ = undefined;
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
				that.pickedObject_ = undefined;
				return;
			}

			if (event.ctrlKey) {
				return;
			}

			// If a feature was previously selected, undo the highlight
			that.silhouetteGreen.selected = [];

			// Pick a new feature
			var pickedFeature = cviewer.scene.pick(movement.position);
//			var oneOfThem; 
//			if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
//				oneOfThem = 
//			}
			if (!Cesium.defined(pickedFeature)) {
				clickHandler(movement);
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
//			var featureName = pickedFeature.getProperty('name');
//			that.selectedEntity.name = featureName;
			that.selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
			cviewer.selectedEntity = that.selectedEntity;
			that.selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>';
			for ( var i in propNames) {
				that.selectedEntity.description += '<tr><th>' + propNames[i] + '</th><td>' + pickedFeature.getProperty(propNames[i]) + '</td></tr>';
			}
			that.selectedEntity.description += '</tbody></table>';
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
				that.pickedObject_ = undefined;
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
				that.pickedObject_ = undefined;
				return;
			}

			if (event.ctrlKey) {
				return;
			}

			// If a feature was previously selected, undo the highlight
			if (Cesium.defined(that.selected.feature)) {
				that.selected.feature.color = that.selected.originalColor;
				that.selected.feature = undefined;
			}
			// Pick a new feature
			var pickedFeature = cviewer.scene.pick(movement.position);
			if (!Cesium.defined(pickedFeature)) {
				clickHandler(movement);
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
//	 var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
//	 effectFXAA.uniforms[ 'resolution' ].value.set( 1 /eventDiv[0].clientWidth, 1/ eventDiv[0].clientHeight );
//	 that.map.getThreeComposer().addPass( effectFXAA );

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

	$(document).on("keypress", "#attrAttr input", function(e) {
		if (e.keyCode == 13) {
			var input = $(this);
			var parent = input.parent();

			if (input.prop("type") === "checkbox") {
				return;
			}

			gb3d.edit.EditingTool3D.updateAttributeByInput(parent, that.pickedObject_);
		}
	});

	$(document).on("focusout", "#attrAttr input", function(e) {
		var input = $(this);
		var parent = input.parent();

		if (input.prop("type") === "checkbox") {
			return;
		}

		gb3d.edit.EditingTool3D.updateAttributeByInput(parent, that.pickedObject_);
	});

	$(document).on("change", "#attrAttr input", function(e) {
		var input = $(this);
		var parent = input.parent();

		if (!that.pickedObject_) {
			return;
		}

		if (input.prop("type") === "checkbox") {
			that.pickedObject_[parent.data("key")] = input.prop("checked");
		}
	});

	$(document).on("keypress", "#attrStyle input", function(e) {
		if (e.keyCode == 13) {
			var parent = $(this).parent();

			gb3d.edit.EditingTool3D.updateStyleByInput(parent, that);
		}
	});

	$(document).on("focusout", "#attrStyle input", function(e) {
		var parent = $(this).parent();

		gb3d.edit.EditingTool3D.updateStyleByInput(parent, that);
	});

	// $(document).on("keypress", "#attrMaterial input", function(e){
	// if(e.keyCode == 13){
	// var input = $(this);
	// var parent = input.parent();
	//			
	// if(input.prop("type") === "checkbox"){
	// return;
	// }
	//			
	// gb3d.edit.EditingTool3D.updateMaterialByInput( parent, that );
	// }
	// });
	//	
	// $(document).on("focusout", "#attrMaterial input", function(e){
	// var input = $(this);
	// var parent = input.parent();
	//		
	// if(input.prop("type") === "checkbox"){
	// return;
	// }
	//		
	// gb3d.edit.EditingTool3D.updateMaterialByInput( parent, that);
	// });
	//	
	// $(document).on("change", "#attrMaterial input", function(e){
	// var input = $(this);
	// var parent = input.parent();
	//		
	// if(!that.pickedObject_){
	// return;
	// }
	//		
	// if(input.prop("type") === "checkbox"){
	// that.pickedObject_.material[parent.data("key")] = input.prop("checked");
	// }
	// });

	$(document).on("change.spectrum", "#styleColor", function(e, color) {
		var rgb = color.toPercentageRgb();
		var r = parseFloat(rgb.r) / 100.0;
		var g = parseFloat(rgb.g) / 100.0;
		var b = parseFloat(rgb.b) / 100.0;

		if (!that.pickedObject_) {
			return;
		}

		var material = that.pickedObject_.material;
		material.color.setRGB(r, g, b);
	});

	$(document).on("change.spectrum", "#textureEmissive", function(e, color) {
		var rgb = color.toPercentageRgb();
		var r = parseFloat(rgb.r) / 100.0;
		var g = parseFloat(rgb.g) / 100.0;
		var b = parseFloat(rgb.b) / 100.0;

		if (!that.pickedObject_) {
			return;
		}

		var material = that.pickedObject_.material;
		material.emissive.setRGB(r, g, b);
	});
}
gb3d.edit.EditingTool3D.prototype = Object.create(gb3d.edit.EditingToolBase.prototype);
gb3d.edit.EditingTool3D.prototype.constructor = gb3d.edit.EditingTool3D;

gb3d.edit.EditingTool3D.updateAttributeByInput = function(row, object) {
	var row = row;
	var pickedObject = object;
	var inputs = row.find("input");
	var x, y, z;

	if (!pickedObject) {
		return;
	}

	if (inputs.length === 0) {
		pickedObject[row.data("key")] = $(inputs[0]).val();
	} else if (inputs.length === 3) {
		x = $(inputs[0]).val();
		y = $(inputs[1]).val();
		z = $(inputs[2]).val();

		if (row.data("key") === "scale") {
			x = (x == 0 ? 1 : x);
			y = (y == 0 ? 1 : y);
			z = (z == 0 ? 1 : z);
		}

		pickedObject[row.data("key")].x = parseFloat(x);
		pickedObject[row.data("key")].y = parseFloat(y);
		pickedObject[row.data("key")].z = parseFloat(z);
	}
}

gb3d.edit.EditingTool3D.updateStyleByInput = function(row, obj) {
	if (!obj) {
		return;
	}
	var row = row;
	var pickedObject = obj ? obj.pickedObject_ : undefined;
	var input = row.find("input");

	if (!pickedObject) {
		return;
	}

	var threeObject = obj.getMap().getThreeObjectByUuid(pickedObject.uuid);
	if (!threeObject) {
		return;
	}

	if (!row.data("key")) {
		return;
	}

	pickedObject.userData[row.data("key")] = $(input[0]).val();
	this.modify3DVertices([], threeObject.getFeature().getId(), threeObject.getFeature().getGeometry().getExtent());
}

gb3d.edit.EditingTool3D.updateMaterialByInput = function(row, obj) {
	if (!obj) {
		return;
	}

	var row = row;
	var pickedObject = obj ? obj.pickedObject_ : undefined;
	var input = row.find("input");

	if (!pickedObject) {
		return;
	}

	var threeObject = this.getMap().getThreeObjectByUuid(pickedObject.uuid);
	if (!threeObject) {
		return;
	}

	if (!row.data("key")) {
		return;
	}

	pickedObject.material[row.data("key")] = parseFloat($(input[0]).val());
}

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
	} else {
		this.editToolOpen();
	}
}

/**
 * Attribute Tab의 내용을 갱신 # 사용되지않는 함수
 * 
 * @method gb3d.edit.EditingTool3D#updateAttributeTab
 * @param {THREE.Object3D}
 *            object - ThreeJS Object3D 객체
 * @function
 */
gb3d.edit.EditingTool3D.prototype.updateAttributeTab = function(object) {
	var rows = $("#attrAttr").find(".gb-object-row");
	var inputs;

	if (!(object instanceof THREE.Object3D)) {
		rows.each(function() {
			$(this).find("input").val("");
		});
		return;
	}

	var attrs = {
			position : object.position,
			scale : object.scale,
			rotation : object.rotation,
			userData : object.userData,
			name : object.name,
			uuid : object.uuid,
			visible : object.visible
	}

	for (var i = 0; i < rows.length; i++) {
		inputs = $(rows[i]).find("input");
		switch ($(rows[i]).data("key")) {
		case "position":
		case "scale":
		case "rotation":
			$(inputs[0]).val(attrs[$(rows[i]).data("key")].x);
			$(inputs[1]).val(attrs[$(rows[i]).data("key")].y);
			$(inputs[2]).val(attrs[$(rows[i]).data("key")].z);
			break;
		case "name":
		case "uuid":
			$(inputs[0]).val(attrs[$(rows[i]).data("key")]);
			break;
		case "visible":
			$(inputs[0]).prop("checked", attrs.visible)
			break;
		}
	}
}

/**
 * Style Tab의 내용을 갱신 # 사용되지않는 함수
 * 
 * @method gb3d.edit.EditingTool3D#updateStyleTab
 * @param {THREE.Object3D}
 *            object - ThreeJS Object3D 객체
 * @function
 */
gb3d.edit.EditingTool3D.prototype.updateStyleTab = function(object) {
	var that = this;
	var tab = $("#attrStyle");
	var rows = tab.find(".gb-object-row");
	var row, span, input;

	if (!(object instanceof THREE.Object3D)) {
		tab.empty();
		return;
	}

	var userData = object.userData;
	var material = object.material;

	tab.empty();
	for ( var key in userData) {
		span = $("<span class='Text'>").text(key);
		input = $("<input class='form-control' style='flex: 1;'>").val(userData[key]);
		row = $("<div class='gb-object-row'>").append(span).append(input);
		row.data("key", key);
		tab.append(row);

		if (key == "type") {
			input.attr("disabled", true);
		}
	}

	span = $("<span class='Text'>").text("Color");
	input = $("<input id='styleColor' class='form-control' style='flex: 1;'>");
	row = $("<div class='gb-object-row'>").append(span).append(input);
	row.data("key", "color");

	tab.append(row);
	input.spectrum({
		color : "#" + material.color.getHexString()
	});
}

/**
 * Material Tab의 내용을 갱신 # 사용되지않는 함수
 * 
 * @method gb3d.edit.EditingTool3D#updateMaterialTab
 * @param {THREE.Object3D}
 *            object - ThreeJS Object3D 객체
 * @function
 */
gb3d.edit.EditingTool3D.prototype.updateMaterialTab = function(object) {
	var that = this;
	var tab = $("#attrMaterial");
	var rows = tab.find(".gb-object-row");
	var row, span, input, texture;

	if (!(object instanceof THREE.Object3D)) {
		tab.empty();
		return;
	}

	var material = object.material;
	var opts = this.materialOptions;
	var val;

	tab.empty();
	for (var i = 0; i < opts.length; i++) {
		val = material[opts[i]];
		span = undefined;
		input = undefined;
		texture = undefined;

		span = $("<span class='Text'>").text(opts[i]);
		if (val instanceof THREE.Color) {
			input = $("<input id='textureEmissive' class='form-control' style='flex: 1;'>");
		} else if (typeof val === "boolean") {
			input = $("<input class='Checkbox' type='checkbox'>").prop("checked", val);
		} else if (typeof val === "number") {
			input = $("<input class='form-control' style='flex: 1;'>").val(val);
		} else if (opts[i].match(/map/gi) !== null) {
			texture = new gb3d.UI.Texture(object, opts[i]);
		} else {
			continue;
		}

		if (texture !== undefined) {
			row = $("<div class='gb-object-row'>").append(span).append(texture.span);
		} else {
			row = $("<div class='gb-object-row'>").append(span).append(input);
		}

		row.data("key", opts[i]);
		tab.append(row);

		if (val instanceof THREE.Color) {
			input.spectrum({
				color : "#" + val.getHexString()
			});
		}
	}
}

/**
 * ThreeJS Object3D 객체의 Center를 지구 표면상에 위치시킨다.
 * 
 * @method gb3d.edit.EditingTool3D#attachObjectToGround
 * @param {THREE.Object3D}
 *            object - ThreeJS Object3D 객체
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
 * @param {String}
 *            type - Feature type
 * @param {Array.
 *            <Number> | Array.<Array.<Number>>} arr - Polygon or Point
 *            feature coordinates
 * @param {Array.
 *            <Number>} extent - Extent
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

gb3d.edit.EditingTool3D.prototype.createPointObject = function(arr, extent, option) {
	var coord = arr, points = [], geometry, cart, obj3d, x = extent[0] + (extent[2] - extent[0]) / 2, y = extent[1] + (extent[3] - extent[1]) / 2, type = option.type || "box",
	// width = option.width || 40,
	// height = option.height || 40,
	// depth = option.depth || 40,
	centerCart = Cesium.Cartesian3.fromDegrees(x, y), centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	// geometry = new THREE.BoxGeometry(parseInt(width), parseInt(height),
	// parseInt(depth));

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
	// latheMesh.userData.width = width;
	// latheMesh.userData.height = height;
	// latheMesh.userData.depth = depth;
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

	this.getMap().addThreeObject(obj3d);

	var record = this.getModelRecord();
	record.create(obj3d.getLayer(), undefined, obj3d);

	return obj3d;
}

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
	record.create(obj3d.getLayer(), undefined, obj3d);

	return obj3d;
}

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
	record.create(obj3d.getLayer(), undefined, obj3d);

	return obj3d;

}
/**
 * 3D 맵 객체를 반환한다.
 */
gb3d.edit.EditingTool3D.prototype.getMap = function() {
	return this.map;
}

/**
 * attribute 팝업 객체를 반환한다.
 */
gb3d.edit.EditingTool3D.prototype.getAttrPopup = function() {
	return this.attrPop_;
}

gb3d.edit.EditingTool3D.prototype.selectThree = function(uuid){
	var that = this;
	var threeObject = this.getMap().getThreeObjectByUuid(uuid);
	if(!threeObject){
		return false;
	}

	var object = threeObject.getObject();
	this.pickedObject_ = object;
	this.threeTransformControls.attach( object );
	
	that.updateAttributePopup(object.userData);
	that.attrPop_.open();
	
// this.updateAttributeTab( object );
// this.updateStyleTab( object );

	this.applySelectedOutline(object);

	if ( object.userData.object !== undefined ) {
		// helper
		threeEditor.select( object.userData.object );
	} else {
		threeEditor.select( object );
	}

	return threeObject;
}

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
// this.cesiumViewer.camera.flyTo({
// destination: Cesium.Cartesian3.fromDegrees(threeObject.getCenter()[0],
// threeObject.getCenter()[1],
// this.cesiumViewer.camera.positionCartographic.height),
// duration: 0
// });
	}
}

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
	record.update(threeObject.getLayer(), undefined, threeObject);
}

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
//			geometry = new THREE.BoxGeometry(parseInt(opt.width), parseInt(opt.height), parseInt(opt.depth));
//			geometry.vertices.forEach(function(vert, v){
//				vert.z += opt.depth/2;
//			});
//			object.geometry = geometry;
			
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
		record.update(threeObject.getLayer(), undefined, threeObject);
	}
	return geom;
};

/**
 * editing tool 2d 를 반환한다.
 */
gb3d.edit.EditingTool3D.prototype.getEditingTool2D = function() {
	return typeof this.editingTool2D === "function" ? this.editingTool2D() : this.editingTool2D;
};

/**
 * 속성 정보창을 업데이트 한다.
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
 * @param {gb3d.edit.ModelRecord}
 *            record - 3D 모델 레코드 객체
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
//				that.errorModal(xhr.responseJSON.status);
				alert(xhr.responseJSON.status);
			}
		} else {
//			that.messageModal(that.translation["err"][that.locale], xhr.status + " " + xhr.statusText);
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
//			var pickedFeature = cviewer.scene.pick(movement.position);
			var pickedFeature = feature;
//			var oneOfThem; 
//			if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
//				oneOfThem = 
//			}
			if (!Cesium.defined(pickedFeature)) {
				clickHandler(movement);
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
			var featureName = pickedFeature.getProperty('name');
			that.selectedEntity.name = featureName;
			that.selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
			cviewer.selectedEntity = that.selectedEntity;
			that.selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>';
			for ( var i in propNames) {
				that.selectedEntity.description += '<tr><th>' + propNames[i] + '</th><td>' + pickedFeature.getProperty(propNames[i]) + '</td></tr>';
			}
			that.selectedEntity.description += '</tbody></table>';
		
	} else {

			// If a feature was previously selected, undo the highlight
			if (Cesium.defined(that.selected.feature)) {
				that.selected.feature.color = that.selected.originalColor;
				that.selected.feature = undefined;
			}
			
			// Pick a new feature
			//var pickedFeature = cviewer.scene.pick(movement.position);
			var pickedFeature = feature;
			if (!Cesium.defined(pickedFeature)) {
				clickHandler(movement);
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
			
	}
}