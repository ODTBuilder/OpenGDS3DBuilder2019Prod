var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.tree)
	gb3d.tree = {};

/**
 * 
 */
gb3d.tree.Three = function(obj) {
	var that = this;
	
	var options = obj || {};
	var target = options.target || "body";
	this.map = options.map || undefined;
	if(!this.map){
		console.error("gb3d.tree.Three: map is required parameter.");
		return;
	}
	
	/**
	 * Three Tree 패널 header
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panelHead = $("<div>").addClass("gb-article-head");

	/**
	 * Three Tree 패널 body
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panelBody = $("<div>").addClass("gb-article-body").css({
		"overflow-y" : "auto",
		"flex": "1"
	});

	/**
	 * Three Tree 패널 layout
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panel = $("<div>").addClass("gb-article").css({
		"margin" : "0",
		"height" : "100%",
		"display" : "flex",
		"flex-direction" : "column"
	}).append(this.panelHead).append(this.panelBody);
	
	$(target).append(this.panel);
	
	$(this.panelBody).jstree({
		"core" : {
			"animation" : 0,
			"check_callback": true,
			"themes" : { "stripes" : true },
			"data": []
		},
		"contextmenu" : {
			"items" : function(o, cb){
				var totalObj = {};
				
				var exportObj = {
					"separator_before" : true,
					"icon" : "fas fa-file-export",
					"separator_after" : true,
					"label" : "Export",
					"action" : false,
					"submenu" : {
						"obj" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "OBJ",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.OBJExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								object.matrixWorld.setPosition(0, 0, 0);
								var result = exporter.parse( object );
								downloadString( result, id + '.obj' );
							}
						},
						"dae" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "DAE",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.ColladaExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var result = exporter.parse( threeObject.getObject() );
								downloadString( result.data, id + '.dae' );
							}
						},
						"gltf" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "GLTF",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.GLTFExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								exporter.parse( threeObject.getObject(), function(result){
									var output = JSON.stringify( result, null, 2 );
									downloadString( output, id + '.gltf' );
								} );
							}
						},
						"draco" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "DRC",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.DRACOExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var result = exporter.parse( threeObject.getObject().geometry );
								downloadString( result, id + '.drc' );
							}
						},
						"ply" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "PLY",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.PLYExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var result = exporter.parse( threeObject.getObject() );
								downloadString( result, id + '.ply' );
							}
						},
						"stl" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "STL",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.STLExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var result = exporter.parse( threeObject.getObject() );
								downloadString( result, id + '.stl' );
							}
						}
					}
				}
				
				totalObj["export"] = exportObj;
				return totalObj;
			}
		},
		"types" : {
			"default" : {
				"icon" : "fas fa-exclamation-circle"
			},
			"geoserver" : {
				"icon" : "fas fa-globe",
				"valid_children" : [ "workspace" ]
			},
			"workspace" : {
				"icon" : "fas fa-archive",
				"valid_children" : [ "datastore" ]
			},
			"datastore" : {
				"icon" : "fas fa-hdd",
				"valid_children" : [ "raster", "polygon", "multipolygon", "linestring", "multilinestring", "point", "multipoint" ]
			},
			"raster" : {
				"icon" : "fas fa-chess-board"
			},
			"polygon" : {
				"icon" : "fas fa-square-full"
			},
			"multipolygon" : {
				"icon" : "fas fa-square-full"
			},
			"linestring" : {
				"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
			},
			"multilinestring" : {
				"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
			},
			"point" : {
				"icon" : "fas fa-circle gb-fa-xxs"
			},
			"multipoint" : {
				"icon" : "fas fa-circle gb-fa-xxs"
			}
		},
		"search" : {
			"show_only_matches" : true
		},
		"plugins" : [
			"contextmenu", "dnd", "search",
			"state", "types"
		]
	});
	
	this.jstree = $(this.panelBody).jstree(true);
	
	$(this.panelBody).on("select_node.jstree", function(evt, data){
		console.log(evt);
		console.log(data);
		var selected = data.selected;
		
		if(selected.length !== 0){
			that.map.selectThree(selected[0]);
			that.map.syncSelect(selected[0]);
		}
	});
	
	this.map.getThreeScene().addEventListener("addObject", function(e){
		var threeObject = e.object;
		var object = threeObject.getObject();
		
		that.jstree.create_node("#", {
			"parent": "#",
			"id": object.uuid,
			"text": object.uuid
		}, "last", false, false);
	});
	
	var link = document.createElement("a");
	link.style.display = "none";
	document.body.appendChild(link);
	
	function download(blob, filename){
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	}
	
	function downloadString( text, filename ) {
		download( new Blob( [ text ], { type: 'text/plain' } ), filename );
	}
	
	function downloadArrayBuffer( buffer, filename ) {
		download( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
	}
}
