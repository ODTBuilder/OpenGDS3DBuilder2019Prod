var gb3d;
if ( !gb3d )
	gb3d = {};
if ( !gb3d.edit )
	gb3d.edit = {};

/**
 * @classdesc Cesium 3D Tileset 관리자
 */
gb3d.edit.TilesetManager = function( obj ) {
	var options = obj || {};
	this.map = options.map || undefined;
	if( !this.map ){
		console.error( "gb3d.edit.TilesetManager: map is required." );
	}
	
	this.viewer = this.map.getCesiumViewer();
}

gb3d.edit.TilesetManager.prototype.addTileset = function( url ) {
	var url = url || "C:\Users\hochul\Downloads\newyorkcity\NewYorkCityGml\tileset.json";
	var tileset = new Cesium.Cesium3DTileset( { url : url } );
	
	this.viewer.scene.primitives.add( tileset );
}