var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.tree)
	gb3d.tree = {};

/**
 * @classdesc 3D 객체 목록 트리
 * @class gb3d.tree.Three
 * @memberof gb3d.tree
 * @param {Object} obj - 생성자 옵션
 * @param {string} [obj.target="body"] - UI를 생성할 Element ID 또는 Class name
 * @param {gb3d.Map} obj.map - {@link gb3d.Map}
 * @author KIM HOCHUL
 * @date 2019. 12. 24
 * @version 0.01
 */
gb3d.tree.Three = function(obj) {
	var that = this;
	
	var options = obj || {};
	var target = options.target || "body";
	this.map = options.map || undefined;
	this.otree = options.otree || undefined;
	if (this.otree instanceof gb3d.tree.OpenLayers) {
		this.otree.setThreeTree(this);
	}
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
								var type = obj.type;
								var id = obj.id;
// var threeObject = that.map.getThreeObjectByUuid( id );
// var center = threeObject.getCenter();
// var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									result = exporter.parse(resetObj);
									downloadString( result, id + '.obj' );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										result = exporter.parse(resetObj);
										downloadString( result, id + '.obj' );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									result = exporter.parse(resetObj);
									downloadString( result, id + '.dae' );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										result = exporter.parse(resetObj);
										downloadString( result, id + '.dae' );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									result = exporter.parse(resetObj);
									
									exporter.parse( resetObj, function( result ){
										
										downloadArrayBuffer( result, id + '.glb' );
										
									}, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true } );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										result = exporter.parse(resetObj);
										
										exporter.parse( resetObj, function( result ){
											
											downloadArrayBuffer( result, id + '.glb' );
											
										}, { binary: true, forceIndices: true, forcePowerOfTwoTextures: true } );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									result = exporter.parse(resetObj);
									
									exporter.parse( resetObj, function(result){
										var output = JSON.stringify( result, null, 2 );
										downloadString( output, id + '.gltf' );
									} );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										result = exporter.parse(resetObj);
										
										exporter.parse( resetObj, function(result){
											var output = JSON.stringify( result, null, 2 );
											downloadString( output, id + '.gltf' );
										} );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									
									result = exporter.parse( resetObj.geometry );
									downloadString( result, id + '.drc' );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										
										result = exporter.parse( resetObj.geometry );
										downloadString( result, id + '.drc' );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									
									result = exporter.parse( resetObj );
									downloadString( result, id + '.ply' );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										
										result = exporter.parse( resetObj );
										downloadString( result, id + '.ply' );
									}
								}
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
								var type = obj.type;
								var id = obj.id;
								
								var child, threeObject, object, center, centerHigh, result;
								if(type === "Three"){
									threeObject = that.map.getThreeObjectByUuid( id );
									
									if(!threeObject){
										return;
									}
									
									threeObject.updateExtent();
									object = threeObject.getObject().clone();
									center = threeObject.getCenter();
									centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
									
									gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
									var resetObj = gb3d.Math.resetRotationAndPosition(object);
									
									result = exporter.parse( resetObj );
									downloadString( result, id + '.stl' );
								} else {
									for(var i in obj.children){
										child = inst.get_node(obj.children[i]);
										threeObject = that.map.getThreeObjectByUuid( child.id );
										if(!threeObject){
											continue;
										}
										
										threeObject.updateExtent();
										object = threeObject.getObject().clone();
										center = threeObject.getCenter();
										centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
										
										gb3d.Math.resetMatrixWorld( object, threeObject.getObject().rotation, centerHigh );
										var resetObj = gb3d.Math.resetRotationAndPosition(object);
										
										result = exporter.parse( resetObj );
										downloadString( result, id + '.stl' );
									}
								}
							}
						}
					}
				}
				
// var lookAtObj = {
// "separator_before" : false,
// "icon" : "fas fa-ruler-combined",
// "separator_after" : false,
// "label" : "수평맞추기",
// "action" : function(data){
// var inst = $.jstree.reference(data.reference),
// obj = inst.get_node(data.reference),
// type = obj.type,
// id = obj.id;
//						
// var child, threeObject, object, center, centerHigh;
// if(type === "Three"){
// threeObject = that.map.getThreeObjectByUuid( id );
// if(!threeObject){
// return;
// }
// object = threeObject.getObject();
// center = threeObject.getCenter();
// centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
//							
// // Three Object 지구 평면에 맞게 회전
// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
//							
// if (threeObject.getIsFromFile()) {
// var axisy1 = turf.point([ 90, 0 ]);
// var pickPoint = turf.point(center);
// var bearing = turf.bearing(pickPoint, axisy1);
// console.log("y축 1과 객체 중점의 각도는: " + bearing);
// object.rotateZ(Cesium.Math.toRadians(bearing));
// }
// } else {
// for(var i in obj.children){
// child = inst.get_node(obj.children[i]);
// threeObject = that.map.getThreeObjectByUuid( child.id );
// if(!threeObject){
// continue;
// }
//								
// object = threeObject.getObject();
// center = threeObject.getCenter();
// centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
//								
// // Three Object 지구 평면에 맞게 회전
// object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
//								
// if (threeObject.getIsFromFile()) {
// var axisy1 = turf.point([ 90, 0 ]);
// var pickPoint = turf.point(center);
// var bearing = turf.bearing(pickPoint, axisy1);
// console.log("y축 1과 객체 중점의 각도는: " + bearing);
// object.rotateZ(Cesium.Math.toRadians(bearing));
// }
// }
// }
// }
// }
				
// var quaternionObj = {
// "separator_before" : false,
// "icon" : "fas fa-grip-lines-vertical",
// "separator_after" : false,
// "label" : "축맞추기",
// "action": function(data){
// var inst = $.jstree.reference(data.reference),
// obj = inst.get_node(data.reference),
// type = obj.type,
// id = obj.id;
//						
// var child, threeObject, object, center, centerHigh, quaternion, vertices;
// if(type === "Three"){
// threeObject = that.map.getThreeObjectByUuid( id );
// if(!threeObject){
// return;
// }
//							
// object = threeObject.getObject();
// center = threeObject.getCenter();
// centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
//							
// applyQuaternion( object, centerHigh, object.quaternion.clone() );
// } else {
// for(var i in obj.children){
// child = inst.get_node(obj.children[i]);
// threeObject = that.map.getThreeObjectByUuid( child.id );
// if(!threeObject){
// continue;
// }
//								
// object = threeObject.getObject();
// center = threeObject.getCenter();
// centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
//								
// applyQuaternion( object, centerHigh, object.quaternion.clone() );
// }
// }
// }
// }
				
				if(o.type === "Point" || o.type === "MultiPoint" || o.type === "LineString" ||
						o.type === "MultiLineString" || o.type === "Polygon" || o.type === "MultiPolygon" || o.type === "Three"){
					totalObj["export"] = exportObj;
// totalObj["lookat"] = lookAtObj;
// totalObj["quaternion"] = quaternionObj;
				}
				
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
			},
			"Three" : {
				"icon" : "fas fa-cube gb-fa-xxs"
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
	
	this.editingTool3D = options.editingTool3D ? options.editingTool3D : undefined;
	
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
			that.getEditingTool3D().selectThree(selected[0], true);
			that.getEditingTool3D().syncSelect(selected[0], true);
		}
	});
	
	this.map.getThreeScene().addEventListener( "addObject", function(e){
		var threeObject = e.object;
		var object = threeObject.getObject();
		var treeid = threeObject.getTreeid();
		var featureId = threeObject.feature.getId();
		
		that.jstree.create_node( treeid, {
			"parent": treeid,
			"id": object.uuid,
			"text": featureId,
			"type": "Three"
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
// if(object.userData.type){
// return;
// }
		
		if(!object.geometry){
			if(object.children instanceof Array){
				for(var i = 0; i < object.children.length; i++){
					// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때
					// 재귀함수 요청
					object.position.copy(new THREE.Vector3(0, 0, 0));
					quat = object.rotation.clone();
					object.lookAt(new THREE.Vector3(0, 0, 1));
					object.setRotationFromEuler(quat);
// object.matrix.makeRotationFromQuaternion(quat);
// object.matrixWorld.makeRotationFromQuaternion(quat);
					resetMatrixWorld(object.children[i], quat, center);
				}
			}
		} else {
// object.position.copy(new THREE.Vector3(0, 0, 0));
			object.lookAt(new THREE.Vector3(0, 0, 1));
			object.setRotationFromEuler(quat);
// object.matrix.makeRotationFromQuaternion(quat);
// object.matrixWorld.makeRotationFromQuaternion(quat);
// object.setRotationFromQuaternion(quat);
		}
	}
	
	function applyQuaternion ( obj, centerHigh, quaternion ) {
		var object = obj;
		var ch = centerHigh;
		var quat = quaternion;
		
		var rotation, normal, position, vertices;
		if(!object.geometry){
			if(object.children instanceof Array){
				for(var i = 0; i < object.children.length; i++){
					rotation = object.rotation.clone();
					object.lookAt(new THREE.Vector3(ch.x, ch.y, ch.z));
					if(object.rotation.equals(rotation)){
						return;
					}
					applyQuaternion(object.children[i], ch, object.quaternion.clone());
				}
			}
		} else {
			// 원점을 바라보도록 설정한다
			rotation = object.rotation.clone();
			object.lookAt(new THREE.Vector3(ch.x, ch.y, ch.z));
			if(object.rotation.equals(rotation)){
				return;
			}
			// 쿼터니언각을 뒤집는다
			quat.inverse();
			// 모든 지오메트리 버텍스에
			if(object.geometry instanceof THREE.BufferGeometry){
				position = object.geometry.attributes.position;
				
				var points = [];
				for (var i = 0; i < position.count; i++){
					var x = position.getX(i), y = position.getY(i), z = position.getZ(i);
					var vertex = new THREE.Vector3(x, y, z);
					vertex.applyQuaternion(quat);
					points.push(vertex.x);
					points.push(vertex.y);
					points.push(vertex.z);
				}
				
				var newVertices = new Float32Array(points);
				object.geometry.addAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
			} else {
				vertices = object.geometry.vertices;
				for (var i = 0; i < vertices.length; i++) {
					var vertex = vertices[i];
					// 뒤집은 쿼터니언각을 적용한다
					vertex.applyQuaternion(quat);
				}
			}
		}
	}
}
/**
 * 3D 모델 편집도구 객체를 반환한다.
 * 
 * @method gb3d.tree.Three#getEditingTool3D
 * @return {gb3d.edit.editingTool3D} 3D 모델 레코드 객체
 */
gb3d.tree.Three.prototype.getEditingTool3D = function(){
	return typeof this.editingTool3D === "function" ? this.editingTool3D() : this.editingTool3D;
};

/**
 * 3D 모델 편집도구 객체를 반환한다.
 * 
 * @method gb3d.tree.Three#getJSTree
 * @return {jsTree} jstree 객체
 */
gb3d.tree.Three.prototype.getJSTree = function(){
	return this.jstree;
};

/**
 * openlayers tree 객체를 반환한다.
 * 
 * @method gb3d.tree.Three#getOpenlayersTree
 * @return {gb3d.tree.Openlayers}
 */
gb3d.tree.Three.prototype.getOpenlayersTree = function(){
	return this.otree;
};

/**
 * openlayers tree 객체를 설정한다.
 * 
 * @method gb3d.tree.Three#setOpenlayersTree
 * @param {gb3d.tree.Openlayers} tree - 트리 객체
 */
gb3d.tree.Three.prototype.setOpenlayersTree = function(tree){
	this.otree = tree;
};

/**
 * 트리를 새로고침한다.
 * 
 * @method gb3d.tree.Three#refresh
 * @param {gb3d.tree.Openlayers} tree - 트리 객체
 */
gb3d.tree.Three.prototype.refresh = function(){
	var otree = getOpenlayersTree();
	var jstreeLayers = otree.getJSTree();
	var jstreeModel = this.getJSTree();
	var rootNodeModel = jstreeModel.get_node("#");
	
};