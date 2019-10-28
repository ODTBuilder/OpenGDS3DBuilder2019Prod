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
 * 선을 입력하면 선을 중심선으로 하는 너비를 가진 직사각형을 반환한다
 */
gb3d.Math.getRectangleFromLine = function(p1, p2, radius){
	var polygon = [];
	var startPoint = turf.point(p1);
	var secondPoint = turf.point(p2); 
	// 시작점에 버퍼를 준다
// var spBuffer = turf.buffer(startPoint, option["width"]/2, {units :
// "meters"});
	// 시작점과 다음점의 선을 뽑는다
	var startLine = turf.lineString([p1, p2]);
	// 이 선과 수직인 선의 양 끝점을 구한다
// var perpenPoint1= turf.point([(beforeCoord[0][1]) + ((beforeCoord[0][1] * -1)
// + (beforeCoord[0][0])), (beforeCoord[0][0] * -1) + ((beforeCoord[0][0] * -1)
// + (beforeCoord[0][1]))]);
// var perpenPoint2 = turf.point([(beforeCoord[1][1]) + ((beforeCoord[1][1] *
// -1) + (beforeCoord[1][0])), (beforeCoord[1][0] * -1) + ((beforeCoord[1][0] *
// -1) + (beforeCoord[1][1]))]);
	var perpenPoint1 = turf.point([p1[1], p1[0] * -1]);
	var perpenPoint2 = turf.point([p2[1], p2[0] * -1]);
	// 멀리 떨어진 수직선 양끝점을 시작선의 양끝점에 맞도록 연산한다
	// 연산식
	var offsetX1 = ((perpenPoint1.geometry.coordinates[0] * -1) + (startPoint.geometry.coordinates[0]));
	var offsetY1 = ((perpenPoint1.geometry.coordinates[1] * -1) + (startPoint.geometry.coordinates[1]));
	//	var perpenPoint1xOffset = perpenPoint1.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint1yOffset = perpenPoint1.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX1, perpenPoint1.geometry.coordinates[1] + offsetY1]);
	console.log(visedPerpenPoint1);
	//	var perpenPoint2xOffset = perpenPoint2.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint2yOffset = perpenPoint2.geometry.coordinates[1] + offsetY1;
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
	// 각도로 반지름 만큼 간 위치
	var destination1 = turf.destination(center1, radius / 1000, bearing1);
	// 해당 위치를 추가
	polygon.push(destination1.geometry.coordinates);
	
	var po = new ol.geom.LineString([center1.geometry.coordinates, destination1.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX2 = ((perpenPoint2.geometry.coordinates[0] * -1) + (startPoint.geometry.coordinates[0]));
	var offsetY2 = ((perpenPoint2.geometry.coordinates[1] * -1) + (startPoint.geometry.coordinates[1]));
	//	var perpenPoint1xOffset = perpenPoint1.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint1yOffset = perpenPoint1.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX2, perpenPoint1.geometry.coordinates[1] + offsetY2]);
	console.log(visedPerpenPoint1);
	//	var perpenPoint2xOffset = perpenPoint2.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint2yOffset = perpenPoint2.geometry.coordinates[1] + offsetY1;
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
	// 각도로 반지름 만큼 간 위치
	var destination2 = turf.destination(center2, radius / 1000, bearing2);
	// 해당 위치를 추가
	polygon.push(destination2.geometry.coordinates);
	
	var po = new ol.geom.LineString([center2.geometry.coordinates, destination2.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX3 = ((perpenPoint1.geometry.coordinates[0] * -1) + (secondPoint.geometry.coordinates[0]));
	var offsetY3 = ((perpenPoint1.geometry.coordinates[1] * -1) + (secondPoint.geometry.coordinates[1]));
	//	var perpenPoint1xOffset = perpenPoint1.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint1yOffset = perpenPoint1.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX3, perpenPoint1.geometry.coordinates[1] + offsetY3]);
	console.log(visedPerpenPoint1);
	//	var perpenPoint2xOffset = perpenPoint2.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint2yOffset = perpenPoint2.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX3, perpenPoint2.geometry.coordinates[1] + offsetY3]);
	console.log(visedPerpenPoint2);

	var center3;
	var theOther3;
	if (turf.booleanEqual(secondPoint, visedPerpenPoint1)) {
		center3 = visedPerpenPoint1;
		theOther3 = visedPerpenPoint2;
	} else if (turf.booleanEqual(secondPoint, visedPerpenPoint2)) {
		center3 = visedPerpenPoint2;
		theOther3 = visedPerpenPoint1;
	}
	console.log(center3);
	console.log(theOther3);
	// 각도를 잰다
	var bearing3 = turf.bearing(center3, theOther3);
	// 각도로 반지름 만큼 간 위치
	var destination3 = turf.destination(center3, radius / 1000, bearing3);
	// 해당 위치를 추가
	polygon.push(destination3.geometry.coordinates);
	
	var po = new ol.geom.LineString([center3.geometry.coordinates, destination3.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var offsetX4 = ((perpenPoint2.geometry.coordinates[0] * -1) + (secondPoint.geometry.coordinates[0]));
	var offsetY4 = ((perpenPoint2.geometry.coordinates[1] * -1) + (secondPoint.geometry.coordinates[1]));
	//	var perpenPoint1xOffset = perpenPoint1.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint1yOffset = perpenPoint1.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 1
	var visedPerpenPoint1 = turf.point([perpenPoint1.geometry.coordinates[0] + offsetX4, perpenPoint1.geometry.coordinates[1] + offsetY4]);
	console.log(visedPerpenPoint1);
	//	var perpenPoint2xOffset = perpenPoint2.geometry.coordinates[0] + offsetX1;
	//	var perpenPoint2yOffset = perpenPoint2.geometry.coordinates[1] + offsetY1;
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX4, perpenPoint2.geometry.coordinates[1] + offsetY4]);
	console.log(visedPerpenPoint2);
	
	var center4;
	var theOther4;
	if (turf.booleanEqual(secondPoint, visedPerpenPoint1)) {
		center4 = visedPerpenPoint1;
		theOther4 = visedPerpenPoint2;
	} else if (turf.booleanEqual(secondPoint, visedPerpenPoint2)) {
		center4 = visedPerpenPoint2;
		theOther4 = visedPerpenPoint1;
	}
	console.log(center4);
	console.log(theOther4);
	// 각도를 잰다
	var bearing4 = turf.bearing(center4, theOther4);
	// 각도로 반지름 만큼 간 위치
	var destination4 = turf.destination(center4, radius / 1000, bearing4);
	// 해당 위치를 추가
	polygon.push(destination4.geometry.coordinates);
	
	var po = new ol.geom.LineString([center4.geometry.coordinates, destination4.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	// 수직인 선과 시작선의 교차점을 찾는다
	// 피처 콜렉션임
//	var intersects = turf.lineIntersect(startLine, perpenLine);
//	console.log(intersects);
}