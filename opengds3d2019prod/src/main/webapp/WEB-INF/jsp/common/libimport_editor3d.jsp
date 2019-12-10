<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<c:choose>
	<c:when test="${browser == 'MSIE'}">
		<!-- 		스윗얼럿 익스플로러 지원을 위한 코어js -->
		<!-- 		<script src='https://cdnjs.cloudflare.com/ajax/libs/core-js/2.6.5/core.min.js'></script> -->
	</c:when>
</c:choose>
<!-- 바벨 폴리필 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.2.5/polyfill.min.js"></script>
<!-- 폴리필 -->
<!-- <script src="//cdn.polyfill.io/v1/polyfill.min.js"></script> -->
<!-- 바벨 -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- 제이쿼리 -->
<script src="${pageContext.request.contextPath}/resources/js/jquery/jquery-2.2.2.min.js"></script>
<!-- 부트스트랩 -->
<script src="${pageContext.request.contextPath}/resources/js/bootstrap/js/bootstrap.min.js"></script>
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/bootstrap/css/bootstrap.min.css">
<!-- 폰트어썸(아이콘) -->
<%-- <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/fontawesome/css/fontawesome-all.min.css" /> --%>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css"
	integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
<!-- 스윗얼럿(알림) -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/sweetalert2/sweetalert2.css">
<script src="${pageContext.request.contextPath}/resources/js/sweetalert2/sweetalert2.all.js"></script>
<!-- 드롭존(파일업로드) -->
<script src="${pageContext.request.contextPath}/resources/js/dropzone/dropzone.js"></script>
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/dropzone/basic.css">
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/dropzone/dropzone.css">
<!-- 다운로드 js-->
<script src="${pageContext.request.contextPath}/resources/js/download/download.js"></script>
<!-- proj4js -->
<script src="${pageContext.request.contextPath}/resources/js/proj4js/dist/proj4-src.js"></script>
<%-- 오픈 레이어스3 --%>
<%-- <script src="${pageContext.request.contextPath}/resources/js/ol3/ol-debug.js"></script> --%>
<script src="${pageContext.request.contextPath}/resources/js/ol3/5.3.0/ol.js"></script>
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/ol3/5.3.0/ol.css">
<!-- jsts -->
<script src="${pageContext.request.contextPath}/resources/js/jsts/jsts.js"></script>
<!-- turf -->
<script src="${pageContext.request.contextPath}/resources/js/turf/turf.js"></script>
<%-- jsTree--%>
<script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jsTree/jstree.js"></script>
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/jsTree/themes/default/style.css" />
<%-- jsTree geoserver plugin--%>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-geoserver/jstree-geoserver.js"></script>
<%-- jsTree geogig plugin--%>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-geoserver/jstree-geogigfunction.js"></script>
<%-- jsTree openlayers3--%>
<script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/jstree.js"></script>
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/themes/default/style.css" />
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/jstree-visibility.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/jstree-layerproperties.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/jstree-legends.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/jsTree-openlayers3/jstree-functionmarker.js"></script>
<%-- 데이터 테이블 --%>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/datatables/js/jquery.dataTables.min.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/datatables/js/button/dataTables.buttons.min.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/datatables/js/select/dataTables.select.min.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/datatables/js/responsive/dataTables.responsive.min.js"></script>
<script type="text/javascript"
	src="${pageContext.request.contextPath}/resources/js/datatables/js/dataTables.altEditor.free.js"></script>
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/datatables/css/jquery.dataTables.css" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/datatables/css/button/buttons.dataTables.css" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/datatables/css/select/select.dataTables.css" />
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/resources/js/datatables/css/responsive/responsive.dataTables.css" />

<!-- shp2geojson -->
<script src="${pageContext.request.contextPath}/resources/js/shp2geojson/preview.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/shp2geojson/preprocess.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/shp2geojson/jszip.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/shp2geojson/jszip-utils.js"></script>
<!-- gb CSS -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/gb/css/gb.css">
<!-- gb namespace -->
<script src="${pageContext.request.contextPath}/resources/js/gb/gb_namespace.js"></script>
<!-- gb module -->
<script src="${pageContext.request.contextPath}/resources/js/gb/module/isEditing.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/module/serviceVersion.js"></script>
<!-- gb map -->
<!-- gb.map.Map -->
<script src="${pageContext.request.contextPath}/resources/js/gb/map/map.js"></script>
<!-- gb.map.MousePosition -->
<script src="${pageContext.request.contextPath}/resources/js/gb/map/mouseposition.js"></script>
<!-- gb.modal -->
<script src="${pageContext.request.contextPath}/resources/js/gb/modal/base.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/validation/validation.js"></script>
<!-- gb.footer -->
<script src="${pageContext.request.contextPath}/resources/js/gb/footer/base.js"></script>
<!-- gb panel  base -->
<script src="${pageContext.request.contextPath}/resources/js/gb/panel/base.js"></script>
<!-- gb.style -->
<script src="${pageContext.request.contextPath}/resources/js/gb/style/basemap.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/style/layerstyle.js"></script>
<!-- gb layerstyle -->
<script src="${pageContext.request.contextPath}/resources/js/spectrum/spectrum.js"></script>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/js/spectrum/spectrum.css" />
<!-- gb.crs.BaseCRS -->
<script src="${pageContext.request.contextPath}/resources/js/gb/crs/basecrs.js"></script>
<!-- gb.tree.geoserver -->
<script src="${pageContext.request.contextPath}/resources/js/gb/tree/geoserver.js"></script>
<!-- gb.tree.openlayers -->
<script src="${pageContext.request.contextPath}/resources/js/gb/tree/openlayers.js"></script>
<!-- gb.versioning.Repository  -->
<script src="${pageContext.request.contextPath}/resources/js/gb/versioning/repository.js"></script>
<!-- gb.versioning.Feature -->
<script src="${pageContext.request.contextPath}/resources/js/gb/versioning/feature.js"></script>
<!-- gb.edit -->
<script src="${pageContext.request.contextPath}/resources/js/gb/edit/featurerecord.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/edit/undo.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/edit/modifylayerprop.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/edit/command.js"></script>
<!-- gb.interaction -->
<script src="${pageContext.request.contextPath}/resources/js/gb/overriding/olinteractiondraw.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/interaction/multitransform.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/interaction/copy-paste.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/interaction/measuretip.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/interaction/holedraw.js"></script>
<!-- gb.geocoder -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/js/gb/css/ol-geocoder.css">
<script src="${pageContext.request.contextPath}/resources/js/gb/geocoder/ol-geocoder.js"></script>
<!-- gb.geoserver.ImportSHP-->
<script src="${pageContext.request.contextPath}/resources/js/gb/geoserver/uploadshp.js"></script>
<!-- gb.geoserver.uploadjson-->
<script src="${pageContext.request.contextPath}/resources/js/gb/geoserver/uploadgeojson.js"></script>
<!-- gb.layer-->
<script src="${pageContext.request.contextPath}/resources/js/gb/layer/attributeinfo.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/layer/navigator.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/layer/featureList.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/layer/imageLayer.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb/layer/label.js"></script>

<!-- cesium -->
<script src="${pageContext.request.contextPath}/resources/js/cesium/Cesium.js"></script>
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/js/cesium/Widgets/widgets.css" />
<!-- three -->
<script src="${pageContext.request.contextPath}/resources/js/three/three.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/controls/OrbitControls.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/controls/TransformControls.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/controls/DragControls.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/renderers/Projector.js"></script>
<!-- three loaders -->
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/OBJLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/DRACOLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/GLTFLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/deprecated/LegacyGLTFLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/TDSLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/ColladaLoader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/loaders/STLLoader.js"></script>
<!-- three exporters -->
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/GLTFExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/ColladaExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/OBJExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/draco_encoder.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/DracoExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/PLYExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/exporters/STLExporter.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/postprocessing/EffectComposer.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/shaders/CopyShader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/shaders/FXAAShader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/postprocessing/RenderPass.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/postprocessing/ShaderPass.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/three/thirdparty/postprocessing/OutlinePass.js"></script>
<!-- three command -->
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/Command.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/SetPositionCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/SetRotationCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/SetScaleCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/SetUuidCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/SetValueCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setGeometryCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setGeometryValueCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setMaterialColorCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setMaterialCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setMaterialMapCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setMaterialValueCommand.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeCommand/setMaterialVectorCommand.js"></script>
<!-- three UI -->
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/UIElement.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/UIThree.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/signals.min.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Config.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/History.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Strings.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Editor.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Properties.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Geometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Geometry.Geometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.BufferGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.Modifiers.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.BoxGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.CircleGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.CylinderGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.ExtrudeGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.IcosahedronGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.OctahedronGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.PlaneGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.RingGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.SphereGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.ShapeGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.TetrahedronGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.TorusGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.TorusKnotGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.TubeGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.TeapotBufferGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Sidebar.Geometry.LatheGeometry.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Object.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/threeUI/Material.js"></script>
<!-- gb3d -->
<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/js/gb3d/css/gb3d.css" />
<script src="${pageContext.request.contextPath}/resources/js/gb3d/UI.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/Map.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/Camera.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/math/Math.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/jsTree-three/jstree.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/tree/Three.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/object/ThreeObject.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/object/Tileset.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/io/Simple3DManager.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/io/MultiOBJManager.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/io/B3DMManager.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/io/TilesDownloader.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/tree/GeoServer.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/tree/Openlayers.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/edit/EditingToolBase.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/edit/EditingTool2D.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/edit/EditingTool3D.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/edit/TilesetManager.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/style/Declarative.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/io/importer/ImporterThree.js"></script>
<script src="${pageContext.request.contextPath}/resources/js/gb3d/edit/ModelRecord.js"></script>
