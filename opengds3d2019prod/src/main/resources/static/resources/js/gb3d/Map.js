/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
/**
 * @classdesc Map 객체를 정의한다.
 * 
 * @class gb3d.Map
 * @memberof gb3d
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {HTMLElement}
 *            obj.target2d - 지도 영역이 될 Div의 HTMLElement
 * @author SOYIJUN
 */
gb3d.Map = function(obj) {

	var that = this;
	var options = obj ? obj : {};

	// 3d 객체 정보
	this.objectAttr = {
		coordinate: [],
		extent: []
	};
	// 2d 지도 영역 엘리먼트
	this.target2d = undefined;
	// 3d 지도 영역 엘리먼트
	this.target3d = undefined;
	// cesium 영역 엘리먼트
	this.cesiumElem = $("<div>").addClass("gb3d-map-cesium-area")[0];
	// three 영역 엘리먼트
	this.threeElem = $("<div>").addClass("gb3d-map-three-area")[0];
	// cesium, three 묶을 영역
	this.bind3dElem = $("<div>").addClass("gb3d-map-bind3d-area")[0];
	
	// 2d 지도 영역으로 설정할 부분이 div 객체인지 확인
	if ($(options.target2d).is("div")) {
		// 2d 지도 영역 엘리먼트 저장
		this.target2d = $(options.target2d)[0];
	} else {
		console.error("target must be div element");
		return;
	}

	// gbMap 선언
	this.gbMap = new gb.Map({
		"target" : $(this.target2d)[0],
		"upperMap" : {
			"controls" : [],
			"layers" : []
		},
		"lowerMap" : {
			"controls" : [],
			"layers" : []
		}
	});

	// 3d 지도 영역으로 설정할 부분이 div 객체인지 확인
	if ($(options.target3d).is("div")) {
		// 3d 지도 영역 엘리먼트 저장
		this.target3d = $(options.target3d)[0];
		// cesium, three 묶을 영역 생성
		$(this.target3d).append(this.bind3dElem);
		// cesium 영역 생성
		$(this.bind3dElem).append(this.cesiumElem);
		// three 영역 생성
		$(this.bind3dElem).append(this.threeElem);
	} else {
		console.error("target must be div element");
		return;
	}
	// cesium 선언
	this.cesiumViewer = new Cesium.Viewer(this.cesiumElem, {
// useDefaultRenderLoop : false,
		selectionIndicator : false,
		homeButton : false,
		sceneModePicker : true,
		infoBox : false,
		navigationHelpButton : false,
		navigationInstructionsInitiallyVisible : false,
		animation : false,
		timeline : false,
		fullscreenButton : false,
		allowTextureFilterAnisotropic : false,
		contextOptions : {
			webgl : {
				alpha : false,
				antialias : true,
				preserveDrawingBuffer : true,
				failIfMajorPerformanceCaveat : false,
				depth : true,
				stencil : false,
				anialias : false
			},
		},
		targetFrameRate : 60,
		resolutionScale : 0.1,
		orderIndependentTranslucency : true,
		imageryProvider : undefined,
		baseLayerPicker : true,
		geocoder : false,
		automaticallyTrackDataSourceClocks : false,
		dataSources : null,
		clock : null,
		terrainShadows : Cesium.ShadowMode.DISABLED
	});

	// 좌표계 바운딩 박스
	this.minCRS = [ -180.0, -90.0 ];
	this.maxCRS = [ 180.0, 90.0 ];
	// 좌표계 중심
	this.center = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 200000);
	
	// 초기 위치
	this.initPosition = Array.isArray(options.initPosition) ? Cesium.Cartesian3.fromDegrees(options.initPosition[0], options.initPosition[1] - 1, 200000) : this.center; 
	
	// cesium 카메라를 지도 중심으로 이동
	this.cesiumViewer.camera.flyTo({
		destination : this.initPosition,
		orientation : {
			heading : Cesium.Math.toRadians(0),
			pitch : Cesium.Math.toRadians(-60),
			roll : Cesium.Math.toRadians(0)
		},
		duration: 3
	});

	// 지도에 표시할 객체 배열
	this.threeObjects = [];

	// three 생성자 옵션
	var fov = 45;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width / height;
	var near = 1;
	var far = 10*1000*1000;

	// three js scene 객체
	this.threeScene = new THREE.Scene();
	// 그리드 추가
	this.threeScene.add(new THREE.GridHelper());
	// three 카메라 선언
	this.threeCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	// three 랜더러
	this.threeRenderer = new THREE.WebGLRenderer({alpha: true});
	// 렌더링 함수
	function render(){
		// var that = this;
//		that.getThreeRenderer().render(that.getThreeScene(), that.getThreeCamera());
		that.renderThreeObj(that);
	};
	// three orbit 컨트롤 선언
	/*this.threeOrbitControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
	this.threeOrbitControls.update();
	// 변경시 렌더링 함수 수행
	this.threeOrbitControls.addEventListener('change', render);
	// orbit 시작 이벤트
	this.threeOrbitControls.addEventListener( 'start', function () {
		// cancelHideTransform();
	});
	// orbit 종료 이벤트
	this.threeOrbitControls.addEventListener( 'end', function () {
		// delayHideTransform();
	});*/
	// transform 컨트롤 선언
	this.threeTransformControls = new THREE.TransformControls(this.threeCamera, this.threeRenderer.domElement);
	// 변경시 렌더링 함수 수행
	this.threeTransformControls.addEventListener('change', render);
	// 드래그 시
	this.threeTransformControls.addEventListener('dragging-changed', function(event){
//		that.threeOrbitControls.enabled = !event.vale;
		cancelAnimationFrame(that.requestFrame);
	});
	// transform 컨트롤 Three Scene에 추가
	this.threeScene.add(this.threeTransformControls);
	
	// Three scene drag controls 추가
	this.splineHelperObjects = [];
	this.threeDragControls = new THREE.DragControls( this.splineHelperObjects, this.threeCamera, this.threeRenderer.domElement );
	this.threeDragControls.enabled = true;
	this.threeDragControls.addEventListener( 'hoveron', function ( event ) {
		that.threeTransformControls.attach( event.object );
	});
	this.threeDragControls.addEventListener( 'hoveroff', function () {
		that.threeTransformControls.detach( that.threeTransformControls.object );
	});
	
	// 영역에 three 추가
	this.threeElem.appendChild(this.threeRenderer.domElement);

	// 렌더링을 위한 루프 함수
	function loop() {
		that.requestFrame = requestAnimationFrame(loop);
// that.renderCesium();
		that.renderThreeObj();
	};
	// 렌더링 시작
	loop();
	
	// =============== Event =====================
	$("#editTool3D").click(function(e) {
		e.preventDefault();
		epan.editToolToggle();
	});
	
	// =============== modal event listener =============== 
	$("#pointObjectCreateModal").modal({
		backdrop: "static",
		show: false
	});
	
	$("#polygonObjectCreateModal").modal({
		backdrop: "static",
		show: false
	});
	
	$("#pointObjectCreateModal select").on("change", function(e){
		var val = $(this).val();
		var content = $("#pointObjectCreateModal .type-content");
	});
	
	$("#pointObjectConfirm").on("click", function(e){
		var opt = {
			type: "box",
			width: 0,
			height: 0,
			depth: 0
		};
		
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
}

/**
 * gb.Map 객체를 반환한다.
 * 
 * @method gb3d.Map#getGbMap
 * @return {gb.Map} gbMap 객체
 */
gb3d.Map.prototype.getGbMap = function() {
	return this.gbMap;
};

/**
 * cesium Viewer 객체를 반환한다.
 * 
 * @method gb3d.Map#getCesiumViewer
 * @return {Cesium.Viewer} 세슘 Viewer 객체
 */
gb3d.Map.prototype.getCesiumViewer = function() {
	return this.cesiumViewer;
};

/**
 * three scene 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeScene
 * @return {THREE.Scene} three Scene 객체
 */
gb3d.Map.prototype.getThreeScene = function() {
	return this.threeScene;
};

/**
 * three camera 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeCamera
 * @return {THREE.Camera} three Camera 객체
 */
gb3d.Map.prototype.getThreeCamera = function() {
	return this.threeCamera;
};

/**
 * three orbit controls 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeOrbitControls
 * @return {THREE.Camera} three OrbitControls 객체
 */
gb3d.Map.prototype.getThreeOrbitControls = function() {
	return this.threeOrbitControls;
};

/**
 * three transform controls 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeTransformControls
 * @return {THREE.Camera} three TransformControls 객체
 */
gb3d.Map.prototype.getThreeTransformControls = function() {
	return this.threeTransformControls;
};

/**
 * cesium viewer를 렌더링한다
 * 
 * @method gb3d.Map#renderCesium
 */
gb3d.Map.prototype.renderCesium = function(){
// var that = this;
	this.getCesiumViewer().render();
	// cesium.viewer.scene.screenSpaceCameraController.enableInputs = false;
}

/**
 * three scene의 객체들을 렌더링한다
 * 
 * @method gb3d.Map#renderThreeObj
 */
gb3d.Map.prototype.renderThreeObj = function(mapObj){
	var that = !mapObj ? this : mapObj;
	// register Three.js scene with Cesium
	that.getThreeCamera().fov = Cesium.Math.toDegrees(that.getCesiumViewer().camera.frustum.fovy); // ThreeJS
	// FOV
	// is
	// vertical
	that.getThreeCamera().updateProjectionMatrix();

	var cartToVec = function(cart){
		return new THREE.Vector3(cart.x, cart.y, cart.z);
	};

	// Configure Three.js meshes to stand against globe center position up
	// direction
	var objs = that.getThreeObjects();
	for (var i = 0; i < objs.length; i++) {
		// 모델의 위치
		var cfo = that.getThreeObjects()[i].getCenter();
		var extent = that.getThreeObjects()[i].getExtent();
		// 카티시안 위치
		var center = Cesium.Cartesian3.fromDegrees(cfo[0], cfo[1]);
		// get forward direction for orienting model
		var centerHigh = Cesium.Cartesian3.fromDegrees(cfo[0], cfo[1], 1);
//		var centerHigh = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 1);
		// use direction from bottom left to top left as up-vector
		var bottomLeft  = cartToVec(Cesium.Cartesian3.fromDegrees(that.minCRS[0], that.minCRS[1]));
		var topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(that.minCRS[0], that.maxCRS[1]));
		var latDir  = new THREE.Vector3().subVectors(bottomLeft,topLeft).normalize();

		// configure entity position and orientation
		if(!mapObj){
			this.getThreeObjects()[i].getObject().position.copy(center);
			this.getThreeObjects()[i].getObject().lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		}
//		this.getThreeObjects()[i].getObject().up.copy(latDir);
	}

	// Clone Cesium Camera projection position so the
	// Three.js Object will appear to be at the same place as above the
	// Cesium Globe
	that.getThreeCamera().matrixAutoUpdate = false;
	var cvm = that.getCesiumViewer().camera.viewMatrix;
	var civm = that.getCesiumViewer().camera.inverseViewMatrix;
	that.getThreeCamera().matrixWorld.set(
			civm[0], civm[4], civm[8 ], civm[12],
			civm[1], civm[5], civm[9 ], civm[13],
			civm[2], civm[6], civm[10], civm[14],
			civm[3], civm[7], civm[11], civm[15]
	);
	that.getThreeCamera().matrixWorldInverse.set(
			cvm[0], cvm[4], cvm[8 ], cvm[12],
			cvm[1], cvm[5], cvm[9 ], cvm[13],
			cvm[2], cvm[6], cvm[10], cvm[14],
			cvm[3], cvm[7], cvm[11], cvm[15]
	);

	var width = that.threeElem.clientWidth;
	var height = that.threeElem.clientHeight;
	var aspect = width / height;
	that.getThreeCamera().aspect = aspect;
	that.getThreeCamera().updateProjectionMatrix();

	that.getThreeRenderer().setSize(width, height);
	that.getThreeRenderer().render(that.threeScene, that.threeCamera);
}

/**
 * three scene을 렌더링한다
 * 
 * @method gb3d.Map#render
 */
// gb3d.Map.prototype.render = function(){
// // var that = this;
// that.getThreeRenderer().render(that.getThreeScene(), that.getThreeCamera());
// }

/**
 * 렌더링 함수를 반복한다
 * 
 * @method gb3d.Map#loop
 */
// gb3d.Map.prototype.loop = function(){
// var that = this;
// requestAnimationFrame(that.loop);
// that.renderCesium();
// that.renderThreeObj();
// }

/**
 * three transform controls 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeObjects
 * @return {Array.<gb3d.object.ThreeObject>} ThreeObject 배열
 */
gb3d.Map.prototype.getThreeObjects = function() {
	return this.threeObjects;
};

/**
 * three transform controls 객체를 설정한다.
 * 
 * @method gb3d.Map#setThreeObjects
 * @param {Array.
 *            <gb3d.object.ThreeObject>} ThreeObject 배열
 */
gb3d.Map.prototype.setThreeObjects = function(objects) {
	this.threeObjects = objects;
};

/**
 * three transform renderer 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeRenderer
 * @return {THREE.WebGLRenderer} three renderer 객체
 */
gb3d.Map.prototype.getThreeRenderer = function() {
	return this.threeRenderer;
};

/**
 * 렌더링할 ThreeJS 객체를 추가한다.
 * 
 * @method gb3d.Map#addThreeObject
 * @param {gb3d.object.ThreeObject} object - ThreeObject
 */
gb3d.Map.prototype.addThreeObject = function(object){
	if(object instanceof gb3d.object.ThreeObject){
		this.threeObjects.push(object);
		this.threeTransformControls.attach(object.object);
		this.threeTransformControls.setMode("rotate");
		this.threeTransformControls.setSpace("local");
	} else {
		console.error("Three object must be gb3d.object.ThreeObject type");
	}
};

/**
 * Object 생성을 위한 사전작업 수행 함수.
 * Feature 정보를 저장하고 Feature type에 따른 모달을 생성한다.
 * 
 * @method gb3d.Map#createObjectByCoord
 * @param {String} type - Feature type
 * @param {Array.<Number> | Array.<Array.<Number>>} arr - Polygon or Point feature coordinates
 * @param {Array.<Number>} extent - Extent
 */
gb3d.Map.prototype.createObjectByCoord = function(type, arr, extent){
	this.objectAttr.type = type;
	this.objectAttr.coordinate = arr;
	this.objectAttr.extent = extent;
	
	switch(type){
	case "Point":
		$("#pointObjectCreateModal").modal();
		break;
	case "Polygon":
		$("#polygonObjectCreateModal").modal();
		break;
	default:
		return;
	}
}

gb3d.Map.prototype.createPointObject = function(arr, extent, option){
	var coord = arr,
		points = [],
		geometry,
		cart,
		obj3d,
		x = extent[0] + (extent[2] - extent[0]) / 2,
		y = extent[1] + (extent[3] - extent[1]) / 2,
		type = option.type || "box",
		width = option.width || 40,
		height = option.height || 40,
		depth = option.depth || 40;
	
	
	
	geometry = new THREE.BoxGeometry(parseInt(width), parseInt(height), parseInt(depth));
	geometry.vertices.forEach(function(vert, v){
		vert.z += depth/2;
	});
	
	var doubleSideMaterial = new THREE.MeshNormalMaterial({
		side : THREE.DoubleSide
	});
	
	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
	latheMesh.scale.set(1, 1, 1);
	this.getThreeScene().add(latheMesh);
	
	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [x, y],
		"extent" : extent
	});
	
	this.addThreeObject(obj3d);
}

gb3d.Map.prototype.createPolygonObject = function(arr, extent, option){
	var coord = arr,
		points = [],
		geometry,
		shape,
		cart,
		obj3d,
		depth = option.depth || 500,
		x = extent[0] + (extent[2] - extent[0]) / 2,
		y = extent[1] + (extent[3] - extent[1]) / 2,
		centerCart = Cesium.Cartesian3.fromDegrees(x, y);
	
	for(var i = 0; i < coord[0].length - 1; i++){
		cart = Cesium.Cartesian3.fromDegrees(coord[0][i][0], coord[0][i][1]);
		points.push(new THREE.Vector2(cart.x, cart.y));
	}
	
	shape = new THREE.Shape(points);
	geometry = new THREE.ExtrudeGeometry(shape, {
		depth: depth,
		steps: 1,
		material: 0,
		extrudeMaterial: 1,
		bevelEnabled: false
	});
	
	geometry.translate(-centerCart.x, -centerCart.y, 0);
	
	var doubleSideMaterial = new THREE.MeshNormalMaterial({
		side : THREE.DoubleSide
	});
	
	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
	latheMesh.scale.set(1, 1, 1);
	this.getThreeScene().add(latheMesh);
	
	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [x, y],
		"extent" : extent
	});
	
	this.addThreeObject(obj3d);
}
