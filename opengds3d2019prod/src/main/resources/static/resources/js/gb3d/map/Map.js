/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};

/**
 * @classdesc Map 객체를 정의한다. Cesium 과 ThreeJS 라이브러리를 통합하여 가시화한다.
 * @class gb3d.Map
 * @memberof gb3d
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {gb.Map} gbMap - 2D Map 객체
 * @param {gb3d.edit.ModelRecord} modelRecord - 3D 객체 변경이력 관리 객체
 * @author SOYIJUN
 */
gb3d.Map = function(obj) {

	var that = this;
	var options = obj ? obj : {};
	/**
	 * 스피너 표시 중 여부
	 */
	this.pause = false;
	/**
	 * 3d 지도 영역 엘리먼트
	 * 
	 * @type {HTMLElement}
	 */
	this.target = undefined;
	/**
	 * cesium 영역 엘리먼트
	 * 
	 * @type {HTMLElement}
	 */
	this.cesiumElem = $("<div>").attr({
		"id" : "gb3d-map-cesium-area"
	}).addClass("gb3d-map-cesium-area")[0];
	/**
	 * three 영역 엘리먼트
	 * 
	 * @type {HTMLElement}
	 */
	this.threeElem = $("<div>").addClass("gb3d-map-three-area")[0];
	/**
	 * cesium, three 묶을 영역
	 * 
	 * @type {HTMLElement}
	 */
	this.bind3dElem = $("<div>").addClass("gb3d-map-bind3d-area")[0];
	/**
	 * gbMap 2D 지도 영역 객체
	 * 
	 * @type {gb.Map}
	 */
	this.gbMap = options.gbMap instanceof gb.Map ? options.gbMap : undefined;
	/**
	 * 3d 모델 레코드 객채
	 * 
	 * @type {gb3d.edit.ModelRecord}
	 */
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
	
	/**
	 * cesium viewer
	 * 
	 * @type {Cesium.Viewer}
	 */
	this.cesiumViewer = new Cesium.Viewer(this.cesiumElem, {
// useDefaultRenderLoop : false,
		scene3DOnly: true,
		selectionIndicator : false,
		homeButton : true,
		sceneModePicker : false,
		infoBox : false,
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

// this.cesiumViewer.extend(Cesium.viewerCesiumInspectorMixin);
// this.cesiumViewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

	var initp;
	if (options.initPosition) {
		initp = Array.isArray(options.initPosition) ? options.initPosition : [0, 0];
	} else {
		initp = [0, 0];
	}
	// 초기 위치
	this.initPosition = initp; 
	if (this.initPosition.length === 2) {
		this.initPosition.push(30000);
	}
// Cesium.Cartesian3.fromDegrees(options.initPosition[0],
// options.initPosition[1] - 1, 200000) : this.center;


	this.gbMap.getView().setCenter([this.initPosition[0],this.initPosition[1]]);
	// cesium 카메라를 지도 중심으로 이동

	this.cesiumViewer.camera.flyTo({
		destination : Cesium.Cartesian3.fromDegrees(this.initPosition[0],this.initPosition[1], this.initPosition[2])
	});

	/**
	 * 3D Tileset 객체
	 * 
	 * @type {Object}
	 */
	this.tiles = {};

	/**
	 * 좌표계 바운딩 박스 - 최소값
	 * 
	 * @type {number[]}
	 */
	this.minCRS = [ -180.0, -90.0 ];
	/**
	 * 좌표계 바운딩 박스 - 최대값
	 * 
	 * @type {number[]}
	 */
	this.maxCRS = [ 180.0, 90.0 ];

	/**
	 * 좌표계 중심
	 * 
	 * @type {Cesium.Cartesian3}
	 */
	this.center = Cesium.Cartesian3.fromDegrees((this.minCRS[0] + this.maxCRS[0]) / 2, ((this.minCRS[1] + this.maxCRS[1]) / 2) - 1, 200000);

	/**
	 * 지도에 표시할 객체 배열
	 * 
	 * @type {Array.<THREE.Object3D>}
	 */
	this.threeObjects = [];

	// three camera 생성자 옵션
	var fov = 45;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width / height;
	var near = 1;
	var far = 10*1000*1000;

// THREE.Object3D.DefaultUp.set( 0, 0, 1 );
	/**
	 * three js scene 객체
	 * 
	 * @type {THREE.Scene}
	 */
	this.threeScene = new THREE.Scene();
	/**
	 * 그리드 헬퍼 객체
	 * 
	 * @type {THREE.GridHelper}
	 */
	this.threeScene.add(new THREE.GridHelper());
	/**
	 * three 카메라 객체
	 * 
	 * @type {THREE.PerspectiveCamera}
	 */
	this.threeCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	/**
	 * three 랜더러
	 * 
	 * @type {THREE.WebGLRenderer}
	 */
	this.threeRenderer = new THREE.WebGLRenderer({alpha: true});
// this.threeRenderer.shadowMap.enabled = true;
	/**
	 * three 이펙트 객체
	 * 
	 * @type {THREE.EffectComposer}
	 */
	this.threeComposer = new THREE.EffectComposer(this.threeRenderer);
	/**
	 * 씬 내 기본 조명 객체
	 * 
	 * @type {THREE.AmbientLight}
	 */
	this.ambientLight = new THREE.AmbientLight( 0x404040 );
	this.threeScene.add(this.ambientLight);
	/**
	 * 씬 내 태양 조명 객체
	 * 
	 * @type {THREE.PointLight}
	 */
	this.sunLight = new THREE.PointLight();
	this.sunLight.position.set( 0, 0, 0 );
	that.sunLight.position.x = -456555707.42440885;
	that.sunLight.position.y = 1309511774.8390865;
	that.sunLight.position.z = 2611947852.695035;
	this.threeScene.add(this.sunLight);

	// 영역에 three 추가
	this.threeElem.appendChild(this.threeRenderer.domElement);
	/**
	 * gb3d 카메라 객체
	 * 
	 * @type {gb3d.Camera}
	 */
	this.camera = new gb3d.Camera({
		"cesiumCamera" : this.cesiumViewer.camera,
		"threeCamera" : this.threeCamera,
		"olMap" : this.gbMap.getUpperMap(),
		"sync2D" : false
	});
	this.camera.syncWith2D();

	/**
	 * 렌더링을 위한 루프 함수
	 * 
	 * @type {Function}
	 */
	this.loop_ = function(){
		that.requestFrame = requestAnimationFrame(that.loop_);
// that.renderCesium();
		that.renderThreeObj();
		that.threeComposer.render();
		var sunCart = Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame();

// that.sunLight.position.set( sunCart.x, sunCart.y, sunCart.z );
// var time = Date.now() * 0.0005;
// that.sunLight.position.x = Math.sin( time * 0.7 ) * 3000000000;
// that.sunLight.position.y = Math.cos( time * 0.5 ) * 4000000000;
// that.sunLight.position.z = Math.cos( time * 0.3 ) * 3000000000;
// console.log(that.sunLight.position);
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
	that.getThreeComposer().setSize(width, height);
	that.getThreeRenderer().render(that.threeScene, that.threeCamera);
}

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
 * @param {Array.<gb3d.object.ThreeObject>} ThreeObject 배열
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
 * @param {gb3d.object.ThreeObject} object - ThreeObject
 */
gb3d.Map.prototype.addThreeObject = function(object){
	if(object instanceof gb3d.object.ThreeObject){
		this.threeObjects.push(object);
// this.getThreeScene().add(object.getObject());
		// Three Object add event
		this.threeScene.dispatchEvent({type: "addObject", object: object});
	} else {
		console.error("Three object must be gb3d.object.ThreeObject type");
	}
}

/**
 * ThreeJS 객체를 삭제한다. (객체를 씬에서 삭제함, 렌더링도 취소함)
 * 
 * @method gb3d.Map#removeThreeObjectById
 * @param {gb3d.object.ThreeObject} object - ThreeObject
 */
gb3d.Map.prototype.deleteThreeObject = function(object){
	if (object instanceof gb3d.object.ThreeObject) {
		var fid = object.getFeature().getId();
		if (fid) {
			var objs = this.getThreeObjects();
			var idx = -1;
			if (Array.isArray(objs)) {
				for (var i = 0; i < objs.length; i++) {
					if (objs[i].getFeature().getId() === fid) {
						idx = i;
						break;
					}
				}
				if (idx !== -1) {
					var three = objs[idx];
					var mesh = three.getObject();
					if (mesh) {
						if (mesh.geometry) {
							mesh.geometry.dispose();
						}
						if (mesh.material) {
							if (mesh.material.texture) {
								mesh.material.texture.dispose();
							}
							mesh.material.dispose();
						}
						this.getThreeScene().remove(mesh);
						this.getThreeScene().dispose();
						three.setObject(undefined);
					}
					objs.splice(idx, 1);
				}
			}
		}
	}
}
/**
 * Feature id로 Three Object 객체를 검색 및 반환
 * 
 * @method gb3d.Map#getThreeObjectById
 * @param {string} id - Feature ID
 * @param {ol.layer.Base} layer - 특정할 레이어 객체
 * @return {gb3d.object.ThreeObject}
 */
gb3d.Map.prototype.getThreeObjectById = function(id, layer){
	var threeObject = undefined,
	featureId = id;

	var objs = this.getThreeObjects();
	for (var i = 0; i < objs.length; i++) {
		var e = objs[i];
		if(e.getFeature().getId() === featureId){
			if (layer) {
				var mlayer = e.getLayer();
				if (mlayer) {
					var mtree = mlayer.get("treeid");
					if (!mtree) {
						var source = mlayer.getSource();
						if (source) {
							var git = source.get("git");
							mtree = git.treeid;
						}
					}
					var ltree = layer.get("treeid");
					if (!ltree) {
						var source = layer.getSource();
						if (source) {
							var git = source.get("git");
							ltree = git.treeid;
						}
					}
					if(mtree === ltree){
						threeObject = e;
						break;
					}
				} else {
					threeObject = e;
					break;
				}
			} else {
				threeObject = e;
				break;
			}
		}
	}
	return threeObject;
}

/**
 * Three Object id로 Three Object 객체를 검색 및 반환
 * 
 * @method gb3d.Map#getThreeObjectByUuid
 * @param {string} id - Three Object ID
 * @return {gb3d.object.ThreeObject} 검색된 ThreeObject 객체
 */
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
// if(e.getObject().uuid === uuid){
// threeObject = e;
// }
	return threeObject;
}

/**
 * Object를 삭제한다.
 * 
 * @method gb3d.Map#removeThreeObject
 * @param {THREE.Object3D | String} object - ThreeObject 객체 또는 uuid
 * @param {boolean} [cancel=false] - true 설정 시 remove 취소. 기본 false
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
// obj.userData.remove = false;
	} else {
		obj["visible"] = false;
// obj.userData.remove = true;
	}
}

/**
 * 타일셋을 추가한다.
 * 
 * @Deprecated
 * @method gb3d.Map#addTileset
 * @param {gb3d.object.Tileset} tileset - 타일셋 객체
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
// this.getCesiumViewer().zoomTo(ctile);

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
 * @method gb3d.Map#getTilesetByLayer
 * @param {String} lid - 레이어 id
 * @return {Array.<gb3d.object.Tileset>} 타일셋 객체 묶음
 */
gb3d.Map.prototype.getTilesetByLayer = function(lid){
	return this.tiles[lid];
}

/**
 * 타일셋 객체 묶음을 설정한다.
 * 
 * @method gb3d.Map#setTileset
 * @param {Object} tiles - 타일 객체 묶음
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

/**
 * 스피너를 보여준다.
 * 
 * @method gb3d.Map#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 */
gb3d.Map.prototype.showSpinner = function(show) {
	if (show) {
		var spinnerArea = $("<div>").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x")).addClass("gb-spinner-wrap").addClass(
				"gb-spinner-body").addClass("gb-spinner-position-40");
		$(this.getBindingElement()).append(spinnerArea);
		this.pause = true;
	} else {
		$(this.getBindingElement()).find(".gb-spinner-wrap").remove();
		this.pause = false;
	}
};

/**
 * 스피너 표시 유무를 반환한다.
 * 
 * @method gb3d.Map#getPause
 * @return {boolean} 현재 스피너 표시 중 여부
 */
gb3d.Map.prototype.getPause = function(){
	return this.pause;
};