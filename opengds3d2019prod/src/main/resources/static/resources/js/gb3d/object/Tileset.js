/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};

if (!gb3d.object)
	gb3d.object = {};
/**
 * @classdesc tileset 객체를 정의한다.
 * 
 * @class gb3d.object.Tileset
 * @memberof gb3d
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.object.Tileset = function(obj) {
	var options = obj;
	this.layer = options.layer ? options.layer : undefined;
	this.tileId = options.tileId ? options.tileId : undefined;
	this.cesiumTile = options.cesiumTileset instanceof Cesium.Cesium3DTileset ? options.cesiumTileset : undefined;

	if (!this.layer || !this.tileId || !this.cesiumTile) {
		console.error("constructor parameter should not be empty");
	}
	// extent point [a,b,c,d]
	// this.extent = options.extent;
	// this.features = options.features;
	// this.modCount = 0;
};
/**
 * 레이어를 설정한다.
 * 
 * @method gb3d.Map#setLayer
 * @param {ol.layer.Layer}
 *            layer - 대응하는 2D 레이어 객체
 */
gb3d.object.Tileset.prototype.setLayer = function(layer) {
	this.layer = layer;
}

/**
 * 레이어를 반환한다.
 * 
 * @method gb3d.Map#getLayer
 * @return {ol.layer.Layer} 대응하는 2D 레이어 객체
 */
gb3d.object.Tileset.prototype.getLayer = function() {
	return this.layer;
}