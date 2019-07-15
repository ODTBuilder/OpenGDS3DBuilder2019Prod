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
	// extent point [a,b,c,d]
	this.extent = options.extent;
	
	this.attrs = options.attrs;
	
	this.modCount = 0;
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

/**
 * Extent 반환
 * 
 * @method gb3d.object.ThreeObject#getExtent
 * @return {Array.<Number>}
 */
gb3d.object.ThreeObject.prototype.getExtent = function() {
	return this.extent;
};

/**
 * Extent 할당
 * 
 * @method gb3d.object.ThreeObject#setExtent
 * @param {Array.
 *            <Number>} extent
 */
gb3d.object.ThreeObject.prototype.setExtent = function(extent) {
	this.extent = extent;
};

/**
 * 사용자 정의 속성 목록을 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getAttrs
 * @return {Array.<gb.layer.Attribute>} 사용자 정의 속성 목록
 */
gb3d.object.ThreeObject.prototype.getAttrs = function() {
	return this.attrs;
};

/**
 * 사용자 정의 속성 목록을 설정한다.
 * 
 * @method gb3d.object.ThreeObject#setAttrs
 * @param {Array.<gb.layer.Attribute>} attrs - 사용자 정의 속성 목록
 */
gb3d.object.ThreeObject.prototype.setAttrs = function(attrs) {
	this.attrs = attrs;
};

/**
 * 수정 횟수를 증가시킨다.
 * 
 * @method gb3d.object.ThreeObject#upModCount
 */
gb3d.object.ThreeObject.prototype.upModCount = function() {
	this.modCount++;
};

/**
 * 수정 횟수를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getModCount
 */
gb3d.object.ThreeObject.prototype.getModCount = function() {
	return this.modCount;
};

