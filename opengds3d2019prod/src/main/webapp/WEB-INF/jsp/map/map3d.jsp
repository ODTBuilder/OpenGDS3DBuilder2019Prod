<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GeoDT Web</title>
<jsp:include page="/WEB-INF/jsp/common/libimport_editor3d.jsp" />
<style>
/* .navbar-brand { */
/* 	background-image: url(resources/img/onlyglobe.png); */
/* 	width: 284px; */
/* } */
.crsitem {
	cursor: pointer;
}

.file-area {
	width: 100%;
	min-height: 100px;
}

html, body {
	position: relative;
	height: 100%;
	overflow: hidden;
}

.mainHeader {
	margin-bottom: 0;
	height: 6%;
}

.builderHeader {
	border-radius: 4px 4px 0 0;
	margin-bottom: 0;
	height: 4%;
	min-height: 41px;
}

.builderContent {
	height: 86%;
}

.builderLayer {
	float: left;
	width: 380px;
	max-width: 380px;
	padding: 8px;
}

.bind {
	float: left;
}

.builderFooter {
	min-height: 41px;
	line-height: 41px;
	margin-bottom: 0;
	border-radius: 0;
	position: relative;
	height: 4%;
	padding: 0 8px;
}

.builderLayerGeoServerPanel {
	margin-bottom: 16px;
}

.builderLayerClientPanel {
	height: 100%;
	margin-bottom: 0;
}

.gitbuilder-layer-panel {
	padding: 0;
	overflow-y: auto;
}

.gitbuilder-clearbtn {
	border: 0;
	background-color: transparent;
}

.builderHeader .navbar-nav>li>a {
	padding-top: 10px;
	padding-bottom: 10px;
}

.gb-footer-span {
	margin-right: 8px;
	margin-left: 8px;
	vertical-align: -webkit-baseline-middle;
}

.gb-footer-span:hover {
	cursor: pointer;
}

.modal-open {
	overflow: hidden;
	padding-right: 0 !important;
}

.cesium-viewer-timelineContainer, .cesium-viewer-bottom {
	z-index: 1;
}
</style>
</head>
<body>
	<jsp:include page="/WEB-INF/jsp/common/header.jsp" />
	<nav class="navbar navbar-default fixed-top builderHeader">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-2">
				<span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span
					class="icon-bar"></span>
			</button>
		</div>
		<div class="collapse navbar-collapse" id="navbar-collapse-2">
			<ul class="nav navbar-nav">
				<li class="dropdown"><a href="#" title="File" class="dropdown-toggle" data-toggle="dropdown" role="button"
					aria-haspopup="true" aria-expanded="false"> <i class="fas fa-folder-open fa-lg" style="color: #bfbfbf;"></i> <spring:message
							code="lang.file" /><span class="caret"></span>
				</a>
					<ul class="dropdown-menu">
						<li><a href="#"><spring:message code="lang.importFile"></spring:message></a></li>
						<li><a href="#" id="importB3dmBtn"><spring:message code="lang.importZip"></spring:message></a></li>
						<li><a href="#"><spring:message code="lang.importF4D"></spring:message></a></li>
					</ul></li>
				<li class="dropdown"><a href="#" id="savePart" data-toggle="modal" data-target="#saveChanges"> <i
						class="fas fa-save fa-lg" style="color: #4dadf7;"></i> <spring:message code="lang.save" />
				</a></li>
				<li><a href="#" title="Geoserver" data-toggle="modal" data-target="#geoserverModal"> <i
						class="fas fa-server fa-lg" style="color: #91d050;"></i> <spring:message code="lang.geoserver" />
				</a></li>
				<li><a href="#" title="Edit" id="editTool"><i class="fas fa-edit fa-lg" style="color: #bfbfbf;"></i> <spring:message
							code="lang.edit" /> </a></li>
				<li><a href="#" title="Base map" id="changeBase"> <i class="fas fa-map fa-lg" style="color: #91d050;"></i>
						<spring:message code="lang.baseMap" />
				</a></li>
				<li><a href="#" title="Validation" id="validation"> <i class="fas fa-clipboard-check fa-lg"
						style="color: #344762;"></i> <spring:message code="lang.validation" />
				</a></li>
				<li><a href="#" title="Information" id="binfo" data-toggle="modal" data-target="#infoModal"> <i
						class="fas fa-info-circle fa-lg" style="color: #ffc000;"></i> <spring:message code="lang.info" />
				</a></li>
			</ul>
		</div>
	</nav>
	<jsp:include page="/WEB-INF/jsp/map/content.jsp" />
	<nav class="navbar navbar-default builderFooter">
		<!-- 		<span class="navbar-left gb-footer-span"><span class="gb-scale-line-area" style="margin-right: 118px;"></span></span> -->
		<span class="navbar-left gb-footer-span"><i class="fas fa-globe"></i>&nbsp;<a href="#"
			class="epsg-now btn-link"></a></span> <span id="feature-toggle-btn" class="navbar-left gb-footer-span"><i
			class="fas fa-th"></i>&nbsp;<span class="btn-link"><spring:message code="lang.featureList" /></span></span>
		<!-- 			<span id="cmd-toggle-btn" class="navbar-left gb-footer-span"><i class="fas fa-terminal"></i>&nbsp;<span -->
		<%-- 			class="btn-link"><spring:message code="lang.command" /></span></span>  --%>
		<span class="navbar-left gb-footer-span"> <i class="fas fa-map-marked-alt"></i>&nbsp;<span>&nbsp;</span><span
			class="mouse-position btn-link" style="display: inline-block;"></span></span> <span
			class="text-muted navbar-right gb-footer-span"><span class="help-message"></span></span>
	</nav>

	<!-- modal area -->
	<jsp:include page="/WEB-INF/jsp/map/geoserverModal.jsp" />
	<jsp:include page="/WEB-INF/jsp/map/infoModal.jsp" />
	<jsp:include page="/WEB-INF/jsp/map/objectModal.jsp" />
	<script type="text/javascript">
		$('#geoserverModal').on('shown.bs.modal', function() {
			$(document).off('focusin.modal');
		});
		var locale = '<spring:message code="lang.localeCode" />';

		var urlList = {
			token : "?${_csrf.parameterName}=${_csrf.token}",
			wfst : "${pageContext.request.contextPath}/geoserver/geoserverWFSTransaction.ajax",
			getLayerInfo : "geoserver/getGeoLayerInfoList.ajax",
			getMapWMS : "geoserver/geoserverWMSGetMap.ajax",
			getFeatureInfo : "geoserver/geoserverWFSGetFeature.ajax",
			getWFSFeature : "geoserver/geoserverWFSGetFeature.ajax",
			getLegend : "geoserver/geoserverWMSGetLegendGraphic.ajax",
			requestValidate : "web/validate.do",
			geoserverFileUpload : "geoserver/upload.do"
		}

		var gbMap = new gb.Map({
			"target" : $(".area-2d")[0],
			"view" : new ol.View({
				projection : 'EPSG:4326',
				center : [ 0, 0 ],
				zoom : 2
			}),
			"upperMap" : {
				"controls" : [],
				"layers" : []
			},
			"lowerMap" : {
				"controls" : [],
				"layers" : []
			}
		});

		var mousePosition = new gb.map.MousePosition({
			map : gbMap.getUpperMap()
		});

		var gbBaseMap = new gb.style.BaseMap({
			"map" : gbMap.getLowerMap(),
			"defaultBaseMap" : "osm",
			"locale" : locale !== "" ? locale : "en"
		});

		$("#changeBase").click(function() {
			gbBaseMap.open();
		});

		var baseCRS = new gb.crs.BaseCRS({
			"locale" : locale !== "" ? locale : "en",
			"message" : $(".epsg-now")[0],
			"maps" : [ gbMap.getUpperMap(), gbMap.getLowerMap() ],
			"epsg" : "4326"
		});

		var gb3dMap = new gb3d.Map({
			"gbMap" : gbMap,
// 			"modelRecord" : mrecord,
			"target" : $(".area-3d")[0],
			"initPosition" : [ 127.03250885009764, 37.51989305019379 ]
		});

		// ThreeJS Eidtor
		var threeEditor = new Editor(gb3dMap.getThreeCamera(), gb3dMap.getThreeScene());
		var threeSidebar = new Sidebar(threeEditor);
		document.body.appendChild(threeSidebar.dom);

		var gbCam = gb3dMap.getCamera();

		var uploadB3DM = new gb3d.io.B3DMManager({
			"locale" : locale !== "" ? locale : "en",
			"gb3dMap" : gb3dMap
		});

		$("#importB3dmBtn").click(function() {
			uploadB3DM.open();
		});

		var uploadjson = new gb.geoserver.UploadGeoJSON({
			"url" : "geoserver/jsonUpload.ajax?${_csrf.parameterName}=${_csrf.token}",
			"epsg" : function() {
				return crs.getEPSGCode();
			},
			"geoserverTree" : function() {
				return gtree;
			},
			"locale" : locale !== "" ? locale : "en"
		});

		var epan3d;
		var threeTree = new gb3d.tree.Three({
			"target" : "#attrObject",
			"map" : gb3dMap,
			"editingTool3D" : function(){
				return epan3d;
			},
		});

		var mrecord = new gb3d.edit.ModelRecord({
			//id : "feature_id",
			locale : locale,
			saveURL : "geoserver/tilesave.ajax?${_csrf.parameterName}=${_csrf.token}"
		});
		
		var frecord = new gb.edit.FeatureRecord({
			//id : "feature_id",
			locale : locale,
			wfstURL : urlList.wfst + urlList.token,
			layerInfoURL : urlList.getLayerInfo + urlList.token,
			modelRecord : mrecord
		});
		
		var tilesDownloader = new gb3d.io.TilesDownloader({
			"locale" : locale || "en",
			"downloadTilesUrl" : "geoserver/tilesdownload.ajax?${_csrf.parameterName}=${_csrf.token}"
		});
		
		var otree = new gb3d.tree.OpenLayers({
			"locale" : locale || "en",
			"append" : $(".builderLayerClientPanel")[0],
			"gb3dMap" : gb3dMap,
			"map" : gbMap.getUpperMap(),
			"frecord" : frecord,
			"mrecord" : mrecord,
			"uploadJSON" : uploadjson,
			"token" : urlList.token,
			"tilesDownloader" : tilesDownloader,
			"url" : {
				"getLegend" : urlList.getLegend + urlList.token
			},
			"threeTree" : threeTree.jstree,
		});

		var tilesetManager = new gb3d.edit.TilesetManager({
			map : gb3dMap,
			clientTree : otree
		});
// 		tilesetManager.addTileset( "${pageContext.request.contextPath}/resources/testtileset/Batched1/tileset.json", "testLayerTile1", "testLayer" );
		//tilesetManager.addTileset( "${pageContext.request.contextPath}/resources/testtileset/Instanced4326_1/tileset.json", "testLayerTile1", "testLayer" );
// 		tilesetManager.addTileset( "${pageContext.request.contextPath}/resources/testtileset/Batchedbuildings_1/tileset.json", "testLayerTile2", "testLayer" );
// 		tilesetManager.addTileset("${pageContext.request.contextPath}/resources/testtileset/TilesetWithTreeBillboards/tileset.json", "testLayerTile3", "testLayer");
		/* var tiles = new gb3d.object.Tileset({
			"layer" : "testLayer",
			"tileId" : "testLayerTile1",
			"cesiumTileset" : new Cesium.Cesium3DTileset({
				url : "${pageContext.request.contextPath}/resources/testtileset/Instanced4326_1/tileset.json"
			})
		});
		gb3dMap.addTileset(tiles); */
		
		var uploadSHP = new gb.geoserver.UploadSHP({
			"url" : urlList.geoserverFileUpload + urlList.token,
			"locale" : locale !== "" ? locale : "en"
		});

		var simple3d = new gb3d.io.Simple3DManager({
			"url" : undefined,
			"layerInfoUrl" : "geoserver/getGeoLayerInfoList.ajax?${_csrf.parameterName}=${_csrf.token}",
			"locale" : locale !== "" ? locale : "en",
			"gb3dMap" : gb3dMap,
			"tilesetManager" : tilesetManager
		});

		var multiobj = new gb3d.io.MultiOBJManager({
			"test" : "${pageContext.request.contextPath}/resources/testtileset/TilesetWithRequestVolume/tileset.json",
			"url" : undefined,
			"locale" : locale !== "" ? locale : "en",
			"gb3dMap" : gb3dMap
		});

		var importThree = new gb3d.io.ImporterThree({
			"locale" : locale !== "" ? locale : "en",
			"decoder" : "${pageContext.request.contextPath}/resources/js/gb3d/libs/draco/gltf/"
		});

		var gtree = new gb3d.tree.GeoServer({
			"locale" : locale !== "" ? locale : "en",
			"height" : "300px",
			"append" : $(".builderLayerGeoServerPanel")[0],
			"clientTree" : otree.getJSTree(),
			"map" : gbMap.getUpperMap(),
			// 			"gb3dMap" : gb3dMap,
			"properties" : new gb.edit.ModifyLayerProperties({
				"token" : urlList.token,
				"locale" : locale !== "" ? locale : "en"
			}),
			"uploadSHP" : uploadSHP,
			"simple3DManager" : simple3d,
			"multiOBJManager" : multiobj,
			"url" : {
				"getTree" : "geoserver/getGeolayerCollectionTree.ajax?${_csrf.parameterName}=${_csrf.token}",
				"addGeoServer" : "geoserver/addGeoserver.ajax?${_csrf.parameterName}=${_csrf.token}",
				"deleteGeoServer" : "geoserver/removeGeoserver.ajax?${_csrf.parameterName}=${_csrf.token}",
				"deleteGeoServerLayer" : "geoserver/geoserverRemoveLayers.ajax?${_csrf.parameterName}=${_csrf.token}",
				"getMapWMS" : urlList.getMapWMS + urlList.token,
				"getLayerInfo" : urlList.getLayerInfo + urlList.token,
				"getWFSFeature" : urlList.getWFSFeature + urlList.token,
				"switchGeoGigBranch" : "geoserver/updateGeogigGsStore.do?${_csrf.parameterName}=${_csrf.token}",
				"geoserverInfo" : "geoserver/getDTGeoserverInfo.ajax?${_csrf.parameterName}=${_csrf.token}"
			}
		});
		
		var epan;
		// editing Tool 3D
		epan3d = new gb3d.edit.EditingTool3D({
			targetElement : $(".area-3d")[0],
			map : gb3dMap,
			isDisplay : false,
			modelRecord : mrecord,
			locale : locale || "en",
			editingTool2D : function(){
				return epan;
			}
		});
		
		// EditTool 활성화
		epan = new gb3d.edit.EditingTool2D({
			targetElement : gbMap.getLowerDiv()[0],
			map : gb3dMap,
			editingTool3D : epan3d,
			featureRecord : frecord,
			otree : otree,
			wfsURL : urlList.getWFSFeature + urlList.token,
			layerInfo : urlList.getLayerInfo + urlList.token,
			locale : locale || "en",
			isEditing : gb.module.isEditing
		});

		$("#editTool").click(function(e) {
			e.preventDefault();
			epan.editToolToggle();
			epan3d.toggleTool();
		});

		// feature list
		var featureList = new gb.layer.FeatureList({
			map : gbMap.getUpperMap(),
			targetElement : gbMap.getLowerDiv()[0],
			title : "All Feature List",
			toggleTarget : "#feature-toggle-btn",
			wfstURL : urlList.wfst + urlList.token,
			locale : locale || "en",
			layerInfoURL : urlList.getLayerInfo + urlList.token,
			getFeatureURL : urlList.getWFSFeature + urlList.token,
			isDisplay : false
		});

		/* otree.getJSTreeElement().on('create_node.jstreeol3', function(e, data) {
			var instance = threeTree.jstree;
			var parent = data.parent;
			var node = data.node;
			
			if(!instance.get_node(node.id)){
				instance.create_node(parent, node.original, "last", false, false);
			}
		}); */

		otree.getJSTreeElement().on('changed.jstreeol3', function(e, data) {
			var treeid = data.selected[0];
			var layer = data.instance.get_LayerById(treeid);

			if (!layer) {
				return;
			}

			if (layer instanceof ol.layer.Group) {
				return;
			}

			if (featureList.footerTag.css("display") === "none") {
				return;
			} else {
				featureList.updateFeatureList(layer);
			}
		});

		// 검수 수행 Modal 생성
		var validation = new gb.validation.Validation({
			"autoOpen" : false,
			"locale" : locale,
			"title" : "<spring:message code='lang.validation' />",
			"url" : {
				"token" : urlList.token,
				"requestValidate" : urlList.requestValidate
			},
			"isEditing" : gb.module.isEditing
		});

		$("#validation").click(function() {
			validation.open();
		});

		$(document).ready(function() {
			var gitrnd = {
				resize : function() {
					//현재 보이는 브라우저 내부 영역의 높이
					var winHeight = $(window).innerHeight();
					var builderHeaderHeight = $(".builderHeader").outerHeight(true);

					var conHeight;
					//컨텐츠 영역의 높이 지정
					if (builderHeaderHeight != 41) {
						conHeight = $(".builderContent").outerHeight();
						$(".builderContent").css("height", "86%");
					} else {
						conHeight = winHeight - ($(".mainHeader").outerHeight(true) + $(".builderHeader").outerHeight(true) + $(".builderFooter").outerHeight(true));
						$(".builderContent").css("height", conHeight);
					}

					//현재 보이는 브라우저 내부 영역의 너비
					var winWidth = $(window).innerWidth();
					//컨텐츠 (지도) 영역의 너비 지정
					var mapWidth = ($(".area-2d").parent().innerWidth());
					//컨텐츠 영역의 너비 지정
					$(".area-2d").outerHeight(conHeight);
					$(".area-3d").outerHeight(conHeight);
					gbMap.setSize(mapWidth, conHeight);

					if (winWidth <= 992) {
						gbMap.setSize(mapWidth, conHeight / 2);
						$(".area-2d").outerHeight(conHeight / 2);
						$(".area-3d").outerHeight(conHeight / 2);
					}
					$(".attribute-content").outerHeight(conHeight);
				}
			}
			gitrnd.resize();

			$(window).resize(function() {
				gitrnd.resize();
			});
		});

		$(window).on("beforeunload", function() {
			if (frecord.isEditing()) {
				return "이 페이지를 벗어나면 작성된 내용은 저장되지 않습니다.";
			}
		});

		$("#textureEmissive").spectrum({
			color : "#fff",
			showAlpha : true
		});

		$("#textureImage").on("click", function() {

		});
	</script>
</body>
</html>
