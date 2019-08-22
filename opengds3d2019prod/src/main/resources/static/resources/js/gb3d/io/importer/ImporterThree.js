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
			"ko" : "3D 파일을 업로드 해주세요. ex) *.obj..",
			"en" : "Please upload a file of 3D format. ex) *.obj.."
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
	
	obj.width = 368;
	obj.autoOpen = false;
	obj.title = this.translation.titlemsg[this.locale];
	// obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	// 3D file object
	this.object = undefined;
	
	var body = this.getModalBody();
	var notice = $("<div>").text(this.translation.notice[this.locale]);
	this.inputFile = $("<input>").attr({
		"type" : "file"
	});
	this.complete = $("<div>");
	$(body).append(notice).append(this.inputFile).append(this.complete);

	var footer = this.getModalFooter();
	var cancelBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]).click(function() {
		that.close();
	});
	var uploadBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(this.translation["import"][this.locale]).click(function() {
		// that.upload();
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

//		var size = '(' + Math.floor(event.total / 1000).format() + ' KB)';
//		var progress = Math.floor((event.loaded / event.total) * 100) + '%';

//		console.log('Loading', filename, size, progress);
		console.log(event);

	});

	switch (extension) {

	case 'obj':

		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			var object = new THREE.OBJLoader().parse(contents);
			object.name = filename;

//			editor.execute(new AddObjectCommand(editor, object));
			that.object = object;
			that.activeDraw();
			that.close();
		}, false);
		reader.readAsText(file);

		break;

	case 'glb':

		reader.addEventListener('load', function(event) {

			var contents = event.target.result;

			THREE.DRACOLoader.setDecoderPath(that.decoder);

			var loader = new THREE.GLTFLoader();
			loader.setDRACOLoader(new THREE.DRACOLoader());
			loader.parse(contents, '', function(result) {

				var scene = result.scene;
				scene.name = filename;

//				editor.addAnimation(scene, result.animations);
//				editor.execute(new AddObjectCommand(editor, scene));

			});

		}, false);
		reader.readAsArrayBuffer(file);

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
		source: source,
		type: "Point"
	});
	
	that.gb2dMap.getUpperMap().addInteraction(draw);

	draw.on("drawend", function(evt) {
		var feature = evt.feature;
		var geometry = feature.getGeometry();
		var coordinates = geometry.getCoordinates();
		var mesh = that.object.children[0];
		var obj3d = new gb3d.object.ThreeObject({
			"object" : mesh,
			"center" : coordinates,
			"extent" : geometry.getExtent(),
			"type" : that.layer.get("git").geometry,
			"feature" : feature
		});
		var centerHigh = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1],1);
		var position = mesh.position;
		var cart = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
		position.copy(new THREE.Vector3(cart.x, cart.y, cart.z));
//		mesh.lookAt(new THREE.Vector3(1,0,0));
		mesh.lookAt(new THREE.Vector3(centerHigh.x, centerHigh.y, centerHigh.z));
		// 원점을 바라보는 상태에서 버텍스, 쿼터니언을 뽑는다
//		var quaternion = mesh.quaternion.clone();
//		// 쿼터니언각을 뒤집는다
//		quaternion.inverse();
//		// 모든 지오메트리 버텍스에
//		var points = [];
//		var normalPoints = [];
//		var vertices = mesh.geometry.attributes.position.array;
//		for (var i = 0; i < vertices.length; i = i + 3) {
//			var vertex = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]);
//			var vertexNormal = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]).normalize();
//			// 뒤집은 쿼터니언각을 적용한다
//			vertex.applyQuaternion(quaternion);
//			vertexNormal.applyQuaternion(quaternion);
//			points.push(vertex.x);
//			points.push(vertex.y);
//			points.push(vertex.z);
//			normalPoints.push(vertexNormal.x);
//			normalPoints.push(vertexNormal.y);
//			normalPoints.push(vertexNormal.z);
//		}
//		
//		var newVertices = new Float32Array(points);
//		var newNormalVertices = new Float32Array(normalPoints);
//		mesh.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( newVertices, 3 ) );
//		mesh.geometry.addAttribute( 'normal', new THREE.BufferAttribute( newNormalVertices, 3 ) );
		
		that.gb3dMap.getThreeScene().add(mesh);
		that.gb3dMap.addThreeObject(obj3d);
		that.gb2dMap.getUpperMap().removeInteraction(draw);
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