/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.io)
	gb3d.io = {};
if (!gb3d.io.importer)
	gb3d.io.importer = {};
/**
 * @classdesc importerThree 객체를 정의한다.
 * 
 * @class gb3d.io.ImporterThree
 * @memberof gb3d.io
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @author SOYIJUN
 */
gb3d.io.ImporterThree = function(obj) {
	var that = this;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"import" : {
			"ko" : "불러오기",
			"en" : "Import"
		},
		"titlemsg" : {
			"ko" : "3D 파일 불러오기",
			"en" : "Import a 3D File"
		},
		"notice" : {
			"ko" : "3D 파일을 업로드 해주세요. ex) obj, dae, glb, gltf, 3ds, stl",
			"en" : "Please upload a file of 3D format. ex) obj, dae, glb, gltf, 3ds, stl"
		},
		"err" : {
			"ko" : "업로드 중 오류가 발생하였습니다.",
			"en" : "There was an error uploading."
		},
		"succ" : {
			"ko" : "업로드를 완료하였습니다.",
			"en" : "Upload completed."
		}
	};
	var options = obj ? obj : {};
	this.locale = options.locale ? options.locale : "en";
	this.uploadURL = options.url ? options.url : undefined;
	this.decoder = options.decoder ? options.decoder : undefined;
	this.gb3dMap = options.gb3dMap ? options.gb3dMap : undefined;
	this.gb2dMap = this.gb3dMap ? this.gb3dMap.getGbMap() : undefined;
	this.layer = options.layer ? options.layer : undefined;
	this.threeTree = options.threeTree ? options.threeTree : undefined;
	this.feature = new ol.Feature();
	obj.width = 300;
	obj.autoOpen = false;
	obj.title = this.translation.titlemsg[this.locale];
	// obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	// 3D file object
	this.object = undefined;
	this.radian = 0;
	this.axisVector = new THREE.Vector3(0, 0, 1);
	// === 이준 시작 ===
	this.pob = new ol.Collection();
	// === 이준 끝 ====
	var body = this.getModalBody();
	var notice = $("<div>").text(this.translation.notice[this.locale]);
	this.inputFile = $("<input>").attr({
		"type" : "file"
	});
	this.complete = $("<div>");
	$(body).append(notice).append(this.inputFile).append(this.complete);

	this.axisSelect = $("<select class='form-control'>");
	var axisOptions = [ "X", "Y", "Z" ];
	var axisOption;
	for (var i = 0; i < axisOptions.length; i++) {
		axisOption = $("<option>").val(axisOptions[i]).text(axisOptions[i]);
		this.axisSelect.append(axisOption);
	}
	var selectName = $("<div class='col-md-2'>").text("Axis");
	var selectCol = $("<div class='col-md-10'>").append(this.axisSelect);
	var selectDiv = $("<div class='row' style='margin-top:10px;'>").append(selectName).append(selectCol);
	$(body).append(selectDiv);

	this.degreeInput = $("<input class='form-control'>").val(0);
	var inputName = $("<div class='col-md-2'>").text("Degree");
	var inputCol = $("<div class='col-md-10'>").append(this.degreeInput);
	var inputDiv = $("<div class='row' style='margin-top:10px;'>").append(inputName).append(inputCol);
	$(body).append(inputDiv);

	var footer = this.getModalFooter();
	var cancelBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]).click(function() {
		that.close();
	});
	var uploadBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(this.translation["import"][this.locale]).click(function() {
		// that.upload();

		var d = that.degreeInput.val();
		var a = that.axisSelect.val();
		var result = gb3d.io.ImporterThree.axisAngle(d, a);
		that.radian = result.radian;
		that.axisVector = result.vector;
		that.loadFile($(that.inputFile)[0].files[0]);
	});
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(uploadBtn).append(cancelBtn);
	$(footer).append(buttonArea);
};
gb3d.io.ImporterThree.prototype = Object.create(gb.modal.ModalBase.prototype);
gb3d.io.ImporterThree.prototype.constructor = gb3d.io.ImporterThree;

/**
 * 파일을 읽는다.
 * 
 * @method gb.versioning.Repository#loadFile
 * @param {boolean}
 *            show - 스피너 표시 유무
 * @param {gb.modal.ModalBase}
 *            modal - 스피너를 표시할 모달 객체
 */
gb3d.io.ImporterThree.prototype.loadFile = function(file) {
	var that = this;
	var filename = file.name;
	var extension = filename.split('.').pop().toLowerCase();

	var reader = new FileReader();
	reader.addEventListener('progress', function(event) {

		// var size = '(' + Math.floor(event.total / 1000).format() + ' KB)';
		// var progress = Math.floor((event.loaded / event.total) * 100) + '%';

		// console.log('Loading', filename, size, progress);
		console.log(event);

	});

	switch (extension) {

	case 'obj':

		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			var object = new THREE.OBJLoader().parse(contents);
			object.name = filename;

			// editor.execute(new AddObjectCommand(editor, object));
			that.object = object;
			that.activeDraw();
			that.close();
		}, false);
		reader.readAsText(file);

		break;

	case '3ds':
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;

			var object = new THREE.TDSLoader().parse(contents);
			object.name = filename;

			that.object = object;
			that.activeDraw();
			that.close();
		});
		reader.readAsArrayBuffer(file);
		break;

	case 'glb':

		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			THREE.DRACOLoader.setDecoderPath(that.decoder);

			var loader = new THREE.GLTFLoader();
			loader.setDRACOLoader(new THREE.DRACOLoader());
			loader.parse(contents, '', function(result) {

				var scene = result.scene;
				var children = scene.children;
				var group = new THREE.Group();
				/*
				 * for(var i = 0; i < children.length; i++){ if(children[i]
				 * instanceof THREE.Object3D && !(children[i] instanceof
				 * THREE.Mesh)){ var arr = children[i].children; for(var j = 0;
				 * j < arr.length; j++){ if(arr[j] instanceof THREE.Mesh){
				 * group.add(arr[j]); } } } else if(children[i] instanceof
				 * THREE.Mesh){ group.add(children[i]); } }
				 */
				for (var i = 0; i < children.length; i++) {
					group.add(children[i]);
				}
				group.name = filename;
				that.object = group;
				that.activeDraw();
				that.close();
				// editor.addAnimation(scene, result.animations);
				// editor.execute(new AddObjectCommand(editor, scene));

			});

		}, false);
		reader.readAsArrayBuffer(file);

		break;

	case 'gltf':
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;

			var loader;
			if (gb3d.io.ImporterThree.isGLTF1(contents)) {
				loader = new THREE.LegacyGLTFLoader();
			} else {
				loader = new THREE.GLTFLoader();
			}

			loader.parse(contents, '', function(result) {
				var scene = result.scene;
				var children = scene.children;
				var group = new THREE.Group();
				for (var i = 0; i < children.length; i++) {
					group.add(children[i]);
				}
				group.name = filename;

				that.object = group;
				that.activeDraw();
				that.close();
			});

		});
		reader.readAsArrayBuffer(file);
		break;

	case 'dae':
		reader.addEventListener('load', function(event) {
			var contents = event.target.result;

			var collada = new THREE.ColladaLoader().parse(contents);
			var scene = collada.scene;
			var children = scene.children;
			var group = new THREE.Group();
			for (var i = 0; i < children.length; i++) {
				group.add(children[i]);
			}

			group.name = filename;
			that.object = group;
			that.activeDraw();
			that.close();
		});
		reader.readAsText(file);
		break;

	case 'stl':

		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			var geometry = new THREE.STLLoader().parse(contents);
			geometry.sourceType = "stl";
			geometry.sourceFile = file.name;

			var material = new THREE.MeshStandardMaterial({
				side : THREE.DoubleSide
			});

			var mesh = new THREE.Mesh(geometry, material);
			mesh.name = filename;

			that.object = mesh;
			that.activeDraw();
			that.close();

		}, false);

		if (reader.readAsBinaryString !== undefined) {

			reader.readAsBinaryString(file);

		} else {

			reader.readAsArrayBuffer(file);

		}

		break;

	case 'zip':

		reader.addEventListener('load', function(event) {

			handleZIP(event.target.result);

		}, false);
		reader.readAsBinaryString(file);

		break;

	default:

		// alert( 'Unsupported file format (' + extension + ').' );

		break;

	}

};

/**
 * Point 그리기 Interaction을 활성화한다.
 * 
 * @method gb3d.io.ImporterThree.prototype#activeDraw
 */
gb3d.io.ImporterThree.prototype.activeDraw = function() {
	var that = this;
	var layer = this.layer;
	var source = layer.getSource();
	var draw = new ol.interaction.Draw({
		source : source,
		type : "Point"
	});

	that.gb2dMap.getUpperMap().addInteraction(draw);

	draw.on("drawend", function(evt) {
		var feature = evt.feature.clone();
		evt.feature = undefined;
		// feature.setId(that.object.uuid);
		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();
		var obj3d = new gb3d.object.ThreeObject({
			"object" : that.object,
			"center" : coordinates,
			"extent" : geometry.getExtent(),
			"type" : that.layer.get("git").geometry,
			"feature" : feature,
			"file" : true
		});
		var center = [ coordinates[0], coordinates[1] ];
		var centerCart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0);
		var centerHigh = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 1);

		var position = that.object.position;
		var cart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
		position.copy(new THREE.Vector3(cart.x, cart.y, cart.z));
//		that.object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, that.axisVector, that.radian);

		// 오브젝트에서 메쉬를 꺼낸다
		var result = gb3d.io.ImporterThree.getChildrenMeshes(that.object, []);
		// 레이어 지오메트리 타입을 꺼낸다
		var gtype = that.layer.get("git").geometry;
		// 메쉬에 유저정보로 지오메트리 타입을 넣는다 - 폴리곤
		that.object.userData.type = gtype;
		for (var i = 0; i < result.length; i++) {
			result[i].userData.type = gtype;			
		}
		
		console.log(that.object);

		that.gb2dMap.getUpperMap().removeInteraction(draw);

		gb3d.io.ImporterThree.refreshFloorPlan(layer, obj3d);
		that.gb3dMap.getThreeScene().add(that.object);
		that.gb3dMap.addThreeObject(obj3d);
		/*
		var floor = gb3d.io.ImporterThree.getFloorPlan(that.object, center, []);
		var features = turf.featureCollection(floor);
		var dissolved = undefined;
		*/
//		try {
//			dissolved = turf.dissolve(features);
//		} catch (e) {
//			// TODO: handle exception
//			console.error(e);
//			return;
//		}
//		var fea;
//		if (dissolved) {
//			if (dissolved.type === "FeatureCollection") {
//				fea = [];
//				for (var i = 0; i < dissolved.features.length; i++) {
//					if (dissolved.features[i].geometry.type === 'Polygon') {
//						if (that.layer.get("git").geometry === "Polygon") {
//							var geom = new ol.geom.Polygon(dissolved.features[i].geometry.coordinates, "XY");
//							var feature = new ol.Feature(geom);
//							feature.setId(that.object.uuid);
//							obj3d["feature"] = feature;
//							fea.push(feature);
//						} else if (that.layer.get("git").geometry === "MultiPolygon") {
//							var geom = new ol.geom.MultiPolygon([ dissolved.features[i].geometry.coordinates ], "XY");
//							var feature = new ol.Feature(geom);
//							feature.setId(that.object.uuid);
//							obj3d["feature"] = feature;
//							fea.push(feature);
//						}
//					} else if (dissolved.features[i].geometry.type === 'MultiPolygon') {
//						if (that.layer.get("git").geometry === "Polygon") {
//							var outer = dissolved.features[i].geometry.coordinates;
//							// for (var j = 0; j < 1; j++) {
//							var polygon = outer[0];
//							var geomPoly = new ol.geom.Polygon(polygon, "XY");
//							var feature = new ol.Feature(geomPoly);
//							feature.setId(that.object.uuid);
//							fea.push(feature);
//							obj3d["feature"] = feature;
//							// }
//						} else if (that.layer.get("git").geometry === "MultiPolygon") {
//							var geom = new ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates, "XY");
//							var feature = new ol.Feature(geom);
//							feature.setId(that.object.uuid);
//							obj3d["feature"] = feature;
//							fea.push(feature);
//						}
//					}
//
//				}
//				source.addFeatures(fea);
//			}
//		}
//
//		// === 이준 시작 ===
//		var axisy1 = turf.point([ 90, 0 ]);
//		var pickPoint = turf.point(center);
//		var bearing = bearing = turf.bearing(pickPoint, axisy1);
//		console.log("y축 1과 객체 중점의 각도는: " + bearing);
//		// var zaxis = new THREE.Vector3(0, 0, 1);
//		// gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, zaxis,
//		// Cesium.Math.toRadians(bearing));
//		that.object.rotateZ(Cesium.Math.toRadians(bearing));
//		
//		that.gb3dMap.getThreeScene().add(that.object);
//		that.gb3dMap.addThreeObject(obj3d);
		// === 이준 끝 ===
		
		var treeid = layer.get("treeid");
		
		var l = source.getFeatureById(treeid + ".new0");
		
		if (!l) {
			var fid = treeid + ".new0";
			feature.setId(fid);
		} else {
			var count = 1;
			while(source.getFeatureById(treeid + ".new" + count) !== null){
				count++;
			}
			var fid = treeid + ".new" + count;
			feature.setId(fid);
		}

		source.addFeature(feature);
		var featureId = obj3d.feature.getId();
		
		that.threeTree.create_node( treeid, {
			"parent": treeid,
			"id": that.object.uuid,
			"text": featureId,
			"type": "Three"
		}, "last", false, false );
	});
}

/**
 * 스피너를 보여준다.
 * 
 * @method gb.versioning.Repository#showSpinner
 * @param {boolean}
 *            show - 스피너 표시 유무
 * @param {gb.modal.ModalBase}
 *            modal - 스피너를 표시할 모달 객체
 */
gb3d.io.ImporterThree.prototype.showSpinner = function(show, modal) {
	if (show) {
		var spinnerArea = $("<div>").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x")).addClass("gb-spinner-wrap").addClass("gb-spinner-body").css({
			"padding-top" : "50px"
		});
		$(modal.getModal()).append(spinnerArea);
	} else {
		$(modal.modal).find(".gb-spinner-wrap").remove();
	}
};

/**
 * 선택한 파일을 업로드한다.
 * 
 * @method gb3d.io.ImporterThree#getUploadURL
 * @return {String} 업로드 URL
 */
gb3d.io.ImporterThree.prototype.getUploadURL = function() {
	return this.uploadURL;
};

/**
 * 업로드 메세지를 출력한다.
 * 
 * @method gb3d.io.ImporterThree#printMessage
 * @param {String}
 *            msg - 표시할 메세지
 */
gb3d.io.ImporterThree.prototype.printMessage = function(msg) {
	$(this.complete).empty();
	$(this.complete).text(msg);
};

/**
 * 객체를 회전시킬 방향벡터를 반환한다.
 * 
 * @method gb3d.io.ImporterThree.axisAngle
 * @param {Number}
 *            degree - 객체를 회전시킬 각
 * @param {String}
 *            axis - 객체를 회전시킬 축의 이름("X", "Y", "Z")
 */
gb3d.io.ImporterThree.axisAngle = function(degree, axis) {
	var a = axis;
	var d = parseFloat(degree);

	var rad = (d * Math.PI) / 180;

	var vec;
	switch (a) {
	case "X":
		vec = new THREE.Vector3(1, 0, 0);
		break;
	case "Y":
		vec = new THREE.Vector3(0, 1, 0);
		break;
	case "Z":
		vec = new THREE.Vector3(0, 0, 1);
		break;
	default:
		break;
	}

	return {
		vector : vec,
		radian : rad
	}
}

gb3d.io.ImporterThree.applyAxisAngleToAllMesh = function(obj, axis, radian) {
	var object = obj, axis = axis, radian = radian;

	if (!object.geometry) {
		if (object.children instanceof Array) {
			for (var i = 0; i < object.children.length; i++) {
				// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때
				// 재귀함수 요청
				gb3d.io.ImporterThree.applyAxisAngleToAllMesh(object.children[i], axis, radian);
			}
		}
	} else {
		// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
		// var quaternion = object.quaternion.clone();
		// // 쿼터니언각을 뒤집는다
		// quaternion.inverse();
		// // 모든 지오메트리 버텍스에
		var points = [];
		var normalPoints = [];
		var vertices = object.geometry.attributes.position.array;
		var normal = object.geometry.attributes.normal ? object.geometry.attributes.normal.array : false;
		var normalFlag = normal ? true : false; 
		for (var j = 0; j < vertices.length; j = j + 3) {
			var vertex = new THREE.Vector3(vertices[j], vertices[j + 1], vertices[j + 2]);
			vertex.applyAxisAngle(axis, radian);
			points.push(vertex.x);
			points.push(vertex.y);
			points.push(vertex.z);
			if (normalFlag) {
				var norm = new THREE.Vector3(normal[j], normal[j + 1], normal[j + 2]);
				norm.applyAxisAngle(axis, radian);
				normalPoints.push(norm.x);
				normalPoints.push(norm.y);
				normalPoints.push(norm.z);
			}
		}
		var newVertices = new Float32Array(points);
		object.geometry.addAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
		if (normalFlag) {
			var newNormalVertices = new Float32Array(normalPoints);
			object.geometry.addAttribute('normal', new THREE.BufferAttribute(newNormalVertices, 3));
		}
		console.log("mesh modified success");
	}
}

/**
 * GLTF 파일 유효성 검사
 * 
 * @method gb3d.io.ImporterThree.isGLTF1
 * @param {Object}
 *            contents - 파일 객체
 */
gb3d.io.ImporterThree.isGLTF1 = function(contents) {

	var resultContent;

	if (typeof contents === 'string') {

		// contents is a JSON string
		resultContent = contents;

	} else {

		var magic = THREE.LoaderUtils.decodeText(new Uint8Array(contents, 0, 4));

		if (magic === 'glTF') {

			// contents is a .glb file; extract the version
			var version = new DataView(contents).getUint32(4, true);

			return version < 2;

		} else {

			// contents is a .gltf file
			resultContent = THREE.LoaderUtils.decodeText(new Uint8Array(contents));

		}

	}

	var json = JSON.parse(resultContent);

	return (json.asset != undefined && json.asset.version[0] < 2);
}

gb3d.io.ImporterThree.getChildrenMeshes = function(obj, result) {
	if (obj instanceof THREE.Group) {
		var chr = obj.children;
		for (var i = 0; i < chr.length; i++) {
			var result = gb3d.io.ImporterThree.getChildrenMeshes(chr[i], result);			
		}
	} else if (obj instanceof THREE.Mesh) {
		result.push(obj);
	}
	return result;
},

gb3d.io.ImporterThree.getFloorPlan = function(obj, center, result) {
	var that = this;
	var object = obj;
	var center = center;
//	var scene = scene;
	var pos, poly;
	var prev = undefined;
	var parser = new jsts.io.OL3Parser();
	if (!object.geometry) {
		if (object.children instanceof Array) {
			// result = [];
			for (var i = 0; i < object.children.length; i++) {
				// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때
				// 재귀함수 요청
				result = gb3d.io.ImporterThree.getFloorPlan(object.children[i], center, result);
			}
		}
		// return result;
	} else if (object.geometry instanceof THREE.BufferGeometry) {
		// 겹치지 않아서 못 합친 폴리곤 모음
		var mergeYet = [];
		pos = object.geometry.attributes.position.array;
		for (var i = 0; i < pos.length; i = i + 9) {
			if ((!pos[i + 3] || !pos[i + 4] || !pos[i + 5]) || (!pos[i + 6] || !pos[i + 7] || !pos[i + 8])) {
				console.log(pos[i + 3]);
				break;
			}
			var worldPts = [];
			// 중점설정
			var centerPoint = turf.point(center);
			for (var j = 0; j < 9; j += 3) {
				// 좌표를 미터로 간주하고 킬로미터로 절대값 변환
				var distance = Math.abs(pos[i + j] / 1000);
				// 진행방향 각도 x 축이면 서쪽 -90 또는 동쪽 90
				var bearing;
				if (pos[i + j] < 0) {
					bearing = -90;
					// bearing = 180;
				} else {
					bearing = 90;
					// bearing = 0;
				}
				// 중점으로부터 x좌표 만큼 이동한 곳
				var offsetx = turf.destination(centerPoint, distance, bearing);
				// x좌표 만큼 이동한 곳을 중점으로 y만큼 이동하기
				// 좌표를 미터로 간주하고 킬로미터로 변환
				var distance = Math.abs(pos[i + j + 1] / 1000);
				// 진행방향 각도 y 축이면 남쪽 180 또는 북쪽 0
				var bearing;
				if (pos[i + j + 1] < 0) {
					bearing = 180;
					// bearing = 90;
				} else {
					bearing = 0;
					// bearing = -90;
				}
				// x오프셋 으로부터 y좌표 만큼 이동한 곳
				var destination = turf.destination(offsetx, distance, bearing);
				destination = turf.point([ parseFloat(destination.geometry.coordinates[0].toFixed(6)), parseFloat(destination.geometry.coordinates[1].toFixed(6)) ]);
				worldPts.push(destination);
			}

			var pt1 = worldPts[0];
			var pt2 = worldPts[1];
			var pt3 = worldPts[2];
			var flag1 = turf.booleanEqual(pt1, pt2);
			var flag2 = turf.booleanEqual(pt1, pt3);
			var flag3 = turf.booleanEqual(pt2, pt3);
			if (pt1 === undefined || pt2 === undefined || pt3 === undefined) {
				continue;
			}
			if (flag1 || flag2 || flag3) {
				continue;
			}
			var poly = turf.polygon([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ]);
			result.push(poly);
			worldPts = [];
		}
	}
	return result;
}

gb3d.io.ImporterThree.refreshFloorPlan = function(layer, threeObj){
	var center = threeObj.getCenter();
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
	var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
	
	var floor = gb3d.io.ImporterThree.getFloorPlan(threeObj.getObject(), center, []);
	var features = turf.featureCollection(floor);
	var dissolved = undefined;
	try {
		dissolved = turf.dissolve(features);
	} catch (e) {
		// TODO: handle exception
		console.error(e);
		var bbox = turf.bbox(features);
		var bboxPolygon = turf.bboxPolygon(bbox);
		var geom = new ol.geom.Polygon(bboxPolygon.geometry.coordinates, "XY");
		var feature = new ol.Feature(geom);
		layer.getSource().addFeature(feature);
		threeObj["feature"] = feature;
		return;
	}
	var fea;
	if (dissolved) {
		if (dissolved.type === "FeatureCollection") {
			fea = [];
			for (var i = 0; i < dissolved.features.length; i++) {
				if (dissolved.features[i].geometry.type === 'Polygon') {
					if (layer.get("git").geometry === "Polygon") {
						var geom = new ol.geom.Polygon(dissolved.features[i].geometry.coordinates, "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon([ dissolved.features[i].geometry.coordinates ], "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					}
				} else if (dissolved.features[i].geometry.type === 'MultiPolygon') {
					if (layer.get("git").geometry === "Polygon") {
						var outer = dissolved.features[i].geometry.coordinates;
						// for (var j = 0; j < 1; j++) {
						var polygon = outer[0];
						var geomPoly = new ol.geom.Polygon(polygon, "XY");
						var feature = new ol.Feature(geomPoly);
						feature.setId(threeObj.getObject().uuid);
						fea.push(feature);
						threeObj["feature"] = feature;
						// }
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates, "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getObject().uuid);
						threeObj["feature"] = feature;
						fea.push(feature);
					}
				}

			}
			layer.getSource().addFeatures(fea);
		}
	}

//	var axisy1 = turf.point([ 90, 0 ]);
//	var pickPoint = turf.point(center);
//	var bearing = bearing = turf.bearing(pickPoint, axisy1);
//	console.log("y축 1과 객체 중점의 각도는: " + bearing);
//	// var zaxis = new THREE.Vector3(0, 0, 1);
//	// gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, zaxis,
//	// Cesium.Math.toRadians(bearing));
//	that.object.rotateZ(Cesium.Math.toRadians(bearing));
};