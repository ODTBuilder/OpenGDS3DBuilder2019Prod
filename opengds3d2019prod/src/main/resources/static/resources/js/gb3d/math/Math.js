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
	console.log("폴리곤 바닥면 삼각분할: ");
	console.log(faceBottom);
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
// console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX1, perpenPoint2.geometry.coordinates[1] + offsetY1]);
// console.log(visedPerpenPoint2);
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
// console.log(center1);
// console.log(theOther1);
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
// console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX2, perpenPoint2.geometry.coordinates[1] + offsetY2]);
// console.log(visedPerpenPoint2);

	var center2;
	var theOther2;
	if (turf.booleanEqual(startPoint, visedPerpenPoint1)) {
		center2 = visedPerpenPoint1;
		theOther2 = visedPerpenPoint2;
	} else if (turf.booleanEqual(startPoint, visedPerpenPoint2)) {
		center2 = visedPerpenPoint2;
		theOther2 = visedPerpenPoint1;
	}
// console.log(center2);
// console.log(theOther2);
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
// console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX3, perpenPoint2.geometry.coordinates[1] + offsetY3]);
// console.log(visedPerpenPoint2);

	var center3;
	var theOther3;
	if (turf.booleanEqual(endPoint, visedPerpenPoint1)) {
		center3 = visedPerpenPoint1;
		theOther3 = visedPerpenPoint2;
	} else if (turf.booleanEqual(endPoint, visedPerpenPoint2)) {
		center3 = visedPerpenPoint2;
		theOther3 = visedPerpenPoint1;
	}
// console.log(center3);
// console.log(theOther3);
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
// console.log(visedPerpenPoint1);
	// 시작점에 맞춰진 수직선의 점 중 2
	var visedPerpenPoint2 = turf.point([perpenPoint2.geometry.coordinates[0] + offsetX4, perpenPoint2.geometry.coordinates[1] + offsetY4]);
// console.log(visedPerpenPoint2);

	var center4;
	var theOther4;
	if (turf.booleanEqual(endPoint, visedPerpenPoint1)) {
		center4 = visedPerpenPoint1;
		theOther4 = visedPerpenPoint2;
	} else if (turf.booleanEqual(endPoint, visedPerpenPoint2)) {
		center4 = visedPerpenPoint2;
		theOther4 = visedPerpenPoint1;
	}
// console.log(center4);
// console.log(theOther4);
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

	var po = new ol.geom.LineString([p1Point.geometry.coordinates, p3Point.geometry.coordinates], "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());
	
	var po = new ol.geom.LineString([p2Point.geometry.coordinates, p4Point.geometry.coordinates], "XY");
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

/**
 * 두 점의 선을 입력하면 선을 중심선으로 하는 너비를 가진 직사각형 폴리곤 좌표를 반환한다
 * 
 * @param {Array.
 *            <Array.<Number>>} center - 중심좌표
 * @param {number}
 *            radius - 부채꼴의 반지름(meter)
 * @param {number}
 *            sangle - 부채꼴의 시작각
 * @param {number}
 *            eangle - 부채꼴의 끝각
 * @param {boolean}
 *            narrow - 좁은 각을 리턴할지
 * @return {Object} 부채꼴의 좌표
 */
gb3d.Math.getSector = function(center, radius, sangle, eangle, narrow){
	var centerturf = turf.point(center);
	console.log("시작각은: "+sangle);
	console.log("끝각은: "+eangle);
	var absSangle = Math.abs(sangle);
	var absEangle = Math.abs(eangle);
	var absSangleOppo = Math.abs(180 - Math.abs(sangle));
	var absEangleOppo = Math.abs(180 - Math.abs(eangle));
	var sanglea;
	var eanglea;
	var changed = false;
	if (narrow) {
		if (absSangle + absEangle < absSangleOppo + absEangleOppo) {
			sanglea = sangle;
			eanglea = eangle;
		} else {
			sanglea = eangle;
			eanglea = sangle;
			changed = true;
		}	
	} else {
		sanglea = sangle;
		eanglea = eangle;
	}
	var sector = turf.sector(centerturf, radius/1000, sanglea, eanglea);
// console.log(sector);
	// 부채꼴에 가장 밖에 있는 포인트
	// 부채꼴 가장 바깥점 생성시 정말 가까운 점이 두개 생김 거리를 측정해서 하나를 삭제해야함
// var from = turf.point(sector.geometry.coordinates[0][1]);
// var to = turf.point(sector.geometry.coordinates[0][2]);
// var distance = (turf.distance(from, to) * 100000);
	// 두 점의 거리가 5센티보다 작으면 같은 점으로 간주하고 하나 삭제
// if (distance < 5) {
// sector1.geometry.coordinates[0].splice(2, 1);
// }
// sector1.geometry.coordinates[0][1] = [128.0298, 38.5236];

// var from =
// turf.point(sector.geometry.coordinates[0][sector.geometry.coordinates[0].length-3]);
// var to =
// turf.point(sector.geometry.coordinates[0][sector.geometry.coordinates[0].length-2]);
// var distance = (turf.distance(from, to) * 100000);
// // 두 점의 거리가 5센티보다 작으면 같은 점으로 간주하고 하나 삭제
// if (distance < 5) {
// sector.geometry.coordinates[0].splice(sector.geometry.coordinates[0].length-3,
// 1);
// }

	var po = new ol.geom.Polygon(sector.geometry.coordinates, "XY");
	var fe = new ol.Feature(po);
	sourceyj.addFeature(fe);
	gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

	return {
		"center" : center,
		"sindex" : !changed ? 1 : sector.geometry.coordinates[0].length-2,
				"eindex" : !changed ? sector.geometry.coordinates[0].length-2 : 1,
						"coordinates" : sector.geometry.coordinates
	};
}

gb3d.Math.getLineStringVertexAndFaceFromDegrees = function(arr, radius, center, depth){
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

	// 라인 상태에서 말고 버퍼된 상태에서 수행해야함
	// 3차원 객체 밑면 vertex 계산
	/*
	 * for(var i = 0; i < coordLength; i++){ if (i > 0) { var from =
	 * turf.point([coord[i-1][0], coord[i-1][1]]); var to =
	 * turf.point([coord[i][0], coord[i][1]]); console.log(from);
	 * console.log(to); if (i === 1) { var distance = turf.distance(from, to);
	 * distance = distance * 1000; max.x = distance; } else if (i > 1) { var
	 * distance = turf.distance(from, to); distance = distance * 1000; if (max.x <
	 * distance) { max.x = distance; } } } cart =
	 * Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]); vect = new
	 * THREE.Vector3(cart.x, cart.y, cart.z); vect.sub(centerVec);
	 * points.push(vect); }
	 */
	var sectorVertice = [];
	var sectorFaces = [];
	var sectorSides = [];
	
	var rectangleVertice = [];
	var rectangleFaces = [];
	var rectangleSides = [];
	
	// 시작점을 뽑는다
	var start = coord[0];
	var startPoint = turf.point(start);
	var secondPoint = turf.point(coord[1]); 

	var startRect = gb3d.Math.getRectangleFromLine(coord[0], coord[1], radius);
	var se1 = gb3d.Math.getSector(start, radius, startRect["angle1"], startRect["angle2"], false);
	// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
	var exceptLastSE1 = se1.coordinates[0].slice(0, se1.coordinates[0].length - 1);
	// 밑면을 저장한다
	for (var i = 0; i < exceptLastSE1.length; i++) {
		cart = Cesium.Cartesian3.fromDegrees(exceptLastSE1[i][0], exceptLastSE1[i][1]);
		vect = new THREE.Vector3(cart.x, cart.y, cart.z);
		vect.sub(centerVec);
		sectorVertice.push(vect);
		if (i !== 0) {
			if (exceptLastSE1[0] && exceptLastSE1[i] && exceptLastSE1[i+1]) {
				var face = [0, i, i+1];
				sectorFaces.push(face);			
			}	
		}
	}
	// 3차원 객체 윗면 vertex 계산
	var cp;
	for(var i = 1; i < exceptLastSE1.length -1; i++){
		if(!gb3d.Math.isParallel(exceptLastSE1[i+1], exceptLastSE1[i-1], exceptLastSE1[i])){
			cp = gb3d.Math.crossProductFromDegrees(exceptLastSE1[i+1], exceptLastSE1[i-1], exceptLastSE1[i]);
			break;
		}
	}
	console.log("좌표 길이는: "+exceptLastSE1.length);
	for(var i = 0; i < exceptLastSE1.length; i++){
		cart = Cesium.Cartesian3.fromDegrees(exceptLastSE1[i][0], exceptLastSE1[i][1]);
		if(i > 1){
			sectorSides.push([ i, i - 1, i + exceptLastSE1.length]);
			sectorSides.push([ i + exceptLastSE1.length, i - 1, i - 1 + exceptLastSE1.length ]);
		}
		vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
		vect.sub(centerVec);
		sectorVertice.push(vect);
	}
// console.log("지금까지 연결된 배열: ");
// console.log(bufferedLineString);
	
	// 라인의 마지막 점에 수행할 부채꼴
	var endPoint = turf.point(coord[coord.length - 1]);
	var endRect = gb3d.Math.getRectangleFromLine(coord[coord.length - 2], coord[coord.length - 1], radius);
	var se2 = gb3d.Math.getSector(coord[coord.length - 1], radius, endRect["angle4"], endRect["angle3"], false);

	// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
	var exceptLastSE2 = se2.coordinates[0].slice(0, se2.coordinates[0].length - 1);
	var vlength = sectorVertice.length;
	for (var i = 0; i < exceptLastSE2.length; i++) {
		cart = Cesium.Cartesian3.fromDegrees(exceptLastSE2[i][0], exceptLastSE2[i][1]);
		vect = new THREE.Vector3(cart.x, cart.y, cart.z);
		vect.sub(centerVec);
		sectorVertice.push(vect);
		if (i !== 0) {
			if (exceptLastSE2[0] && exceptLastSE2[i] && exceptLastSE2[i+1]) {
				var face = [vlength, vlength + i, vlength + i + 1];
				sectorFaces.push(face);			
			}	
		}
	}
	// 3차원 객체 윗면 vertex 계산
	var cp;
	for(var i = 1; i < exceptLastSE2.length -1; i++){
		if(!gb3d.Math.isParallel(exceptLastSE2[i+1], exceptLastSE2[i-1], exceptLastSE2[i])){
			cp = gb3d.Math.crossProductFromDegrees(exceptLastSE2[i+1], exceptLastSE2[i-1], exceptLastSE2[i]);
			break;
		}
	}
	console.log("좌표 길이는: "+exceptLastSE2.length);
	for(var i = 0; i < exceptLastSE2.length; i++){
		cart = Cesium.Cartesian3.fromDegrees(exceptLastSE2[i][0], exceptLastSE2[i][1]);
		if(i > 1){
			sectorSides.push([ i, i - 1, i + exceptLastSE2.length]);
			sectorSides.push([ i + exceptLastSE2.length, i - 1, i - 1 + exceptLastSE2.length ]);
		}
		vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
		vect.sub(centerVec);
		sectorVertice.push(vect);
	}
	// 시작선과 끝선의 긴쪽 모서리
	var start13 = turf.lineString([startRect["p1"], startRect["p3"]]);
	var start24 = turf.lineString([startRect["p2"], startRect["p4"]]);
	var end13 = turf.lineString([endRect["p1"], endRect["p3"]]);
	var end24 = turf.lineString([endRect["p2"], endRect["p4"]]);

	// 중간 점들을 포문 돌면서 네모 만들고 꺾인 부분 처리
	// 제일 처음과 마지막 선은 다르게 처리해야 하므로 0과 마지막 인덱스를 뺀다
	var midRects = [];
	if (coord.length > 3) {
		var startFor = 1;
		var untilFor = coord.length - 2;
		for (var i = startFor; i < untilFor; i++) { 
			var midRect = gb3d.Math.getRectangleFromLine(coord[i], coord[i+1], radius);
			midRects.push(midRect);
		}
	} else if(coord.length === 3){
		// 점이 두개만 있는 경우
		var intersects13 = turf.lineIntersect(start13, end13);
		var intersects24 = turf.lineIntersect(start24, end24);

		if (intersects13.features.length > 0 && intersects24.features.length > 0) {
			// 두 사각형이 평행임
			console.log("두 사각형이 평행임");
		} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
			// 13번 선만 겹침
			startRect["p3"] = intersects13.features[0]["geometry"]["coordinates"];
			// 반시계로 넣음 1-3-4-2
			var rectOrder = [startRect["p1"], startRect["p3"], startRect["p4"], startRect["p2"]];
			// 밑면 버텍스
			for (var j = 0; j < rectOrder.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				rectangleVertice.push(vect);
			}
			// 밑면 페이스
			rectangleFaces.push([0, 3, 2]);
			rectangleFaces.push([0, 2, 1]);
			
			// 벡터 계산
			var cp;
			for(var i = 1; i < rectOrder.length -1; i++){
				if(!gb3d.Math.isParallel(rectOrder[i+1], rectOrder[i-1], rectOrder[i])){
					cp = gb3d.Math.crossProductFromDegrees(rectOrder[i+1], rectOrder[i-1], rectOrder[i]);
					break;
				}
			}
			console.log("좌표 길이는: "+rectOrder.length);
			// 윗면 버텍스
			for(var i = 0; i < rectOrder.length; i++){
				cart = Cesium.Cartesian3.fromDegrees(rectOrder[i][0], rectOrder[i][1]);
				// 보여야 할 옆면 페이스
				if (i === 0) {
					rectangleSides.push([ i, 1 + rectOrder.length, i + 1 ]);
					rectangleSides.push([ i, rectOrder.length, 1 + rectOrder.length ]);	
				} else if (i === 2) {
					rectangleSides.push([ i, 2 * rectOrder.length - 1, i + 1 ]);
					rectangleSides.push([ i, i + rectOrder.length, 2 * rectOrder.length - 1 ]);
				}
			
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
				rectangleVertice.push(vect);
			}
			
			var po1 = new ol.geom.Point(startRect["p3"], "XY");
			var fe1 = new ol.Feature(po1);
			sourceyj.addFeature(fe1);
			gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

			endRect["p1"] = intersects13.features[0]["geometry"]["coordinates"];
			// 밑면 좌표
			var rectOrder = [endRect["p1"], endRect["p3"], endRect["p4"], endRect["p2"]];
			// 밑면 버텍스
			for (var j = 0; j < rectOrder.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				rectangleVertice.push(vect);
			}
			// 밑면 페이스
			rectangleFaces.push([rectangleVertice.length + 0, rectangleVertice.length + 3, rectangleVertice.length + 2]);
			rectangleFaces.push([rectangleVertice.length + 0, rectangleVertice.length + 2, rectangleVertice.length + 1]);
			
			// 벡터 계산
			var cp;
			for(var i = 1; i < rectOrder.length -1; i++){
				if(!gb3d.Math.isParallel(rectOrder[i+1], rectOrder[i-1], rectOrder[i])){
					cp = gb3d.Math.crossProductFromDegrees(rectOrder[i+1], rectOrder[i-1], rectOrder[i]);
					break;
				}
			}
			console.log("좌표 길이는: "+rectOrder.length);
			// 윗면 버텍스
			for(var i = 0; i < rectOrder.length; i++){
				cart = Cesium.Cartesian3.fromDegrees(rectOrder[i][0], rectOrder[i][1]);
				// 보여야 할 옆면 페이스
				if (i === 0) {
					rectangleSides.push([ rectangleVertice.length + i, rectangleVertice.length + 1 + rectOrder.length, rectangleVertice.length + i + 1 ]);
					rectangleSides.push([ rectangleVertice.length + i, rectangleVertice.length + rectOrder.length, rectangleVertice.length + 1 + rectOrder.length ]);	
				} else if (i === 2) {
					rectangleSides.push([ rectangleVertice.length + i, rectangleVertice.length + (2 * rectOrder.length - 1), rectangleVertice.length + i + 1 ]);
					rectangleSides.push([ rectangleVertice.length + i, rectangleVertice.length + i + rectOrder.length, rectangleVertice.length + (2 * rectOrder.length - 1) ]);
				}
			
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
				rectangleVertice.push(vect);
			}
			
			var po2 = new ol.geom.Point(endRect["p1"], "XY");
			var fe2 = new ol.Feature(po2);
			sourceyj.addFeature(fe2);
			gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

			var outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], endRect["angle2"] );
			
			// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
			var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
			var vlength = sectorVertice.length;
			for (var j = 0; j < exceptLast.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				sectorVertice.push(vect);
				if (j !== 0) {
					if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
						var face = [vlength, vlength + j, vlength + j + 1];
						sectorFaces.push(face);			
					}	
				}
			}
			
			// 3차원 객체 윗면 vertex 계산
			var cp;
			for(var j = 1; j < exceptLast.length -1; j++){
				if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
					cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
					break;
				}
			}
			console.log("좌표 길이는: "+exceptLast.length);
			for(var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				if(j > 1){
					sectorSides.push([ j, j - 1, j + exceptLast.length]);
					sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
				}
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
				sectorVertice.push(vect);
			}
		} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
			// 24번 선만 겹침
			startRect["p4"] = intersects24.features[0]["geometry"]["coordinates"];

			var po1 = new ol.geom.Point(startRect["p4"], "XY");
			var fe1 = new ol.Feature(po1);
			sourceyj.addFeature(fe1);
			gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

			endRect["p2"] = intersects24.features[0]["geometry"]["coordinates"];

			var po2 = new ol.geom.Point(endRect["p2"], "XY");
			var fe2 = new ol.Feature(po2);
			sourceyj.addFeature(fe2);
			gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

			var outerSector = gb3d.Math.getSector(startRect["end"], radius, endRect["angle1"], startRect["angle3"] );
			
			// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
			var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
			var vlength = sectorVertice.length;
			for (var j = 0; j < exceptLast.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				sectorVertice.push(vect);
				if (j !== 0) {
					if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
						var face = [vlength, vlength + j, vlength + j + 1];
						sectorFaces.push(face);			
					}	
				}
			}
			// 3차원 객체 윗면 vertex 계산
			var cp;
			for(var j = 1; j < exceptLast.length -1; j++){
				if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
					cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
					break;
				}
			}
			console.log("좌표 길이는: "+exceptLast.length);
			for(var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				if(j > 1){
					sectorSides.push([ j, j - 1, j + exceptLast.length]);
					sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
				}
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
				sectorVertice.push(vect);
			}
		} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
			// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
			var center = turf.point(startRect["end"]);
			var point1 = turf.point(endRect["p1"]);
			var point2 = turf.point(endRect["p2"]);
			
			var bearing1 = turf.bearing(center, point1);
			var abs1 = Math.abs(bearing1);
			var bearing2 = turf.bearing(center, point2);
			var abs2 = Math.abs(bearing2);
			var round;
			if (abs1 > abs2) {
				console.log("1번과의 각도는: "+bearing1);
				console.log("즉, 앞 3번과 뒤 1번을 잇는 부채꼴");
				// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은 선으로 간주하고
				// 부채꼴 그리면 안됨
				var center = turf.point(startRect["end"]);
				var point1 = turf.point(startRect["start"]);
				var point2 = turf.point(endRect["end"]);
				var bearing1 = turf.bearing(center, point1);
				var bearing2 = turf.bearing(center, point2);
				if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
					var abs1 = Math.abs(bearing1);
					var abs2 = Math.abs(bearing2);
					var flag;
					if (abs1 > abs2) {
						flag = abs1 - abs2;
					} else if (abs1 < abs2) {
						flag = abs2 - abs1;
					}
					round = parseFloat(flag.toFixed(2));
					console.log("두 선의 각도는: "+round);
				} else {
					var abs1 = Math.abs(bearing1);
					var abs2 = Math.abs(bearing2);
					var flag = abs1 + abs2;
					round = parseFloat(flag.toFixed(2));
					console.log("두 선의 각도는: "+round);
				}
			} else if (abs1 < abs2) {
				console.log("2번과의 각도는: "+bearing2);
				console.log("즉, 앞 4번과 뒤 2번을 잇는 부채꼴");
				// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은 선으로 간주하고
				// 부채꼴 그리면 안됨
				var center = turf.point(startRect["end"]);
				var point1 = turf.point(startRect["start"]);
				var point2 = turf.point(endRect["end"]);
				var bearing1 = turf.bearing(center, point1);
				var bearing2 = turf.bearing(center, point2);
				var round;
				if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
					var abs1 = Math.abs(bearing1);
					var abs2 = Math.abs(bearing2);
					var flag;
					if (abs1 > abs2) {
						flag = abs1 - abs2;
					} else if (abs1 < abs2) {
						flag = abs2 - abs1;
					}
					round = parseFloat(flag.toFixed(2));
					console.log("두 선의 각도는: "+round);
				} else {
					var abs1 = Math.abs(bearing1);
					var abs2 = Math.abs(bearing2);
					var flag = abs1 + abs2;
					round = parseFloat(flag.toFixed(2));
					console.log("두 선의 각도는: "+round);
				}
			}
			var outerSector;
			if (round < 180) {
				// 사각형의 위 아래 좌표의 높이를 비교해서 부채꼴을 그릴 위치를 뒤집는다
				if (startRect["p3"][1] > startRect["p4"][1] && endRect["p1"][1] > endRect["p2"][1]) {
					outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], endRect["angle2"]);
				} else {
					outerSector = gb3d.Math.getSector(startRect["end"], radius, endRect["angle1"], startRect["angle3"]);	
				}
			} else if (round > 180) {
				if (startRect["p3"][1] > startRect["p4"][1] && endRect["p1"][1] > endRect["p2"][1]) {
					outerSector = gb3d.Math.getSector(startRect["end"], radius, endRect["angle1"], startRect["angle3"]);
				} else {
					outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], endRect["angle2"]);											
				}
			}
			// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
			var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
			var vlength = sectorVertice.length;
			for (var j = 0; j < exceptLast.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				sectorVertice.push(vect);
				if (j !== 0) {
					if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
						var face = [vlength, vlength + j, vlength + j + 1];
						sectorFaces.push(face);			
					}	
				}
			}
			// 3차원 객체 윗면 vertex 계산
			var cp;
			for(var j = 1; j < exceptLast.length -1; j++){
				if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
					cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
					break;
				}
			}
			console.log("좌표 길이는: "+exceptLast.length);
			for(var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				if(j > 1){
					sectorSides.push([ j, j - 1, j + exceptLast.length]);
					sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
				}
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
				sectorVertice.push(vect);
			}
		}
	} else if (coord.length < 2) {
		console.error("need over 1 points");
		return;
	}
	// 안쪽으로 꺾인 라인의 교차점 찾기
	// 사각형들을 잇는 부채꼴을 그리기
	console.log("중간선들의 개수는: "+midRects.length);
	if (midRects.length > 0) {
		for (var i = 0; i < midRects.length; i++) {
			var cmid13;
			var cmid24;
			var nmid13;
			var nmid24;
			if (i === 0) {
				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				var intersects13 = turf.lineIntersect(start13, cmid13);
				var intersects24 = turf.lineIntersect(start24, cmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					console.log("두 사각형이 평행임");
				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					startRect["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(startRect["p3"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p1"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], midRects[i]["angle2"] );
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					startRect["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(startRect["p4"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p2"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(startRect["end"], radius, midRects[i]["angle1"], startRect["angle3"] );
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					var center = turf.point(startRect["end"]);
					var point1 = turf.point(midRects[i]["p1"]);
					var point2 = turf.point(midRects[i]["p2"]);
					
					var bearing1 = turf.bearing(center, point1);
					var abs1 = Math.abs(bearing1);
					var bearing2 = turf.bearing(center, point2);
					var abs2 = Math.abs(bearing2);
					var round;
					if (abs1 > abs2) {
						console.log("1번과의 각도는: "+bearing1);
						console.log("즉, 앞 3번과 뒤 1번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(startRect["end"]);
						var point1 = turf.point(startRect["start"]);
						var point2 = turf.point(midRects[i]["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					} else if (abs1 < abs2) {
						console.log("2번과의 각도는: "+bearing2);
						console.log("즉, 앞 4번과 뒤 2번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(startRect["end"]);
						var point1 = turf.point(startRect["start"]);
						var point2 = turf.point(midRects[i]["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					}
					var outerSector;
					if (round < 180) {
						if (startRect["p3"][1] > startRect["p4"][1] && midRects[i]["p1"][1] > midRects[i]["p2"][1]) {
							outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], midRects[i]["angle2"]);
						} else {
							outerSector = gb3d.Math.getSector(startRect["end"], radius, midRects[i]["angle1"], startRect["angle3"]);	
						}
					} else if (round > 180) {
						if (startRect["p3"][1] > startRect["p4"][1] && midRects[i]["p1"][1] > midRects[i]["p2"][1]) {
							outerSector = gb3d.Math.getSector(startRect["end"], radius, midRects[i]["angle1"], startRect["angle3"]);
						} else {
							outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], midRects[i]["angle2"]);											
						}
					}
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				}

				if (midRects.length > 1) {
					nmid13 = turf.lineString([midRects[i+1]["p1"], midRects[i+1]["p3"]]);
					nmid24 = turf.lineString([midRects[i+1]["p2"], midRects[i+1]["p4"]]);
					var intersects13 = turf.lineIntersect(cmid13, nmid13);
					var intersects24 = turf.lineIntersect(cmid24, nmid24);

					if (intersects13.features.length > 0 && intersects24.features.length > 0) {
						// 두 사각형이 평행임
						console.log("두 사각형이 평행임");
					} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
						// 13번 선만 겹침
						midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

						var po1 = new ol.geom.Point(midRects[i]["p3"], "XY");
						var fe1 = new ol.Feature(po1);
						sourceyj.addFeature(fe1);
						gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

						midRects[i+1]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

						var po2 = new ol.geom.Point(midRects[i+1]["p1"], "XY");
						var fe2 = new ol.Feature(po2);
						sourceyj.addFeature(fe2);
						gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

						var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"] );
						// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
						var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
						var vlength = sectorVertice.length;
						for (var j = 0; j < exceptLast.length; j++) {
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							vect = new THREE.Vector3(cart.x, cart.y, cart.z);
							vect.sub(centerVec);
							sectorVertice.push(vect);
							if (j !== 0) {
								if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
									var face = [vlength, vlength + j, vlength + j + 1];
									sectorFaces.push(face);			
								}	
							}
						}
						// 3차원 객체 윗면 vertex 계산
						var cp;
						for(var j = 1; j < exceptLast.length -1; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}
						console.log("좌표 길이는: "+exceptLast.length);
						for(var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							if(j > 1){
								sectorSides.push([ j, j - 1, j + exceptLast.length]);
								sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
							}
							vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
							vect.sub(centerVec);
							sectorVertice.push(vect);
						}
					} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
						// 24번 선만 겹침
						midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

						var po1 = new ol.geom.Point(midRects[i]["p4"], "XY");
						var fe1 = new ol.Feature(po1);
						sourceyj.addFeature(fe1);
						gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

						midRects[i+1]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

						var po2 = new ol.geom.Point(midRects[i+1]["p2"], "XY");
						var fe2 = new ol.Feature(po2);
						sourceyj.addFeature(fe2);
						gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

						var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"] );
						// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
						var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
						var vlength = sectorVertice.length;
						for (var j = 0; j < exceptLast.length; j++) {
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							vect = new THREE.Vector3(cart.x, cart.y, cart.z);
							vect.sub(centerVec);
							sectorVertice.push(vect);
							if (j !== 0) {
								if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
									var face = [vlength, vlength + j, vlength + j + 1];
									sectorFaces.push(face);			
								}	
							}
						}
						// 3차원 객체 윗면 vertex 계산
						var cp;
						for(var j = 1; j < exceptLast.length -1; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}
						console.log("좌표 길이는: "+exceptLast.length);
						for(var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							if(j > 1){
								sectorSides.push([ j, j - 1, j + exceptLast.length]);
								sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
							}
							vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
							vect.sub(centerVec);
							sectorVertice.push(vect);
						}
					} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
						// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
						var center = turf.point(midRects[i]["end"]);
						var point1 = turf.point(midRects[i+1]["p1"]);
						var point2 = turf.point(midRects[i+1]["p2"]);
						
						var bearing1 = turf.bearing(center, point1);
						var abs1 = Math.abs(bearing1);
						var bearing2 = turf.bearing(center, point2);
						var abs2 = Math.abs(bearing2);
						var round;
						if (abs1 > abs2) {
							console.log("1번과의 각도는: "+bearing1);
							console.log("즉, 앞 3번과 뒤 1번을 잇는 부채꼴");
							// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게
							// 그은 선으로 간주하고 부채꼴 그리면 안됨
							var center = turf.point(midRects[i]["end"]);
							var point1 = turf.point(midRects[i]["start"]);
							var point2 = turf.point(midRects[i+1]["end"]);
							var bearing1 = turf.bearing(center, point1);
							var bearing2 = turf.bearing(center, point2);
							if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
								var abs1 = Math.abs(bearing1);
								var abs2 = Math.abs(bearing2);
								var flag;
								if (abs1 > abs2) {
									flag = abs1 - abs2;
								} else if (abs1 < abs2) {
									flag = abs2 - abs1;
								}
								round = parseFloat(flag.toFixed(2));
								console.log("두 선의 각도는: "+round);
								
							} else {
								var abs1 = Math.abs(bearing1);
								var abs2 = Math.abs(bearing2);
								var flag = abs1 + abs2;
								round = parseFloat(flag.toFixed(2));
								console.log("두 선의 각도는: "+round);
							}
						} else if (abs1 < abs2) {
							console.log("2번과의 각도는: "+bearing2);
							console.log("즉, 앞 4번과 뒤 2번을 잇는 부채꼴");
							// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게
							// 그은 선으로 간주하고 부채꼴 그리면 안됨
							var center = turf.point(midRects[i]["end"]);
							var point1 = turf.point(midRects[i]["start"]);
							var point2 = turf.point(midRects[i+1]["end"]);
							var bearing1 = turf.bearing(center, point1);
							var bearing2 = turf.bearing(center, point2);
							if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
								var abs1 = Math.abs(bearing1);
								var abs2 = Math.abs(bearing2);
								var flag;
								if (abs1 > abs2) {
									flag = abs1 - abs2;
								} else if (abs1 < abs2) {
									flag = abs2 - abs1;
								}
								round = parseFloat(flag.toFixed(2));
								console.log("두 선의 각도는: "+round);
								
							} else {
								var abs1 = Math.abs(bearing1);
								var abs2 = Math.abs(bearing2);
								var flag = abs1 + abs2;
								round = parseFloat(flag.toFixed(2));
								console.log("두 선의 각도는: "+round);
							}
						}
						var outerSector;
						if (round < 180) {
							if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && midRects[i+1]["p1"][1] > midRects[i+1]["p2"][1]) {
								outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"]);
							} else {
								outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"]);	
							}
						} else if (round > 180) {
							if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && midRects[i+1]["p1"][1] > midRects[i+1]["p2"][1]) {
								outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"]);
							} else {
								outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"]);											
							}
						}
						// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
						var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
						var vlength = sectorVertice.length;
						for (var j = 0; j < exceptLast.length; j++) {
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							vect = new THREE.Vector3(cart.x, cart.y, cart.z);
							vect.sub(centerVec);
							sectorVertice.push(vect);
							if (j !== 0) {
								if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
									var face = [vlength, vlength + j, vlength + j + 1];
									sectorFaces.push(face);			
								}	
							}
						}
						// 3차원 객체 윗면 vertex 계산
						var cp;
						for(var j = 1; j < exceptLast.length -1; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}
						console.log("좌표 길이는: "+exceptLast.length);
						for(var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							if(j > 1){
								sectorSides.push([ j, j - 1, j + exceptLast.length]);
								sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
							}
							vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
							vect.sub(centerVec);
							sectorVertice.push(vect);
						}
					}
				}
			}  
			if (i === midRects.length - 1) {
				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				var intersects13 = turf.lineIntersect(end13, cmid13);
				var intersects24 = turf.lineIntersect(end24, cmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					console.log("두 사각형이 평행임");
				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					endRect["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(endRect["p1"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p3"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(endRect["start"], radius, midRects[i]["angle4"], endRect["angle2"]);
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					endRect["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(endRect["p2"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p4"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(endRect["start"], radius, endRect["angle1"], midRects[i]["angle3"]);
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					var center = turf.point(midRects[i]["end"]);
					var point1 = turf.point(endRect["p1"]);
					var point2 = turf.point(endRect["p2"]);
					
					var bearing1 = turf.bearing(center, point1);
					var abs1 = Math.abs(bearing1);
					var bearing2 = turf.bearing(center, point2);
					var abs2 = Math.abs(bearing2);
					var round;
					if (abs1 > abs2) {
						console.log("1번과의 각도는: "+bearing1);
						console.log("즉, 앞 3번과 뒤 1번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(midRects[i]["end"]);
						var point1 = turf.point(midRects[i]["start"]);
						var point2 = turf.point(endRect["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						var round;
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					} else if (abs1 < abs2) {
						console.log("2번과의 각도는: "+bearing2);
						console.log("즉, 앞 4번과 뒤 2번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(midRects[i]["end"]);
						var point1 = turf.point(midRects[i]["start"]);
						var point2 = turf.point(endRect["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						var round;
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					}
					var outerSector;
					if (round < 180) {
						if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && endRect["p1"][1] > endRect["p2"][1]) {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], endRect["angle2"]);
						} else {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, endRect["angle1"], midRects[i]["angle3"]);	
						}
					} else if (round > 180) {
						if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && endRect["p1"][1] > endRect["p2"][1]) {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, endRect["angle1"], midRects[i]["angle3"]);
						} else {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], endRect["angle2"]);											
						}
					}
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				}
			}
			if (i !== 0 && i !== midRects.length - 1 && midRects.length > 1) {

				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				nmid13 = turf.lineString([midRects[i+1]["p1"], midRects[i+1]["p3"]]);
				nmid24 = turf.lineString([midRects[i+1]["p2"], midRects[i+1]["p4"]]);
				var intersects13 = turf.lineIntersect(cmid13, nmid13);
				var intersects24 = turf.lineIntersect(cmid24, nmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					console.log("두 사각형이 평행임");
				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(midRects[i]["p3"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i+1]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i+1]["p1"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"] );
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(midRects[i]["p4"], "XY");
					var fe1 = new ol.Feature(po1);
					sourceyj.addFeature(fe1);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					midRects[i+1]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i+1]["p2"], "XY");
					var fe2 = new ol.Feature(po2);
					sourceyj.addFeature(fe2);
					gbMap.getUpperMap().getView().fit(sourceyj.getExtent());

					var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"] );
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				}  else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					var center = turf.point(midRects[i]["end"]);
					var point1 = turf.point(midRects[i+1]["p1"]);
					var point2 = turf.point(midRects[i+1]["p2"]);
					
					var bearing1 = turf.bearing(center, point1);
					var abs1 = Math.abs(bearing1);
					var bearing2 = turf.bearing(center, point2);
					var abs2 = Math.abs(bearing2);
					var round;
					if (abs1 > abs2) {
						console.log("1번과의 각도는: "+bearing1);
						console.log("즉, 앞 3번과 뒤 1번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(midRects[i]["end"]);
						var point1 = turf.point(midRects[i]["start"]);
						var point2 = turf.point(midRects[i+1]["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					} else if (abs1 < abs2) {
						console.log("2번과의 각도는: "+bearing2);
						console.log("즉, 앞 4번과 뒤 2번을 잇는 부채꼴");
						// 앞 end를 중심으로 앞 start와 뒤 end의 각도를 구해서 90도 이상이면 평행하게 그은
						// 선으로 간주하고 부채꼴 그리면 안됨
						var center = turf.point(midRects[i]["end"]);
						var point1 = turf.point(midRects[i]["start"]);
						var point2 = turf.point(midRects[i+1]["end"]);
						var bearing1 = turf.bearing(center, point1);
						var bearing2 = turf.bearing(center, point2);
						if ((bearing1 < 0 && bearing2 < 0) || (bearing1 > 0 && bearing2 > 0)) {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag;
							if (abs1 > abs2) {
								flag = abs1 - abs2;
							} else if (abs1 < abs2) {
								flag = abs2 - abs1;
							}
							var round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						} else {
							var abs1 = Math.abs(bearing1);
							var abs2 = Math.abs(bearing2);
							var flag = abs1 + abs2;
							var round = parseFloat(flag.toFixed(2));
							console.log("두 선의 각도는: "+round);
						}
					}
					var outerSector;
					if (round < 180) {
						if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && midRects[i+1]["p1"][1] > midRects[i+1]["p2"][1]) {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"]);
						} else {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"]);	
						}
					} else if (round > 180) {
						if (midRects[i]["p3"][1] > midRects[i]["p4"][1] && midRects[i+1]["p1"][1] > midRects[i+1]["p2"][1]) {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"]);
						} else {
							outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"]);											
						}
					}
					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates[0].slice(0, outerSector.coordinates[0].length - 1);
					var vlength = sectorVertice.length;
					for (var j = 0; j < exceptLast.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						sectorVertice.push(vect);
						if (j !== 0) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								sectorFaces.push(face);			
							}	
						}
					}
					// 3차원 객체 윗면 vertex 계산
					var cp;
					for(var j = 1; j < exceptLast.length -1; j++){
						if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
							cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
							break;
						}
					}
					console.log("좌표 길이는: "+exceptLast.length);
					for(var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							sectorSides.push([ j, j - 1, j + exceptLast.length]);
							sectorSides.push([ j + exceptLast.length, j - 1, j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						sectorVertice.push(vect);
					}
				}
			}
		}
	}
	console.log(sectorVertice);
	console.log(sectorFaces);
	console.log(sectorSides);
}