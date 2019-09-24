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

	obj.width = 300;
	obj.autoOpen = false;
	obj.title = this.translation.titlemsg[this.locale];
	// obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	// 3D file object
	this.object = undefined;
	this.radian = 0;
	this.axisVector = new THREE.Vector3(0, 0, 1);

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
		var feature = evt.feature;
		feature.setId(that.object.uuid);
		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();
		var obj3d = new gb3d.object.ThreeObject({
			"object" : that.object,
			"center" : coordinates,
			"extent" : geometry.getExtent(),
			"type" : that.layer.get("git").geometry,
			"feature" : feature
		});
		var center = [ coordinates[0], coordinates[1] ];
		var centerCart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0);
		var centerHigh = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 1);

		var position = that.object.position;
		var cart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
		position.copy(new THREE.Vector3(cart.x, cart.y, cart.z));
		// mesh.lookAt(new THREE.Vector3(1,0,0));
		that.object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, that.axisVector, that.radian);

		that.gb3dMap.getThreeScene().add(that.object);
		that.gb3dMap.addThreeObject(obj3d);

		that.gb2dMap.getUpperMap().removeInteraction(draw);

		var floor = gb3d.io.ImporterThree.getFloorPlan(that.object, center, that.gb3dMap.cesiumViewer.scene);
		console.log(floor);
		var geom, fea;
		if (floor) {
			if (floor instanceof Array) {
				fea = [];
				for (var i = 0; i < floor.length; i++) {
					if (floor[i].geometry.type === 'Polygon') {
						geom = new ol.geom.Polygon(floor[i].geometry.coordinates);
					} else if (floor[i].geometry.type === 'MultiPolygon') {
						geom = new ol.geom.MultiPolygon(floor[i].geometry.coordinates);
					}
					fea.push(new ol.Feature({
						geometry : geom
					}));
				}

				source.addFeatures(fea);
			} else {
				if (floor.geometry.type === 'Polygon') {
					geom = new ol.geom.Polygon(floor.geometry.coordinates);
				} else if (floor.geometry.type === 'MultiPolygon') {
					geom = new ol.geom.MultiPolygon(floor.geometry.coordinates);
				}

				fea = new ol.Feature({
					geometry : geom
				});

				source.addFeature(fea);
			}
		}
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
		for (var j = 0; j < vertices.length; j = j + 3) {
			var vertex = new THREE.Vector3(vertices[j], vertices[j + 1], vertices[j + 2]);
			var vertexNormal = new THREE.Vector3(vertices[j], vertices[j + 1], vertices[j + 2]).normalize();
			// 뒤집은 쿼터니언각을 적용한다
			// vertex.applyQuaternion(quaternion);
			// vertexNormal.applyQuaternion(quaternion);
			vertex.applyAxisAngle(axis, radian);
			vertexNormal.applyAxisAngle(axis, radian);
			points.push(vertex.x);
			points.push(vertex.y);
			points.push(vertex.z);
			normalPoints.push(vertexNormal.x);
			normalPoints.push(vertexNormal.y);
			normalPoints.push(vertexNormal.z);
		}

		var newVertices = new Float32Array(points);
		var newNormalVertices = new Float32Array(normalPoints);
		object.geometry.addAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
		// object.geometry.addAttribute( 'normal', new THREE.BufferAttribute(
		// newNormalVertices, 3 ) );
		console.log("mesh modified success")
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

gb3d.io.ImporterThree.getFloorPlan = function(obj, center, scene) {
	var object = obj;
	var center = center;
	var scene = scene;
	var pos, poly, result;
	var prev = undefined;

	if (!object.geometry) {
		if (object.children instanceof Array) {
			result = [];
			for (var i = 0; i < object.children.length; i++) {
				// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때
				// 재귀함수 요청
				poly = gb3d.io.ImporterThree.getFloorPlan(object.children[i], center, scene);
				result.push(poly);
				// if(!result){
				// result = turf.clone(poly);
				// }
				//				
				// result = turf.union(result, poly);
			}
		}
	} else {
		if (object.geometry instanceof THREE.BufferGeometry) {
			pos = object.geometry.attributes.position.array;

			for (var i = 0; i < pos.length; i = i + 9) {
				// if(!pos[i+3] || !pos[i+6]){
				// console.log(pos[i+3]);
				// break;
				// }
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
					// 진행방향 각도 x 축이면 서쪽 -90 또는 동쪽 90
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
					worldPts.push(destination);
				}

				// 버텍스의 위치가 중점으로 부터 얼마인지
				// var localPt1 = [ pos[i], pos[i + 1] ];
				// var pt1x = turf.lengthToDegrees(pos[i], "meters");
				// var pt1y = turf.lengthToDegrees(pos[i + 1], "meters");

				// var localPt2 = [ pos[i + 3], pos[i + 4] ];
				// var pt2x = turf.lengthToDegrees(pos[i + 3], "meters");
				// var pt2y = turf.lengthToDegrees(pos[i + 4], "meters");

				// var localPt3 = [ pos[i + 6], pos[i + 7] ];
				// var pt3x = turf.lengthToDegrees(pos[i + 6], "meters");
				// var pt3y = turf.lengthToDegrees(pos[i + 7], "meters");

				// 중점의 좌표에 더하기
				// var worldPt1 = [ center[0] + pt1x, center[1] + pt1y ];
				// var worldPt2 = [ center[0] + pt2x, center[1] + pt2y ];
				// var worldPt3 = [ center[0] + pt3x, center[1] + pt3y ];
				// if (worldPt1.length !== 2 || worldPt2.length !== 2 ||
				// worldPt3.length !== 2) {
				// continue;
				// }
				// if (worldPt1[0] === undefined || worldPt1[1] === undefined ||
				// worldPt2[0] === undefined || worldPt2[1] === undefined ||
				// worldPt3[0] === undefined || worldPt3[1] === undefined) {
				// continue;
				// }

				if (!result) {
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
					console.log([ [ worldPts[0], worldPts[1], worldPts[2], worldPts[0] ] ]);
					result = turf.polygon([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ]);
					var geom = new ol.geom.Polygon([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ], "XY");
					var feature = new ol.Feature(geom);
					source.addFeature(feature);
					worldPts = [];
					continue;
				}
				var pt1 = worldPts[0];
				var pt2 = worldPts[1];
				var pt3 = worldPts[2];
				var flag1 = turf.booleanEqual(pt1, pt2);
				var flag2 = turf.booleanEqual(pt1, pt3);
				var flag3 = turf.booleanEqual(pt2, pt3);
				if (flag1 || flag2 || flag3) {
					continue;
				}
				console.log([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ]);
				poly = turf.polygon([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ]);
				var geom = new ol.geom.Polygon([ [ turf.getCoord(worldPts[0]), turf.getCoord(worldPts[1]), turf.getCoord(worldPts[2]), turf.getCoord(worldPts[0]) ] ], "XY");
				var feature = new ol.Feature(geom);
				source.addFeature(feature);
				worldPts = [];
				// if (!!result) {
				// result = turf.union(result, poly);
				// }
				// prev = turf.clone(result);
			}
		}
	}

	return result;
}