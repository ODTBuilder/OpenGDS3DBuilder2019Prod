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

	// this.gbMap.setSize(width2d, height2d);

	// 세슘 뷰어 객체
	this.cesium = undefined;

	// 3d 지도 영역으로 설정할 부분이 div 객체인지 확인
	if ($(options.target3d).is("div")) {
		this.target3d = $(options.target3d)[0];
		$(this.target3d).append(this.bind3dElem);
		$(this.bind3dElem).append(this.cesiumElem);
		$(this.bind3dElem).append(this.threeElem);
	} else {
		console.error("target must be div element");
		return;
	}

	// cesium 선언
	this.cesiumViewer = new Cesium.Viewer(this.cesiumElem, {
		useDefaultRenderLoop : false,
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

	var minCRS = [125.23,39.55];
	var maxCRS = [126.23,41.55];
	this.center = Cesium.Cartesian3.fromDegrees((minCRS[0] + maxCRS[0]) / 2, ((minCRS[1] + maxCRS[1]) / 2) - 1, 200000);

	this.cesiumViewer.camera.flyTo({
		destination : this.center,
		orientation : {
			heading : Cesium.Math.toRadians(0),
			pitch : Cesium.Math.toRadians(-60),
			roll : Cesium.Math.toRadians(0)
		},
		duration: 3
	});

	this.threeObjects = [];
	
	var fov = 45;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width / height;
	var near = 1;
	var far = 10*1000*1000;

	this.threeScene = new THREE.Scene();
	this.threeScene.add(new THREE.GridHelper());

	this.threeCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);

	this.threeRenderer = new THREE.WebGLRenderer({alpha: true});

	this.threeOrbitControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
	this.threeOrbitControls.update();
	this.threeOrbitControls.addEventListener('change', that.render);
	
     this.threeOrbitControls.addEventListener( 'start', function () {
       cancelHideTransform();
     });
     this.threeOrbitControls.addEventListener( 'end', function () {
       delayHideTransform();
     });

	this.threeTransformControls = new THREE.TransformControls(this.threeCamera, this.threeRenderer.domElement);
	this.threeTransformControls.addEventListener('change', that.render);
	this.threeTransformControls.addEventListener('dragging-changed', function(event){
		that.threeOrbitControls.enabled = !event.vale;
	});

	this.threeElem.appendChild(this.threeRenderer.domElement);

	var hiding;

	function delayHideTransform() {
		cancelHideTransform();
		hideTransform();
	}

	function hideTransform() {
		hiding = setTimeout( function () {
			that.transformControl.detach( that.transformControl.object );
		}, 2500 );
	}

	function cancelHideTransform(){
		if ( hiding ) clearTimeout( hiding );
	}

	// initCesium(); // Initialize Cesium renderer
	// initThree(); // Initialize Three.js renderer
	// init3DObject(); // Initialize Three.js object mesh with Cesium Cartesian
	// coordinate system
	this.loop(); // Looping renderer
	
	window.addEventListener( 'keydown', function ( event ) {
	    switch ( event.keyCode ) {
	      case 81: // Q
	        that.threeTransformControls.setSpace( that.threeTransformControls.space === "local" ? "world" : "local" );
	        break;
	      case 17: // Ctrl
	        that.threeTransformControls.setTranslationSnap( 100 );
	        that.threeTransformControls.setRotationSnap( THREE.Math.degToRad( 15 ) );
	        break;
	      case 87: // W
	        that.threeTransformControls.setMode( "translate" );
	        break;
	      case 69: // E
	        that.threeTransformControls.setMode( "rotate" );
	        break;
	      case 82: // R
	        that.threeTransformControls.setMode( "scale" );
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
	        break;
	      case 32: // Spacebar
	        that.threeTransformControls.enabled = ! that.threeTransformControls.enabled;
	        break;
	    }
	  });

	  window.addEventListener( 'keyup', function ( event ) {
	    switch ( event.keyCode ) {
	      case 17: // Ctrl
	        that.threeTransformControls.setTranslationSnap( null );
	        that.threeTransformControls.setRotationSnap( null );
	        break;
	    }
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
	this.cesiumViewer.render();
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
	that.threeCamera.fov = Cesium.Math.toDegrees(that.cesiumViewer.camera.frustum.fovy); // ThreeJS
	// FOV
	// is
	// vertical
	that.threeCamera.updateProjectionMatrix();

	var cartToVec = function(cart){
		return new THREE.Vector3(cart.x, cart.y, cart.z);
	};

	// Configure Three.js meshes to stand against globe center position up
	// direction
	for(var id in this.getThreeObjects()){
		var minCRS = this.getThreeObjects()[id].getMinCRS();
		var maxCRS = this.getThreeObjects()[id].getMaxCRS();
		// convert lat/long center position to Cartesian3
		var center = Cesium.Cartesian3.fromDegrees((minCRS[0] + maxCRS[0]) / 2, (minCRS[1] + maxCRS[1]) / 2);

		// get forward direction for orienting model
		var centerHigh = Cesium.Cartesian3.fromDegrees((minCRS[0] + maxCRS[0]) / 2, (minCRS[1] + maxCRS[1]) / 2,1);

		// use direction from bottom left to top left as up-vector
		var bottomLeft  = cartToVec(Cesium.Cartesian3.fromDegrees(minCRS[0], minCRS[1]));
		var topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minCRS[0], maxCRS[1]));
		var latDir  = new THREE.Vector3().subVectors(bottomLeft,topLeft ).normalize();

		// configure entity position and orientation
		this.getThreeObjects()[id].getThreeMesh().position.copy(center);
		this.getThreeObjects()[id].getThreeMesh().lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		this.getThreeObjects()[id].getThreeMesh().up.copy(latDir);
	}

	// Clone Cesium Camera projection position so the
	// Three.js Object will appear to be at the same place as above the
	// Cesium Globe
	that.threeCamera.matrixAutoUpdate = false;
	var cvm = that.cesiumViewer.camera.viewMatrix;
	var civm = that.cesiumViewer.camera.inverseViewMatrix;
	that. threeCamera.matrixWorld.set(
			civm[0], civm[4], civm[8 ], civm[12],
			civm[1], civm[5], civm[9 ], civm[13],
			civm[2], civm[6], civm[10], civm[14],
			civm[3], civm[7], civm[11], civm[15]
	);
	that.threeCamera.matrixWorldInverse.set(
			cvm[0], cvm[4], cvm[8 ], cvm[12],
			cvm[1], cvm[5], cvm[9 ], cvm[13],
			cvm[2], cvm[6], cvm[10], cvm[14],
			cvm[3], cvm[7], cvm[11], cvm[15]
	);

	var width = that.threeElem.clientWidth;
	var height = that.threeElem.clientHeight;
	var aspect = width / height;
	that.threeCamera.aspect = aspect;
	that.threeCamera.updateProjectionMatrix();

	that.threeRenderer.setSize(width, height);
	that.threeRenderer.render(that.threeScene, that.threeCamera);
}

/**
 * three scene을 렌더링한다
 * 
 * @method gb3d.Map#render
 */
gb3d.Map.prototype.render = function(){
	var that = this;
	that.threeRenderer.render(that.threeScene, that.threeCamera);
}

/**
 * 렌더링 함수를 반복한다
 * 
 * @method gb3d.Map#loop
 */
gb3d.Map.prototype.loop = function(){
	var that = this;
//	requestAnimationFrame(that.loop);
	that.renderCesium();
	that.renderThreeObj();
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
 * @param {Array.
 *            <gb3d.object.ThreeObject>} ThreeObject 배열
 */
gb3d.Map.prototype.setThreeObjects = function(objects) {
	this.threeObjects = objects;
};
