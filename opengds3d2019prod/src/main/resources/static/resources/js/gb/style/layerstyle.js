/**
 * @classdesc 레이어 스타일 패널 객체를 정의한다.
 * 
 * @class gb.style.LayerStyle
 * @memberof gb.style
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {boolean}
 *            [obj.autoOpen=false] - 패널을 선언과 동시에 표출 할 것인지 선택
 * @param {ol.layer.Base}
 *            obj.layer - 스타일을 변경할 레이어 객체
 * @param {string}
 *            [obj.locale="en"] - 사용할 언어 ko | en
 * @author SOYIJUN
 */
var gb;
if (!gb)
	gb = {};
if (!gb.style)
	gb.style = {};
gb.style.LayerStyle = function(obj) {
	var that = this;
	obj.width = 192;
	obj.height = 420;
	obj.positionX = 380;
	obj.positionY = 535;
	gb.panel.PanelBase.call(this, obj);
	var options = obj ? obj : {};
	this.layer = options.layer instanceof ol.layer.Base ? options.layer : undefined;
	this.locale = options.locale ? options.locale : "en";
	this.geom = undefined;
	/**
	 * @private
	 * @type {gb.panel.PanelBase}
	 */
	this.labelPanel = undefined;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"choose" : {
			"ko" : "레이어를 선택하세요.",
			"en" : "Choose a layer."
		},
		"outline" : {
			"ko" : "외곽선",
			"en" : "Outline"
		},
		"fill" : {
			"ko" : "채우기",
			"en" : "Fill"
		},
		"width" : {
			"ko" : "너비",
			"en" : "Width"
		},
		"radius" : {
			"ko" : "반지름",
			"en" : "Radius"
		},
		"outstyle" : {
			"ko" : "외곽선 스타일",
			"en" : "Outline Style"
		},
		"opacity" : {
			"ko" : "투명도",
			"en" : "Opacity"
		},
		"label" : {
			"ko" : "레이블",
			"en" : "Label"
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
	/**
	 * @private
	 * @type {Object}
	 */
	this.jstreeNode = undefined;
	/**
	 * @private
	 * @type {Object}
	 */
	this.legendInfo = undefined;
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.layerName = $("<div>").text(this.translation.choose[this.locale]).addClass("gb-layerstyle-layer-name");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.lineLabel = $("<div>").text(this.translation.outline[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.linePicker = $("<input>").attr({
		"type" : "text"
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.lineContent = $("<div>").append(this.linePicker);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.lineArea = $("<div>").append(this.lineLabel).append(this.lineContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.fillLabel = $("<div>").text(this.translation.fill[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.fillPicker = $("<input>").attr({
		"type" : "text"
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.fillContent = $("<div>").append(this.fillPicker);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.fillArea = $("<div>").append(this.fillLabel).append(this.fillContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.widthLabel = $("<div>").text(this.translation.width[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.widthInput = $("<input>").attr({
		"type" : "number",
		"min" : "1"
	}).addClass("gb-layerstyle-text-area").val("1");

	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.widthContent = $("<div>").append(this.widthInput);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.widthArea = $("<div>").append(this.widthLabel).append(this.widthContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.radLabel = $("<div>").text(this.translation.radius[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.radInput = $("<input>").attr({
		"type" : "number",
		"min" : "0"
	}).addClass("gb-layerstyle-text-area").val("5");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.radContent = $("<div>").append(this.radInput);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.radArea = $("<div>").append(this.radLabel).append(this.radContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outlineLabel = $("<div>").text(this.translation.outstyle[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outline1 = $("<option>").attr({
		"value" : "outline1"
	}).text("─────────────────────");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outline2 = $("<option>").attr({
		"value" : "outline2",
		"dash" : "5,5"
	}).text("- - - - - - - - - - - - - - - - - - - - - - - - -");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outline3 = $("<option>").attr({
		"value" : "outline3",
		"dash" : "8,5,1,5"
	}).text("─ · ─ · ─ · ─ · ─ · ─ · ─ · ─ · ─ · ─ ·");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outline4 = $("<option>").attr({
		"value" : "outline4",
		"dash" : "8,5,1,5,1,5"
	}).text("─ · · ─ · · ─ · · ─ · · ─ · · ─ · · ─ · · ─");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outlineInput = $("<select>").append(this.outline1).append(this.outline2).append(this.outline3).append(this.outline4).addClass(
			"gb-layerstyle-text-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outlineContent = $("<div>").append(this.outlineInput);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.outlineArea = $("<div>").append(this.outlineLabel).append(this.outlineContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.opaFigure = $("<span>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.opaLabel = $("<div>").append(this.translation.opacity[this.locale] + ": ").append(this.opaFigure);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.opaPicker = $("<input>").attr({
		"type" : "range",
		"min" : "0",
		"max" : "1",
		"step" : "0.01"
	}).val("1");
	$(this.opaPicker).on("input", function() {
		$(that.opaFigure).empty();
		$(that.opaFigure).text($(this).val());
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.opaContent = $("<div>").append(this.opaPicker);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.opaArea = $("<div>").append(this.opaLabel).append(this.opaContent).addClass("gb-layerstyle-select-area");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.checkboxInput = $("<input type='checkbox' tabindex='0'>").css(gb.geoserver.CHECKBOXINPUT).change(function() {
		var bool = that.createWFSLabelPanel(this.checked);
		if (!bool) {
			this.checked = false;
		}
	});

	var checkboxLabel = $("<label>").text(this.translation.label[this.locale]);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.checkboxDiv = $("<div>").append(this.checkboxInput).append(checkboxLabel);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.saveBtn = $("<button>").text(this.translation.ok[this.locale]).addClass("gb-button").addClass("gb-button-primary").click(
			function() {
				that.updateStyle();
			});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.btnArea = $("<div>").addClass("gb-layerstyle-button-area").append(this.saveBtn);

	$(this.panelBody).addClass("gb-layerstyle-body");
	$(this.panelBody).append(this.layerName).append(this.fillArea).append(this.lineArea).append(this.widthArea).append(this.radArea)
			.append(this.outlineArea).append(this.opaArea).append(this.checkboxDiv).append(this.btnArea);

	$("body").append(this.panel);
	// 선색깔 설정을 위한 스펙트럼 객체 선언
	$(this.linePicker).spectrum({
		showInput : true,
		showAlpha : true,
		preferredFormat : "rgb"
	});
	// 면색깔 설정을 위한 스펙트럼 객체 선언
	$(this.fillPicker).spectrum({
		showInput : true,
		showAlpha : true,
		preferredFormat : "rgb"
	});
	// 레이어 스타일 패널 크기에 맞게 너비 수정
	$(this.lineContent).find(".sp-replacer").addClass("gb-layerstyle-replacer-area");
	$(this.lineContent).find(".sp-preview").addClass("gb-layerstyle-preview-area");
	$(this.fillContent).find(".sp-replacer").addClass("gb-layerstyle-replacer-area");
	$(this.fillContent).find(".sp-preview").addClass("gb-layerstyle-preview-area");

	var temp = this.getLayer();
	if (temp instanceof ol.layer.Base) {
		this.setLayer(temp);
	}
};
gb.style.LayerStyle.prototype = Object.create(gb.panel.PanelBase.prototype);
gb.style.LayerStyle.prototype.constructor = gb.style.LayerStyle;

/**
 * WFS 라벨 설정 페널을 생성한다.
 * 
 * @private
 * @method gb.style.LayerStyle#createWFSLabelPanel
 * @param {boolean}
 *            bool - 레이블 패널을 열어 둘것인지 확인
 */
gb.style.LayerStyle.prototype.createWFSLabelPanel = function(bool) {
	var that = this;
	if (!bool) {
		if (this.labelPanel) {
			this.labelPanel.close();
		}
		return false;
	}

	var git = this.layer.get("git");
	if (git["fake"] === "parent") {
		return false;
	}

	var labelOptions = git.labelOptions || {};
	var attrs = [];
	var temp;
	if (this.layer instanceof ol.layer.Tile) {
		temp = git instanceof Object ? git.attribute : [];
		for (var i = 0; i < temp.length; i++) {
			attrs.push(temp[i].fieldName);
		}
	} else if (this.layer instanceof ol.layer.Vector) {
		temp = git instanceof Object ? git.attribute : [];
		for (var i = 0; i < temp.length; i++) {
			attrs.push(temp[i].fieldName);
		}
	}
	var options = {
		"Attribute" : attrs,
		"Text" : [ "normal", "hide", "shorten", "wrap" ],
		"MaxResolution" : [ "38400", "19200", "9600", "4800", "2400", "1200", "600", "300", "150", "75", "32", "16", "8" ],
		"Align" : [ "center", "end", "left", "right", "start" ],
		"Baseline" : [ "alphabetic", "bottom", "hanging", "ideographic", "middle", "top" ],
		"Rotation" : [ "0", "0.785398164", "1.570796327" ],
		"Font" : [ "Arial", "'Courier New'", "Verdana" ],
		"Weight" : [ "normal", "bold" ],
		"Placement" : [ "point", "line" ],
		"MaxAngle" : [ "0.7853981633974483", "2.0943951023931953", "6.283185307179586" ],
		"Size" : "12px",
		"OffsetX" : "0",
		"OffsetY" : "0",
		"FillColor" : "blue",
		"OutlineColor" : "#ffffff",
		"OutlineWidth" : "3"
	}

	var tr, key, value, select, option;
	var tbody = $("<tbody>");
	var table = $("<table>").addClass("gb-layerstyle-label-area").append(tbody);

	if (!this.labelPanel) {
		this.labelPanel = new gb.panel.PanelBase({
			"width" : "auto",
			"height" : "420",
			"positionX" : "572",
			"positionY" : "535"
		});

		this.labelPanel.panelHead.remove();
		$("body").append(this.labelPanel.panel);
		this.labelPanel.panel.css("overflow", "auto");

		this.closeBtn.on("click", function() {
			that.labelPanel.close();
		});
	}

	for ( var i in options) {
		key = $("<td>").addClass("gb-modifylayerproperties-td-key").text(i);
		if (options[i] instanceof Array) {
			select = $("<select>").addClass("gb-form").attr("id", "label" + i).addClass("gb-modifylayerproperties-select");
			for (var j = 0; j < options[i].length; j++) {
				option = $("<option>").val(options[i][j]).text(options[i][j]);
				select.append(option);
				if (options[i][j] === labelOptions[i.charAt(0).toLowerCase() + i.slice(1)]) {
					option.attr("selected", "selected");
				}
			}
			value = $("<td>").addClass("gb-modifylayerproperties-td").append(select);
		} else {
			value = $("<td>").addClass("gb-modifylayerproperties-td").append($("<input>").addClass("layer-prop-input").attr({
				"id" : "label" + i,
				"value" : labelOptions[i.charAt(0).toLowerCase() + i.slice(1)] || options[i],
				"type" : "text",
				"readonly" : false
			}).addClass("gb-modifylayerproperties-input"));
		}

		tr = $("<tr>").addClass("gb-modifylayerproperties-tr").append(key).append(value);
		tbody.append(tr);
	}

	this.labelPanel.panelBody.find("table").remove();
	this.labelPanel.panelBody.append(table);

	this.labelPanel.open();
	return true;
}

/**
 * 선택한 스타일을 레이어에 적용 시킨다.
 * 
 * @private
 * @method gb.style.LayerStyle#updateStyle
 */
gb.style.LayerStyle.prototype.updateStyle = function() {
	var layer = this.getLayer();
	// 레이어 스타일 패널에서 선택한 옵션값 추출후 오픈레이어스 스타일 객체 생성
	var style = new ol.style.Style(
			{
				"fill" : this.geom === "Polygon" || this.geom === "MultiPolygon" ? new ol.style.Fill({
					"color" : [ $(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g,
							$(this.fillPicker).spectrum("get").toRgb().b, $(this.fillPicker).spectrum("get").toRgb().a ]
				}) : undefined,
				"stroke" : this.geom === "Polygon" || this.geom === "MultiPolygon" || this.geom === "LineString"
						|| this.geom === "MultiLineString" ? new ol.style.Stroke({
					"color" : [ $(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g,
							$(this.linePicker).spectrum("get").toRgb().b, $(this.linePicker).spectrum("get").toRgb().a ],
					"width" : parseFloat($(this.widthInput).val()),
					"lineDash" : $(this.outlineInput).find(":selected").attr("dash") !== undefined ? $(this.outlineInput).find(":selected")
							.attr("dash").split(",") : undefined,
					"lineCap" : "butt"
				}) : undefined,
				"image" : this.geom === "Point" || this.geom === "MultiPoint" ? new ol.style.Circle({
					"radius" : parseFloat($(this.radInput).val()),
					"fill" : new ol.style.Fill({
						"color" : [ $(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g,
								$(this.fillPicker).spectrum("get").toRgb().b, $(this.fillPicker).spectrum("get").toRgb().a ]
					}),
					"stroke" : new ol.style.Stroke({
						"color" : [ $(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g,
								$(this.linePicker).spectrum("get").toRgb().b, $(this.linePicker).spectrum("get").toRgb().a ],
						"width" : parseFloat($(this.widthInput).val()),
						"lineDash" : $(this.outlineInput).find(":selected").attr("dash") !== undefined ? $(this.outlineInput).find(
								":selected").attr("dash").split(",") : undefined,
						"lineCap" : "butt"
					})
				}) : undefined
			});
	var labelOptions = {};
	if (this.checkboxInput.prop("checked")) {
		labelOptions.attribute = $("#labelAttribute").find("option:selected").val();
		labelOptions.align = $("#labelAlign").find("option:selected").val();
		labelOptions.baseline = $("#labelBaseline").find("option:selected").val();
		labelOptions.size = $("#labelSize").val();
		labelOptions.offsetX = parseInt($("#labelOffsetX").val(), 10);
		labelOptions.offsetY = parseInt($("#labelOffsetY").val(), 10);
		labelOptions.weight = $("#labelWeight").find("option:selected").val();
		labelOptions.placement = $("#labelPlacement").find("option:selected").val();
		labelOptions.maxAngle = parseFloat($("#labelMaxAngle").find("option:selected").val());
		labelOptions.overflow = false;
		labelOptions.rotation = parseFloat($("#labelRotation").find("option:selected").val());
		labelOptions.font = $("#labelFont").find("option:selected").val();
		labelOptions.fillColor = $("#labelFillColor").val();
		labelOptions.outlineColor = $("#labelOutlineColor").val();
		labelOptions.outlineWidth = parseInt($("#labelOutlineWidth").val(), 10);
		labelOptions.maxResolution = $("#labelMaxResolution").find("option:selected").val();
	}
	var opacity = parseFloat($(this.opaPicker).val());

	if (layer instanceof ol.layer.Vector) {
		if (layer.get("git") === undefined || layer.get("git") === null) {
			return;
		}

		layer.setStyle(style);
		if (gb.layer.Label !== undefined && this.checkboxInput.prop("checked")) {
			layer.setStyle(new gb.layer.Label({
				layer : layer,
				labelOptions : labelOptions
			}));

			layer.get("git").labelOptions = labelOptions;
			layer.get("git").labelActive = true;
		} else {
			layer.get("git").labelActive = false;
		}

		var lsource = layer.getSource();
		if (lsource !== undefined) {
			var git = lsource.get("git");
			var vectorLayer;
			if (git !== undefined) {
				vectorLayer = git.tempLayer;
			}
			if (vectorLayer !== undefined) {
				vectorLayer.setStyle(style);
				if (gb.layer.Label !== undefined && this.checkboxInput.prop("checked")) {
					vectorLayer.setStyle(new gb.layer.Label({
						layer : vectorLayer,
						labelOptions : labelOptions
					}));

					git.labelOptions = labelOptions;
					git.labelActive = true;
				} else {
					git.labelActive = false;
				}
			}
		}
		this.close();
		this.createWFSLabelPanel(false);
	} else if (layer instanceof ol.layer.Tile) {
		var git = layer.get("git");
		if (git["fake"] === "parent") {
			return;
		}
		var source = layer.getSource();
		var sld = source.getParams()["SLD_BODY"];
		var vectorLayer = git.tempLayer;
		var sldBody = "";

		if (vectorLayer !== undefined) {
			vectorLayer.setStyle(style);
			if (gb.layer.Label !== undefined && this.checkboxInput.prop("checked")) {
				vectorLayer.setStyle(new gb.layer.Label({
					layer : vectorLayer,
					labelOptions : labelOptions
				}));
			}
		}

		if (sld !== undefined) {
			sldBody += '<?xml version="1.0" encoding="ISO-8859-1"?>';
			sldBody += '<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"><NamedLayer>';
			sldBody += '<Name>';
			sldBody += git.workspace + ":" + git.layers;
			sldBody += '</Name>';
			sldBody += '<UserStyle><FeatureTypeStyle><Rule>';

			// if(sld.indexOf("<PolygonSymbolizer>") !== -1){
			if (this.geom === "Polygon" || this.geom === "MultiPolygon") {
				sldBody += '<PolygonSymbolizer><Fill>';
				sldBody += '<CssParameter name="fill">#'
				sldBody += this.hexFromRGB($(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g, $(
						this.fillPicker).spectrum("get").toRgb().b)
				sldBody += '</CssParameter>' + '<CssParameter name="fill-opacity">'
				sldBody += typeof $(this.fillPicker).spectrum("get").toRgb().a === "number" ? $(this.fillPicker).spectrum("get").toRgb().a
						: 1
				sldBody += '</CssParameter></Fill>'
				sldBody += '<Stroke><CssParameter name="stroke">#'
				sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
						this.linePicker).spectrum("get").toRgb().b)
						+ '</CssParameter>' + '<CssParameter name="stroke-opacity">'
				sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a
						: 1
				sldBody += '</CssParameter>' + '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val())
						+ '</CssParameter>'
				if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
					sldBody += '<CssParameter name="stroke-dasharray">'
							+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
				}
				sldBody += '</Stroke>' + '</PolygonSymbolizer>'
				// } else if(sld.indexOf("<LineSymbolizer>") !== -1){
			} else if (this.geom === "LineString" || this.geom === "MultiLineString") {
				sldBody += '<LineSymbolizer><Stroke>'
				sldBody += '<CssParameter name="stroke">#'
				sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
						this.linePicker).spectrum("get").toRgb().b)
						+ '</CssParameter>' + '<CssParameter name="stroke-opacity">'
				sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a
						: 1
				sldBody += '</CssParameter>';
				sldBody += '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val()) + '</CssParameter>'
				if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
					sldBody += '<CssParameter name="stroke-dasharray">'
							+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
				}
				sldBody += '</Stroke>' + '</LineSymbolizer>';

				// } else if(sld.indexOf("<PointSymbolizer>") !== -1){
			} else if (this.geom === "Point" || this.geom === "MultiPoint") {
				sldBody += '<PointSymbolizer><Graphic>';
				sldBody += '<Mark>';
				sldBody += '<WellKnownName>circle</WellKnownName>';
				sldBody += '<Fill>';
				sldBody += '<CssParameter name="fill">#';
				sldBody += this.hexFromRGB($(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g, $(
						this.fillPicker).spectrum("get").toRgb().b);
				sldBody += '</CssParameter>' + '<CssParameter name="fill-opacity">';
				sldBody += typeof $(this.fillPicker).spectrum("get").toRgb().a === "number" ? $(this.fillPicker).spectrum("get").toRgb().a
						: 1;
				sldBody += '</CssParameter>';
				sldBody += '</Fill>'
				sldBody += '<Stroke>';
				sldBody += '<CssParameter name="stroke">#';
				sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
						this.linePicker).spectrum("get").toRgb().b);
				sldBody += '</CssParameter>' + '<CssParameter name="stroke-opacity">';
				sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a
						: 1
				sldBody += '</CssParameter>';
				sldBody += '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val()) + '</CssParameter>'
				if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
					sldBody += '<CssParameter name="stroke-dasharray">'
							+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
				}
				sldBody += '</Stroke>';
				sldBody += '</Mark>'
				sldBody += '<Size>' + parseFloat($(this.radInput).val()) * 2 + '</Size>'
				sldBody += '</Graphic>' + '</PointSymbolizer>'
			}

			if (this.checkboxInput.prop("checked")) {
				sldBody += '<TextSymbolizer>';
				sldBody += '<Geometry>';
				sldBody += '<ogc:Function name="centroid">';
				sldBody += '<ogc:PropertyName>the_geom</ogc:PropertyName>';
				sldBody += '</ogc:Function>';
				sldBody += '</Geometry>';
				sldBody += '<Label>';
				sldBody += '<ogc:PropertyName>' + labelOptions.attribute + '</ogc:PropertyName>';
				sldBody += '</Label>';
				sldBody += '<Font>';
				sldBody += '<CssParameter name="font-family">' + labelOptions.font + '</CssParameter>';
				sldBody += '<CssParameter name="font-size">' + labelOptions.size + '</CssParameter>';
				sldBody += '<CssParameter name="font-style">normal</CssParameter>';
				sldBody += '<CssParameter name="font-weight">' + labelOptions.weight + '</CssParameter>';
				sldBody += '</Font>';
				sldBody += '<Fill>';
				sldBody += '<CssParameter name="fill">#990099</CssParameter>';
				sldBody += '</Fill>';
				sldBody += '</TextSymbolizer>';

				git.labelOptions = labelOptions;
				git.labelActive = true;
			} else {
				git.labelActive = false;
			}

			sldBody += '</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

			source.updateParams({
				'SLD_BODY' : sldBody
			});

			layer.setOpacity(opacity);
			this.close();
			this.createWFSLabelPanel(false);
		}
	} else if (layer instanceof ol.layer.Image) {
		layer.setOpacity(opacity);
		this.close();
	}
	this.updateLegend();
}
/**
 * 선택한 스타일을 레이어에 적용 시킨다.
 * 
 * @private
 * @method gb.style.LayerStyle#applyStyle
 */
gb.style.LayerStyle.prototype.applyStyle = function() {
	var layer = this.getLayer();
	if (layer instanceof ol.layer.Vector) {
		var style = new ol.style.Style({
			"fill" : this.geom === "Polygon" || this.geom === "MultiPolygon" ? new ol.style.Fill({
				"color" : [ $(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g,
						$(this.fillPicker).spectrum("get").toRgb().b, $(this.fillPicker).spectrum("get").toRgb().a ]
			}) : undefined,
			"stroke" : this.geom === "Polygon" || this.geom === "MultiPolygon" || this.geom === "LineString"
					|| this.geom === "MultiLineString" ? new ol.style.Stroke({
				"color" : [ $(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g,
						$(this.linePicker).spectrum("get").toRgb().b, $(this.linePicker).spectrum("get").toRgb().a ],
				"width" : parseFloat($(this.widthInput).val()),
				"lineDash" : $(this.outlineInput).find(":selected").attr("dash") !== undefined ? $(this.outlineInput).find(":selected")
						.attr("dash").split(",") : undefined,
				"lineCap" : "butt"
			}) : undefined,
			"image" : this.geom === "Point" || this.geom === "MultiPoint" ? new ol.style.Circle({
				"radius" : parseFloat($(this.radInput).val()),
				"fill" : new ol.style.Fill({
					"color" : [ $(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g,
							$(this.fillPicker).spectrum("get").toRgb().b, $(this.fillPicker).spectrum("get").toRgb().a ]
				}),
				"stroke" : new ol.style.Stroke({
					"color" : [ $(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g,
							$(this.linePicker).spectrum("get").toRgb().b, $(this.linePicker).spectrum("get").toRgb().a ],
					"width" : parseFloat($(this.widthInput).val()),
					"lineDash" : $(this.outlineInput).find(":selected").attr("dash") !== undefined ? $(this.outlineInput).find(":selected")
							.attr("dash").split(",") : undefined,
					"lineCap" : "butt"
				})
			}) : undefined
		});

		layer.setStyle(style);
		if (gb.layer.Label !== undefined && this.checkboxInput.prop("checked")) {
			layer.setStyle(new gb.layer.Label({
				layer : layer
			}));
		}

	} else if (layer instanceof ol.layer.Tile) {
		var git = layer.get("git");
		if (git["fake"] === "parent") {
			return;
		}
		if (this.geom === "Point" || this.geom === "MultiPoint") {
			var source = layer.getSource();
			console.log(source.getParams());
			var sldBody = '<StyledLayerDescriptor version="1.0.0"><UserLayer>';
			sldBody += '<Name>';
			sldBody += 'admin:geo_shp_37712012_A0030000_MULTIPOINT';
			sldBody += '</Name>';
			sldBody += '<UserStyle><Name>UserSelection</Name><FeatureTypeStyle>';
			sldBody += '<Rule><PointSymbolizer><Graphic>';
			sldBody += '<Mark>';
			sldBody += '<WellKnownName>circle</WellKnownName>';
			sldBody += '<Fill>';
			sldBody += '<CssParameter name="fill">#';
			sldBody += this.hexFromRGB($(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g, $(
					this.fillPicker).spectrum("get").toRgb().b);
			sldBody += '</CssParameter>' + '<CssParameter name="fill-opacity">';
			sldBody += typeof $(this.fillPicker).spectrum("get").toRgb().a === "number" ? $(this.fillPicker).spectrum("get").toRgb().a : 1;
			sldBody += '</CssParameter>';
			sldBody += '</Fill>'
			sldBody += '<Stroke>';
			sldBody += '<CssParameter name="stroke">#';
			sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
					this.linePicker).spectrum("get").toRgb().b);
			sldBody += '</CssParameter>' + '<CssParameter name="stroke-opacity">';
			sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a : 1
			sldBody += '</CssParameter>';
			sldBody += '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val()) + '</CssParameter>'
			if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
				sldBody += '<CssParameter name="stroke-dasharray">'
						+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
			}
			sldBody += '</Stroke>';
			sldBody += '</Mark>'
			sldBody += '<Size>' + parseFloat($(this.radInput).val()) * 2 + '</Size>'
			sldBody += '</Graphic>' + '</PointSymbolizer></Rule>'
			// '<Rule><LineSymbolizer><Stroke/></LineSymbolizer></Rule>'
			sldBody += '</FeatureTypeStyle></UserStyle></UserLayer></StyledLayerDescriptor>';
			console.log(sldBody);
			source.updateParams({
				'SLD_BODY' : sldBody
			});
		} else if (this.geom === "LineString" || this.geom === "MultiLineString") {
			var source = layer.getSource();
			console.log(source.getParams());
			var sldBody = '<StyledLayerDescriptor version="1.0.0"><UserLayer>';
			sldBody += '<Name>';
			sldBody += 'admin:geo_shp_37712013_A0020000_MULTILINESTRING'
			sldBody += '</Name>'
			sldBody += '<UserStyle><Name>UserSelection</Name><FeatureTypeStyle>'
			sldBody += '<Rule><LineSymbolizer><Stroke>'
			sldBody += '<CssParameter name="stroke">#'
			sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
					this.linePicker).spectrum("get").toRgb().b)
					+ '</CssParameter>' + '<CssParameter name="stroke-opacity">'
			sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a : 1
			sldBody += '</CssParameter>';
			sldBody += '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val()) + '</CssParameter>'
			if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
				sldBody += '<CssParameter name="stroke-dasharray">'
						+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
			}
			sldBody += '</Stroke>' + '</LineSymbolizer></Rule>'
			// '<Rule><LineSymbolizer><Stroke/></LineSymbolizer></Rule>'
			sldBody += '</FeatureTypeStyle></UserStyle></UserLayer></StyledLayerDescriptor>';
			console.log(sldBody);
			source.updateParams({
				'SLD_BODY' : sldBody
			});
		} else if (this.geom === "Polygon" || this.geom === "MultiPolygon") {
			var source = layer.getSource();
			console.log(source.getParams());
			var sldBody = '<StyledLayerDescriptor version="1.0.0"><UserLayer>';
			sldBody += '<Name>';
			sldBody += 'admin:geo_shp_37712013_A0070000_MULTIPOLYGON'
			sldBody += '</Name>'
			sldBody += '<UserStyle><Name>UserSelection</Name><FeatureTypeStyle>'
			sldBody += '<Rule><PolygonSymbolizer><Fill>'
			sldBody += '<CssParameter name="fill">#'
			sldBody += this.hexFromRGB($(this.fillPicker).spectrum("get").toRgb().r, $(this.fillPicker).spectrum("get").toRgb().g, $(
					this.fillPicker).spectrum("get").toRgb().b)
			sldBody += '</CssParameter>' + '<CssParameter name="fill-opacity">'
			sldBody += typeof $(this.fillPicker).spectrum("get").toRgb().a === "number" ? $(this.fillPicker).spectrum("get").toRgb().a : 1
			sldBody += '</CssParameter></Fill>'
			sldBody += '<Stroke><CssParameter name="stroke">#'
			sldBody += this.hexFromRGB($(this.linePicker).spectrum("get").toRgb().r, $(this.linePicker).spectrum("get").toRgb().g, $(
					this.linePicker).spectrum("get").toRgb().b)
					+ '</CssParameter>' + '<CssParameter name="stroke-opacity">'
			sldBody += typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a : 1
			sldBody += '</CssParameter>' + '<CssParameter name="stroke-width">' + parseFloat($(this.widthInput).val()) + '</CssParameter>'
			if ($(this.outlineInput).find(":selected").attr("dash") !== undefined) {
				sldBody += '<CssParameter name="stroke-dasharray">'
						+ $(this.outlineInput).find(":selected").attr("dash").replace(/,/gi, " ") + '</CssParameter>';
			}
			sldBody += '</Stroke>' + '</PolygonSymbolizer></Rule>'
			// '<Rule><LineSymbolizer><Stroke/></LineSymbolizer></Rule>'
			sldBody += '</FeatureTypeStyle></UserStyle></UserLayer></StyledLayerDescriptor>';
			console.log(sldBody);
			source.updateParams({
				'SLD_BODY' : sldBody
			});
		}
	}
	var opacity = parseFloat($(this.opaPicker).val());
	layer.setOpacity(opacity);
	this.close();
	this.createWFSLabelPanel(false);
};
/**
 * RGB 색상코드를 16진수 색상코드로 변환한다.
 * 
 * @method gb.style.LayerStyle#hexFromRGB
 * @param {number}
 *            r - R 계열 수치
 * @param {number}
 *            g- G 계열 수치
 * @param {number}
 *            b - B 계열 수치
 * @return {string} RGB코드
 */
gb.style.LayerStyle.prototype.hexFromRGB = function(r, g, b) {
	// 받아온 파라미터를 16진수로 변환한다
	var hex = [ r.toString(16), g.toString(16), b.toString(16) ];
	// 각각의 16진수의 길이가 1이라면 0을 추가해 2자리로 만든다
	$.each(hex, function(nr, val) {
		if (val.length === 1) {
			hex[nr] = "0" + val;
		}
	});
	// 16진수 rgb코드를 반환한다
	return hex.join("").toUpperCase();
};
/**
 * 16진수 색상코드를 RGB 색상코드로 변환한다.
 * 
 * @method gb.style.LayerStyle#decimalFromHex
 * @param {string}
 *            hex - 16진수 RGB 색상코드
 * @return {string} RGB 색상코드
 */
gb.style.LayerStyle.decimalFromHex = function(hex) {
	// r코드 획득
	var first = hex.substring(0, 2);
	var firstDeci = parseInt(first, 16);

	// g코드 획득
	var second = hex.substring(2, 4);
	var secondDeci = parseInt(second, 16);

	// b코드 획득
	var third = hex.substring(4, 6);
	var thirdDeci = parseInt(third, 16);

	// 합친후 반환
	var deciArr = [ firstDeci, secondDeci, thirdDeci ];
	return deciArr.join();
}
/**
 * SLD의 스타일 설정값을 추출한다.
 * 
 * @private
 * @method gb.style.LayerStyle#parseSymbolizer
 * @param {string}
 *            sld - 레이어의 SLD
 * @return {Object} 스타일 정보를 가진 객체
 */
gb.style.LayerStyle.prototype.parseSymbolizer = function(sld) {
	var obj = {};
	var symbol = undefined;
	if (sld.indexOf("<PolygonSymbolizer>") !== -1) {
		symbol = sld.substring(sld.indexOf("<PolygonSymbolizer>") + 19, sld.indexOf("</PolygonSymbolizer>"));
		var fill = symbol.substring(symbol.indexOf('<Fill>') + 6, symbol.indexOf("</Fill>"));
		var fillColor;
		if (fill.indexOf('<CssParameter name="fill">') !== -1) {
			fillColor = fill.substring(fill.indexOf('<CssParameter name="fill">') + 26, fill.indexOf("</CssParameter>"));
		}
		var fillColorCode;
		var fillRGBColorCode;
		if (fillColor.indexOf("#") !== -1) {
			fillColorCode = fillColor.substring(fillColor.indexOf("#") + 1);
			fillRGBColorCode = gb.style.LayerStyle.decimalFromHex(fillColorCode);
		}
		fill = fill.substring(fill.indexOf("</CssParameter>") + 15);
		var fillOpacity;
		if (fill.indexOf('<CssParameter name="fill-opacity">') !== -1) {
			fillOpacity = fill.substring(fill.indexOf('<CssParameter name="fill-opacity">') + 34, fill.indexOf("</CssParameter>"));
		}
		console.log(fillOpacity);

		obj["fillRGBA"] = "rgba(" + (!fillRGBColorCode ? "120,120,120" : fillRGBColorCode) + "," + (!fillOpacity ? "1" : fillOpacity) + ")";

		symbol = symbol.substring(symbol.indexOf("</Fill>") + 7);
	} else if (sld.indexOf("<LineSymbolizer>") !== -1) {
		symbol = sld.substring(sld.indexOf("<LineSymbolizer>") + 16, sld.indexOf("</LineSymbolizer>"));
	} else if (sld.indexOf("<PointSymbolizer>") !== -1) {
		symbol = sld.substring(sld.indexOf("<PointSymbolizer>") + 17, sld.indexOf("</PointSymbolizer>"));
		var graphic = symbol.substring(symbol.indexOf('<Graphic>') + 9, symbol.indexOf("</Graphic>"));
		var size;
		if (graphic.indexOf('<Size>') !== -1) {
			size = graphic.substring(graphic.indexOf('<Size>') + 6, graphic.indexOf("</Size>"));
			if (size !== undefined) {
				obj["pointSize"] = size;
			}
		}
		var mark;
		if (graphic.indexOf('<Mark>') !== -1) {
			mark = graphic.substring(graphic.indexOf('<Mark>') + 6, graphic.indexOf("</Mark>"));
		}
		var fill;
		if (mark.indexOf('<Fill>') !== -1) {
			fill = mark.substring(mark.indexOf('<Fill>') + 6, mark.indexOf("</Fill>"));
		}
		var fillColor;
		if (fill.indexOf('<CssParameter name="fill">') !== -1) {
			fillColor = fill.substring(fill.indexOf('<CssParameter name="fill">') + 26, fill.indexOf("</CssParameter>"));
		}
		var fillColorCode;
		var fillRGBColorCode;
		if (fillColor.indexOf("#") !== -1) {
			fillColorCode = fillColor.substring(fillColor.indexOf("#") + 1);
			fillRGBColorCode = gb.style.LayerStyle.decimalFromHex(fillColorCode);
		}
		fill = fill.substring(fill.indexOf("</CssParameter>") + 15);
		var fillOpacity;
		if (fill.indexOf('<CssParameter name="fill-opacity">') !== -1) {
			fillOpacity = fill.substring(fill.indexOf('<CssParameter name="fill-opacity">') + 34, fill.indexOf("</CssParameter>"));
		}

		obj["fillRGBA"] = "rgba(" + (!fillRGBColorCode ? "120,120,120" : fillRGBColorCode) + "," + (!fillOpacity ? "1" : fillOpacity) + ")";

		mark = mark.substring(mark.indexOf("</Fill>") + 7);
	}

	var stroke = symbol.substring(symbol.indexOf('<Stroke>') + 8, symbol.indexOf("</Stroke>"));
	var strokeColor;
	if (stroke.indexOf('<CssParameter name="stroke">') !== -1) {
		strokeColor = stroke.substring(stroke.indexOf('<CssParameter name="stroke">') + 28, stroke.indexOf("</CssParameter>"));

		var strokeColorCode;
		var strokeRGBColorCode;
		if (strokeColor.indexOf("#") !== -1) {
			strokeColorCode = strokeColor.substring(strokeColor.indexOf("#") + 1);
			strokeRGBColorCode = gb.style.LayerStyle.decimalFromHex(strokeColorCode);
		}
		stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
		var strokeOpacity;
		if (stroke.indexOf('<CssParameter name="stroke-opacity">') !== -1) {
			strokeOpacity = stroke
					.substring(stroke.indexOf('<CssParameter name="stroke-opacity">') + 36, stroke.indexOf("</CssParameter>"));
		}
		if (!!strokeOpacity) {
			stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
		}
		obj["strokeRGBA"] = "rgba(" + (!strokeRGBColorCode ? "120,120,120" : strokeRGBColorCode) + ","
				+ (!strokeOpacity ? "1" : strokeOpacity) + ")";

		var strokeWidth;
		if (stroke.indexOf('<CssParameter name="stroke-width">') !== -1) {
			strokeWidth = stroke.substring(stroke.indexOf('<CssParameter name="stroke-width">') + 34, stroke.indexOf("</CssParameter>"));
		}
		if (strokeWidth !== undefined) {
			obj["strokeWidth"] = strokeWidth;
		}

		stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
		var strokeDashArray;
		if (stroke.indexOf('<CssParameter name="stroke-dasharray">') !== -1) {
			strokeDashArray = stroke.substring(stroke.indexOf('<CssParameter name="stroke-dasharray">') + 38, stroke
					.indexOf("</CssParameter>"));
		}
		if (strokeDashArray !== undefined) {
			strokeDashArray = strokeDashArray.replace(/ /gi, ",");
			obj["strokeDashArray"] = strokeDashArray;
		}
		symbol = symbol.substring(symbol.indexOf("</Stroke>") + 9);
	}

	console.log(obj);
	return obj;
};

/**
 * SLD의 폴리곤 스타일 설정값을 추출한다.
 * 
 * @private
 * @method gb.style.LayerStyle#parsePolygonSymbolizer
 * @param {string}
 *            sld - 레이어의 SLD
 * @return {Object} 스타일 정보를 가진 객체
 */
gb.style.LayerStyle.prototype.parsePolygonSymbolizer = function(sld) {
	var obj = {};
	var pgSym = sld.substring(sld.indexOf("<PolygonSymbolizer>") + 19, sld.indexOf("</PolygonSymbolizer>"));
	console.log(pgSym);
	var fill = pgSym.substring(pgSym.indexOf('<Fill>') + 6, pgSym.indexOf("</Fill>"));
	console.log(fill);
	var fillColor;
	if (fill.indexOf('<CssParameter name="fill">') !== -1) {
		fillColor = fill.substring(fill.indexOf('<CssParameter name="fill">') + 26, fill.indexOf("</CssParameter>"));
	}
	console.log(fillColor);
	var fillColorCode;
	var fillRGBColorCode;
	if (fillColor.indexOf("#") !== -1) {
		fillColorCode = fillColor.substring(fillColor.indexOf("#") + 1);
		fillRGBColorCode = gb.style.LayerStyle.decimalFromHex(fillColorCode);
		console.log(fillRGBColorCode);
		console.log(fillColorCode);
	}
	fill = fill.substring(fill.indexOf("</CssParameter>") + 15);
	console.log(fill);
	var fillOpacity;
	if (fill.indexOf('<CssParameter name="fill-opacity">') !== -1) {
		fillOpacity = fill.substring(fill.indexOf('<CssParameter name="fill-opacity">') + 34, fill.indexOf("</CssParameter>"));
	}
	console.log(fillOpacity);
	if (fillRGBColorCode !== undefined && fillOpacity !== undefined) {
		obj["fillRGBA"] = "rgba(" + fillRGBColorCode + "," + fillOpacity + ")";
	}
	pgSym = pgSym.substring(pgSym.indexOf("</Fill>") + 7);
	console.log(pgSym);
	var stroke = pgSym.substring(pgSym.indexOf('<Stroke>') + 8, pgSym.indexOf("</Stroke>"));
	console.log(stroke);
	var strokeColor;
	if (stroke.indexOf('<CssParameter name="stroke">') !== -1) {
		strokeColor = stroke.substring(stroke.indexOf('<CssParameter name="stroke">') + 28, stroke.indexOf("</CssParameter>"));
	}
	var strokeColorCode;
	var strokeRGBColorCode;
	if (strokeColor.indexOf("#") !== -1) {
		strokeColorCode = strokeColor.substring(strokeColor.indexOf("#") + 1);
		strokeRGBColorCode = gb.style.LayerStyle.decimalFromHex(strokeColorCode);
		console.log(strokeRGBColorCode);
		console.log(strokeColorCode);
	}
	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeOpacity;
	if (stroke.indexOf('<CssParameter name="stroke-opacity">') !== -1) {
		strokeOpacity = stroke.substring(stroke.indexOf('<CssParameter name="stroke-opacity">') + 36, stroke.indexOf("</CssParameter>"));
	}
	console.log(strokeOpacity);

	if (!!strokeOpacity) {
		stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
		console.log(stroke);
	}

	if (strokeRGBColorCode !== undefined) {
		obj["strokeRGBA"] = "rgba(" + strokeRGBColorCode + "," + (!strokeOpacity ? "1" : strokeOpacity) + ")";
	}
	var strokeWidth;
	if (stroke.indexOf('<CssParameter name="stroke-width">') !== -1) {
		strokeWidth = stroke.substring(stroke.indexOf('<CssParameter name="stroke-width">') + 34, stroke.indexOf("</CssParameter>"));
	}
	if (strokeWidth !== undefined) {
		obj["strokeWidth"] = strokeWidth;
	}

	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeDashArray;
	if (stroke.indexOf('<CssParameter name="stroke-dasharray">') !== -1) {
		strokeDashArray = stroke
				.substring(stroke.indexOf('<CssParameter name="stroke-dasharray">') + 38, stroke.indexOf("</CssParameter>"));
	}
	if (strokeDashArray !== undefined) {
		strokeDashArray = strokeDashArray.replace(/ /gi, ",");
		obj["strokeDashArray"] = strokeDashArray;
	}

	pgSym = pgSym.substring(pgSym.indexOf("</Stroke>") + 9);
	console.log(pgSym);
	console.log(obj);
	return obj;
};
/**
 * SLD의 라인스트링 스타일 설정값을 추출한다.
 * 
 * @private
 * @method gb.style.LayerStyle#parseLineStringSymbolizer
 * @param {string}
 *            sld - 레이어의 SLD
 * @return {Object} 스타일 정보를 가진 객체
 */
gb.style.LayerStyle.prototype.parseLineSymbolizer = function(sld) {
	var obj = {};
	var lnSym = sld.substring(sld.indexOf("<LineSymbolizer>") + 16, sld.indexOf("</LineSymbolizer>"));
	console.log(lnSym);
	var stroke = lnSym.substring(lnSym.indexOf('<Stroke>') + 8, lnSym.indexOf("</Stroke>"));
	console.log(stroke);
	var strokeColor;
	if (stroke.indexOf('<CssParameter name="stroke">') !== -1) {
		strokeColor = stroke.substring(stroke.indexOf('<CssParameter name="stroke">') + 28, stroke.indexOf("</CssParameter>"));
	}
	var strokeColorCode;
	var strokeRGBColorCode;
	if (strokeColor.indexOf("#") !== -1) {
		strokeColorCode = strokeColor.substring(strokeColor.indexOf("#") + 1);
		strokeRGBColorCode = gb.style.LayerStyle.decimalFromHex(strokeColorCode);
		console.log(strokeRGBColorCode);
		console.log(strokeColorCode);
	}
	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeOpacity;
	if (stroke.indexOf('<CssParameter name="stroke-opacity">') !== -1) {
		strokeOpacity = stroke.substring(stroke.indexOf('<CssParameter name="stroke-opacity">') + 36, stroke.indexOf("</CssParameter>"));
	}
	console.log(strokeOpacity);
	if (strokeRGBColorCode !== undefined && strokeOpacity !== undefined) {
		obj["strokeRGBA"] = "rgba(" + strokeRGBColorCode + "," + strokeOpacity + ")";
	}
	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeWidth;
	if (stroke.indexOf('<CssParameter name="stroke-width">') !== -1) {
		strokeWidth = stroke.substring(stroke.indexOf('<CssParameter name="stroke-width">') + 34, stroke.indexOf("</CssParameter>"));
	}
	if (strokeWidth !== undefined) {
		obj["strokeWidth"] = strokeWidth;
	}

	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeDashArray;
	if (stroke.indexOf('<CssParameter name="stroke-dasharray">') !== -1) {
		strokeDashArray = stroke
				.substring(stroke.indexOf('<CssParameter name="stroke-dasharray">') + 38, stroke.indexOf("</CssParameter>"));
	}
	if (strokeDashArray !== undefined) {
		strokeDashArray = strokeDashArray.replace(/ /gi, ",");
		obj["strokeDashArray"] = strokeDashArray;
	}

	lnSym = lnSym.substring(lnSym.indexOf("</Stroke>") + 9);
	console.log(lnSym);
	console.log(obj);
	return obj;
};
/**
 * SLD의 포인트 스타일 설정값을 추출한다.
 * 
 * @private
 * @method gb.style.LayerStyle#parsePointSymbolizer
 * @param {string}
 *            sld - 레이어의 SLD
 * @return {Object} 스타일 정보를 가진 객체
 */
gb.style.LayerStyle.prototype.parsePointSymbolizer = function(sld) {
	var obj = {};
	var ptSym = sld.substring(sld.indexOf("<PointSymbolizer>") + 17, sld.indexOf("</PointSymbolizer>"));
	console.log(ptSym);
	var graphic = ptSym.substring(ptSym.indexOf('<Graphic>') + 9, ptSym.indexOf("</Graphic>"));
	var size;
	if (graphic.indexOf('<Size>') !== -1) {
		size = graphic.substring(graphic.indexOf('<Size>') + 6, graphic.indexOf("</Size>"));
		if (size !== undefined) {
			obj["pointSize"] = size;
		}
	}
	var mark;
	if (graphic.indexOf('<Mark>') !== -1) {
		mark = graphic.substring(graphic.indexOf('<Mark>') + 6, graphic.indexOf("</Mark>"));
	}
	var fill;
	if (mark.indexOf('<Fill>') !== -1) {
		fill = mark.substring(mark.indexOf('<Fill>') + 6, mark.indexOf("</Fill>"));
	}
	console.log(fill);
	var fillColor;
	if (fill.indexOf('<CssParameter name="fill">') !== -1) {
		fillColor = fill.substring(fill.indexOf('<CssParameter name="fill">') + 26, fill.indexOf("</CssParameter>"));
	}
	console.log(fillColor);
	var fillColorCode;
	var fillRGBColorCode;
	if (fillColor.indexOf("#") !== -1) {
		fillColorCode = fillColor.substring(fillColor.indexOf("#") + 1);
		fillRGBColorCode = gb.style.LayerStyle.decimalFromHex(fillColorCode);
		console.log(fillRGBColorCode);
		console.log(fillColorCode);
	}
	fill = fill.substring(fill.indexOf("</CssParameter>") + 15);
	console.log(fill);
	var fillOpacity;
	if (fill.indexOf('<CssParameter name="fill-opacity">') !== -1) {
		fillOpacity = fill.substring(fill.indexOf('<CssParameter name="fill-opacity">') + 34, fill.indexOf("</CssParameter>"));
	}
	console.log(fillOpacity);
	if (fillRGBColorCode !== undefined && fillOpacity !== undefined) {
		obj["fillRGBA"] = "rgba(" + fillRGBColorCode + "," + fillOpacity + ")";
	}
	mark = mark.substring(mark.indexOf("</Fill>") + 7);
	console.log(ptSym);
	var stroke = mark.substring(mark.indexOf('<Stroke>') + 8, mark.indexOf("</Stroke>"));
	console.log(stroke);
	var strokeColor;
	if (stroke.indexOf('<CssParameter name="stroke">') !== -1) {
		strokeColor = stroke.substring(stroke.indexOf('<CssParameter name="stroke">') + 28, stroke.indexOf("</CssParameter>"));
	}
	var strokeColorCode;
	var strokeRGBColorCode;
	if (strokeColor.indexOf("#") !== -1) {
		strokeColorCode = strokeColor.substring(strokeColor.indexOf("#") + 1);
		strokeRGBColorCode = gb.style.LayerStyle.decimalFromHex(strokeColorCode);
		console.log(strokeRGBColorCode);
		console.log(strokeColorCode);
	}
	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeOpacity;
	if (stroke.indexOf('<CssParameter name="stroke-opacity">') !== -1) {
		strokeOpacity = stroke.substring(stroke.indexOf('<CssParameter name="stroke-opacity">') + 36, stroke.indexOf("</CssParameter>"));
	}
	console.log(strokeOpacity);
	if (strokeRGBColorCode !== undefined && strokeOpacity !== undefined) {
		obj["strokeRGBA"] = "rgba(" + strokeRGBColorCode + "," + strokeOpacity + ")";
	}
	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeWidth;
	if (stroke.indexOf('<CssParameter name="stroke-width">') !== -1) {
		strokeWidth = stroke.substring(stroke.indexOf('<CssParameter name="stroke-width">') + 34, stroke.indexOf("</CssParameter>"));
	}
	if (strokeWidth !== undefined) {
		obj["strokeWidth"] = strokeWidth;
	}

	stroke = stroke.substring(stroke.indexOf("</CssParameter>") + 15);
	console.log(stroke);
	var strokeDashArray;
	if (stroke.indexOf('<CssParameter name="stroke-dasharray">') !== -1) {
		strokeDashArray = stroke
				.substring(stroke.indexOf('<CssParameter name="stroke-dasharray">') + 38, stroke.indexOf("</CssParameter>"));
	}
	if (strokeDashArray !== undefined) {
		strokeDashArray = strokeDashArray.replace(/ /gi, ",");
		obj["strokeDashArray"] = strokeDashArray;
	}

	mark = mark.substring(mark.indexOf("</Stroke>") + 9);
	console.log(ptSym);
	console.log(obj);
	return obj;
};

/**
 * 변경할 범례 icon을 설정한다.
 * 
 * @private
 * @method gb.style.LayerStyle#setLegend
 * @param {Object}
 *            obj - JSTree node 객체
 * @param {Object}
 *            settings - 범례 icon 정보
 */
gb.style.LayerStyle.prototype.setLegend = function(obj, settings) {
	this.jstreeNode = obj;
	this.legendInfo = settings;
}

/**
 * 범례 icon을 변경.
 * 
 * @private
 * @method gb.style.LayerStyle#updateLegend
 */
gb.style.LayerStyle.prototype.updateLegend = function() {
	if (!this.jstreeNode) {
		return;
	}

	var g = this.legendInfo;
	var layer = this.layer;
	var git = layer.get("git");

	if (layer instanceof ol.layer.Image) {
		return;
	}

	var fill = 'rgba(' + $(this.fillPicker).spectrum("get").toRgb().r + ', ' + $(this.fillPicker).spectrum("get").toRgb().g + ', '
			+ $(this.fillPicker).spectrum("get").toRgb().b + ', '
			+ (typeof $(this.fillPicker).spectrum("get").toRgb().a === "number" ? $(this.fillPicker).spectrum("get").toRgb().a : 1) + ')';
	var line = 'rgba(' + $(this.linePicker).spectrum("get").toRgb().r + ', ' + $(this.linePicker).spectrum("get").toRgb().g + ', '
			+ $(this.linePicker).spectrum("get").toRgb().b + ', '
			+ (typeof $(this.linePicker).spectrum("get").toRgb().a === "number" ? $(this.linePicker).spectrum("get").toRgb().a : 1) + ')';

	this.jstreeNode.icon = "gb-icon";
	this.jstreeNode.original.fillColor = fill;
	// this.jstreeNode.li_attr.fillColor = fill;
	this.jstreeNode.original.lineColor = line;
	// this.jstreeNode.li_attr.lineColor = line;

	otree.getJSTree().redraw_node(this.jstreeNode);
	this.setLegend(undefined, undefined);
}

/**
 * 스타일을 변경할 레이어를 설정한다.
 * 
 * @method gb.style.LayerStyle#setLayer
 * @param {ol.layer.Base}
 *            layer - 스타일을 변경할 레이어 객체
 */
gb.style.LayerStyle.prototype.setLayer = function(layer) {
	this.layer = layer;
	console.log(layer);
	var name = layer.get("name");
	this.setLayerName(name);
	var opacity = layer.getOpacity();
	$(this.opaPicker).val(opacity);
	$(this.opaFigure).empty();
	$(this.opaFigure).text(opacity);
	var git = layer.get("git");
	if (git !== undefined && git !== null) {
		this.geom = git.geometry;
	}

	var style = undefined;
	if (layer instanceof ol.layer.Vector) {
		style = layer.getStyle();
		if (style instanceof ol.style.Style || style instanceof Function) {
			if (style instanceof Function) {
				if (style() instanceof Array) {
					style = style()[0];
				} else if (style() instanceof ol.style.Style) {
					style = style();
				}
			}
			if (this.geom === "Point" || this.geom === "MultiPoint") {
				var image = style.getImage();
				if (image instanceof ol.style.RegularShape) {
					if (image instanceof ol.style.Circle) {
						var fill = image.getFill();
						var fillColor = fill.getColor();
						var stroke = image.getStroke();
						var strokeColor = stroke.getColor();
						var lineDash = stroke.getLineDash();
						var width = stroke.getWidth();
						var radius = image.getRadius();

						if (Array.isArray(fillColor)) {
							$(this.fillPicker).spectrum(
									"set",
									"rgba(" + fillColor[0] + ", " + fillColor[1] + ", " + fillColor[2] + ", "
											+ (fillColor[3] === undefined || fillColor[3] === null ? 1 : fillColor[3]) + ")");
						} else if (typeof fillColor === "string") {
						}
						if (Array.isArray(strokeColor)) {
							$(this.linePicker).spectrum(
									"set",
									"rgba(" + strokeColor[0] + ", " + strokeColor[1] + ", " + strokeColor[2] + ", "
											+ (strokeColor[3] === undefined || strokeColor[3] === null ? 1 : strokeColor[3]) + ")");
						} else if (typeof strokeColor === "string") {

						}
						$(this.widthInput).val(width);
						$(this.radInput).val(radius);

						var children = $(this.outlineInput).children();
						if (lineDash === undefined || lineDash === null) {
							for (var i = 0; i < children.length; i++) {
								if ($(children[i]).val() === "outline1") {
									$(this.outlineInput).val("outline1");
								}
							}
						} else if (Array.isArray(lineDash)) {
							var dashStr = lineDash.toString();
							for (var i = 0; i < children.length; i++) {
								if ($(children[i]).attr("dash") === dashStr) {
									$(this.outlineInput).val($(children[i]).val());
								}
							}
						}

					}
				}
			} else if (this.geom === "LineString" || this.geom === "MultiLineString") {
				var stroke = style.getStroke();
				var strokeColor = stroke.getColor();
				var lineDash = stroke.getLineDash();
				var width = stroke.getWidth();
				if (Array.isArray(strokeColor)) {
					$(this.linePicker).spectrum(
							"set",
							"rgba(" + strokeColor[0] + ", " + strokeColor[1] + ", " + strokeColor[2] + ", "
									+ (strokeColor[3] === undefined || strokeColor[3] === null ? 1 : strokeColor[3]) + ")");
				} else if (typeof strokeColor === "string") {

				}

				$(this.widthInput).val(width);
				$(this.radInput).val(radius);

				var children = $(this.outlineInput).children();
				if (lineDash === undefined || lineDash === null) {
					for (var i = 0; i < children.length; i++) {
						if ($(children[i]).val() === "outline1") {
							$(this.outlineInput).val("outline1");
						}
					}
				} else if (Array.isArray(lineDash)) {
					var dashStr = lineDash.toString();
					for (var i = 0; i < children.length; i++) {
						if ($(children[i]).attr("dash") === dashStr) {
							$(this.outlineInput).val($(children[i]).val());
						}
					}
				}
			} else if (this.geom === "Polygon" || this.geom === "MultiPolygon") {
				var fill = style.getFill();
				var fillColor = fill.getColor();
				var stroke = style.getStroke();
				var strokeColor = stroke.getColor();
				var lineDash = stroke.getLineDash();
				var width = stroke.getWidth();
				if (Array.isArray(strokeColor)) {
					$(this.linePicker).spectrum(
							"set",
							"rgba(" + strokeColor[0] + ", " + strokeColor[1] + ", " + strokeColor[2] + ", "
									+ (strokeColor[3] === undefined || strokeColor[3] === null ? 1 : strokeColor[3]) + ")");
				} else if (typeof strokeColor === "string") {
					$(this.linePicker).spectrum("set", strokeColor);
				}
				if (Array.isArray(fillColor)) {
					$(this.fillPicker).spectrum(
							"set",
							"rgba(" + fillColor[0] + ", " + fillColor[1] + ", " + fillColor[2] + ", "
									+ (fillColor[3] === undefined || fillColor[3] === null ? 1 : fillColor[3]) + ")");
				} else if (typeof fillColor === "string") {
					$(this.fillPicker).spectrum("set", fillColor);
				}

				$(this.widthInput).val(width);
				$(this.radInput).val(radius);

				var children = $(this.outlineInput).children();
				if (lineDash === undefined || lineDash === null) {
					for (var i = 0; i < children.length; i++) {
						if ($(children[i]).val() === "outline1") {
							$(this.outlineInput).val("outline1");
						}
					}
				} else if (Array.isArray(lineDash)) {
					var dashStr = lineDash.toString();
					for (var i = 0; i < children.length; i++) {
						if ($(children[i]).attr("dash") === dashStr) {
							$(this.outlineInput).val($(children[i]).val());
						}
					}
				}
			}
		} else {
			$(this.linePicker).spectrum("set", "rgb(0,0,0)");
			$(this.fillPicker).spectrum("set", "rgb(0,0,0)");
		}
	} else if (layer instanceof ol.layer.Tile) {
		var git = layer.get("git");
		if (git["fake"] === "parent") {
			return;
		}

		if (git.tempLayer) {
			style = git.tempLayer.getStyle();
			if (style instanceof Function) {
				style = style();
			}
		}

		var source = layer.getSource();
		var params = source.getParams();
		if (params.hasOwnProperty("SLD_BODY")) {
			var sld = params["SLD_BODY"];
			var parseSld = this.parseSymbolizer(sld);

			if (parseSld.hasOwnProperty("fillRGBA")) {
				$(this.fillPicker).spectrum("set", parseSld["fillRGBA"]);
			} else {
				$(this.fillPicker).spectrum("set", "rgba(0, 0, 0, 0)");
			}

			if (parseSld.hasOwnProperty("strokeRGBA")) {
				$(this.linePicker).spectrum("set", parseSld["strokeRGBA"]);
			}

			if (parseSld.hasOwnProperty("strokeWidth")) {
				$(this.widthInput).val(parseSld["strokeWidth"]);
			}

			if (parseSld.hasOwnProperty("pointSize")) {
				$(this.radInput).val(parseFloat(parseSld["pointSize"] / 2));
			} else {
				$(this.radInput).val(parseFloat(1));
			}

			if (parseSld.hasOwnProperty("strokeDashArray")) {
				$(this.outlineInput)
				var children = $(this.outlineInput).children();
				for (var i = 0; i < children.length; i++) {
					if ($(children[i]).attr("dash") === parseSld["strokeDashArray"]) {
						$(this.outlineInput).val($(children[i]).val());
					}
				}
			} else {
				$(this.outlineInput).val("outline1");
			}
		}
	}

	if (this.geom === "LineString" || this.geom === "MultiLineString") {
		$(this.fillArea).hide();
	} else {
		$(this.fillArea).show();
	}

	if (this.geom === "Point" || this.geom === "MultiPoint") {
		$(this.radArea).show();
	} else {
		$(this.radArea).hide();
	}

	if (layer instanceof ol.layer.Image) {
		$(this.fillArea).hide();
		$(this.radArea).hide();
		$(this.outlineArea).hide();
		$(this.widthArea).hide();
		$(this.lineArea).hide();
	} else {
		$(this.outlineArea).show();
		$(this.widthArea).show();
		$(this.lineArea).show();
	}

	if (git instanceof Object) {
		if (git.labelActive) {
			this.checkboxInput.prop("checked", true);
		} else {
			this.checkboxInput.prop("checked", false);
		}
		this.checkboxInput.trigger("change");
	}

	/*
	 * if(gb.module.isEditing.get()){ this.checkboxDiv.css("display", "block"); }
	 * else { this.checkboxDiv.css("display", "none"); }
	 */
};
/**
 * 패널에 레이어 이름을 표시한다.
 * 
 * @method gb.style.LayerStyle#setLayerName
 * @param {string}
 *            name - 표시할 레이어의 이름
 */
gb.style.LayerStyle.prototype.setLayerName = function(name) {
	$(this.layerName).text(name);
	$(this.layerName).attr("title", name);
};
/**
 * 스타일 편집중인 레이어를 반환한다.
 * 
 * @method gb.style.LayerStyle#getLayer
 * @return {ol.layer.Base} 스타일 편집중인 레이어 객체
 */
gb.style.LayerStyle.prototype.getLayer = function() {
	return this.layer;
};