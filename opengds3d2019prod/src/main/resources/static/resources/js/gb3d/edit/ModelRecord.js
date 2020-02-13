/**
 * @classdesc 3D model 편집 이력을 관리하는 객체이다.
 * @class gb3d.edit.ModelRecord
 * @memberof gb3d.edit
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {string} [obj.locale="en"] - 언어 코드
 * @version 0.01
 * @author SOYIJUN
 * @date 2019. 08. 14
 */
gb3d.edit.ModelRecord = function(obj) {
	/**
	 * 다중언어 객체
	 * 
	 * @type {Object}
	 */
	this.translation = {
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"save" : {
			"ko" : "저장",
			"en" : "Save"
		},
		"discard" : {
			"ko" : "무시",
			"en" : "Discard"
		},
		"saveHint" : {
			"ko" : "변경사항을 저장하시겠습니까?",
			"en" : "Do you want to save your changes?"
		},
		"retrymsg" : {
			"ko" : "3차원 객체의 저장에 실패했습니다. 다시 시도 하시겠습니까?",
			"en" : "Saving 3D object failed. Do you want to try again?"
		},
		"err" : {
			"ko" : "오류",
			"en" : "Error"
		},
	};

	/**
	 * 새로 생성된 객체들을 담은 변수
	 * 
	 * @private
	 * @type {Object.<string, gb3d.object.ThreeObject>}
	 */
	this.created = {};

	/**
	 * 편집된 객체들을 담은 변수
	 * 
	 * @private
	 * @type {Object.<string, gb3d.object.ThreeObject>}
	 */
	this.modified = {};

	/**
	 * 삭제된 객체들을 담은 변수
	 * 
	 * @private
	 * @type {Object.<string, gb3d.object.ThreeObject>}
	 */
	this.removed = {};

	/**
	 * 3d tileset 피처에서 GLTF로 로드된 객체들을 담은 변수
	 * 
	 * @private
	 * @type {Object.<string, gb3d.object.ThreeObject>}
	 */
	this.loaded = {};

	/**
	 * 표시될 언어 값을 저장한 변수
	 * 
	 * @type {String}
	 */
	this.locale = obj.locale || "en";
	/**
	 * 피처 ID로 사용할 속성명
	 * 
	 * @type {String}
	 */
	this.id = obj.id ? obj.id : false;
	/**
	 * 저장을 요청할 URL
	 * 
	 * @type {String}
	 */
	this.saveURL = obj.saveURL ? obj.saveURL : undefined;

	/**
	 * 편집이력 임시 저장 변수 - 2D만 성공하고 3D 저장에 실패했을때 이 변수에 저장해서 재시도
	 * 
	 * @type {Object}
	 */
	this.history = undefined;

	/**
	 * 텍스처 로딩중 사용할 임시 변수
	 * 
	 * @type {Object}
	 */
	this.tempTexture = undefined;

	/**
	 * 텍스처가 모두 base64로 로드 되었는지 확인하기 위한 변수
	 * 
	 * @type {Object}
	 */
	this.textureLoaded = {
		"total" : 0,
		"loaded" : 0
	};
	/**
	 * gb3d.Map 객체
	 * 
	 * @type {gb3d.Map}
	 */
	this.gb3dMap = obj.gb3dMap ? obj.gb3dMap : undefined;

	/**
	 * TilesetManager 객체
	 * 
	 * @type {gb3d.edit.TilesetManager}
	 */
	this.tilesetManager = obj.tilesetManager ? obj.tilesetManager : undefined;

	/**
	 * 총 피처 개수 객체
	 * 
	 * @type {Object}
	 */
	this.totalFeatures = undefined;

	/**
	 * 삭제 피처 로딩 여부 객체
	 * 
	 * @type {boolean}
	 */
	this.removeCheck = false;
};

/**
 * 임시보관 중인 새로운 Model들을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getCreated
 * @function
 * @return {Object.<string, gb3d.object.ThreeObject>}
 */
gb3d.edit.ModelRecord.prototype.getCreated = function() {
	return this.created;
};
/**
 * 임시보관 중인 변경한 Model들을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getModified
 * @function
 * @return {Object.<string, gb3d.object.ThreeObject>}
 */
gb3d.edit.ModelRecord.prototype.getModified = function() {
	return this.modified;
};
/**
 * 임시보관 중인 삭제한 Model들을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getRemoved
 * @function
 * @return {Object.<string, gb3d.object.ThreeObject>}
 */
gb3d.edit.ModelRecord.prototype.getRemoved = function() {
	return this.removed;
};
/**
 * 임시보관 중인 gtlf 로드된 Model들을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getLoaded
 * @function
 * @return {Object.<string, gb3d.object.ThreeObject>}
 */
gb3d.edit.ModelRecord.prototype.getLoaded = function() {
	return this.loaded;
};
/**
 * 임시보관 중인 Model의 목록을 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#clearAll
 * @function
 */
gb3d.edit.ModelRecord.prototype.clearAll = function() {
	this.created = {};
	this.modified = {};
	this.removed = {};
};
/**
 * 임시보관 중인 새로운 Model의 목록을 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#clearCreated
 * @function
 */
gb3d.edit.ModelRecord.prototype.clearCreated = function() {
	this.created = {};
};
/**
 * 임시보관 중인 변경한 Model의 목록을 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#clearModified
 * @function
 */
gb3d.edit.ModelRecord.prototype.clearModified = function() {
	this.modified = {};
};
/**
 * 임시보관 중인 삭제한 Model의 목록을 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#clearRemoved
 * @function
 */
gb3d.edit.ModelRecord.prototype.clearRemoved = function() {
	this.removed = {};
};
/**
 * 레이어에 편집이력이 있는지 확인한다.
 * 
 * @method gb3d.edit.ModelRecord#isEditing
 * @function
 * @param {String} layer - 편집이력을 확인할 layer id
 * @return {boolean} 해당 레이어의 편집이력 존재 여부
 */
gb3d.edit.ModelRecord.prototype.isEditing = function(layer) {
	var result = false;
	var c = this.getCreated();
	var ckeys = Object.keys(c);
	for (var i = 0; i < ckeys.length; i++) {
		if (!layer) {
			result = true;
			return result;
		} else {
			if (layer === ckeys[i]) {
				result = true;
				return result;
			}
		}
	}
	var m = this.getModified();
	var mkeys = Object.keys(m);
	for (var i = 0; i < mkeys.length; i++) {
		if (!layer) {
			result = true;
			return result;
		} else {
			if (layer === mkeys[i]) {
				result = true;
				return result;
			}
		}
	}
	var r = this.getRemoved();
	var rkeys = Object.keys(r);
	for (var i = 0; i < rkeys.length; i++) {
		if (!layer) {
			result = true;
			return result;
		} else {
			if (layer === rkeys[i]) {
				result = true;
				return result;
			}
		}
	}
	return result;
};
/**
 * 해당 Model이 삭제되었는지 임시보관 목록에서 조회한다.
 * 
 * @method gb3d.edit.ModelRecord#isRemoved
 * @function
 * @param {String} layer - 편집이력(삭제)에서 확인할 layer id
 * @param {gb3d.object.ThreeObject} model - 편집이력(삭제)에서 확인할 Model 객체
 * @return {boolean} 해당 Model의 편집이력(삭제) 존재 여부
 */
gb3d.edit.ModelRecord.prototype.isRemoved = function(layer, model) {
	var isRemoved = false;
	var lid;
	if (typeof model.getLayer() === "string") {
		lid = layer;
	}
	// else if (model.getLayer() instanceof ol.layer.Base) {
	// lid = model.getLayer().get("id");
	// }
	if (this.removed.hasOwnProperty(lid)) {
		if (this.removed[lid].hasOwnProperty(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
			isRemoved = true;
		}
	}
	return isRemoved;
};
/**
 * 새로 그린 model를 편집이력에 임시저장한다.
 * 
 * @method gb3d.edit.ModelRecord#create
 * @function
 * @param {String} layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject} model - 편집이력에 임시저장할 model 객체
 */
gb3d.edit.ModelRecord.prototype.create = function(layer, model) {
	var id = layer;

	if (!id) {
		return;
	}
	if (id instanceof ol.layer.Base) {
		id = id.get("id") ? id.get("id") : id.get("name");
	}
	if (!id) {
		console.error("no layer id.");
		return;
	}
	// if (!id.split(":")[1] || !id.split(":")[3]) {
	// return;
	// }

	if (!this.created[id]) {
		this.created[id] = {};
		// this.requestLayerInfo(id.split(":")[0], id.split(":")[1],
		// id.split(":")[3], this.created[id]);
	}
	this.created[id][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
	console.log("model created");
}
/**
 * 삭제한 model를 편집이력에 임시저장한다.
 * 
 * @method gb3d.edit.ModelRecord#remove
 * @function
 * @param {String} layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject} model - 편집이력에 임시저장할 model 객체
 */
gb3d.edit.ModelRecord.prototype.remove = function(layer, model) {
	var id = layer;

	if (!id) {
		return;
	}
	if (id instanceof ol.layer.Base) {
		id = id.get("id") ? id.get("id") : id.get("name");
	}
	if (!id) {
		console.error("no layer id.");
		return;
	}

	// if (!id.split(":")[1] || !id.split(":")[3]) {
	// return;
	// }

	if (!this.removed[id]) {
		this.removed[id] = {};
		// this.requestLayerInfo(id.split(":")[0], id.split(":")[1],
		// id.split(":")[3], this.removed[id]);
	}
	if ((this.id ? model.getFeature().get(this.id) : model.getFeature().getId()).search(".new") !== -1) {
		var keys = Object.keys(this.created[id]);
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] === (this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
				delete this.created[id][keys[i]];
				break;
			}
		}
	} else {
		this.removed[id][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
		if (this.modified.hasOwnProperty(id)) {
			if (this.modified[id].hasOwnProperty(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
				delete this.modified[id][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()];
			}
		}
	}
	console.log("model removed");
}

/**
 * 새로 그린 model를 편집이력에 임시저장한다.
 * 
 * @method gb3d.edit.ModelRecord#createLoaded
 * @function
 * @param {String} layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject} model - 편집이력에 임시저장할 model 객체
 */
gb3d.edit.ModelRecord.prototype.createLoaded = function(layer, model) {
	var id = layer;

	if (!id) {
		return;
	}
	if (id instanceof ol.layer.Base) {
		id = id.get("id") ? id.get("id") : id.get("name");
	}
	if (!id) {
		console.error("no layer id.");
		return;
	}
	// if (!id.split(":")[1] || !id.split(":")[3]) {
	// return;
	// }

	if (!this.loaded[id]) {
		this.loaded[id] = {};
		// this.requestLayerInfo(id.split(":")[0], id.split(":")[1],
		// id.split(":")[3], this.created[id]);
	}
	this.loaded[id][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
	console.log("model created");
}

/**
 * layer ID를 통해 해당 레이어의 편집이력을 모두 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeByLayer
 * @function
 * @param {String} layerId - 삭제할 Layer의 ID
 * @param {boolean} del - threejs 객체도 같이 삭제할지 여부
 */
gb3d.edit.ModelRecord.prototype.removeByLayer = function(layerId, del) {
	if (this.removed.hasOwnProperty(layerId)) {
		if (del) {
			var features = Object.keys(this.removed[layerId]);
			for (var i = 0; i < features.length; i++) {
				var three = this.removed[layerId][features[i]];
				this.getGb3dMap().deleteThreeObject(three);
			}
		}
		delete this.removed[layerId];
	}
	if (this.created.hasOwnProperty(layerId)) {
		if (del) {
			var features = Object.keys(this.created[layerId]);
			for (var i = 0; i < features.length; i++) {
				var three = this.created[layerId][features[i]];
				this.getGb3dMap().deleteThreeObject(three);
			}
		}
		delete this.created[layerId];
	}
	if (this.modified.hasOwnProperty(layerId)) {
		if (del) {
			var features = Object.keys(this.modified[layerId]);
			for (var i = 0; i < features.length; i++) {
				var three = this.modified[layerId][features[i]];
				this.getGb3dMap().deleteThreeObject(three);
			}
		}
		delete this.modified[layerId];
	}
}
/**
 * 변경한 model를 편집이력에 임시저장한다.
 * 
 * @method gb3d.edit.ModelRecord#update
 * @function
 * @param {String} layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject} model - 편집이력에 임시저장할 model 객체
 */
gb3d.edit.ModelRecord.prototype.update = function(layer, model) {
	var id = layer;

	if (!id) {
		return;
	}
	if (id instanceof ol.layer.Base) {
		id = id.get("id") ? id.get("id") : id.get("name");
	}
	if (!id) {
		console.error("no layer id.");
		return;
	}

	// if (!id.split(":")[1] || !id.split(":")[3]) {
	// return;
	// }

	if (!this.modified) {
		this.modified = {};
	}
	if (!(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
		return;
	}
	// ======== loaded에서 이력을 삭제하는 코드 - modified에 이력이 남으니까 loaded는 필요없음
	if (this.loaded[id]) {
		var keys = Object.keys(this.loaded[id]);
		for (var i = 0; i < keys.length; i++) {
			if (keys[i] === (this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
				delete this.loaded[id][keys[i]];
				break;
			}
		}
	}
	// =========
	if (((this.id ? model.getFeature().get(this.id) : model.getFeature().getId())).search(".new") !== -1) {
		this.created[id][(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())] = model;
	} else {
		if (!this.modified[id]) {
			this.modified[id] = {};
			// this.requestLayerInfo(id.split(":")[0], id.split(":")[1],
			// id.split(":")[3], this.modified[id]);
		}
		if (!this.modified[id]) {
			this.modified[id] = {};
		}
		this.modified[id][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
	}
	console.log("model updated");
}

/**
 * 새로 생성된 Model를 생성목록에서 삭제하고 삭제된 Model를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#deleteModelCreated
 * @function
 * @param {String} layerId - Layer ID
 * @return {gb3d.object.ThreeObject} 생성 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject 객체
 */
gb3d.edit.ModelRecord.prototype.deleteModelCreated = function(layerId, modelId) {
	var model = undefined;
	if (!!this.created[layerId]) {
		if (!!this.created[layerId]) {
			if (this.created[layerId][modelId] instanceof gb3d.object.ThreeObject) {
				model = this.created[layerId][modelId];
				delete this.created[layerId][modelId];
			}
		}
	}
	return model;
};

/**
 * 편집된 Model를 편집목록에서 삭제하고 삭제된 Model를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#deleteModelModified
 * @function
 * @param {String} layerId - Layer ID
 * @param {String} modelId - Model ID
 * @return {gb3d.object.ThreeObject} 편집 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject 객체
 */
gb3d.edit.ModelRecord.prototype.deleteModelModified = function(layerId, modelId) {
	var model = undefined;
	if (!!this.modified[layerId]) {
		if (this.modified[layerId][modelId] instanceof gb3d.object.ThreeObject) {
			model = this.modified[layerId][modelId];
			delete this.modified[layerId][modelId];
		}
	}
	return model;
};

/**
 * 삭제된 Model를 삭제 목록에서 삭제하고 삭제된 Model를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#deleteModelRemoved
 * @function
 * @param {String} layerId - Layer ID
 * @param {String} modelId - Model ID
 * @return {gb3d.object.ThreeObject} 삭제 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject 객체
 */
gb3d.edit.ModelRecord.prototype.deleteModelRemoved = function(layerId, modelId) {
	var model = undefined;
	if (!!this.removed[layerId]) {
		if (this.removed[layerId][modelId] instanceof gb3d.object.ThreeObject) {
			model = this.removed[layerId][modelId];
			delete this.removed[layerId][modelId];
		}
	}
	return model;
};

/**
 * Geoserver Layer에 대한 변경사항을 저장 요청하는 창을 생성한다. 변경사항 무시를 선택하면 변경사항 이전으로 되돌린다.
 * 
 * @method gb3d.edit.ModelRecord#save
 * @function
 * @param {gb.edit.EditingTool} editTool - gb.edit.EditingTool 객체
 */
gb3d.edit.ModelRecord.prototype.save = function(self) {
	var that = this;
	var url = self.getSaveURL();
	// self.history = self.getStructureToOBJ();
	var load = self.getTextureLoaded();
	var total = load.total;
	var loaded = load.loaded;
	if (total !== loaded) {
		console.log("texture not loaded ");
		return;
	}
	console.log(self.history);
	$.ajax({
		type : "POST",
		url : url,
		data : JSON.stringify(self.history),
		contentType : 'application/json; charset=utf-8',
		success : function(data) {
			console.log(data);
			self.history = undefined;
			// 변경된 타일셋 주소로 타일셋 업데이트
			self.replace3DTileset(data);
			// 히스토리상의 threejs 객체 제거
			self.removeMeshAll();
		},
		error : function(e) {
			var errorMsg = e ? (e.status + ' ' + e.statusText) : "";
			console.log(errorMsg);
			self.retryModal(self);
		}
	});
}
/**
 * 모든 변경사항 목록이 비어있다면 로딩창과 gb.edit.EditingTool 창을 닫는다.
 * 
 * @method gb3d.edit.ModelRecord#closeEditTool
 * @function
 * @param {gb.edit.EditingTool} editTool - gb.edit.EditingTool 객체
 */
gb3d.edit.ModelRecord.prototype.closeEditTool = function(editTool) {
	var count = 0;
	var edit = editTool;

	for ( var i in this.created) {
		for ( var j in this.created[i]) {
			if (j !== "geomKey") {
				count++;
			}
		}
	}

	for ( var i in this.modified) {
		for ( var j in this.modified[i]) {
			if (j !== "geomKey") {
				count++;
			}
		}
	}

	for ( var i in this.removed) {
		for ( var j in this.removed[i]) {
			if (j !== "geomKey") {
				count++;
			}
		}
	}

	if (!count) {
		this.created = {};
		this.modified = {};
		this.removed = {};
		$("#shp-upload-loading").remove();
		edit.editToolClose();
	}
}

/**
 * 임시저장중인 편집이력을 JSON 형태로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getStructureToGLTF
 * @function
 * @return {Object} 현재 임시저장중인 편집이력
 */
gb3d.edit.ModelRecord.prototype.getStructureToGLTF = function() {
	// var exporter = new THREE.GLTFExporter();
	// var obj = {};
	// var cLayers = Object.keys(this.created);
	// for (var i = 0; i < cLayers.length; i++) {
	// if (Object.keys(this.created[cLayers[i]]).length < 1) {
	// continue;
	// }
	// // 레이어별 키를 만듬
	// obj[cLayers[i]] = {};
	// }
	//
	// for (var j = 0; j < cLayers.length; j++) {
	// var layer = cLayers[j];
	// // created 키가 없으면
	// if (!obj[layer].hasOwnProperty("created")) {
	// // 빈 객체로 키를 만듬
	// obj[layer]["created"] = {};
	// }
	// var featureid = Object.keys(this.created[layer]);
	// for (var o = 0; o < featureid.length; o++) {
	// var feature = featureid[o];
	// var threeObject = this.created[layer][feature];
	//
	// var object = threeObject.getObject().clone();
	// var center = threeObject.getCenter();
	// var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
	//
	// gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);
	//
	// exporter.parse(object, function(result) {
	// obj[layer]["created"][feature] = result;
	// });
	// }
	// }
	//
	// var mLayers = Object.keys(this.modified);
	// for (var i = 0; i < mLayers.length; i++) {
	// if (Object.keys(this.modified[mLayers[i]]).length < 1) {
	// continue;
	// }
	// // 레이어별 키를 만듬
	// obj[mLayers[i]] = {};
	// }
	//
	// for (var j = 0; j < mLayers.length; j++) {
	// var layer = mLayers[j];
	// // modified 키가 없으면
	// if (!obj[layer].hasOwnProperty("modified")) {
	// // 빈 객체로 키를 만듬
	// obj[layer]["modified"] = {};
	// }
	// var featureid = Object.keys(this.modified[layer]);
	// for (var o = 0; o < featureid.length; o++) {
	// var feature = featureid[o];
	// var threeObject = this.modified[layer][feature];
	//
	// var object = threeObject.getObject().clone();
	// var center = threeObject.getCenter();
	// var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);
	//
	// gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);
	//
	// exporter.parse(object, function(result) {
	// obj[layer]["modified"][feature] = result;
	// });
	// }
	// }
	//
	// var rLayers = Object.keys(this.removed);
	// for (var i = 0; i < rLayers.length; i++) {
	// if (Object.keys(this.removed[rLayers[i]]).length < 1) {
	// continue;
	// }
	// // 레이어별 키를 만듬
	// obj[rLayers[i]] = {};
	// }
	//
	// for (var j = 0; j < rLayers.length; j++) {
	// var layer = rLayers[j];
	// // removed 키가 없으면
	// if (!obj[layer].hasOwnProperty("removed")) {
	// // 빈 객체로 키를 만듬
	// obj[layer]["removed"] = {};
	// }
	// if (!Array.isArray(obj[layer]["removed"])) {
	// obj[layer]["removed"] = [];
	// }
	// var featureid = Object.keys(this.removed[layer]);
	// for (var o = 0; o < featureid.length; o++) {
	// var feature = featureid[o];
	// obj[layer]["removed"].push(feature);
	// }
	// }
	// return obj;
}

/**
 * 텍스처를 로딩하고 임시 저장한다.
 * 
 * @method gb3d.edit.ModelRecord#readTextureFromObject
 * @function
 */
gb3d.edit.ModelRecord.prototype.readTextureFromObject = function() {
	var that = this;
	var exporter = new THREE.OBJExporter();
	var load = that.getTextureLoaded();
	var obj = that.tempTexture;
	var cLayers = Object.keys(this.created);
	for (var i = 0; i < cLayers.length; i++) {
		if (Object.keys(this.created[cLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		if (!obj[cLayers[i]]) {
			obj[cLayers[i]] = {};
		}
	}

	for (var j = 0; j < cLayers.length; j++) {
		var layer = cLayers[j];
		// created 키가 없으면
		if (!obj[layer].hasOwnProperty("created")) {
			// 빈 객체로 키를 만듬
			obj[layer]["created"] = {};
		}
		var featureid = Object.keys(this.created[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];
			var threeObject = this.created[layer][feature];
			threeObject.updateExtent();
			var object = threeObject.getObject().clone();
			var center = threeObject.getCenter();
			var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

			gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);

			obj[layer]["created"][feature] = {
				"obj" : undefined,
				"texture" : undefined,
				"mbr" : threeObject.getExtent(),
				"tileCenter" : undefined,
				"modelCenter" : threeObject.getCenter(),
				"objPath" : undefined
			};
			// load.total = load.total + 1;
			var resetObj = this.resetRotationAndPosition(object);
			var result = exporter.parse(resetObj);
			obj[layer]["created"][feature]["obj"] = result;
			var feature3d = threeObject.getFeature3D();
			if (feature3d) {
				if (feature3d.content) {
					if (feature3d.content.tile) {
						if (feature3d.content.tile.extras) {
							var extras = feature3d.content.tile.extras;
							obj[layer]["created"][feature]["tileCenter"] = [ extras["centerX"], extras["centerY"] ];
							obj[layer]["created"][feature]["objPath"] = extras["originObjPath"];
						}
					}
				}
			}
			that.getBase64FromObject(resetObj, obj[layer]["created"][feature]);
		}
	}

	var mLayers = Object.keys(this.modified);
	for (var i = 0; i < mLayers.length; i++) {
		if (Object.keys(this.modified[mLayers[i]]).length < 1) {
			continue;
		}
		// 없으면 레이어별 키를 만듬
		if (!obj[mLayers[i]]) {
			obj[mLayers[i]] = {};
		}
	}

	for (var j = 0; j < mLayers.length; j++) {
		var layer = mLayers[j];
		// modified 키가 없으면
		if (!obj[layer].hasOwnProperty("modified")) {
			// 빈 객체로 키를 만듬
			obj[layer]["modified"] = {};
		}
		var featureid = Object.keys(this.modified[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];
			var threeObject = this.modified[layer][feature];

			var object = threeObject.getObject().clone();
			var center = threeObject.getCenter();
			var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

			gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);

			// var result = exporter.parse(object);
			// obj[layer]["modified"][feature] = result;

			obj[layer]["modified"][feature] = {
				"obj" : undefined,
				"texture" : undefined,
				"mbr" : threeObject.getExtent(),
				"tileCenter" : undefined,
				"modelCenter" : threeObject.getCenter()
			};
			// load.total = load.total + 1;
			var resetObj = this.resetRotationAndPosition(object);
			var result = exporter.parse(resetObj);
			obj[layer]["modified"][feature]["obj"] = result;
			var feature3d = threeObject.getFeature3D();
			if (feature3d) {
				if (feature3d.content) {
					if (feature3d.content.tile) {
						if (feature3d.content.tile.extras) {
							var extras = feature3d.content.tile.extras;
							obj[layer]["modified"][feature]["tileCenter"] = [ extras["centerX"], extras["centerY"] ];
							obj[layer]["modified"][feature]["objPath"] = extras["originObjPath"];
						}
					}
				}
			}
			that.getBase64FromObject(resetObj, obj[layer]["modified"][feature]);
		}
	}

	var rLayers = Object.keys(this.removed);
	for (var i = 0; i < rLayers.length; i++) {
		if (Object.keys(this.removed[rLayers[i]]).length < 1) {
			continue;
		}
		// 없으면 레이어별 키를 만듬
		if (!obj[rLayers[i]]) {
			obj[rLayers[i]] = {};
		}
	}

	for (var j = 0; j < rLayers.length; j++) {
		var layer = rLayers[j];
		// removed 키가 없으면
		if (!obj[layer].hasOwnProperty("removed")) {
			// 빈 객체로 키를 만듬
			obj[layer]["removed"] = {};
		}
		if (!Array.isArray(obj[layer]["removed"])) {
			obj[layer]["removed"] = [];
		}
		var featureid = Object.keys(this.removed[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];
			obj[layer]["removed"].push(feature);
		}
	}

	return obj;
}

/**
 * 임시저장중인 편집이력을 JSON 형태로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getStructureToOBJ
 * @function
 * @return {Object} 현재 임시저장중인 편집이력
 */
gb3d.edit.ModelRecord.prototype.getStructureToOBJ = function(callback) {
	var that = this;
	var exporter = new THREE.OBJExporter();
	var load = that.getTextureLoaded();
	var obj = {};

	var totalFeautes = that.getTotalFeatures();
	var totalLayerKeys = Object.keys(totalFeautes);

	if (Object.keys(this.removed) > 0) {
		that.setRemoveCheck(false);
	}

	var rLayers = Object.keys(this.removed);
	// for (var i = 0; i < rLayers.length; i++) {
	// if (Object.keys(this.removed[rLayers[i]]).length < 1) {
	// continue;
	// }
	// // 없으면 레이어별 키를 만듬
	// if (!obj[rLayers[i]]) {
	// obj[rLayers[i]] = {};
	// }
	// // modified 또는 removed일 때 피처 개수를 입력
	// if (obj[rLayers[i]]["totalFeatures"] === undefined || obj[rLayers[i]]["totalFeatures"] ===
	// null) {
	// obj[rLayers[i]]["totalFeatures"] = false;
	// }
	// }

	for (var j = 0; j < rLayers.length; j++) {
		if (Object.keys(this.removed[rLayers[j]]).length < 1) {
			continue;
		}
		// 없으면 레이어별 키를 만듬
		if (!obj[rLayers[j]]) {
			obj[rLayers[j]] = {};
		}
		// modified 또는 removed일 때 피처 개수를 입력
		if (obj[rLayers[j]]["totalFeatures"] === undefined || obj[rLayers[j]]["totalFeatures"] === null) {
			obj[rLayers[j]]["totalFeatures"] = false;
		}

		var layer = rLayers[j];

		if (!obj[layer]["removed"]) {
			obj[layer]["removed"] = {};
		}

		var featureid = Object.keys(this.removed[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];

			if (!obj[layer]["removed"][feature]) {
				obj[layer]["removed"][feature] = {};
			}

			// obj[layer]["removed"].push(feature);

			var threeObject = this.removed[layer][feature];

			// 타일셋 경로 없으면 넣기
			if (!obj[layer]["tileset"]) {
				var tlayer = threeObject.getLayer();
				var tileset;
				if (tlayer.get("git")) {
					var git = tlayer.get("git");
					if (git.tileset) {
						if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
							tileset = git.tileset.getCesiumTileset().url;
						}
					}
				} else {
					var source = layer.getSource();
					if (source.get("git")) {
						var git = source.get("git");
						if (git.tileset) {
							if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
								tileset = git.tileset.getCesiumTileset().url;
							}
						}
					}
				}
				obj[layer]["tileset"] = tileset;
			}

			var feature3d = threeObject.getFeature3D();
			if (feature3d) {
				if (feature3d.content) {
					if (feature3d.content.tile) {
						if (feature3d.content.tile.extras) {
							var extras = feature3d.content.tile.extras;
							obj[layer]["removed"][feature]["tileCenter"] = [ extras["centerX"], extras["centerY"] ];
							obj[layer]["removed"][feature]["objPath"] = extras["originObjPath"];
						}
					}
				}
			}
		}
	}
	that.setRemoveCheck(true);

	// for (var i = 0; i < cLayers.length; i++) {
	// if (Object.keys(this.created[cLayers[i]]).length < 1) {
	// continue;
	// }
	// // 레이어별 키를 만듬
	// if (!obj[cLayers[i]]) {
	// obj[cLayers[i]] = {};
	// }
	// // create일 때 피처 개수를 입력
	// if (totalLayerKeys.indexOf(cLayers[i]) !== -1) {
	// obj[cLayers[i]]["totalFeatures"] = totalFeautes[cLayers[i]];
	// }
	// }

	var cLayers = Object.keys(this.created);

	for (var j = 0; j < cLayers.length; j++) {
		if (Object.keys(this.created[cLayers[j]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		if (!obj[cLayers[j]]) {
			obj[cLayers[j]] = {};
		}
		// create일 때 피처 개수를 입력
		if (totalLayerKeys.indexOf(cLayers[j]) !== -1) {
			obj[cLayers[j]]["totalFeatures"] = totalFeautes[cLayers[j]];
		}

		var layer = cLayers[j];
		// created 키가 없으면
		if (!obj[layer].hasOwnProperty("created")) {
			// 빈 객체로 키를 만듬
			obj[layer]["created"] = {};
		}
		var featureid = Object.keys(this.created[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];
			var threeObject = this.created[layer][feature];
			threeObject.updateExtent();
			var object = threeObject.getObject().clone();
			var center = threeObject.getCenter();
			var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

			gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);

			obj[layer]["created"][feature] = {
				"obj" : undefined,
				"texture" : undefined,
				"mbr" : threeObject.getExtent(),
				"tileCenter" : undefined,
				"modelCenter" : threeObject.getCenter(),
				"objPath" : undefined
			};
			// 타일셋 경로 없으면 넣기
			if (!obj[layer]["tileset"]) {
				var tlayer = threeObject.getLayer();
				var tileset;
				if (tlayer.get("git")) {
					var git = tlayer.get("git");
					if (git.tileset) {
						if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
							tileset = git.tileset.getCesiumTileset().url;
						}
					}
				} else {
					var source = tlayer.getSource();
					if (source.get("git")) {
						var git = source.get("git");
						if (git.tileset) {
							if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
								tileset = git.tileset.getCesiumTileset().url;
							}
						}
					}
				}
				obj[layer]["tileset"] = tileset;
			}
			var resetObj = this.resetRotationAndPosition(object);
			var result = exporter.parse(resetObj);
			obj[layer]["created"][feature]["obj"] = result;
			var feature3d = threeObject.getFeature3D();
			if (feature3d) {
				if (feature3d.content) {
					if (feature3d.content.tile) {
						if (feature3d.content.tile.extras) {
							var extras = feature3d.content.tile.extras;
							obj[layer]["created"][feature]["tileCenter"] = [ extras["centerX"], extras["centerY"] ];
							obj[layer]["created"][feature]["objPath"] = extras["originObjPath"];
						}
					}
				}
			}
			that.getBase64FromObject(resetObj, obj[layer]["created"][feature], callback, obj);
		}
	}

	var mLayers = Object.keys(this.modified);
	// for (var i = 0; i < mLayers.length; i++) {
	// if (Object.keys(this.modified[mLayers[i]]).length < 1) {
	// continue;
	// }
	// // 없으면 레이어별 키를 만듬
	// if (!obj[mLayers[i]]) {
	// obj[mLayers[i]] = {};
	// }
	//
	// // modified 또는 removed일 때 피처 개수를 입력
	// if (obj[mLayers[i]]["totalFeatures"] === undefined || obj[mLayers[i]]["totalFeatures"] ===
	// null) {
	// obj[mLayers[i]]["totalFeatures"] = false;
	// }
	// }

	for (var j = 0; j < mLayers.length; j++) {
		if (Object.keys(this.modified[mLayers[j]]).length < 1) {
			continue;
		}
		// 없으면 레이어별 키를 만듬
		if (!obj[mLayers[j]]) {
			obj[mLayers[j]] = {};
		}

		// modified 또는 removed일 때 피처 개수를 입력
		if (obj[mLayers[j]]["totalFeatures"] === undefined || obj[mLayers[j]]["totalFeatures"] === null) {
			obj[mLayers[j]]["totalFeatures"] = false;
		}

		var layer = mLayers[j];
		// modified 키가 없으면
		if (!obj[layer].hasOwnProperty("modified")) {
			// 빈 객체로 키를 만듬
			obj[layer]["modified"] = {};
		}
		var featureid = Object.keys(this.modified[layer]);
		for (var o = 0; o < featureid.length; o++) {
			var feature = featureid[o];
			var threeObject = this.modified[layer][feature];

			var object = threeObject.getObject().clone();
			var center = threeObject.getCenter();
			var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

			gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);

			// var result = exporter.parse(object);
			// obj[layer]["modified"][feature] = result;

			obj[layer]["modified"][feature] = {
				"obj" : undefined,
				"texture" : undefined,
				"mbr" : threeObject.getExtent(),
				"tileCenter" : undefined,
				"modelCenter" : threeObject.getCenter()
			};
			// 타일셋 경로 없으면 넣기
			if (!obj[layer]["tileset"]) {
				var tlayer = threeObject.getLayer();
				var tileset;
				if (tlayer.get("git")) {
					var git = tlayer.get("git");
					if (git.tileset) {
						if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
							tileset = git.tileset.getCesiumTileset().url;
						}
					}
				} else {
					var source = tlayer.getSource();
					if (source.get("git")) {
						var git = source.get("git");
						if (git.tileset) {
							if (git.tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
								tileset = git.tileset.getCesiumTileset().url;
							}
						}
					}
				}
				obj[layer]["tileset"] = tileset;
			}
			var resetObj = this.resetRotationAndPosition(object);
			var result = exporter.parse(resetObj);
			obj[layer]["modified"][feature]["obj"] = result;
			var feature3d = threeObject.getFeature3D();
			if (feature3d) {
				if (feature3d.content) {
					if (feature3d.content.tile) {
						if (feature3d.content.tile.extras) {
							var extras = feature3d.content.tile.extras;
							obj[layer]["modified"][feature]["tileCenter"] = [ extras["centerX"], extras["centerY"] ];
							obj[layer]["modified"][feature]["objPath"] = extras["originObjPath"];
						}
					}
				}
			}
			that.getBase64FromObject(resetObj, obj[layer]["modified"][feature], callback, obj);
		}
	}
	if (cLayers.length === 0 && mLayers.length === 0 && that.getRemoveCheck()) {
		callback(obj);
		that.save(that);
	}
}

/**
 * 3D 저장 URL을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getSaveURL
 * @return {String} 3D 편집이력을 보낼 URL
 */
gb3d.edit.ModelRecord.prototype.getSaveURL = function() {
	return this.saveURL;
}

/**
 * 에러 메세지를 표시한다
 * 
 * @method gb3d.edit.ModelRecord#errorModal
 * @param {string} code - 오류 코드
 */
gb3d.edit.ModelRecord.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 메시지 창을 생성한다.
 * 
 * @method gb3d.edit.ModelRecord#messageModal
 * @param {string} title - 모달의 타이틀
 * @param {string} msg - 보여줄 메세지
 */
gb3d.edit.ModelRecord.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").append(msg).addClass("gb-geoserver-msgmodal-body");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text("OK");
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 310,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};

/**
 * 재시도 창을 생성한다.
 * 
 * @method gb3d.edit.ModelRecord#retryModal
 * @param {string} func - 수행함수
 */
gb3d.edit.ModelRecord.prototype.retryModal = function(self) {
	var that = this;
	var msg1 = $("<div>").append(self.translation.retrymsg[self.locale]).addClass("gb-geoserver-msgmodal-body");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text("OK");
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text("Cancel");
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : self.translation.err[self.locale],
		"width" : 310,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
		self.save(self);
	});

	$(closeBtn).click(function() {
		modal.close();
	});
};

/**
 * 3D 객체의 위치와 회전을 원점으로 되돌린다.
 * 
 * @method gb3d.edit.ModelRecord#resetRotationAndPosition
 * @param {THREE.Object3D} object - 원점으로 되돌릴 3D 객체
 */
gb3d.edit.ModelRecord.prototype.resetRotationAndPosition = function(object) {
	if (object instanceof THREE.Object3D) {
		var pos = new THREE.Vector3();
		object.position.copy(pos);
		var eu = new THREE.Euler();
		object.setRotationFromEuler(eu);
		object.lookAt(new THREE.Vector3(0, 0, 1));
		object.updateMatrixWorld(true);
	}
	return object;
};

/**
 * 객체의 텍스처 이미지를 base64로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#resetRotationAndPosition
 * @param {THREE.Object3D} object - 이미지를 가져올 객체
 * @return {string} base64코드 형태의 이미지
 */
gb3d.edit.ModelRecord.prototype.getBase64FromObject = function(object, record, callback, history) {
	var that = this;
	var img, result;
	// 객체에서 이미지를 꺼낸다
	if (object instanceof THREE.Mesh) {
		var material = object.material;
		if (Array.isArray(material)) {
			var map = material[0].map;
			if (map) {
				img = map.image;
			}
		} else {
			var map = material.map;
			if (map) {
				img = map.image;
			}
		}
	} else {
		console.log("object is not mesh. ", object);
		return;
	}
	// 이미지를 base64로 변환한다.
	// 소스가 base64인지 url인지
	if (img) {
		// 텍스처가 있는 경우에만 총 카운트 1증가
		var load = that.getTextureLoaded();
		load.total = load.total + 1;

		var src = img.src;
		if (src.substr(0, 5) == 'data:') {
			// base64일 때
			// result = src;
			record["texture"] = src;
			var load = that.getTextureLoaded();
			load.loaded = load.loaded + 1;
			if (load.total === load.loaded && that.getRemoveCheck()) {
				callback(history);
				that.save(that);
			}
		} else if (src.substr(0, 5) == 'blob:') {
			that.toDataURLFromBlobURL(img, record, callback, history);
		} else {
			that.toDataURL(src, record, undefined, callback, history);
		}
	} else {
		var load = that.getTextureLoaded();
		if (load.total === load.loaded && that.getRemoveCheck()) {
			callback(history);
			that.save(that);
		}
	}
	return result;
};

/**
 * 이미지 url을 base64로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#toDataURL
 * @param {string} src - 이미지 URL
 * @param {function} callback - 콜백함수
 * @param {string} outputFormat - 내보낼 포맷
 */
gb3d.edit.ModelRecord.prototype.toDataURL = function(src, record, outputFormat, callback, history) {
	var that = this;
	var img = new Image();
	img.crossOrigin = 'Anonymous';
	img.onload = function() {
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		var dataURL;
		canvas.height = this.naturalHeight;
		canvas.width = this.naturalWidth;
		ctx.drawImage(this, 0, 0);
		dataURL = canvas.toDataURL(outputFormat);
		// callback(dataURL);
		record["texture"] = dataURL;
		var load = that.getTextureLoaded();
		load.loaded = load.loaded + 1;
		if (load.total === load.loaded && that.getRemoveCheck()) {
			callback(history);
			that.save(that);
		}
	};
	img.src = src;
	if (img.complete || img.complete === undefined) {
		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
		img.src = src;
	}
}

/**
 * blob을 base64로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#toDataURLFromBlob
 * @param {string} src - 이미지 URL
 * @param {function} callback - 콜백함수
 */
gb3d.edit.ModelRecord.prototype.toDataURLFromBlob = function(src, record, callback, history) {
	var that = this;
	var reader = new FileReader();
	reader.onloadend = function() {
		var base64data = reader.result;
		console.log(base64data);
		record["texture"] = base64data;
		var load = that.getTextureLoaded();
		load.loaded = load.loaded + 1;
		if (load.total === load.loaded && that.getRemoveCheck()) {
			callback(history);
			that.save(that);
		}
	}
	reader.readAsDataURL(src);
}

/**
 * blob 이미지 url을 base64로 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#toDataURLFromBlobURL
 * @param {string} src - 이미지 URL
 * @param {function} callback - 콜백함수
 */
gb3d.edit.ModelRecord.prototype.toDataURLFromBlobURL = function(img, record, callback, history) {
	var that = this;
	var canvas = document.createElement('CANVAS');
	var ctx = canvas.getContext('2d');
	var dataURL;
	canvas.height = img.height;
	canvas.width = img.width;
	ctx.drawImage(img, 0, 0);
	dataURL = canvas.toDataURL();
	// callback(dataURL);
	record["texture"] = dataURL;
	var load = that.getTextureLoaded();
	load.loaded = load.loaded + 1;
	if (load.total === load.loaded && that.getRemoveCheck()) {
		callback(history);
		that.save(that);
	}
}

/**
 * 텍스처 카운팅 변수를 설정한다.
 * 
 * @method gb3d.edit.ModelRecord#setTextureLoaded
 * @param {object} obj - 텍스처 카운팅 변수
 */
gb3d.edit.ModelRecord.prototype.setTextureLoaded = function(obj) {
	this.textureLoaded = obj;
}

/**
 * 텍스처 카운팅 변수를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getTextureLoaded
 * @return {object} 텍스처 카운팅 변수
 */
gb3d.edit.ModelRecord.prototype.getTextureLoaded = function() {
	return this.textureLoaded;
}

/**
 * 텍스처 카운팅 변수를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#startLoadTextureBase64
 */
gb3d.edit.ModelRecord.prototype.startLoadTextureBase64 = function() {
	var that = this;
	var callback = function(history) {
		that.history = history;
	}
	this.getStructureToOBJ(callback);
}

/**
 * gb3dMap객체를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getGb3dMap
 * @return {gb3d.Map} gb3d.Map 객체
 */
gb3d.edit.ModelRecord.prototype.getGb3dMap = function() {
	return this.gb3dMap;
}

/**
 * gb3dMap객체를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#setGb3dMap
 * @param {gb3d.Map} map - gb3d.Map 객체
 */
gb3d.edit.ModelRecord.prototype.setGb3dMap = function(map) {
	this.gb3dMap = map;
}

/**
 * 2D피처를 통해 3D객체 편집이력을 업데이트 한다.
 * 
 * @method gb3d.edit.ModelRecord#update3DByFeature
 */
gb3d.edit.ModelRecord.prototype.update3DByFeature = function(layer, feature, isCreated) {
	var that = this;
	var map = this.getGb3dMap();
	// 피처 아이디, 레이어 트리 아이디를 받아서 조회
	var three = map.getThreeObjectById(feature.getId(), layer);
	// 모디파이드 객체안에 있으면 넘기고 아니면 넣기
	if (isCreated) {
		this.create(three.getLayer(), three);
	} else {
		this.update(three.getLayer(), three);
	}
}

/**
 * 총 피처 개수를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getTotalFeatures
 * @return {Object} 총 피처 개수
 */
gb3d.edit.ModelRecord.prototype.getTotalFeatures = function() {
	return this.totalFeatures;
}

/**
 * 총 피처 개수를 할당한다.
 * 
 * @method gb3d.edit.ModelRecord#setTotalFeatures
 * @param {Object} 총 피처 개수
 */
gb3d.edit.ModelRecord.prototype.setTotalFeatures = function(features) {
	this.totalFeatures = features;
}

/**
 * 삭제 피처 확인 완료 여부를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getRemoveCheck
 * @return {boolean} 완료 여부
 */
gb3d.edit.ModelRecord.prototype.getRemoveCheck = function() {
	return this.removeCheck;
}

/**
 * 삭제 피처 확인 완료 여부를 설정한다.
 * 
 * @method gb3d.edit.ModelRecord#setRemoveCheck
 * @param {boolean} bool - 완료 여부
 */
gb3d.edit.ModelRecord.prototype.setRemoveCheck = function(bool) {
	this.removeCheck = bool;
}

/**
 * created 목록에 있는 메쉬 객체를 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeMeshCreated
 * @param {boolean} flag - 삭제한 후 cesium 객체를 보여줄지 여부
 */
gb3d.edit.ModelRecord.prototype.removeMeshCreated = function(flag) {
	var that = this;
	var created = that.getCreated();
	var layers = Object.keys(created);
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var features = Object.keys(created[layer]);
		for (var j = 0; j < features.length; j++) {
			var feature = features[j];
			var three = created[layer][feature];
			var mesh = three.getObject();
			if (mesh) {
				if (mesh.geometry) {
					mesh.geometry.dispose();
				}
				if (mesh.material) {
					if (mesh.material.texture) {
						mesh.material.texture.dispose();
					}
					mesh.material.dispose();
				}
				that.getGb3dMap().getThreeScene().remove(mesh);
				that.getGb3dMap().getThreeScene().dispose();
				three.setObject(undefined);
			}
			if (flag) {
				var feature3d = three.getFeature3D();
				if (feature3d instanceof Cesium.Cesium3DTileFeature) {
					if (!feature3d.tileset.isDestroyed()) {
						if (!feature3d.show) {
							feature3d.show = true;
						}	
					}
				}
			}
		}
	}
}

/**
 * modified 목록에 있는 메쉬 객체를 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeMeshModified
 * @param {boolean} flag - 삭제한 후 cesium 객체를 보여줄지 여부
 */
gb3d.edit.ModelRecord.prototype.removeMeshModified = function(flag) {
	var that = this;
	var modified = that.getModified();
	var layers = Object.keys(modified);
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var features = Object.keys(modified[layer]);
		for (var j = 0; j < features.length; j++) {
			var feature = features[j];
			var three = modified[layer][feature];
			var mesh = three.getObject();
			if (mesh) {
				if (mesh.geometry) {
					mesh.geometry.dispose();
				}
				if (mesh.material) {
					if (mesh.material.texture) {
						mesh.material.texture.dispose();
					}
					mesh.material.dispose();
				}
				that.getGb3dMap().getThreeScene().remove(mesh);
				that.getGb3dMap().getThreeScene().dispose();
				three.setObject(undefined);
			}
			if (flag) {
				var feature3d = three.getFeature3D();
				if (feature3d instanceof Cesium.Cesium3DTileFeature) {
					if (!feature3d.tileset.isDestroyed()) {
						if (!feature3d.show) {
							feature3d.show = true;
						}	
					}
				}
			}
		}
	}
}

/**
 * modified 목록에 있는 메쉬 객체를 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeMeshRemoved
 * @param {boolean} flag - 삭제한 후 cesium 객체를 보여줄지 여부
 */
gb3d.edit.ModelRecord.prototype.removeMeshRemoved = function(flag) {
	var that = this;
	var removed = that.getRemoved();
	var layers = Object.keys(removed);
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var features = Object.keys(removed[layer]);
		for (var j = 0; j < features.length; j++) {
			var feature = features[j];
			var three = removed[layer][feature];
			var mesh = three.getObject();
			if (mesh) {
				if (mesh.geometry) {
					mesh.geometry.dispose();
				}
				if (mesh.material) {
					if (mesh.material.texture) {
						mesh.material.texture.dispose();
					}
					mesh.material.dispose();
				}
				that.getGb3dMap().getThreeScene().remove(mesh);
				that.getGb3dMap().getThreeScene().dispose();
				three.setObject(undefined);
			}
			if (flag) {
				var feature3d = three.getFeature3D();
				if (feature3d instanceof Cesium.Cesium3DTileFeature) {
					if (!feature3d.tileset.isDestroyed()) {
						if (!feature3d.show) {
							feature3d.show = true;
						}	
					}
				}
			}
		}
	}
}

/**
 * loaded 목록에 있는 메쉬 객체를 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeMeshLoaded
 * @param {boolean} flag - 삭제한 후 cesium 객체를 보여줄지 여부
 */
gb3d.edit.ModelRecord.prototype.removeMeshLoaded = function(flag) {
	var that = this;
	var loaded = that.getLoaded();
	var layers = Object.keys(loaded);
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var features = Object.keys(loaded[layer]);
		for (var j = 0; j < features.length; j++) {
			var feature = features[j];
			var three = loaded[layer][feature];
			var mesh = three.getObject();
			if (mesh) {
				if (mesh.geometry) {
					mesh.geometry.dispose();
				}
				if (mesh.material) {
					if (mesh.material.texture) {
						mesh.material.texture.dispose();
					}
					mesh.material.dispose();
				}
				that.getGb3dMap().getThreeScene().remove(mesh);
				that.getGb3dMap().getThreeScene().dispose();
				three.setObject(undefined);
			}
			if (flag) {
				var feature3d = three.getFeature3D();
				if (feature3d instanceof Cesium.Cesium3DTileFeature) {
					if (!feature3d.tileset.isDestroyed()) {
						if (!feature3d.show) {
							feature3d.show = true;
						}	
					}
				}
			}
		}
	}
}

/**
 * 목록에 있는 모든 메쉬 객체를 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeMeshAll
 * @param {boolean} flag - cesium 객체를 다시 보여줄지 여부
 */
gb3d.edit.ModelRecord.prototype.removeMeshAll = function(flag) {
	var that = this;
	that.removeMeshCreated(flag);
	that.removeMeshModified(flag);
	that.removeMeshRemoved(flag);
	that.removeMeshLoaded(flag);
}


/**
 * 타일셋 URL을 변경하여 타일을 다시 로드한다.
 * 
 * @method gb3d.edit.ModelRecord#replace3DTileset
 * @param {Object} result - 편집 저장후 서버의 결과 객체
 */
gb3d.edit.ModelRecord.prototype.replace3DTileset = function(result) {
	var that = this;
	var resultLayers = Object.keys(result);

	var map3d = that.getGb3dMap();
	var cesiumViewer = map3d.getCesiumViewer();
	var scene = cesiumViewer.scene;
	var primitives = scene.primitives;
	var map2d = map3d.getGbMap();
	var olMap = map2d.getUpperMap();
	var layers = olMap.getLayers();
	for (var i = 0; i < layers.getLength(); i++) {
		var layer = layers.item(i);
		var id = layer.get("id");
		var newPath;
		var git;
		if (!id) {
			// 아이디가 없는 경우 git, 소스에서 찾아야함
			git = layer.get("git");
			if (git) {
				id = git.id;
				if (!id) {
					id = layer.getSource().get("id");
					if (!id) {
						if (git.tempLayer) {
							id = git.tempLayer.get("id");
						}
					}
				}
			}
		}
		if (!id) {
			continue;
		}
		for (var j = 0; j < resultLayers.length; j++) {
			if (id === resultLayers[j]) {
				newPath = result[resultLayers[j]]["path"];
				break;
			}
		}
		if (!newPath) {
			continue;
		}
		if (!git) {
			git = layer.get("git");
		}
		var tileset = git.tileset;
		if (tileset instanceof gb3d.object.Tileset) {
			var ctileset = tileset.getCesiumTileset();
			if (ctileset instanceof Cesium.Cesium3DTileset) {
				// 현재 타일셋 삭제 후
				if (primitives.contains(ctileset)) {
					primitives.remove(ctileset);
					// ctileset.destroy();
				}
				// ctileset.show = false;
				// if(!ctileset.isDestroyed()){
				// ctileset.destroy();
				// }
				// 레이어가 가진 타일셋 키 삭제 후
				git.tileset = undefined;
				// 새로운 타일셋 추가
				var tm = that.getTilesetManager();
				tm.addTileset(newPath, id);
			}
		}
	}
}

/**
 * 타일셋 매니저 객체를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getTilesetManager
 * @return {gb3d.edit.TilesetManager} 타일셋 매니저 객체
 */
gb3d.edit.ModelRecord.prototype.getTilesetManager = function() {
	var that = this;
	var result;
	if (typeof that.tilesetManager === "function") {
		result = that.tilesetManager();
	} else {
		result = that.tilesetManager;
	}
	return result;
}
