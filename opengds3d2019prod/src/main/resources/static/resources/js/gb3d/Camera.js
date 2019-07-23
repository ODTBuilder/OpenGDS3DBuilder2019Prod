/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
/**
 * @classdesc Camera 객체를 정의한다.
 * 
 * @class gb3d.Camera
 * @memberof gb3d
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {HTMLElement}
 *            obj.target2d - 지도 영역이 될 Div의 HTMLElement
 * @author SOYIJUN
 */
gb3d.Camera = function(obj) {
	var that = this;
	var options = obj ? obj : {};

	this.cesiumCamera = options.cesiumCamera instanceof Cesium.Camera ? options.cesiumCamera : undefined;
	this.threeCamera = options.threeCamera instanceof THREE.Camera ? options.threeCamera : undefined;
	this.olMap = options.olMap instanceof ol.Map ? options.olMap : undefined;
// this.icon = optzions.icon ? options.icon : undefined;
// this.sector = options.sector ? options.sector : undefined;
	if (!this.cesiumCamera || !this.threeCamera || !this.olMap) {
		console.error("constructor parameter not provided");
		return;
	}
	this.olView = this.olMap.getView();
	this.initPosition = Array.isArray(options.initPosition) ? Cesium.Cartesian3.fromDegrees(options.initPosition[0], options.initPosition[1] - 1, 200000) : Cesium.Cartesian3.fromDegrees(0, 0, 200000);
	
	if (this.cesiumCamera !== undefined) {
		this.cesiumCamera.changed.addEventListener(function() { 
			that.updateCamCartigraphicPosition();
		});
		this.cesiumCamera.moveStart.addEventListener(function() { 
			that.updateCamCartigraphicPosition();
		});
		this.cesiumCamera.moveEnd.addEventListener(function() { 
			that.updateCamCartigraphicPosition();
		});
	}
	
	this.icon = $("<img>").attr({
		"src" : "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAyOTcuMDAxIDI5Ny4wMDEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5Ny4wMDEgMjk3LjAwMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiPgo8Zz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6IzJDM0U1MDsiIGN4PSIxNDguNTAxIiBjeT0iMTQ4LjUiIHI9IjE0OC41Ii8+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDojMjEzMTNGOyIgZD0iTTI5Ni42MDcsMTU5LjI5NWwtOTQuOTg4LTk0Ljk3MUw2My44NzQsMjM2LjE0bDU4LjU4MSw1OC41ODFjOC40NTcsMS40OTYsMTcuMTYsMi4yOCwyNi4wNDYsMi4yOCAgIEMyMjYuODg1LDI5NywyOTEuMDc2LDIzNi4yNjksMjk2LjYwNywxNTkuMjk1eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6IzlBREFEOTsiIGQ9Ik03My4yOTIsMjQwLjM3NWMtNy44NjEsMC0xMy44NjMtNy4wNTktMTIuNTY0LTE0LjgxMWM3LjA1My00Mi4xMDMsNDMuNjY2LTc0LjE4OSw4Ny43NzMtNzQuMTg5ICAgIHM4MC43MiwzMi4wODUsODcuNzczLDc0LjE4OWMxLjI5OSw3Ljc1My00LjcwNCwxNC44MTEtMTIuNTY0LDE0LjgxMUg3My4yOTJ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojNzFBQUE3OyIgZD0iTTIzNi4yNzMsMjI1LjU2M2MtNy4wNTMtNDIuMTAzLTQzLjY2Ni03NC4xODgtODcuNzczLTc0LjE4OGMtMC4yMjMsMC0wLjQ0MywwLjAxMy0wLjY2NiwwLjAxNSAgICB2ODguOTg1aDc1Ljg3NUMyMzEuNTcxLDI0MC4zNzUsMjM3LjU3MywyMzMuMzE2LDIzNi4yNzMsMjI1LjU2M3oiLz4KCTwvZz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGN4PSIxNDguNTAxIiBjeT0iMTE5LjM3NSIgcj0iNzYuNSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0QwRDVEOTsiIGQ9Ik0xNDguNTAxLDQyLjg3NWMtMC4yMjMsMC0wLjQ0MywwLjAxNS0wLjY2NiwwLjAxN3YxNTIuOTY2YzAuMjIzLDAuMDAyLDAuNDQzLDAuMDE3LDAuNjY2LDAuMDE3ICAgIGM0Mi4yNSwwLDc2LjUtMzQuMjUsNzYuNS03Ni41UzE5MC43NTEsNDIuODc1LDE0OC41MDEsNDIuODc1eiIvPgoJPC9nPgoJPGc+CgkJPGNpcmNsZSBzdHlsZT0iZmlsbDojQkRDM0M3OyIgY3g9IjE0OC41MDEiIGN5PSIxMTkuMzc1IiByPSIzOC4yNSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6IzlFQTRBODsiIGQ9Ik0xNDguNTAxLDgxLjEyNWMtMC4yMjMsMC0wLjQ0NCwwLjAxMy0wLjY2NiwwLjAxN3Y3Ni40NjZjMC4yMjMsMC4wMDQsMC40NDMsMC4wMTcsMC42NjYsMC4wMTcgICAgYzIxLjEyNSwwLDM4LjI1LTE3LjEyNSwzOC4yNS0zOC4yNVMxNjkuNjI2LDgxLjEyNSwxNDguNTAxLDgxLjEyNXoiLz4KCTwvZz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6IzMyMzczQjsiIGN4PSIxNDguNTAxIiBjeT0iMTE5LjM3NSIgcj0iMTkuMTI1Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojMkMzMDMzOyIgZD0iTTE0OC41MDEsMTAwLjI1Yy0wLjIyNSwwLTAuNDQzLDAuMDI2LTAuNjY2LDAuMDM0djM4LjE4M2MwLjIyMywwLjAwOCwwLjQ0MSwwLjAzNCwwLjY2NiwwLjAzNCAgICBjMTAuNTYzLDAsMTkuMTI1LTguNTYzLDE5LjEyNS0xOS4xMjVTMTU5LjA2NCwxMDAuMjUsMTQ4LjUwMSwxMDAuMjV6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg=="
	}).css({
		"z-index" : 2
	})[0]; 
	
	this.sector = $("<img>").attr({
		"src" : "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMy4xNTYgNTEzLjE1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEzLjE1NiA1MTMuMTU2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGNsYXNzPSIiPjxnIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDUxMy4xNTYgMCkiPjxwYXRoIHN0eWxlPSJmaWxsOiNDMkUyRjI7IiBkPSJNMjcyLjEwOCwwLjU3OGwxLjA0OCwyNzZoLTI3MmMxMC4yMTYsMTMyLjAyOCwxMjEuMzUyLDIzNiwyNTYsMjM2YzE0MS4zODQsMCwyNTYtMTE0LjYxMiwyNTYtMjU2ICBDNTEzLjE1NiwxMjAuMjE4LDQwNS40NCw5LjA4NiwyNzIuMTA4LDAuNTc4eiIgZGF0YS1vcmlnaW5hbD0iI0MyRTJGMiIgY2xhc3M9IiI+PC9wYXRoPjxwYXRoIHN0eWxlPSJmaWxsOiM0MDZBODA7IiBkPSJNMjU0Ljg0NCwwLjYwNkMxMTQuODQ0LDEuMTY2LDAsMTE1LjUzOCwwLDI1Ni41NzhjMCwxLjM0LDEuMTMyLDIuNjY0LDEuMTU2LDRoMjUzLjY4OFYwLjYwNnoiIGRhdGEtb3JpZ2luYWw9IiM0MDZBODAiPjwvcGF0aD48cGF0aCBzdHlsZT0iZmlsbDojQjhENkU2IiBkPSJNMjczLjE1NiwyODQuNTc4aDUuNjg4di04VjAuOTk0YzAtMC4yNTItNC42OTYtMC4yNDgtNy4zNjgtMC40MTZsMS42OCwyNzZoLTI3MiAgYzAuMjA4LDIuNjg0LDAuNTI0LDUuMzQsMC44MTYsOEgyNzMuMTU2eiIgZGF0YS1vcmlnaW5hbD0iI0I4RDZFNiIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBkYXRhLW9sZF9jb2xvcj0iI0I4RDZFNiI+PC9wYXRoPjwvZz4gPC9zdmc+"
	}).css({
		"z-index" : 1
	})[0];
	
//	this.sector = $("<div>")[0];
	
	this.camGeom = new ol.geom.Point({
		"coordinates" : [],
		"layout" : "XY"
	});
	
	this.sectOverlay = new ol.Overlay({
		position: this.camGeom.getCoordinates(),
		positioning: 'center-center',
		element: this.sector,
		stopEvent: false
	});
	this.olMap.addOverlay(this.sectOverlay);
	
	this.camStyle = new ol.style.Style({
		"image" : new ol.style.Icon({
			"anchor" : [0.5, 0.5],
			"crossOrigin" : 'anonymous',
			"img" : this.icon,
			"imgSize" : [64, 64],
			"size" : [64, 64]
		})
	});
	
	this.sectorStyle = new ol.style.Style({
		"image" : new ol.style.Icon({
			"anchor" : [0.5, 0.5],
			"crossOrigin" : 'anonymous',
			"img" : this.sector,
			"imgSize" : [64, 64],
			"size" : [512, 512],
			"scale" : 0.2
		})
	});
	
	this.camFeature = new ol.Feature({
		"geometry" : this.camGeom
	});
	
	this.camFeature.setStyle([this.sectorStyle, this.camStyle]);
//	this.camFeature.setStyle([this.sectorStyle]);
	
	this.camSource = new ol.source.Vector({
		"features" : [this.camFeature]
	});
	this.camLayer = new ol.layer.Vector({
		"source" : this.camSource
	});
	this.camLayer.setMap(this.olMap);
	this.camInteraction;
}

/**
 * three transform controls 객체를 설정한다.
 * 
 * @method gb3d.Map#setThreeObjects
 * @param {Array.
 *            <gb3d.object.ThreeObject>} ThreeObject 배열
 */
gb3d.Camera.prototype.flyTo = function() {

};

/**
 * cesium 카메라 객체를 반환한다.
 * 
 * @method gb3d.Map#getCesiumCamera
 * @return {Cesium.Camera} cesium 카메라 객체
 */
gb3d.Camera.prototype.getCesiumCamera = function() {
	return this.cesiumCamera;
};

/**
 * three 카메라 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeCamera
 * @return {Cesium.Camera} cesium 카메라 객체
 */
gb3d.Camera.prototype.getThreeCamera = function() {
	return this.threeCamera;
};

/**
 * cesium camera의 2차원 위치를 반환한다.
 * 
 * @method gb3d.Map#getCartographicPosition
 * @param {Array.
 *            <number>} 경위도 좌표
 */
gb3d.Camera.prototype.getCartographicPosition = function() {
	var ccam = this.getCesiumCamera();
	var cartographic = ccam.positionCartographic;
    var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
    return [longitude, latitude];
};

/**
 * cesium camera의 2차원 지도상 위치 좌표 배열을 반환한다.
 * 
 * @method gb3d.Map#getCamGeometry
 * @return {Array.<number>} 카메라 point geometry
 */
gb3d.Camera.prototype.getCamGeometry = function() {
	return this.camGeom;
};

/**
 * cesium camera의 시야각을 보여주는 아이콘 오버레이 객체를 반환한다.
 * 
 * @method gb3d.Map#getCamSectorOverlay
 * @return {ol.Overlay} 시야각 아이콘 오버레이 객체
 */
gb3d.Camera.prototype.getCamSectorOverlay = function() {
	return this.sectOverlay;
};

/**
 * cesium camera의 2차원 지도상 위치를 업데이트 한다.
 * 
 * @method gb3d.Map#updateCamCartigraphicPosition
 */
gb3d.Camera.prototype.updateCamCartigraphicPosition = function() {
	var coord = this.getCartographicPosition();
	this.getCamGeometry().setCoordinates(coord);
//	this.getCamSectorOverlay().setPosition(coord);
};