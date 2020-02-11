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
 * @class gb3d.object.ThreeObject
 * @memberof gb3d.object
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {THREE.Object3D} obj.object - Three Object3D 객체
 * @param {Array.<number>} obj.center - 모델의 위치점
 * @author SOYIJUN
 */
gb3d.object.ThreeObject = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	// THREEJS 3DObject.mesh
	this.object = options.object;
	// Cesiuim 3d tiles feature
	this.feature3D = options.feature3D;
	// center point
	this.center = options.center;
	// extent point [a,b,c,d]
	this.extent = options.extent;

	this.type = options.type;

	this.feature = options.feature;

	this.buffer = this.type === "LineString" || this.type === "MultiLineString" ? options.buffer ? options.buffer : undefined : undefined;

	// 소속된 타일 식별자
	this.tileId = options.tileId ? options.tileId : undefined;
	// 소속된 2D 레이어 객체
	this.layer = options.layer ? options.layer : undefined;
	// openlayers jstree id
	this.treeid = options.treeid ? options.treeid : undefined;
	// 수정횟수
	this.modCount = 0;
	// 그린 객체인지 파일 객체인지
	this.isFromFile = options.file ? true : false;
	// 수정 가능한 객체인지
	this.isEditable = options.editable ? true : false;
}

/**
 * treeid를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getTreeid
 * @return {string} jstree node id
 */
gb3d.object.ThreeObject.prototype.getTreeid = function() {
	return this.treeid;
};

/**
 * treeid를 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setTreeid
 * @param {string} treeid - jstree id
 */
gb3d.object.ThreeObject.prototype.setTreeid = function(treeid) {
	this.treeid = treeid;
};

/**
 * Layer를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getLayer
 * @return {ol.layer.Layer} Layer
 */
gb3d.object.ThreeObject.prototype.getLayer = function() {
	return this.layer;
};

/**
 * Layer를 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setLayer
 * @param {ol.layer.Layer} layer - Layer
 */
gb3d.object.ThreeObject.prototype.setLayer = function(layer) {
	this.layer = layer;
};

/**
 * tileId 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getTileId
 * @return {String} Tileset ID
 */
gb3d.object.ThreeObject.prototype.getTileId = function() {
	return this.tileId;
};

/**
 * tileId 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setTileId
 * @param {String} id - Tileset ID
 */
gb3d.object.ThreeObject.prototype.setTileId = function(id) {
	this.tileId = id;
};

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
 * @param {THREE.Object3D} obj - three object객체
 */
gb3d.object.ThreeObject.prototype.setObject = function(obj) {
	this.object = obj;
};

/**
 * 3d tiles feature 객체를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getFeature3D
 * @return {Cesium.Cesium3DTileFeature} cesium 3d tiles feature 객체
 */
gb3d.object.ThreeObject.prototype.getFeature3D = function() {
	return this.feature3D;
};

/**
 * 3d tiles feature 객체를 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setFeature3D
 * @param {Cesium.Cesium3DTileFeature} obj - cesium 3d tile feature 객체
 */
gb3d.object.ThreeObject.prototype.setFeature3D = function(obj) {
	this.feature3D = obj;
};

/**
 * 중심 위치점을 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getCenter
 * @return {Array.<number>} 중심 위치 좌표
 */
gb3d.object.ThreeObject.prototype.getCenter = function() {
	return this.center;
};

/**
 * 중심 위치점을 할당한다.
 * 
 * @method gb3d.object.ThreeObject#setCenter
 * @param {Array.<number>} center - 중심 위치 좌표
 */
gb3d.object.ThreeObject.prototype.setCenter = function(center) {
	this.center = center;
};

/**
 * Extent 갱신
 * 
 * @method gb3d.object.ThreeObject#updateExtent
 */
gb3d.object.ThreeObject.prototype.updateExtent = function() {
	this.extent = this.getFeature().getGeometry().getExtent();
};

/**
 * Extent 반환
 * 
 * @method gb3d.object.ThreeObject#getExtent
 * @return {Array.<number>}
 */
gb3d.object.ThreeObject.prototype.getExtent = function() {
	return this.extent;
};

/**
 * Extent 할당
 * 
 * @method gb3d.object.ThreeObject#setExtent
 * @param {Array.<number>} extent
 */
gb3d.object.ThreeObject.prototype.setExtent = function(extent) {
	this.extent = extent;
};

/**
 * Layer의 Type을 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getType
 * @return {String} Layer type
 */
gb3d.object.ThreeObject.prototype.getType = function() {
	return this.type;
};

/**
 * Layer의 Type을 설정한다.
 * 
 * @method gb3d.object.ThreeObject#setType
 * @param {String} type - Layer type
 */
gb3d.object.ThreeObject.prototype.setType = function(type) {
	this.type = type;
};

/**
 * 사용자 정의 속성 목록을 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getFeature
 * @return {ol.Feature} Openlayers Feature
 */
gb3d.object.ThreeObject.prototype.getFeature = function() {
	return this.feature;
};

/**
 * 사용자 정의 속성 목록을 설정한다.
 * 
 * @method gb3d.object.ThreeObject#setFeature
 * @param {ol.Feature} feature - Openlayers Feature
 */
gb3d.object.ThreeObject.prototype.setFeature = function(feature) {
	this.feature = feature;
};

/**
 * 버퍼값 반환
 * 
 * @method gb3d.object.ThreeObject#getBuffer
 * @return {number} Openlayers Feature
 */
gb3d.object.ThreeObject.prototype.getBuffer = function() {
	return this.buffer;
};

/**
 * 버퍼값 설정
 * 
 * @method gb3d.object.ThreeObject#setBuffer
 * @param {number} buffer - buffer value
 */
gb3d.object.ThreeObject.prototype.setBuffer = function(buffer) {
	this.buffer = buffer;
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

/**
 * 파일 객체 여부를 반환한다.
 * 
 * @method gb3d.object.ThreeObject#getIsFromFile
 * @return {boolean} is from file?
 */
gb3d.object.ThreeObject.prototype.getIsFromFile = function() {
	return this.isFromFile;
};

/**
 * 파일 객체 여부를 설정한다.
 * 
 * @method gb3d.object.ThreeObject#setIsFromFile
 * @param {boolean} flag - is from file?
 */
gb3d.object.ThreeObject.prototype.setIsFromFile = function(flag) {
	this.isFromFile = flag;
};

/**
 * 수정 가능한 객체인지 반환
 * 
 * @method gb3d.object.ThreeObject#getIsEditable
 * @return {boolean} 수정 가능 여부
 */
gb3d.object.ThreeObject.prototype.getIsEditable = function() {
	return this.isEditable;
};

/**
 * 수정 가능한 객체인지 설정
 * 
 * @method gb3d.object.ThreeObject#setIsEditable
 * @param {boolean} flag - 수정가능 여부
 */
gb3d.object.ThreeObject.prototype.setIsEditable = function(flag) {
	this.isEditable = flag;
};