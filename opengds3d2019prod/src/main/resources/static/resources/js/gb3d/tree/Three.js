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
								var center = threeObject.getCenter();
								var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
								
								if(!threeObject){
									return;
								}
								
								var object = threeObject.getObject().clone();
//								object.lookAt(0, 0, 0);
//								object.matrix.setPosition(new THREE.Vector3(0, 0, 0));
//								object.matrixWorld.setPosition(new THREE.Vector3(0, 0, 0));
//								object.matrix.makeRotationFromQuaternion(threeObject.getObject().quaternion);
//								object.matrixWorld.makeRotationFromQuaternion(threeObject.getObject().quaternion);
								
								resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
//								object.applyQuaternion(threeObject.getObject().quaternion);
//								object.rotation.copy(new THREE.Euler(0, 0, 0));
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
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								var result = exporter.parse( object );
								downloadString( result.data, id + '.dae' );
							}
						},
						"glb" : {
							"separator_before" : true,
							"icon" : "fa fa-file-excel-o",
							"separator_after" : false,
							"label" : "GLB",
							"action" : function(data) {
								var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
								var exporter = new THREE.GLTFExporter();
								var id = obj.id;
								var threeObject = that.map.getThreeObjectByUuid( id );
								
								if(!threeObject){
									return;
								}
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								exporter.parse( object, function( result ){
									
									downloadArrayBuffer( result, id + '.glb' );
									
								}, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true } );
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
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								exporter.parse( object, function(result){
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
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								var result = exporter.parse( object.geometry );
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
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								var result = exporter.parse( object );
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
								
								var object = threeObject.getObject().clone();
								object.position.copy(new THREE.Vector3(0, 0, 0));
								resetMatrixWorld( object );
								
								var result = exporter.parse( object );
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
			"#" : {
				"valid_children" : [ "default", "Group", "FakeGroup", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
					"MultiLineString", "Point", "MultiPoint" ]
			},
			// 편집도구에서 지원할 타입
			"Group" : {
				"icon" : "far fa-folder",
				"valid_children" : [ "default", "Group", "FakeGroup", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
					"MultiLineString", "Point", "MultiPoint" ]
			},
			"FakeGroup" : {
				"icon" : "fas fa-folder",
				"valid_children" : [ "default", "Group", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
					"MultiLineString", "Point", "MultiPoint" ]
			},
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
			"Raster" : {
				"icon" : "fas fa-chess-board"
			},
			"ImageTile" : {
				"icon" : "fas fa-chess-board"
			},
			"Polygon" : {
				"icon" : "fas fa-square-full"
			},
			"MultiPolygon" : {
				"icon" : "fas fa-square-full"
			},
			"LineString" : {
				"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
			},
			"MultiLineString" : {
				"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
			},
			"Point" : {
				"icon" : "fas fa-circle gb-fa-xxs"
			},
			"MultiPoint" : {
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
		
		var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
		// Edit Tool 비활성화 상태시 실행 중지
		if(isEdit instanceof Object){
			if(!isEdit.get()){
				return
			}
		}
		
		if(selected.length !== 0){
			that.map.selectThree(selected[0]);
			that.map.syncSelect(selected[0]);
		}
	});
	
	this.map.getThreeScene().addEventListener( "addObject", function(e){
		var threeObject = e.object;
		var object = threeObject.getObject();
		var treeid = threeObject.getTreeid();
		
		that.jstree.create_node( treeid, {
			"parent": treeid,
			"id": object.uuid,
			"text": object.uuid
		}, "last", false, false );
	} );
	
	var link = document.createElement( "a" );
	link.style.display = "none";
	document.body.appendChild(link);
	
	function download( blob, filename ) {
		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();
	}
	
	function downloadString( text, filename ) {
		download( new Blob( [ text ], { type: 'text/plain' } ), filename );
	}
	
	function downloadArrayBuffer( buffer, filename ) {
		download( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
	}
	
	function resetMatrixWorld ( obj, quaternion, centerHigh ) {
		var object = obj;
		var quat = object.rotation.clone();
		var center = centerHigh;
		var look = new THREE.Vector3(center.x, center.y, center.z);
		look.negate();
//		if(object.userData.type){
//			return;
//		}
		
		if(!object.geometry){
			if(object.children instanceof Array){
				for(var i = 0; i < object.children.length; i++){
					// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때 재귀함수 요청
					object.position.copy(new THREE.Vector3(0, 0, 0));
					quat = object.rotation.clone();
					object.lookAt(new THREE.Vector3(0, 0, 1));
					object.setRotationFromEuler(quat);
//					object.matrix.makeRotationFromQuaternion(quat);
//					object.matrixWorld.makeRotationFromQuaternion(quat);
					resetMatrixWorld(object.children[i], quat, center);
				}
			}
		} else {
//			object.position.copy(new THREE.Vector3(0, 0, 0));
			object.lookAt(new THREE.Vector3(0, 0, 1));
			object.setRotationFromEuler(quat);
//			object.matrix.makeRotationFromQuaternion(quat);
//			object.matrixWorld.makeRotationFromQuaternion(quat);
//			object.setRotationFromQuaternion(quat);
		}
	}
}
