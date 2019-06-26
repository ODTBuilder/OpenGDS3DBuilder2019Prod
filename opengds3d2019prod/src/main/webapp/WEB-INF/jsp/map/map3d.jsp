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
.area-2d {
	float: left;
	width: 500px;
	height: 400px;
}

.area-3d {
	float: left;
	width: 500px;
	height: 400px;
}

body {
	background-color: #ededed;
}
</style>
</head>
<body>
	<jsp:include page="/WEB-INF/jsp/common/header.jsp" />
	<div class="builderContent">
		<div class="area-2d"></div>
		<div class="area-3d"></div>
	</div>
	<script>
		$(document).ready(function() {
			var map = new gb3d.Map({
				"target2d" : $(".area-2d")[0],
				"target3d" : $(".area-3d")[0]
			});
			var gbMap = map.getGbMap();
			gbMap.setSize(500, 400);

			var crs = new gb.crs.BaseCRS({
				"locale" : locale !== "" ? locale : "en",
				"message" : $(".epsg-now")[0],
				"maps" : [ gbMap.getUpperMap(), gbMap.getLowerMap() ],
				"epsg" : "4326"
			});
			crs.close();

			var gbBaseMap = new gb.style.BaseMap({
				"map" : gbMap.getLowerMap(),
				"defaultBaseMap" : "osm",
				"locale" : locale !== "" ? locale : "en"
			});
		});
	</script>
</body>
</html>
