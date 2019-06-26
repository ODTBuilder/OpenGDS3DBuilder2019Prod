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
 * @param {HTMLElement}
 *            obj.target2d - 지도 영역이 될 Div의 HTMLElement
 * @author SOYIJUN
 */
gb3d.object.ThreeObject = function(obj) {
	// THREEJS 3DObject.mesh
	this.threeMesh = null;
	// location bounding box
	this.minCRS = null;
	this.maxCRS = null;
}

/**
 * three mesh 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeMesh
 * @return {THREE.Mesh} three mesh 객체
 */
gb3d.Map.prototype.getThreeMesh = function() {
	return this.threeMesh;
};

/**
 * three mesh 객체를 할당한다.
 * 
 * @method gb3d.Map#setThreeMesh
 * @param {THREE.Mesh}
 *            mesh - three mesh 객체
 */
gb3d.Map.prototype.setThreeMesh = function(mesh) {
	this.threeMesh = mesh;
};

/**
 * 최대 좌표값을 반환한다.
 * 
 * @method gb3d.Map#getgetMinCRS
 * @return {Array.<Number>} x, y 최대 좌표값
 */
gb3d.Map.prototype.getMinCRS = function() {
	return this.minCRS;
};

/**
 * 최대 좌표값을 할당한다.
 * 
 * @method gb3d.Map#setMinCRS
 * @param {THREE.Mesh}
 *            mesh - three mesh 객체
 */
gb3d.Map.prototype.setMinCRS = function(mesh) {
	this.minCRS = mesh;
};

/**
 * three mesh 객체를 반환한다.
 * 
 * @method gb3d.Map#getMaxCRS
 * @return {THREE.Mesh} three mesh 객체
 */
gb3d.Map.prototype.getMaxCRS = function() {
	return this.maxCRS;
};

/**
 * three mesh 객체를 할당한다.
 * 
 * @method gb3d.Map#setMaxCRS
 * @param {THREE.Mesh}
 *            mesh - three mesh 객체
 */
gb3d.Map.prototype.setMaxCRS = function(mesh) {
	this.maxCRS = mesh;
};