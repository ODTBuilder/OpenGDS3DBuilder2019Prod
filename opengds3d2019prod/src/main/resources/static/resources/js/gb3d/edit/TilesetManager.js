var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc
 * Cesium 3D Tileset 관리자
 * @class gb3d.edit.TilesetManager
 * @memberof gb3d.edit
 * @param {Object}
 *            obj - 생성자 옵션
 * @param {boolean} [isDisplay=false] - 객체 생성 후 바로 가시화 여부
 * @param {string} [toggleClass="header-toggle-btn"] - toggle button 요소 Class 이름. 해당 button 요소에 edit tool toggle 기능 추가
 * @param {string} targetElement - Edit tool bar를 생성할 div id 또는 class name
 * @param {Array.<Object>} [list] - Edit tool bar에 생성할 메뉴
 * @param {string} list[].content - 메뉴 이름
 * @param {string} list[].icon - 메뉴 아이콘 {@link https://fontawesome.com/}
 * @param {string} list[].color - 메뉴 색상
 * @param {string} [obj.locale="en"] - 언어 코드
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

	this.tilesetUI = new gb3d.style.Declarative({
		element : this.element
	});

	this.tilesetList = [];
}

gb3d.edit.TilesetManager.prototype.pushTilesetList = function(tilesetVO) {
	this.tilesetList.push(tilesetVO);
}

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
//			return;
//			value
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

gb3d.edit.TilesetManager.prototype.addTileset = function(url, layerid) {
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
	// this.viewer.zoomTo( tileset );

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

gb3d.edit.TilesetManager.prototype.getClientTree = function() {
	return this.clientTree;
}
