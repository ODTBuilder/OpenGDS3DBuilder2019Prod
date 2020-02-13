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
 * @class gb3d.io.ImporterThree
 * @memberof gb3d.io
 * @param {Object} obj - 생성자 옵션을 담은 객체
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
	this.frecord = options.featureRecord ? options.featureRecord : undefined;
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
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 표시할 모달 객체
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

			var dracoLoader = new THREE.DRACOLoader();
			dracoLoader.setDecoderPath(that.decoder);

			var loader = new THREE.GLTFLoader();
			loader.setDRACOLoader(dracoLoader);

			loader.parse(contents, '', function(result) {

				var scene = result.scene;
				var children = scene.children;
				var group = new THREE.Group();
				/*
				 * for(var i = 0; i < children.length; i++){ if(children[i] instanceof
				 * THREE.Object3D && !(children[i] instanceof THREE.Mesh)){ var arr =
				 * children[i].children; for(var j = 0; j < arr.length; j++){ if(arr[j] instanceof
				 * THREE.Mesh){ group.add(arr[j]); } } } else if(children[i] instanceof THREE.Mesh){
				 * group.add(children[i]); } }
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
			if (gb3d.io.ImporterThree.isGLTF(contents)) {
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
				side : THREE.FrontSide
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
		// =============================
		var feature = evt.feature;
		var dLayer;
		var source2;
		if (layer instanceof ol.layer.Tile) {
			var git = layer.get("git");
			if (git) {
				dLayer = git.tempLayer;
				if (dLayer instanceof ol.layer.Vector) {
					source2 = dLayer.getSource();
				}
			} else {
				git = source.get("git");
				if (git) {
					dLayer = git.tempLayer;
					if (dLayer instanceof ol.layer.Vector) {
						source2 = dLayer.getSource();
					}
				}
			}
		} else if (layer instanceof ol.layer.Vector) {
			source2 = source;
		}

		var arr = source2.getFeatures() instanceof Array ? source2.getFeatures() : [];
		var item = arr[0];
		var prop, notNull = {}, setProp = {};
		var fid;
		if (!!source2) {

			var lid = source2.get("git").id;
			var split = lid.split(":");
			var lname;
			if (split.length === 4) {
				lname = split[3];
			} else if (split.length === 1) {
				lname = split[0];
			}

			// if (layer instanceof ol.layer.Tile) {
			var l = source2.getFeatureById(lname + ".new0");
			if (!l) {
				fid = lname + ".new0";
				feature.setId(fid);
				that.getFeatureRecord().create(layer, feature);
			} else {
				var count = 1;
				while (source2.getFeatureById(lname + ".new" + count) !== null) {
					count++;
				}
				fid = lname + ".new" + count;
				feature.setId(fid);
				that.getFeatureRecord().create(layer, feature);
			}
			// } else if (layer instanceof ol.layer.Vector) {
			// l = source2.getFeatureById(layer.get("treeid") + ".new0");
			// if (!l) {
			// var fid = layer.get("treeid") + ".new0";
			// feature.setId(fid);
			// that.getFeatureRecord().create(layer, feature);
			// } else {
			// var count = 1;
			// while (source2.getFeatureById(layer.get("treeid") + ".new" + count) !== null) {
			// count++;
			// }
			// var fid = layer.get("treeid") + ".new" + count;
			// feature.setId(fid);
			// that.getFeatureRecord().create(layer, feature);
			// }
			// }

			gb.undo.pushAction({
				undo : function(data) {
					data.layer.getSource().removeFeature(data.feature);
					data.that.featureRecord.deleteFeatureCreated(data.layer.get("id"), data.feature.getId());

					// ThreeObject remove
					var threeObject = that.getGb3dMap().getThreeObjectById(data.feature.getId());
					that.getGb3dMap().removeThreeObject(threeObject);
				},
				redo : function(data) {
					data.layer.getSource().addFeature(data.feature);
					data.that.featureRecord.create(data.layer, data.feature);

					// ThreeObject remove cancel
					var threeObject = that.getGb3dMap().getThreeObjectById(data.feature.getId());
					that.getGb3dMap().removeThreeObject(threeObject, true);
				},
				data : {
					that : that,
					layer : layer,
					feature : feature
				}
			});
		}
		// =============================

		if (evt.target.source_ !== undefined && evt.target.source_ instanceof ol.source.TileWMS) {
			evt.target.source_ = source2;
		}
		// var cfeature = feature.clone();
		evt.feature = undefined;
		// feature.setId(that.object.uuid);
		console.log(that.object.userData);

		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();

		var result = gb3d.io.ImporterThree.getChildrenMeshes(that.object, []);
		// var mesh;
		if (result.length === 1) {
			// mesh = result[0];
			that.object = result[0];
		}
		var obj3d = new gb3d.object.ThreeObject({
			"object" : that.object,
			"center" : coordinates,
			"extent" : geometry.getExtent(),
			"type" : that.layer.get("git").geometry,
			"feature" : feature,
			"layer" : layer,
			"editable" : false,
			"file" : true
		});
		var center = [ coordinates[0], coordinates[1] ];
		var centerCart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0);
		var centerHigh = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], 1);

		var position = that.object.position;
		var cart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
		position.copy(new THREE.Vector3(cart.x, cart.y, cart.z));
		that.object.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, that.axisVector, that.radian);
		// 2D 피처의 각도와 맞춤
		var axisy1 = turf.point([ 90, 0 ]);
		var pickPoint = turf.point(center);
		var bearing = turf.bearing(pickPoint, axisy1);
		console.log("y축 1과 객체 중점의 각도는: " + bearing);
		// var zaxis = new THREE.Vector3(0, 0, 1);
		that.object.rotateZ(Cesium.Math.toRadians(bearing));

		// 오브젝트에서 메쉬를 꺼낸다
		// var result = gb3d.io.ImporterThree.getChildrenMeshes(that.object, []);
		// 레이어 지오메트리 타입을 꺼낸다
		var gtype = that.layer.get("git").geometry;
		// 메쉬에 유저정보로 지오메트리 타입을 넣는다 - 폴리곤
		that.object.userData.type = gtype;
		// featureId 를 넣는다
		that.object.userData.featureId = fid;
		// for (var i = 0; i < result.length; i++) {
		// result[i].userData.type = gtype;
		// // featureId 를 넣는다
		// result[i].userData.featureId = fid;
		// }

		console.log(that.object);

		that.gb2dMap.getUpperMap().removeInteraction(draw);

		gb3d.io.ImporterThree.refreshFloorPlan(layer, obj3d);
		that.gb3dMap.getThreeScene().add(that.object);
		that.gb3dMap.addThreeObject(obj3d);

		var record = that.getFeatureRecord().getModelRecord();
		if (record instanceof gb3d.edit.ModelRecord) {
			record.create(obj3d.getLayer(), obj3d);
		}

		var treeid = layer.get("treeid");

		var l = source2.getFeatureById(treeid + ".new0");

		if (!l) {
			var fid = treeid + ".new0";
			feature.setId(fid);
		} else {
			var count = 1;
			while (source2.getFeatureById(treeid + ".new" + count) !== null) {
				count++;
			}
			var fid = treeid + ".new" + count;
			feature.setId(fid);
		}

		source2.addFeature(feature);
		var featureId = obj3d.getFeature().getId();

		that.threeTree.create_node(treeid, {
			"parent" : treeid,
			"id" : that.object.uuid,
			"text" : featureId,
			"type" : "Three"
		}, "last", false, false);
	});
}

/**
 * 스피너를 보여준다.
 * 
 * @method gb.versioning.Repository#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 표시할 모달 객체
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
 * @param {String} msg - 표시할 메세지
 */
gb3d.io.ImporterThree.prototype.printMessage = function(msg) {
	$(this.complete).empty();
	$(this.complete).text(msg);
};

/**
 * 객체를 회전시킬 방향벡터를 반환한다.
 * 
 * @method gb3d.io.ImporterThree.axisAngle
 * @param {number} degree - 객체를 회전시킬 각
 * @param {String} axis - 객체를 회전시킬 축의 이름("X", "Y", "Z")
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

/**
 * 객체의 모든 Vertex에 Axis Angle 값을 적용한다.
 * 
 * @method gb3d.io.ImporterThree.applyAxisAngleToAllMesh
 * @function
 * @param {THREE.Object3D|THREE.Group} obj - 객체
 * @param {String} axis - 객체를 회전시킬 축의 이름("X", "Y", "Z")
 * @param {number} radian - 객체를 회전시킬 radian값
 */
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
		var geom = object.geometry;
		if (geom instanceof THREE.Geometry) {
			var vertices = object.geometry.vertices;
			for (var j = 0; j < vertices.length; j++) {
				var vertex = vertices[j];
				vertex.applyAxisAngle(axis, radian);
				// normal 값이 있으면 그것도 회전
			}
			console.log("mesh modified success");
		} else if (geom instanceof THREE.BufferGeometry) {
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
}

/**
 * GLTF 파일 유효성 검사
 * 
 * @method gb3d.io.ImporterThree.isGLTF
 * @param {Object} contents - 파일 객체
 */
gb3d.io.ImporterThree.isGLTF = function(contents) {

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

/**
 * THREE.Group 객체의 요소들중에 Mesh 객체를 반환한다.
 * 
 * @method gb3d.io.ImporterThree#getChildrenMeshes
 * @param {THREE.Group} obj - Mesh 객체를 검색할 그룹 객체
 * @param {Array.<THREE.Mesh>} result - 결과를 담을 배열
 * @return {Array.<THREE.Mesh>} THREE.Mesh객체 배열
 */
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

/**
 * 객체의 평면도를 반환한다.
 * 
 * @method gb3d.io.ImporterThree#getFloorPlan
 * @param {THREE.Object3D} obj - 평면도를 만들 객체
 * @param {Array.<number>} center - 객체의 중점
 * @param {Array.<Object>} result - 결과를 담을 배열
 * @return {Array.<Object>} 평면도 폴리곤이 담긴 배열
 */
gb3d.io.ImporterThree.getFloorPlan = function(obj, center, result) {
	var that = this;
	var object = obj;
	var center = center;
	// var scene = scene;
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
	} else if (object.geometry instanceof THREE.Geometry) {
		// 겹치지 않아서 못 합친 폴리곤 모음
		var mergeYet = [];
		// pos = object.geometry.attributes.position.array;
		var object = obj.clone();
		var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

		gb3d.Math.resetMatrixWorld(object, object.rotation, centerHigh);
		object = gb3d.Math.resetRotationAndPosition(object);

		var geometry = object.geometry;
		var vertices = geometry.vertices;
		var faces = geometry.faces;

		for (var i = 0; i < faces.length; i++) {

			var worldPts = [];
			// 중점설정
			var centerPoint = turf.point(center);

			var face = faces[i];
			var threeVertice = [ vertices[face.a], vertices[face.b], vertices[face.c] ];
			for (var j = 0; j < threeVertice.length; j++) {
				var oneVertex = threeVertice[j];

				// 좌표를 미터로 간주하고 킬로미터로 절대값 변환
				var distance = Math.abs(oneVertex.x / 1000);

				// 진행방향 각도 x 축이면 서쪽 -90 또는 동쪽 90
				var bearing;
				if (oneVertex.x < 0) {
					bearing = -90;
				} else {
					bearing = 90;
				}

				// 중점으로부터 x좌표 만큼 이동한 곳
				var offsetx = turf.destination(centerPoint, distance, bearing);
				// x좌표 만큼 이동한 곳을 중점으로 y만큼 이동하기
				// 좌표를 미터로 간주하고 킬로미터로 변환
				var distance = Math.abs(oneVertex.y / 1000);
				// 진행방향 각도 y 축이면 남쪽 180 또는 북쪽 0
				var bearing;
				if (oneVertex.y < 0) {
					bearing = 180;
				} else {
					bearing = 0;
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
/**
 * 3D 객체의 평면도를 뽑아서 Dissolve 한다.
 * 
 * @method gb3d.io.ImporterThree#refreshFloorPlan
 * @param {ol.layer.Vector} layer - 평면도를 입력할 레이어
 * @param {THREE.Object3D} threeObj - 평면도를 만들 객체
 */
gb3d.io.ImporterThree.refreshFloorPlan = function(layer, threeObj) {
	var center = threeObj.getCenter();
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
	var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

	var floor = gb3d.io.ImporterThree.getFloorPlan(threeObj.getObject(), center, []);
	var features = turf.featureCollection(floor);
	var dissolved = undefined;

	var finalSource;
	if (layer instanceof ol.layer.Tile) {
		var git = layer.get("git");
		var tlayer = git.tempLayer;
		if (tlayer instanceof ol.layer.Vector) {
			finalSource = tlayer.getSource();
		} else {
			return;
		}
	} else if (layer instanceof ol.layer.Vector) {
		finalSource = layer.getSource();
	} else {
		return;
	}

	try {
		dissolved = turf.dissolve(features);
	} catch (e) {
		// TODO: handle exception
		console.error(e);
		var bbox = turf.bbox(features);
		var bboxPolygon = turf.bboxPolygon(bbox);
		var geom = new ol.geom.Polygon(bboxPolygon.geometry.coordinates, "XY");
		var feature = new ol.Feature(geom);
		feature.setId(threeObj.getFeature().getId());
		threeObj["feature"] = feature;
		finalSource.addFeature(feature);
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
						feature.setId(threeObj.getFeature().getId());
						threeObj["feature"] = feature;
						fea.push(feature);
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon([ dissolved.features[i].geometry.coordinates ], "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getFeature().getId());
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
						feature.setId(threeObj.getFeature().getId());
						fea.push(feature);
						threeObj["feature"] = feature;
						// }
					} else if (layer.get("git").geometry === "MultiPolygon") {
						var geom = new ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates, "XY");
						var feature = new ol.Feature(geom);
						feature.setId(threeObj.getFeature().getId());
						threeObj["feature"] = feature;
						fea.push(feature);
					}
				}

			}
			finalSource.addFeatures(fea);
		}
	}

	// var axisy1 = turf.point([ 90, 0 ]);
	// var pickPoint = turf.point(center);
	// var bearing = turf.bearing(pickPoint, axisy1);
	// console.log("y축 1과 객체 중점의 각도는: " + bearing);
	// // var zaxis = new THREE.Vector3(0, 0, 1);
	// // gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, zaxis,
	// // Cesium.Math.toRadians(bearing));
	// that.object.rotateZ(Cesium.Math.toRadians(bearing));
};

/**
 * 3D 객체의 평면도를 뽑아서 Dissolve 한 후 피처에 적용한다.
 * 
 * @method gb3d.io.ImporterThree#injectFloorPlan
 * @param {ol.Feature} feature - 평면도를 입력할 피처
 * @param {THREE.Object3D} threeObj - 평면도를 만들 객체
 */
gb3d.io.ImporterThree.injectFloorPlan = function(feature, threeObj) {
	// var center = threeObj.getCenter();
	var center;
	var geometry = feature.getGeometry();
	if (geometry instanceof ol.geom.Point) {
		center = geometry.getCoordinates();
	} else {
		var extent = geometry.getExtent();
		var x = (extent[0] + extent[2]) / 2;
		var y = (extent[1] + extent[3]) / 2;
		center = [ x, y ];
	}
	var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
	var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

	var floor = gb3d.io.ImporterThree.getFloorPlan(threeObj, center, []);
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
		if (feature instanceof ol.Feature) {
			feature.setGeometry(geom);
		}
		return;
	}
	var fea;
	var featureType;
	if (feature.getGeometry() instanceof ol.geom.Polygon) {
		featureType = "Polygon";
	} else if (feature.getGeometry() instanceof ol.geom.MultiPolygon) {
		featureType = "MultiPolygon";
	}
	if (dissolved) {
		if (dissolved.type === "FeatureCollection") {
			fea = [];
			for (var i = 0; i < dissolved.features.length; i++) {
				var geom;
				if (dissolved.features[i].geometry.type === 'Polygon') {
					if (featureType === "Polygon") {
						geom = new ol.geom.Polygon(dissolved.features[i].geometry.coordinates, "XY");
					} else if (featureType === "MultiPolygon") {
						geom = new ol.geom.MultiPolygon([ dissolved.features[i].geometry.coordinates ], "XY");
					}
				} else if (dissolved.features[i].geometry.type === 'MultiPolygon') {
					if (featureType === "Polygon") {
						var outer = dissolved.features[i].geometry.coordinates;
						// for (var j = 0; j < 1; j++) {
						var polygon = outer[0];
						geom = new ol.geom.Polygon(polygon, "XY");
						// }
					} else if (featureType === "MultiPolygon") {
						geom = new ol.geom.MultiPolygon(dissolved.features[i].geometry.coordinates, "XY");
					}
				}
				if (feature instanceof ol.Feature) {
					// feature.getGeometry().setCoordinates(geom.getCoordinates());
					feature.setGeometry(geom);
				}
			}
		}
	}

	// var axisy1 = turf.point([ 90, 0 ]);
	// var pickPoint = turf.point(center);
	// var bearing = turf.bearing(pickPoint, axisy1);
	// console.log("y축 1과 객체 중점의 각도는: " + bearing);
	// // var zaxis = new THREE.Vector3(0, 0, 1);
	// // gb3d.io.ImporterThree.applyAxisAngleToAllMesh(that.object, zaxis,
	// // Cesium.Math.toRadians(bearing));
	// that.object.rotateZ(Cesium.Math.toRadians(bearing));
};

/**
 * 편집하기 위한 gltf 객체를 불러온다
 * 
 * @method gb3d.io.ImporterThree#loadGLTFToEdit
 * @param {string} url - GLTF 파일의 위치
 * @param {Object} opt - 객체 생성 옵션
 * @param {gb3d.edit.ModelRecord} mrecord - 3차원 편집이력 객체
 */
gb3d.io.ImporterThree.prototype.loadGLTFToEdit = function(url, opt, mrecord) {
	var that = this;
	// Instantiate a loader
	var loader = new THREE.GLTFLoader();

	// Optional: Provide a DRACOLoader instance to decode compressed mesh data
	var dracoLoader = new THREE.DRACOLoader();
	dracoLoader.setDecoderPath(that.decoder);
	loader.setDRACOLoader(dracoLoader);

	// Load a glTF resource
	loader.load(
	// resource URL
	url,
	// called when the resource is loaded
	function(gltf) {
		// 피처 id로 threeObject를 조회
		var three = that.getGb3dMap().getThreeObjectById(opt["featureId"], opt["layer"]);

		var scene = gltf.scene;
		var children = scene.children;
		var inputData;
		if (children.length === 1) {
			var material = children[0].material;
			if (material) {
				var texture = material.map;
				if (texture) {
					if (!texture.flipY) {
						texture.flipY = true;
					}
				}
			}
			inputData = children[0];
		} else if (children.length > 1) {
			inputData = new THREE.Group();
			for (var i = 0; i < children.length; i++) {
				inputData.add(children[i]);
			}
		}
		// 피처 아이디 입력
		inputData.userData.featureId = opt["featureId"];
		// 지오메트리 타입 입력
		var typeselect = opt["layer"].get("git").geometry;
		// if (typeselect === "MultiPolygon") {
		// typeselect = "Polygon";
		// }
		inputData.userData.type = typeselect;

		var center = opt["featureCenter"];
		var centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1], 0);
		var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

		var position = inputData.position;
		position.copy(new THREE.Vector3(centerCart.x, centerCart.y, centerCart.z));
		inputData.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));

		// === 이준 시작 ===
		var axisy1 = turf.point([ 90, 0 ]);
		var pickPoint = turf.point(center);
		var bearing = turf.bearing(pickPoint, axisy1);
		console.log("y축 1과 객체 중점의 각도는: " + bearing);
		inputData.rotateZ(Cesium.Math.toRadians(bearing));
		// === 이준 끝 ===

		// 요청 성공시 선택 개체(b3dm) 숨김
		opt["feature3D"].show = false;

		// 있으면 gltf를 three 모델에 추가
		// 없으면 새로 만듬
		var obj3d;
		if (three) {
			console.log(three);
			obj3d = three;
			obj3d.setObject(inputData);
			// Map에 ThreeJS 객체 추가
			that.getGb3dMap().getThreeScene().add(inputData);
		} else {
			console.log("no three");
			obj3d = new gb3d.object.ThreeObject({
				"object" : inputData,
				"center" : opt["featureCenter"],
				"extent" : opt["featureExtent"],
				"type" : opt["layer"].get("git").geometry,
				"feature" : opt["feature"],
				"feature3D" : opt["feature3D"],
				"layer" : opt["layer"],
				"editable" : false,
				"file" : true
			});

			// Map에 ThreeJS 객체 추가
			that.getGb3dMap().getThreeScene().add(inputData);
			// threeobject 추가
			that.getGb3dMap().addThreeObject(obj3d);
		}
		if (opt.threeTree) {
			opt.threeTree.getJSTree().create_node(opt.layer.get("treeid"), {
				"parent" : opt.layer.get("treeid"),
				"id" : inputData.uuid,
				"text" : opt.featureId,
				"type" : "Three"
			}, "last", false, false);
			// gltf 선택 상태로 만듬
			opt.threeTree.getJSTree().deselect_all();
			opt.threeTree.getJSTree().select_node(inputData.uuid);
		}
		if (mrecord) {
			mrecord.createLoaded(opt["layer"], obj3d);
		}
		// 스피너 해제
		that.getGb3dMap().showSpinner(false);
	},
	// called while loading is progressing
	function(xhr) {

		console.log((xhr.loaded / xhr.total * 100) + '% loaded');

	},
	// called when loading has errors
	function(error) {
		// 스피너 해제
		that.getGb3dMap().showSpinner(false);
		console.log('An error happened');

	});
}

/**
 * 편집하기 위한 gltf 객체를 불러온다
 * 
 * @method gb3d.io.ImporterThree#getGb3dMap
 * @return {gb3d.Map} gb3d map
 */
gb3d.io.ImporterThree.prototype.getGb3dMap = function() {
	return this.gb3dMap;
}

/**
 * 2D 편집이력 객체를 반환한다.
 * 
 * @method gb3d.io.ImporterThree#getFeatureRecord
 * @return {gb.edit.FeatureRecord} 피처 편집이력 객체
 */
gb3d.io.ImporterThree.prototype.getFeatureRecord = function() {
	return this.frecord;
}

/**
 * 2D 편집이력 객체를 설정한다.
 * 
 * @method gb3d.io.ImporterThree#setFeatureRecord
 * @return {gb.edit.FeatureRecord} 피처 편집이력 객체
 */
gb3d.io.ImporterThree.prototype.setFeatureRecord = function(frecord) {
	return this.frecord = frecord;
}