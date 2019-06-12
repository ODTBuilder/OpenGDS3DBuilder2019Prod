/**
 * @classdesc 베이스맵을 변경하는 객체를 정의한다.
 * 
 * @class gb.style.BaseMap
 * @memberof gb.style
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {ol.Map}
 *            obj.map - 베이스 맵을 표시할 ol.Map 객체
 * @param {string}
 *            [obj.defaultBaseMap="black"] - 기본값으로 설정할 베이스맵 이름
 * @param {Object[]}
 *            obj.layers - 추가로 사용할 베이스 맵
 * @param {string}
 *            obj.layers[].value - 추가 베이스 맵을 구분할 구분자
 * @param {string}
 *            obj.layers[].name - 화면상에서 표시할 베이스맵의 이름
 * @param {ol.layer.Base}
 *            obj.layers[].layer - 추가 베이스 맵으로 사용될 레이어 객체
 * @param {string}
 *            obj.layers[].thumb - 베이스 맵의 썸네일로 사용할 클래스명
 * @param {string}
 *            [obj.locale="en"] - 사용할 언어 ko | en
 * @author SOYIJUN
 */

var gb;
if (!gb)
	gb = {};
if (!gb.style)
	gb.style = {};
gb.style.BaseMap = function(obj) {
	var that = this;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"bmap" : {
			"ko" : "배경지도",
			"en" : "Base Map"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		}
	};
	var options = obj ? obj : {};
	this.locale = options.locale ? options.locale : "en";

	obj.width = 788;
	obj.height = "auto";
	obj.autoOpen = false;
	obj.title = this.translation.bmap[this.locale];
	obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	this.map = options.map ? options.map : undefined;
	this.defaultMap = options.defaultBaseMap ? options.defaultBaseMap : "black";
	this.layers = options.layers ? options.layers : undefined;
	this.now = undefined;

	/**
	 * @private
	 * @type {Object}
	 */
	this.bases = {
		worldLight : {
			name : "World Light",
			thumb : "gb-basemap-thumbnail-wlight",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.TileJSON({
					url : 'https://api.tiles.mapbox.com/v3/mapbox.world-light.json?secure',
					crossOrigin : 'anonymous'
				})
			})
		},
		worldBright : {
			name : "World Bright",
			thumb : "gb-basemap-thumbnail-wbright",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.TileJSON({
					url : 'https://api.tiles.mapbox.com/v3/mapbox.world-bright.json?secure',
					crossOrigin : 'anonymous'
				})
			})
		},
		worldBlack : {
			name : "World Black",
			thumb : "gb-basemap-thumbnail-wblack",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.TileJSON({
					url : 'https://api.tiles.mapbox.com/v3/mapbox.world-black.json?secure',
					crossOrigin : 'anonymous'
				})
			})
		},
		geography : {
			name : "Geography",
			thumb : "gb-basemap-thumbnail-geography",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.TileJSON({
					url : 'https://api.tiles.mapbox.com/v3/mapbox.geography-class.json?secure',
					crossOrigin : 'anonymous'
				})
			})
		},
		toner : {
			name : "Toner",
			thumb : "gb-basemap-thumbnail-toner",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.Stamen({
					layer : "toner"
				})
			})
		},
		water : {
			name : "Water Color",
			thumb : "gb-basemap-thumbnail-water",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.Stamen({
					layer : "watercolor"
				})
			})
		},
		terrain : {
			name : "Terrian",
			thumb : "gb-basemap-thumbnail-terrian",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.Stamen({
					layer : "terrain"
				})
			})
		},
		osm : {
			name : "OpenStreetMap",
			thumb : "gb-basemap-thumbnail-osm",
			layer : new ol.layer.Tile({
				visible : false,
				source : new ol.source.OSM()
			})
		},
		bing : {
			name : "Bing Map",
			thumb : "gb-basemap-thumbnail-bing",
			layer : new ol.layer.Tile({
				visible : false,
				preload : Infinity,
				source : new ol.source.BingMaps({
					key : 'AtZS5HHiM9JIaF1cUX-x-zQT_97S8YkWkjxDowNNUGD1D8jWUtgVmdaxsiitNQbo',
					imagerySet : "AerialWithLabels"
				})
			})
		},
		black : {
			name : "Black",
			thumb : "gb-basemap-thumbnail-black",
			layer : undefined
		},
		white : {
			name : "White",
			thumb : "gb-basemap-thumbnail-white",
			layer : undefined
		}
	};

	if (Array.isArray(this.layers)) {
		for (var i = 0; i < this.layers.length; i++) {
			if (this.layers[i].hasOwnProperty("value") && this.layers[i].hasOwnProperty("name") && this.layers[i].hasOwnProperty("layer")) {
				if (typeof this.layers[i].value === "string" && typeof this.layers[i].name === "string"
						&& this.layers[i].layer instanceof ol.layer.Base) {
					if (this.layers[i].thumb === undefined) {
						// 썸네일 클래스가 없으면 기본 썸네일 사용
						this.layers[i].thumb = "gb-basemap-thumbnail-none"
					}
					var obj = {
						name : this.layers[i].name,
						thumb : this.layers[i].thumb,
						layer : this.layers[i].layer
					}
					this.bases[this.layers[i].value] = obj;
				}
			}
		}
	}
	var keys = Object.keys(this.bases);
	for (var i = 0; i < keys.length; i++) {
		// 검은 바탕이나 흰 바탕이 아니면 레이어 추가
		if (!(keys[i] === "black" || keys[i] === "white")) {
			this.map.addLayer(this.bases[keys[i]].layer);
		}
	}
	this.changeLayer(this.defaultMap);

	var body = $("<div>").addClass("gb-basemap-body");
	$(this.modalBody).append(body);
	var keys = Object.keys(this.bases);
	for (var i = 0; i < keys.length; i++) {
		var radio = $("<input>").attr({
			"type" : "radio",
			"name" : "basemap",
			"value" : keys[i]
		});
		var label = $("<label>").append(radio);
		var span = $("<span>").text(this.bases[keys[i]].name);
		label.append(span);

		var heading = $("<div>").addClass("gb-article-head");
		$(heading).append(label);

		var pBody = $("<div>").addClass("gb-article-body");

		var img = $("<div>").addClass("gb-basemap-thumbnail-frame").addClass(this.bases[keys[i]].thumb);

		$(pBody).append(img);

		var pDefault = $("<div>").addClass("gb-article");

		$(pDefault).append(heading);
		$(pDefault).append(pBody);
		$(body).append(pDefault);
	}

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]).click(function() {
		that.close();
	});
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.ok[this.locale]).click(function() {
		var val = $(that.getModalBody()).find(':radio[name="basemap"]:checked').val();
		that.changeLayer(val);
	});

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);
	$(this.modalFooter).append(modalFooter);

};
gb.style.BaseMap.prototype = Object.create(gb.modal.ModalBase.prototype);
gb.style.BaseMap.prototype.constructor = gb.style.BaseMap;

/**
 * 모달을 나타낸다.
 * 
 * @override
 * @method gb.style.BaseMap#open
 */
gb.style.BaseMap.prototype.open = function() {
	var keys = Object.keys(this.bases);
	for (var i = 0; i < keys.length; i++) {
		if (!(keys[i] === "black" || keys[i] === "white")) {
			if (this.bases[keys[i]].layer.getVisible()) {
				$("input:radio[name='basemap']:radio[value='" + keys[i] + "']").prop("checked", true);
			}
		} else {
			if (this.now === keys[i]) {
				$("input:radio[name='basemap']:radio[value='" + keys[i] + "']").prop("checked", true);
			}
		}
	}

	this.modal.css("display", "block");
	this.background.css("display", "block");
	this.refreshPosition();
};

/**
 * 베이스맵을 변경한다.
 * 
 * @method gb.style.BaseMap#changeLayer
 * @param {string}
 *            value - 변경하고자 하는 베이스맵의 구분자
 */
gb.style.BaseMap.prototype.changeLayer = function(value) {
	var keys = Object.keys(this.bases);
	for (var i = 0; i < keys.length; i++) {
		if (value === keys[i]) {
			// 검은 바탕 css 조작
			if (value === "black") {
				var div = this.map.getTarget();
				if (typeof div === "string") {
					$("#" + div).css({
						"background-color" : "#000"
					});
				} else if ($(div).is("div")) {
					$(div).css({
						"background-color" : "#000"
					});
				}
				this.now = value;
				// 흰 바탕 css 조작
			} else if (value === "white") {
				var div = this.map.getTarget();
				if (typeof div === "string") {
					$("#" + div).css({
						"background-color" : "#fff"
					});
				} else if ($(div).is("div")) {
					$(div).css({
						"background-color" : "#fff"
					});
				}
				this.now = value;
			} else {
				// 그 외 상황에 기본 흰 바탕 설정 후 레이어 보이기
				var div = this.map.getTarget();
				if (typeof div === "string") {
					$("#" + div).css({
						"background-color" : "#000"
					});
				} else if ($(div).is("div")) {
					$(div).css({
						"background-color" : "#000"
					});
				}
				this.bases[keys[i]].layer.setVisible(true);
				this.now = value;
			}
		} else {
			if (!(keys[i] === "black" || keys[i] === "white")) {
				this.bases[keys[i]].layer.setVisible(false);
			}
		}
	}
	this.close();
};