/**
 * 오픈레이어스 커스텀 플러그인 로드 필요
 * @external "jsTree-openlayers plugin"
 */
/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.tree)
	gb3d.tree = {};
/**
 * @classdesc 오픈레이어스 레이어 목록을 표시한다.
 * @class gb3d.tree.OpenLayers
 * @memberof gb3d.tree
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {HTMLElement} obj.append - 영역 본문이 삽입될 부모 노드의 ID 또는 Class 또는 Element
 * @param {ol.Map} obj.map - 편집 영역을 담당하는 ol.Map
 * @param {Object} obj.url - 요청 주소 정보
 * @param {string} obj.url.getLegend - WMS 범례 이미지를 요청할 URL
 * @param {string} [obj.token] - 요청 토큰
 * @param {gb.geoserver.UploadGeoJSON} obj.uploadJSON - Geoserver JSON 업로드 기능 객체
 * @param {gb.edit.EditingTool} obj.editingTool - 편집 기능 객체
 * @param {string|undefined} [obj.locale="en"] - 언어 코드
 * @author SOYIJUN
 * @date 2018.07.02
 * @version 0.01
 */
gb3d.tree.OpenLayers = function(obj) {
	var that = this;
	this.translation = {
			"downloadtiles" : {
				"en" : "Download 3D Tiles",
				"ko" : "3D Tiles 다운로드"
			},
			"import3dfile" : {
				"en" : "Import a 3D file",
				"ko" : "3D 파일 불러오기"
			},
			"zoom" : {
				"en" : "Zoom",
				"ko" : "확대"
			},
			"snap" : {
				"en" : "Snap",
				"ko" : "스냅"
			},
			"countOfFeature" : {
				"en" : "Count",
				"ko" : "객체개수"
			},
			"prop" : {
				"ko" : "속성",
				"en" : "Properties"
			},
			"style" : {
				"en" : "Style",
				"ko" : "스타일"
			},
			"navigator" : {
				"en" : "Navigator",
				"ko" : "객체추적"
			},
			"layerCode" : {
				"en" : "Code",
				"ko" : "코드"
			},
			"layerName" : {
				"en" : "Name",
				"ko" : "이름"
			},
			"layerType" : {
				"en" : "Type",
				"ko" : "유형"
			},
			"add" : {
				"ko" : "추가",
				"en" : "Add"
			},
			"close" : {
				"ko" : "닫기",
				"en" : "Close"
			},
			"cancel" : {
				"ko" : "취소",
				"en" : "Cancel"
			},
			"delete" : {
				"ko" : "삭제",
				"en" : "Delete"
			},
			"deleteLayer" : {
				"ko" : "레이어 삭제",
				"en" : "Delete Layer"
			},
			"deleteAttr" : {
				"ko" : "속성 삭제",
				"en" : "Delete Attribute"
			},
			"deleteHint" : {
				"ko" : "정말로 삭제하시겠습니까?",
				"en" : "Are you sure to delete?"
			},
			"deleteLayerHint" : {
				"ko" : "선택한 레이어를 정말로 삭제하시겠습니까?",
				"en" : "Are you sure to delete this layer?"
			},
			"deleteLayersHint" : {
				"ko" : "선택한 레이어들을 정말로 삭제하시겠습니까?",
				"en" : "Are you sure to delete these layers?"
			},
			"inputNameHint" : {
				"ko" : "Layer 이름을 입력해주세요!",
				"en" : "Please enter a layer name!"
			},
			"inputAttrHint" : {
				"ko" : "속성값 이름을 입력해주세요!",
				"en" : "Please enter a Attribute name!"
			},
			"uploadFile" : {
				"ko" : "Zip 파일 올리기",
				"en" : "Upload zip file"
			},
			"uploadImage" : {
				"ko" : "이미지 올리기",
				"en" : "Upload Image"
			},
			"attribute" : {
				"en" : "Attribute",
				"ko" : "속성"
			},
			"addAttribute" : {
				"en" : "Add Attribute",
				"ko" : "속성 추가"
			},
			"addLayer" : {
				"en" : "Add layer",
				"ko" : "레이어 추가"
			},
			"exLayerCodeField" : {
				"en" : "Layer code ex) F0010000",
				"ko" : "레이어 코드 예시) F0010000"
			},
			"geoserverURL" : {
				"ko" : "GeoServer URL",
				"en" : "GeoServer URL"
			},
			"geoserverID" : {
				"ko" : "GeoServer ID",
				"en" : "GeoServer ID"
			},
			"geoserver" : {
				"ko" : "GeoServer",
				"en" : "GeoServer"
			},
			"workspace" : {
				"ko" : "작업공간",
				"en" : "Workspace"
			},
			"datastore" : {
				"ko" : "저장소",
				"en" : "Datastore"
			},
			"style" : {
				"ko" : "스타일",
				"en" : "Style"
			},
			"nativeName" : {
				"ko" : "레이어 원본 이름",
				"en" : "Native Layer Name"
			},
			"lName" : {
				"ko" : "레이어 이름",
				"en" : "Layer Name"
			},
			"title" : {
				"ko" : "제목",
				"en" : "Title"
			},
			"abstractContent" : {
				"ko" : "개요",
				"en" : "Summary"
			},
			"srs" : {
				"ko" : "좌표계",
				"en" : "SRS"
			},
			"llbBox" : {
				"ko" : "위/경도 영역",
				"en" : "Lat/Lon Boundary"
			},
			"nbBox" : {
				"ko" : "원본 레이어 최소경계 영역",
				"en" : "Layer Minimum Boundary"
			},
			"dsType" : {
				"ko" : "저장소 형식",
				"en" : "Datastore Type"
			},
			"geomType" : {
				"ko" : "지오메트리 형식",
				"en" : "Geometry Type"
			},
			"geomkey" : {
				"ko" : "지오메트리 속성명",
				"en" : "Geometry Key Name"
			},
			"styleWorkspace" : {
				"ko" : "스타일의 작업공간",
				"en" : "Style's Workspace"
			},
			"attInfo" : {
				"ko" : "속성 정보",
				"en" : "Attribute Info"
			},
			"sld" : {
				"ko" : "SLD",
				"en" : "SLD"
			},
			"myserver" : {
				"ko" : "전체 스타일",
				"en" : "All Styles"
			},
			"duplicateKeyHint" : {
				"ko" : "이 값은 중복되었습니다.",
				"en" : "This value is a duplicate."
			},
			"upload" : {
				"ko" : "서버에 업로드",
				"en" : "Upload to Server"
			},
			"uploadShpAlert" : {
				"ko" : "zip파일 형식만 업로드가능합니다.",
				"en" : "Only zip file types can be uploaded."
			},
			"layerNameHint" : {
				"ko" : "레이어 이름은 문자로 시작해야하며 영어 대소문자, 숫자, 언더스코어(_), 하이픈(-) 만 입력이 가능합니다.",
				"en" : "Layer names must begin with a letter and can only contain letters in English, capital letters, numbers, hyphens(-) and underscores(_)."
			},
			"layerSpecialChar" : {
				"ko" : "레이어 이름에 특수문자는 허용되지않습니다.",
				"en" : "Special characters are not allowed in the layer name."
			},
			"columnNameHint" : {
				"ko" : "컬럼명은 다음과 같은 규칙을 가지고있습니다.\n1.첫 단어는 문자이여야만 한다.\n2.단어 수는 1-30자까지이다.\n3.영단어 대소문자, 숫자, _, #, $ 만 입력할 수 있다.\n4.공백을 허용하지 않는다.",
				"en" : "A column name has the following rules:\n1.The first word must be a letter.\n2.The word count can be from 1 to 30 characters.\n3.Only English letters, numbers, _, #, and $ can be entered.\n4.Do not allow spaces."
			},
			"imageUploadHint" : {
				"ko" : "업로드할 이미지 파일을 선택해주세요.",
				"en" : "Please select an image file to upload."
			},
			"imageFileHint" : {
				"ko" : "이미지 형식의 파일만 업로드 가능합니다.",
				"en" : "Only image format can be uploaded."
			},
			"and" : {
				"ko" : "외",
				"en" : "and"
			},
			"more" : {
				"ko" : "개",
				"en" : "more"
			},
			"onlyeditmode" : {
				"ko" : "편집모드에서 사용해야 합니다.",
				"en" : "It must be used in edit mode."
			}
	};
	/**
	 * 현재 선택된 레이어
	 * 
	 * @type {ol.layer.Base}
	 * @private
	 */
	this.selectedLayer = undefined;

	/**
	 * 레이어 정보보기 Modal 객체
	 * 
	 * @type {gb.modal.ModalBase}
	 * @private
	 */
	this.layerPropModal = undefined;

	/**
	 * Geometry Type 목록
	 * 
	 * @type {Array.<string>}
	 * @private
	 */
	this.geometryType = [ "point", "linestring", "polygon", "multipoint", "multilinestring", "multipolygon" ];

	/**
	 * Openlayers Tree 제목
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panelTitle = $("<p>").text("Now editing").addClass("gb-openlayers-title");


	var addIcon = $("<i>").addClass("fas").addClass("fa-plus");
	/**
	 * 레이어 추가 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.addBtn = $("<button>").addClass("gb-button-clear").append(addIcon).css({
		"float" : "right"
	}).click(function() {
		if (gb.module.isEditing) {
			if (gb.module.isEditing.get()) {
				gb.module.isEditing.alert();
				return
			}
		}
		that.openAddLayer();
	});

	var createGroupIcon = $("<i>").addClass("fas").addClass("fa-folder-open");
	/**
	 * 그룹 레이어 추가 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.createGroupBtn = $("<button>").addClass("gb-button-clear").append(createGroupIcon).css({
		"float" : "right"
	}).click(function() {
		that.createGroupNode();
	});

	var importFileIcon = $("<i>").addClass("far fa-lg").addClass("fa-file-archive");
	/**
	 * 레이어 파일 불러오기 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.importFileBtn = $("<button>").addClass("gb-button-clear").append(importFileIcon).css({
		"float" : "right"
	}).click(function() {
		that.createUploadModal();
	});

	var addImgIcon = $("<i>").addClass("far fa-lg").addClass("fa-file-image");
	/**
	 * 이미지 파일 불러오기 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.addImgBtn = $("<button>").addClass("gb-button-clear").append(addImgIcon).css({
		"float" : "right"
	}).click(function() {
		that.createImageModal();
	});

	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	/**
	 * Openlayers Tree 새로고침 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.refBtn = $("<button>").addClass("gb-button-clear").append(refIcon).css({
		"float" : "right"
	}).click(function() {
		if (gb.module.isEditing) {
			if (gb.module.isEditing.get()) {
				gb.module.isEditing.alert();
				return
			}
		}
		that.refreshList();
	});

	var searchIcon = $("<i>").addClass("fas").addClass("fa-search");
	/**
	 * Openlayers Tree 노드 검색 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.searchBtn = $("<button>").addClass("gb-button-clear").append(searchIcon).css({
		"float" : "right"
	}).click(function() {
		that.openSearchBar();
	});

	/**
	 * Openlayers Tree 노드 검색 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.titleArea = $("<div>").append(this.panelTitle).append(this.searchBtn).append(this.refBtn).append(this.addImgBtn).append(
			this.importFileBtn).append(this.createGroupBtn).append(this.addBtn);

	/**
	 * Openlayers Tree 노드 검색 input element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.searchInput = $("<input>").attr({
		"type" : "text"
	}).addClass("gb-openlayers-search-input");

	var closeIcon = $("<i>").addClass("fas").addClass("fa-times");
	/**
	 * Openlayers Tree 노드 검색창 닫기 버튼 element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.closeSearchBtn = $("<button>").addClass("gb-button-clear").append(closeIcon).css({
		"float" : "right"
	}).click(function() {
		$(that.searchInput).val("");
		that.getJSTree().search("");
		that.closeSearchBar();
	});

	/**
	 * Openlayers Tree 노드 검색 layout element
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.searchArea = $("<div>").css({
		"display" : "none"
	}).append(this.searchInput).append(this.closeSearchBtn);

	/**
	 * Openlayers Tree 패널 header
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panelHead = $("<div>").addClass("gb-article-head").append(this.titleArea).append(this.searchArea);

	/**
	 * Openlayers Tree 패널 body
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panelBody = $("<div>").addClass("gb-article-body").css({
		"overflow-y" : "auto",
		"flex": "1"
	});

	/**
	 * Openlayers Tree 패널 layout
	 * 
	 * @type {HTMLElement}
	 * @private
	 */
	this.panel = $("<div>").addClass("gb-article").css({
		"margin" : "0",
		"height" : "100%",
		"display" : "flex",
		"flex-direction" : "column"
	}).append(this.panelHead).append(this.panelBody);

	var options = obj ? obj : {};
	this.append = options.append ? options.append : undefined;
	this.gb3dMap = options.gb3dMap ? options.gb3dMap : undefined;
	this.map = options.map instanceof ol.Map ? options.map : undefined;
	if(this.map === undefined){
		console.error("gb3d.tree.OpenLayers: 'map' is a required field.");
	}
	/**
	 * 타일 다운로더 객체
	 */
	this.tilesDownloader = options.tilesDownloader ? options.tilesDownloader : undefined;
	this.editingTool = options.editingTool || undefined;
	this.threeTree = options.threeTree || undefined;
	this.threeJSTree = undefined;
	if (this.threeTree instanceof gb3d.tree.Three) {
		this.threeTree.setOpenlayersTree(this);
		this.threeJSTree = this.threeTree.getJSTree(); 
	}
	this.token = options.token || "";
	this.locale = options.locale || "en";
	this.uploadjson = options.uploadJSON !== undefined ? options.uploadJSON : undefined;
	var url = options.url;
	this.getLegend = url.getLegend ? url.getLegend : undefined;

	this.frecord = options.frecord ? options.frecord : undefined;
	
	this.tout = false;
	$(this.searchInput).keyup(function() {
		if (that.tout) {
			clearTimeout(that.tout);
		}
		that.tout = setTimeout(function() {
			var v = $(that.searchInput).val();
			that.getJSTree().search(v);
		}, 250);
	});

	// append 옵션에 설정한 값에 Openlayers Tree 패널을 append
	if (typeof options.append === "string") {
		$(options.append).append(this.panel);
	} else if ($(options.append).is("div")) {
		$(options.append).append(this.panel);
	}

	/*
	 * $(document).ready(function() { var parentHeight = $(that.panel).parent().innerHeight(); var
	 * headHeight = $(that.panel).find(".gb-article-head").outerHeight(); var bodyHeight =
	 * parentHeight - headHeight; $(that.panelBody).outerHeight(bodyHeight); });
	 * $(window).resize(function() { var parentHeight = $(that.panel).parent().innerHeight(); var
	 * headHeight = $(that.panel).find(".gb-article-head").outerHeight(); var bodyHeight =
	 * parentHeight - headHeight; $(that.panelBody).outerHeight(bodyHeight); });
	 * setTimeout(function() { var parentHeight = $(that.panel).parent().innerHeight(); var
	 * headHeight = $(that.panel).find(".gb-article-head").outerHeight(); var bodyHeight =
	 * parentHeight - headHeight; $(that.panelBody).outerHeight(bodyHeight); }, 1000);
	 */

	$(this.panelBody).jstreeol3(
			{
				"core" : {
					"map" : this.map,
					"gb3dMap" : this.gb3dMap,
					"animation" : 0,
					"themes" : {
						"stripes" : true
					},
				},
				"layerproperties" : {
					"properties" : undefined,
					"navigator" : new gb3d.layer.Navigator({
						map : this.map,
						map3D : this.gb3dMap,
						token : this.token,
						getWFSFeature : "geoserver/geoserverWFSGetFeature.ajax"
					}),
					"layerRecord" : undefined,
					"featureRecord" : this.frecord,
					"style" : new gb.style.LayerStyle({
						"locale" : this.locale,
						"positionX" : 1408, 
						"positionY" : 96
					}),
					"editingTool" : this.editingTool,
					"threeTree" : this.threeJSTree
				},
				"search" : {
					show_only_matches : true
				},
				"legends" : {
					"types" : {
						"#" : {
							"valid_children" : [ "default", "Group", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
								"MultiLineString", "Point", "MultiPoint" ]
						},
						// 편집도구에서 지원할 타입
						"Group" : {
							"icon" : "far fa-folder",
							"valid_children" : [ "default", "Group", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
								"MultiLineString", "Point", "MultiPoint" ]
						},
						"FakeGroup" : {
							"icon" : "fas fa-folder",
							"valid_children" : [ "default", "Group", "Raster", "ImageTile", "Polygon", "MultiPolygon", "LineString",
								"MultiLineString", "Point", "MultiPoint" ]
						},
						// 이외의 기본형
						"default" : {
							"icon" : "fas fa-file",
							"valid_children" : []
						},
						"Raster" : {
							"icon" : "fas fa-file-image",
							"valid_children" : []
						},
						"ImageTile" : {
							"icon" : "fas fa-file-image",
							"valid_children" : []
						},
						"Polygon" : {
							"icon" : "gb-icon"
						},
						"MultiPolygon" : {
							"icon" : "gb-icon"
						},
						"LineString" : {
							"icon" : "gb-icon"
						},
						"MultiLineString" : {
							"icon" : "gb-icon"
						},
						"Point" : {
							"icon" : "gb-icon"
						},
						"MultiPoint" : {
							"icon" : "gb-icon"
						}
					},
					"geoserver" : {
						"url" : this.getLegend,
						"width" : "15",
						"height" : "15",
						"format" : "image/png"
					}
				},
				"functionmarker" : {
					"snapping" : "fas fa-magnet",
					"editing" : "fas fa-pencil-alt",
					"importing" : "fas fa-globe"
				},
				"contextmenu" : {
					items : function(o, cb) { // Could be an object
						var totalObj = {};
						if (that.getTilesDownloader()) {
							totalObj["download"] = {
									"separator_before" : false,
									"icon" : "fas fa-download",
									"separator_after" : false,
									"_disabled" : false, // (this.check("rename_node",
									// data.reference,
									// this.get_parent(data.reference),
									// "")),
									"label" : that.translation.downloadtiles[that.locale],
									/*
									 * ! "shortcut" : 113, "shortcut_label" : 'F2', "icon" :
									 * "glyphicon glyphicon-leaf",
									 */
									"action" : function(data) {
										var inst = $.jstreeol3
										.reference(data.reference), obj = inst
										.get_node(data.reference);
										var layer = inst.get_LayerById(obj.id);
										var lid = layer.get("id");
										var server = lid.split(":")[0];
										var work = lid.split(":")[1];
										var store = lid.split(":")[2];
										var layerName = lid.split(":")[3];
										var url;
										var git = layer.get("git"); 
										if (git) {
											var tileset = git.tileset;
											if (tileset instanceof gb3d.object.Tileset) {
												if (tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
													url = tileset.getCesiumTileset().url;
												}	
											}
										} else {
											var source = layer.getSource();
											var git = source.get("git");
											var tileset = git.tileset;
											if (tileset instanceof gb3d.object.Tileset) {
												if (tileset.getCesiumTileset() instanceof Cesium.Cesium3DTileset) {
													url = tileset.getCesiumTileset().url;
												}	
											}
										}
										if (url) {
											var downloader = that.getTilesDownloader();
											downloader.downloadTiles(url, layerName);	
										}
									}
							};
						}

						totalObj["import3dfile"] = {
								"separator_before" : false,
								"icon" : "fas fa-cube",
								"separator_after" : false,
								"_disabled" : false, // (this.check("rename_node",
								// data.reference,
								// this.get_parent(data.reference),
								// "")),
								"label" : that.translation.import3dfile[that.locale],
								/*
								 * ! "shortcut" : 113, "shortcut_label" : 'F2', "icon" : "glyphicon
								 * glyphicon-leaf",
								 */
								"action" : function(data) {
									if(!that.getEditingTool().getActiveTool()){
										alert(that.translation.onlyeditmode[that.locale]);
										return;
									}
									var inst = $.jstreeol3
									.reference(data.reference), obj = inst
									.get_node(data.reference);
									var layer = inst.get_LayerById(obj.id);

									var modal = new gb3d.io.ImporterThree({
										"locale" : that.locale,
										"gb3dMap" : that.gb3dMap,
										"layer" : layer,
										"locale" : that.locale,
										"threeTree" : that.threeJSTree,
										"featureRecord" : that.getFeatureRecord()
									});
									modal.open();
								}
						};

						totalObj["zoom"] = {
								"separator_before" : false,
								"icon" : "fa fa-crosshairs",
								"separator_after" : false,
								"_disabled" : false, // (this.check("rename_node",
								// data.reference,
								// this.get_parent(data.reference),
								// "")),
								"label" : that.translation.zoom[that.locale],
								/*
								 * ! "shortcut" : 113, "shortcut_label" : 'F2', "icon" : "glyphicon
								 * glyphicon-leaf",
								 */
								"action" : function(data) {
									var inst = $.jstreeol3
									.reference(data.reference), obj = inst
									.get_node(data.reference);
									var layer = inst.get_LayerById(obj.id);
									if(layer instanceof ol.layer.Image){
										layer = layer.get("vectorLayer");
									}
									
									var extent = ol.extent.createEmpty();
									// inst._data.layerproperties.editingTool.zoomToFit(layer);
									// inst._data.layerproperties.editingTool.setWMSSource(layer,
									var wholeExt = inst.zoom_to_fit(layer, extent);
									
									var view = inst._data.core.map.getView();
									view.fit(wholeExt, inst._data.core.map.getSize());
									
									var git = layer.get("git");
									if (git) {
// var tileset = git.tileset;
// if (tileset) {
// var ctileset = tileset.getCesiumTileset();
// if (ctileset instanceof Cesium.Cesium3DTileset) {
// that.gb3dMap.getCesiumViewer().zoomTo(ctileset);
// }
// } else {
											var minx = Cesium.Math.toRadians(wholeExt[0]);
											var miny = Cesium.Math.toRadians(wholeExt[1]); 
											var maxx = Cesium.Math.toRadians(wholeExt[2]); 
											var maxy = Cesium.Math.toRadians(wholeExt[3]); 
											var rectangle = new Cesium.Rectangle(minx, miny, maxx, maxy);
											that.gb3dMap.getCamera().getCesiumCamera().flyTo({
												"destination" : rectangle,
												"duration" : 0
											});
											that.gb3dMap.getCamera().getCesiumCamera().zoomOut(100);
// }
									}
									
								}
						};

						totalObj["remove"] = {
								"separator_before" : false,
								"icon" : "fa fa-trash",
								"separator_after" : false,
								"_disabled" : false, // (this.check("delete_node",
								// data.reference,
								// this.get_parent(data.reference),
								// "")),
								"label" : that.translation["delete"][that.locale],
								"action" : function(data) {
									var inst = $.jstreeol3
									.reference(data.reference), obj = inst
									.get_node(data.reference);
									var layers = inst.get_selected();
									var map = inst._data.core.map;
									var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;

									if(isEdit instanceof Object){
										if(isEdit.get()){
											isEdit.alert();
											return
										}
									}
									var nodes = [];
									for (var i = 0; i < layers.length; i++) {
										var node = inst.get_node(layers[i]);
										if (node !== undefined) {
											nodes.push(node);
										}
									}
									that.openDeleteLayer(nodes);
								}
						};

						/*
						 * totalObj["count"] = { "separator_before" : false, "icon" : "fa fa-eye",
						 * "separator_after" : false, "_disabled" : false, //
						 * (this.check("delete_node", // data.reference, //
						 * this.get_parent(data.reference), // "")), "label" :
						 * that.translation.countOfFeature[that.locale], "action" : function(data) {
						 * console.log(data); var inst = $.jstreeol3.reference(data.reference), obj =
						 * inst.get_node(data.reference); var layers = inst.get_selected(); for (var
						 * i = 0; i < layers.length; i++) { var node = inst.get_node(layers[i]); var
						 * layer = inst.get_LayerById(layers[i]); } } };
						 */

						if(o.type !== "Raster"){
							totalObj["snap"] = {
									"separator_before" : false,
									"icon" : "fa fa-magnet",
									"separator_after" : false,
									"_disabled" : false, // (this.check("delete_node",
									// data.reference,
									// this.get_parent(data.reference),
									// "")),
									"label" : that.translation.snap[that.locale],
									"action" : function(data) {
										console.log(data);
										var inst = $.jstreeol3
										.reference(data.reference), obj = inst
										.get_node(data.reference);
										var layers = inst.get_selected();
										for (var i = 0; i < layers.length; i++) {
											var node = inst.get_node(layers[i]);
											var layer = inst.get_LayerById(layers[i]);
											if (node.state["snapping"] === false) {
												var succ = inst._data.layerproperties.editingTool
												.addSnappingLayer(layer);
												if (succ) {
													inst.set_flag(node, "snapping",
															true);
												}
												console.log(layer);
											} else {
												var succ = inst._data.layerproperties.editingTool
												.removeSnappingLayer(layer);
												if (succ) {
													inst.set_flag(node, "snapping",
															false);
												}
											}
										}

										var ext = 
											inst._data.layerproperties.editingTool
											.getMap()
											.getView()
											.calculateExtent(
													inst._data.layerproperties.editingTool
													.getMap().getSize());

										inst._data.layerproperties.editingTool
										.loadSnappingLayer(ext);
									}
							};
						}

						if(o.type === "Point" || o.type === "MultiPoint" || o.type === "LineString" || o.type === "MultiLineString" || o.type === "Polygon" || o.type === "MultiPolygon"){
							var inst = that.getJSTree();
							var layers = inst.get_selected();
							var flag = true;
							var nodes = [];
							var layerObjs = [];
							for (var i = 0; i < layers.length; i++) {
								var node = inst.get_node(layers[i]);
								var layer = inst.get_LayerById(layers[i]);
								var git = layer.get("git");

								if (node !== undefined) {
									if (node.type === "Point" || node.type === "MultiPoint" || node.type === "LineString" || node.type === "MultiLineString" || node.type === "Polygon" || node.type === "MultiPolygon") {
										if (git.geoserver !== undefined && git.workspace !== undefined) {
											flag = false;	
										} else {
											nodes.push(node);	
											layerObjs.push(layer);
										}
									} else {
										flag = false;
									}
								}
							}
							if (flag) {
								totalObj["upload"] = {
										"separator_before" : false,
										"icon" : "fas fa-upload",
										"separator_after" : false,
										"_disabled" : false, // (this.check("delete_node",
										// data.reference,
										// this.get_parent(data.reference),
										// "")),
										"label" : that.translation["upload"][that.locale],
										"action" : function(data) {
											var inst = $.jstreeol3
											.reference(data.reference), obj = inst
											.get_node(data.reference);
											var layers = inst.get_selected();
											var map = inst._data.core.map;
											var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;

											if(isEdit instanceof Object){
												if(isEdit.get()){
													isEdit.alert();
													return
												}
											}
											console.log(nodes);
											var epsg = inst._data.core.map.getView().getProjection().getCode();
											that.getUploadJSON().open(epsg, layerObjs);
										}
								}
							}
						}

						if(o.type !== "Group" && o.type !== "FakeGroup"){
							if(this.get_node(o.parent) instanceof Object){
								if(this.get_node(o.parent).type !== "FakeGroup"){
									totalObj["style"] = {
											"separator_before" : false,
											"icon" : "fa fa-paint-brush",
											"separator_after" : false,
											"_disabled" : false, // (this.check("delete_node",
											// data.reference,
											// this.get_parent(data.reference),
											// "")),
											"label" : that.translation.style[that.locale],
											"action" : function(data) {
												var inst = $.jstreeol3
												.reference(data.reference), obj = inst
												.get_node(data.reference);
												if (inst.is_selected(obj)) {
													var layers = inst.get_selected();
													for (var i = 0; i < layers.length; i++) {
														inst._data.layerproperties.style.setLayer(inst.get_LayerById(layers[i]));
														inst._data.layerproperties.style.setLegend(obj, inst.settings.legends.geoserver);
														inst._data.layerproperties.style.open();
													}
												} else {
													// inst.delete_node_layer(obj);
												}
											}
									};
								}
							}
							if(o.type !== "Raster"){
								totalObj["navigator"] = {
										"separator_before" : false,
										"icon" : "fa fa-compass",
										"separator_after" : false,
										"_disabled" : false,
										"label" : that.translation.navigator[that.locale],
										"action" : function(data) {
											var inst = $.jstreeol3.reference(data.reference),
											obj = inst.get_node(data.reference);
											if (inst.is_selected(obj)) {
												var layer = inst.get_LayerById(obj.id);

												inst._data.layerproperties.navigator
												.setFeatures(layer);
											} else {
												// inst.delete_node_layer(obj);
											}
										}
								};

								totalObj["properties"] = {
										"separator_before" : false,
										"icon" : "fa fa-info-circle",
										"separator_after" : false,
										"_disabled" : false,
										"label" : that.translation.prop[that.locale],
										"action" : function(data) {
											var inst = $.jstreeol3
											.reference(data.reference), obj = inst
											.get_node(data.reference);
											var layer = inst.get_LayerById(obj.id);
											that.selectedLayer = layer;

											if(layer instanceof ol.layer.Vector){
												that.vectorLayerInfo(layer);
											} else if (layer instanceof ol.layer.Tile){
												var layerId = layer.get("id");
												var datastore = layerId.split(":")[2];
												that.requestLayerInfo({
													geoserver: layer.get("git").geoserver,
													workspace: layer.get("git").workspace,
													datastore: datastore,
													layername: layer.get("git").layers
												});
											}
										}
								};
							}
						}

						return totalObj;
						/**
						 * 다른 노드간 이동이 가능할때 그룹레이어 생성
						 * 
						 * @author 소이준
						 */
						/*
						 * "group" : { "separator_before" : false, "separator_after" : true,
						 * "_disabled" : false, // (this.check("create_node", // data.reference, {}, //
						 * "last")), "label" : "Create group", "action" : function(data) { var inst =
						 * $.jstreeol3 .reference(data.reference), obj = inst
						 * .get_node(data.reference); inst.create_group(obj, {}, "first", function(
						 * new_node) { setTimeout(function() { inst.edit(new_node); }, 0); }); } },
						 * "create" : { "separator_before" : false, "separator_after" : true,
						 * "_disabled" : false, // (this.check("create_node", // data.reference, {}, //
						 * "last")), "label" : "Create", "action" : function(data) { var inst =
						 * $.jstreeol3 .reference(data.reference), obj = inst
						 * .get_node(data.reference); inst.create_node(obj, {}, "last", function(
						 * new_node) { setTimeout(function() { inst.edit(new_node); }, 0); }); } },
						 */
						// "rename" : {
						// "separator_before" : false,
						// "icon" : "fa fa-pencil",
						// "separator_after" : false,
						// "_disabled" : false, //
						// (this.check("rename_node",
						// // data.reference,
						// // this.get_parent(data.reference),
						// // "")),
						// "label" : "Rename",
						// /*
						// * ! "shortcut" : 113, "shortcut_label" : 'F2',
						// * "icon" : "glyphicon glyphicon-leaf",
						// */
						// "action" : function(data) {
						// var inst = $.jstreeol3.reference(data.reference),
						// obj
						// = inst.get_node(data.reference);
						// inst.edit(obj);
						// }
						// },
						// "ccp" : {
						// "separator_before" : true,
						// "icon" : false,
						// "separator_after" : false,
						// "label" : "Edit",
						// "action" : false,
						// "submenu" : {
						// "cut" : {
						// "separator_before" : false,
						// "separator_after" : false,
						// "label" : "Cut",
						// "action" : function(data) {
						// var inst = $.jstreeol3.reference(data.reference),
						// obj
						// = inst
						// .get_node(data.reference);
						// if (inst.is_selected(obj)) {
						// inst.cut(inst.get_top_selected());
						// } else {
						// inst.cut(obj);
						// }
						// }
						// },
						// "paste" : {
						// "separator_before" : false,
						// "icon" : false,
						// "_disabled" : function(data) {
						// return
						// !$.jstreeol3.reference(data.reference).can_paste();
						// },
						// "separator_after" : false,
						// "label" : "Paste",
						// "action" : function(data) {
						// var inst = $.jstreeol3.reference(data.reference),
						// obj
						// = inst
						// .get_node(data.reference);
						// inst.paste(obj);
						// }
						// }
						// }
						// },
						/*
						 * "properties" : { "separator_before" : false, "icon" : "fa
						 * fa-info-circle", "separator_after" : false, "_disabled" : false, //
						 * (this.check("delete_node", // data.reference, //
						 * this.get_parent(data.reference), // "")), "label" : "Properties",
						 * "action" : function(data) { var inst = $.jstreeol3
						 * .reference(data.reference), obj = inst .get_node(data.reference); if
						 * (inst.is_selected(obj)) { // inst.delete_node_layer(inst.get_selected());
						 * var layer = inst.get_LayerById(obj.id); console.log(layer); } else { //
						 * inst.delete_node_layer(obj); } } },
						 */
					}
				},
				plugins : [ "contextmenu", "dnd", "search", "state", "sort", "visibility", "layerproperties", "legends", "functionmarker" ]
			});
	this.jstree = $(this.panelBody).jstreeol3(true);
};
gb3d.tree.OpenLayers.prototype = Object.create(gb3d.tree.OpenLayers.prototype);
gb3d.tree.OpenLayers.prototype.constructor = gb3d.tree.OpenLayers;

/**
 * jstree가 적용된 jquery 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getJSTreeElement
 * @return {HTMLElement}
 */
gb3d.tree.OpenLayers.prototype.getJSTreeElement = function() {
	return $(this.panelBody);
};

/**
 * jstree 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getJSTree
 * @return {$.jstreeol3.plugins.functionmarker} jstree-functionmarker.js 파일 참조
 */
gb3d.tree.OpenLayers.prototype.getJSTree = function() {
	return this.jstree;
};

/**
 * jstree 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#setJSTree
 * @param {$.jstreeol3} jstree - jstree 객체(jsTree-openlayers3/jstree.js 파일 참조)
 */
gb3d.tree.OpenLayers.prototype.setJSTree = function(jstree) {
	this.jstree = jstree;
};

/**
 * EditingTool 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#setEditingTool
 * @param {gb.edit.EditingTool} param - editingTool 객체
 */
gb3d.tree.OpenLayers.prototype.setEditingTool = function(param) {
	this.jstree._data.layerproperties.editingTool = param;
};

/**
 * EditingTool 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getEditingTool
 * @return {gb.edit.EditingTool}
 */
gb3d.tree.OpenLayers.prototype.getEditingTool = function() {
	return this.jstree._data.layerproperties.editingTool;
};

/**
 * Tree에 Group Node를 생성한다.
 * 
 * @method gb3d.tree.OpenLayers#createGroupNode
 */
gb3d.tree.OpenLayers.prototype.createGroupNode = function() {
	var tree = this.jstree;

	tree.create_group("#", {}, "first", function(new_node) {
		setTimeout(function() {
			tree.edit(new_node);
		}, 0);
	});
};

/**
 * Tree 노드 목록을 새로고침한다. 모든 노드의 tree 아이디를 재설정한다.
 * 
 * @method gb3d.tree.OpenLayers#refreshList
 */
gb3d.tree.OpenLayers.prototype.refreshList = function() {
	console.log("refresh");
	this.getJSTree().refresh();
};

/**
 * Openlayers Tree 노드 검색창을 연다.
 * 
 * @method gb3d.tree.OpenLayers#openSearchBar
 */
gb3d.tree.OpenLayers.prototype.openSearchBar = function() {
	console.log("open search on geoserver");
	$(this.titleArea).css({
		"display" : "none"
	});
	$(this.searchArea).css({
		"display" : "block"
	});
};

/**
 * Openlayers Tree 노드 검색창을 닫는다.
 * 
 * @method gb3d.tree.OpenLayers#closeSearchBar
 */
gb3d.tree.OpenLayers.prototype.closeSearchBar = function() {
	console.log("close search geoserver");
	$(this.titleArea).css({
		"display" : "block"
	});
	$(this.searchArea).css({
		"display" : "none"
	});
};

/**
 * uploadjson 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getUploadJSON
 * @return {gb.geoserver.UploadGeoJSON}
 */
gb3d.tree.OpenLayers.prototype.getUploadJSON = function() {
	return this.uploadjson;
};

/**
 * uploadjson 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#setUploadJSON
 * @param {gb.geoserver.UploadGeoJSON} obj - uploadjson 객체
 */
gb3d.tree.OpenLayers.prototype.setUploadJSON = function(obj) {
	this.uploadjson = obj;
};

/**
 * Layer 생성창을 연다. Layer명, 속성명은 Geoserver의 명명 규칙을 따른다.
 * 
 * @method gb3d.tree.OpenLayers#openAddLayer
 */
gb3d.tree.OpenLayers.prototype.openAddLayer = function() {
	var that = this;

	var col1 = $("<div>").addClass("col-md-2").append(this.translation.layerCode[this.locale]);
	var codeInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.exLayerCodeField[this.locale]
	}).addClass("form-control").addClass("gb-layerdefinition-input-layercode");

	var col2 = $("<div>").addClass("col-md-10").append(codeInput);
	var row1 = $("<div>").addClass("row").append(col1).append(col2).css({
		"margin-bottom" : "15px"
	});

	var col3 = $("<div>").addClass("col-md-2").text(this.translation.layerType[this.locale]);
	var geomSelect = $("<select>").addClass("form-control").addClass("gb-layerdefinition-select-geometry");
	for (var i = 0; i < this.geometryType.length; i++) {
		var option = $("<option>").text(this.geometryType[i].toUpperCase()).attr("value", this.geometryType[i]);
		if (i === 0) {
			$(option).attr("selected", "selected");
		}
		$(geomSelect).append(option);
	}
	var col4 = $("<div>").addClass("col-md-10").append(geomSelect);
	var row2 = $("<div>").addClass("row").append(col3).append(col4).css({
		"margin-bottom" : "15px"
	});

	var col5 = $("<div>").addClass("col-md-2").text(this.translation.attribute[this.locale]);
	var col6 = gb3d.tree.OpenLayers.getAttrForm().addClass("col-md-10");
	var row3 = $("<div>").addClass("row").append(col5).append(col6);

	var well = $("<div>").addClass("well").append(row1).append(row2).append(row3);

	var closeBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]);
	var okBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-primary").text(this.translation.add[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var gBody = $("<div>").append(well).css({
		"display" : "table",
		"width" : "100%"
	});
	var addGeoServerModal = new gb.modal.ModalBase({
		"title" : this.translation.addLayer[this.locale],
		"width" : 540,
		"autoOpen" : true,
		"body" : gBody,
		"footer" : modalFooter
	});

	addGeoServerModal.modalBody.css({
		"max-height" : "500px",
		"overflow" : "auto"
	});

	addGeoServerModal.modalFooter.css({
		"position" : "relative"
	});

	$(closeBtn).click(function() {
		addGeoServerModal.close();
	});

	$(okBtn).click(
			function() {
				var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
				var layername_pattern = /^([A-Za-z])([A-Za-z0-9_-]+)$/;
				var column_pattern = /^([A-Za-z])([A-Za-z0-9_$#]{0,29})$/;
				var geoType = { 
						"point": "Point", 
						"linestring": "LineString", 
						"polygon": "Polygon", 
						"multipoint": "MultiPoint",
						"multilinestring": "MultiLineString", 
						"multipolygon": "MultiPolygon"
				};

				var vectorLayer = new ol.layer.Vector({
					renderMode : "image",
					source : new ol.source.Vector({})
				});

				var type = geomSelect.find("option:selected").val();

				var attributes = [],
				bool = true,
				columnBool = true,
				attribute;

				$(".type-form-body").children().each(function(){
					if(!$(this).children().eq(0).find("input:text").val()){
						bool = false;
					}
					var fieldName = $(this).children().eq(0).find("input:text").val().replace(/(\s*)/g, '');

					if (column_pattern.test(fieldName) === false) {
						columnBool = false;
					}

					attribute = new gb.layer.Attribute({
						originFieldName : $(this).children().eq(0).find("input:text").val().replace(/(\s*)/g, ''),
						fieldName : $(this).children().eq(0).find("input:text").val().replace(/(\s*)/g, ''),
						type : $(this).children().eq(1).find("select").val(),
						decimal : $(this).children().eq(1).find("select").val() === "Double" ? 30 : null,
								size : 256,
								isUnique : $(this).children().eq(3).find("input:checkbox").prop("checked") ? true : false,
										nullable : $(this).children().eq(2).find("input:checkbox").prop("checked") ? false : true,
												isNew : true
					});
					attributes.push(attribute);
				});

				if(!bool){
					alert(that.translation.inputAttrHint[that.locale]);
					return;
				}

				if(!columnBool){
					alert(that.translation.columnNameHint[that.locale]);
					return;
				}

				var gitLayer = {
						"editable" : true,
						"geometry" : geoType[type],
						"validation" : false,
						"attribute" : attributes
				};
				vectorLayer.set("git", gitLayer);

				if(!codeInput.val()){
					alert(that.translation.inputNameHint[that.locale]);
					return;
				}

				if (special_pattern.test(codeInput.val()) === true) {
					alert(that.translation.layerSpecialChar[that.locale]);
					return;
				}

				if (layername_pattern.test(codeInput.val()) === false) {
					alert(that.translation.layerNameHint[that.locale]);
					return;
				}

				vectorLayer.set("name", codeInput.val());
				vectorLayer.set("id", codeInput.val());
				
				that.map.addLayer(vectorLayer);
				that.refreshList();
				addGeoServerModal.close();
				if(gb.module.isEditing.get()){
					that.getEditingTool().loadVector_();
				}
			}
	);
};

/**
 * 레이어 속성 정보 설정 Layout Table을 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getAttrForm
 * @param {boolean} bool - Not Null, Unique 조건 설정 가시화 여부. true일 시 Not Null, Unique 조건 설정 불가.
 * @return {HTMLElement}
 */
gb3d.tree.OpenLayers.getAttrForm = function(bool) {
	var addBtn = 
		$("<a href='#'>")
		.addClass("gb-button gb-button-secondary")
		.append($("<i>").addClass("fas fa-plus"))
		.on("click", function() {
			var key = $("<input>").addClass("form-control").attr({
				"type" : "text"
			});
			var td1 = $("<td>").append(key);

			var opt1 = $("<option>").text("Integer");
			var opt2 = $("<option>").text("Double");
			var opt3 = $("<option>").text("String");
			var opt4 = $("<option>").text("Date");
			var opt5 = $("<option>").text("Boolean");
			var type = $("<select>").addClass("form-control").append(opt1).append(opt2).append(opt3).append(opt4).append(opt5);
			var td2 = $("<td>").append(type);

			var nullable = $("<input>").attr({
				"type" : "checkbox"
			});
			var td3 = $("<td>").append(nullable);

			var unique = $("<input>").attr({
				"type" : "checkbox"
			});
			var td4 = $("<td>").append(unique);

			var trash = $("<a href='#'>").append($("<i>").addClass("far fa-trash-alt"));
			trash.click(function() {
				$(this).parent().parent().remove();
			});
			var td5 = $("<td>").append(trash);

			var tr1 = $("<tr>");
			if(bool === true){
				tr1.append(td1).append(td2).append(td5);
			} else {
				tr1.append(td1).append(td2).append(td3).append(td5);
			}
			$(".type-form-body").append(tr1);
		});

	var htd1 = $("<td>").text("Name");
	var htd2 = $("<td>").text("Type");
	var htd3 = $("<td>").text("Not Null");
	var htd4 = $("<td>").text("Unique");
	var htd5 = $("<td>").append(addBtn);
	var thd = $("<thead>")
	if(bool === true){
		thd.append(htd1).append(htd2).append(htd5);
	} else {
		thd.append(htd1).append(htd2).append(htd3).append(htd5);
	}

	var typeFormBody = $("<tbody>").addClass("type-form-body");

	var table = $("<table>").addClass("table").addClass("text-center").append(thd).append(typeFormBody);

	return $("<div>").append(table);
};

/**
 * Shp file 업로드창을 생성한다. Zip형식의 파일만 업로드 가능하다.
 * 
 * @method gb3d.tree.OpenLayers#createUploadModal
 */
gb3d.tree.OpenLayers.prototype.createUploadModal = function() {
	var that = this;

	var file = undefined;

	// 파일 선택 input
	var fileSelect = $("<input type='file' id='layer_shp_file' accept='.zip'>").change(function() {
		if (!!this.files) {
			file = this.files[0];
			if(file.type !== "application/x-zip-compressed"){
				alert(that.translation.uploadShpAlert[that.locale]);
				file = undefined;
				return;
			}
			if (file.size > 0) {
				fileInfo.text(file.name + ' , ' + file.size + ' kb');
			}
		}
	});

	var uploadBtn = 
		$("<button type='button'>")
		.addClass("btn btn-primary btn-lg btn-block")
		.text(this.translation.uploadFile[this.locale])
		.mouseenter(function() {
			$(this).css({
				"background-color" : "#00c4bc"
			});
		}).mouseleave(function() {
			$(this).css({
				"background-color" : "#00b5ad"
			});
		}).click(function() {
			fileSelect.click();
		}).css({
			"background-color" : "#00b5ad",
			"border-color" : "transparent"
		});

	var fileInfo = $("<div role='alert'>").addClass("alert alert-light").css({
		"text-align" : "center"
	});

	/*
	 * var epsg = $("<div>").addClass("col-md-2").append("EPSG"); var epsgInput = $("<input>").attr({
	 * "type" : "text", "placeholder" : "Default: 4326" }).addClass("form-control");
	 * 
	 * var col1 = $("<div>").addClass("col-md-10").append(epsgInput); var row1 = $("<div>").addClass("row").append(epsg).append(col1).css({
	 * "margin-bottom" : "15px" });
	 */

	var encode = $("<div>").addClass("col-md-2").append("Encoding");
	var encodeInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : "Set your desired encoding UTF-8, Big5, Big5-HKSCS ..."
	}).addClass("form-control");

	var col2 = $("<div>").addClass("col-md-10").append(encodeInput);
	var row2 = $("<div>").addClass("row").append(encode).append(col2);

	var closeBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]);
	var okBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-primary").text(this.translation.add[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var gBody = $("<div>").append(uploadBtn).append(fileInfo).append(row2).css({
		"display" : "table",
		"width" : "100%"
	});

	var addGeoServerModal = new gb.modal.ModalBase({
		"title" : this.translation.addLayer[this.locale],
		"width" : 540,
		"height" : 280,
		"autoOpen" : true,
		"body" : gBody,
		"footer" : modalFooter
	});
	$(closeBtn).click(function() {
		addGeoServerModal.close();
	});
	$(okBtn).click(function() {
		if(file === undefined){
			return;
		}

		$("body").append($("<div id='shp-upload-loading'>").css({
			"z-index" : "10",
			"position" : "absolute",
			"left" : "0",
			"top" : "0",
			"width" : "100%",
			"height" : "100%",
			"text-align" : "center",
			"background-color" : "rgba(0, 0, 0, 0.4)"
		}).append($("<i>").addClass("fas fa-spinner fa-spin fa-5x").css({
			"position" : "relative",
			"top" : "50%",
			"margin-top" : "-5em"
		})));

		var callback = function(){
			$("#shp-upload-loading").remove();
			that.refreshList();
		};

		that.loadShpZip(encodeInput.val(), file, that.map, callback);
		addGeoServerModal.close();
	});
};

/**
 * Shp file 업로드창을 생성한다. Zip형식의 파일만 업로드 가능하다.
 * 
 * @method gb3d.tree.OpenLayers#loadShpZip
 * @param {string|undefined|null} encode - 인코딩 타입(Default "EUC-KR")
 * @param {window.File} file - 업로드 파일 객체
 * @param {ol.Map} map - 파일을 업로드할 맵 객체
 * @param {function} callback - 콜백함수
 */
gb3d.tree.OpenLayers.prototype.loadShpZip = function(encode, file, map, callback) {
	var epsg = epsg || 4326;
	var encode = encode || "EUC-KR";
	var fileL = file;

	loadshp({
		url : fileL,
		encoding : encode
	}, function(geojson) {
		console.log(geojson);
		var features = (new ol.format.GeoJSON()).readFeatures(geojson);

		if (!!features.length) {
			var lname = fileL.name.split(".")[0];
			for (var i = 0; i < features.length; i++) {
				features[i].setId(lname+"."+i);
			}
			console.log(features);
			var vectorLayer = new ol.layer.Vector({
				renderMode: 'image',
				source : new ol.source.Vector({
					features : features
				})
			});
			var ftype;
			if (features.length > 0) {
				ftype = features[0].getGeometry().getType();
			}
			var gitLayer = {
					"editable" : true,
					"geometry" : ftype,
					"validation" : false
			};
			vectorLayer.set("git", gitLayer);
			vectorLayer.set("name", fileL.name);
			vectorLayer.set("id", "shp:"+fileL.name);

			map.addLayer(vectorLayer);
			map.getView().fit(geojson.bbox, map.getSize());
			callback();
		}
	});
}

/**
 * Image file 업로드창을 생성한다.
 * 
 * @method gb3d.tree.OpenLayers#createImageModal
 */
gb3d.tree.OpenLayers.prototype.createImageModal = function() {
	var that = this;

	var file, result, imageInfo, readerInfo;

	// 파일 선택 input
	var fileSelect = $("<input type='file' accept='image/*'>").change(function() {
		if (!!this.files) {
			file = this.files[0];
			if(!file){
				return;
			}
			if (file.type.match(/image/g) === null){
				alert(that.translation.imageFileHint[that.locale]);
				return;
			}
			if (file.size > 0) {
				fileInfo.text(file.name + ' , ' + file.size + ' kb');
				var reader = new FileReader();
				reader.onload = function() {
					var output = document.getElementById('imagePreview');
					var image = new Image();

					output.src = reader.result;

					image.src = reader.result;
					image.onload = function() {
						imageInfo = image;
						readerInfo = reader;
					}
				}
				reader.readAsDataURL(file);
			}
		}
	});

	// Iamge preview
	var preview = $("<img id='imagePreview' height='218' width='518'>");

	var uploadBtn = 
		$("<button type='button'>")
		.addClass("btn btn-primary btn-lg btn-block")
		.text(this.translation.uploadImage[this.locale])
		.mouseenter(function() {
			$(this).css({
				"background-color" : "#00c4bc"
			});
		}).mouseleave(function() {
			$(this).css({
				"background-color" : "#00b5ad"
			});
		}).click(function() {
			fileSelect.click();
		}).css({
			"background-color" : "#00b5ad",
			"border-color" : "transparent"
		});

	var fileInfo = $("<div role='alert'>").addClass("alert alert-light").css({
		"text-align" : "center"
	});

	var closeBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]);
	var okBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-primary").text(this.translation.add[this.locale]).click(function() {
		if (!readerInfo) {
			alert(that.translation.imageUploadHint[that.locale]);
			return;
		}

		new gb.layer.ImageLayer({
			map : that.map,
			url : readerInfo.result,
			width : imageInfo.width,
			height : imageInfo.height,
			title : file.name,
			jstree: that.jstree
		});

		addGeoServerModal.close();
	});

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var gBody = $("<div>").append(uploadBtn).append(fileInfo).append(preview).addClass("gb-openlayers-table");

	var addGeoServerModal = new gb.modal.ModalBase({
		"title" : this.translation.addLayer[this.locale],
		"width" : 540,
		"height" : 460,
		"autoOpen" : true,
		"body" : gBody,
		"footer" : modalFooter
	});

	$(closeBtn).click(function() {
		addGeoServerModal.close();
	});
};

/**
 * 레이어 삭제 확인창을 연다.
 * 
 * @method gb3d.tree.OpenLayers#openDeleteLayer
 * @param {Array.<Object>} layer - 삭제하려는 레이어들의 노드 정보 배열
 */
gb3d.tree.OpenLayers.prototype.openDeleteLayer = function(layer) {
	var that = this;
	console.log("open delete geoserver layer");
	console.log(layer);

	var names = [];
	for (var i = 0; i < layer.length; i++) {
		if (typeof layer[i] === "object") {
			names.push(layer[i].text);
		}
	}
	var todel;
	if (Array.isArray(names)) {
		if (names.length > 1) {
			todel = '"' + names[0] + '" ' + this.translation.and[this.locale] + ' '
			+ (names.length - 1) + this.translation.more[this.locale];
		} else {
			todel = '"' + names[0] + '" ';
		}
	}
	var msg1 = $("<div>").css({
		"text-align" : "center",
		"font-size" : "16px"
	});
	if (layer.length > 1) {
		$(msg1).text(this.translation.deleteLayersHint[this.locale])
	} else {
		$(msg1).text(this.translation.deleteLayerHint[this.locale])
	}
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
		"title" : this.translation.deleteLayer[this.locale],
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
		var callback = function(){
			deleteModal.close();
		};
		that.deleteLayer(layer, callback);
	});
	deleteModal.open();
};

/**
 * 레이어를 삭제한다.
 * 
 * @method gb3d.tree.OpenLayers#deleteLayer
 * @param {Array.<Object>} layers - 삭제하려는 레이어들의 노드 정보 배열
 * @param {function} callback - 콜백함수
 */
gb3d.tree.OpenLayers.prototype.deleteLayer = function(layers, callback){
	var that = this;
	var frecord = that.getFeatureRecord();
	var mrecord;
	if (frecord) {
		mrecord = frecord.getModelRecord();
	}
	if (Array.isArray(layers)) {
		for (var i = 0; i < layers.length; i++) {
			var delLayer = that.getJSTree().get_LayerById(layers[i].id);
			if (mrecord) {
				mrecord.removeByLayer(delLayer.get("id"), true);
			}
			that.getJSTree().delete_node_layer(layers[i].id);
		}
	}
	if (typeof callback === "function") {
		callback();
	}
};

/**
 * Vector 레이어의 상세정보창을 생성한다.
 * 
 * @method gb3d.tree.OpenLayers#vectorLayerInfo
 * @param {ol.layer.Vector} layer - 레이어 객체
 */
gb3d.tree.OpenLayers.prototype.vectorLayerInfo = function(layer) {

	var params = {};
	var git = layer.get("git");
	var attrs, geom;
	if(git instanceof Object){
		attrs = git.attribute;
		geom = git.geometry;
	}

	params.geoserverURL = "";
	params.geoserverID = "";
	params.geoserver = "";
	params.workspace = "";
	params.datastore = "";

	params.lName = layer.get("name");
	params.geomType = geom;
	params.attInfo = {};

	if(attrs instanceof Array){
		for(var i = 0; i < attrs.length; i++){
			if(attrs[i] instanceof gb.layer.Attribute){
				params.attInfo[attrs[i].originFieldName] = {};
				params.attInfo[attrs[i].originFieldName].type = attrs[i].type;
				if(attrs[i].nullable === false){
					params.attInfo[attrs[i].originFieldName].nillable = false;
				}
				if(attrs[i].isUnique === true){
					params.attInfo[attrs[i].originFieldName].isUnique = true;
				}
			}
		}
	}

	var table = this.createPropTable(params, true);

	var body = 
		$("<div>")
		.append(table)
		.css({
			"height" : "550px",
			"overflow-y" : "auto"
		});;

		var closeBtn = 
			$("<button>")
			.css({
				"float" : "right"
			})
			.addClass("gb-button")
			.addClass("gb-button-default")
			.text(this.translation.close[this.locale]);

		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

		var modal = this.layerPropModal = new gb.modal.ModalBase({
			"title" : "Properties",
			"width" : "700px",
			"autoOpen" : true,
			"body" : body,
			"footer" : buttonArea
		});

		$(closeBtn).click(function() {
			modal.close();
		});
}

/**
 * Geoserver로부터 Import된 레이어의 상세정보를 요청한다.
 * 
 * @method gb3d.tree.OpenLayers#requestLayerInfo
 * @param {Object} obj - 요청 파라미터
 * @param {string} obj.geoserver - Geoserver명
 * @param {string} obj.workspace - workspace명
 * @param {string} obj.datastore - datastore명
 * @param {string} obj.layername - layer명
 */
gb3d.tree.OpenLayers.prototype.requestLayerInfo = function(obj) {
	var that = this;
	var geoserver = obj.geoserver || false,
	workspace = obj.workspace || false, 
	datastore = obj.datastore || false, 
	layername = obj.layername || false;

	var geoserverURL, geoserverID;

	if (!geoserver || !workspace || !datastore || !layername) {
		console.error("Missed Parameter");
		return;
	}

	var params = {
			"serverName" : geoserver,
			"type" : "server",
			"format" : "json",
	}

	var tranURL = "geoserver/getDTGeoserverInfo.ajax" + this.token + "&" + jQuery.param(params);

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		async: false,
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			if (data !== undefined) {
				data = JSON.parse(data);
				var info = data.info;

				geoserverURL = info.url;
				geoserverID = info.id;
			}
		}
	});

	var arr = {
			"serverName" : geoserver,
			"workspace" : workspace,
			"geoLayerList" : [ layername ]
	};

	$.ajax({
		url : "geoserver/getGeoLayerInfoList.ajax" + this.token,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		cache : false,
		data : JSON.stringify(arr),
		beforeSend : function() { // 호출전실행
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		traditional : true,
		success : function(data, textStatus, jqXHR) {
			var table, body, closeBtn, buttonArea, modal;
			if (Array.isArray(data)) {
				if (data.length === 1) {

					data[0].geoserverURL = geoserverURL;
					data[0].geoserverID = geoserverID;
					data[0].geoserver = geoserver;
					data[0].workspace = workspace;
					data[0].datastore = datastore;

					table = that.createPropTable(data[0], false);

					body = 
						$("<div>")
						.append(table)
						.css({
							"height" : "550px",
							"overflow-y" : "auto"
						});

					closeBtn = 
						$("<button>")
						.css({
							"float" : "right"
						})
						.addClass("gb-button")
						.addClass("gb-button-default")
						.text(that.translation.close[that.locale]);

					buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

					modal = new gb.modal.ModalBase({
						"title" : "Properties",
						"width" : "700px",
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});

					$(closeBtn).click(function() {
						modal.close();
					});
				}

				$("body").css("cursor", "default");
			}
		}
	});
}

/**
 * 레이어 상세정보창에 표시할 Table Element를 생성하고 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#createPropTable
 * @param {Object.<string, string|Object>} obj - 테이블 내용
 * @param {boolean} isVector - 레이어 타입이 Vector인지 여부
 * @return {HTMLElement}
 */
gb3d.tree.OpenLayers.prototype.createPropTable = function(obj, isVector) {
	var that = this;

	var list = obj || false;
	if (!list) {
		return;
	}

	var tbody = $("<tbody>");
	var tableTag = $("<table>").append(tbody);
	var tr, key, value, label, labelKey, labelValue, labelText, select, selectTitle, selectField, option, search, removeAttr;
	for ( var i in list) {

		if(i === "sld"){
			continue;
		}

		if(!this.translation[i]){
			key = $("<td>").addClass("gb-openlayers-td-key").text(i).css("width", "20%");
		} else {
			if(i === "attInfo" && isVector){
				var addLabel = 
					$("<label>")
					.text(this.translation[i][that.locale]);

				var addIcon = 
					$("<a href='#'>")
					.append($("<i>").addClass("fas fa-plus-square fa-lg"))
					.css({"float": "right"});

				addIcon.click(function() {
					that.addPropModal(true);
				});

				var addDiv = 
					$("<div>")
					.append(addLabel)
					.append(addIcon)
					.css({"width": "100%"});

				key = $("<td>").addClass("gb-openlayers-td-key").append(addDiv).css("width", "20%");
			} else {
				key = $("<td>").addClass("gb-openlayers-td-key").text(this.translation[i][that.locale]).css("width", "20%");
			}
		}

		if (list[i] instanceof Object) {
			value = $("<td>").addClass("gb-openlayers-td");
			for ( var j in list[i]) {
				labelKey = $("<span>").addClass("layer-attr-key").text(j);
				if (list[i][j] instanceof Object) {
					labelText = "[type:" + list[i][j].type + "]";
					if(list[i][j].nillable === false){
						labelText += "[NotNull]";
					}
					if(list[i][j].isUnique === true){
						labelText += "[Unique]";
					}
					labelValue = $("<span>").text(labelText);
				} else {
					labelValue = $("<span>").text(list[i][j]);
				}

				label = $("<div>").addClass("gb-openlayers-label").append(labelKey).append(labelValue);
				if (isVector) {
					removeAttr = 
						$("<i>")
						.addClass("far fa-trash-alt")
						.addClass("gb-openlayers-icon");

					removeAttr.click(function(){
						var attrKey = $(this).parent().find(".layer-attr-key").text();

						var msg1 = 
							$("<div>")
							.css({
								"text-align" : "center",
								"font-size" : "16px"
							})
							.text(that.translation.deleteHint[that.locale]);

						var msg2 = 
							$("<div>")
							.text(attrKey)
							.css({
								"text-align" : "center",
								"font-size" : "24px",
								"word-break" : "break-word"
							});

						var body = $("<div>").append(msg1).append(msg2);

						var closeBtn = $("<button>").css({
							"float" : "right"
						}).addClass("gb-button").addClass("gb-button-default").text(that.translation.cancel[that.locale]);

						var okBtn = $("<button>").css({
							"float" : "right"
						}).addClass("gb-button").addClass("gb-button-primary").text(that.translation["delete"][that.locale]);

						var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

						var modal = new gb.modal.ModalBase({
							"title" : that.translation.deleteAttr[that.locale],
							"width" : 310,
							"height" : 200,
							"autoOpen" : false,
							"body" : body,
							"footer" : buttonArea
						});

						$(closeBtn).click(function() {
							modal.close();
						});

						$(okBtn).click(function() {
							var layer = that.selectedLayer;
							var attrs = layer.get("git").attribute;
							var features = layer.getSource().getFeatures();

							for(var i = attrs.length - 1; i >= 0 ; i--){
								if(attrKey === attrs[i].originFieldName){
									attrs.splice(i, 1);
								}
							}

							for(var i = 0; i < features.length; i++){
								features[i].unset(attrKey);
							}

							modal.close();
							that.layerPropModal.close();
							that.vectorLayerInfo(layer);
						});

						modal.open();
					});
					label.append(removeAttr).addClass("gb-openlayers-label-attr");
				}
				value.append(label);
			}
		} else {
			if (i === "style") {
				selectTitle = $("<label>").addClass("gb-openlayers-select-title").text(this.translation["workspace"][this.locale]);
				select = $("<div>").text(list.styleWorkspace || this.translation["myserver"][this.locale]);
				selectField = $("<div>").addClass("gb-openlayers-field").append(selectTitle).append(select);

				value = $("<td>").addClass("gb-openlayers-td").css("display", "flex").append(selectField);

				selectTitle = 
					$("<div>")
					.append($("<label>").addClass("gb-openlayers-select-title").text(this.translation["style"][this.locale]));
				select = $("<div>").text(list[i]);
				selectField = $("<div>").addClass("gb-openlayers-field").append(selectTitle).append(select);
				value.append(selectField);
			} else {
				if (i === "styleWorkspace") {
					continue;
				}
				value = $("<td>").addClass("gb-openlayers-td").text(list[i]);
			}
		}

		tr = $("<tr>").addClass("gb-openlayers-tr").append(key).append(value);
		if(i === "geoserver" || i === "workspace" || i === "datastore" || i === "geoserverURL" || i === "geoserverID"){
			tbody.prepend(tr);
		} else {
			tbody.append(tr);
		}

	}

	return tableTag;
}

/**
 * 레이어 속성값 추가 모달창을 생성한다.
 * 
 * @method gb3d.tree.OpenLayers#addPropModal
 * @param {boolean} obj - Not Null, Unique 옵션 설정 가능 여부. True일 시 설정 불가
 */
gb3d.tree.OpenLayers.prototype.addPropModal = function(obj) {
	var that = this;
	var attrTable = gb3d.tree.OpenLayers.getAttrForm(obj);

	var closeBtn = 
		$("<button>")
		.css({
			"float" : "right"
		})
		.addClass("gb-button")
		.addClass("gb-button-default")
		.text(this.translation.close[this.locale]);

	var okBtn = 
		$("<button>")
		.css({
			"float" : "right"
		})
		.addClass("gb-button")
		.addClass("gb-button-primary")
		.text(this.translation.add[this.locale]);

	var buttonArea = 
		$("<span>")
		.addClass("gb-modal-buttons")
		.append(okBtn)
		.append(closeBtn);

	var modalFooter = $("<div>").append(buttonArea);

	var body = 
		$("<div>")
		.append(attrTable)
		.css({
			"max-height" : "300px",
			"overflow-y" : "auto"
		});

	var addPropModal = new gb.modal.ModalBase({
		"title" : this.translation.addAttribute[this.locale],
		"width" : 540,
		"autoOpen" : true,
		"body" : body,
		"footer" : modalFooter
	});

	$(closeBtn).click(function() {
		addPropModal.close();
	});

	$(okBtn).click(function(){
		var layer = that.selectedLayer;
		var attrs = layer.get("git").attribute;
		var features = layer.getSource().getFeatures();
		var bool = true;
		var git, attribute;

		if(layer instanceof ol.layer.Vector){
			git = layer.get("git");

			if(!(git instanceof Object)){
				addPropModal.close();
				return;
			}

			if(git.attribute instanceof Array){
				attrTable.find("tbody").children().each(function(){
					if(!$(this).children().eq(0).find("input:text").val()){
						bool = false;
					}

					var name = $(this).children().eq(0).find("input:text").val().replace(/(\s*)/g, '');

					for(var i = 0; i < attrs.length ; i++){
						if(name === attrs[i].originFieldName){
							alert(that.translation.duplicateKeyHint[that.locale] + ' "' + name + '"');
							return;
						}
					}

					attribute = new gb.layer.Attribute({
						originFieldName : name,
						fieldName : name,
						type : $(this).children().eq(1).find("select").val(),
						decimal : $(this).children().eq(1).find("select").val() === "Double" ? 30 : null,
								size : 256,
								isUnique : $(this).children().eq(3).find("input:checkbox").prop("checked") ? true : false,
										nullable : $(this).children().eq(2).find("input:checkbox").prop("checked") ? false : true,
												isNew : true
					});
					git.attribute.push(attribute);

					for(var i = 0; i < features.length; i++){
						if(features[i].get(name) === undefined){
							features[i].set(name, "");
						}
					}
				});

				if(!bool){
					alert(that.translation.inputAttrHint[that.locale]);
					return;
				}
			}
			addPropModal.close();
			that.layerPropModal.close();
			that.vectorLayerInfo(layer);
		} else {
			addPropModal.close();
		}
	});

	attrTable.find("a").click();
}


/**
 * 3D Tiles 다운로더 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getTilesDownloader
 * @return {gb3d.io.TilesDownloader} 타일 다운로더 객체
 */
gb3d.tree.OpenLayers.prototype.getTilesDownloader = function() {
	return this.tilesDownloader;
}

/**
 * Three tree 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getThreeTree
 * @return {gb3d.tree.Three} three tree 객체
 */
gb3d.tree.OpenLayers.prototype.getThreeTree = function() {
	return this.threeTree;
}

/**
 * Three tree 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#setThreeTree
 * @param {gb3d.tree.Three} tree - three tree 객체
 */
gb3d.tree.OpenLayers.prototype.setThreeTree = function(tree) {
	this.threeTree = tree;
}

/**
 * Three JSTree 객체를 반환한다.
 * 
 * @method gb3d.tree.OpenLayers#getThreeJSTree
 * @return {gb3d.tree.Three} three tree 객체
 */
gb3d.tree.OpenLayers.prototype.getThreeJSTree = function() {
	return this.threeJSTree;
}

/**
 * Three JSTree 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#setThreeJSTree
 * @param {gb3d.tree.Three} tree - three tree 객체
 */
gb3d.tree.OpenLayers.prototype.setThreeJSTree = function(tree) {
	this.threeJSTree = tree;
}

/**
 * Three JSTree 객체를 설정한다.
 * 
 * @method gb3d.tree.OpenLayers#getFeatureRecord
 * @return {gb.edit.FeatureRecord} 피처 편집이력 객체
 */
gb3d.tree.OpenLayers.prototype.getFeatureRecord = function() {
	return this.frecord;
}