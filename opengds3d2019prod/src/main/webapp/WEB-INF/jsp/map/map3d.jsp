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
			
			function init3DObject(){
				// Cesium entity
				var entity = {
						name : 'Polygon',
						polygon : {
							hierarchy : Cesium.Cartesian3.fromDegreesArray([
								minCRS[0], minCRS[1],
								maxCRS[0], minCRS[1],
								maxCRS[0], maxCRS[1],
								minCRS[0], maxCRS[1],
								]),
								material : Cesium.Color.RED.withAlpha(0.2)
						}
				};
				var Polygon = map.getCesiumViewer().entities.add(entity);

				// Three.js Objects
				// Lathe geometry
				var doubleSideMaterial = new THREE.MeshNormalMaterial({
					side: THREE.DoubleSide
				});
				var segments = 10;
				var points = [];
				for ( var i = 0; i < segments; i ++ ) {
					points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * segments + 5, ( i - 5 ) * 2 ) );
				}
				var geometry = new THREE.LatheGeometry( points );
				var latheMesh = new THREE.Mesh( geometry, doubleSideMaterial ) ;
				latheMesh.scale.set(1500,1500,1500); // scale object to be visible at
				// planet scale
				latheMesh.position.z += 15000.0; // translate "up" in Three.js space
				// so the "bottom" of the mesh is
				// the handle
				latheMesh.rotation.x = Math.PI / 2; 
				// rotate mesh for Cesium's Y-up
				// system
				var latheMeshYup = new THREE.Group();
				latheMeshYup.add(latheMesh);
				map.getThreeScene().add(latheMeshYup); // don’t forget to add it to the
				// Three.js scene manually
				// three.control.attach(latheMeshYup);

				// Assign Three.js object mesh to our object array
				//				var _3DOB = new _3DObject();
				//				_3DOB.threeMesh = latheMeshYup;
				//				_3DOB.minCRS = minCRS;
				//				_3DOB.maxCRS = maxCRS;
				var minCRS = [125.23,39.55];
				var maxCRS = [126.23,41.55];
				var obj3d = new gb3d.object.ThreeObject({
					"threeMesh" : latheMeshYup,
					"minCRS" : minCRS,
					"maxCRS" : maxCRS
				});
				
				this.threeObjects.push(obj3d);

				// dodecahedron
				geometry = new THREE.DodecahedronGeometry();
				var dodecahedronMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()) ;
				dodecahedronMesh.scale.set(5000,5000,5000); // scale object to be
				// visible at planet scale
				dodecahedronMesh.position.z += 5000.0; // translate "up" in Three.js
				// space so the "bottom" of the
				// mesh is the handle
				dodecahedronMesh.rotation.x = Math.PI / 2;
				var dodecahedronMeshYup = new THREE.Group();
				dodecahedronMeshYup.add(dodecahedronMesh);
				that.threeScene.add(dodecahedronMeshYup); // don’t forget to add it to
				// the
				// Three.js scene manually
				that.threeTransformControls.attach(dodecahedronMeshYup);

				// Assign Three.js object mesh to our object array
//				_3DOB = new _3DObject();
//				_3DOB.threeMesh = dodecahedronMeshYup;
//				_3DOB.minCRS = minCRS;
//				_3DOB.maxCRS = maxCRS;
				threeObjects.push(dodecahedronMeshYup);

				that.threeScene.add(that.threeTransformControls);
			}
		});
	</script>
</body>
</html>
