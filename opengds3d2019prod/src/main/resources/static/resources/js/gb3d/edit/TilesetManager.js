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
	this.element = options.element || "#attrDeclare"
	
	this.viewer = this.map.getCesiumViewer();
	
	this.tilesetUI = new gb3d.style.Declarative( {
		element: this.element
	} );
	
	this.tilesetList = [];
}

gb3d.edit.TilesetManager.prototype.pushTilesetList = function( tilesetVO ) {
	this.tilesetList.push( tilesetVO );
}

gb3d.edit.TilesetManager.prototype.addTileset = function( url, id, name ) {
	var url = url;
	var tileset = new Cesium.Cesium3DTileset( { url : url } );
	var tilesetVO = new gb3d.object.Tileset( {
		"layer" : name,
		"tileId" : id,
		"cesiumTileset" : tileset
	} );
	
	this.tilesetUI.addTilesPanel( tilesetVO );
	this.pushTilesetList( tilesetVO );
	this.viewer.scene.primitives.add( tileset );
	this.viewer.zoomTo( tileset );
}
