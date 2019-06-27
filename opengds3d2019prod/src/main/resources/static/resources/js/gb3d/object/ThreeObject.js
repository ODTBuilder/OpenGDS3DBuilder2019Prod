/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};

if (!gb3d.object)
	gb3d.object = {};
/**
 * @classdesc ThreeObject 객체를 정의한다.
 * 
 * @class gb3d.object.ThreeObject
 * @memberof gb3d
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {THREE.Object3D}
 *            object - Three Object3D 객체
 * @param {Array.
 *            <Number>} center - 모델의 위치점
 * @author SOYIJUN
 */
gb3d.object.ThreeObject = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	// THREEJS 3DObject.mesh
	this.object = options.object;
	// center point
	this.center = options.center;
}

/**
 * three object 객체를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getObject
 * @return {THREE.Object3D} three object 객체
 */
gb3d.object.ThreeObject.prototype.getObject = function() {
	return this.object;
};

/**
 * three mesh 객체를 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setObject
 * @param {THREE.Object3D}
 *            obj - three object객체
 */
gb3d.object.ThreeObject.prototype.setObject = function(obj) {
	this.object = obj;
};

/**
 * 중심 위치점을 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getCenter
 * @return {Array.<Number>} 중심 위치 좌표
 */
gb3d.object.ThreeObject.prototype.getCenter = function() {
	return this.center;
};

/**
 * 중심 위치점을 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setCenter
 * @param {Array.
 *            <Number>} center - 중심 위치 좌표
 */
gb3d.object.ThreeObject.prototype.setCenter = function(center) {
	this.center = center;
};
