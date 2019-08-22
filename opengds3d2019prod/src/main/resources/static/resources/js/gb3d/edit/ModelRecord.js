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
		}
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
gb3d.edit.ModelRecord.prototype.isRemoved = function(layer, tileId, model) {
	var isRemoved = false;
	var lid;
	if (typeof model.getLayer() === "string") {
		lid = layer;
	}
	// else if (model.getLayer() instanceof ol.layer.Base) {
	// lid = model.getLayer().get("id");
	// }
	if (this.removed.hasOwnProperty(lid)) {
		if (this.removed[lid].hasOwnProperty(tileId)) {
			if (this.removed[lid][tileId].hasOwnProperty(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
				isRemoved = true;
			}
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
 * @param {String}
 *            tileId - 편집이력에 임시저장할 tileset id
 * @param {gb3d.object.ThreeObject}
 *            model - 편집이력에 임시저장할 model 객체
 */
gb3d.edit.ModelRecord.prototype.create = function(layer, tileId, model) {
	var id = layer;

	if (!id) {
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
	if (!this.created[id][tileId]) {
		this.created[id][tileId] = {};
	}
	this.created[id][tileId][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
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
gb3d.edit.ModelRecord.prototype.remove = function(layer, tileId, model) {
	var id = layer;

	if (!id) {
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
		var keys = Object.keys(this.created[id][tileId]);
		for (var i = 0; i < keys.length; i++) {
			if (this.created[id][tileId][keys[i]].getId() === model.getFeature().getId()) {
				delete this.created[id][tileId][keys[i]];
				break;
			}
		}
	} else {
		this.removed[id][tileId][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
		if (this.modified.hasOwnProperty(id)) {
			if (this.modified[id].hasOwnProperty(tileId)) {
				if (this.modified[id][tileId].hasOwnProperty(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())) {
					delete this.modified[id][tileId][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()];
				}
			}
		}
	}
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
gb3d.edit.ModelRecord.prototype.update = function(layer, tileId, model) {
	var id = layer;

	if (!id) {
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
		this.created[id][tileId][(this.id ? model.getFeature().get(this.id) : model.getFeature().getId())] = model;
	} else {
		if (!this.modified[id]) {
			this.modified[id] = {};
			// this.requestLayerInfo(id.split(":")[0], id.split(":")[1],
			// id.split(":")[3], this.modified[id]);
		}
		if (!this.modified[id][tileId]) {
			this.modified[id][tileId] = {};
		}
		this.modified[id][tileId][this.id ? model.getFeature().get(this.id) : model.getFeature().getId()] = model;
	}
}

/**
 * 새로 생성된 Model를 생성목록에서 삭제하고 삭제된 Model를 반환한다.
 * 
 * @method gb3d.edit.ModelRecord#deleteModelCreated
 * @function
 * @param {String}
 *            layerId - Layer ID
 * @param {String}
 *            modelId - Model ID
 * @return {gb3d.object.ThreeObject} 생성 임시 저장 목록에서 삭제된 gb3d.object.ThreeObject
 *         객체
 */
gb3d.edit.ModelRecord.prototype.deleteModelCreated = function(layerId, tileId, modelId) {
	var model = undefined;
	if (!!this.created[layerId]) {
		if (!!this.created[layerId][tileId]) {
			
		}
		if (this.created[layerId][modelId] instanceof gb3d.object.ThreeObject) {
			model = this.created[layerId][modelId];
			delete this.created[layerId][modelId];
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
gb3d.edit.ModelRecord.prototype.save = function(editTool) {
	var that = this;
	var edit = editTool;
	this.editTool = editTool;

	var row2 = $("<div>").addClass("row").append(this.translation.saveHint[this.locale])

	var well = $("<div>").addClass("well").append(row2);

	var closeBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-primary").text(this.translation.save[this.locale]);
	var discardBtn = $("<button>").css({
		"float" : "right",
		"background" : "#e0e1e2 none"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.discard[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(discardBtn).append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var gBody = $("<div>").append(well).css({
		"display" : "table",
		"width" : "100%"
	});
	var openSaveModal = new gb.modal.ModalBase({
		"title" : this.translation.save[this.locale],
		"width" : 540,
		"height" : 250,
		"autoOpen" : true,
		"body" : gBody,
		"footer" : modalFooter
	});

	$(closeBtn).click(function() {
		openSaveModal.close();
	});

	$(okBtn).click(function() {

		// loading div 생성
		$("body").append($("<div id='shp-upload-loading' class='gb-body-loading'>").append($("<i>").addClass("gb-body-loading-icon").addClass("fas fa-spinner fa-spin fa-5x")));

		that.sendWFSTTransaction(edit);

		if (gb.undo) {
			gb.undo.invalidateAll();
		}

		openSaveModal.close();
	});

	$(discardBtn).click(function() {
		that.created = {};
		that.modified = {};
		that.removed = {};
		edit.editToolClose();
		if (gb.undo) {
			gb.undo.invalidateAll();
		}
		openSaveModal.close();
	});
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