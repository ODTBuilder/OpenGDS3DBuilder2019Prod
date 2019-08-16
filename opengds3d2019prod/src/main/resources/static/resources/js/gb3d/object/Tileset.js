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
	this.tile = options.tileset instanceof Cesium.Cesium3DTileset ? options.tileset : undefined;

	// extent point [a,b,c,d]
	// this.extent = options.extent;
	// this.features = options.features;
	// this.modCount = 0;
};