var gb;
if (!gb)
	gb = {};
if (!gb.edit)
	gb.edit = {};

gb.edit.ACTIVEAREA = 7.75;
/**
 * @classdesc
 * 피처 편집 기능을 정의한다.
 * 필수 라이브러리: jQuery, fontawesome, openlayers, {@link gb.header.HeaderBase}
 * @example
 * <head>
 * <script src="https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/build/ol.js"></script>
 * <link rel="stylesheet" href="https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/css/ol.css" type="text/css">
 * <link rel="stylesheet" href="./gb/css/gb.css">
 * <script src="./gb/gb.js"></script>
 * <script src="./gb/map/map.js"></script>
 * <%-- jsTree openlayers3--%>
 * <script type="text/javascript" src="./jsTree-openlayers3/jstree.js"></script>
 * <link rel="stylesheet" type="text/css" href="./jsTree-openlayers3/themes/default/style.css" />
 * <script type="text/javascript" src="./jsTree-openlayers3/jstree-visibility.js"></script>
 * <script type="text/javascript" src="./jsTree-openlayers3/jstree-layerproperties.js"></script>
 * <script type="text/javascript" src="./jsTree-openlayers3/jstree-legends.js"></script>
 * <script type="text/javascript" src="./jsTree-openlayers3/jstree-functionmarker.js"></script>
 * <!-- gb.tree.openlayers -->
 * <script src="./gb/tree/openlayers.js"></script>
 * <!-- gb.edit -->
 * <script src="./gb/edit/edithistory.js"></script>
 * <script src="./gb/edit/undo.js"></script>
 * <!-- gb.header -->
 * <script src="./gb/header/base.js"></script>
 * <script src="./gb/header/editingtool.js"></script>
 * <title>OpenGDS/Builder example</title>
 * </head>
 * 
 * <body>
 * <div class="builderLayer">
 *   <div class="builderLayerClientPanel"></div>
 * </div>
 * <div class="bind"></div>
 * 
 * <script type="text/javascript">
 *   var gbMap = new gb.Map({
 *     "target" : $(".bind")[0] // Openlayers Map을 생성할 HTML Element 객체
 *   });
 *   
 *   var otree = new gb.tree.OpenLayers({
 *     "append" : $(".builderLayerClientPanel")[0], // Openlayers Tree를 생성할 HTML Element 객체
 *     "map" : gbMap.getUpperMap()
 *   });
 *   
 *   var temp = new gb.header.EditingTool({
 *     targetElement : gbMap.getLowerDiv(), // EditingTool 메뉴바를 생성할 Div의 jQuery객체
 *     map : gbMap.getUpperMap(), // ol.Map 객체
 *     otree : otree,
 *     featureRecord : new gb.edit.FeatureRecord(), // feature의 변경사항을 저장하는 객체
 *     locale : "en", // 언어 설정
 *     isEditing : gb.module.isEditing // EditingTool 활성화시 다른 작업을 제한하는 모듈
 *   });
 * </script>
 * </body>
 * @class gb.edit.EditingTool
 * @requires {@link gb.header.HeaderBase}
 * @memberof gb.edit
 * @param {Object}
 *            obj - 생성자 옵션
 * @param {ol.Map}
 *            obj.map - 편집 기능을 적용할 Openlayers Map 객체
 * @param {gb.edit.FeatureRecord}
 *            [obj.featureRecord] - feature 편집 이력을 관리하는 객체
 * @param {gb.tree.OpenLayers}
 *            obj.otree - gb.tree.OpenLayers 객체와 EditingTool 객체를 연동. OpenLayer Tree의 레이어들을 편집
 * @param {string}
 *            obj.layerInfo - Geoserver 레이어 정보 요청 URL
 * @param {gb.versioning.Feature}
 *            [obj.versioning] - 버저닝 객체
 * @param {gb.module.isEditing}
 *            [obj.isEditing] - EditingTool 작업 실행 중 다른 작업 제한 기능을 하는 모듈
 * @param {string}
 *            obj.wfsURL - Geoserver WFS 요청 URL
 * @param {string}
 *            [obj.locale="en"] - 언어 코드
 * @author KIM HOCHUL
 * @date 2019. 03. 18
 * @version 0.01
 */
gb.edit.EditingTool = function(obj) {
	var that = this;
	this.translation = {
		"notSupportHistory" : {
			"en" : "This layer is not support feature history",
			"ko" : "피처 이력을 지원하지 않는 레이어 입니다."
		},
		"alertSelectFeature" : {
			"en" : "you should select Feature",
			"ko" : "피처를 선택해 주세요."
		},
		"alertSelectOneLayer" : {
			"en" : "you must select only one Layer",
			"ko" : "레이어는 하나만 선택해야 합니다."
		},
		"returnMustArray" : {
			"en" : "The return type must be an array",
			"ko" : "리턴 객체는 배열이어야 합니다"
		},
		"editToolHint" : {
			"en" : "Please zoom in to edit",
			"ko" : "편집하시려면 확대해주세요"
		},
		"changes" : {
			"en" : "Changes",
			"ko" : "변경이력"
		},
		"add" : {
			"ko" : "추가",
			"en" : "Add"
		},
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"delete" : {
			"ko" : "삭제",
			"en" : "Delete"
		},
		"deleteFeature" : {
			"ko" : "객체 삭제",
			"en" : "Delete Feature"
		},
		"notNullHint" : {
			"ko" : "빈 값이 허용되지않습니다.",
			"en" : "null values ​​are not allowed."
		},
		"valueHint" : {
			"ko" : "타입에 맞게 값을 입력해야합니다.",
			"en" : "You must enter a value for the type."
		},
		"tempLayer" : {
			"ko" : "Move 임시레이어",
			"en" : "Move temporary layer"
		},
		"deleteFeaturesHint" : {
			"ko" : "선택한 객체들을 정말로 삭제하시겠습니까?",
			"en" : "Are you sure you want to delete the selected features?"
		},
		"selectFeatureNum" : {
			"ko" : "선택된 객체 수",
			"en" : "Number of selected features"
		},
		"transformPointHint" : {
			"ko" : "Point객체는 변환 기능을 사용할 수 없습니다.",
			"en" : "Point objects can not use the transform function."
		},
		"requiredOption" : {
			"ko" : "은 필수 입력항목입니다.",
			"en" : "is a required field."
		}
	};
	
	gb.header.HeaderBase.call(this, obj);
	
	/**
	 * 현재 편집중인 레이어
	 * @private
	 * @type {ol.layer.Base}
	 */
	this.layer = undefined;
	
	/**
	 * 선택된 객체들의 집합
	 * @private
	 * @type {ol.Collection.<ol.Feature>}
	 */
	this.selected = undefined;
	
	/**
	 * 현재 편집중인 레이어의 Source 객체
	 * @private
	 * @type {ol.source.TileSource|ol.source.Vector}
	 */
	this.selectedSource = undefined;
	
	/**
	 * 현재 편집중인 Source 객체들의 집합
	 * @private
	 * @type {ol.Collection.<ol.source.Vector>}
	 */
	this.selectSources = new ol.Collection();
	
	/**
	 * Geoserver로부터 import된 레이어들의 Vector Source 객체 집합
	 * @private
	 * @type {Object.<string, ol.source.Vector>}
	 */
	this.vectorSourcesOfServer_ = {};
	
	/**
	 * 벡터 레이어들의 Vector Source 객체 집합
	 * @private
	 * @type {Object.<string, ol.source.Vector>}
	 */
	this.vectorSourcesOfVector_ = {};
	
	/**
	 * 객체 복사, 붙여넣기 기능 모듈
	 * @private
	 * @type {gb.interaction.Copypaste}
	 */
	this.copyPaste_ = undefined;
	
	/**
	 * Snap 기능 활성화를 위한 Vector Source 객체
	 * @private
	 * @type {ol.source.Vector}
	 */
	this.snapSource = new ol.source.Vector();

	/**
	 * Snap 기능을 적용할 Vector Layer들의 집합
	 * @private
	 * @type {ol.Collection.<ol.layer.Vector>}
	 */
	this.snapVector = new ol.Collection();

	/**
	 * Move 기능을 적용할 Feature 객체들의 집합
	 * @private
	 * @type {ol.Collection.<ol.Feature>}
	 */
	this.features = new ol.Collection();
	
	/**
	 * Move 기능 활성화를 위한 Vector Source 객체
	 * @private
	 * @type {ol.source.Vector}
	 */
	this.tempSource = new ol.source.Vector({
		features : this.features
	});
	
	/**
	 * Move 기능 활성화를 위한 Vector Layer 객체
	 * @private
	 * @type {ol.layer.Vector}
	 */
	this.tempVector = new ol.layer.Vector({
		renderMode: "vector",
		source : this.tempSource
	});
	this.tempVector.set("name", this.translation.tempLayer[this.locale]);
	
	
//	this.managed = new ol.layer.Vector({
//		renderMode: "vector",
//		source : this.tempSource
//	});
//	this.managed.set("name", "temp_vector");
//	this.managed.set("id", "temp_vector");
	
	/**
	 * Feature 객체 강조 표시를 위한 Openlayers Style 객체 배열
	 * @private
	 * @type {Array.<ol.style.Style>}
	 */
	this.highlightStyles1 = [ new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'rgba(255,0,0,1)',
			width : 2
		})
	}), new ol.style.Style({
		image : new ol.style.Circle({
			radius : 10,
			stroke : new ol.style.Stroke({
				color : 'rgba(255,0,0,1)',
				width : 2
			})
		})
	}) ];

	/**
	 * Feature 객체 강조 표시를 위한 Openlayers Style 객체 배열
	 * @private
	 * @type {Array.<ol.style.Style>}
	 */
	this.highlightStyles2 = [ new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'rgba(0, 0, 255, 1)',
			width : 2
		})
	}), new ol.style.Style({
		image : new ol.style.Circle({
			radius : 10,
			stroke : new ol.style.Stroke({
				color : 'rgba(0, 0, 255, 1)',
				width : 2
			})
		})
	}) ];

	/**
	 * 선택된 Feature 객체 스타일 변경을 위한 Openlayers Style 객체 배열
	 * @private
	 * @type {Array.<ol.style.Style>}
	 */
	this.selectedStyles = [ new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : 'rgba(0,153,255,1)',
			width : 2
		}),
		fill : new ol.style.Fill({
			color : 'rgba(255, 255, 255, 0.5)'
		})
	}), new ol.style.Style({
		image : new ol.style.Circle({
			radius : 10,
			fill : new ol.style.Fill({
				color : 'rgba(0,153,255,0.4)'
			})
		}),
		geometry : function(feature) {
			var coordinates;
			var geom;

			if (feature.getGeometry() instanceof ol.geom.MultiPolygon) {
				coordinates = feature.getGeometry().getCoordinates()[0][0];
				geom = new ol.geom.MultiPoint(coordinates);
			} else if (feature.getGeometry() instanceof ol.geom.Polygon) {
				coordinates = feature.getGeometry().getCoordinates()[0];
				geom = new ol.geom.MultiPoint(coordinates);
			} else if (feature.getGeometry() instanceof ol.geom.MultiLineString) {
				coordinates = feature.getGeometry().getCoordinates()[0];
				geom = new ol.geom.MultiPoint(coordinates);
			} else if (feature.getGeometry() instanceof ol.geom.LineString) {
				coordinates = feature.getGeometry().getCoordinates();
				geom = new ol.geom.MultiPoint(coordinates);
			} else if (feature.getGeometry() instanceof ol.geom.MultiPoint) {
				coordinates = feature.getGeometry().getCoordinates();
				geom = new ol.geom.MultiPoint(coordinates);
			} else if (feature.getGeometry() instanceof ol.geom.Point) {
				coordinates = [ feature.getGeometry().getCoordinates() ];
				geom = new ol.geom.MultiPoint(coordinates);
			}
			return geom;
		}
	}) ];
	
	/**
	 * Interval 함수의 ID
	 * @private
	 * @type {number}
	 */
	this.interval = undefined;
	
	/**
	 * Interval 함수의 지연시간을 위한 변수
	 * @private
	 * @type {number}
	 */
	this.count = 1;
	
	/**
	 * EditingTool 작업표시줄에 표현될 HTMLElement 객체들의 집합
	 * @private
	 * @type {Object.<string, HTMLElement>}
	 */
	this.btn = {
			selectBtn : undefined,
			drawBtn : undefined,
			moveBtn : undefined,
			rotateBtn : undefined,
			modiBtn : undefined,
			delBtn : undefined
	};
	
	/**
	 * EditingTool 작업 상태 집합
	 * @private
	 * @type {Object.<string, boolean>}
	 */
	this.isOn = {
			select : false,
			draw : false,
			move : false,
			remove : false,
			modify : false,
			rotate : false,
			snap : false
	};
	
	/**
	 * EditingTool 기본 interaction 집합
	 * @private
	 * @type {Object.<string, ol.interaction.Interaction>}
	 */
	this.interaction = {
			select : undefined,
			dragbox : undefined,
			draw : undefined,
			updateDraw : undefined,
			move : undefined,
			rotate : undefined,
			modify : undefined,
			snap : undefined,
			remove : undefined
	};
	
	/**
	 * 사용자가 추가한 Interaction 객체의 집합
	 * @private
	 * @type {Array.<Object>}
	 */
	this.customInteractions = [];
	
	var options = obj ? obj : {};
	this.locale = options.locale || "en";
	this.map = options.map ? options.map : undefined;
	if(!this.map){
		console.error("gb.edit.EditingTool: 'map'" + this.translation.requiredOption[this.locale]);
	}
	this.layerInfo = options.layerInfo ? options.layerInfo : undefined;
	if(!this.layerInfo){
		console.error("gb.edit.EditingTool: 'layerInfo'" + this.translation.requiredOption[this.locale]);
	}
	this.wfsURL = options.wfsURL ? options.wfsURL : undefined;
	if(!this.wfsURL){
		console.error("gb.edit.EditingTool: 'wfsURL'" + this.translation.requiredOption[this.locale]);
	}
	this.otree = options.otree ? options.otree : undefined;
	if(!this.otree){
		console.error("gb.edit.EditingTool: 'otree'" + this.translation.requiredOption[this.locale]);
	}
	this.treeElement = this.otree ? this.otree.getJSTreeElement() : undefined;
	this.featureRecord = options.featureRecord ? options.featureRecord : undefined;
	this.versioningFeature = options.versioning instanceof gb.versioning.Feature ? options.versioning : undefined; 
	this.isEditing = options.isEditing instanceof Object ? options.isEditing : undefined;
	
	this.otree.setEditingTool(this);
	
	// EditingTool 작업 표시줄 기본 항목
	var defaultList = [
		{
			content: "draw",
			icon: "fas fa-pencil-alt fa-lg",
			clickEvent: function(){
				console.log("draw");
				that.draw();
			},
			color: ""
		},
		{
			content: "move",
			icon: "fas fa-arrows-alt fa-lg",
			clickEvent: function(){
				console.log("move");
				that.move();
			},
			color: ""
		},
		{
			content: "rotate",
			icon: "fas fa-object-ungroup fa-lg",
			clickEvent: function(){
				console.log("rotate");
				that.rotate();
			},
			color: ""
		},
		{
			content: "modify",
			icon: "fas fa-wrench fa-lg",
			clickEvent: function(){
				console.log("modify");
				that.modify();
			},
			color: ""
		},
		{
			content: "delete",
			icon: "fas fa-eraser fa-lg",
			clickEvent: function(){
				console.log("remove");
				that.remove();
			},
			color: ""
		},
		{
			content: "undo",
			icon: "fas fa-undo-alt fa-lg",
			clickEvent: function(){
				gb.undo.undo();
				console.log("execute undo");
			}
		},
		{
			content: "redo",
			icon: "fas fa-redo-alt fa-lg",
			clickEvent: function(){
				gb.undo.redo();
				console.log("execute redo");
			}
		}
		];

	// header element 생성
	this.createContent(defaultList);
	if(!this.isDisplay){
		this.closeTool();
	}

	// this.createContent() 함수 실행 이후 this.contentList 배열안에 content list들의 <a>
	// tag element가 저장됨
	// gb.header.HeaderBase 함수 참조
	var eventList = this.contentList;
	var match = {
			"select": "selectBtn",
			"move": "moveBtn",
			"draw": "drawBtn",
			"rotate": "rotateBtn",
			"modify": "modiBtn",
			"delete": "delBtn"
	}
	for(var i in eventList){
		if(eventList[i].text()){
			this.btn[match[eventList[i].data("content").toLowerCase()]] = eventList[i];
		}
	}

	$("body").append(this.panel);

	var fth1 = $("<th>").text("Index");
	var fth2 = $("<th>").text("Description");
	var ftr = $("<tr>").append(fth1).append(fth2);
	var fhd = $("<thead>").append(ftr);
	this.featureTB = $("<tbody>");
	var ftb = $("<table>").addClass("gb-table").append(fhd).append(this.featureTB);

	this.featurePop = new gb.panel.PanelBase({
		"width" : "240px",
		"positionX" : 384,
		"positionY" : 150,
		"autoOpen" : false,
		"body" : ftb
	});

	$(this.featurePop.getPanel()).find(".gb-panel-body").css({
		"max-height" : "300px",
		"overflow-y" : "auto"
	});
	
	var ath1 = $("<th>").text("Name");
	var ath2 = $("<th>").text("Type");
	var ath3 = $("<th>").text("Value");
	var atr = $("<tr>").append(ath1).append(ath2).append(ath3);
	var ahd = $("<thead>").append(atr);
	this.attrTB = $("<tbody>");
	var atb = $("<table>").addClass("gb-table").append(ahd).append(this.attrTB);
	this.attrPop = new gb.panel.PanelBase({
		"width" : "300px",
		"positionX" : 384,
		"positionY" : 150,
		"autoOpen" : false,
		"body" : atb
	});
	$(this.attrPop.getPanel()).find(".gb-panel-body").css({
		"max-height" : "400px",
		"overflow-y" : "auto"
	});

	this.map.on('postcompose', function(evt) {
		that.map.getInteractions().forEach(function(interaction) {
			if (interaction instanceof gb.interaction.MultiTransform) {
				if (interaction.getFeatures().getLength() && interaction.getActive()) {
					interaction.drawMbr(evt);
				}
			}
		});
	});

	var preventReload = true;
	var firstLoad = true;
	this.map.on('moveend', function(evt){
		that.loadSnappingLayer(this.getView().calculateExtent(this.getSize()));

		var map = evt.target;
		var view = map.getView();
		var extent = view.calculateExtent();
		var zoom = view.getZoom();

		if(that.getActiveTool()){
			if(that.checkActiveTool() && firstLoad){
				preventReload = false;
				firstLoad = false;
			} else if(!that.checkActiveTool() && firstLoad){
				preventReload = true;
				firstLoad = false;
			}
			
			if(that.checkActiveTool() && !preventReload){
				that.loadWFS_();
				that.loadVector_();
				that.displayEditZoomHint(false);
				preventReload = true;
			} else if(!that.checkActiveTool() && preventReload) {
				that.setVisibleWFS(false);
				that.setVisibleVectorVector(false);
				that.displayEditZoomHint(true);
				preventReload = false;
			}
		} else {
			preventReload = false;
		}
	});

	this.treeElement.on("changed.jstreeol3", function(e, data){
		if(that.getActiveTool()){
			if(that.checkActiveTool()){
				if(data.selected.length === 1){
					that.select(that.updateSelected());
				}
			}
		}
	});

	this.treeElement.on("delete_node_layer.jstreeol3", function(e, data){
		var id = data.node.id;
		var source = that.getVectorSourceOfServer(id);
		if(!!source){
			source.get("git").tempLayer.setMap(null);
			source.clear();
			delete that.vectorSourcesOfServer_[id];
		}
		
		source = that.getVectorSourceOfVector(id);
		if(!!source){
			source.get("git").tempLayer.setMap(null);
			source.clear();
			delete that.vectorSourcesOfVector_[id];
		}
//		if(that.customVector_[id]){
//			that.customVector_[id].get("git").tempLayer.setVisible(false);
//			delete that.customVector_[id];
//		}
		that.refreshTileLayer();
	});

	// SOYIJUN
	if (this.getVersioningFeature() instanceof gb.versioning.Feature) {
		console.log($(that.treeElement).jstreeol3("get_selected_layer"));
		this.getVersioningFeature().setEditingTool(this);
		console.log(this.ulTagRight);
		var iTag = $("<i>").addClass("fas").addClass("fa-history").attr("aria-hidden", "true").css(this.iStyle);
		var aTag = $("<a>").attr("href", "#").append(iTag).append(this.translation.changes[this.locale]).css(this.aStyle).click(function(){
			that.toggleFeatureHistoryModal();
		});
		aTag.hover(function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "#23527c");
				$(this).css("text-decoration", "none");
			}
		},function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "rgb(85, 85, 85)");
			}
		});
		var liTag = $("<li>").append(aTag).css(this.liStyle);
		liTag.css("padding-left", "0").css("padding-right", "20px");
		$(this.ulTagRight).append(liTag);
	}
};
gb.edit.EditingTool.prototype = Object.create(gb.header.HeaderBase.prototype);
gb.edit.EditingTool.prototype.constructor = gb.edit.EditingTool;

/**
 * 피처 변경 이력창을 생성한다.
 * 
 * @method gb.edit.EditingTool#toggleFeatureHistoryModal
 * @function
 * @param {ol.Feature}
 *            feature - 변경 이력창을 생성할 Feature 객체
 */
gb.edit.EditingTool.prototype.toggleFeatureHistoryModal = function(feature) {
	var vfeature = this.getVersioningFeature();
	var layers = $(this.treeElement).jstreeol3("get_selected_layer");
	if (layers.length !== 1) {
		return;
	}
	var layer = layers[0];
	var git = layer.get("git");
	if (git !== undefined) {
		if (!(git.hasOwnProperty("geogigRepo") && git.hasOwnProperty("geogigBranch"))) {
			alert(this.translation.notSupportHistory[this.locale]);
			return;
		}
	} else {
		alert(this.translation.notSupportHistory[this.locale]);
		return;
	}
	if ($(vfeature.getPanel().getPanel()).css("display") !== "none") {
		vfeature.close();
	} else {
		var nfeature = feature instanceof ol.Feature ? feature : this.interaction.select !== undefined ? this.interaction.select.getFeatures().getLength() === 1 ? this.interaction.select.getFeatures().item(0) : undefined : undefined;
// this.interaction.select.getFeatures().getLength() === 1 ?
// this.interaction.select.getFeatures().item(0) : undefined;
		if (nfeature === undefined) {
			alert(this.translation.alertSelectFeature[this.locale]);
			return;
		}
		if (layers.length === 1 && nfeature) {
			var layer = layers[0];
			console.log(layer);
			var git = layer.get("git");
			console.log(git);
			var geoserver = git.geoserver;
			console.log(geoserver);
			var repo = git.geogigRepo;
			console.log(repo);
			var branch = git.geogigBranch;
			console.log(branch);	
			var layerName = layer.get("name");
			console.log(layerName);
			console.log(feature);
			var path = layerName+"/"+nfeature.getId();
			console.log(path);
// vfeature.open();
			if (vfeature !== undefined) {
// if (vfeature !== undefined && branch === "master") {
				if (geoserver+"/"+repo+"/"+path !== vfeature.getIDString()) {

					vfeature.setServer(geoserver);
					vfeature.setRepo(repo);
					vfeature.setPath(path);
					vfeature.setFeature(nfeature);
					vfeature.refresh();

				} else {
					vfeature.refresh();
				}
				vfeature.open();
			}
		} else {
			alert(this.translation.alertSelectFeature[this.locale]);
			return;
		}
	}
};
/**
 * 피처 변경 이력창을 업데이트한다.
 * 
 * @method gb.edit.EditingTool#updateFeatureHistoryModal
 * @function
 * @param {ol.Feature}
 *            feature - 변경 이력창을 업데이트할 Feature 객체
 */
gb.edit.EditingTool.prototype.updateFeatureHistoryModal = function(feature) {
	var vfeature = this.getVersioningFeature();
	var layers = $(this.treeElement).jstreeol3("get_selected_layer");
	var feature = feature instanceof ol.Feature ? feature : this.interaction.select.getFeatures().getLength() === 1 ? this.interaction.select.getFeatures().item(0) : undefined;
	if (layers.length === 1 && feature) {
		var layer = layers[0];
		console.log(layer);
		var git = layer.get("git");
		console.log(git);
		var geoserver = git.geoserver;
		console.log(geoserver);
		var repo = git.geogigRepo;
		console.log(repo);
		var branch = git.geogigBranch;
		console.log(branch);	
		var layerName = layer.get("name");
		console.log(layerName);
		console.log(feature);
		var path = layerName+"/"+feature.getId();
		console.log(path);

		if (vfeature !== undefined) {
// if (vfeature !== undefined && branch === "master") {
			vfeature.open();
			if (geoserver+"/"+repo+"/"+path !== vfeature.getIDString()) {
				vfeature.setServer(geoserver);
				vfeature.setRepo(repo);
				vfeature.setPath(path);
				vfeature.setFeature(feature);
				vfeature.refresh();
			} else {
				vfeature.refresh();
			}
		} else {
			if ($(vfeature.getPanel().getPanel()).css("display") !== "none") {
				vfeature.close();	
			}
		}
	}
};

/**
 * gb.versioning.Feature 객체를 반환한다.
 * 
 * @method gb.edit.EditingTool#getVersioningFeature
 * @function
 * @return {gb.versioning.Feature} 버저닝 객체
 */
gb.edit.EditingTool.prototype.getVersioningFeature = function() {
	return this.versioningFeature;
};
/**
 * 내부 Interaction 객체 집합을 반환한다.
 * 
 * @method gb.edit.EditingTool#getInteractions_
 * @function
 * @return {Object.<string, ol.interaction.Interaction>}
 */
gb.edit.EditingTool.prototype.getInteractions_ = function() {
	return this.interaction;
};
/**
 * 특정 내부 인터랙션을 반환한다.
 * 
 * @method gb.edit.EditingTool#getInteraction_
 * @function
 * @param {string}
 *            key - interaction name
 * @return {ol.interaction.Interaction}
 */
gb.edit.EditingTool.prototype.getInteraction_ = function(key) {
	return this.interaction[key];
};
/**
 * 내부 인터랙션 구조를 설정한다.
 * 
 * @method gb.edit.EditingTool#setInteraction_
 * @function
 * @param {String}
 *            key - interaction name
 * @param {ol.interaction.Interaction}
 *            val - interaction 객체
 */
gb.edit.EditingTool.prototype.setInteraction_ = function(key, val) {
	this.interaction[key] = val;
};

/**
 * 편집중인 레이어를 반환한다.
 * 
 * @method gb.edit.EditingTool#getLayer
 * @function
 * @return {ol.layer.Base}
 */
gb.edit.EditingTool.prototype.getLayer = function() {
	return this.layer;
};

/**
 * Interaction을 활성화 시킨다.
 * 
 * @method gb.edit.EditingTool#activeIntrct_
 * @function
 * @param {String|Array<String>}
 *            intrct - interaction 이름 또는 interaction 이름의 배열
 */
gb.edit.EditingTool.prototype.activeIntrct_ = function(intrct) {
	// var that = this;
	// var keys = Object.keys(this.getInteractions_());
	// for (var i = 0; i < keys.length; i++) {
	// if (this.getInteraction_(keys[i])) {
	// this.getInteraction_(keys[i]).setActive(false);
	// }
	// }
	if (Array.isArray(intrct)) {
		for (var j = 0; j < intrct.length; j++) {
			this.getInteraction_(intrct[j]).setActive(true);
			if (intrct[j] === "select" || intrct[j] === "dragbox") {
				this.isOn["select"] = true;
			} else {
				this.isOn[intrct[j]] = true;
			}
		}
	} else if (typeof intrct === "string") {
		this.getInteraction_(intrct).setActive(true);
		if (intrct === "select" || intrct[j] === "dragbox") {
			this.isOn["select"] = true;
		} else {
			this.isOn[intrct] = true;
		}
	}
};
/**
 * 해당 인터랙션을 비활성화 시킨다.
 * 
 * @method gb.edit.EditingTool#deactiveIntrct_
 * @function
 * @param {String|Array<String>}
 *            intrct - interaction 이름 또는 interaction 이름의 배열
 */
gb.edit.EditingTool.prototype.deactiveIntrct_ = function(intrct) {
	var selectInter = true;
	if (Array.isArray(intrct)) {
		for (var j = 0; j < intrct.length; j++) {
			if (!!this.interaction[intrct[j]]) {
				this.interaction[intrct[j]].setActive(false);
			}
			if (intrct[j] === "select" || intrct[j] === "dragbox") {
				this.isOn["select"] = false;
				this.featurePop.close();
				selectInter = false;
			} else {
				this.isOn[intrct[j]] = false;
//				this.map.removeLayer(this.managed);
			}
		}
	} else if (typeof intrct === "string") {
		if (!!this.interaction[intrct]) {
			this.interaction[intrct].setActive(false);
		}
		if (intrct === "select" || intrct === "dragbox") {
			this.isOn["select"] = false;
		} else {
			this.isOn[intrct] = false;
//			this.map.removeLayer(this.managed);
		}

		if (intrct !== "select" && intrct !== "dragbox") {
			for(var i in this.interaction){
				if(!!this.interaction[i]){
					if(this.interaction[i].getActive()){
						selectInter = false;
						break;
					}
				}
			}
		}
	}

	if(selectInter){
		this.getInteraction_("select").setActive(true);
		this.getInteraction_("dragbox").setActive(true);
		this.isOn["select"] = true;
	}

	for(var i in this.customInteractions){
		this.customInteractions[i].setActive(false);
	}

	if(!!this.selectedSource){
		this.map.removeLayer(this.tempVector);
		if(this.getActiveTool()){
			this.selectedSource.get("git").tempLayer.setMap(this.map);
		} else {
			this.selectedSource.get("git").tempLayer.setMap(null);
		}
	}

//	this.map.removeLayer(this.managed);
};
/**
 * 버튼 Tag를 활성화된 상태의 Style로 변경한다.
 * 
 * @method gb.edit.EditingTool#activeBtn_
 * @function
 * @param {String}
 *            btn - 활성화할 버튼의 이름
 */
gb.edit.EditingTool.prototype.activeBtn_ = function(btn) {
	if(!this.btn[btn]){
		return;
	}
	if (!this.btn[btn].hasClass("active")) {
		this.btn[btn].addClass("active");
		this.btn[btn].css("border-bottom", "2px solid #4B5A6A");
		this.btn[btn].css("color", "#23527c");
	}
	var keys = Object.keys(this.btn);
	for (var i = 0; i < keys.length; i++) {
		if (keys[i] !== btn && !!this.btn[keys[i]]) {
			if (this.btn[keys[i]].hasClass("active")) {
				this.btn[keys[i]].removeClass("active");
				this.btn[keys[i]].css("border-bottom", "none");
				this.btn[keys[i]].css("color", "rgb(85, 85, 85)");
			}
		}
	}
};
/**
 * 버튼 Tag를 비활성화된 상태의 Style로 변경한다.
 * 
 * @method gb.edit.EditingTool#deactiveBtn_
 * @function
 * @param {String}
 *            btn - 비활성화할 버튼의 이름
 */
gb.edit.EditingTool.prototype.deactiveBtn_ = function(btn) {
	if (this.btn[btn].hasClass("active")) {
		this.btn[btn].removeClass("active");
		this.btn[btn].css("border-bottom", "none");
		this.btn[btn].css("color", "rgb(85, 85, 85)");
	}
};

/**
 * 모든 작업 버튼을 비활성화 상태로 변경한다.
 * 
 * @method gb.edit.EditingTool#deactiveAllBtn_
 * @function
 */
gb.edit.EditingTool.prototype.deactiveAllBtn_ = function() {
	for(var btn in this.btn){
		if(this.btn[btn] === undefined){
			continue;
		}
		if (this.btn[btn].hasClass("active")) {
			this.btn[btn].removeClass("active");
			this.btn[btn].css("border-bottom", "none");
			this.btn[btn].css("color", "rgb(85, 85, 85)");
		}
	}
};
/**
 * Feature 선택 기능을 활성화한다.
 * 
 * @method gb.edit.EditingTool#select
 * @function
 * @param {ol.source.Vector}
 *            source - Feature 선택 기능을 적용할 레이어의 Vector Source 객체
 */
gb.edit.EditingTool.prototype.select = function(source) {
	var that = this;
	if(!source){
		return;
	}
	if (this.interaction.select instanceof ol.interaction.Select) {
		this.interaction.select.getFeatures().clear();
	}

	this.map.removeInteraction(this.interaction.select);

	var selectLayers = source.get("git").tempLayer ? [source.get("git").tempLayer] : [];
	this.interaction.select = new ol.interaction.Select({
		layers: selectLayers,
		toggleCondition : ol.events.condition.platformModifierKeyOnly,
		style : this.selectedStyles
	});
	this.selected = this.interaction.select.getFeatures();
	this.map.addInteraction(this.interaction.select);
	this.map.removeInteraction(this.interaction.dragbox);
	this.interaction.dragbox = new ol.interaction.DragBox({
		condition : ol.events.condition.shiftKeyOnly
	});
	this.map.addInteraction(this.interaction.dragbox);

	if(!this.copyPaste_){
		var copyPaste = new gb.interaction.Copypaste({
			features: this.interaction.select.getFeatures(),
			sources: this.getSelectSources(),
			featureRecord: this.featureRecord
		});
		this.map.addInteraction(copyPaste);
	}

	this.interaction.dragbox.on('boxend', function() {
		that.interaction.select.getFeatures().clear();
		if(!that.selectedSource){
			return;
		} else {
			that.selectedSource.forEachFeatureIntersectingExtent(this.getGeometry().getExtent(), function(feature){
				that.interaction.select.getFeatures().push(feature);
			})
		}
	});

	this.interaction.select.getFeatures().on("change:length", function(evt) {
		var vfeature = that.getVersioningFeature();
		that.features = that.interaction.select.getFeatures();
		$(that.featureTB).empty();
		
		var gitAttr = that.selectedSource.get("git");
		
		if (that.features.getLength() > 1) {
			vfeature.close();
			that.featurePop.close();
			for (var i = 0; i < that.features.getLength(); i++) {
				var idx = that.features.item(i).getId();
				var fno = idx ? idx.substring(that.features.item(i).getId().indexOf(".") + 1) : "";
				var td1 = $("<td>").text(fno);
				var feature = that.features.item(i);
				var anc = $("<a>").addClass("gb-edit-sel-flist").css("cursor", "pointer").attr({
					"value" : gitAttr.treeID + "," + feature.getId()
				}).text("Selecting feature").click(function() {
					var param = $(this).attr("value").split(",");
					var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
					if (slayers.length !== 1) {
						console.error(this.translation.alertSelectOneLayer[this.locale]);
						return;
					}
					if (slayers[0] instanceof ol.layer.Tile) {
						feature = that.getVectorSourceOfServer(param[0]).getFeatureById(param[1]);	
					} else if (slayers[0] instanceof ol.layer.Vector) {
						feature = that.getVectorSourceOfVector(param[0]).getFeatureById(param[1]);
					}
					that.count = 1;
					clearInterval(that.interval);
					feature.setStyle(undefined);
					that.interaction.select.getFeatures().clear();
					that.interaction.select.getFeatures().push(feature);
					that.featurePop.close();
					console.log(feature);
				});
				var td2 = $("<td>").append(anc);
				var tr = $("<tr>").append(td1).append(td2).mouseenter(function(evt) {
					var param = $(this).find("a").attr("value").split(",");
					var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
					if (slayers.length !== 1) {
						console.error(this.translation.alertSelectOneLayer[this.locale]);
						return;
					}
					if (slayers[0] instanceof ol.layer.Tile) {
						feature = that.getVectorSourceOfServer(param[0]).getFeatureById(param[1]);	
					} else if (slayers[0] instanceof ol.layer.Vector) {
						feature = that.getVectorSourceOfVector(param[0]).getFeatureById(param[1]);
					}
					feature.setStyle(that.highlightStyles1);
					that.interval = setInterval(function() {
						var val = that.count % 2;
						if (val === 0) {
							feature.setStyle(that.highlightStyles1);
						} else {
							feature.setStyle(that.highlightStyles2);
						}
						that.count++;
					}, 500);
				}).mouseleave(function() {
					var param = $(this).find("a").attr("value").split(",");
					var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
					if (slayers.length !== 1) {
						console.error(this.translation.alertSelectOneLayer[this.locale]);
						return;
					}
					if (slayers[0] instanceof ol.layer.Tile) {
						feature = that.getVectorSourceOfServer(param[0]).getFeatureById(param[1]);	
					} else if (slayers[0] instanceof ol.layer.Vector) {
						feature = that.getVectorSourceOfVector(param[0]).getFeatureById(param[1]);
					}
					that.count = 1;
					clearInterval(that.interval);
					feature.setStyle(undefined);
				});
				$(that.featureTB).append(tr);
			}

			that.featurePop.open();
			that.featurePop.getPanel().position({
				"my" : "left top",
				"at" : "left bottom",
				"of" : that.headerTag,
				"collision" : "fit"
			});
			that.attrPop.close();
		} else if (that.features.getLength() === 1) {
			//피처 버저닝 이력 시작
			var features = that.interaction.select.getFeatures();
			var slayers = $(that.treeElement).jstreeol3("get_selected_layer");
			var slayer;
			if (slayers.length === 1) {
				slayer = slayers[0];
			}
			var git;
			if (slayer !== undefined) {
				git = slayer.get("git");	
			}
			
			if (that.getVersioningFeature() instanceof gb.versioning.Feature && features.getLength() === 1 && git.hasOwnProperty("geogigRepo") && git.hasOwnProperty("geogigBranch")) {
				console.log($(that.treeElement).jstreeol3("get_selected_layer"));
				var feature = features.item(0);
				that.updateFeatureHistoryModal(feature);
			} else {
				var vfeature = that.getVersioningFeature();
				vfeature.close();
			}
			//피처 버저닝 이력 끝
			
			that.featurePop.close();
			$(that.attrTB).empty();
			that.feature = that.features.item(0);
			
			var source = that.selectedSource;
			var git = source.get("git");
			var props = git.attribute || [];
			var layer = source.get("git").tempLayer;
			
			if (1) {
				for (var i = 0; i < props.length; i++) {
					var td1 = $("<td>").text(props[i].fieldName);
					var td2 = $("<td>").text(props[i].type);
					var tform = $("<input>").addClass("gb-edit-sel-alist").attr({
						"type" : "text"
					}).css({
						"width" : "100%",
						"border" : "none"
					}).val(that.feature.get(props[i].fieldName)).on("input", function(e) {
//						var attrTemp = attrInfo[$(this).parent().prev().text()];
						var key = $(this).parent().prev().prev().text();
						var source = that.selectedSource;
						var git = source.get("git");
						var props = git.attribute || [];
						var layer = source.get("git").tempLayer;
						var obj = {};
						var unique, nullable, type;
						
						for(var i = 0; i < props.length; i++){
							if(key === props[i].fieldName){
								unique = props[i].isUnique || false;
								nullable = props[i].nullable || false;
								type = props[i].type || "String";
								break;
							}
						}
						
//						obj[$(this).parent().prev().text()] = $(this).val();
//						that.feature.setProperties(obj);
//						that.featureRecord.update(layer, that.feature);
						
						if(!nullable && $(this).val() === ""){
							return;
						}
						
						switch (type) { 
						case "String":
							if(that.isString($(this).val()) || ($(this).val() === "")){ 
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer, that.feature);
							} else { 
								$(this).val("");
							}
							break;
						case "Number":
							if (that.isInteger($(this).val()) || ($(this).val() === "")) {
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer,that.feature);
							} else {
								$(this).val($(this).val().replace(/[^0-9]/g, ""));
							}
							break;
						case "Integer":
							if (that.isInteger($(this).val()) || ($(this).val() === "")) {
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer,that.feature);
							} else {
								$(this).val($(this).val().replace(/[^0-9]/g, ""));
							}
							break;
						case "Double":
							if (that.isDouble($(this).val()) || ($(this).val() === "")) {
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer, that.feature);
								console.log("set");
							} else {
								$(this).val($(this).val().replace(/[^0-9\.]/g, ""));
							}
							break;
						case "Long":
							if (that.isInteger($(this).val()) || ($(this).val() === "")) {
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer,that.feature);
							} else {
								$(this).val($(this).val().replace(/[^0-9]/g, ""));
							}
							break;
						case "Boolean":
							var valid = ["t", "tr", "tru", "true", "f", "fa", "fal", "fals", "false" ];
							if (valid.indexOf($(this).val()) !== -1) {
								if (that.isBoolean($(this).val())) {
									var obj = {};
									obj[key] = $(this).val();
									that.feature.setProperties(obj);
									that.featureRecord.update(layer, that.feature);
									console.log("set");
								}
							} else if($(this).val() === "") {
								var obj = {};
								obj[key] = $(this).val();
								that.feature.setProperties(obj);
								that.featureRecord.update(layer, that.feature);
								console.log("set");
							} else {
								$(this).val("");
							}
							break;
						case "Date":
							if($(this).val().length === 10) {
								if(that.isDate($(this).val())) {
									var obj = {};
									obj[key] = $(this).val();
									that.feature.setProperties(obj);
									that.featureRecord.update(layer, that.feature);
									console.log("set");
								} else {
									$(this).val("");
								}
							} else if ($(this).val().length >10) {
								$(this).val("");
							}
							break;
						default: break;
						}
					});
					var td3 = $("<td>").append(tform);
					var tr = $("<tr>").append(td1).append(td2).append(td3);
					that.attrTB.append(tr);
				}
				that.attrPop.open();
				that.attrPop.getPanel().position({
					"my" : "left top",
					"at" : "left bottom",
					"of" : that.headerTag,
					"collision" : "fit"
				});
			} else {
				that.attrPop.close();
			}
		} else {
			that.featurePop.close();
			that.attrPop.close();
			vfeature.close();
		}

	});

	this.deactiveAnotherInteraction(this.interaction.select);
	this.deactiveAllBtn_();

	this.isOn.select = true;
	this.activeBtn_("selectBtn");

};
/**
 * Feature 그리기 기능을 활성화한다.
 * 
 * @method gb.edit.EditingTool#draw
 * @function
 * @param {ol.layer.Base}
 *            layer - 편집할 레이어
 */
gb.edit.EditingTool.prototype.draw = function(layer) {

	// if (this.isOn.draw) {
		if (!!this.interaction.draw || !!this.interaction.updateDraw) {
			if (this.interaction.draw.getActive()){
				this.deactiveIntrct_("snap");
				this.deactiveIntrct_("draw");
				this.deactiveBtn_("drawBtn");
//				this.map.removeLayer(this.managed);
				return;
			}
		}
	// }
//	this.map.removeLayer(this.managed);
	var that = this;
	if (this.interaction.select) {
		this.interaction.select.getFeatures().clear();
		this.deactiveIntrct_([ "dragbox", "select"]);
	}
	var sourceLayer = this.selectedSource;

	if(!sourceLayer){
		return;
	}

	var git = sourceLayer.get("git");
	if (git.editable === true) {
		this.interaction.draw = new ol.interaction.Draw({
			source : sourceLayer,
			type : git.geometry
		});
		this.interaction.snap = new ol.interaction.Snap({
			source : this.snapSource
		});
		this.interaction.draw.selectedType = function() {
			var layer = that.selectedSource;
			if (!layer) {
				return;
			}
			var irreGeom = layer.get("git").geometry;
			var geom;
			switch (irreGeom) {
			case "Polyline":
				geom = "LineString";
				break;
			case "LWPolyline":
				geom = "LineString";
				break;
			case "Insert":
				geom = "Point";
				break;
			case "Text":
				geom = "Point";
				break;
			default:
				geom = that.selectedSource.get("git").geometry;
			break;
			}
			return geom;
		};

		var that = this;
		this.interaction.draw.on("drawstart", function(evt) {
			gb.undo.setActive(false);
		});

		this.interaction.draw.on("drawend", function(evt) {
			console.log(evt);
			gb.undo.setActive(true);
			
			var feature = evt.feature;
			var source = that.selectedSource;
			var layer = source.get("git").tempLayer;
			var arr = that.selectedSource.getFeatures() instanceof Array ? that.selectedSource.getFeatures() : [];
			var item = arr[0];
			var prop, notNull = {}, setProp = {};
			
			if(source.get("git") instanceof Object){
				if(source.get("git").attribute instanceof Array){
					var typeFormBody = $("<tbody>");
					for(var i = 0; i < source.get("git").attribute.length; i++){
						prop = source.get("git").attribute[i];
						notNull[prop.fieldName] = prop.nullable;
						
						var td1 = $("<td>").text(prop.fieldName);
						var td2 = $("<td>").text(prop.type);
						var input = $("<input>").addClass("form-control").attr({
							"type" : "text"
						});
						if(!prop.nullable){
							input.attr("placeholder", "Not Null");
						}
						var td3 = $("<td>").append(input);
						var tr = $("<tr>").append(td1).append(td2).append(td3);
						typeFormBody.append(tr);
					}
					var htd1 = $("<td>").text("Key");
					var htd2 = $("<td>").text("Type");
					var htd3 = $("<td>").text("Value");
					var thd = $("<thead>").append(htd1).append(htd2).append(htd3);
					
					var table = $("<table>").addClass("table").addClass("text-center").append(thd).append(typeFormBody);
					
					var okBtn = 
						$("<button>")
							.css({
								"float" : "right"
							})
							.addClass("gb-button")
							.addClass("gb-button-primary")
							.text(that.translation.add[that.locale]);
					
					var buttonArea = 
						$("<span>")
							.addClass("gb-modal-buttons")
							.append(okBtn);
					
					var modalFooter = $("<div>").append(buttonArea);

					var body = 
						$("<div>")
							.append(table)
							.css({
								"max-height" : "300px",
								"overflow-y" : "auto"
							});
					
					var addPropModal = new gb.modal.ModalBase({
						"width" : 540,
						"autoOpen" : source.get("git").attribute.length !== 0 ? true : false,
						"body" : body,
						"footer" : modalFooter
					});
					
					okBtn.click(function(){
						var nullCheck = true;
						var check = true;
						
						typeFormBody.children().each(function(){
							var key = $(this).children().eq(0).text();
							var type = $(this).children().eq(1).text();
							var input = $(this).children().eq(2).find("input:text");
							var value = input.val().replace(/(\s*)/g, '');
							var valueCheck = true;
							
							if(!notNull[key] && value === ''){
								nullCheck = false;
							}
							
							switch (type) { 
							case "String":
								if(that.isString(value) || value === ''){ 
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val("");
								}
								break;
							case "Number":
								if (that.isInteger(value) || value === '') {
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val(value.replace(/[^0-9]/g, ""));
								}
								break;
							case "Integer":
								if (that.isInteger(value) || value === '') {
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val(value.replace(/[^0-9]/g, ""));
								}
								break;
							case "Double":
								if (that.isDouble(value) || value === '') {
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val(value.replace(/[^0-9\.]/g, ""));
								}
								break;
							case "Long":
								if (that.isInteger(value) || value === '') {
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val(value.replace(/[^0-9]/g, ""));
								}
								break;
							case "Boolean":
								var valid = ["t", "tr", "tru", "true", "f", "fa", "fal", "fals", "false" ];
								if (valid.indexOf(value) !== -1) {
									if (that.isBoolean(value)) {
										setProp[key] = value;
									}
								} else if (value === ''){
									setProp[key] = value;
								} else {
									valueCheck = false;
									$(this).val("");
								}
								break;
							case "Date":
								if(value.length === 10) {
									if(that.isDate(value)) {
										setProp[key] = value;
									} else {
										valueCheck = false;
										$(this).val("");
									}
								} else if (value === '') {
									setProp[key] = value;
								} else if (value.length >10) {
									valueCheck = false;
									$(this).val("");
								}
								break;
							default: break;
							}
							
							if(!valueCheck){
								check = false;
								input.css("background-color", "#ccc");
							} else {
								input.css("background-color", "#fff");
							}
						});
						
						if(!nullCheck){
							alert(that.translation.notNullHint[that.locale]);
							return;
						}
						
						if(!check){
							alert(that.translation.valueHint[that.locale]);
							return;
						}
						
						feature.setProperties(setProp);
						addPropModal.close();
					});
					addPropModal.modalHead.remove();
				}
			}
			
			if (!!source) {
				var l = source.getFeatureById(source.get("git").treeID + ".new0")
				
				if (!l) {
					var fid = source.get("git").treeID + ".new0";
					feature.setId(fid);
					that.featureRecord.create(layer, feature);
				} else {
					var count = 1;
					while(source.getFeatureById(source.get("git").treeID + ".new" + count) !== null){
						count++;
					}
					var fid = source.get("git").treeID + ".new" + count;
					feature.setId(fid);
					that.featureRecord.create(layer, feature);
				}

				gb.undo.pushAction({
					undo: function(data){
						data.layer.getSource().removeFeature(data.feature);
						data.that.featureRecord.deleteFeatureCreated(data.layer.get("id"), data.feature.getId());
					},
					redo: function(data){
						data.layer.getSource().addFeature(data.feature);
						data.that.featureRecord.create(data.layer, data.feature);
					},
					data: {
						that: that,
						layer: layer,
						feature: feature
					}
				});
			}
		});
		this.deactiveIntrct_([ "select", "dragbox", "move", "modify", "rotate" ]);
		this.map.addInteraction(this.interaction.draw);
		this.map.addInteraction(this.interaction.snap);
		this.activeIntrct_("draw");
		this.activeIntrct_("snap");
		this.activeBtn_("drawBtn");
	} else if (git.editable === true && sourceLayer instanceof ol.layer.Base) {
//		this.map.addLayer(this.managed);

		this.interaction.draw = new ol.interaction.Draw({
			source : this.tempSource,
			type : git.geometry
		});
		this.interaction.snap = new ol.interaction.Snap({
			source : this.snapSource
		});
		this.interaction.draw.selectedType = function() {
			var result = false;
			var layer = this.selectedSource;
			if (!!layer) {
				result = layer.get("git").geometry;
			}
			return result;
		};
		this.interaction.draw.on("drawend", function(evt) {
			console.log(evt);
			var source = that.selectedSource;
			var layer = source.get("git").tempLayer;
			if (!!source) {
				var feature = evt.feature;
				var c = that.featureRecord.getCreated();
				var l = c[source.get("git").layerID];
				if (!l) {
					var fid = source.get("git").layerID + ".new0";
					feature.setId(fid);
					that.featureRecord.create(layer, feature);
				} else {
					var keys = Object.keys(l);
					var count;
					if (keys.length === 0) {
						count = 0;
					} else {
						var id = keys[keys.length - 1];
						var nposit = (id.search(".new")) + 4;
						count = (parseInt(id.substr(nposit, id.length)) + 1);
					}
					var fid = source.get("git").layerID + ".new" + count;
					feature.setId(fid);
					that.featureRecord.create(layer, feature);
				}
			}
		});
		this.deactiveIntrct_([ "move", "modify", "rotate" ]);
		this.map.addInteraction(this.interaction.draw);
		this.map.addInteraction(this.interaction.snap);
		this.activeIntrct_("draw");
		this.activeIntrct_("snap");
		this.activeBtn_("drawBtn");
	}

};
/**
 * Feature 이동 기능을 활성화한다.
 * 
 * @method gb.edit.EditingTool#move
 * @function
 * @param {ol.layer.Base}
 *            layer - 편집할 레이어
 */
gb.edit.EditingTool.prototype.move = function(layer) {
	if (this.interaction.select === undefined) {
		return;
	}
	if (this.isOn.move) {
		if (this.interaction.move) {
			this.interaction.select.getFeatures().clear();
			this.deactiveIntrct_("move");
			this.deactiveBtn_("moveBtn");
//			this.map.removeLayer(this.tempVector);
//			this.map.removeLayer(this.managed);
		}
		return;
	}
//	this.map.removeLayer(this.managed);
	var that = this;

	var selectSource = this.selectedSource;
	if(!selectSource){
		return;
	}

	if (this.interaction.select.getFeatures().getLength() > 0) {

//		this.map.addLayer(this.managed);
		this.interaction.move = new ol.interaction.Translate({
			features : this.interaction.select.getFeatures()
		});

		// feature move를 시작한 시점의 mouse pointer 위치 좌표
		var lastCoord;
		this.interaction.move.on("translatestart", function(evt) {
			lastCoord = evt.coordinate;
		});
		this.interaction.move.on("translateend", function(evt) {

			// 선택된 feature 객체들을 저장
			var featureList = [];
			var features = evt.features;
			for (var i = 0; i < features.getLength(); i++) {
				that.featureRecord.update(selectSource.get("git").tempLayer, features.item(i));
				featureList.push(features.item(i));
			}

			gb.undo.pushAction({
				undo: function(data){
					var deltaX = data.lastCoord[0] - data.newCoord[0];
					var deltaY = data.lastCoord[1] - data.newCoord[1];
					var geom;
					for(var i = 0; i < data.features.length; i++){
						geom = data.features[i].getGeometry();
						geom.translate(deltaX, deltaY);
						data.features[i].setGeometry(geom);
						data.that.featureRecord.update(data.layer, data.features[i]);
					}
				},
				redo: function(data){
					var deltaX = data.newCoord[0] - data.lastCoord[0];
					var deltaY = data.newCoord[1] - data.lastCoord[1];
					var geom;
					for(var i = 0; i < data.features.length; i++){
						geom = data.features[i].getGeometry();
						geom.translate(deltaX, deltaY);
						data.features[i].setGeometry(geom);
						data.that.featureRecord.update(data.layer, data.features[i]);
					}
				},
				data: {
					that: that,
					layer: selectSource.get("git").tempLayer,
					features: featureList,
					lastCoord: lastCoord,
					newCoord: evt.coordinate
				}
			});
		});
		this.deactiveIntrct_([ "select", "dragbox", "draw", "modify", "rotate", "snap" ]);
		this.map.addInteraction(this.interaction.move);
		this.activeIntrct_("move");
		this.activeBtn_("moveBtn");

		selectSource.get("git").tempLayer.setMap(null);
		this.tempVector.setSource(selectSource);
		this.tempVector.setStyle(selectSource.get("git").tempLayer.getStyle());
		this.map.addLayer(this.tempVector);
	} else {
		console.error(this.translation.alertSelectFeature[this.locale]);
	}
};
/**
 * Feature 크기, 회전, 반전 편집 기능을 활성화한다.
 * 
 * @method gb.edit.EditingTool#rotate
 * @function
 * @param {ol.layer.Base}
 *            layer - 편집할 레이어
 */
gb.edit.EditingTool.prototype.rotate = function(layer) {
	if (this.interaction.select === undefined) {
		return;
	}
	// if (this.isOn.rotate) {
		if (!!this.interaction.rotate) {
			if (this.interaction.rotate.getActive()){
				this.interaction.select.getFeatures().clear();
				this.deactiveIntrct_("rotate");
				this.deactiveBtn_("rotateBtn");
				return;
			}
		}
	// }

	var that = this;

	var selectSource = this.selectedSource;
	if(!selectSource){
		return;
	}
	
	var git = selectSource.get("git");
	if(git instanceof Object){
		if(git.geometry === "Point" || git.geometry === "MultiPoint"){
			alert(this.translation.transformPointHint[this.locale]);
			return;
		}
	}

	if (this.interaction.select.getFeatures().getLength() > 0) {

		if (this.interaction.select.getFeatures().getLength() !== 1) {
			console.error("select 1 feature");
			return;
		}

		this.interaction.rotate = new gb.interaction.MultiTransform({
			features : this.interaction.select.getFeatures()
		});

		var lastCoord;
		this.interaction.rotate.on("transformstart", function(evt) {
			var feature = evt.target.getFeatures().item(0);
			if(!feature){
				return;
			}
			lastCoord = feature.getGeometry().getCoordinates();
		});
		this.interaction.rotate.on("transformend", function(evt) {

			var feature = evt.target.getFeatures().item(0);
			if(!feature){
				return;
			}
			
			that.featureRecord.update(selectSource.get("git").tempLayer, feature);

			gb.undo.pushAction({
				undo: function(data){
					var geom = data.feature.getGeometry();
					geom.setCoordinates(data.lastCoord);
					data.feature.setGeometry(geom);
					data.that.featureRecord.update(data.layer, data.feature);
				},
				redo: function(data){
					var geom = data.feature.getGeometry();
					geom.setCoordinates(data.newCoord);
					data.feature.setGeometry(geom);
					data.that.featureRecord.update(data.layer, data.feature);
				},
				data: {
					that: that,
					layer: selectSource.get("git").tempLayer,
					feature: feature,
					lastCoord: lastCoord,
					newCoord: feature.getGeometry().getCoordinates()
				}
			});
		});
		this.map.addInteraction(this.interaction.rotate);
		this.deactiveIntrct_([ "select", "dragbox", "draw", "move", "modify", "snap" ]);
		this.activeIntrct_("rotate");
		this.activeBtn_("rotateBtn");
	} else {
		console.error(this.translation.alertSelectFeature[this.locale]);
	}
};
/**
 * Feature 버텍스 편집 기능을 활성화한다.
 * 
 * @method gb.edit.EditingTool#modify
 * @function
 * @param {ol.layer.Base}
 *            layer - 편집할 레이어
 */
gb.edit.EditingTool.prototype.modify = function(layer) {
	if (this.interaction.select === undefined) {
		return;
	}
	// if (this.isOn.modify) {
		if (!!this.interaction.modify) {
			if (this.interaction.modify.getActive()) {
				this.interaction.select.getFeatures().clear();
				this.deactiveIntrct_("modify");
				this.deactiveIntrct_("snap");
				this.deactiveBtn_("modiBtn");
				return;
			}
		}
	// }
	var that = this;

	var selectSource = this.selectedSource;
	if(!selectSource){
		return;
	}

	if (this.interaction.select.getFeatures().getLength() > 0) {

		this.interaction.modify = new ol.interaction.Modify({
			features : this.interaction.select.getFeatures()
		});

		var lastCoord;
		this.interaction.modify.on("modifystart", function(evt) {
			lastCoord = [];
			evt.features.forEach(function(feature){
				lastCoord.push({
					id: feature.getId(),
					coord: feature.getGeometry().getCoordinates()
				});
			});
		});
		this.interaction.modify.on("modifyend", function(evt) {
			var featureList = [];
			var newCoord = [];

			var features = evt.features;
			for (var i = 0; i < features.getLength(); i++) {
				that.featureRecord.update(selectSource.get("git").tempLayer, features.item(i));
				featureList.push(features.item(i));
				newCoord.push({
					id: features.item(i).getId(),
					coord: features.item(i).getGeometry().getCoordinates()
				});
			}

			gb.undo.pushAction({
				undo: function(data){
					console.log("modify undo");
					var geom;
					for(var i = 0; i < data.features.length; i++){
						geom = data.features[i].getGeometry();
						for(var j = 0; j < data.lastCoord.length; j++){
							if(data.features[i].getId() === data.lastCoord[j].id){
								geom.setCoordinates(data.lastCoord[j].coord);
								data.features[i].setGeometry(geom);
								data.that.featureRecord.update(data.layer, data.features[i]);
								break;
							}
						}
					}
				},
				redo: function(data){
					console.log("modify redo");
					var geom;
					for(var i = 0; i < data.features.length; i++){
						geom = data.features[i].getGeometry();
						for(var j = 0; j < data.newCoord.length; j++){
							if(data.features[i].getId() === data.newCoord[j].id){
								geom.setCoordinates(data.newCoord[j].coord);
								data.features[i].setGeometry(geom);
								data.that.featureRecord.update(data.layer, data.features[i]);
								break;
							}
						}
					}
				},
				data: {
					that: that,
					layer: selectSource.get("git").tempLayer,
					features: featureList,
					lastCoord: lastCoord,
					newCoord: newCoord
				}
			});
		});
		this.deactiveIntrct_([ "select", "dragbox", "draw", "move", "rotate" ]);
		this.map.addInteraction(this.interaction.modify);

		var sourceLayer;
		this.interaction.snap = new ol.interaction.Snap({
			source : this.snapSource
		});
		this.map.addInteraction(this.interaction.snap);
		this.activeIntrct_("snap");

		this.activeIntrct_("modify");
		this.activeBtn_("modiBtn");
	} else {
		console.error(this.translation.alertSelectFeature[this.locale]);
	}
};
/**
 * 선택된 Feature를 삭제한다.
 * 
 * @method gb.edit.EditingTool#remove
 * @function
 * @param {ol.layer.Base}
 *            layer - 편집할 레이어
 */
gb.edit.EditingTool.prototype.remove = function(layer) {
	if (this.interaction.select === undefined) {
		return;
	}
	var that = this;

	var selectSource = this.selectedSource;
	if(!selectSource){
		return;
	}

	var length = this.interaction.select.getFeatures().getLength();
	
	if (length > 0) {
		var features = this.interaction.select.getFeatures();
		var fill = new ol.style.Fill({
			color : "rgba(255,0,0,0.01)"
		});

		var stroke = new ol.style.Stroke({
			color : "rgba(255,0,0,0.7)",
			width : 1.25
		});

		var text = new ol.style.Text({});
		var style = new ol.style.Style({
			image : new ol.style.Circle({
				fill : fill,
				stroke : stroke,
				radius : 5
			}),
			fill : undefined,
			stroke : undefined
		});
		
		var msg1 = $("<div>").css({
			"text-align" : "center",
			"font-size" : "16px"
		}).text(this.translation.deleteFeaturesHint[this.locale]);
		
		var todel = this.translation.selectFeatureNum[this.locale] + " : " + length;
		var msg2 = $("<div>").text(todel).css({
			"text-align" : "center",
			"font-size" : "24px",
			"word-break" : "break-word"
		});
		
		var body = $("<div>").append(msg1).append(msg2);
		var closeBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-default").text(this.translation.cancel[this.locale]);
		var okBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-primary").text(this.translation["delete"][this.locale]);
		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
		var deleteModal = new gb.modal.ModalBase({
			"title" : this.translation.deleteFeature[this.locale],
			"width" : 310,
			"height" : 200,
			"autoOpen" : false,
			"body" : body,
			"footer" : buttonArea
		});
		$(closeBtn).click(function() {
			deleteModal.close();
		});
		$(okBtn).click(function() {
			if (selectSource.get("git").tempLayer instanceof ol.layer.Vector) {
				for (var i = 0; i < features.getLength(); i++) {
					if (features.item(i).getId().search(".new") !== -1) {
						selectSource.removeFeature(features.item(i));
					} else {
						features.item(i).setStyle(style);
					}
					that.featureRecord.remove(selectSource.get("git").tempLayer, features.item(i));
				}

				gb.undo.pushAction({
					undo: function(data){
						var feature, id;
						for (var i = 0; i < data.features.length; i++) {
							id = data.features[i].getId();
							if (id.search(".new") !== -1) {
								data.source.addFeature(data.features[i]);
							} else {
								feature = data.source.getFeatureById(id);
								feature.setStyle(data.defaultStyle);
							}
							data.that.featureRecord.deleteFeatureRemoved(data.source.get("git").tempLayer.get("id"), data.features[i].getId());
						}
					},
					redo: function(data){
						var feature, id;
						for (var i = 0; i < data.features.length; i++) {
							id = data.features[i].getId();
							if (id.search(".new") !== -1) {
								data.source.removeFeature(data.features[i]);
							} else {
								feature = data.source.getFeatureById(id);
								feature.setStyle(data.removeStyle);
							}
							data.that.featureRecord.remove(data.source.get("git").tempLayer, data.features[i]);
						}
					},
					data: {
						that: that,
						source: selectSource,
						features: features.getArray().slice(),
						defaultStyle: selectSource.get("git").tempLayer.getStyle(),
						removeStyle: style
					}
				});
			} else if (selectSource.get("git").tempLayer instanceof ol.layer.Base) {
				for (var i = 0; i < features.getLength(); i++) {
					if (features.item(i).getId().search(".new") !== -1) {
						selectSource.removeFeature(features.item(i));
					} else {
						features.item(i).setStyle(style);
					}
					that.featureRecord.remove(selectSource.get("git").tempLayer, features.item(i));
				}
			}
			that.interaction.select.getFeatures().clear();
			deleteModal.close();
		});
		deleteModal.open();
	} else {
		console.error(this.translation.alertSelectFeature[this.locale]);
	}
};

/**
 * 선택한 레이어를 업데이트한다.
 * 
 * @method gb.edit.EditingTool#updateSelected
 * @function
 * @return {ol.source.Vector}
 */
gb.edit.EditingTool.prototype.updateSelected = function() {
	var source = undefined;
	var tree = this.otree.getJSTree();
	
	var selectedLayer = $(this.treeElement).jstreeol3("get_selected_layer");
	var treeId;
	if (selectedLayer.length === 1) {
		treeId = selectedLayer[0].get("treeid");
	} else {
		return;
	}
	
	if(tree.get_node(treeId).state.hiding){
		return;
	}
	
	var layer = tree.get_LayerById(treeId);
	
	// 현재 편집중인 레이어의 zindex를 최상위로
	this.moveUpEditingLayer_();
	
	// 선택한 노드가 그룹레이어 또는 이미지 레이어일 때 작업 중단
	if(layer instanceof ol.layer.Group || layer instanceof ol.layer.Image){
		return this.selectedSource || source;
	}
	
	// 선택한 노드가 묶음 타일 레이어일 때 작업 중단
	if(layer instanceof ol.layer.Tile){
		if(layer.get("git").fake === "parent"){
			return this.electedSource || source;
		}
	}
	
	var prevSelected = this.selectedSource;
	var prevTreeid;
	if(prevSelected !== undefined){
		if(!!prevSelected.get("git")){
			prevTreeid = prevSelected.get("git").treeID || "";
		}
	}
	
	// 이전에 선택된 Openlayer Tree Node의 Editing 아이콘을 삭제
	if(tree.get_node(prevTreeid)){
		tree.set_flag(tree.get_node(prevTreeid), "editing", false);
	}
	
	// 현재 선택된 Openlayer Tree Node에 Editing 아이콘을 생성
	if(tree.get_node(treeId)){
		tree.set_flag(tree.get_node(treeId), "editing", true);
	}
	
	if(this.getVectorSourceOfServer(treeId)){
		source = this.getVectorSourceOfServer(treeId);
	} else if(this.getVectorSourceOfVector(treeId)){
		source = this.getVectorSourceOfVector(treeId);
	} else {
//		if(layer instanceof ol.layer.Vector){
//			source = layer.getSource();
//			if(!layer.get("id")){
//				layer.set("id", layer.get("treeid"));
//			}
//			if(typeof source.get("git") !== "object"){
//				source.set("git", {
//					layerID: layer.get("id"),
//					treeID: layer.get("treeid"),
//					tempLayer: layer,
//					editable: layer.get("git").editable,
//					geometry: layer.get("git").geometry
//				});
//			}
//			
//			if(!this.customVector_[layer.get("treeid")]){
//				this.customVector_[layer.get("treeid")] = source;
//			}
//		}
	}
	
	this.selectedSource = source;
	if(source !== undefined){
		this.selectSources.clear();
		this.selectSources.push(source);
	}
	return source;
};
//gb.edit.EditingTool.prototype.setFeatures = function(newFeature) {
//	var that = this;
//	/*
//	 * if (this.isOn.select) { if (!!this.interaction.select) {
//	 * this.interaction.select.getFeatures().clear(); this.deactiveIntrct_([
//	 * "dragbox", "select"]); } this.deactiveBtn_("selectBtn"); this.isOn.select =
//	 * false; } this.select(this.layer);
//	 */
//	if (newFeature.length === 1) {
//		// this.interaction.select.getFeatures().extend(newFeature);
//		this.open();
//		this.attrPop.getPanel().position({
//			"my" : "left top",
//			"at" : "right top",
//			"of" : this.getPanel(),
//			"collision" : "fit"
//		});
//	}
//};
/**
 * 선택한 Feature들의 집합을 반환한다.
 * 
 * @method gb.edit.EditingTool#getFeatures
 * @function
 * @return {ol.Collection.<ol.Feature>}
 */
gb.edit.EditingTool.prototype.getFeatures = function() {
	return this.features;
};
/**
 * 삭제한 레이어에 포함되는 피처를 임시 레이어에서 지운다
 * 
 * @method gb.edit.EditingTool#removeFeatureFromUnmanaged
 * @function
 * @param {ol.layer.Base}
 *            layer - 임시 레이어 목록에서 삭제할 레이어 객체
 */
gb.edit.EditingTool.prototype.removeFeatureFromUnmanaged = function(layer) {
	var that = this;

	if (layer instanceof ol.layer.Group) {
		var layers = layer.getLayers();
		for (var i = 0; i < layers.getLength(); i++) {
			this.featureRecord.removeByLayer(layers.item(i).get("id"));
			// that.tempVector.setMap(this.map);
			this.removeFeatureFromUnmanaged(layers.item(i));
		}
	} else if (layer instanceof ol.layer.Base) {
		var git = layer.get("git");
		if (git) {
			// git 변수가 있음
			if (git.hasOwnProperty("fake")) {
				// 가짜 레이어임
				if (git["fake"] === "parent") {
					// 가짜 그룹 레이어임
					var layers = git["layers"];
					if (layers instanceof ol.Collection) {
						for (var i = 0; i < layers.getLength(); i++) {
							this.featureRecord.removeByLayer(layers.item(i).get("id"));
							// that.tempVector.setMap(this.map);
							this.removeFeatureFromUnmanaged(layers.item(i));
						}						
					}
				} else if (git["fake"] === "child") {
					var layerId = layer.get("id");
					this.tempVector.getSource().forEachFeature(function(feature) {
						var id = feature.getId();
						if (id.indexOf(layerId) !== -1) {
							that.tempVector.getSource().removeFeature(feature);
							// that.tempVector.setMap(this.map);
						}
					});
				}
			} else {
				var layerId = layer.get("id");
				this.tempVector.getSource().forEachFeature(function(feature) {
					var id = feature.getId();
					if (id.indexOf(layerId) !== -1) {
						that.tempVector.getSource().removeFeature(feature);
						// that.tempVector.setMap(this.map);
					}
				});
			}
		} else {
			var layerId = layer.get("id");
			this.tempVector.getSource().forEachFeature(function(feature) {
				var id = feature.getId();
				if (id.indexOf(layerId) !== -1) {
					that.tempVector.getSource().removeFeature(feature);
					// that.tempVector.setMap(this.map);
				}
			});
		}
	}
	// that.tempVector.setMap(this.map);
	return;
};

/**
 * 임시 레이어에 있는 Feature들을 전부 삭제한다.
 * 
 * @method gb.edit.EditingTool#clearUnmanaged
 * @function
 */
gb.edit.EditingTool.prototype.clearUnmanaged = function() {
	if (this.tempVector instanceof ol.layer.Vector) {
		this.tempVector.clear();
	}
	// this.tempVector.setMap(this.map);
	return;
};

//gb.edit.EditingTool.prototype.open = function() {
//	var layer = this.updateSelected();
//	if (layer instanceof ol.layer.Group) {
//		console.error("group layer can not edit");
//	} else if (layer instanceof ol.layer.Tile) {
//		var git = layer.get("git");
//		if (git.hasOwnProperty("fake")) {
//			if (git.fake === "parent") {
//				console.error("fake parent layer can not edit");
//			} else {
//				// this.headerTag.css("display", "block");
//			}
//		} else {
//			// this.headerTag.css("display", "block");
//		}
//	} else if (layer instanceof ol.layer.Base) {
//		// this.headerTag.css("display", "block");
//	}
//};

//gb.edit.EditingTool.prototype.setWMSSource = function(sourceLayer, callback) {
//	var that = this;
//	if (sourceLayer instanceof ol.layer.Vector || sourceLayer instanceof ol.layer.Group) {
//		return;
//	}
//	var arr = {
//			"geoLayerList" : [ sourceLayer.get("id") ]
//	}
//	var names = [];
//
//	$.ajax({
//		url : this.layerInfo,
//		method : "POST",
//		contentType : "application/json; charset=UTF-8",
//		cache : false,
//		data : JSON.stringify(arr),
//		beforeSend : function() { // 호출전실행
//			$("body").css("cursor", "wait");
//		},
//		traditional : true,
//		success : function(data2, textStatus, jqXHR) {
//			console.log(data2);
//			if (Array.isArray(data2)) {
//				for (var i = 0; i < 1; i++) {
//					var source = new ol.source.TileWMS({
//						url : "geoserver/geoserverWMSLayerLoad.do",
//						params : {
//							'LAYERS' : data2[i].lName,
//							'TILED' : true,
//							'FORMAT' : 'image/png8',
//							'VERSION' : '1.1.0',
//							'CRS' : that.getMap().getView().getProjection().getCode(),
//							'SRS' : that.getMap().getView().getProjection().getCode(),
//							'BBOX' : data2[i].nbBox.minx.toString() + "," + data2[i].nbBox.miny.toString() + ","
//							+ data2[i].nbBox.maxx.toString() + "," + data2[i].nbBox.maxy.toString()
//						},
//						serverType : 'geoserver'
//					});
//					sourceLayer.setSource(source);
//					var ogit = sourceLayer.get("git");
//					ogit["attribute"] = data2[i].attInfo;
//					ogit["geometry"] = data2[i].geomType;
//					var getPosition = function(str, subString, index) {
//						return str.split(subString, index).join(subString).length;
//					};
//					var id = sourceLayer.get("id");
//					var format = id.substring((getPosition(id, "_", 1) + 1), getPosition(id, "_", 2));
//					var layer;
//					if (format === "ngi") {
//						layer = new gb.layer.LayerInfo({
//							name : sourceLayer.get("name"),
//							id : id,
//							format : format,
//							epsg : data2[i].srs,
//							mbound : [ [ data2[i].nbBox.minx.toString(), data2[i].nbBox.miny.toString() ],
//								[ data2[i].nbBox.maxx.toString(), data2[i].nbBox.maxy.toString() ] ],
//								lbound : [ [ 122.71, 28.6 ], [ 134.28, 40.27 ] ],
//								isNew : false,
//								geometry : id.substring(getPosition(id, "_", 4) + 1),
//								sheetNum : id.substring((getPosition(id, "_", 2) + 1), getPosition(id, "_", 3))
//						});
//					} else if (format === "dxf") {
//						layer = new gb.layer.LayerInfo({
//							name : sourceLayer.get("name"),
//							id : id,
//							format : format,
//							epsg : data2[i].srs,
//							mbound : [ [ data2[i].nbBox.minx.toString(), data2[i].nbBox.miny.toString() ],
//								[ data2[i].nbBox.maxx.toString(), data2[i].nbBox.maxy.toString() ] ],
//								isNew : false,
//								lbound : [ [ 122.71, 28.6 ], [ 134.28, 40.27 ] ],
//								isNew : false,
//								geometry : id.substring(getPosition(id, "_", 4) + 1),
//								sheetNum : id.substring((getPosition(id, "_", 2) + 1), getPosition(id, "_", 3))
//						});
//					} else if (format === "shp") {
//						layer = new gb.layer.LayerInfo({
//							name : sourceLayer.get("name"),
//							id : id,
//							format : format,
//							epsg : data2[i].srs,
//							mbound : [ [ data2[i].nbBox.minx.toString(), data2[i].nbBox.miny.toString() ],
//								[ data2[i].nbBox.maxx.toString(), data2[i].nbBox.maxy.toString() ] ],
//								lbound : [ [ 122.71, 28.6 ], [ 134.28, 40.27 ] ],
//								isNew : false,
//								geometry : id.substring(getPosition(id, "_", 4) + 1),
//								sheetNum : id.substring((getPosition(id, "_", 2) + 1), getPosition(id, "_", 3))
//						});
//					}
//					ogit["information"] = layer;
//					console.log(ogit["attribute"]);
//					console.log("source injected");
//					if (typeof callback === "function") {
//						callback(source);
//					}
//				}
//				$("body").css("cursor", "default");
//			}
//		}
//	});
//};

/**
 * ol.Map 객체를 설정한다.
 * 
 * @method gb.edit.EditingTool#setMap
 * @function
 * @param {ol.Map}
 *            map - EditingTool을 적용할 ol Map 객체
 */
gb.edit.EditingTool.prototype.setMap = function(map) {
	this.map = map;
}
/**
 * ol.Map 객체를 반환한다.
 * 
 * @method gb.edit.EditingTool#getMap
 * @function
 * @return {ol.Map}
 */
gb.edit.EditingTool.prototype.getMap = function() {
	return this.map;
}
/**
 * String 타입인지 검사한다.
 * 
 * @method gb.edit.EditingTool#isString
 * @function
 * @param {string}
 *            va - 타입 검사를 수행할 값
 * @return {boolean} 타입이 적합할 시 True 반환, 적합하지않을 시 False반환
 */
gb.edit.EditingTool.prototype.isString = function(va) {
	var result = false;
	if (typeof va === "string") {
		result = true;
	}
	return result;
}
/**
 * Integer 타입인지 검사한다.
 * 
 * @method gb.edit.EditingTool#isInteger
 * @function
 * @param {string}
 *            va - 타입 검사를 수행할 값
 * @return {boolean} 타입이 적합할 시 True 반환, 적합하지않을 시 False반환
 */
gb.edit.EditingTool.prototype.isInteger = function(va) {
	var num = /^-?[0-9]+$/;
	if (typeof va === "string") {
		return num.test(va);
	}
	return false;
}
/**
 * Double 타입인지 검사한다.
 * 
 * @method gb.edit.EditingTool#isDouble
 * @function
 * @param {string}
 *            va - 타입 검사를 수행할 값
 * @return {boolean} 타입이 적합할 시 True 반환, 적합하지않을 시 False반환
 */
gb.edit.EditingTool.prototype.isDouble = function(va) {
	var num = /^[-+]?[0-9]*\.?[0-9]+$/;
	if (typeof va === "string") {
		return num.test(va);
	}
	return false;
}
/**
 * Boolean 타입인지 검사한다.
 * 
 * @method gb.edit.EditingTool#isBoolean
 * @function
 * @param {string}
 *            va - 타입 검사를 수행할 값
 * @return {boolean} 타입이 적합할 시 True 반환, 적합하지않을 시 False반환
 */
gb.edit.EditingTool.prototype.isBoolean = function(va) {
	var result = false;
	if (va == "true" || va == "false") {
		result = true;
	}
	return result;
}
/**
 * Date 타입인지 검사한다.
 * 
 * @method gb.edit.EditingTool#isDate
 * @function
 * @param {string}
 *            va - 타입 검사를 수행할 값
 * @return {boolean} 타입이 적합할 시 True 반환, 적합하지않을 시 False반환
 */
gb.edit.EditingTool.prototype.isDate = function(va) {
	var result = false;
	if (typeof va === "string") {
		if ((new Date(va)).getTime() > 0) {
			result = true;
		}
	}
	return result;
}
/**
 * 레이어에 스냅핑 기능을 적용시킨다.
 * 
 * @method gb.edit.EditingTool#addSnappingLayer
 * @function
 * @param {ol.layer.Base}
 *            layer - 스냅핑 기능을 적용할 레이어. 그룹레이어 입력 시 하위의 모든 레이어에 스냅핑 기능 적용
 * @return {boolean} 성공적으로 스냅핑 기능 적용 시 True 반환, 실패 시 False반환
 */
gb.edit.EditingTool.prototype.addSnappingLayer = function(layer) {
	var success = false;
	var array = undefined;
	var git = undefined;
	var jstree = this.otree ? this.otree.getJSTree() : undefined;
	
	if(layer instanceof ol.layer.Base){
		if(layer.get("git") instanceof Object){
			git = layer.get("git");
		}
	}
	
	if (layer instanceof ol.layer.Group) {
		array = layer.getLayers();
		for (var i = 0; i < array.getLength(); i++) {
			success = this.addSnappingLayer(array.item(i));
			jstree.set_flag(jstree.get_node(layer.get("treeid")), "snapping", true);
		}
		return success;
	} else if (layer instanceof ol.layer.Vector && layer.getType() === "VECTOR") {
		for (var i = 0; i < this.snapVector.getLength(); i++) {
			if (this.snapVector.item(i) === layer) {
				success = true;
				break;
			}
		}
		if (!success) {
			this.snapVector.push(layer);
			success = true;
			jstree.set_flag(jstree.get_node(layer.get("treeid")), "snapping", true);
		}
	} else if (layer instanceof ol.layer.Tile) {
		var treeid = layer.get("treeid");
		
		if(git !== undefined){
			if(git.fake === "parent"){
				array = git.layers.getArray();
				for(var i = 0; i < array.length; i++){
					success = this.addSnappingLayer(array[i]);
				}
				return success;
			}
		}
		
		if(!!this.vectorSourcesOfServer_[treeid]){
			if(!jstree.get_node(treeid).state.snapping){
				this.snapVector.push(this.vectorSourcesOfServer_[treeid].get("git").tempLayer);
				success = true;
				jstree.set_flag(jstree.get_node(treeid), "snapping", true);
			}
		}
	}
	return success;
}
/**
 * 레이어의 스냅핑 기능을 해제시킨다.
 * 
 * @method gb.edit.EditingTool#removeSnappingLayer
 * @function
 * @param {ol.layer.Base}
 *            layer - 스냅핑 기능을 해제시킬 레이어. 그룹레이어 입력시 하위의 모든 레이어 스냅핑 기능 해제
 * @return {boolean} 성공적으로 스냅핑 기능 해제 시 True 반환, 실패 시 False반환
 */
gb.edit.EditingTool.prototype.removeSnappingLayer = function(layer) {
	var that = this;
	var success = false;
	var jstree = this.otree ? this.otree.getJSTree() : undefined;
	
	var treeid = layer.get("treeid");
	var node = jstree.get_node(treeid);
	var parents = node.parents;

	var array = undefined;
	var git = undefined;
	
	if(layer instanceof ol.layer.Base){
		if(layer.get("git") instanceof Object){
			git = layer.get("git");
		}
	}
	
	if (layer instanceof ol.layer.Group) {
		array = layer.getLayers();
		for (var i = 0; i < array.getLength(); i++) {
			success = this.removeSnappingLayer(array.item(i));
		}
		return success;
	} else if (layer instanceof ol.layer.Vector) {
		for (var i = 0; i < this.snapVector.getLength(); i++) {
			if (this.snapVector.item(i) === layer) {
				this.snapVector.removeAt(i);
				success = true;
				jstree.set_flag(jstree.get_node(layer.get("treeid")), "snapping", false);
				break;
			}
		}
	} else if (layer instanceof ol.layer.Tile) {
		if(git !== undefined){
			if(git.fake === "parent"){
				array = git.layers.getArray();
				for(var i = 0; i < array.length; i++){
					success = this.removeSnappingLayer(array[i]);
				}
				return success;
			}
		}
		
		if(!!this.vectorSourcesOfServer_[treeid]){
			this.snapVector.remove(this.vectorSourcesOfServer_[treeid].get("git").tempLayer);
			success = true;
			jstree.set_flag(jstree.get_node(treeid), "snapping", false);
		}
	}
	
	if(success){
		for(var i = 0; i < parents.length; i++){
			if(parents[i] === "#"){
				continue;
			}
			
			if(jstree.get_node(parents[i]).state.snapping){
				jstree.set_flag(jstree.get_node(parents[i]), "snapping", false);
			}
		}
	}
	
	return success;
}
/**
 * 현재 맵에서 보여지는 범위에 있는 스냅핑 기능이 적용된 레이어들의 모든 Feature들을 스냅핑 Source에 추가시킨다.
 * 
 * @method gb.edit.EditingTool#loadSnappingLayer
 * @function
 * @param {Array.<number>}
 *            extent - 스냅핑 기능을 적용시킬 범위
 */
gb.edit.EditingTool.prototype.loadSnappingLayer = function(extent) {
	var that = this;
	that.snapSource.clear();

	if (this.snapVector.getLength() > 0) {
		for (var i = 0; i < this.snapVector.getLength(); i++) {
			this.snapVector.item(i).getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
				that.snapSource.addFeature(feature);
			});
		}
	}
};
/**
 * 레이어 최대 범위에 맞춰 현재 맵 시점을 이동시킨다.
 * 
 * @method gb.edit.EditingTool#zoomToFit
 * @function
 * @param {ol.layer.Base}
 *            layer - 시점 이동할 레이어
 */
gb.edit.EditingTool.prototype.zoomToFit = function(layer) {
	var that = this;
	if (layer instanceof ol.layer.Group) {
		var extent = ol.extent.createEmpty();
		layer.getLayers().forEach(function(layer2) {
			if (layer2.getSource() instanceof ol.source.TileWMS) {
				var param = layer2.getSource().getParams();
				var keys = Object.keys(param);
				var bbx = "bbox";
				for (var i = 0; i < keys.length; i++) {
					if (keys[i].toLowerCase() === bbx.toLowerCase()) {
						var bbox = param[keys[i]].split(",");
						ol.extent.extend(extent, bbox);
						break;
					}
				}
			} else if (layer2.source instanceof ol.source.Vector) {
				ol.extent.extend(extent, layer2.getSource().getExtent());
			}
		});
		this.getMap().getView().fit(extent, this.getMap().getSize());
	} else if (layer instanceof ol.layer.Vector) {
		var view = this.getMap().getView();
		view.fit(source.getExtent(), this.getMap().getSize());
	} else if (layer instanceof ol.layer.Tile) {
		var source = layer.getSource();
		if (source instanceof ol.source.TileWMS) {
			var param = source.getParams();
			var keys = Object.keys(param);
			var bbx = "bbox";
			for (var i = 0; i < keys.length; i++) {
				if (keys[i].toLowerCase() === bbx.toLowerCase()) {
					var bbox = param[keys[i]].split(",");
					var view = this.getMap().getView();
					view.fit(bbox, this.getMap().getSize());
					break;
				}
			}
		}
	} else if (layer instanceof ol.layer.Layer) {
		var source = layer.getSource();
		var func = function(src) {
			var param = src.getParams();
			var keys = Object.keys(param);
			var bbx = "bbox";
			for (var i = 0; i < keys.length; i++) {
				if (keys[i].toLowerCase() === bbx.toLowerCase()) {
					var bbox = param[keys[i]].split(",");
					var view = that.getMap().getView();
					view.fit(bbox, that.getMap().getSize());
					break;
				}
			}
		};
		if (typeof source === "undefined" || source === null) {
//			this.setWMSSource(layer, func);
		} else if (source instanceof ol.source.TileWMS) {
			func(source);
		}
	}
	return;
};

/**
 * EditingTool에 새로운 Interaction을 추가한다.
 * @example
 * // EditingTool 객체 선언
 * var edit = new gb.header.EditingTool({
 *  ...
 * });
 * 
 * // 홀 폴리곤 그리기 객체 선언
 * var hole = new gb.interaction.HoleDraw({
 *  selected : epan.selected
 * });
 * 
 * // EditingTool에 홀 폴리곤 그리기 기능 추가
 * edit.addInteraction({
 *  icon : "fab fa-bitbucket",
 *  content : "Hole",
 *  interaction : hole,
 *  selectActive : true,
 *  "float" : "right",
 *  clickEvent : function() {
 *   console.log("Hole draw");
 *  }
 * });
 * @method gb.edit.EditingTool#addInteraction
 * @function
 * @param {Object}
 *            options - Interaction 추가 옵션
 * @param {ol.interaction.Interaction}
 *            options.interaction - 추가하려는 Interaction 객체
 * @param {string}
 *            [options.content=Unknown] - 작업 버튼에 표시될 작업명
 * @param {string}
 *            [options.icon=fas fa-asterisk] - 작업 버튼에 표시될 아이콘. fontawesome 참조({@link https://fontawesome.com/})
 * @param {function}
 *            [options.clickEvent] - 작업 활성화 버튼 클릭 시 실행될 함수
 * @param {string}
 *            [options.className] - 작업 버튼 태그 Class명 설정
 * @param {Object}
 *            [options.color] - Interaction 추가 옵션
 * @param {boolean}
 *            [options.selectActive=false] - ol.interaction.Select 객체와의 연동 여부. True 입력 시 선택된 Feature가 있을 시에만 작업이 활성화됨
 * @param {string}
 *            [options.float] - EditingTool 작업표시줄에서의 float 스타일
 */
gb.edit.EditingTool.prototype.addInteraction = function(options){
	function adjustStyle(element, style){
		for(var content in style){
			element.css(content, style[content]);
		}
	}
	var interaction = options.interaction;
	if(!(interaction instanceof ol.interaction.Interaction)){
		console.error("gb.edit.EditingTool: The type of 'interaction' must be an ol.interaction.Interaction");
		return;
	}
	this.customInteractions.push(interaction);
	this.map.addInteraction(interaction);
	interaction.setActive(false);

	var content = options.content || "Unknown";
	var icon = options.icon || "fas fa-asterisk";
	var clickEvent = options.clickEvent;
	var className = options.className;
	var color = options.color;
	var selectActive = options.selectActive || false;


	var iTag = $("<i>").addClass(icon).attr("aria-hidden", "true");
	var aTag = $("<a>").attr("href", "#");
	var liTag = $("<li>");

	this.btn[content] = aTag;

	aTag.hover(function(){
		if(!$(this).hasClass("active")){
			$(this).css("color", "#23527c");
			$(this).css("text-decoration", "none");
		}
	},function(){
		if(!$(this).hasClass("active")){
			$(this).css("color", "rgb(85, 85, 85)");
		}
	});

	// content element 저장
	this.contentList.push(aTag);

	var that = this;
	aTag.click(function(){
		that.deactiveAnotherInteraction(interaction, selectActive);
		if(typeof clickEvent === "function"){
			clickEvent();
		}
		if(interaction.getActive()){
			interaction.setActive(false);
			that.deactiveBtn_(content);
			if(selectActive){
				that.deactiveAnotherInteraction(that.interaction.select);
			}
		} else {
			if(interaction.setSelectFeatures instanceof Function){
				interaction.setSelectFeatures(that.selected);
			} else {
				var prevSelected = that.selectedSource;
				var prevTreeid;
				if(prevSelected !== undefined){
					if(!!prevSelected.get("git")){
						prevTreeid = prevSelected.get("git").treeID || "";
					}
				}
				
				if(that.otree.getJSTree().get_node(prevTreeid)){
					that.otree.getJSTree().set_flag(that.otree.getJSTree().get_node(prevTreeid), "editing", false);
				}
			}
			
			interaction.setActive(true);
			that.activeBtn_(content);
		}
	});

	if(className){
		liTag.addClass(className);
	}

	if(color){
		iTag.css("color", color);
	}

	adjustStyle(iTag, this.iStyle);
	adjustStyle(aTag, this.aStyle);
	adjustStyle(liTag, this.liStyle);

	if(this.translation[content]){
		aTag.html(this.translation[content][this.locale]);
	} else {
		aTag.html(content);
	}

	aTag.prepend(iTag);
	liTag.append(aTag);

	if(!options.float){
		this.ulTagLeft.append(liTag);
	} else {
		if(options.float === "right"){
			liTag.css("padding-left", "0").css("padding-right", "20px");
			this.ulTagRight.append(liTag);
		} else if(options.float === "left"){
			this.ulTagLeft.append(liTag);
		} else {
			this.ulTagLeft.append(liTag);
		}
	}
}

/**
 * 설정한 interaction 객체를 제외한 모든 interaction 객체를 비활성화한다.
 * 
 * @method gb.edit.EditingTool#deactiveAnotherInteraction
 * @function
 * @param {ol.interaction.Interaction}
 *            interaction - 비활성화 시키지않을 interaction 객체
 * @param {boolean}
 *            select - ture 설정 시 선택된 객체들을 해제하지않음. false 설정 시 현재 선택된 객체들을 해제.
 */
gb.edit.EditingTool.prototype.deactiveAnotherInteraction = function(interaction, select){
	var bool = select || false;
	for(var i in this.interaction){
		if(interaction !== this.interaction[i] && !!this.interaction[i]){
			if(this.interaction[i] instanceof ol.interaction.Select && !bool){
				this.interaction[i].getFeatures().clear();
			}

			if(this.interaction[i] instanceof ol.interaction.Translate){
				this.move();
			}
			this.interaction[i].setActive(false);
		}
	}

	for(var i in this.customInteractions){
		if(interaction !== this.customInteractions[i]){
			this.customInteractions[i].setActive(false);
		}
	}

	if(interaction instanceof ol.interaction.Select || interaction instanceof ol.interaction.DragBox){
		this.getInteraction_("select").setActive(true);
		this.getInteraction_("dragbox").setActive(true);
		this.isOn["select"] = true;
		this.isOn["dragbox"] = true;
	}
}

/**
 * Openlayers Map 객체에 포함되어있는 모든 Tile 레이어들을 반환한다.
 * 
 * @method gb.edit.EditingTool#getTileLayersInMap
 * @function
 * @param {ol.Map}
 *            map - 오픈레이어스 맵 객체
 * @return {Array.<ol.layer.Tile>}
 */
gb.edit.EditingTool.prototype.getTileLayersInMap = function(map){
	var tileLayers = [];
	var wmsLayers;
	
	// wms 성능 고도화 시작
	map.getLayers().forEach(function(e){
		var layer, git, layers, temp;
		
		layer = e;
		git = layer.get("git");
		
		if(layer instanceof ol.layer.Tile){
			if(git instanceof Object){
				if(git.fake === "parent"){
					if(git.layers instanceof ol.Collection){
						layers = git.layers.getArray();
						for(var i = 0; i < layers.length; i++){
							tileLayers.push(layers[i]);
						}
					}
				} else {
					tileLayers.push(layer);
				}
			}
		} else if(layer instanceof ol.layer.Group){
			if(git instanceof Object){
				if(git.allChildren){
					temp = layer.getLayersArray();
					for(var i = 0; i < temp.length; i++){
						git = temp[i].get("git");
						
						if(git instanceof Object){
							if(git.fake === "parent"){
								if(git.layers instanceof ol.Collection){
									layers = git.layers.getArray();
									for(var i = 0; i < layers.length; i++){
										tileLayers.push(layers[i]);
									}
								}
							} else {
								tileLayers.push(temp[i]);
							}
						}
					}
				}
			}
		}
	});
	// wms 성능 고도화 끝
	
	// 이전 코드 시작
//	map.getLayers().forEach(function(layer){
//		if(layer instanceof ol.layer.Tile){
//			tileLayers.push(layer);
//		}
//		if(layer instanceof ol.layer.Group){
//			tileLayers.push(layer);
//			layer.getLayers().forEach(function(tile){
//				if(tile instanceof ol.layer.Tile){
//					tileLayers.push(tile);
//				}
//				if(tile instanceof ol.layer.Group){
//					tileLayers.push(tile);
//					tile.getLayers().forEach(function(node){
//						if(node instanceof ol.layer.Tile){
//							tileLayers.push(node);
//						}
//					});
//				}
//			});
//		}
//	});
	// 이전 코드 끝

	return tileLayers;
}

/**
 * render 모드가 Vector인 모든 Vector 레이어들을 반환한다.
 * 
 * @method gb.edit.EditingTool#getVectorVectorLayersInMap
 * @function
 * @param {ol.Collection.<ol.layer.Base>}
 *            collection - Vector 레이어를 가지고 있는 ol.Collection 객체
 * @param {Array}
 *            dish - Vector 레이어들을 담을 배열 객체
 * @return {Array.<ol.layer.Vector>}
 */
gb.edit.EditingTool.prototype.getVectorVectorLayersInMap = function(collection, dish){
	var that = this;
	var source = undefined;
	var temp = undefined;
	collection.forEach(function(layer){
		if (layer instanceof ol.layer.Vector) {
			if (layer.get("renderMode").toLowerCase() === "image") {
				source = layer.getSource();
				temp = source.get("git") instanceof Object ? source.get("git").tempLayer : undefined;
				if (Array.isArray(dish) && temp instanceof ol.layer.Vector) {
					dish.push(temp);
				} else {
					console.error(that.translation.returnMustArray[that.locale]);
				}
			}
		} else if (layer instanceof ol.layer.Group) {
			var innerLayers = layer.getLayers();
			that.getVectorVectorLayersInMap(innerLayers, dish);
		}
	});
	return dish;
}

/**
 * render 모드가 Image인 모든 Vector 레이어들을 반환한다.
 * 
 * @method gb.edit.EditingTool#getImageVectorLayersInMap
 * @function
 * @param {ol.Collection.<ol.layer.Base>}
 *            collection - Vector 레이어를 가지고 있는 ol.Collection 객체
 * @param {Array}
 *            dish - Vector 레이어들을 담을 배열 객체
 * @return {Array.<ol.layer.Vector>}
 */
gb.edit.EditingTool.prototype.getImageVectorLayersInMap = function(collection, dish){
	var that = this;
	collection.forEach(function(layer){
		if (layer instanceof ol.layer.Vector) {
			if (layer.get("renderMode").toLowerCase() === "image") {
				if (Array.isArray(dish)) {
					dish.push(layer);
				} else {
					console.error(that.translation.returnMustArray[that.locale]);
				}	
			}
		} else if (layer instanceof ol.layer.Group) {
			var innerLayers = layer.getLayers();
			that.getImageVectorLayersInMap(innerLayers, dish);
		}
	});
	return dish;
}

/**
 * Geoserver로부터 Import된 모든 레이어들에 WFS를 요청하여 Openlayer Map에 Vector 레이어를 생성한다.
 * gb.tree.OpenLayers 객체가 필수적으로 설정되어 있어야만 한다.
 * 
 * @method gb.edit.EditingTool#loadWFS_
 * @function
 * @private
 */
gb.edit.EditingTool.prototype.loadWFS_ = function(){
	var that = this;
	var tileLayers = that.getTileLayersInMap(that.map);
	var tree = this.otree.getJSTree();
	var selectedLayer;
	var vectorSource;
	
	for(var i in tileLayers){
		if(typeof tileLayers[i].get("git") === "object"){
			if(!this.getVectorSourceOfServer(tileLayers[i].get("treeid"))){
				// 레이어가 요청된 적이 있는지 확인. 각 레이어들은 tree ID로 구분.
				if(tileLayers[i] instanceof ol.layer.Group){
					continue;
				}
				
				// Vector source를 새로 요청하여 gb.edit.EditingTool~vectorSourcesOfServer_ 변수에 저장
				vectorSource = this.setVectorSourceOfServer(tileLayers[i].get("git"), tileLayers[i].get("id"), 
						tileLayers[i].get("name"), tileLayers[i].get("treeid"), tileLayers[i].getSource().getParams()["SLD_BODY"]);
				selectedLayer = $(this.treeElement).jstreeol3("get_selected_layer");
				if(selectedLayer.length === 1){
					if(tileLayers[i].get("treeid") === selectedLayer[0].get("treeid")){
						this.updateSelected();
						this.select(vectorSource);
					}
				}
				
				if(!!tree.get_node(tileLayers[i].get("treeid"))){
					if(!tree.get_node(tileLayers[i].get("treeid")).state.hiding){
						vectorSource.get("git").tempLayer.setMap(this.map);
					} else {
						vectorSource.get("git").tempLayer.setMap(null);
					}
					
					if(tree.get_node(tileLayers[i].get("treeid")).state.snapping){
						this.snapVector.push(vectorSource.get("git").tempLayer);
					}
				}
			} else {
				if(!!tree.get_node(tileLayers[i].get("treeid"))){
					
					if(!this.getVectorSourceOfServer(tileLayers[i].get("treeid")).get("git")){
						continue;
					}
					
					if(!tree.get_node(tileLayers[i].get("treeid")).state.hiding){
						this.getVectorSourceOfServer(tileLayers[i].get("treeid")).get("git").tempLayer.setMap(this.map);
					} else {
						this.getVectorSourceOfServer(tileLayers[i].get("treeid")).get("git").tempLayer.setMap(null);
					}
				}
			}
		}
	}
	
	var ext = 
		this.getMap()
			.getView()
			.calculateExtent(
				this.getMap().getSize()
			);
	
	this.loadSnappingLayer(ext);
	
//	for(var i in this.customVector_){
//		this.customVector_[i].get("git").tempLayer.setVisible(true);
//	}
}

/**
 * 현재 편집중인 레이어의 z-index를 최상위로 설정한다.
 * 
 * @method gb.edit.EditingTool#moveUpEditingLayer_
 * @function
 * @private
 */
gb.edit.EditingTool.prototype.moveUpEditingLayer_ = function(){
	var layers  = $(this.treeElement).jstreeol3("get_selected_layer");
	var tree = this.otree.getJSTree();
	var layer;
	if (layers.length === 1) {
		layer = layers[0];
	}
	if (layer instanceof ol.layer.Vector || layer instanceof ol.layer.Tile) {
		var source = layer.getSource();
		var git = layer.get("git");
		var tlayer = git.tempLayer;
		if (tlayer instanceof ol.layer.Vector) {
			tlayer.setMap(null);
			tlayer.setMap(this.map);
		}
	}
};

/**
 * OpenLayers Tree에 로드된 모든 Vector 레이어들의 render mode 및 z-index를 설정한다.
 * 
 * @method gb.edit.EditingTool#loadVector_
 * @function
 * @private
 */
gb.edit.EditingTool.prototype.loadVector_ = function(){
	var rootLayers =  this.map.getLayers();
	var dish = [];
	var vecLayers = this.getImageVectorLayersInMap(rootLayers, dish);
	var tree = this.otree.getJSTree();
	var selectedLayer;
	var vectorSource;

	for(var i in vecLayers){
		if(typeof vecLayers[i].get("git") === "object"){
			if(!this.getVectorSourceOfVector(vecLayers[i].get("treeid"))){
				if(vecLayers[i] instanceof ol.layer.Group){
					continue;
				}
				vectorSource = this.setVectorSourceOfVector(vecLayers[i].get("git"), vecLayers[i].get("id"), 
						vecLayers[i].get("name"), vecLayers[i].get("treeid"));
				selectedLayer = $(this.treeElement).jstreeol3("get_selected_layer");
				if(selectedLayer.length === 1){
					if(vecLayers[i].get("treeid") === selectedLayer[0].get("treeid")){
						this.updateSelected();
						this.select(vectorSource);
					}
				}
				
				if(!!tree.get_node(vecLayers[i].get("treeid"))){
					if(!tree.get_node(vecLayers[i].get("treeid")).state.hiding){
						zidx = vecLayers[i].getZIndex();
						if (!isNaN(parseInt(zidx))) {
							vectorSource.get("git").tempLayer.setZIndex(zidx);
						}
						vectorSource.get("git").tempLayer.setMap(this.map);
					} else {
						vectorSource.get("git").tempLayer.setMap(null);
					}
				}
			} else {
				if(!!tree.get_node(vecLayers[i].get("treeid"))){
					if(!tree.get_node(vecLayers[i].get("treeid")).state.hiding){
						zidx = vecLayers[i].getZIndex();
						if (!isNaN(parseInt(zidx))) {
							this.getVectorSourceOfVector(vecLayers[i].get("treeid")).get("git").tempLayer.setZIndex(zidx);
						}
						this.getVectorSourceOfVector(vecLayers[i].get("treeid")).get("git").tempLayer.setMap(this.map);
					} else {
						this.getVectorSourceOfVector(vecLayers[i].get("treeid")).get("git").tempLayer.setMap(null);
					}
				}
			}
		}
	}
	
//	for(var i in this.customVector_){
//		this.customVector_[i].get("git").tempLayer.setVisible(true);
//	}
}

/**
 * WFS 레이어들의 가시화 여부를 설정한다.
 * 
 * @method gb.edit.EditingTool#setVisibleWFS
 * @function
 * @param {boolean}
 *            bool - 가시화 여부
 */
gb.edit.EditingTool.prototype.setVisibleWFS = function(bool){
	var tree = this.otree.getJSTree();
	var set;
	if(bool){
		set = this.map;
	} else {
		set = null;
	}

	for(var i in this.vectorSourcesOfServer_){
		if(!!tree.get_node(i)){
			if(!tree.get_node(i).state.hiding){
				var vlayer = tree.get_LayerById(i);
				if (vlayer !== undefined) {
					zidx = vlayer.getZIndex();
					var git = vlayer.get("git");
					if (git !== undefined) {
						var tlayer = git.tempLayer;
						if (tlayer !== undefined) {
							tlayer.setZIndex(zidx);
						}
					}					
				}
				this.vectorSourcesOfServer_[i].get("git").tempLayer.setMap(set);
			} else {
				this.vectorSourcesOfServer_[i].get("git").tempLayer.setMap(null);
			}
		}
	}

//	for(var i in this.customVector_){
//		this.customVector_[i].get("git").tempLayer.setVisible(set);
//	}
}

/**
 * WMS 레이어들의 가시화 여부를 설정한다.
 * 
 * @method gb.edit.EditingTool#setVisibleWMS
 * @function
 * @param {boolean}
 *            bool - 가시화 여부
 */
gb.edit.EditingTool.prototype.setVisibleWMS = function(bool){
//	var tileLayers = this.getTileLayersInMap(this.map);
	var tree = this.otree.getJSTree();
//	
//	for(var i = 0; i < tileLayers.length; i++){
//		if(!!tree.get_node(tileLayers[i].get("treeid"))){
//			if(!tree.get_node(tileLayers[i].get("treeid")).state.hiding){
//				zidx = tileLayers[i].getZIndex();
//				var git = tileLayers[i].get("git");
//				if (git !== undefined) {
//					var tlayer = git.tempLayer;
//					if (tlayer !== undefined) {
//						tlayer.setZIndex(zidx);
//					}
//				}
//				tileLayers[i].setVisible(bool);
//			} else {
//				tileLayers[i].setVisible(false);
//			}
//		}
//	}
	
	// wms 성능 고도화 시작
	this.map.getLayers().forEach(function(e){
		var layer, git, temp, zidx, tlayer;
		
		layer = e;
		git = layer.get("git");
		
		if(layer instanceof ol.layer.Tile){
			if(git instanceof Object){
				if(git.fake !== "child"){
					if(!!tree.get_node(layer.get("treeid"))){
						if(!tree.get_node(layer.get("treeid")).state.hiding){
							zidx = layer.getZIndex();
							tlayer = git.tempLayer;
							if (tlayer !== undefined) {
								tlayer.setZIndex(zidx);
							}
							layer.setVisible(bool);
						} else {
							layer.setVisible(false);
						}
					}
				}
			}
		} else if(layer instanceof ol.layer.Group){
			if(git instanceof Object){
				if(git.allChildren){
					temp = layer.getLayersArray();
					for(var i = 0; i < temp.length; i++){
						git = temp[i].get("git");
						
						if(git instanceof Object){
							if(git.fake !== "child"){
								if(!!tree.get_node(temp[i].get("treeid"))){
									if(!tree.get_node(temp[i].get("treeid")).state.hiding){
										zidx = temp[i].getZIndex();
										tlayer = git.tempLayer;
										if (tlayer !== undefined) {
											tlayer.setZIndex(zidx);
										}
										temp[i].setVisible(bool);
									} else {
										temp[i].setVisible(false);
									}
								}
							}
						}
					}
				}
			}
		}
	});
	// wms 성능 고도화 끝
}

/**
 * render 모드가 Vector인 Vector 레이어들의 가시화 여부를 설정한다.
 * 
 * @method gb.edit.EditingTool#setVisibleVectorVector
 * @function
 * @param {boolean}
 *            bool - 가시화 여부
 */
gb.edit.EditingTool.prototype.setVisibleVectorVector = function(bool){
	var rootLayers = this.map.getLayers();
	var dish = [];
	var source = undefined;
	var vecLayers = this.getVectorVectorLayersInMap(rootLayers, dish);
	var tree = this.otree.getJSTree();
	var set;
	if(bool){
		set = this.map;
	} else {
		set = null;
	}
	
	for(var i = 0; i < vecLayers.length; i++){
		source = vecLayers[i].getSource();
		if(!source){
			continue;
		}
		if(!!tree.get_node(source.get("git").treeID)){
			if(!tree.get_node(source.get("git").treeID).state.hiding){
				vecLayers[i].setMap(set);
			} else {
				vecLayers[i].setMap(null);
			}
		}
	}
}

/**
 * render 모드가 Image인 Vector 레이어들의 가시화 여부를 설정한다.
 * 
 * @method gb.edit.EditingTool#setVisibleImageVector
 * @function
 * @param {boolean}
 *            bool - 가시화 여부
 */
gb.edit.EditingTool.prototype.setVisibleImageVector = function(bool){
	var rootLayers = this.map.getLayers();
	var dish = [];
	var vecLayers = this.getImageVectorLayersInMap(rootLayers, dish);
	var tree = this.otree.getJSTree();
	
	for(var i = 0; i < vecLayers.length; i++){
		if(!!tree.get_node(vecLayers[i].get("treeid"))){
			if(!tree.get_node(vecLayers[i].get("treeid")).state.hiding){
				vecLayers[i].setVisible(bool);
			} else {
				vecLayers[i].setVisible(false);
			}
		}
	}
}

/**
 * 모든 Tile 레이어를 refresh 한다.
 * 
 * @method gb.edit.EditingTool#refreshTileLayer
 * @function
 */
gb.edit.EditingTool.prototype.refreshTileLayer = function(){
	var tileLayers = this.getTileLayersInMap(this.map);

	for(var i = 0; i < tileLayers.length; i++){
		if(tileLayers[i] instanceof ol.layer.Tile){
			tileLayers[i].getSource().refresh();
		}
	}
}

/**
 * 모든 Vector 레이어를 refresh 한다.
 * 
 * @method gb.edit.EditingTool#refreshSources
 * @function
 */
gb.edit.EditingTool.prototype.refreshSources = function(){
	var source = this.getVectorSourcesOfServer();

	for(var i = 0; i < source.length; i++){
		source[i].clear(true);
	}
}

/**
 * Geoserver 로부터 Import된 레이어들의 WFS 데이터로부터 vector source 객체를 생성하여 변수에 저장한다.
 * 
 * @method gb.edit.EditingTool#setVectorSourceOfServer
 * @function
 * @param {Object}
 *            obj - Geoserver 레이어 정보 객체
 * @param {string}
 *            obj.geoserver - geoserver명
 * @param {string}
 *            obj.workspace - workspace명
 * @param {boolean}
 *            obj.labelActive - label 스타일 활성화 여부
 * @param {Object}
 *            obj.labelOptions - label 스타일 옵션({@link gb.layer.Label})
 * @param {string}
 *            layerId - 레이어 아이디
 * @param {string}
 *            layerName - 레이어명
 * @param {string}
 *            treeId - Openlayer Tree 아이디
 * @param {string}
 *            sld - 레이어 스타일 SLD
 * @return {ol.source.Vector|null} vector source 객체가 이미 저장되어있거나 잘못된 요청일 경우 null 값 반환
 */
gb.edit.EditingTool.prototype.setVectorSourceOfServer = function(obj, layerId, layerName, treeId, sld){
	var git = obj || {};
	var layerid = layerId;
	var layername = layerName;
	var treeid = treeId;
	var url = this.wfsURL;
	if(!this.getVectorSourceOfServer(treeid)){
		var vectorSource = new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			loader: function(extent, resolution, projection){

				params = {
					"serverName": git.geoserver,
					"workspace": git.workspace,
					"version" : gb.module.serviceVersion.WFS,
					"typeName" : layername,
					"bbox" : extent.join(","),
					"outputformat" : "application/json"
				};

				$.ajax({
					url : url,
					type : "GET",
					contentType : "application/json; charset=UTF-8",
					data : params,
					dataType : "JSON",
					success : function(data) {
						var features = vectorSource.getFormat().readFeatures(data);
						vectorSource.addFeatures(features);
					},
					error: function(jqXHR, textStatus, errorThrown){
						console.log(errorThrown);
					}
				});
			},
			strategy: ol.loadingstrategy.bbox
		});

		this.vectorSourcesOfServer_[treeid] = vectorSource;

		var layer = new ol.layer.Vector({
			renderMode: "vector",
			source: vectorSource
		});
		layer.set("id", layerid);
		layer.set("name", layername);
// layer.setMap(this.map);

		if(sld !== undefined){
			var symbol = gb.style.LayerStyle.prototype.parseSymbolizer.call(this, sld);
			var style = new ol.style.Style({
				"fill": new ol.style.Fill({
					"color": !!symbol.fillRGBA ? ol.color.asArray(symbol.fillRGBA) : null
				}),
				"stroke": new ol.style.Stroke({
					"color": ol.color.asArray(symbol.strokeRGBA || null),
					"width": symbol.strokeWidth || null,
					"lineDash": symbol.strokeDashArray || null,
					"lineCap": "butt"
				}),
				"image": new ol.style.Circle({
					"radius": !!symbol.pointSize ? parseFloat(symbol.pointSize)/2 : null,
					"fill": new ol.style.Fill({
						"color": !!symbol.fillRGBA ? ol.color.asArray(symbol.fillRGBA) : null
					}),
					"stroke": new ol.style.Stroke({
						"color": !!symbol.strokeRGBA ? ol.color.asArray(symbol.strokeRGBA) : null,
						"width": symbol.strokeWidth || null,
						"lineDash": symbol.strokeDashArray || null,
						"lineCap": "butt"
					})
				})
			});
			layer.setStyle(style);
			if(gb.layer.Label !== undefined && git.labelActive){
				layer.setStyle(new gb.layer.Label({
					layer: layer,
					labelOptions: git.labelOptions
				}));
			}
		}

		git.layerID = layerid;
		git.tempLayer = layer;
		git.treeID = treeid;
		vectorSource.set("git", git);

		return vectorSource;
	} else {
		console.log(treeid);
	}
	return null;
}

/**
 * Openlayers Map에 로드되어있는 Vector 레이어들에 대하여 
 * render 모드가 "Vector"인 vector source 객체를 생성하여 변수에 저장한다.
 * 
 * @method gb.edit.EditingTool#setVectorSourceOfVector
 * @function
 * @param {Object}
 *            obj - 벡터 레이어 정보 객체
 * @param {string}
 *            layerId - 레이어 아이디
 * @param {string}
 *            layerName - 레이어명
 * @param {string}
 *            treeId - Openlayer Tree 노드 아이디
 * @return {ol.source.Vector|null} vector source 객체가 이미 저장되어있거나 잘못된 요청일 경우 null 값 반환
 */
gb.edit.EditingTool.prototype.setVectorSourceOfVector = function(obj, layerId, layerName, treeId){
	var git = obj || {};
	var layerid = layerId;
	var layername = layerName;
	var treeid = treeId;
	var url = this.wfsURL;
	if(!this.getVectorSourceOfVector(treeid)){
		var vlayer = this.otree.getJSTree().get_LayerById(treeId);
		var vectorSource = vlayer instanceof ol.layer.Vector ? vlayer.getSource() : undefined;
		console.log(layerid);
		this.vectorSourcesOfVector_[treeid] = vectorSource;

		var layer = new ol.layer.Vector({
			renderMode: "vector",
			source: vectorSource
		});
		layer.set("id", layerid);
		layer.set("name", layername);
		if (vlayer.getStyle() !== undefined) {
			layer.setStyle(vlayer.getStyle());
		}
// layer.setMap(this.map);

		git.layerID = layerid;
		git.tempLayer = layer;
		git.treeID = treeid;
		vectorSource.set("git", git);

		return vectorSource;
	}
	return null;
}

/**
 * Geoserver로부터 Import된 레이어의 Vector source를 반환한다.
 * 
 * @method gb.edit.EditingTool#getVectorSourceOfServer
 * @function
 * @param {string}
 *            treeId - Openlayer Tree 노드 아이디
 * @return {ol.source.Vector|undifined} vector source 가 없을 경우 undifined 값 반환
 */
gb.edit.EditingTool.prototype.getVectorSourceOfServer = function(treeId){
	return this.vectorSourcesOfServer_[treeId];
}

/**
 * Geoserver로부터 Import된 모든 레이어들의 Vector source를 배열 형태로 반환한다.
 * 
 * @method gb.edit.EditingTool#getVectorSourcesOfServer
 * @function
 * @return {Array.<ol.source.Vector>}
 */
gb.edit.EditingTool.prototype.getVectorSourcesOfServer = function(){
	var a = [];
	for(var i in this.vectorSourcesOfServer_){
		a.push(this.vectorSourcesOfServer_[i]);
	}
	return a;
}

/**
 * 특정 벡터 레이어의 Vector source를 반환한다.
 * 
 * @method gb.edit.EditingTool#getVectorSourceOfVector
 * @function
 * @param {string}
 *            treeId - Openlayer Tree 노드 아이디
 * @return {ol.source.Vector|undifined} vector source 가 없을 경우 undifined 값 반환
 */
gb.edit.EditingTool.prototype.getVectorSourceOfVector = function(treeId){
	return this.vectorSourcesOfVector_[treeId];
}

/**
 * 모든 벡터 레이어들의 Vector source를 배열 형태로 반환한다.
 * 
 * @method gb.edit.EditingTool#getVectorSourcesOfVector
 * @function
 * @return {Array.<ol.source.Vector>}
 */
gb.edit.EditingTool.prototype.getVectorSourcesOfVector = function(){
	var a = [];
	for(var i in this.vectorSourcesOfVector_){
		a.push(this.vectorSourcesOfVector_[i]);
	}
	return a;
}

/**
 * EditingTool 작업표시줄을 생성한다.
 * 
 * @method gb.edit.EditingTool#editToolOpen
 * @function
 */
gb.edit.EditingTool.prototype.editToolOpen = function(){
	// openlayers tree wms layer 보기/숨김 기능 비활성화
	this.otree.getJSTree().setDisplayIndex(false);
	
	// editing tool 활성화 변수 설정
	this.setActiveTool(true);
	if(this.isEditing !== undefined){
		if(this.isEditing.set instanceof Function){
			this.isEditing.set(true);
		}
	}
	
	// WMS 레이어 숨김
	this.setVisibleWMS(false);
	
	// 이미지 벡터 레이어 숨김
	this.setVisibleImageVector(false);
	
	// 줌 레벨에 따른 실행 함수 결정
	if(this.checkActiveTool()){
		// 화면확대 요구 메세지창 숨김
		this.displayEditZoomHint(false);
		// WFS 레이어 로드
		this.loadWFS_();
		// 벡터벡터 레이어 로드
		this.loadVector_();
		// 벡터벡터 레이어 보이기
		this.setVisibleVectorVector(true);
		// 선택 레이어 업데이트
		this.select(this.updateSelected());
	} else {
		// 줌 레벨이 일정 이상이면 화면확대 요구 메세지창 생성
		this.displayEditZoomHint(true);
	}
}

/**
 * EditingTool 작업표시줄을 삭제한다.
 * 
 * @method gb.edit.EditingTool#editToolClose
 * @function
 */
gb.edit.EditingTool.prototype.editToolClose = function(){
	if(this.featureRecord.isEditing()){
		this.featureRecord.save(this);
		return;
	}
	
	// 현재 선택된 layer node의 편집 아이콘 삭제
	var prevSelected = this.selectedSource;
	var prevTreeid;
	if(prevSelected !== undefined){
		if(!!prevSelected.get("git")){
			prevTreeid = prevSelected.get("git").treeID || "";
		}
	}
	if(this.otree.getJSTree().get_node(prevTreeid)){
		this.otree.getJSTree().set_flag(this.otree.getJSTree().get_node(prevTreeid), "editing", false);
	}
	
	// openlayers tree wms layer 보기/숨김 기능 활성화
	this.otree.getJSTree().setDisplayIndex(true);
	
	// editing tool 활성화 변수 설정
	this.setActiveTool(false);
	if(this.isEditing !== undefined){
		if(this.isEditing.set instanceof Function){
			this.isEditing.set(false);
		}
	}
	
	// WMS 레이어 활성화
	this.setVisibleWMS(true);
	
	// 이미지 벡터 활성화
	this.setVisibleImageVector(true);
	
	// 벡터 벡터 활성화
	this.setVisibleVectorVector(false);
	
	// WFS 레이어 숨김
	this.setVisibleWFS(false);
	
	// 화면확대 요구 메세지창 숨김
	this.displayEditZoomHint(false);
	
	// 모든 interaction 비활성화
	this.deactiveAnotherInteraction();
	
	// 모든 interaction 버튼 비활성화
	this.deactiveAllBtn_();
	
	// WMS refresh
	this.refreshTileLayer();
	
	// WFS refresh
	this.refreshSources();
	
	this.selectSources.clear();
	this.selectedSource = undefined;
	this.vectorSourcesOfServer_ = {};
	this.vectorSourcesOfVector_ = {};
}

/**
 * EditingTool 작업표시줄 토글
 * 
 * @method gb.edit.EditingTool#editToolToggle
 * @function
 */
gb.edit.EditingTool.prototype.editToolToggle = function(){
	if(this.getActiveTool()){
		this.editToolClose();
	} else {
		this.editToolOpen();
	}
}

/**
 * 작업표시줄을 비활성화 시키고 도움말을 생성한다.
 * False값을 설정하면 작업표시줄이 다시 활성화 된다.
 * 
 * @method gb.edit.EditingTool#displayEditZoomHint
 * @function
 * @param {boolean}
 *            bool - 줌 레벨 도움말 생성 및 삭제
 */
gb.edit.EditingTool.prototype.displayEditZoomHint = function(bool){
	if(bool){
		if(this.headerTag.find(".gb-editingtool-zoom-hint").length === 0){
			this.ulTagLeft.css("display", "none");

			var editZoomHintTag = $("<h1 class='gb-editingtool-zoom-hint'>");
			var icon = $("<span>").html("<i class='fas fa-exclamation-circle'></i>");
			var text = $("<span>").html(this.translation.editToolHint[this.locale]);

//			editZoomHintTag.css("margin-top", "6px");
//			editZoomHintTag.css("padding-left", "6px");
//			editZoomHintTag.css("display", "inline-block");

			editZoomHintTag.append(icon);
			editZoomHintTag.append(text);
			this.headerTag.append(editZoomHintTag);
			
			var that = this;
			var icon = $("<i class='fas fa-plus'>");
			var span = $("<span class='label'>").append(icon).append(this.translation.editToolHint[this.locale]);
			
			var btn = $("<button class='gb-editingtool-zoomin-btn'>")
				.append(span)
				/*.click(function(){
					var view = that.map.getView();
					var extent = view.calculateExtent();
					var coordinates = [[[extent[0], extent[1]], [extent[2], extent[1]], [extent[2], extent[3]], [extent[0], extent[3]], [extent[0], extent[1]]]];
					var geom = new ol.geom.Polygon(coordinates);
					var area = ol.sphere.getArea(geom, {projection: view.getProjection().getCode()});
					area = Math.round(area/1000000*100)/100;
					
					var zoomSqrt = Math.sqrt((gb.edit.ACTIVEAREA)/area);
					var zoomExtent = [extent[0]*zoomSqrt, extent[1]*zoomSqrt, extent[2]*zoomSqrt, extent[3]*zoomSqrt];
					
					view.fit(zoomExtent);
				});*/
			
			var notice = $("<div id='zoomNotice' class='gb-editingtool-zoom-notice'>").append(btn);
			this.targetElement.append(notice);
		}

		// this.deactiveAnotherInteraction();
	} else {
		$("#zoomNotice").remove();
		this.headerTag.find(".gb-editingtool-zoom-hint").remove();
		this.ulTagLeft.css("display", "inline-block");
	}
}

/**
 * 현재 편집중인 레이어의 vector source 객체들를 반환한다.
 * 
 * @method gb.edit.EditingTool#getSelectSources
 * @function
 * @return {ol.Collection.<ol.source.Vector>}
 */
gb.edit.EditingTool.prototype.getSelectSources = function(){
	return this.selectSources;
}

/**
 * 현재 지도의 줌 레벨이 EditingTool을 활성화할 수 있는 레벨인지 여부를 boolean값으로 반환한다.
 * True 값이 반환될 시에 작업표시줄 활성화가 가능하다.
 * @method gb.edit.EditingTool#checkActiveTool
 * @function
 * @return {boolean}
 */
gb.edit.EditingTool.prototype.checkActiveTool = function(){
	var map = this.map;
	var view = map.getView();
	var extent = view.calculateExtent();
	var zoom = view.getZoom();

	var coordinates = [[[extent[0], extent[1]], [extent[2], extent[1]], [extent[2], extent[3]], [extent[0], extent[3]], [extent[0], extent[1]]]];
	var geom = new ol.geom.Polygon(coordinates);
	var area = ol.sphere.getArea(geom, {projection: view.getProjection().getCode()});
	var active;
	if((Math.round(area/1000000*100)/100) <= gb.edit.ACTIVEAREA){
		active = true;
	} else {
		active = false;
	}
	
	return active;
}