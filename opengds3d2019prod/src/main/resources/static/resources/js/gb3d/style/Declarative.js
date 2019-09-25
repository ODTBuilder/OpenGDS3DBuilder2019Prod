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
		var options = [ "<=", ">=", "<", ">", "=" ];
		
		var row = $( "<div class='gb-declare-row'>" );
		var item = $( "<div class='gb-declare-item'>" );
		var select = $( "<select class='form-control'>" );
		var option;
		for( var i = 0; i < options.length; i++ ) {
			option = $( "<option>" ).text( options[i] ).val( i );
			select.append( option );
		}
		item.append( select );
		row.append( item );
		
		item = $( "<div class='gb-declare-item'>" );
		var input = $( "<input class='form-control'>" );
		item.append( input );
		row.append( item );
		
		item = $( "<div class='gb-declare-item'>" );
		input = $( "<input class='form-control'>" );
		item.append( input );
		row.append( item );
		
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

gb3d.style.Declarative.prototype.inputEvent = function ( callback ) {
	
}

gb3d.style.Declarative.prototype.addTilesPanel = function ( tileset ) {
	var t = tileset;
	if( t instanceof gb3d.object.Tileset ) {
		var options = [ "Condition", "Value", "Color", "Hide" ];
		
		var panel = $( "<div class='panel panel-default'>" );
		this.accordion.append( panel );
		
		var heading = $( "<div class='panel-heading' role='tab'>" ).attr( "id", tileset.getTileId() );
		panel.append( heading );
		
		var title = $( "<h4 class='panel-title gb-flex-between'>" );
		heading.append( title );
		
		var titleButton = 
			$( "<a role='button' data-toggle='collapse' href='#collapse1' aria-expanded='true'>" )
				.text( tileset.getTileId() )
				.attr( "data-parent", "#" + this.mainId )
				.attr( "aria-controls", "collapse-" + tileset.getTileId() )
				.attr( "href", "#collapse-" + tileset.getTileId() );
		title.append( titleButton );
		
		var keySelect = $( "<select class='form-control' style='flex: 0 0 90px;'>" );
		title.append( keySelect );
		
		var collapse = 
			$( "<div class='panel-collapse collapse in' role='tabpanel'>" )
			.attr( "id", "collapse-" + tileset.getTileId() )
			.attr( "aria-labelledby", tileset.getTileId() );
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