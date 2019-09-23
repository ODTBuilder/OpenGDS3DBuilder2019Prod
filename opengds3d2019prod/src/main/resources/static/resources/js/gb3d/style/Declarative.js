var gb3d;
if ( !gb3d )
	gb3d = {};
if ( !gb3d.style )
	gb3d.style = {};

/**
 * 
 */
gb3d.style.Declarative = function ( obj ) {
	
	var options = obj;
	this.target = options.target ? $( options.target ) : $( "body" );
	
	this.accordion = $( "<div class='panel-group' id='tilesAccordion' role='tablist' aria-multiselectable='true'>" );
}

gb3d.style.Declarative.prototype.addTilesPanel = function ( tileset ) {
	var panel = $( "<div class='panel panel-default' id='declareTemp'>" );
	this.accordion.append( panel );
	
	var heading = $( "<div class='panel-heading' role='tab' id='headingOne'>" );
	panel.append( heading );
	
	var title = $( "<h4 class='panel-title gb-flex-between'>" );
	heading.append( title );
	
	var titleButton = $( "<a role='button' data-toggle='collapse' data-parent='#accordion' href='#collapse1' aria-expanded='true' aria-controls='collapseOne'>" );
	title.append( titleButton );
	
	var keySelect = $( "<select class='form-control' style='flex: 0 0 90px;'>" );
	title.append( keySelect );
	
	var collapse = $( "<div id='collapse1' class='panel-collapse collapse in' role='tabpanel' aria-labelledby='headingOne'>" );
	panel.append( collapse );
	
	var body = $( "<div class='panel-body'>" );
	collapse.append( body );
	
	var row = $( "<div class='gb-declare-row'>" );
	body.append( row );
}