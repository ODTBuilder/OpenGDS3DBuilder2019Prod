var gb3d;
if ( !gb3d )
	gb3d = {};
if ( !gb3d.style )
	gb3d.style = {};

/**
 * 
 */
gb3d.style.Declarative = function ( obj ) {
	var that = this;
	var options = obj;
	this.target = options.element ? $( options.element ) : $( "body" );
	
	this.mainId = "tilesAccordion";
	this.accordion = $( "<div class='panel-group' role='tablist' aria-multiselectable='true'>" ).attr( "id", this.mainId );
	this.target.append( this.accordion );
	
	function getConditionRow ( ) {
		var options = [ "<=", ">=", "<", ">", "=", "!=" ];
		
		var row = $( "<div class='gb-declare-row'>" );
		var item = $( "<div class='gb-declare-item'>" );
		var select = $( "<select class='form-control'>" );
		var option;
		for( var i = 0; i < options.length; i++ ) {
			option = $( "<option>" ).text( options[i] ).val( options[i] );
			select.append( option );
		}
		item.append( select );
		row.append( item );
		
		item = $( "<div class='gb-declare-item'>" );
		var input = $( "<input class='form-control gb-declare-value'>" );
		item.append( input );
		row.append( item );
		
		item = $( "<div class='gb-declare-item'>" );
		input = $( "<input class='form-control gb-declare-color'>" );
		item.append( input );
		row.append( item );
		input.spectrum( {
			preferredFormat: "hex",
			color : "#fff",
			showAlpha : false
		} );
		
		item = $( "<div class='gb-declare-item'>" );
		input = $( "<input type='checkbox'>" );
		item.append( input );
		row.append( item );
		
		var a = $( "<a href='#'>" );
		var i = $( "<i class='far fa-trash-alt'>");
		a.append( i );
		row.append( a );
		
		return row;
	}
	
	$( document ).on( "click", ".gb-declare-row > span > a", function() {
		var row = getConditionRow();
		
		$( this ).parent().parent().parent().append( row );
	} );

	$( document ).on( "click", ".gb-declare-row > a", function() {
		$( this ).parent().remove();
	});
}

gb3d.style.Declarative.prototype.deleteEvent = function ( callback ) {
	$( document ).on( "click", "#" + this.mainId + " a", callback );
}

gb3d.style.Declarative.prototype.conditionEvent = function ( callback ) {
	$( document ).on( "change", "#" + this.mainId + " .gb-declare-item select.form-control", callback );
}

gb3d.style.Declarative.prototype.inputValueEvent = function ( callback ) {
	$( document ).on( "keyup", "#" + this.mainId + " .gb-declare-item .gb-declare-value", callback );
}

gb3d.style.Declarative.prototype.inputColorEvent = function ( callback ) {
	$( document ).on( "change", "#" + this.mainId + " .gb-declare-item .gb-declare-color", callback );
}

gb3d.style.Declarative.prototype.checkEvent = function ( callback ) {
	$( document ).on( "change", "#" + this.mainId + " .gb-declare-item input:checkbox", callback );
}

gb3d.style.Declarative.prototype.addTilesPanel = function ( tileset ) {
	var t = tileset;
	if( t instanceof gb3d.object.Tileset ) {
		var tile = tileset.getCesiumTileset();
		var properties = tile.properties;
		
		var options = [ "Condition", "Value", "Color", "Hide" ];
		
		var panel = $( "<div class='panel panel-default'>" );
		this.accordion.append( panel );
		
		var heading = $( "<div class='panel-heading' role='tab'>" ).attr( "id", t.getTileId() );
		panel.append( heading );
		
		var title = $( "<h4 class='panel-title gb-flex-between'>" );
		heading.append( title );
		
		var titleButton = 
			$( "<a role='button' data-toggle='collapse' href='#collapse1' aria-expanded='true'>" )
				.text( t.getTileId() )
				.attr( "data-parent", "#" + this.mainId )
				.attr( "aria-controls", "collapse-" + t.getTileId() )
				.attr( "href", "#collapse-" + t.getTileId() );
		title.append( titleButton );
		
		var keySelect = $( "<select class='form-control' style='flex: 0 0 90px;'>" );
		title.append( keySelect );
		
		if( !properties ) {
			return;
		}
		
		if( properties instanceof Object ) {
			for( var i in properties ) {
				var key = $( "<option>" ).val( i ).text( i );
				keySelect.append( key );
			}
		}
		
		var collapse = 
			$( "<div class='panel-collapse collapse in' role='tabpanel'>" )
			.attr( "id", "collapse-" + t.getTileId() )
			.attr( "aria-labelledby", t.getTileId() );
		panel.append( collapse );
		
		var body = $( "<div class='panel-body'>" );
		collapse.append( body );
		
		var row = $( "<div class='gb-declare-row'>" );
		body.append( row );
		
		var span;
		for( var i = 0; i < options.length; i++ ) {
			span = $( "<span class='Text'>" ).text( options[i] );
			row.append( span );
		}
		
		span = $( "<span class='Text'>" );
		var a = $( "<a href='#'>" );
		var i = $( "<i class='fas fa-plus'></i>" );
		a.append( i );
		span.append( a );
		row.append( span );
	}
}