/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.Math)
	gb3d.Math = {};

gb3d.Math.isParallel = function(pointA, pointB, standard){
	var a, b, cart, va, vb, dot, result = false;
	
	a = Cesium.Cartesian3.fromDegrees(pointA[0], pointA[1]);
	b = Cesium.Cartesian3.fromDegrees(pointB[0], pointB[1]);
	cart = Cesium.Cartesian3.fromDegrees(standard[0], standard[1]);
	
	va = new THREE.Vector3(a.x - cart.x, a.y - cart.y, a.z - cart.z);
	vb = new THREE.Vector3(b.x - cart.x, b.y - cart.y, b.z - cart.z);
	
	va.normalize();
	vb.normalize();
	
	dot = parseFloat(va.dot(vb).toFixed(7));
	
	if(Math.abs(dot) == 1){
		result = true;
	}
	
	return result;
}

gb3d.Math.crossProductFromDegrees = function(pointA, pointB, standard){
	var a, b, u, v, w, s, cart;
	var ca = {}, cb = {}, cw;
	
	ca.x = pointA[0] - standard[0];
	ca.y = pointA[1] - standard[1];
	cb.x = pointB[0] - standard[0];
	cb.y = pointB[1] - standard[1];
	cw = ca.x*cb.y - ca.y*cb.x;
	
	a = Cesium.Cartesian3.fromDegrees(pointA[0], pointA[1]);
	b = Cesium.Cartesian3.fromDegrees(pointB[0], pointB[1]);
	cart = Cesium.Cartesian3.fromDegrees(standard[0], standard[1]);
	
	a.x = a.x - cart.x;
	a.y = a.y - cart.y;
	a.z = a.z - cart.z;
	b.x = b.x - cart.x;
	b.y = b.y - cart.y;
	b.z = b.z - cart.z;
	
	u = -a.z*b.y + a.y*b.z;
	v = a.z*b.x - a.x*b.z;
	w = -a.y*b.x + a.x*b.y;
	
	if(cw < 0){
		u = -u;
		v = -v;
		w = -w;
	}
	
	s = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2) + Math.pow(w, 2));
	
	return {
		u: u,
		v: v,
		w: w,
		s: s
	}
}

gb3d.Math.getPolygonVertexAndFaceFromDegrees = function(arr, center, depth){
	var coord = arr,
		points = [],
		faceBottom = [],
		faceTop = [],
		faceSide = [],
		faces = [],
		faceVertexUvs = [],
		min = {
			x: 0,
			y: 0
		},
		max = {
			x: undefined,
			y: depth
		},
		coordLength = coord.length - 1,
		cart,
		vect,
		centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1]),
		centerVec = new THREE.Vector3(centerCart.x, centerCart.y, centerCart.z),
		depth = depth;
	
	coord.reverse();
	
	var polygon = new ol.geom.Polygon([coord], "XY");
	
	console.log(coord);
	// 3차원 객체 밑면 vertex 계산
	for(var i = 0; i < coordLength; i++){
		if (i > 0) {
			var from = turf.point([coord[i-1][0], coord[i-1][1]]);
			var to = turf.point([coord[i][0], coord[i][1]]);
			console.log(from);
			console.log(to);
			if (i === 1) {
				var distance = turf.distance(from, to);
				distance = distance * 1000;
				max.x = distance; 
			} else if (i > 1) {
				var distance = turf.distance(from, to);
				distance = distance * 1000;
				if (max.x < distance) {
					max.x = distance;
				}
			}
		}
		cart = Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]);
		vect = new THREE.Vector3(cart.x, cart.y, cart.z);
		vect.sub(centerVec);
		points.push(vect);
	}
	
	faceBottom = THREE.ShapeUtils.triangulateShape(points, []);
	
	for(var i = 0; i < faceBottom.length; i++){
		faceTop.push([faceBottom[i][0] + coordLength, faceBottom[i][1] + coordLength, faceBottom[i][2] + coordLength]);
	}
	
	if (Array.isArray(faceBottom)) {
		for (var i = 0; i < faceBottom.length; i++) {
			var elem = faceBottom[i];
			if (Array.isArray(elem)) {
				elem.reverse();
			}
		}
	}
	console.log(faceBottom);
	
	// 3차원 객체 윗면 vertex 계산
	var cp;
	for(var i = 1; i < coordLength-1; i++){
		if(!gb3d.Math.isParallel(coord[i+1], coord[i-1], coord[i])){
			cp = gb3d.Math.crossProductFromDegrees(coord[i+1], coord[i-1], coord[i]);
			break;
		}
	}
	console.log("좌표 길이는: "+coordLength);
	for(var i = 0; i < coordLength; i++){
		cart = Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]);
		
		if(i === 0){
			faceSide.push([ 0, coordLength - 1, coordLength ]);
			faceSide.push([ coordLength, coordLength - 1, 2*coordLength - 1]);
// faceSide.push([ 2*coordLength - 1, coordLength,0]);
// faceSide.push([ coordLength - 1, 2*coordLength - 1,0]);
		} else {
			faceSide.push([ i, i - 1, i + coordLength]);
			faceSide.push([ i + coordLength, i - 1, i - 1 + coordLength ]);
// faceSide.push([ i - 1 + coordLength, i + coordLength,i ]);
// faceSide.push([ i - 1, i - 1 + coordLength,i ]);
		}
		
// if(i === 0){
// cp = gb3d.Math.crossProductFromDegrees(coord[i+1], coord[coordLength - 1],
// coord[i]);
// }
		
		vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
		vect.sub(centerVec);
		points.push(vect);
	}
	// 바닥면 인덱스 범위
	var bottomStart = 0;
	var bottomEnd = faceBottom.length;
	for(var i = 0; i < faceBottom.length; i++){
		faces.push(new THREE.Face3(faceBottom[i][0], faceBottom[i][1], faceBottom[i][2]));
	}
	// 천장면 인덱스 범위
	var topStart = faceBottom.length;
	var topEnd = faceBottom.length + faceTop.length; 
	for(var i = 0; i < faceTop.length; i++){
		faces.push(new THREE.Face3(faceTop[i][0], faceTop[i][1], faceTop[i][2]));
	}
	// 옆면 인덱스 범위
	var sideStart = faceBottom.length + faceTop.length;
	var sideEnd = faceBottom.length + faceTop.length + faceSide.length;
	for(var i = 0; i < faceSide.length; i++){
		faces.push(new THREE.Face3(faceSide[i][0], faceSide[i][1], faceSide[i][2]));
	}
	
	return {
		points: points,
		faces: faces,
		range: {
			min: min,
			max: max
		},
		coordinates: coord,
		range2d: {
			min: {
				x: polygon.getExtent()[0],
				y: polygon.getExtent()[1] 
			},
			max: {
				x: polygon.getExtent()[2],
				y: polygon.getExtent()[3] 
			}
		},
		uvindex: {
			bottomStart : bottomStart,
			bottomEnd : bottomEnd,
			topStart : topStart, 
			topEnd : topEnd,
			sideStart :  sideStart,
			sideEnd : sideEnd
		}
	}
}
/**
 * 두 점의 선을 입력하면 선을 중심선으로 하는 너비를 가진 직사각형 폴리곤 좌표를 반환한다
 */
gb3d.Math.getRectangleFromLine = function(start, end, radius){
	// 반환할 폴리곤 좌표
	var polygon = [];
	// 시작점
	var startPoint = turf.point(start);
	// 끝점
	var endPoint = turf.point(end); 
	// 1번 점
	var p1Point;
	// 2번 점
	var p2Point;
	// 3번 점
	var p3Point;
	// 4번 점
	var p4Point;
	// 시작점에서의 각도 1번점
	var angleSto1;
	// 시작점에서의 각도 2번점
	var angleSto2;
	// 끝점에서의 각도 3번점
	var angleSto3;
	// 끝점에서의 각도 4번점
	var angleSto4;
	// 시작점과 끝점의 선을 뽑는다
	var startLine = turf.lineString([start, end]);
	// 이 선과 수직인 선의 양 끝점을 구한다
	var perpenPoint1 = turf.point([start[1], start[0] * -1]);
	var perpenPoint2 = turf.point([end[1], end[0] * -1]);
	// 멀리 떨어진 수직선 양끝점을 시작선의 양끝점에 맞도록 연산한다
	// 연산식
	var offsetX1 = ((perpenPoint1.geometry.coordinates[0] * -1) + (startPoint.geometry.coordinates[0]));
	var offsetY1 = ((perpenPoint1.geometry.coordinates[1] * -1) + (startPoint.geometry.coordinates[1]));
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX1, perpenPoint1.geometry.coordinates[1] + offsetY1]);
	console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX1, perpenPoint2.geometry.coordinates[1] + offsetY1]);
	console.log(visedPerpenPoint2);
	// 두 점중에 중심선의 점인 것을 찾는다
	var center1;
	var theOther1;
	if (turf.booleanEqual(startPoint, visedPerpenPoint1)) {
		center1 = visedPerpenPoint1;
		theOther1 = visedPerpenPoint2;
	} else if (turf.booleanEqual(startPoint, visedPerpenPoint2)) {
		center1 = visedPerpenPoint2;
		theOther1 = visedPerpenPoint1;
	}
	console.log(center1);
	console.log(theOther1);
	polygon.push(center1.geometry.coordinates);
	// 각도를 잰다
	var bearing1 = turf.bearing(center1, theOther1);
	angleSto1 = bearing1;
	// 각도로 반지름 만큼 간 위치
	var destination1 = turf.destination(center1, radius / 1000, bearing1);
	// 해당 위치를 추가
	polygon.push(destination1.geometry.coordinates);
	// 1번 점에 할당
	p1Point = destination1;
	
	var po = new ol.geom.LineString([center1.geometry.coordinates, destination1.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX2 = ((perpenPoint2.geometry.coordinates[0] * -1) + (startPoint.geometry.coordinates[0]));
	var offsetY2 = ((perpenPoint2.geometry.coordinates[1] * -1) + (startPoint.geometry.coordinates[1]));
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX2, perpenPoint1.geometry.coordinates[1] + offsetY2]);
	console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX2, perpenPoint2.geometry.coordinates[1] + offsetY2]);
	console.log(visedPerpenPoint2);

	var center2;
	var theOther2;
	if (turf.booleanEqual(startPoint, visedPerpenPoint1)) {
		center2 = visedPerpenPoint1;
		theOther2 = visedPerpenPoint2;
	} else if (turf.booleanEqual(startPoint, visedPerpenPoint2)) {
		center2 = visedPerpenPoint2;
		theOther2 = visedPerpenPoint1;
	}
	console.log(center2);
	console.log(theOther2);
	// 각도를 잰다
	var bearing2 = turf.bearing(center2, theOther2);
	angleSto2 = bearing2;
	// 각도로 반지름 만큼 간 위치
	var destination2 = turf.destination(center2, radius / 1000, bearing2);
	// 해당 위치를 추가
	polygon.push(destination2.geometry.coordinates);
	// 2번 점에 할당
	p2Point = destination2;
	
	var po = new ol.geom.LineString([center2.geometry.coordinates, destination2.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX3 = ((perpenPoint1.geometry.coordinates[0] * -1) + (endPoint.geometry.coordinates[0]));
	var offsetY3 = ((perpenPoint1.geometry.coordinates[1] * -1) + (endPoint.geometry.coordinates[1]));
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX3, perpenPoint1.geometry.coordinates[1] + offsetY3]);
	console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX3, perpenPoint2.geometry.coordinates[1] + offsetY3]);
	console.log(visedPerpenPoint2);

	var center3;
	var theOther3;
	if (turf.booleanEqual(endPoint, visedPerpenPoint1)) {
		center3 = visedPerpenPoint1;
		theOther3 = visedPerpenPoint2;
	} else if (turf.booleanEqual(endPoint, visedPerpenPoint2)) {
		center3 = visedPerpenPoint2;
		theOther3 = visedPerpenPoint1;
	}
	console.log(center3);
	console.log(theOther3);
	// 각도를 잰다
	var bearing3 = turf.bearing(center3, theOther3);
	angleSto3 = bearing3;
	// 각도로 반지름 만큼 간 위치
	var destination3 = turf.destination(center3, radius / 1000, bearing3);
	// 해당 위치를 추가
	polygon.push(destination3.geometry.coordinates);
	// 3번 점에 할당
	p3Point = destination3;
	
	
	var po = new ol.geom.LineString([center3.geometry.coordinates, destination3.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX4 = ((perpenPoint2.geometry.coordinates[0] * -1) + (endPoint.geometry.coordinates[0]));
	var offsetY4 = ((perpenPoint2.geometry.coordinates[1] * -1) + (endPoint.geometry.coordinates[1]));
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX4, perpenPoint1.geometry.coordinates[1] + offsetY4]);
	console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX4, perpenPoint2.geometry.coordinates[1] + offsetY4]);
	console.log(visedPerpenPoint2);
	
	var center4;
	var theOther4;
	if (turf.booleanEqual(endPoint, visedPerpenPoint1)) {
		center4 = visedPerpenPoint1;
		theOther4 = visedPerpenPoint2;
	} else if (turf.booleanEqual(endPoint, visedPerpenPoint2)) {
		center4 = visedPerpenPoint2;
		theOther4 = visedPerpenPoint1;
	}
	console.log(center4);
	console.log(theOther4);
	// 각도를 잰다
	var bearing4 = turf.bearing(center4, theOther4);
	angleSto4 = bearing4;
	// 각도로 반지름 만큼 간 위치
	var destination4 = turf.destination(center4, radius / 1000, bearing4);
	// 해당 위치를 추가
	polygon.push(destination4.geometry.coordinates);
	// 4번 점에 할당
	p4Point = destination4;
	
	var po = new ol.geom.LineString([center4.geometry.coordinates, destination4.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	return {
		"start" : startPoint.geometry.coordinates,
		"end" : endPoint.geometry.coordinates,
		"p1" : p1Point.geometry.coordinates,
		"p2" : p2Point.geometry.coordinates,
		"p3" : p3Point.geometry.coordinates,
		"p4" : p4Point.geometry.coordinates,
		"angle1" : angleSto1,
		"angle2" : angleSto2,
		"angle3" : angleSto3,
		"angle4" : angleSto4
	};
}