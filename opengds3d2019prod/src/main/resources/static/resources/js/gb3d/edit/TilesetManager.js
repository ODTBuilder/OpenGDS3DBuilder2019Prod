var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc Cesium 3D Tileset 관리자
 * @class gb3d.edit.TilesetManager
 * @memberof gb3d.edit
 * @param {Object} obj - 생성자 옵션
 * @param {gb3d.Map} obj.map - {@link gb3d.Map}
 * @param {gb3d.tree.OpenLayers} obj.clientTree - {@link gb3d.tree.OpenLayers}
 * @param {string} [obj.element="#attrDeclare"] - TilesetManager Panel을 생성할 HTML Element ID
 * @author KIM HOCHUL
 * @date 2019. 12. 24
 * @version 0.01
 */
gb3d.edit.TilesetManager = function(obj) {
	var options = obj || {};
	this.map = options.map || undefined;
	this.clientTree = options.clientTree ? options.clientTree : undefined;

	if (!this.map) {
		console.error("gb3d.edit.TilesetManager: map is required.");
	}
	this.element = options.element || "#attrDeclare"

	this.viewer = this.map.getCesiumViewer();

	/**
	 * Tileset Manager UI
	 * 
	 * @type {gb3d.style.Declarative}
	 * @private
	 */
	this.tilesetUI = new gb3d.style.Declarative({
		element : this.element
	});

	/**
	 * Tileset List
	 * 
	 * @type {Array.<gb3d.object.Tileset>}
	 * @private
	 */
	this.tilesetList = [];
}

/**
 * Tileset List에 Tileset 객체 추가
 * 
 * @method gb3d.edit.TilesetManager#pushTilesetList
 * @function
 * @param {gb3d.object.Tileset} tilesetVO - {@link gb3d.object.Tileset}
 */
gb3d.edit.TilesetManager.prototype.pushTilesetList = function(tilesetVO) {
	this.tilesetList.push(tilesetVO);
}

/**
 * Tileset manager UI 변경사항대로 Tileset 객체 style을 갱신한다.
 * 
 * @method gb3d.edit.TilesetManager#update3DTilesetStyle
 * @function
 * @param {string} element - Tileset manager UI Element ID or Class name
 * @param {Cesuim.Cesium3DTileset} tileset - Cesium 3D Tileset 객체
 * @param {string} del - 조건식 삭제 여부
 */
gb3d.edit.TilesetManager.prototype.update3DTilesetStyle = function(element, tileset, del) {
	if ($(element).hasClass("gb3d-declare-row-add")) {
		return;
	}
	var isDel = false;
	if ($(element).hasClass("gb-declare-item-del") && del) {
		isDel = true;
	}
	var key = $(element).parent().parent().parent().parent().parent().find(".panel-heading select").val();

	if (!tileset.style) {
		tileset.style = new Cesium.Cesium3DTileStyle();
	}

	var rows = $(element).parent().parent().parent().find(".gb3d-declare-row");

	var delrow = $(element).parents().eq(0);
	var delidx = $(delrow).index(".gb3d-declare-row");

	var conditions = [], show;

	for (var index = 0; index < rows.length; index++) {
		if (index === delidx) {
			continue;
		}

		var li = $(rows[index]).find(".gb-declare-item");

		var sign = $(li[0]).find("select").val();
		var value = $(li[1]).find("input").val();
		var color = $(li[2]).find("input").spectrum("get").toHexString();
		var bool = $(li[3]).find("input").prop("checked");

		if (bool) {
			var res;
			switch (sign) {
			case ">=":
				res = "<";
				break;
			case "<=":
				res = ">";
				break;
			case ">":
				res = "<=";
				break;
			case "<":
				res = ">=";
				break;
			case "=":
				res = "!==";
				break;
			case "!=":
				res = "===";
				break;
			}

			show = "${" + key + "} " + res + " " + value;
		}

		var res;
		switch (sign) {
		case "=":
			res = "===";
			break;
		case "!=":
			res = "!==";
			break;
		default:
			res = sign;
		}

		if (value === "") {
			// return;
			// value
			continue;
		} else {
			conditions.push([ "${" + key + "} " + res + " " + value, "color('" + color.toUpperCase() + "')" ]);
		}

	}

	if (isDel) {
		$(delrow).remove();
	}

	// tileset color condition 기본값 설정. 기본값 미설정시 에러 발생
	conditions.push([ "true", "color('#FFFFFF')" ]);

	var styleObj = {};
	if (conditions.length > 0) {
		styleObj["color"] = {};
		styleObj["color"]["conditions"] = conditions;
	}
	if (show) {
		styleObj["show"] = show;
	}
	console.log(styleObj);
	tileset.style = new Cesium.Cesium3DTileStyle(styleObj);
}

/**
 * Tileset 객체를 맵에 추가한다.
 * 
 * @method gb3d.edit.TilesetManager#addTileset
 * @function
 * @param {string} url - Tileset 파일 경로
 * @param {string} layerid - Openlayers layer ID
 * @param {boolean} zoom - 줌 여부
 */
gb3d.edit.TilesetManager.prototype.addTileset = function(url, layerid, zoom) {
	var that = this;
	var url = url;
	var tileset = new Cesium.Cesium3DTileset({
		url : url
	});
	var tilesetVO = new gb3d.object.Tileset({
		"layer" : layerid,
		"cesiumTileset" : tileset
	});

	var targetLayer = that.getClientTree().getJSTree().get_LayerByOLId(layerid);
	if (targetLayer) {
		var git = targetLayer.get("git");
		if (!git.hasOwnProperty("tileset")) {
			git["tileset"] = {};
		}
		git["tileset"] = tilesetVO;
	}

	this.viewer.scene.primitives.add(tileset);
	if (zoom) {
		this.viewer.zoomTo(tileset);
	}

	tileset.allTilesLoaded.addEventListener(function() {
		that.tilesetUI.addTilesPanel(tilesetVO);
		that.pushTilesetList(tilesetVO);

		that.tilesetUI.deleteEvent(function(e) {
			that.update3DTilesetStyle(this, tileset, true);
		});

		that.tilesetUI.conditionEvent(function(e) {
			if ($(e.target).parents().eq(1).find(".gb-declare-value").val() === "") {
				return;
			} else {
				that.update3DTilesetStyle(this, tileset);
			}
		});

		that.tilesetUI.inputValueEvent(function(e) {
			that.update3DTilesetStyle(this, tileset);
		});

		that.tilesetUI.inputColorEvent(function(e) {
			that.update3DTilesetStyle(this, tileset);
		});

		that.tilesetUI.checkEvent(function(e) {
			that.update3DTilesetStyle(this, tileset);
		});
	});
}

/**
 * jstree 객체를 반환한다.
 * 
 * @method gb3d.edit.TilesetManager#getClientTree
 * @function
 * @return {gb3d.tree.OpenLayers}
 */
gb3d.edit.TilesetManager.prototype.getClientTree = function() {
	return this.clientTree;
}
