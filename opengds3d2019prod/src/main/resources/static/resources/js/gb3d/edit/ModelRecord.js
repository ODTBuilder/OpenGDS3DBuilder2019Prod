/**
 * @classdesc 3D model 편집 이력을 관리하는 객체이다.
 * 
 * @class gb3d.edit.ModelRecord
 * @memberof gb3d.edit
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {string}
 *            [obj.locale="en"] - 언어 코드
 * @version 0.01
 * @author SOYIJUN
 * @date 2019. 08. 14
 */
gb3d.edit.ModelRecord = function(obj) {
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

	this.locale = obj.locale || "en";
	this.id = obj.id ? obj.id : false;
	this.saveUrl = obj.url ? obj.url : undefined;

	// 편집이력 임시 저장 변수 - 2D만 성공하고 3D 저장에 실패했을때 이 변수에 저장해서 재시도
	this.history = undefined;
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
 * @param {String}
 *            layer - 편집이력을 확인할 layer id
 * @return {Boolean} 해당 레이어의 편집이력 존재 여부
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
 * 해당 Model가 삭제되었는지 임시보관 목록에서 조회한다.
 * 
 * @method gb3d.edit.ModelRecord#isRemoved
 * @function
 * @param {String}
 *            layer - 편집이력(삭제)에서 확인할 layer id
 * @param {gb3d.object.ThreeObject}
 *            model - 편집이력(삭제)에서 확인할 Model 객체
 * @return {Boolean} 해당 Model의 편집이력(삭제) 존재 여부
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
 * @param {String}
 *            layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject}
 *            model - 편집이력에 임시저장할 model 객체
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
 * @param {String}
 *            layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject}
 *            model - 편집이력에 임시저장할 model 객체
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
 * layer ID를 통해 해당 레이어의 편집이력을 모두 삭제한다.
 * 
 * @method gb3d.edit.ModelRecord#removeByLayer
 * @function
 * @param {String}
 *            layerId - 삭제할 Layer의 ID
 */
gb3d.edit.ModelRecord.prototype.removeByLayer = function(layerId) {
	if (this.removed.hasOwnProperty(layerId)) {
		delete this.removed[layerId];
	}
	if (this.created.hasOwnProperty(layerId)) {
		delete this.created[layerId];
	}
	if (this.modified.hasOwnProperty(layerId)) {
		delete this.modified[layerId];
	}
}
/**
 * 변경한 model를 편집이력에 임시저장한다.
 * 
 * @method gb3d.edit.ModelRecord#update
 * @function
 * @param {String}
 *            layer - 편집이력에 임시저장할 layer id
 * @param {gb3d.object.ThreeObject}
 *            model - 편집이력에 임시저장할 model 객체
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
 * @param {String}
 *            layerId - Layer ID
 * @return {gb3d.object.ThreeObject} 생성 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject
 *         객체
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
 * @param {String}
 *            layerId - Layer ID
 * @param {String}
 *            modelId - Model ID
 * @return {gb3d.object.ThreeObject} 편집 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject
 *         객체
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
 * @param {String}
 *            layerId - Layer ID
 * @param {String}
 *            modelId - Model ID
 * @return {gb3d.object.ThreeObject} 삭제 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject
 *         객체
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
 * @param {gb.edit.EditingTool}
 *            editTool - gb.edit.EditingTool 객체
 */
gb3d.edit.ModelRecord.prototype.save = function(self) {
	var that = this;
	var url = self.getSaveURL();
	self.history = self.getStructureToOBJ();
	console.log(self.history);
	// $.ajax({
	// type: "POST",
	// url: url,
	// data: JSON.stringify(self.history),
	// contentType: 'application/json; charset=utf-8',
	// success: function(data) {
	// console.log(data);
	// self.history = undefined;
	// },
	// error: function(e) {
	// var errorMsg = e? (e.status + ' ' + e.statusText) : "";
	// console.log(errorMsg);
	// self.retryModal(self);
	// }
	// });
}
/**
 * 모든 변경사항 목록이 비어있다면 로딩창과 gb.edit.EditingTool 창을 닫는다.
 * 
 * @method gb3d.edit.ModelRecord#closeEditTool
 * @function
 * @param {gb.edit.EditingTool}
 *            editTool - gb.edit.EditingTool 객체
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
	var exporter = new THREE.GLTFExporter();
	var obj = {};
	var cLayers = Object.keys(this.created);
	for (var i = 0; i < cLayers.length; i++) {
		if (Object.keys(this.created[cLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[cLayers[i]] = {};
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

			var object = threeObject.getObject().clone();
			var center = threeObject.getCenter();
			var centerHigh = Cesium.Cartesian3.fromDegrees(center[0], center[1], 1);

			gb3d.Math.resetMatrixWorld(object, threeObject.getObject().rotation, centerHigh);

			exporter.parse(object, function(result) {
				obj[layer]["created"][feature] = result;
			});
		}
	}

	var mLayers = Object.keys(this.modified);
	for (var i = 0; i < mLayers.length; i++) {
		if (Object.keys(this.modified[mLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[mLayers[i]] = {};
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

			exporter.parse(object, function(result) {
				obj[layer]["modified"][feature] = result;
			});
		}
	}

	var rLayers = Object.keys(this.removed);
	for (var i = 0; i < rLayers.length; i++) {
		if (Object.keys(this.removed[rLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[rLayers[i]] = {};
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
gb3d.edit.ModelRecord.prototype.getStructureToOBJ = function() {
	var exporter = new THREE.OBJExporter();
	var obj = {};
	var cLayers = Object.keys(this.created);
	for (var i = 0; i < cLayers.length; i++) {
		if (Object.keys(this.created[cLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[cLayers[i]] = {};
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
				"modelCenter" : threeObject.getCenter()
			};
			var resetObj = this.resetRotationAndPosition(object);
			var result = exporter.parse(resetObj);
			obj[layer]["created"][feature]["obj"] = result;
		}
	}

	var mLayers = Object.keys(this.modified);
	for (var i = 0; i < mLayers.length; i++) {
		if (Object.keys(this.modified[mLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[mLayers[i]] = {};
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

			var result = exporter.parse(object);
			obj[layer]["modified"][feature] = result;
		}
	}

	var rLayers = Object.keys(this.removed);
	for (var i = 0; i < rLayers.length; i++) {
		if (Object.keys(this.removed[rLayers[i]]).length < 1) {
			continue;
		}
		// 레이어별 키를 만듬
		obj[rLayers[i]] = {};
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
 * 3D 저장 URL을 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#getSaveURL
 * @return {String} 3D 편집이력을 보낼 URL
 */
gb3d.edit.ModelRecord.prototype.getSaveURL = function() {
	return this.saveUrl;
}

/**
 * 에러 메세지를 표시한다
 * 
 * @method gb3d.edit.ModelRecord#errorModal
 * @param {string}
 *            code - 오류 코드
 */
gb3d.edit.ModelRecord.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @method gb3d.edit.ModelRecord#messageModal
 * @param {string}
 *            title - 모달의 타이틀
 * @param {string}
 *            msg - 보여줄 메세지
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
 * @param {string}
 *            func - 수행함수
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
 * @param {THREE.Object3D}
 *            object - 원점으로 되돌릴 3D 객체
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