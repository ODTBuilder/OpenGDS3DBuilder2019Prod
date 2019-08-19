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
			type: undefined,
			coordinate: [],
			extent: [],
			feature: undefined,
			id: undefined
	};

	// 2d 지도 영역 엘리먼트
// this.target2d = undefined;
	// 3d 지도 영역 엘리먼트
	this.target = undefined;
	// cesium 영역 엘리먼트
	this.cesiumElem = $("<div>").addClass("gb3d-map-cesium-area")[0];
	// three 영역 엘리먼트
	this.threeElem = $("<div>").addClass("gb3d-map-three-area")[0];
	// cesium, three 묶을 영역
	this.bind3dElem = $("<div>").addClass("gb3d-map-bind3d-area")[0];
	// gbMap
	this.gbMap = options.gbMap instanceof gb.Map ? options.gbMap : undefined;

	if (!this.gbMap) {
		console.error("gbMap must be set");
		return;
	}

	// Tools List
	this.tools = {};

	// 3d 지도 영역으로 설정할 부분이 div 객체인지 확인
	if ($(options.target).is("div")) {
		// 3d 지도 영역 엘리먼트 저장
		this.target = $(options.target)[0];
		// cesium, three 묶을 영역 생성
		$(this.target).append(this.bind3dElem);
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
		scene3DOnly: true,
		selectionIndicator : false,
		homeButton : false,
		sceneModePicker : false,
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
		imageryProvider : Cesium.createOpenStreetMapImageryProvider({
			url : 'https://a.tile.openstreetmap.org/'
		}),
		baseLayerPicker : true,
		geocoder : false,
		automaticallyTrackDataSourceClocks : false,
		dataSources : null,
		clock : null,
		terrainShadows : Cesium.ShadowMode.DISABLED
	});

	// 3D Tileset 객체
	this.tiles = {};

// this.cesiumViewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
// var tileset = new Cesium.Cesium3DTileset({ url: options.testTiles });
// this.cesiumViewer.scene.primitives.add(tileset);
// this.cesiumViewer.zoomTo(tileset);

//	this.cesiumViewer.camera.flyTo({
//		destination: Cesium.Cartesian3.fromDegrees(127.03250885009764, 37.51989305019379, 15000.0)
//	});

	// 좌표계 바운딩 박스
	this.minCRS = [ -180.0, -90.0 ];
	this.maxCRS = [ 180.0, 90.0 ];

	// 좌표계 중심
	this.center = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 200000);

	// 초기 위치
// this.initPosition = Array.isArray(options.initPosition) ?
// Cesium.Cartesian3.fromDegrees(options.initPosition[0],
// options.initPosition[1] - 1, 200000) : this.center;
	this.initPosition = Cesium.Cartesian3.fromDegrees(131.86972500, 37.23948087, 200000);

	// cesium 카메라를 지도 중심으로 이동
// this.cesiumViewer.camera.flyTo({
// destination : this.initPosition,
// orientation : {
// heading : Cesium.Math.toRadians(0),
// pitch : Cesium.Math.toRadians(-60),
// roll : Cesium.Math.toRadians(0)
// },
// duration: 3
// });

	// 지도에 표시할 객체 배열
	this.threeObjects = [];

	// three camera 생성자 옵션
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

	this.threeLight = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
	this.threeScene.add(this.threeLight);

	// 영역에 three 추가
	this.threeElem.appendChild(this.threeRenderer.domElement);
	// 카메라 객체
	this.camera = new gb3d.Camera({
		"cesiumCamera" : this.cesiumViewer.camera,
		"threeCamera" : this.threeCamera,
		"olMap" : this.gbMap.getUpperMap()
	});

	// 렌더링을 위한 루프 함수
	this.loop_ = function(){
		that.requestFrame = requestAnimationFrame(that.loop_);
// that.renderCesium();
		that.renderThreeObj();
	};
	// 렌더링 시작
	this.loop_();

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

	$("#lineObjectCreateModal").modal({
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
		that.createLineStringObject(that.objectAttr.coordinate, that.objectAttr.extent, opt);

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
gb3d.Map.prototype.renderThreeObj = function(){
	var that = this;
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
		var cfo = objs[i].getCenter();
		// 카티시안 위치
		var center = Cesium.Cartesian3.fromDegrees(cfo[0], cfo[1]);
		// get forward direction for orienting model
		var centerHigh = Cesium.Cartesian3.fromDegrees(cfo[0], cfo[1],1);
		// use direction from bottom left to top left as up-vector
		var bottomLeft  = cartToVec(Cesium.Cartesian3.fromDegrees(that.minCRS[0], that.minCRS[1]));
		var topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(that.minCRS[0], that.maxCRS[1]));
		var latDir  = new THREE.Vector3().subVectors(bottomLeft,topLeft).normalize();

		// configure entity position and orientation
		if(!objs[i].getModCount()){
			// objs[i].getObject().position.copy(center);
			// objs[i].getObject().lookAt(new THREE.Vector3(centerHigh.x,
			// centerHigh.y, centerHigh.z));
		}
// objs[i].getObject().up.copy(latDir);
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
// //var that = this;
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
 * gb3d camera 객체를 반환한다.
 * 
 * @method gb3d.Map#getCamera
 * @return {gb3d.Camera} gb3d camera 객체
 */
gb3d.Map.prototype.getCamera = function() {
	return this.camera;
};

/**
 * 렌더링할 ThreeJS 객체를 추가한다.
 * 
 * @method gb3d.Map#addThreeObject
 * @param {gb3d.object.ThreeObject}
 *            object - ThreeObject
 */
gb3d.Map.prototype.addThreeObject = function(object){
	if(object instanceof gb3d.object.ThreeObject){
		this.threeObjects.push(object);
	} else {
		console.error("Three object must be gb3d.object.ThreeObject type");
	}
}

/**
 * Object 생성을 위한 사전작업 수행 함수. Feature 정보를 저장하고 Feature type에 따른 모달을 생성한다.
 * 
 * @method gb3d.Map#createObjectByCoord
 * @param {String}
 *            type - Feature type
 * @param {Array.
 *            <Number> | Array.<Array.<Number>>} arr - Polygon or Point
 *            feature coordinates
 * @param {Array.
 *            <Number>} extent - Extent
 */
gb3d.Map.prototype.createObjectByCoord = function(type, feature){
	this.objectAttr.type = type;
	this.objectAttr.coordinate = feature.getGeometry().getCoordinates(true);
	this.objectAttr.extent = feature.getGeometry().getExtent();
	this.objectAttr.id = feature.getId();
	this.objectAttr.feature = feature;

	switch(type){
	case "Point":
	case "MultiPoint":
		$("#pointObjectCreateModal").modal();
		break;
	case "LineString":
	case "MultiLineString":
		$("#lineObjectCreateModal").modal();
		break;
	case "Polygon":
	case "MultiPolygon":
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
	depth = option.depth || 40,
	centerCart = Cesium.Cartesian3.fromDegrees(x, y),
	centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	geometry = new THREE.BoxGeometry(parseInt(width), parseInt(height), parseInt(depth));
	geometry.vertices.forEach(function(vert, v){
		vert.z += depth/2;
	});

	var doubleSideMaterial = new THREE.MeshNormalMaterial({
		side : THREE.DoubleSide
	});

	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
// latheMesh.scale.set(1, 1, 1);
	latheMesh.position.copy(centerCart);
	latheMesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
	this.getThreeScene().add(latheMesh);

	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	latheMesh.userData.width = width;
	latheMesh.userData.height = height;
	latheMesh.userData.depth = depth;

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [x, y],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature
	});

	this.addThreeObject(obj3d);
	return obj3d;
}

/*
 * gb3d.Map.prototype.createLineObject = function(arr, extent, option){ var
 * coord = arr, points = [], geometry, shape, cart, obj3d, width = option.width ||
 * 50, depth = option.depth || 50, x = extent[0] + (extent[2] - extent[0]) / 2,
 * y = extent[1] + (extent[3] - extent[1]) / 2, centerCart =
 * Cesium.Cartesian3.fromDegrees(x, y);
 * 
 * var curve = new THREE.CatmullRomCurve3(); for(var i = 0; i < coord.length;
 * i++){ if(coord[i][0] instanceof Array){ for(var j = 0; j < coord[i].length;
 * j++){ cart = Cesium.Cartesian3.fromDegrees(coord[i][j][0], coord[i][j][1]);
 * curve.points.push(new THREE.Vector3(cart.x, cart.y, cart.z)); } } else { cart =
 * Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]);
 * curve.points.push(new THREE.Vector3(cart.x, cart.y, cart.z)); } }
 * 
 * points.push(new THREE.Vector2(0, -width/2)); points.push(new THREE.Vector2(0,
 * +width/2)); points.push(new THREE.Vector2(-depth, +width/2)); points.push(new
 * THREE.Vector2(-depth, -width/2));
 * 
 * shape = new THREE.Shape(points);
 * 
 * geometry = new THREE.ExtrudeBufferGeometry(shape, { steps: 100, bevelEnabled:
 * false, extrudePath: curve });
 * 
 * geometry.translate(-centerCart.x, -centerCart.y, -centerCart.z);
 * 
 * var doubleSideMaterial = new THREE.MeshNormalMaterial({ side :
 * THREE.DoubleSide });
 * 
 * var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial); //
 * latheMesh.scale.set(1, 1, 1); latheMesh.position.copy(centerCart);
 * this.getThreeScene().add(latheMesh); // userData 저장(THREE.Object3D 객체 속성)
 * latheMesh.userData.width = width; latheMesh.userData.depth = depth;
 * 
 * obj3d = new gb3d.object.ThreeObject({ "object" : latheMesh, "center" : [x,
 * y], "extent" : extent, "type" : this.objectAttr.type, "feature" :
 * this.objectAttr.feature });
 * 
 * this.addThreeObject(obj3d); return obj3d; }
 */

gb3d.Map.prototype.createPolygonObject = function(arr, extent, option){
	var that = this;
	var coord = arr,
	geometry,
	shape,
	cart,
	result,
	obj3d,
	depth = option.depth ? parseFloat(option.depth) : 50.0,
			x = extent[0] + (extent[2] - extent[0]) / 2,
			y = extent[1] + (extent[3] - extent[1]) / 2,
			centerCart = Cesium.Cartesian3.fromDegrees(x, y),
			centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	if(this.objectAttr.type === "MultiPolygon"){
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], depth);
	} else if(this.objectAttr.type === "Polygon"){
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], depth);
	} else {
		return;
	}

	geometry = new THREE.Geometry();
	geometry.vertices = result.points;
	geometry.faces = result.faces;
	geometry.translate(-centerCart.x, -centerCart.y, -centerCart.z);

	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();

	var doubleSideMaterial = new THREE.MeshStandardMaterial({
		side : THREE.DoubleSide
	});

	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
	latheMesh.position.copy(centerCart);
	this.getThreeScene().add(latheMesh);

	// 원점을 바라보도록 설정한다
	latheMesh.lookAt(new THREE.Vector3(0,0,0));
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

	this.getThreeScene().add(latheMesh);
	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	latheMesh.userData.depth = depth;

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [x, y],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature
	});

	this.addThreeObject(obj3d);
	return obj3d;
}

gb3d.Map.prototype.getThreeObjectById = function(id){
	var threeObject = undefined,
	featureId = id;

	this.getThreeObjects().forEach(function(e){
		if(e.getFeature().getId() === featureId){
			threeObject = e;
		}
	});

	return threeObject;
}

gb3d.Map.prototype.createLineStringObject = function(arr, extent, option){
	var that = this;
	var coord = arr,
	geometry,
	shape,
	cart,
	result,
	obj3d,
	depth = option.depth ? parseFloat(option.depth) : 50.0,
			x = extent[0] + (extent[2] - extent[0]) / 2,
			y = extent[1] + (extent[3] - extent[1]) / 2,
			centerCart = Cesium.Cartesian3.fromDegrees(x, y),
			centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

	var feature = this.objectAttr.feature.clone();
	if (feature.getGeometry() instanceof ol.geom.LineString) {
		var beforeGeomTest = feature.getGeometry().clone();
		console.log(beforeGeomTest.getCoordinates().length);
		var beforeCoord = beforeGeomTest.getCoordinates();

		var tline = turf.lineString(beforeCoord);

		var tbuffered = turf.buffer(tline, option["width"]/2, {units : "meters"});
		console.log(tbuffered);
		var gjson = new ol.format.GeoJSON();
		var bfeature = gjson.readFeature(tbuffered);

		coord = bfeature.getGeometry().getCoordinates(true);
		console.log(bfeature.getGeometry().getType());
		console.log(coord);

	} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {

	}

	if(this.objectAttr.type === "MultiLineString"){
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], depth);
	} else if(this.objectAttr.type === "LineString"){
		result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], depth);
	} else {
		return;
	}

	geometry = new THREE.Geometry();
	geometry.vertices = result.points;
	geometry.faces = result.faces;
	geometry.translate(-centerCart.x, -centerCart.y, -centerCart.z);

	// compute Normals
// geometry.computeVertexNormals();

	// compute face Normals
	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();

	var doubleSideMaterial = new THREE.MeshStandardMaterial({
		side : THREE.DoubleSide
	});

	var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
// latheMesh.scale.set(1, 1, 1);
	latheMesh.position.copy(centerCart);
	// 원점을 바라보도록 설정한다
	latheMesh.lookAt(new THREE.Vector3(0,0,0));
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
	this.getThreeScene().add(latheMesh);

	// userData 저장(THREE.Object3D 객체 속성)
	latheMesh.userData.type = this.objectAttr.type;
	latheMesh.userData.depth = depth;

	obj3d = new gb3d.object.ThreeObject({
		"object" : latheMesh,
		"center" : [x, y],
		"extent" : extent,
		"type" : this.objectAttr.type,
		"feature" : this.objectAttr.feature,
		"buffer" : option["width"]/2
	});

	this.addThreeObject(obj3d);
	return obj3d;
}

gb3d.Map.prototype.getThreeObjectById = function(id){
	var threeObject = undefined,
	featureId = id;

	this.getThreeObjects().forEach(function(e){
		if(e.getFeature().getId() === featureId){
			threeObject = e;
		}
	});

	return threeObject;
}

gb3d.Map.prototype.getThreeObjectByUuid = function(id){
	var threeObject = undefined,
	uuid = id;

	this.getThreeObjects().forEach(function(e){
		if(e.getObject().uuid === uuid){
			threeObject = e;
		}
	});

	return threeObject;
}

gb3d.Map.prototype.syncSelect = function(id){
	var id = id;

	var threeObject = this.getThreeObjectById(id);

	if(!threeObject){
		threeObject = this.getThreeObjectByUuid(id);
		if(!threeObject){
			return;
		}

		if(this.tools.edit2d instanceof gb3d.edit.EditingTool2D){
			this.tools.edit2d.interaction.select.getFeatures().clear();
			this.tools.edit2d.interaction.select.getFeatures().push( threeObject.getFeature() );
// this.gbMap.getView().fit( threeObject.getFeature().getGeometry() );
		}
	} else {
		if(this.tools.edit3d instanceof gb3d.edit.EditingTool3D){
			this.tools.edit3d.pickedObject_ = threeObject.getObject();
			this.tools.edit3d.threeTransformControls.attach( threeObject.getObject() );
			this.tools.edit3d.updateAttributeTab( threeObject.getObject() );
// this.cesiumViewer.camera.flyTo({
// destination: Cesium.Cartesian3.fromDegrees(threeObject.getCenter()[0],
// threeObject.getCenter()[1],
// this.cesiumViewer.camera.positionCartographic.height),
// duration: 0
// });
		}
	}
}

gb3d.Map.prototype.syncUnselect = function(id){
	var id = id;

	var threeObject = this.getThreeObjectById(id);

	if(!threeObject){
		threeObject = this.getThreeObjectByUuid(id);
		if(!threeObject){
			return;
		}

		if(this.tools.edit2d instanceof gb3d.edit.EditingTool2D){
			this.tools.edit2d.interaction.select.getFeatures().remove( threeObject.getFeature() );
		}
	} else {
		if(this.tools.edit3d instanceof gb3d.edit.EditingTool3D){
			this.tools.edit3d.pickedObject_ = threeObject.getObject();
			this.tools.edit3d.threeTransformControls.detach( threeObject.getObject() );
			this.tools.edit3d.updateAttributeTab( undefined );
			this.tools.edit3d.updateStyleTab( undefined );
		}
	}
}

gb3d.Map.prototype.moveObject2Dfrom3D = function(center, uuid){
	var id = uuid,
	centerCoord = center,
	carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerCoord),
	lon = Cesium.Math.toDegrees(carto.longitude),
	lat = Cesium.Math.toDegrees(carto.latitude),
	threeObject = this.getThreeObjectByUuid(id),
	geometry = threeObject.getFeature().getGeometry(),
	lastCenter = threeObject.getCenter(),
	deltaX = lon - lastCenter[0],
	deltaY = lat - lastCenter[1];

	geometry.translate(deltaX, deltaY);
	threeObject.setCenter([lon, lat]);
}

gb3d.Map.prototype.modifyObject2Dfrom3D = function(vertices, uuid){
	var v = JSON.parse(JSON.stringify(vertices)),
	id = uuid,
	threeObject = this.getThreeObjectByUuid(id),
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

gb3d.Map.prototype.moveObject3Dfrom2D = function(id, center, coord){
	var featureId = id;
	var featureCoord = coord;

	var threeObject = this.getThreeObjectById(featureId);
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
		a = featureCoord[0][0];
		b = featureCoord[0][1];
		break;
	default:
		break;
	}

	cp = gb3d.Math.crossProductFromDegrees(a, b, centerCoord);
	position.copy(new THREE.Vector3(cart.x + (cp.u/cp.s)*vec, cart.y + (cp.v/cp.s)*vec, cart.z + (cp.w/cp.s)*vec));

	threeObject.upModCount();
	threeObject.setCenter(centerCoord);
}

gb3d.Map.prototype.modify3DVertices = function(arr, id, extent) {
	var objects = this.getThreeObjects(),
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
	cart;

	var threeObject = this.getThreeObjectById(featureId);
	if(!threeObject){
		return;
	}

	var lastCenter = threeObject.getCenter();
	var position = threeObject.getObject().position;
	var lastCart = Cesium.Cartesian3.fromDegrees(lastCenter[0], lastCenter[1]);
	var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) + Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

	object = threeObject.getObject();
	geometry = object.geometry;

	if(object === undefined){
		return;
	}

	if(coord.length === 0){
		coord = threeObject.getFeature().getGeometry().getCoordinates(true);
	}

	var opt = object.userData;
	var center = [x, y];
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1]);

	if (opt.type === "MultiPoint" || opt.type === "Point") {
		geometry = new THREE.BoxGeometry(parseInt(opt.width), parseInt(opt.height), parseInt(opt.depth));
		geometry.vertices.forEach(function(vert, v){
			vert.z += opt.depth/2;
		});
		object.geometry = geometry;
		return;
	}

	if (opt.type === "MultiLineString" || opt.type === "LineString") {
		var feature = threeObject.getFeature().clone();
		if (feature.getGeometry() instanceof ol.geom.LineString) {
			var beforeGeomTest = feature.getGeometry().clone();
			console.log(beforeGeomTest.getCoordinates().length);
			var beforeCoord = beforeGeomTest.getCoordinates();

			var tline = turf.lineString(beforeCoord);

			var tbuffered = turf.buffer(tline, threeObject.getBuffer(), {units : "meters"});
			console.log(tbuffered);
			var gjson = new ol.format.GeoJSON();
			var bfeature = gjson.readFeature(tbuffered);

			coord = bfeature.getGeometry().getCoordinates(true);
			console.log(bfeature.getGeometry().getType());
			console.log(coord);

		} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {

		}
	}

	var a, b, cp;
	if(geometry instanceof THREE.Geometry){
		if(opt.type === "MultiPolygon" || opt.type === "MultiLineString"){
			result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], parseFloat(opt.depth));
			a = coord[0][0][0];
			b = coord[0][0][1];
		} else if(opt.type === "Polygon" || opt.type === "LineString"){
			result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], parseFloat(opt.depth));
			a = coord[0][0];
			b = coord[0][1];
		} else {
			return;
		}

		geometry = new THREE.Geometry();
		geometry.vertices = result.points;
		geometry.faces = result.faces;
		geometry.translate(-centerCart.x, -centerCart.y, -centerCart.z);

		object.lookAt(new THREE.Vector3(0,0,0));
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

	cp = gb3d.Math.crossProductFromDegrees(a, b, center);

	position.copy(new THREE.Vector3(centerCart.x + (cp.u/cp.s)*vec, centerCart.y + (cp.v/cp.s)*vec, centerCart.z + (cp.w/cp.s)*vec));

	// threeObject 수정 횟수 증가, Center 값 재설정
	threeObject.upModCount();
	threeObject.setCenter(center);
};

/**
 * Object 생성을 위한 사전작업 수행 함수. Feature 정보를 저장하고 Feature type에 따른 모달을 생성한다.
 * 
 * @method gb3d.Map#addTileset
 * @param {gb3d.object.Tileset}
 *            tileset - 타일셋 객체
 */
gb3d.Map.prototype.addTileset = function(tileset){
	if (tileset instanceof gb3d.object.Tileset) {
		var layer = tileset.getLayer();
		var layerid;
		if (layer instanceof ol.layer.Base) {
			layerid = layer.get("id");
		} else if (typeof layer === "string") {
			layerid = layer;
		}
		if (!this.getTileset()) {
			this.setTileset({});
		}
		if (!this.getTileset()[layerid]) {
			this.getTileset()[layerid] = [];
		}
		this.getTileset()[layerid].push(tileset);
		var ctile = tileset.getCesiumTileset();
		this.getCesiumViewer().scene.primitives.add(ctile);
		this.getCesiumViewer().zoomTo(ctile);
	} else {
		console.error("parameter must be gb3d.object.Tileset");
		return
	}
}

/**
 * 타일셋 객체 묶음을 반환한다.
 * 
 * @method gb3d.Map#getTileset
 * @return {Object} 타일 객체 묶음
 */
gb3d.Map.prototype.getTileset = function(){
	return this.tiles;
}


/**
 * 타일셋 객체 묶음을 반환한다.
 * 
 * @method gb3d.Map#getTileset
 * @param {String}
 *            lid - 레이어 id
 * @return {Array.<gb3d.object.Tileset>} 타일셋 객체 묶음
 */
gb3d.Map.prototype.getTilesetByLayer = function(lid){
	return this.tiles[lid];
}

/**
 * 타일셋 객체 묶음을 설정한다.
 * 
 * @method gb3d.Map#setTileset
 * @param {Object}
 *            tiles - 타일 객체 묶음
 */
gb3d.Map.prototype.setTileset = function(tiles){
	this.tiles = tiles;
}