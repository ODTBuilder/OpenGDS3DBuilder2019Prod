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
	this.clientTree = options.clientTree ? options.clientTree : undefined;
	
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

gb3d.edit.TilesetManager.prototype.update3DTilesetStyle = function( element, tileset ) {
	var key = $( element ).parent().parent().parent().parent().parent().find( ".panel-heading select" ).val();
	
	if( !tileset.style ) {
		tileset.style = new Cesium.Cesium3DTileStyle();
	}
	
	var rows = $( element ).parent().parent().parent().find( ".gb-declare-row" );
	
	var conditions = [],
		show;
	
	rows.each( function ( index ) {
		if( index === 0 ) {
			return;
		}
		
		var li = $( this ).find( ".gb-declare-item" );
		
		var sign = $( li[0] ).find( "select" ).val();
		var value = $( li[1] ).find( "input" ).val();
		var color = $( li[2] ).find( "input" ).spectrum( "get" ).toHexString();
		var bool = $( li[3] ).find( "input" ).prop( "checked" );
		
		if( bool ) {
			var res;
			switch( sign ) {
			case ">=":
				res = "<";
				break;
			case "<=":
				res = ">";
				break;
			case ">":
				res = "<=";
				break;
			case "<":
				res = ">=";
				break;
			case "=":
				res = "!==";
				break;
			case "!=":
				res = "===";
				break;
			}
			
			show = "(${" + key + "} " + res + " " + value + ")";
		}
		
		var res;
		switch( sign ) {
		case "=":
			res = "===";
			break;
		case "!=":
			res = "!==";
			break;
		default:
			res = sign;
		}
		
		conditions.push( [ "(${" + key + "} " + res + " " + value + ")", "color('" + color.toUpperCase() + "')"] );
	} );
	
	// tileset color condition 기본값 설정. 기본값 미설정시 에러 발생
	conditions.push( [ "true", "color('#FFFFFF')" ] );
	
	tileset.style = new Cesium.Cesium3DTileStyle( {
		color: {
			conditions: conditions
		},
		show: show
	} );
}

gb3d.edit.TilesetManager.prototype.addTileset = function( url, layerid ) {
	var that = this;
	var url = url;
	var tileset = new Cesium.Cesium3DTileset( { url : url } );
	var tilesetVO = new gb3d.object.Tileset( {
		"layer" : layerid,
		"cesiumTileset" : tileset
	} );
	
	var targetLayer = that.getClientTree().getJSTree().get_LayerByOLId(layerid);
	if (targetLayer) {
		var git = targetLayer.get("git");
		if (!git.hasOwnProperty("tileset")) {
			git["tileset"] = {};
		}
		git["tileset"] = tilesetVO;
	}
	
	this.viewer.scene.primitives.add( tileset );
//	this.viewer.zoomTo( tileset );
	
	tileset.allTilesLoaded.addEventListener(function() {
		that.tilesetUI.addTilesPanel( tilesetVO );
		that.pushTilesetList( tilesetVO );
		
		that.tilesetUI.deleteEvent( function ( e ) {
			that.update3DTilesetStyle( this, tileset );
		} );
		
		that.tilesetUI.conditionEvent( function ( e ) {
			that.update3DTilesetStyle( this, tileset );
		} );
		
		that.tilesetUI.inputValueEvent( function ( e ) {
			that.update3DTilesetStyle( this, tileset );
		} );
		
		that.tilesetUI.inputColorEvent( function ( e ) {
			that.update3DTilesetStyle( this, tileset );
		} );
		
		that.tilesetUI.checkEvent( function ( e ) {
			that.update3DTilesetStyle( this, tileset );
		} );
	});
}

gb3d.edit.TilesetManager.prototype.getClientTree = function() {
	return this.clientTree;	
}
