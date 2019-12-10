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
//	this.objectAttr = {
//	type: undefined,
//	coordinate: [],
//	extent: [],
//	feature: undefined,
//	id: undefined
//	};

	// 2d 지도 영역 엘리먼트
//	this.target2d = undefined;
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
	// 3d 모델 레코드 객채
	this.modelRecord = options.modelRecord instanceof gb3d.edit.ModelRecord ? options.modelRecord : undefined; 

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
//		useDefaultRenderLoop : false,
		scene3DOnly: true,
		selectionIndicator : false,
		homeButton : true,
		sceneModePicker : false,
		infoBox : true,
		navigationHelpButton : false,
		navigationInstructionsInitiallyVisible : false,
		animation : false,
		timeline : true,
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
		geocoder : true,
		automaticallyTrackDataSourceClocks : false,
		dataSources : null,
		clock : null,
		terrainShadows : Cesium.ShadowMode.DISABLED,
	});

	var scene = this.cesiumViewer.scene;
	scene.sun = new Cesium.Sun(); 

	$(".cesium-baseLayerPicker-dropDown").css({
		"zIndex": 1
	});

	// 3D Tileset 객체
	this.tiles = {};

	// 좌표계 바운딩 박스
	this.minCRS = [ -180.0, -90.0 ];
	this.maxCRS = [ 180.0, 90.0 ];

	// 좌표계 중심
	this.center = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 200000);

//	this.cesiumViewer.extend(Cesium.viewerCesiumInspectorMixin);
//	this.cesiumViewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

	// 초기 위치
	this.initPosition = Array.isArray(options.initPosition) ? options.initPosition : [0, 0];
	if (this.initPosition.length === 2) {
		this.initPosition.push(15000);
	}
//	Cesium.Cartesian3.fromDegrees(options.initPosition[0],
//	options.initPosition[1] - 1, 200000) : this.center;


	this.gbMap.getView().setCenter([options.initPosition[0],options.initPosition[1]]);
	// cesium 카메라를 지도 중심으로 이동

	this.cesiumViewer.camera.flyTo({
		destination : Cesium.Cartesian3.fromDegrees(this.initPosition[0],
				this.initPosition[1], this.initPosition[2])
	});

	// 3D Tileset 객체
	this.tiles = {};

	// 좌표계 바운딩 박스
	this.minCRS = [ -180.0, -90.0 ];
	this.maxCRS = [ 180.0, 90.0 ];

	// 좌표계 중심
	this.center = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 200000);

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
//	this.threeRenderer.shadowMap.enabled = true;
	this.threeComposer = new THREE.EffectComposer(this.threeRenderer);

	this.ambientLight = new THREE.AmbientLight( 0x404040 );
	this.threeScene.add(this.ambientLight);
	this.sunLight = new THREE.PointLight();
	this.sunLight.position.set( 0, 0, 0 );
	that.sunLight.position.x = -456555707.42440885;
	that.sunLight.position.y = 1309511774.8390865;
	that.sunLight.position.z = 2611947852.695035;
	this.threeScene.add(this.sunLight);

	// 영역에 three 추가
	this.threeElem.appendChild(this.threeRenderer.domElement);
	// 카메라 객체
	this.camera = new gb3d.Camera({
		"cesiumCamera" : this.cesiumViewer.camera,
		"threeCamera" : this.threeCamera,
		"olMap" : this.gbMap.getUpperMap(),
		"sync2D" : false
	});
	this.camera.syncWith2D();

	// 렌더링을 위한 루프 함수
	this.loop_ = function(){
		that.requestFrame = requestAnimationFrame(that.loop_);
//		that.renderCesium();
		that.renderThreeObj();
		that.threeComposer.render();
		var sunCart = Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame();

//		that.sunLight.position.set( sunCart.x, sunCart.y, sunCart.z );
//		var time = Date.now() * 0.0005;
//		that.sunLight.position.x = Math.sin( time * 0.7 ) * 3000000000;
//		that.sunLight.position.y = Math.cos( time * 0.5 ) * 4000000000;
//		that.sunLight.position.z = Math.cos( time * 0.3 ) * 3000000000;
//		console.log(that.sunLight.position);
	};
	// 렌더링 시작
	this.loop_();

	// =============== Event =====================
	$("#editTool3D").click(function(e) {
		e.preventDefault();
		epan.editToolToggle();
	});

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
//	var that = this;
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
//		objs[i].getObject().up.copy(latDir);
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
	that.getThreeComposer().setSize(width, height);
	that.getThreeRenderer().render(that.threeScene, that.threeCamera);
}

/**
 * three scene을 렌더링한다
 * 
 * @method gb3d.Map#render
 */
//gb3d.Map.prototype.render = function(){
////var that = this;
//that.getThreeRenderer().render(that.getThreeScene(), that.getThreeCamera());
//}

/**
 * 렌더링 함수를 반복한다
 * 
 * @method gb3d.Map#loop
 */
//gb3d.Map.prototype.loop = function(){
//var that = this;
//requestAnimationFrame(that.loop);
//that.renderCesium();
//that.renderThreeObj();
//}

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

		// Three Object add event
		this.threeScene.dispatchEvent({type: "addObject", object: object});
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
//gb3d.Map.prototype.createObjectByCoord = function(type, feature, treeid){
//this.objectAttr.type = type;
//this.objectAttr.coordinate = feature.getGeometry().getCoordinates(true);
//this.objectAttr.extent = feature.getGeometry().getExtent();
//this.objectAttr.id = feature.getId();
//this.objectAttr.feature = feature;
//this.objectAttr.treeid = treeid;

//switch(type){
//case "Point":
//case "MultiPoint":
//$("#pointObjectCreateModal").modal();
//break;
//case "LineString":
//case "MultiLineString":
//$("#lineObjectCreateModal").modal();
//break;
//case "Polygon":
//case "MultiPolygon":
//$("#polygonObjectCreateModal").modal();
//break;
//default:
//return;
//}
//}

//gb3d.Map.prototype.createPointObject = function(arr, extent, option){
//var coord = arr,
//points = [],
//geometry,
//cart,
//obj3d,
//x = extent[0] + (extent[2] - extent[0]) / 2,
//y = extent[1] + (extent[3] - extent[1]) / 2,
//type = option.type || "box",
//// width = option.width || 40,
//// height = option.height || 40,
//// depth = option.depth || 40,
//centerCart = Cesium.Cartesian3.fromDegrees(x, y),
//centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

//// geometry = new THREE.BoxGeometry(parseInt(width), parseInt(height),
//// parseInt(depth));

//switch(type){
//case "box":
//geometry = new THREE.BoxGeometry(parseInt(option.width || 40),
//parseInt(option.height || 40), parseInt(option.depth || 40));
//break;
//case "cylinder":
//geometry = new THREE.CylinderGeometry(parseInt(option.radiusTop),
//parseInt(option.radiusBottom), parseInt(option.height));
//break;
//case "circle":
//geometry = new THREE.CircleGeometry(parseInt(option.radius));
//break;
//case "dodecahedron":
//geometry = new THREE.DodecahedronGeometry(parseInt(option.radius));
//break;
//case "icosahedron":
//geometry = new THREE.IcosahedronGeometry(parseInt(option.radius));
//break;
//}

//geometry.vertices.forEach(function(vert, v){
//if(option.depth){
//vert.z += option.depth/2;
//}
//});

//var frontSideMaterial = new THREE.MeshStandardMaterial({
//side : THREE.FrontSide
//});

//var latheMesh = new THREE.Mesh(geometry, frontSideMaterial);
//// latheMesh.scale.set(1, 1, 1);
//latheMesh.position.copy(centerCart);
//latheMesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y,
//centerHigh.z));
//this.getThreeScene().add(latheMesh);

//// userData 저장(THREE.Object3D 객체 속성)
//latheMesh.userData.type = this.objectAttr.type;
//// latheMesh.userData.width = width;
//// latheMesh.userData.height = height;
//// latheMesh.userData.depth = depth;
//for(var i in option){
//if(i === "type"){
//continue;
//}
//latheMesh.userData[i] = option[i];
//}

//obj3d = new gb3d.object.ThreeObject({
//"object" : latheMesh,
//"center" : [x, y],
//"extent" : extent,
//"type" : this.objectAttr.type,
//"feature" : this.objectAttr.feature,
//"treeid" : this.objectAttr.treeid
//});

//this.addThreeObject(obj3d);

//var record = this.getModelRecord();
//record.create(layer, undefined, obj3d);

//return obj3d;
//}

//gb3d.Map.prototype.createPolygonObject = function(arr, extent, option){
//var that = this;
//var coord = arr,
//geometry,
//shape,
//cart,
//result,
//obj3d,
//depth = option.depth ? parseFloat(option.depth) : 50.0,
//x = extent[0] + (extent[2] - extent[0]) / 2,
//y = extent[1] + (extent[3] - extent[1]) / 2,
//centerCart = Cesium.Cartesian3.fromDegrees(x, y),
//centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

//if(this.objectAttr.type === "MultiPolygon"){
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], [x, y],
//depth);
//} else if(this.objectAttr.type === "Polygon"){
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], [x, y],
//depth);
//} else {
//return;
//}

//geometry = new THREE.Geometry();
//// 이준 시작
//gb3d.Math.createUVVerticeOnPolygon(geometry, result);
//// 이준 끝
//// var bgeometry = new THREE.BufferGeometry();
//// bgeometry.fromGeometry(geometry);
//// console.log(bgeometry);
//var doubleSideMaterial = new THREE.MeshStandardMaterial({
//side : THREE.FrontSide
//});

//var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
//latheMesh.position.copy(centerCart);
//console.log(latheMesh.quaternion);
//// 원점을 바라보도록 설정한다
//latheMesh.lookAt(new THREE.Vector3(0,0,0));
//// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//var quaternion = latheMesh.quaternion.clone();
//// 쿼터니언각을 뒤집는다
//quaternion.inverse();
//// 모든 지오메트리 버텍스에
//var vertices = latheMesh.geometry.vertices;
//for (var i = 0; i < vertices.length; i++) {
//var vertex = vertices[i];
//// 뒤집은 쿼터니언각을 적용한다
//vertex.applyQuaternion(quaternion);
//}

//// var vnh = new THREE.VertexNormalsHelper( latheMesh, 5 );
//// this.getThreeScene().add(vnh);

//// geometry.computeVertexNormals();
//geometry.computeFlatVertexNormals();
//geometry.computeFaceNormals();

//this.getThreeScene().add(latheMesh);
//geometry.computeBoundingSphere();

//// userData 저장(THREE.Object3D 객체 속성)
//latheMesh.userData.type = this.objectAttr.type;
//latheMesh.userData.depth = depth;

//obj3d = new gb3d.object.ThreeObject({
//"object" : latheMesh,
//"center" : [x, y],
//"extent" : extent,
//"type" : this.objectAttr.type,
//"feature" : this.objectAttr.feature
//});

//this.addThreeObject(obj3d);

//var record = this.getModelRecord();
//record.create(layer, undefined, obj3d);

//return obj3d;
//}

//gb3d.Map.prototype.createLineStringObjectOnRoad = function(arr, extent,
//option){
//var that = this;
//var coord = arr,
//geometry,
//shape,
//cart,
//result,
//obj3d,
//depth = option.depth ? parseFloat(option.depth) : 50.0,
//x = extent[0] + (extent[2] - extent[0]) / 2,
//y = extent[1] + (extent[3] - extent[1]) / 2,
//centerCart = Cesium.Cartesian3.fromDegrees(x, y),
//centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

//var feature = this.objectAttr.feature.clone();
//if (feature.getGeometry() instanceof ol.geom.LineString) {
//var beforeGeomTest = feature.getGeometry().clone();
//console.log(beforeGeomTest.getCoordinates().length);
//var beforeCoord = beforeGeomTest.getCoordinates();
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(beforeCoord,
//option["width"]/2, [x, y], depth);
//} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {
//var beforeGeomTest = feature.getGeometry().clone();
//console.log(beforeGeomTest.getCoordinates().length);
//var beforeCoord = beforeGeomTest.getCoordinates();
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(beforeCoord[0],
//option["width"]/2, [x, y], depth);
//}

//geometry = new THREE.Geometry();

//// 이준 시작
//gb3d.Math.createUVVerticeOnLineString(geometry, result);
//// 이준 끝

//var doubleSideMaterial = new THREE.MeshStandardMaterial({
//side : THREE.FrontSide
//});

//var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
//// latheMesh.scale.set(1, 1, 1);
//latheMesh.position.copy(centerCart);
//// 원점을 바라보도록 설정한다
//latheMesh.lookAt(new THREE.Vector3(0,0,0));
//// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//var quaternion = latheMesh.quaternion.clone();
//// 쿼터니언각을 뒤집는다
//quaternion.inverse();
//// 모든 지오메트리 버텍스에
//var vertices = latheMesh.geometry.vertices;
//for (var i = 0; i < vertices.length; i++) {
//var vertex = vertices[i];
//// 뒤집은 쿼터니언각을 적용한다
//vertex.applyQuaternion(quaternion);
//}

//// geometry.computeVertexNormals();
//geometry.computeFlatVertexNormals();
//geometry.computeFaceNormals();

//this.getThreeScene().add(latheMesh);

//geometry.computeBoundingSphere();
//// userData 저장(THREE.Object3D 객체 속성)
//latheMesh.userData.type = this.objectAttr.type;
//latheMesh.userData.depth = depth;

//obj3d = new gb3d.object.ThreeObject({
//"object" : latheMesh,
//"center" : [x, y],
//"extent" : extent,
//"type" : this.objectAttr.type,
//"feature" : this.objectAttr.feature,
//"buffer" : option["width"]/2,
//"treeid" : this.objectAttr.treeid
//});

//this.addThreeObject(obj3d);

//var record = this.getModelRecord();
//record.create(layer, undefined, obj3d);

//return obj3d;

//}

//gb3d.Map.prototype.createLineStringObject = function(arr, extent, option){
//var that = this;
//var coord = arr,
//geometry,
//shape,
//cart,
//result,
//obj3d,
//depth = option.depth ? parseFloat(option.depth) : 50.0,
//x = extent[0] + (extent[2] - extent[0]) / 2,
//y = extent[1] + (extent[3] - extent[1]) / 2,
//centerCart = Cesium.Cartesian3.fromDegrees(x, y),
//centerHigh = Cesium.Cartesian3.fromDegrees(x, y, 1);

//var feature = this.objectAttr.feature.clone();
//if (feature.getGeometry() instanceof ol.geom.LineString) {
//var beforeGeomTest = feature.getGeometry().clone();
//// console.log(beforeGeomTest.getCoordinates().length);
//var beforeCoord = beforeGeomTest.getCoordinates();

//var tline = turf.lineString(beforeCoord);

//var tbuffered = turf.buffer(tline, option["width"]/2, {units : "meters"});
//// console.log(tbuffered);
//var gjson = new ol.format.GeoJSON();
//var bfeature = gjson.readFeature(tbuffered);

//coord = bfeature.getGeometry().getCoordinates(true);
//// console.log(bfeature.getGeometry().getType());
//// console.log(coord);

//} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {

//}

//if(this.objectAttr.type === "MultiLineString"){
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], [x, y],
//depth);
//} else if(this.objectAttr.type === "LineString"){
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], [x, y],
//depth);
//} else {
//return;
//}

//geometry = new THREE.Geometry();
//geometry.vertices = result.points;
//geometry.faces = result.faces;

//// 이준 시작
//var bottomStart = result.uvindex["bottomStart"];
//var bottomEnd = result.uvindex["bottomEnd"];
//var topStart = result.uvindex["topStart"];
//var topEnd = result.uvindex["topEnd"];
//var sideStart = result.uvindex["sideStart"];
//var sideEnd = result.uvindex["sideEnd"];
//// console.log(bottomStart);
//// console.log(bottomEnd);
//// console.log(topStart);
//// console.log(topEnd);
//// console.log(sideStart);
//// console.log(sideEnd);
//geometry.computeBoundingBox();
//var max = geometry.boundingBox.max,
//min = geometry.boundingBox.min;
//// console.log(max);
//// console.log(min);
//var offset = new THREE.Vector3(0 - min.x, 0 - min.y, 0 - min.z);
//var range = new THREE.Vector3(((min.x - max.x) * -1) ,((min.y - max.y) * -1),
//((min.z - max.z) * -1));
//var offset2d = new THREE.Vector2(0 - result.range2d.min.x, 0 -
//result.range2d.min.y);
//var range2d = new THREE.Vector2(((result.range2d.min.x -
//result.range2d.max.x) * -1) ,((result.range2d.min.y - result.range2d.max.y) *
//-1));
//var faces = geometry.faces;

//geometry.faceVertexUvs[0] = [];

//for (var i = bottomStart; i < bottomEnd; i++) {
//var face = faces[i];
//var v1 = result.points[face.a],
//v2 = result.points[face.b],
//v3 = result.points[face.c];
//geometry.faceVertexUvs[0].push([
//new THREE.Vector2(0, 0),
//new THREE.Vector2(0, 0),
//new THREE.Vector2(0, 0)
//]);
//}
//// 건물 윗면의 비율
//var bottomStart = 0.6;
//for (var i = topStart; i < topEnd; i++) {
//var face = faces[i];
//var v1 = result.points[face.a],
//v2 = result.points[face.b],
//v3 = result.points[face.c];
//var coord1 = result.coordinates[face.a - (result.coordinates.length - 1)];
//var coord2 = result.coordinates[face.b - (result.coordinates.length - 1)];
//var coord3 = result.coordinates[face.c - (result.coordinates.length - 1)];
//// console.log("2d 좌표의 값은:");
//// console.log(coord1);
//// console.log(coord2);
//// console.log(coord3);
//var vt1 = new THREE.Vector2(0, 0);
//var vt2 = new THREE.Vector2(1, 0);
//var vt3 = new THREE.Vector2(1, 1);
//// var vt1 = new THREE.Vector2((coord1[0] + offset2d.x)/range2d.x *
//// 0.4,(coord1[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
//// var vt2 = new THREE.Vector2((coord2[0] + offset2d.x)/range2d.x *
//// 0.4,(coord2[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
//// var vt3 = new THREE.Vector2((coord3[0] + offset2d.x)/range2d.x *
//// 0.4,(coord3[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
//geometry.faceVertexUvs[0].push([
//vt1,
//vt2,
//vt3
//]);
//}
//// 텍스쳐 이미지에서 건물 옆면의 비율
//var height = 0.6;
//// 건물 바닥의 비율
//var bottomStart = 0;
//for (var i = sideStart; i < sideEnd; i = i + 2) {
//var face = faces[i];
//var v1 = result.points[face.a],
//v2 = result.points[face.b],
//v3 = result.points[face.c];
//// console.log(v1.x+", "+v1.y);
//// console.log(v2.x+", "+v2.y);
//// console.log(v3.x+", "+v3.y);

//var from1to2 = parseFloat(v1.distanceTo(v2).toFixed(4));
//var val2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
//// console.log("절대적인 가로길이 비율은 "+val2);
//var ratioVal2 = from1to2 * 0.6 / result.range.max.y;
//if (ratioVal2 > 1) {
//ratioVal2 = 1;
//// var ratioHeight = result.range.max.y/from1to2;
//// bottomStart = height - ratioHeight;
//}

//// console.log("높이가 "+result.range.max.y+"일때 최고 높이에 대한 비율을 0.6으로하면 가로
//// 길이"+from1to2+"의 비율은 "+ratioVal2);
//// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
//var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
//var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
//// console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
//var from2to3 = v2.distanceTo(v3);
//// // console.log("2부터 3까지 거리는: "+from2to3);
//geometry.faceVertexUvs[0].push([
//new THREE.Vector2(0, bottomStart),
//new THREE.Vector2(ratioVal2, bottomStart),
//new THREE.Vector2(0, height)
//]);
//var face2 = faces[i+1];
//var v1_2 = result.points[face2.a],
//v2_2 = result.points[face2.b],
//v3_2 = result.points[face2.c];
//var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
//var val2_2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
//// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
//var from1to3 = v1_2.distanceTo(v3_2);
//// // console.log("1부터 3까지 거리는: "+from1to3);
//var from2to3 = parseFloat(v2_2.distanceTo(v3_2).toFixed(4));
//var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
//// console.log("2부터 3까지 거리(v축, y축)는: "+from2to3);
//geometry.faceVertexUvs[0].push([
//new THREE.Vector2(0, height),
//new THREE.Vector2(ratioVal2, bottomStart),
//new THREE.Vector2(ratioVal2, height)
//]);
//}

//geometry.uvsNeedUpdate = true;
//// 이준 끝

//var doubleSideMaterial = new THREE.MeshStandardMaterial({
//side : THREE.FrontSide
//});

//var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
//// latheMesh.scale.set(1, 1, 1);
//latheMesh.position.copy(centerCart);
//// 원점을 바라보도록 설정한다
//latheMesh.lookAt(new THREE.Vector3(0,0,0));
//// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//var quaternion = latheMesh.quaternion.clone();
//// 쿼터니언각을 뒤집는다
//quaternion.inverse();
//// 모든 지오메트리 버텍스에
//var vertices = latheMesh.geometry.vertices;
//for (var i = 0; i < vertices.length; i++) {
//var vertex = vertices[i];
//// 뒤집은 쿼터니언각을 적용한다
//vertex.applyQuaternion(quaternion);
//}

//// geometry.computeVertexNormals();
//geometry.computeFlatVertexNormals();
//geometry.computeFaceNormals();

//this.getThreeScene().add(latheMesh);

//geometry.computeBoundingSphere();
//// userData 저장(THREE.Object3D 객체 속성)
//latheMesh.userData.type = this.objectAttr.type;
//latheMesh.userData.depth = depth;

//obj3d = new gb3d.object.ThreeObject({
//"object" : latheMesh,
//"center" : [x, y],
//"extent" : extent,
//"type" : this.objectAttr.type,
//"feature" : this.objectAttr.feature,
//"buffer" : option["width"]/2
//});

//this.addThreeObject(obj3d);
//return obj3d;
//}

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

	var recursiveSelect = function(obj, uuid){
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

	var objs = this.getThreeObjects();
	for (var i = 0; i < objs.length; i++) {
		var flag = recursiveSelect(objs[i].getObject(), uuid);
		if (flag) {
			threeObject = objs[i];
			break;
		}
	}
//	if(e.getObject().uuid === uuid){
//	threeObject = e;
//	}
	return threeObject;
}

/**
 * Object를 삭제한다.
 * 
 * @method gb3d.Map#removeObject
 * @param {THREE.Object3D |
 *            String} object - ThreeObject 객체 또는 uuid
 * @param {Boolean}
 *            bool - true 설정 시 remove 취소. 기본 false
 * @function
 */
gb3d.Map.prototype.removeThreeObject = function( object, cancel ) {
	var threeObject = undefined;
	var bool = cancel ? true : false;

	if( object instanceof gb3d.object.ThreeObject ) {
		threeObject = object;
	} else if( typeof object === "string" ) {
		threeObject = this.getThreeObjectByUuid( object );
	}

	if( !threeObject ) {
		return;
	}

	var scene = this.getThreeScene(),
	obj = threeObject.getObject(),
	layer = threeObject.getLayer(),
	feature = threeObject.getFeature();

	if( bool ){
		obj["visible"] = true;
//		obj.userData.remove = false;
	} else {
		obj["visible"] = false;
//		obj.userData.remove = true;
	}
}

//gb3d.Map.prototype.selectThree = function(uuid){
//var threeObject = this.getThreeObjectByUuid(uuid);
//if(!threeObject){
//return false;
//}

//var object = threeObject.getObject();
//if(this.tools.edit3d instanceof gb3d.edit.EditingTool3D){
//this.tools.edit3d.pickedObject_ = object;
//this.tools.edit3d.threeTransformControls.attach( object );
//// this.tools.edit3d.updateAttributeTab( object );
//// this.tools.edit3d.updateStyleTab( object );

//this.tools.edit3d.applySelectedOutline(object);

//if ( object.userData.object !== undefined ) {
//// helper
//threeEditor.select( object.userData.object );
//} else {
//threeEditor.select( object );
//}

//return threeObject;
//} else {
//return false;
//}
//}

//gb3d.Map.prototype.selectFeature = function(id){
//var threeObject = this.getThreeObjectById(id);
//if(!threeObject){
//return false;
//}

//if(this.tools.edit2d instanceof gb3d.edit.EditingTool2D){
//if(!this.tools.edit2d.interaction.select){
//return false;
//}
//this.tools.edit2d.interaction.select.getFeatures().clear();
//this.tools.edit2d.interaction.select.getFeatures().push(
//threeObject.getFeature() );
//return threeObject;
//} else {
//return false;
//}
//}

//gb3d.Map.prototype.unselectThree = function(uuid){
//var threeObject = this.getThreeObjectByUuid(uuid);
//if(!threeObject){
//return false;
//}

//if(this.tools.edit3d instanceof gb3d.edit.EditingTool3D){
//this.tools.edit3d.pickedObject_ = threeObject.getObject();
//this.tools.edit3d.threeTransformControls.detach( threeObject.getObject() );
//// this.tools.edit3d.updateAttributeTab( undefined );
//// this.tools.edit3d.updateStyleTab( undefined );
//threeEditor.select( null );
//this.tools.edit3d.removeSelectedOutline();
//return threeObject;
//} else {
//return false;
//}
//}

//gb3d.Map.prototype.unselectFeature = function(id){
//var threeObject = this.getThreeObjectById(id);
//if(!threeObject){
//return false;
//}

//if(this.tools.edit2d instanceof gb3d.edit.EditingTool2D){
//if(!this.tools.edit2d.interaction.select){
//return false;
//}
//this.tools.edit2d.interaction.select.getFeatures().remove(
//threeObject.getFeature() );
//return threeObject;
//} else {
//return false;
//}
//}

//gb3d.Map.prototype.syncSelect = function(id){
//var id = id;

//var threeObject = this.getThreeObjectById(id);

//if(!threeObject){
//threeObject = this.getThreeObjectByUuid(id);
//if(!threeObject){
//return;
//}

//this.selectFeature(threeObject.getFeature().getId());
//} else {
//this.selectThree(threeObject.getObject().uuid);
//// this.cesiumViewer.camera.flyTo({
//// destination: Cesium.Cartesian3.fromDegrees(threeObject.getCenter()[0],
//// threeObject.getCenter()[1],
//// this.cesiumViewer.camera.positionCartographic.height),
//// duration: 0
//// });
//}
//}

//gb3d.Map.prototype.syncUnselect = function(id){
//var id = id;

//var threeObject = this.getThreeObjectById(id);

//if(!threeObject){
//threeObject = this.getThreeObjectByUuid(id);
//if(!threeObject){
//return;
//}
//} else {
//this.unselectThree(threeObject.getObject().uuid);
//}
//if (threeObject) {
//this.unselectFeature(threeObject.getFeature().getId());
//}
//}

//gb3d.Map.prototype.moveObject2Dfrom3D = function(center, uuid){
//var id = uuid,
//centerCoord = center,
//carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(centerCoord),
//lon = Cesium.Math.toDegrees(carto.longitude),
//lat = Cesium.Math.toDegrees(carto.latitude),
//threeObject = this.getThreeObjectByUuid(id),
//geometry = threeObject.getFeature().getGeometry(),
//lastCenter = threeObject.getCenter(),
//deltaX = lon - lastCenter[0],
//deltaY = lat - lastCenter[1];

//geometry.translate(deltaX, deltaY);
//threeObject.setCenter([lon, lat]);
//}

//gb3d.Map.prototype.modifyObject2Dfrom3D = function(vertices, uuid){
//var v = JSON.parse(JSON.stringify(vertices)),
//id = uuid,
//threeObject = this.getThreeObjectByUuid(id),
//position = threeObject.getObject().position,
//feature = threeObject.getFeature(),
//geometry = feature.getGeometry();

//var degrees = [];
//var cart, carto, lon, lat;
//for(var i = 0; i < v.length/2; i++){
//v[i].x += position.x;
//v[i].y += position.y;
//v[i].z += position.z;

//cart = new Cesium.Cartesian3(v[i].x, v[i].y, v[i].z);
//carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cart);

//lon = Cesium.Math.toDegrees(carto.longitude);
//lat = Cesium.Math.toDegrees(carto.latitude);

//degrees.push([lon, lat]);
//}
//degrees.push(degrees[0]);
//// threeObject.getFeature().getGeometry().setCoordinates(degrees);
//}

//gb3d.Map.prototype.moveObject3Dfrom2D = function(id, center, coord){
//var featureId = id;
//var featureCoord = coord;
//var threeObject = this.getThreeObjectById(featureId);
//if(!threeObject){
//return;
//}

//var type = threeObject.getType();

//var lastCenter = threeObject.getCenter();
//var position = threeObject.getObject().position;
//var lastCart = Cesium.Cartesian3.fromDegrees(lastCenter[0], lastCenter[1]);
//var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) +
//Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

//var centerCoord = center;
//var cart = Cesium.Cartesian3.fromDegrees(centerCoord[0], centerCoord[1]);

//var a, b, cp;
//switch(type){
//case "Point":
//case "MultiPoint":
//a = featureCoord;
//b = featureCoord;
//break;
//case "LineString":
//var feature = this.objectAttr.feature.clone();
//if (feature.getGeometry() instanceof ol.geom.LineString) {
//var beforeGeomTest = feature.getGeometry().clone();
//console.log(beforeGeomTest.getCoordinates().length);
//var beforeCoord = beforeGeomTest.getCoordinates();

//var tline = turf.lineString(beforeCoord);

//var tbuffered = turf.buffer(tline, threeObject.getBuffer(), {units :
//"meters"});
//console.log(tbuffered);
//var gjson = new ol.format.GeoJSON();
//var bfeature = gjson.readFeature(tbuffered);

//featureCoord = bfeature.getGeometry().getCoordinates(true);
//} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {

//}
//a = featureCoord[0][0];
//b = featureCoord[0][1];
//break;
//case "Polygon":
//case "MultiLineString":
//a = featureCoord[0][0];
//b = featureCoord[0][1];
//break;
//case "MultiPolygon":
//a = featureCoord[0][0][0];
//b = featureCoord[0][0][1];
//break;
//default:
//break;
//}

//if( type === "Point" || type === "MultiPoint" ){
//position.copy(new THREE.Vector3(cart.x + vec, cart.y + vec, cart.z + vec));
//} else {
//cp = gb3d.Math.crossProductFromDegrees(a, b, centerCoord);
//position.copy(new THREE.Vector3(cart.x + (cp.u/cp.s)*vec, cart.y +
//(cp.v/cp.s)*vec, cart.z + (cp.w/cp.s)*vec));
//}

//threeObject.upModCount();
//threeObject.setCenter(centerCoord);

//}

//gb3d.Map.prototype.modify3DVertices = function(arr, id, extent, event) {
//var objects = this.getThreeObjects(),
//evt = event,
//coord = arr,
//featureId = id,
//ext = extent,
//x = ext[0] + (ext[2] - ext[0]) / 2,
//y = ext[1] + (ext[3] - ext[1]) / 2,
//points = [],
//threeObject,
//object = undefined,
//result,
//geometry,
//shape,
//geom,
//cart;

//var threeObject = this.getThreeObjectById(featureId);
//var isFile = threeObject.getIsFromFile();
//if(!threeObject){
//return;
//}

//var lastCenter = threeObject.getCenter();
//var position = threeObject.getObject().position;
//var lastCart = Cesium.Cartesian3.fromDegrees(lastCenter[0], lastCenter[1]);
//// var lastCart = Cesium.Cartesian3.fromDegrees(x, y);
//var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) +
//Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z, 2));

//// === 이준 시작 ===
//object = threeObject.getObject();
//if(object === undefined){
//return;
//}
//if(coord.length === 0){
//coord = threeObject.getFeature().getGeometry().getCoordinates(true);
//}
//var opt = object.userData;
//var center = [x, y];
//var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
//var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

//if (isFile) {
//if (evt.angle_ !== undefined && (evt.angle_ > 0 || evt.angle_ < 0) ) {
//// 회전
//object.rotateZ(evt.angle_);
//console.log(object.scale);
//} else if (evt.ratio_ !== undefined) {
//// 스케일
//object.scale.x = object.scale.x * evt.ratio_;
//object.scale.y = object.scale.y * evt.ratio_;
//object.scale.z = object.scale.z * evt.ratio_;
//}
//return;
//// var floor = gb3d.io.ImporterThree.getFloorPlan(object, center, []);
//// var features = turf.featureCollection(floor);
//// var dissolved = undefined;
//// try {
//// dissolved = turf.dissolve(features);
//// } catch (e) {
//// // TODO: handle exception
//// console.error(e);
//// return;
//// }
//// var fea;
//// if (dissolved) {
//// if (dissolved.type === "FeatureCollection") {
//// fea = [];
//// for (var i = 0; i < dissolved.features.length; i++) {
//// if (dissolved.features[i].geometry.type === 'Polygon') {
//// if (this.tools.edit2d.getLayer().getSource().get("git").geometry ===
//// "Polygon") {
//// geom = new ol.geom.Polygon(dissolved.features[i].geometry.coordinates,
//"XY");
//// } else if (this.tools.edit2d.getLayer().getSource().get("git").geometry
//===
//// "MultiPolygon") {
//// geom = new ol.geom.MultiPolygon([
//dissolved.features[i].geometry.coordinates
//// ], "XY");
//// }
//// break;
//// } else if (dissolved.features[i].geometry.type === 'MultiPolygon') {
//// if (this.tools.edit2d.getLayer().getSource().get("git").geometry ===
//// "Polygon") {
//// var outer = dissolved.features[i].geometry.coordinates;
//// var polygon = outer[0];
//// geom = new ol.geom.Polygon(polygon, "XY");
//// } else if (this.tools.edit2d.getLayer().getSource().get("git").geometry
//===
//// "MultiPolygon") {
//// geom = new
//ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates,
//// "XY");
//// }
//// break;
//// }
//// }
//// // source.addFeatures(fea);
//// }
//// }
//// return geom;
//}
//var recursive = function(obj, result){
//if (obj instanceof THREE.Group) {
//var children = obj.children;
//for (var i = 0; i < children.length; i++) {
//result = recursive(children[i], result);
//}
//} else if (obj instanceof THREE.Mesh) {
//result.push(obj);
//}
//return result;
//};
//var meshes = recursive(object, []);
//for (var i = 0; i < meshes.length; i++) {
//geometry = meshes[i].geometry;

//if (opt.type === "MultiPoint" || opt.type === "Point") {
//geometry = new THREE.BoxGeometry(parseInt(opt.width), parseInt(opt.height),
//parseInt(opt.depth));
//geometry.vertices.forEach(function(vert, v){
//vert.z += opt.depth/2;
//});
//object.geometry = geometry;
//// return;
//// } else if (opt.type === "MultiLineString" || opt.type === "LineString") {
//// var feature = threeObject.getFeature().clone();
//// if (feature.getGeometry() instanceof ol.geom.LineString) {
//// var beforeGeomTest = feature.getGeometry().clone();
//// console.log(beforeGeomTest.getCoordinates().length);
//// var beforeCoord = beforeGeomTest.getCoordinates();
////
//// var tline = turf.lineString(beforeCoord);
////
//// var tbuffered = turf.buffer(tline, threeObject.getBuffer(), {units :
//// "meters"});
//// console.log(tbuffered);
//// var gjson = new ol.format.GeoJSON();
//// var bfeature = gjson.readFeature(tbuffered);
////
//// coord = bfeature.getGeometry().getCoordinates(true);
//// console.log(bfeature.getGeometry().getType());
//// console.log(coord);
////
//// } else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {
////
//// }
//} else {
//var a, b, cp;
//if(geometry instanceof THREE.Geometry){
//geometry = new THREE.Geometry();
//if(opt.type === "MultiPolygon"){
//if (!isFile) {
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], center,
//parseFloat(opt.depth));
//gb3d.Math.createUVVerticeOnPolygon(geometry, result);
//a = coord[0][0][0];
//b = coord[0][0][1];
//}
//} else if (opt.type === "Polygon") {
//if (!isFile) {
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], center,
//parseFloat(opt.depth));
//gb3d.Math.createUVVerticeOnPolygon(geometry, result);
//a = coord[0][0];
//b = coord[0][1];
//}
//} else if(opt.type === "MultiLineString"){
//if (!isFile) {
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord[0],
//threeObject.getBuffer(), center, parseFloat(opt.depth));
//gb3d.Math.createUVVerticeOnLineString(geometry, result);
//a = coord[0];
//b = coord[1];
//}
//} else if(opt.type === "LineString"){
//if (!isFile) {
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord,
//threeObject.getBuffer(), center, parseFloat(opt.depth));
//gb3d.Math.createUVVerticeOnLineString(geometry, result);
//a = coord[0];
//b = coord[1];
//}
//} else {
//return;
//}


//// geometry.vertices = result.points;
//// geometry.faces = result.faces;
//// geometry.translate(-centerCart.x, -centerCart.y,
//// -centerCart.z);

//object.lookAt(new THREE.Vector3(0,0,0));
//// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y,
//centerHigh.z));
//// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//var quaternion = object.quaternion.clone();
//// 쿼터니언각을 뒤집는다
//quaternion.inverse();
//// 모든 지오메트리 버텍스에
//var vertices = geometry.vertices;
//for (var i = 0; i < vertices.length; i++) {
//var vertex = vertices[i];
//// 뒤집은 쿼터니언각을 적용한다
//vertex.applyQuaternion(quaternion);
//}

//object.geometry = geometry;
//// compute face Normals
//geometry.computeFaceNormals();
//} else if (geometry instanceof THREE.BufferGeometry) {
//if(opt.type === "MultiPolygon"){
//if (!isFile) {
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0][0], center,
//parseFloat(opt.depth));
//a = coord[0][0][0];
//b = coord[0][0][1];
//}
//} else if (opt.type === "Polygon") {
//if (!isFile) {
//result = gb3d.Math.getPolygonVertexAndFaceFromDegrees(coord[0], center,
//parseFloat(opt.depth));
//a = coord[0][0];
//b = coord[0][1];
//}
//} else if(opt.type === "MultiLineString"){
//if (!isFile) {
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord[0],
//threeObject.getBuffer(), center, parseFloat(opt.depth));
//a = coord[0];
//b = coord[1];
//}
//} else if(opt.type === "LineString"){
//if (!isFile) {
//result = gb3d.Math.getLineStringVertexAndFaceFromDegrees(coord,
//threeObject.getBuffer(), center, parseFloat(opt.depth));
//a = coord[0];
//b = coord[1];
//}
//} else {
//return;
//}

//if (!isFile) {
//geometry = new THREE.Geometry();
//geometry.vertices = result.points;
//geometry.faces = result.faces;
//// geometry.translate(-centerCart.x, -centerCart.y,
//// -centerCart.z);

//object.lookAt(new THREE.Vector3(0,0,0));
//// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y,
//centerHigh.z));
//// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//var quaternion = object.quaternion.clone();
//// 쿼터니언각을 뒤집는다
//quaternion.inverse();
//// 모든 지오메트리 버텍스에
//var vertices = geometry.vertices;
//for (var i = 0; i < vertices.length; i++) {
//var vertex = vertices[i];
//// 뒤집은 쿼터니언각을 적용한다
//vertex.applyQuaternion(quaternion);
//}

//object.geometry = geometry;
//// compute face Normals
//geometry.computeFaceNormals();
//}
//}
//cp = gb3d.Math.crossProductFromDegrees(a, b, center);

//// var lastCart = Cesium.Cartesian3.fromDegrees(x, y);
//// var vec = Math.sqrt(Math.pow(position.x - lastCart.x, 2) +
//// Math.pow(position.y - lastCart.y, 2) + Math.pow(position.z - lastCart.z,
//2));

//position.copy(new THREE.Vector3(centerCart.x + (cp.u/cp.s)*vec, centerCart.y
//+ (cp.v/cp.s)*vec, centerCart.z + (cp.w/cp.s)*vec));
//// position.copy(new THREE.Vector3(lastCart.x, lastCart.y, lastCart.z));
//// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y,
//centerHigh.z));
//}
//// threeObject 수정 횟수 증가, Center 값 재설정
//threeObject.upModCount();
//threeObject.setCenter(center);
//}
//return geom;
//};

/**
 * Object 생성을 위한 사전작업 수행 함수. Feature 정보를 저장하고 Feature type에 따른 모달을 생성한다.
 * 
 * @method gb3d.Map#addTileset
 * @param {gb3d.object.Tileset}
 *            tileset - 타일셋 객체
 */
gb3d.Map.prototype.addTileset = function(tileset){
	var that = this;
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
		var city = this.getCesiumViewer().scene.primitives.add(ctile);
//		this.getCesiumViewer().zoomTo(ctile);

		var heightOffset = 0;
		city.readyPromise.then(function(tileset) {
			that.getCesiumViewer().zoomTo(tileset);
			// 타일 추가 이벤트
			var boundingSphere = tileset.boundingSphere;
			var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
			var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
			var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
			var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
		});
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

/**
 * three 컴포저 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeComposer
 * @return {THREE.EffectComposer}
 */
gb3d.Map.prototype.getThreeComposer = function(){
	return this.threeComposer;
};

/**
 * 바인딩 영역을 반환한다
 * 
 * @method gb3d.Map#getBindingElement
 * @return {HTMLElement}
 */
gb3d.Map.prototype.getBindingElement = function(){
	return this.bind3dElem;
};

