<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GeoDT Web</title>
<jsp:include page="/WEB-INF/jsp/common/libimport_editor.jsp" />
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

html, body{
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
				<li class="dropdown">
					<a href="#" title="File" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
						<i class="fas fa-folder-open fa-lg" style="color: #bfbfbf;"></i>
						<spring:message code="lang.file" /><span class="caret"></span>
					</a>
					<ul class="dropdown-menu">
						<li><a href="#"><spring:message code="lang.importFile"></spring:message></a></li>
						<li><a href="#"><spring:message code="lang.importZip"></spring:message></a></li>
						<li><a href="#"><spring:message code="lang.importF4D"></spring:message></a></li>
					</ul>
				</li>
				<li class="dropdown"><a href="#" id="savePart" data-toggle="modal" data-target="#saveChanges"> <i
						class="fas fa-save fa-lg" style="color: #4dadf7;"></i>
						<spring:message code="lang.save" />
				</a></li>
				<li><a href="#" title="Geoserver"  data-toggle="modal" data-target="#geoserverModal"> <i class="fas fa-server fa-lg" style="color: #91d050;"></i>
						<spring:message code="lang.geoserver" />
				</a></li>
				<li>
					<a href="#" title="Edit" id="editTool">
						<i class="fas fa-edit fa-lg" style="color: #bfbfbf;"></i>
						<spring:message code="lang.edit" />
					</a>
				</li>
				
				<li><a href="#" title="Validation" id="validation"> <i class="fas fa-clipboard-check fa-lg"
						style="color: #344762;"></i> <spring:message code="lang.validation" />
				</a></li>
				<li><a href="#" title="Information" id="binfo" data-toggle="modal" data-target="#infoModal"> <i
						class="fas fa-info-circle fa-lg" style="color: #ffc000;"></i> <spring:message code="lang.info" />
				</a></li>
			</ul>
		</div>
	</nav>
	<!-- <div class="builderContent">
		<div class="builderLayer">
			<div class="builderLayerClientPanel"></div>
		</div>
		<div class="bind"></div>
	</div> -->
	<jsp:include page="/WEB-INF/jsp/map/content.jsp" />
	<nav class="navbar navbar-default builderFooter">
		<!-- 		<span class="navbar-left gb-footer-span"><span class="gb-scale-line-area" style="margin-right: 118px;"></span></span> -->
		<span class="navbar-left gb-footer-span"><i class="fas fa-globe"></i>&nbsp;<a href="#"
			class="epsg-now btn-link"></a></span> <span id="feature-toggle-btn" class="navbar-left gb-footer-span"><i
			class="fas fa-th"></i>&nbsp;<span class="btn-link"><spring:message code="lang.featureList" /></span></span> <span
			id="cmd-toggle-btn" class="navbar-left gb-footer-span"><i class="fas fa-terminal"></i>&nbsp;<span
			class="btn-link"><spring:message code="lang.command" /></span></span> <span class="navbar-left gb-footer-span"> <i
			class="fas fa-map-marked-alt"></i>&nbsp;<span>&nbsp;</span><span class="mouse-position btn-link"
			style="display: inline-block;"></span></span> <span class="text-muted navbar-right gb-footer-span"><span
			class="help-message"></span></span>
	</nav>
	
	<!-- modal area -->
	<jsp:include page="/WEB-INF/jsp/map/geoserverModal.jsp" />
	<jsp:include page="/WEB-INF/jsp/map/infoModal.jsp" />
	<script type="text/javascript">
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
			"target" : $(".bind")[0],
			"upperMap" : {
				"controls" : [],
				"layers" : []
			},
			"lowerMap" : {
				"controls" : [],
				"layers" : []
			}
		});

		var gbBaseMap = new gb.style.BaseMap({
			"map" : gbMap.getLowerMap(), 
			"defaultBaseMap" : "osm",
			"locale" : locale !== "" ? locale : "en"
		});

		$("#changeBase").click(function() {
			gbBaseMap.open();
		});

		$("#editSetting").click(function() {
			gb.module.serviceVersion.geoserverSettingModal(locale);
		});

		var vrepo = new gb.versioning.Repository({
			"locale" : locale !== "" ? locale : "en",
			"epsg" : "4326",
			"url" : {
				"serverTree" : "geogig/getWorkingTree.ajax?${_csrf.parameterName}=${_csrf.token}",
				"remoteTree" : "geogig/getRemoteRepoTree.ajax?${_csrf.parameterName}=${_csrf.token}",
				"beginTransaction" : "geogig/beginTransaction.do?${_csrf.parameterName}=${_csrf.token}",
				"endTransaction" : "geogig/endTransaction.do?${_csrf.parameterName}=${_csrf.token}",
				"cancelTransaction" : "geogig/cancelTransaction.do?${_csrf.parameterName}=${_csrf.token}",
				"checkoutBranch" : "geogig/checkoutBranch.do?${_csrf.parameterName}=${_csrf.token}",
				"removeRemoteRepository" : "geogig/removeRemoteRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"removeRepository" : "geogig/deleteRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"branchList" : "geogig/branchList.do?${_csrf.parameterName}=${_csrf.token}",
				"mergeBranch" : "geogig/mergeBranch.do?${_csrf.parameterName}=${_csrf.token}",
				"initRepository" : "geogig/initRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"addRemoteRepository" : "geogig/addRemoteRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"pullRepository" : "geogig/pullRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"pushRepository" : "geogig/pushRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"createBranch" : "geogig/createBranch.do?${_csrf.parameterName}=${_csrf.token}",
				"resolveConflict" : "geogig/resolveConflict.do?${_csrf.parameterName}=${_csrf.token}",
				"featureBlame" : "geogig/featureBlame.do?${_csrf.parameterName}=${_csrf.token}",
				"catConflictFeatureObject" : "geogig/catConflictFeatureObject.do?${_csrf.parameterName}=${_csrf.token}",
				"dataStoreList" : "geogig/getDataStoreList.do?${_csrf.parameterName}=${_csrf.token}",
				"listGeoserverLayer" : "geogig/listGeoserverLayer.do?${_csrf.parameterName}=${_csrf.token}",
				"publishGeogigLayer" : "geogig/publishGeogigLayer.do?${_csrf.parameterName}=${_csrf.token}",
				"removeGeogigLayer" : "geogig/removeLayer.do?${_csrf.parameterName}=${_csrf.token}",
				"infoRepository" : "geogig/infoRepository.do?${_csrf.parameterName}=${_csrf.token}",
				"logLayer" : "geogig/logLayer.do?${_csrf.parameterName}=${_csrf.token}",
				"diffLayer" : "geogig/diffLayerById.do?${_csrf.parameterName}=${_csrf.token}",
				"featureDiff" : "geogig/featureDiff.do?${_csrf.parameterName}=${_csrf.token}",
				"featureRevert" : "geogig/featureRevert.do?${_csrf.parameterName}=${_csrf.token}"
			},
			"isEditing" : gb.module.isEditing
		});

		$("#vermodal").click(function() {
			vrepo.open();
		});

		var crs = new gb.crs.BaseCRS({
			"locale" : locale !== "" ? locale : "en",
			"message" : $(".epsg-now")[0],
			"maps" : [ gbMap.getUpperMap(), gbMap.getLowerMap() ],
			"epsg" : "4326"
		});

		$(".epsg-now").click(function() {
			crs.open();
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

		var frecord = new gb.edit.FeatureRecord({
			//id : "feature_id",
			locale : locale,
			wfstURL : urlList.wfst + urlList.token,
			layerInfoURL : urlList.getLayerInfo + urlList.token
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

		var otree = new gb.tree.OpenLayers({
			"locale" : locale || "en",
			"append" : $(".builderLayerClientPanel")[0],
			//"map" : gbMap.getUpperMap(),
			"frecord" : frecord,
			"uploadJSON" : uploadjson,
			"token" : urlList.token,
			"url" : {
				"getLegend" : urlList.getLegend + urlList.token
			}
		});

		var uploadSHP = new gb.geoserver.UploadSHP({
			"url" : urlList.geoserverFileUpload + urlList.token,
			"locale" : locale !== "" ? locale : "en"
		});

		var gtree = new gb.tree.GeoServer({
			"locale" : locale !== "" ? locale : "en",
			"height" : "400px",
			"append" : $(".builderLayerGeoServerPanel")[0],
			"clientTree" : otree.getJSTree(),
			//"map" : gbMap.getUpperMap(),
			"properties" : new gb.edit.ModifyLayerProperties({
				"token" : urlList.token,
				"locale" : locale !== "" ? locale : "en"
			}),
			"uploadSHP" : uploadSHP,
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

		var fhist = new gb.versioning.Feature({
			"locale" : locale !== "" ? locale : "en",
			"url" : {
				"featureLog" : "geogig/featureLog.do?${_csrf.parameterName}=${_csrf.token}",
				"diff" : "geogig/diff.do?${_csrf.parameterName}=${_csrf.token}",
				"featureRevert" : "geogig/featureRevert.do?${_csrf.parameterName}=${_csrf.token}",
				"featureAttribute" : "geogig/featureAttribute.do?${_csrf.parameterName}=${_csrf.token}",
				"catFeatureObject" : "geogig/catFeatureObject.do?${_csrf.parameterName}=${_csrf.token}"
			}
		});

		// EditTool 활성화
		/* var epan = new gb.edit.EditingTool({
			targetElement : gbMap.getLowerDiv()[0],
			map : gbMap.getUpperMap(),
			featureRecord : frecord,
			otree : otree,
			wfsURL : urlList.getWFSFeature + urlList.token,
			layerInfo : urlList.getLayerInfo + urlList.token,
			locale : locale || "en",
			versioning : fhist,
			isEditing : gb.module.isEditing
		}); */

		$("#editTool").click(function(e) {
			e.preventDefault();
			epan.editToolToggle();
		});

		$("#savePart").click(function() {
			frecord.save(epan);
		});

		// 거리, 면적 측정 기능 추가
		/* var measureArea = new gb.interaction.MeasureTip({
			type : "Polygon",
			map : gbMap.getUpperMap(),
			snapSource : epan.snapSource
		});

		measureArea.on("change:active", function(evt) {
			if (evt.oldValue) {
				gb.undo.setActive(true);
			} else {
				gb.undo.setActive(false);
			}
		});

		var measureLength = new gb.interaction.MeasureTip({
			type : "LineString",
			map : gbMap.getUpperMap(),
			snapSource : epan.snapSource
		});

		measureLength.on("change:active", function(evt) {
			if (evt.oldValue) {
				gb.undo.setActive(true);
			} else {
				gb.undo.setActive(false);
			}
		});

		epan.addInteraction({
			icon : "fas fa-ruler-combined",
			content : "<spring:message code='lang.area' />",
			interaction : measureArea,
			"float" : "right"
		});

		epan.addInteraction({
			icon : "fas fa-ruler-vertical",
			content : "<spring:message code='lang.length' />",
			interaction : measureLength,
			"float" : "right",
			clickEvent : function() {
				console.log("mesure length");
			}
		}); */

		// hole draw interaction
		/* var hole = new gb.interaction.HoleDraw({
			editTool : epan,
			featureRecord : frecord
		});

		hole.on("change:active", function(evt) {
			if (evt.oldValue) {
				gb.undo.setActive(true);
			} else {
				gb.undo.setActive(false);
			}
		});

		epan.addInteraction({
			icon : "fab fa-bitbucket",
			content : "<spring:message code='lang.hole' />",
			interaction : hole,
			selectActive : true,
			"float" : "right",
			clickEvent : function() {
				console.log("Hole draw");
			}
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

		otree.getJSTreeElement().on('changed.jstreeol3', function(e, data) {
			var treeid = data.selected[0];
			var layer = data.instance.get_LayerById(treeid);

			if (!layer) {
				return;
			}

			if (layer instanceof ol.layer.Image) {
				layer.get("select").createMenuBar(gbMap.getLowerDiv());
			} else {
				var layers = gbMap.getUpperMap().getLayers();
				for (var i = 0; i < layers.getLength(); i++) {
					if (layers.item(i) instanceof ol.layer.Image) {
						layers.item(i).get("select").removeMenuBar();
					}
				}
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

		// command line
		var commandLine = new gb.edit.CommandLine({
			targetElement : gbMap.getLowerDiv()[0],
			jstree : otree,
			editTool : epan,
			locale : locale,
			title : "<spring:message code='lang.command' />",
			// serverURL : urlList.getWFSFeature + urlList.token,
			toggleTarget : "#cmd-toggle-btn",
			isDisplay : false,
			map : gbMap.getUpperMap()
		}); */

		// geocoder
		/* var geocoder = new Geocoder('nominatim', {
			provider : 'osm',
			countrycodes : 'KR',
			key : '__some_key__',
			lang : 'en-US', //pt-BR, fr-FR
			placeholder : 'Search for ...',
			targetType : 'glass-button',
			limit : 5,
			keepOpen : false
		});
		gbMap.getUpperMap().addControl(geocoder);

		var mousePosition = new gb.map.MousePosition({
			map : gbMap.getUpperMap()
		});

		var scaleLine = new ol.control.ScaleLine({
		// 			"target" : $(".gb-scale-line-area")[0],
		// 			"className" : "gb-scale-line"
		});
		gbMap.getUpperMap().addControl(scaleLine); */

		var gitrnd = {
			resize : function() {
				//현재 보이는 브라우저 내부 영역의 높이
				var winHeight = $(window).innerHeight();
				var builderHeaderHeight = $(".builderHeader").outerHeight(true);
				
				if(builderHeaderHeight != 41){
					return;
				}
				//컨텐츠 영역의 높이 지정
				//.mainHeader -> 헤더1
				//.builderHeader -> 헤더2
				//.builderFooter -> 푸터
				// 없으면 삭제한다.
				var conHeight = winHeight
						- ($(".mainHeader").outerHeight(true) + $(".builderHeader").outerHeight(true) + $(".builderFooter").outerHeight(
								true));
				//현재 보이는 브라우저 내부 영역의 너비
				var winWidth = $(window).innerWidth();
				//컨텐츠 (지도) 영역의 너비 지정
				//.builderLayer -> 사이드바
				var mapWidth = ($(".bind").parent().innerWidth(true)) - 1;
				//사이드바의 높이 지정
				$(".builderLayer").outerHeight(conHeight);
				//편집영역의 높이 지정
				$(".builderContent").outerHeight(conHeight);
				//컨텐츠 영역의 너비 지정
				gbMap.setSize(mapWidth, conHeight);
				$(".bind").outerHeight(conHeight);
				$(".cesium-three").outerHeight(conHeight);
				
				if(winWidth <= 992){
					gbMap.setSize(mapWidth, conHeight/2);
					$(".bind").outerHeight(conHeight/2);
					$(".cesium-three").outerHeight(conHeight/2);
				}
				$(".attribute-content").outerHeight(conHeight);
				//컨텐츠 영역(겹친 지도 부분, 베이스맵과 편집영역을 겹쳐서 베이스맵이 편집에 영향이 없도록하기 위함)의 위치를 같게함
				var str = "-" + conHeight + "px";
				// 				$("#builderBaseMap").css("top", str);
				//편집영역이 베이스맵 위로 오도록 겹친 영역의 z-index를 조정
				// 				$("#builderBaseMap").find(".ol-viewport").css("z-index", 1);
				// 				$("#builderMap").find(".ol-viewport").css("z-index", 2);
				//16은 아래 마진, 1은 위 아래 보더 
				var listHeight = $(".builderLayer").innerHeight() / 2 - (16 + 1 + 1);
				// 				41은 패널 헤더의 높이
				var treeHeight = listHeight - (41);
				var searchHeight = $(".builder-tree-search").outerHeight();
				// 				$(".gitbuilder-layer-panel").outerHeight(treeHeight - searchHeight);
				//$(".builderLayerGeoServerPanel").outerHeight(listHeight);
				//$(".builderLayerClientPanel").outerHeight(listHeight);
			}
		}

		$(window).resize(function() {
			gitrnd.resize();
		});

		$(document).ready(function() {
			gitrnd.resize();
		});

		$(window).on("beforeunload", function() {
			if (frecord.isEditing()) {
				return "이 페이지를 벗어나면 작성된 내용은 저장되지 않습니다.";
			}
		});
	</script>
</body>
</html>