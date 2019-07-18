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
	if (!this.cesiumCamera || !this.threeCamera || !this.olMap) {
		console.error("constructor parameter not provided");
		return;
	}
	this.olView = this.olMap.getView();
	this.initPosition = Array.isArray(options.initPosition) ? Cesium.Cartesian3.fromDegrees(options.initPosition[0], options.initPosition[1] - 1, 200000) : Cesium.Cartesian3.fromDegrees(0, 0, 200000);
	

	this.camFeature;
	this.camGeom;
	this.camStyle;
	this.camLayer;
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