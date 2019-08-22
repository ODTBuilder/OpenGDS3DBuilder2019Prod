var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc
 * 3차원 객체 편집 기능을 정의한다.
 * 필수 라이브러리: jQuery, fontawesome, openlayers, {@link gb3d.edit.EditingToolBase}
 */

gb3d.edit.EditingTool3D = function(obj) {
	var that = this;
	gb3d.edit.EditingToolBase.call(this, obj);
	
	// EditingTool3D 작업 표시줄 기본 항목
	var defaultList = [
		{
			content: "Move(W key)",
			icon: "fas fa-arrows-alt fa-lg",
			clickEvent: function(){
				that.threeTransformControls.setMode( "translate" );
			},
			color: ""
		},
		{
			content: "Scale(E key)",
			icon: "fas fa-expand fa-lg",
			clickEvent: function(){
				that.threeTransformControls.setMode( "scale" );
			},
			color: ""
		},
		{
			content: "Rotate(R key)",
			icon: "fas fa-sync-alt fa-lg",
			clickEvent: function(){
				that.threeTransformControls.setMode( "rotate" );
			},
			color: ""
		},
		{
			content: "delete",
			icon: "fas fa-eraser fa-lg",
			clickEvent: function(){
				console.log("remove");
			},
			color: ""
		},
		{
			content: "Attach",
			icon: "fas fa-arrow-down fa-lg",
			clickEvent: function(){
				that.attachObjectToGround( that.pickedObject_ );
			},
			color: ""
		}
	];

	// header element 생성
	this.createContent(defaultList);
	this.closeTool();
	this.headerTag.css({"width": "80%"});
	
	var options = obj ? obj : {};
	this.map = options.map ? options.map : undefined;
	if(!(this.map instanceof gb3d.Map)){
		console.error("gb3d.edit.EditingTool3D: 'map' is required option");
	} else {
		this.map.tools.edit3d = this;
	}
	this.materialOptions = options.materialOptions || [
		"metalness", "roughness", "emissive", 
		"skinning", "wireframe", "map", "normalMap",
		"emissiveMap", "opacity", "alphaTest"];
	
	function transformRender(){
		that.map.renderThreeObj();
	}
	
	// transform 컨트롤 선언
	this.threeTransformControls = new THREE.TransformControls(this.map.threeCamera, this.map.threeRenderer.domElement);
	// 변경시 렌더링 함수 수행
	this.threeTransformControls.addEventListener('change', transformRender);
	// 드래그 시
	this.threeTransformControls.addEventListener('dragging-changed', function(event){
		that.updateAttributeTab(event.target.object);
	});
	
	this.threeTransformControls.addEventListener('objectChange', function(e){
		var object = e.target.object,
			mode = that.threeTransformControls.getMode();
		
		if(object.geometry instanceof THREE.BufferGeometry){
			return;
		}
		
		switch(mode){
			case "scale":
				that.map.modifyObject2Dfrom3D(object.geometry.vertices, object.uuid);
				break;
			case "rotate":
				break;
			case "translate":
				that.map.moveObject2Dfrom3D(object.position, object.uuid);
				break;
			default:
		}
		
		that.map.getThreeObjects().forEach(function(e){
			if(e.getObject().uuid === object.uuid){
				// 선택된 객체의 수정횟수를 증가시킨다.
				e.upModCount();
			}
		});
	});
	
	// transform 컨트롤 Three Scene에 추가
	this.map.threeScene.add(this.threeTransformControls);
	this.threeTransformControls.setSpace("local");
	
	var eventDiv = $(".gb3d-map-bind3d-area");
	var threeEventDiv = $(".gb3d-map-three-area");
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	this.pickedObject_ = undefined,
		pickedObjectColor = undefined;
	
	function onDocumentMouseClick(event){
		if(!that.getActiveTool()){
			that.threeTransformControls.detach( that.pickedObject_ );
			that.updateAttributeTab(undefined);
			that.updateStyleTab(undefined);
			that.updateMaterialTab(undefined);
			that.pickedObject_ = undefined;
			return;
		}
		
		if(event.ctrlKey){
			return;
		}
		
		event.preventDefault();
		// mouse 클릭 이벤트 영역 좌표 추출. 영역내에서의 좌표값을 추출해야하므로 offset 인자를 사용한다.
		mouse.x = ( event.offsetX / eventDiv[0].clientWidth ) * 2 - 1;
		mouse.y = ( event.offsetY / eventDiv[0].clientHeight ) * -2 + 1;
		
		var interObjs = [];
		var objects = that.map.getThreeObjects();
		for(var i = 0; i < objects.length; i++){
			interObjs.push(objects[i].getObject());
		}
		raycaster.setFromCamera( mouse, that.map.threeCamera );
		var intersects = raycaster.intersectObjects( interObjs, true );
		
		if( that.pickedObject_ ){
			// 이전에 선택된 객체 초기화
			that.threeTransformControls.detach( that.pickedObject_ );
			that.map.syncUnselect( that.pickedObject_.uuid );
			that.updateAttributeTab(undefined);
			that.updateStyleTab(undefined);
			that.updateMaterialTab(undefined);
			that.pickedObject_ = undefined;
		}
		
		if ( intersects.length > 0 ) {
			// 새로 선택된 객체 TransformControl에 추가 및 수정 횟수 증가
			var object = intersects[ 0 ].object;
			that.pickedObject_ = object;
			that.threeTransformControls.attach( object );
			
			that.map.syncSelect(object.uuid);
			that.updateAttributeTab(object);
			that.updateStyleTab(object);
			that.updateMaterialTab(object);
		}
	}
	
	// ============ Event ==============
	eventDiv.on("click", onDocumentMouseClick);
	
	$(document).on("keydown", function(e){
		if(e.ctrlKey){
			// Ctrl key 입력 시 기본 3차원 렌더링 함수를 비활성화하고 ThreeJS DIV의 마우스 이벤트를 활성화시킨다.
			cancelAnimationFrame(that.map.requestFrame);
			threeEventDiv.css("pointer-events", "auto");
		}
		
		switch ( event.keyCode ) {
			case 81: // Q
				that.threeTransformControls.setSpace( that.threeTransformControls.space === "local" ? "world" : "local" );
				break;
			case 18: // Alt
				that.threeTransformControls.setTranslationSnap( 100 );
				that.threeTransformControls.setRotationSnap( THREE.Math.degToRad( 15 ) );
				break;
			case 87: // W
				that.threeTransformControls.setMode( "translate" );
				break;
			case 69: // E
				that.threeTransformControls.setMode( "scale" );
				break;
			case 82: // R
				that.threeTransformControls.setMode( "rotate" );
				break;
			case 187:
			case 107: // +, =, num+
				that.threeTransformControls.setSize( that.threeTransformControls.size + 0.1 );
				break;
			case 189:
			case 109: // -, _, num-
				that.threeTransformControls.setSize( Math.max( that.threeTransformControls.size - 0.1, 0.1 ) );
				break;
			case 88: // X
				that.threeTransformControls.showX = ! that.threeTransformControls.showX;
				break;
			case 89: // Y
				that.threeTransformControls.showY = ! that.threeTransformControls.showY;
				break;
			case 90: // Z
				that.threeTransformControls.showZ = ! that.threeTransformControls.showZ;
				break;e
			case 32: // Spacebar
				that.threeTransformControls.enabled = ! that.threeTransformControls.enabled;
				break;
		}
	});
	
	$(document).on("keyup", function(e){
		if(e.which === 17){
			// Ctrl key up 이벤트 발생 시 TransformControl와 ThreeJS DIV의 마우스 이벤트를 비활성화하고 기본 3차원 렌더링 함수를 다시 활성화한다.
			if(that.pickedObject_){
//				that.threeTransformControls.detach( pickedObject );
//				that.updateAttributeTab(undefined);
//				pickedObject = undefined;
			}
			// 기본 3차원 렌더링 함수 실행
			that.map.loop_();
			threeEventDiv.css("pointer-events", "none");
		}
	});
	
	$(document).on("keypress", "#attrAttr input", function(e){
		if(e.keyCode == 13){
			var input = $(this);
			var parent = input.parent();
			
			if(input.prop("type") === "checkbox"){
				return;
			}
			
			gb3d.edit.EditingTool3D.updateAttributeByInput( parent, that.pickedObject_ );
		}
	});
	
	$(document).on("focusout", "#attrAttr input", function(e){
		var input = $(this);
		var parent = input.parent();
		
		if(input.prop("type") === "checkbox"){
			return;
		}
		
		gb3d.edit.EditingTool3D.updateAttributeByInput( parent, that.pickedObject_ );
	});
	
	$(document).on("change", "#attrAttr input", function(e){
		var input = $(this);
		var parent = input.parent();
		
		if(!that.pickedObject_){
			return;
		}
		
		if(input.prop("type") === "checkbox"){
			that.pickedObject_[parent.data("key")] = input.prop("checked");
		}
	});
	
	$(document).on("keypress", "#attrStyle input", function(e){
		if(e.keyCode == 13){
			var parent = $(this).parent();
			
			gb3d.edit.EditingTool3D.updateStyleByInput( parent, that );
		}
	});
	
	$(document).on("focusout", "#attrStyle input", function(e){
		var parent = $(this).parent();
		
		gb3d.edit.EditingTool3D.updateStyleByInput( parent, that);
	});
	
	$(document).on("keypress", "#attrMaterial input", function(e){
		if(e.keyCode == 13){
			var input = $(this);
			var parent = input.parent();
			
			if(input.prop("type") === "checkbox"){
				return;
			}
			
			gb3d.edit.EditingTool3D.updateMaterialByInput( parent, that );
		}
	});
	
	$(document).on("focusout", "#attrMaterial input", function(e){
		var input = $(this);
		var parent = input.parent();
		
		if(input.prop("type") === "checkbox"){
			return;
		}
		
		gb3d.edit.EditingTool3D.updateMaterialByInput( parent, that);
	});
	
	$(document).on("change", "#attrMaterial input", function(e){
		var input = $(this);
		var parent = input.parent();
		
		if(!that.pickedObject_){
			return;
		}
		
		if(input.prop("type") === "checkbox"){
			that.pickedObject_.material[parent.data("key")] = input.prop("checked");
		}
	});
	
	$(document).on("change.spectrum", "#styleColor", function(e, color){
		var rgb = color.toPercentageRgb();
		var r = parseFloat(rgb.r)/100.0;
		var g = parseFloat(rgb.g)/100.0;
		var b = parseFloat(rgb.b)/100.0;
		
		if(!that.pickedObject_){
			return;
		}
		
		var material = that.pickedObject_.material;
		material.color.setRGB(r, g, b);
	});
	
	$(document).on("change.spectrum", "#textureEmissive", function(e, color){
		var rgb = color.toPercentageRgb();
		var r = parseFloat(rgb.r)/100.0;
		var g = parseFloat(rgb.g)/100.0;
		var b = parseFloat(rgb.b)/100.0;
		
		if(!that.pickedObject_){
			return;
		}
		
		var material = that.pickedObject_.material;
		material.emissive.setRGB(r, g, b);
	});
}
gb3d.edit.EditingTool3D.prototype = Object.create(gb3d.edit.EditingToolBase.prototype);
gb3d.edit.EditingTool3D.prototype.constructor = gb3d.edit.EditingTool3D;

gb3d.edit.EditingTool3D.updateAttributeByInput = function( row, object ){
	var row = row;
	var pickedObject = object;
	var inputs = row.find("input");
	var x, y, z;
	
	if(!pickedObject){
		return;
	}
	
	if(inputs.length === 0){
		pickedObject[row.data("key")] = $(inputs[0]).val();
	} else if(inputs.length === 3){
		x = $(inputs[0]).val();
		y = $(inputs[1]).val();
		z = $(inputs[2]).val();
		
		if(row.data("key") === "scale"){
			x = (x == 0 ? 1 : x);
			y = (y == 0 ? 1 : y);
			z = (z == 0 ? 1 : z);
		}
		
		pickedObject[row.data("key")].x = parseFloat(x);
		pickedObject[row.data("key")].y = parseFloat(y);
		pickedObject[row.data("key")].z = parseFloat(z);
	}
}

gb3d.edit.EditingTool3D.updateStyleByInput = function( row, obj ){
	if(!obj){
		return;
	}
	
	var row = row;
	var pickedObject = obj? obj.pickedObject_ : undefined;
	var input = row.find("input");
	
	if(!pickedObject){
		return;
	}
	
	var threeObject = obj.map.getThreeObjectByUuid(pickedObject.uuid);
	if(!threeObject){
		return;
	}
	
	if(!row.data("key")){
		return;
	}
	
	pickedObject.userData[row.data("key")] = $(input[0]).val();
	obj.map.modify3DVertices([], threeObject.getFeature().getId(), threeObject.getFeature().getGeometry().getExtent());
}

gb3d.edit.EditingTool3D.updateMaterialByInput = function( row, obj ){
	if(!obj){
		return;
	}
	
	var row = row;
	var pickedObject = obj? obj.pickedObject_ : undefined;
	var input = row.find("input");
	
	if(!pickedObject){
		return;
	}
	
	var threeObject = obj.map.getThreeObjectByUuid(pickedObject.uuid);
	if(!threeObject){
		return;
	}
	
	if(!row.data("key")){
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
gb3d.edit.EditingTool3D.prototype.editToolClose = function(){
	this.setActiveTool(false);
}

/**
 * EditingTool 작업표시줄을 표시한다.
 * 
 * @method gb3d.edit.EditingTool3D#editToolOpen
 * @function
 */
gb3d.edit.EditingTool3D.prototype.editToolOpen = function(){
	this.setActiveTool(true);
}

/**
 * EditingTool 작업표시줄 토글
 * @method gb3d.edit.EditingTool3D#editToolToggle
 * @function
 */
gb3d.edit.EditingTool3D.prototype.editToolToggle = function(){
	if(this.getActiveTool()){
		this.editToolClose();
	} else {
		this.editToolOpen();
	}
}

gb3d.edit.EditingTool3D.prototype.updateAttributeTab = function(object){
	var rows = $("#attrAttr").find(".gb-object-row");
	var inputs;
	
	if(!(object instanceof THREE.Object3D)){
		rows.each(function(){
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
	
	for(var i = 0; i < rows.length; i++){
		inputs = $(rows[i]).find("input");
		switch($(rows[i]).data("key")){
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

gb3d.edit.EditingTool3D.prototype.updateStyleTab = function(object){
	var that = this;
	var tab = $("#attrStyle");
	var rows = tab.find(".gb-object-row");
	var row, span, input;
	
	if(!(object instanceof THREE.Object3D)){
		tab.empty();
		return;
	}
	
	var userData = object.userData;
	var material = object.material;
	
	tab.empty();
	for(var key in userData){
		span = $("<span class='Text'>").text(key);
		input = $("<input class='form-control' style='flex: 1;'>").val(userData[key]);
		row = $("<div class='gb-object-row'>").append(span).append(input);
		row.data("key", key);
		tab.append(row);
		
		if(key == "type"){
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

gb3d.edit.EditingTool3D.prototype.updateMaterialTab = function(object){
	var that = this;
	var tab = $("#attrMaterial");
	var rows = tab.find(".gb-object-row");
	var row, span, input, texture;
	
	if(!(object instanceof THREE.Object3D)){
		tab.empty();
		return;
	}
	
	var material = object.material;
	var opts = this.materialOptions;
	var val;
	
	tab.empty();
	for(var i = 0; i < opts.length; i++){
		val = material[opts[i]];
		span = undefined;
		input = undefined;
		texture = undefined;
		
		span = $("<span class='Text'>").text(opts[i]);
		if(val instanceof THREE.Color){
			input = $("<input id='textureEmissive' class='form-control' style='flex: 1;'>");
		} else if(typeof val === "boolean"){
			input = $("<input class='Checkbox' type='checkbox'>").prop("checked", val);
		} else if(typeof val === "number"){
			input = $("<input class='form-control' style='flex: 1;'>").val(val);
		} else if(opts[i].match(/map/gi) !== null){
			texture = new gb3d.UI.Texture( object, opts[i] );
		} else {
			continue;
		}
		
		if(texture !== undefined){
			row = $("<div class='gb-object-row'>").append(span).append(texture.span);
		} else {
			row = $("<div class='gb-object-row'>").append(span).append(input);
		}
		
		row.data("key", opts[i]);
		tab.append(row);
		
		if(val instanceof THREE.Color){
			input.spectrum({
				color : "#" + val.getHexString()
			});
		}
	}
}

gb3d.edit.EditingTool3D.prototype.attachObjectToGround = function(object){
	if(!object){
		return;
	}
	
	var obj = object,
		threeObject = this.map.getThreeObjectByUuid(obj.uuid),
		extent = threeObject.getExtent(),
		x = extent[0] + (extent[2] - extent[0]) / 2,
		y = extent[1] + (extent[3] - extent[1]) / 2,
		centerCart = Cesium.Cartesian3.fromDegrees(x, y);
	
	obj.position.copy(centerCart);
}