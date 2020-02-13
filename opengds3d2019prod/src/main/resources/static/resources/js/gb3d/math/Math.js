/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.Math)
	gb3d.Math = {};

/**
 * 같은 시작점을 가진 두 벡터가 평행한지 검사한다.
 * 
 * @method gb3d.Math.isParallel
 * @param {number[]} pointA - 점A
 * @param {number[]} pointB - 점B
 * @param {number[]} standard - 시작점
 * @return {boolean} 평행하면 True
 */
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

/**
 * 같은 시작점을 가진 두 벡터를 외적한다.
 * 
 * @method gb3d.Math.crossProductFromDegrees
 * @param {number[]} pointA - 점A
 * @param {number[]} pointB - 점B
 * @param {number[]} standard - 시작점
 * @return {Object} 외적 결과
 */
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

/**
 * Degree 좌표값으로부터 설정한 높이만큼의 3차원 객체 Vertex와 Face 값을 계산하여 반환한다.
 * 
 * @method gb3d.Math.getPolygonVertexAndFaceFromDegrees
 * @param {number[][]} arr - Polygon Feature의 좌표값
 * @param {number[]} center - 중점
 * @param {number} depth - 3차원 객체의 높이
 * @return {Object} 외적 결과
 */
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

	// console.log(coord);
	// 3차원 객체 밑면 vertex 계산
	for(var i = 0; i < coordLength; i++){
		if (i > 0) {
			var from = turf.point([coord[i-1][0], coord[i-1][1]]);
			var to = turf.point([coord[i][0], coord[i][1]]);
			// console.log(from);
			// console.log(to);
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
	// console.log("폴리곤 바닥면 삼각분할: ");
	// console.log(faceBottom);
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
	// console.log(faceBottom);

	// 3차원 객체 윗면 vertex 계산
	var cp;
	for(var i = 1; i < coordLength-1; i++){
		if(!gb3d.Math.isParallel(coord[i+1], coord[i-1], coord[i])){
			cp = gb3d.Math.crossProductFromDegrees(coord[i+1], coord[i-1], coord[i]);
			break;
		}
	}
	// console.log("좌표 길이는: "+coordLength);
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
 * 두 점을 중심선으로 하는 사각형을 반환한다.
 * 
 * @method gb3d.Math#getRectangleFromLine
 * @param {number[]} start - 시작점
 * @param {number[]} end - 끝점
 * @param {Number} radius - 반경
 * @return {Object} 사각형 정보
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
 * 부채꼴을 반환한다.
 * 
 * @param {number[][]} center - 중심좌표
 * @param {number} radius - 부채꼴의 반지름(meter)
 * @param {number} sangle - 부채꼴의 시작각
 * @param {number} eangle - 부채꼴의 끝각
 * @param {boolean} narrow - 좁은 각을 리턴할지
 * @return {Object} 부채꼴의 좌표
 */
gb3d.Math.getSector = function(center, radius, sangle, eangle, narrow){
	var centerturf = turf.point(center);
	// console.log("시작각은: "+sangle);
	// console.log("끝각은: "+eangle);
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
// sector.geometry.coordinates[0].splice(2, 1);
// }

// var from =
// turf.point(sector.geometry.coordinates[0][sector.geometry.coordinates[0].length-3]);
// var to =
// turf.point(sector.geometry.coordinates[0][sector.geometry.coordinates[0].length-2]);
// var distance = (turf.distance(from, to) * 100000);
	// 두 점의 거리가 5센티보다 작으면 같은 점으로 간주하고 하나 삭제
// if (distance < 5) {
// sector.geometry.coordinates[0].splice(sector.geometry.coordinates[0].length-3,
// 1);
// }

// var po = new ol.geom.LineString(sector.geometry.coordinates[0], "XY");
// var fe = new ol.Feature(po);
// sourceyj.addFeature(fe);
	return {
		"center" : center,
		"sindex" : !changed ? 1 : sector.geometry.coordinates[0].length-2,
				"eindex" : !changed ? sector.geometry.coordinates[0].length-2 : 1,
						"coordinates" : sector.geometry.coordinates[0].slice(0, sector.geometry.coordinates[0].length - 1),
						"coordinates2" : sector.geometry.coordinates[0],
						"changed" : changed 
	};
}

/**
 * LineString 좌표를 통해 3D Vertex와 Face를 만들어 주는 함수
 * 
 * @method gb3d.Math#getLineStringVertexAndFaceFromDegrees
 * @param {number[][]} arr - LineString 좌표
 * @param {Number} radius - 반경
 * @param {number[]} center - 객체의 중점
 * @param {Number} depth - 깊이 값
 * @return {Object} 3D 객체 정보
 */
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
			y: radius * 2
	},
	coordLength = coord.length - 1,
	cart,
	vect,
	centerCart = Cesium.Cartesian3.fromDegrees(center[0], center[1]),
	centerVec = new THREE.Vector3(centerCart.x, centerCart.y, centerCart.z),
	depth = depth;

	var extentSource = new ol.source.Vector();

	var sectorCoordStart;
	var sectorCoordEnd;

	var sectorVertice = [];
	var sectorFacesBottom = [];
	var sectorFacesTop = [];
	var sectorSides = [];

	var jointSectorVertice = [];
	var jointSectorFacesBottom = [];
	var jointSectorFacesTop = [];
	var jointSectorSides = [];

	var rectangleVertice = [];
	var rectangleFacesBottom = [];
	var rectangleFacesTop = [];
	var rectangleSides = [];

	var points2d = [];

	var sectorStartTopStart;
	var sectorStartTopEnd;
	var sectorStartBottomStart;
	var sectorStartBottomEnd;

	var sectorEndTopStart;
	var sectorEndTopEnd;
	var sectorEndBottomStart;
	var sectorEndBottomEnd;

	for(var i = 0; i < coordLength; i++){
		if (coordLength === 1 && i === 0) {
			var from = turf.point([coord[0][0], coord[0][1]]);
			var to = turf.point([coord[1][0], coord[1][1]]);
			var distance = turf.distance(from, to);
			distance = distance * 1000;
			max.x = distance; 
			break;
		} else if (i > 0) {
			var from = turf.point([coord[i-1][0], coord[i-1][1]]);
			var to = turf.point([coord[i][0], coord[i][1]]);
			// console.log(from);
			// console.log(to);
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
	}

	// 시작점을 뽑는다
	var start = coord[0];
	var startPoint = turf.point(start);
	var secondPoint = turf.point(coord[1]); 

	var startRect = gb3d.Math.getRectangleFromLine(coord[0], coord[1], radius);
	var se1 = gb3d.Math.getSector(start, radius, startRect["angle1"], startRect["angle2"], false);
	se1.coordinates[se1.sindex] = !se1.changed ? startRect["p1"] : startRect["p2"];
	se1.coordinates[se1.eindex] = !se1.changed ? startRect["p2"] : startRect["p1"];
	sectorCoordStart = se1.coordinates;
	var po = new ol.geom.Polygon([se1.coordinates], "XY");
	var fe = new ol.Feature(po);
	extentSource.addFeature(fe);

	// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
	var exceptLast = se1.coordinates;
	// 부채꼴 밑면 버텍스 및 페이스
	var vlength = sectorVertice.length;
	for (var i = 0; i < exceptLast.length; i++) {
		points2d.push([exceptLast[i][0], exceptLast[i][1]]);
		cart = Cesium.Cartesian3.fromDegrees(exceptLast[i][0], exceptLast[i][1]);
		vect = new THREE.Vector3(cart.x, cart.y, cart.z);
		vect.sub(centerVec);
		sectorVertice.push(vect);
		if (i !== 0 && i !== exceptLast.length - 1) {
			if (i === 1) {
				sectorStartBottomStart = sectorFacesBottom.length;
			}
			if (exceptLast[0] && exceptLast[i] && exceptLast[i+1]) {
				var face = [vlength + 0, vlength + i, vlength + i+1];
				sectorFacesBottom.push(face);			
			}
			if (i === exceptLast.length - 2) {
				sectorStartBottomEnd = sectorFacesBottom.length;
			}
		}
	}
	sectorStartTopStart = sectorStartBottomStart;
	sectorStartTopEnd = sectorStartBottomEnd;

	// 부채꼴 윗면 페이스
	var blength = exceptLast.length;
	var sectorTopFaces = JSON.parse(JSON.stringify(sectorFacesBottom));
	for (var k = 0; k < sectorTopFaces.length; k++) {
		sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
		sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
		sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
		sectorTopFaces[k].reverse();
	}
	sectorFacesTop = sectorFacesTop.concat(sectorTopFaces); 

	// 부채꼴 윗면 버텍스
	var cp;
	if (exceptLast.length < 3) {
		var exceptLast2 = outerSector.coordinates2;
		for(var i = 1; i < exceptLast2.length; i++){
			if(!gb3d.Math.isParallel(exceptLast2[i+1], exceptLast2[i-1], exceptLast2[i])){
				cp = gb3d.Math.crossProductFromDegrees(exceptLast2[i+1], exceptLast2[i-1], exceptLast2[i]);
				break;
			}
		}
	} else {
		for(var i = 1; i < exceptLast.length; i++){
			if(!gb3d.Math.isParallel(exceptLast[i+1], exceptLast[i-1], exceptLast[i])){
				cp = gb3d.Math.crossProductFromDegrees(exceptLast[i+1], exceptLast[i-1], exceptLast[i]);
				break;
			}
		}	
	}
	// console.log("좌표 길이는: "+exceptLast.length);

	for(var i = 0; i < exceptLast.length; i++){
		points2d.push([exceptLast[i][0], exceptLast[i][1]]);
		cart = Cesium.Cartesian3.fromDegrees(exceptLast[i][0], exceptLast[i][1]);
		// 부채꼴 옆면 페이스
		if(i > 1){
			sectorSides.push([ vlength + i, vlength + i - 1, vlength + i + exceptLast.length]);
			sectorSides.push([ vlength + i + exceptLast.length, vlength + i - 1, vlength + i - 1 + exceptLast.length ]);
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
	se2.coordinates[se2.sindex] = !se2.changed ? endRect["p4"] : endRect["p3"];
	se2.coordinates[se2.eindex] = !se2.changed ? endRect["p3"] : endRect["p4"];
	sectorCoordEnd = se2.coordinates;

	var po = new ol.geom.Polygon([se2.coordinates], "XY");
	var fe = new ol.Feature(po);
	extentSource.addFeature(fe);

	// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
	var exceptLast = se2.coordinates;
	var vlength = sectorVertice.length;
	var currentSectorFaces = [];
	for (var i = 0; i < exceptLast.length; i++) {
		points2d.push([exceptLast[i][0], exceptLast[i][1]]);
		cart = Cesium.Cartesian3.fromDegrees(exceptLast[i][0], exceptLast[i][1]);
		vect = new THREE.Vector3(cart.x, cart.y, cart.z);
		vect.sub(centerVec);
		sectorVertice.push(vect);
		if (i !== 0 && i !== exceptLast.length - 1) {
			if (i === 1) {
				sectorEndBottomStart = sectorFacesBottom.length;
			}
			if (exceptLast[0] && exceptLast[i] && exceptLast[i+1]) {
				var face = [vlength, vlength + i, vlength + i + 1];
				sectorFacesBottom.push(face);	
				currentSectorFaces.push(face);
			}	
			if (i === exceptLast.length - 2) {
				sectorEndBottomEnd = sectorFacesBottom.length;
			}
		}
	}
	sectorEndTopStart = sectorEndBottomStart;
	sectorEndTopEnd = sectorEndBottomEnd;
	// 부채꼴 윗면 페이스
	var blength = exceptLast.length;
	var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
	for (var k = 0; k < sectorTopFaces.length; k++) {
		sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
		sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
		sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
		sectorTopFaces[k].reverse();
	}
	sectorFacesTop = sectorFacesTop.concat(sectorTopFaces);
	// 부채꼴 윗면 버텍스
	var cp;
	if (exceptLast.length < 3) {
		var exceptLast2 = outerSector.coordinates2;
		for(var i = 1; i < exceptLast2.length; i++){
			if(!gb3d.Math.isParallel(exceptLast2[i+1], exceptLast2[i-1], exceptLast2[i])){
				cp = gb3d.Math.crossProductFromDegrees(exceptLast2[i+1], exceptLast2[i-1], exceptLast2[i]);
				break;
			}
		}
	} else {
		for(var i = 1; i < exceptLast.length; i++){
			if(!gb3d.Math.isParallel(exceptLast[i+1], exceptLast[i-1], exceptLast[i])){
				cp = gb3d.Math.crossProductFromDegrees(exceptLast[i+1], exceptLast[i-1], exceptLast[i]);
				break;
			}
		}	
	}
	// console.log("좌표 길이는: "+exceptLast.length);
	for(var i = 0; i < exceptLast.length; i++){
		points2d.push([exceptLast[i][0], exceptLast[i][1]]);
		cart = Cesium.Cartesian3.fromDegrees(exceptLast[i][0], exceptLast[i][1]);
		// 부채꼴 옆면 페이스
		if(i > 1){
			sectorSides.push([ vlength + i, vlength + i - 1, vlength + i + exceptLast.length]);
			sectorSides.push([ vlength + i + exceptLast.length, vlength + i - 1, vlength + i - 1 + exceptLast.length ]);
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
			// console.log("두 사각형이 평행임");
			startRect["p4"] = endRect["p2"];
			startRect["p3"] = endRect["p1"];

		} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
			// 13번 선만 겹침
			startRect["p3"] = intersects13.features[0]["geometry"]["coordinates"];

			var po1 = new ol.geom.Point(startRect["p3"], "XY");
			var fe1 = new ol.Feature(po1);
			extentSource.addFeature(fe1);

			endRect["p1"] = intersects13.features[0]["geometry"]["coordinates"];

			var po2 = new ol.geom.Point(endRect["p1"], "XY");
			var fe2 = new ol.Feature(po2);
			extentSource.addFeature(fe2);

			var outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], endRect["angle2"] );
			outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? startRect["p4"] : endRect["p2"];
			outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? endRect["p2"] : startRect["p4"];

			var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
			var fe = new ol.Feature(po);
			extentSource.addFeature(fe);

			// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
			var exceptLast = outerSector.coordinates;
// var vlength = sectorVertice.length;
			var vlength = jointSectorVertice.length;
			var currentSectorFaces = [];
			for (var j = 0; j < exceptLast.length; j++) {
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				jointSectorVertice.push(vect);
// sectorVertice.push(vect);
				if (j !== 0 && j !== exceptLast.length - 1) {
					if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
						var face = [vlength, vlength + j, vlength + j + 1];
// sectorFacesBottom.push(face);
						jointSectorFacesBottom.push(face);
						currentSectorFaces.push(face);
					}	
				}
			}
			// 부채꼴 윗면 페이스
			var blength = exceptLast.length;
			var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
			for (var k = 0; k < sectorTopFaces.length; k++) {
				sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
				sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
				sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
				sectorTopFaces[k].reverse();
			}
// sectorFacesTop = sectorFacesTop.concat(sectorTopFaces);
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
			jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
			// 3차원 객체 윗면 vertex 계산
			var cp;
			if (exceptLast.length < 3) {
				var exceptLast2 = outerSector.coordinates2;
				for(var j = 1; j < exceptLast2.length; j++){
					if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
						cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
						break;
					}
				}
			} else {
				for(var j = 1; j < exceptLast.length; j++){
					if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
						cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
						break;
					}
				}	
			}
			// console.log("좌표 길이는: "+exceptLast.length);
			for (var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				if(j > 1){
// sectorSides.push([ vlength + j, vlength + j - 1, vlength + j +
// exceptLast.length]);
// sectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength
// + j - 1 + exceptLast.length ]);
					jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
					jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
				}
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
// sectorVertice.push(vect);
				jointSectorVertice.push(vect);
			}
		} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
			// 24번 선만 겹침
			startRect["p4"] = intersects24.features[0]["geometry"]["coordinates"];

			var po1 = new ol.geom.Point(startRect["p4"], "XY");
			var fe1 = new ol.Feature(po1);
			extentSource.addFeature(fe1);

			endRect["p2"] = intersects24.features[0]["geometry"]["coordinates"];

			var po2 = new ol.geom.Point(endRect["p2"], "XY");
			var fe2 = new ol.Feature(po2);
			extentSource.addFeature(fe2);

			var outerSector = gb3d.Math.getSector(startRect["end"], radius, endRect["angle1"], startRect["angle3"] );
			outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? endRect["p1"] : startRect["p3"];
			outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? startRect["p3"] : endRect["p1"];

			var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
			var fe = new ol.Feature(po);
			extentSource.addFeature(fe);

			// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
			var exceptLast = outerSector.coordinates;
			var vlength = jointSectorVertice.length;
			var currentSectorFaces = [];
			for (var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				vect.sub(centerVec);
				jointSectorVertice.push(vect);
				if (j !== 0 && j !== exceptLast.length - 1) {
					if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
						var face = [vlength, vlength + j, vlength + j + 1];
						jointSectorFacesBottom.push(face);	
						currentSectorFaces.push(face);
					}	
				}
			}
			// 부채꼴 윗면 페이스
			var blength = exceptLast.length;
			var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
			for (var k = 0; k < sectorTopFaces.length; k++) {
				sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
				sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
				sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
				sectorTopFaces[k].reverse();
			}
// jointSectorFacesTop = jointSectorFacesBottom.concat(sectorTopFaces);
			jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
			// 3차원 객체 윗면 vertex 계산
			var cp;
			if (exceptLast.length < 3) {
				var exceptLast2 = outerSector.coordinates2;
				for(var j = 1; j < exceptLast2.length; j++){
					if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
						cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
						break;
					}
				}
			} else {
				for(var j = 1; j < exceptLast.length; j++){
					if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
						cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
						break;
					}
				}	
			}
			// console.log("좌표 길이는: "+exceptLast.length);
			for (var j = 0; j < exceptLast.length; j++){
				cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
				if(j > 1){
					jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
					jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
				}
				vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
				vect.sub(centerVec);
// sectorVertice.push(vect);
				jointSectorVertice.push(vect);
			}
		} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
			// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
			startRect["p4"] = endRect["p2"];
			startRect["p3"] = endRect["p1"];
		}
		// 반시계로 넣음 1-3-4-2
		var rectOrder = [startRect["p1"], startRect["p3"], startRect["end"], startRect["p4"], startRect["p2"], startRect["start"]];
		// 사각형 밑면 버텍스
		var rvlength = rectangleVertice.length;
		for (var j = 0; j < rectOrder.length; j++) {
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
			vect = new THREE.Vector3(cart.x, cart.y, cart.z);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}
		// 사각형 밑면 페이스
		var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
		var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
		var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
		var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
		rectangleFacesBottom.push(rface1);
		rectangleFacesBottom.push(rface2);
		rectangleFacesBottom.push(rface3);
		rectangleFacesBottom.push(rface4);
		var currentRectangleTopFaces = [];
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
		// 사각형 윗면 페이스
		var rolength = rectOrder.length;
		for (var j = 0; j < currentRectangleTopFaces.length; j++) {
			currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
			currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
			currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
			currentRectangleTopFaces[j].reverse();
		}
		var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
		rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);

		// 사각형 벡터 계산
		var cp;
		for(var i = 1; i < rectOrder.length -1; i++){
			if(!gb3d.Math.isParallel(rectOrder[i+1], rectOrder[i-1], rectOrder[i])){
				cp = gb3d.Math.crossProductFromDegrees(rectOrder[i+1], rectOrder[i-1], rectOrder[i]);
				break;
			}
		}
		// console.log("좌표 길이는: "+rectOrder.length);
		// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
		for(var i = 0; i < rectOrder.length; i++){
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[i][0], rectOrder[i][1]);
			// 보여야 할 사각형 옆면 페이스
			if (i === 0) {
				rectangleSides.push([ rvlength + i + 1, rvlength + 1 + rectOrder.length, rvlength + i ]);
				rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + i ]);	
			} else if (i === 3) {
				rectangleSides.push([ rvlength + i + 1, rvlength + (2 * rectOrder.length - 2), rvlength + i ]);
				rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + i + rectOrder.length, rvlength + i ]);
			}

			vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}

		// 사각형 밑면 좌표
		var rectOrder = [endRect["p1"], endRect["p3"], endRect["end"], endRect["p4"], endRect["p2"], endRect["start"]];
		var rvlength = rectangleVertice.length;
		// 사각형 밑면 버텍스
		for (var j = 0; j < rectOrder.length; j++) {
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
			vect = new THREE.Vector3(cart.x, cart.y, cart.z);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}
		// 사각형 밑면 페이스
		var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
		var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
		var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
		var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
		rectangleFacesBottom.push(rface1);
		rectangleFacesBottom.push(rface2);
		rectangleFacesBottom.push(rface3);
		rectangleFacesBottom.push(rface4);
		var currentRectangleTopFaces = [];
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
		// 사각형 윗면 페이스
		var rolength = rectOrder.length;
		for (var j = 0; j < currentRectangleTopFaces.length; j++) {
			currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
			currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
			currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
			currentRectangleTopFaces[j].reverse();
		}
		var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
		rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);

		// 사각형 벡터 계산
		var cp;
		for(var i = 1; i < rectOrder.length -1; i++){
			if(!gb3d.Math.isParallel(rectOrder[i+1], rectOrder[i-1], rectOrder[i])){
				cp = gb3d.Math.crossProductFromDegrees(rectOrder[i+1], rectOrder[i-1], rectOrder[i]);
				break;
			}
		}
		// console.log("좌표 길이는: "+rectOrder.length);
		// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
		for(var i = 0; i < rectOrder.length; i++){
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[i][0], rectOrder[i][1]);
			// 보여야 할 사각형 옆면 페이스
			if (i === 0) {
				rectangleSides.push([ rvlength + i + 1, rvlength + 1 + rectOrder.length, rvlength + i ]);
				rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + i ]);	
			} else if (i === 3) {
				rectangleSides.push([ rvlength + i + 1, rvlength + (2 * rectOrder.length - 2), rvlength + i ]);
				rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + i + rectOrder.length, rvlength + i ]);
			}

			vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}

	} else if (coord.length === 2) {
		// 반시계로 넣음 1-3-4-2
		var rectOrder = [startRect["p1"], startRect["p3"], startRect["end"], startRect["p4"], startRect["p2"], startRect["start"]];
		// 사각형 밑면 버텍스
		var rvlength = rectangleVertice.length;
		for (var j = 0; j < rectOrder.length; j++) {
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
			vect = new THREE.Vector3(cart.x, cart.y, cart.z);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}
		// 사각형 밑면 페이스
		var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
		var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
		var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
		var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
		rectangleFacesBottom.push(rface1);
		rectangleFacesBottom.push(rface2);
		rectangleFacesBottom.push(rface3);
		rectangleFacesBottom.push(rface4);
		var currentRectangleTopFaces = [];
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
		currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
		// 사각형 윗면 페이스
		var rolength = rectOrder.length;
		for (var j = 0; j < currentRectangleTopFaces.length; j++) {
			currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
			currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
			currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
			currentRectangleTopFaces[j].reverse();
		}
		var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
		rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);

		// 사각형 벡터 계산
		var cp;
		for(var i = 1; i < rectOrder.length -1; i++){
			if(!gb3d.Math.isParallel(rectOrder[i+1], rectOrder[i-1], rectOrder[i])){
				cp = gb3d.Math.crossProductFromDegrees(rectOrder[i+1], rectOrder[i-1], rectOrder[i]);
				break;
			}
		}
		// console.log("좌표 길이는: "+rectOrder.length);
		// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
		for(var i = 0; i < rectOrder.length; i++){
			cart = Cesium.Cartesian3.fromDegrees(rectOrder[i][0], rectOrder[i][1]);
			// 보여야 할 사각형 옆면 페이스
			if (i === 0) {
				rectangleSides.push([ rvlength + i + 1, rvlength + 1 + rectOrder.length, rvlength + i ]);
				rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + i ]);	
			} else if (i === 3) {
				rectangleSides.push([ rvlength + i + 1, rvlength + (2 * rectOrder.length - 2), rvlength + i ]);
				rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + i + rectOrder.length, rvlength + i ]);
			}

			vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
			vect.sub(centerVec);
			rectangleVertice.push(vect);
		}
	} else if (coord.length < 2) {
		console.error("need over 1 points");
		return;
	}
	// 안쪽으로 꺾인 라인의 교차점 찾기
	// 사각형들을 잇는 부채꼴을 그리기
	// console.log("중간선들의 개수는: "+midRects.length);
	// 중간 사각형이 1개 이상 있음
	if (midRects.length > 0) {
		for (var i = 0; i < midRects.length; i++) {
			// 현재 사각형의 13선 24선 교차점
			var cmid13;
			var cmid24;
			// 다음 사각형의 13선 24선 교차점
			var nmid13;
			var nmid24;
			// 중간 사각형중에 첫번째
			if (i === 0) {
				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				// 시작 사각형과의 교차점을 찾기
				var intersects13 = turf.lineIntersect(start13, cmid13);
				var intersects24 = turf.lineIntersect(start24, cmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					// console.log("두 사각형이 평행임");
					startRect["p4"] = midRects[i]["p2"];
					startRect["p3"] = midRects[i]["p1"];
				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					startRect["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(startRect["p3"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p1"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					// 부채꼴 함수 종종 오류나서 좌표가 유실되기 때문에 좌표를 사각형의 꼭지점으로 대체해줌
					var outerSector = gb3d.Math.getSector(startRect["end"], radius, startRect["angle4"], midRects[i]["angle2"] );
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? startRect["p4"] :  midRects[i]["p2"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ?  midRects[i]["p2"] : startRect["p4"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);	
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					startRect["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(startRect["p4"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p2"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					var outerSector = gb3d.Math.getSector(startRect["end"], radius, midRects[i]["angle1"], startRect["angle3"] );
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i]["p1"] :  startRect["p3"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ?  startRect["p3"] : midRects[i]["p1"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);		
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					startRect["p4"] = midRects[i]["p2"];
					startRect["p3"] = midRects[i]["p1"];
				}

				// 사각형 밑면 좌표
				var rectOrder = [startRect["p1"], startRect["p3"], startRect["end"], startRect["p4"], startRect["p2"], startRect["start"]];
				// 사각형 밑면 버텍스
				var rvlength = rectangleVertice.length;
				for (var j = 0; j < rectOrder.length; j++) {
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					vect = new THREE.Vector3(cart.x, cart.y, cart.z);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				// 사각형 밑면 페이스
				var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
				var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
				var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
				var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
				rectangleFacesBottom.push(rface1);
				rectangleFacesBottom.push(rface2);
				rectangleFacesBottom.push(rface3);
				rectangleFacesBottom.push(rface4);
				var currentRectangleTopFaces = [];
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
				// 사각형 윗면 페이스
				var rolength = rectOrder.length;
				for (var j = 0; j < currentRectangleTopFaces.length; j++) {
					currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
					currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
					currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
					currentRectangleTopFaces[j].reverse();
				}
				var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
				rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);
				// 사각형 벡터 계산
				var cp;
				for (var j = 1; j < rectOrder.length -1; j++){
					if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){
						cp = gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
						break;
					}
				}
				// console.log("좌표 길이는: "+rectOrder.length);
				// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
				for(var j = 0; j < rectOrder.length; j++){
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					// 보여야 할 사각형 옆면 페이스
					if (j === 0) {
						rectangleSides.push([ rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
						rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + j ]);	
					} else if (j === 3) {
						rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length - 2), rvlength + j ]);
						rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + j + rectOrder.length, rvlength + j ]);
					}

					vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				// 시작 사각형 완료

				// 다음 사각형이 있으면
				if (midRects.length > 1) {
					nmid13 = turf.lineString([midRects[i+1]["p1"], midRects[i+1]["p3"]]);
					nmid24 = turf.lineString([midRects[i+1]["p2"], midRects[i+1]["p4"]]);
					// 다음 사각형과의 교차점을 찾기
					var intersects13 = turf.lineIntersect(cmid13, nmid13);
					var intersects24 = turf.lineIntersect(cmid24, nmid24);

					if (intersects13.features.length > 0 && intersects24.features.length > 0) {
						// 두 사각형이 평행임
						// console.log("두 사각형이 평행임");
						midRects[i]["p4"] = midRects[i+1]["p2"];
						midRects[i]["p3"] = midRects[i+1]["p1"];
					} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
						// 13번 선만 겹침
						midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

						var po1 = new ol.geom.Point(midRects[i]["p3"], "XY");
						var fe1 = new ol.Feature(po1);
						extentSource.addFeature(fe1);

						midRects[i+1]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

						var po2 = new ol.geom.Point(midRects[i+1]["p1"], "XY");
						var fe2 = new ol.Feature(po2);
						extentSource.addFeature(fe2);

						var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"] );
						outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i]["p4"] :  midRects[i+1]["p2"];
						outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? midRects[i+1]["p2"] : midRects[i]["p4"];
						var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
						var fe = new ol.Feature(po);
						extentSource.addFeature(fe);
						// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
						var exceptLast = outerSector.coordinates;
						var vlength = jointSectorVertice.length;
						var currentSectorFaces = [];
						for (var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							vect = new THREE.Vector3(cart.x, cart.y, cart.z);
							vect.sub(centerVec);
							jointSectorVertice.push(vect);
							if (j !== 0 && j !== exceptLast.length - 1) {
								if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
									var face = [vlength, vlength + j, vlength + j + 1];
									jointSectorFacesBottom.push(face);			
									currentSectorFaces.push(face);
								}	
							}
						}
						// 부채꼴 윗면 페이스
						var blength = exceptLast.length;
						var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
						for (var k = 0; k < sectorTopFaces.length; k++) {
							sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
							sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
							sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
							sectorTopFaces[k].reverse();
						}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
						jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
						// 3차원 객체 윗면 vertex 계산
						var cp;
						if (exceptLast.length < 3) {
							var exceptLast2 = outerSector.coordinates2;
							for(var j = 1; j < exceptLast2.length; j++){
								if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
									cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
									break;
								}
							}
						} else {
							for(var j = 1; j < exceptLast.length; j++){
								if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
									cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
									break;
								}
							}	
						}
						// console.log("좌표 길이는: "+exceptLast.length);
						for (var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							if(j > 1){
								jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
								jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
							}
							vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
							vect.sub(centerVec);
							jointSectorVertice.push(vect);
						}
					} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
						// 24번 선만 겹침
						midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

						var po1 = new ol.geom.Point(midRects[i]["p4"], "XY");
						var fe1 = new ol.Feature(po1);
						extentSource.addFeature(fe1);

						midRects[i+1]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

						var po2 = new ol.geom.Point(midRects[i+1]["p2"], "XY");
						var fe2 = new ol.Feature(po2);
						extentSource.addFeature(fe2);

						var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"] );
						outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i+1]["p1"] :  midRects[i]["p3"];
						outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? midRects[i]["p3"] : midRects[i+1]["p1"];
						var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
						var fe = new ol.Feature(po);
						extentSource.addFeature(fe);

						// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
						var exceptLast = outerSector.coordinates;
						var vlength = jointSectorVertice.length;
						var currentSectorFaces = [];
						for (var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							vect = new THREE.Vector3(cart.x, cart.y, cart.z);
							vect.sub(centerVec);
							jointSectorVertice.push(vect);
							if (j !== 0 && j !== exceptLast.length - 1) {
								if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
									var face = [vlength, vlength + j, vlength + j + 1];
									jointSectorFacesBottom.push(face);			
									currentSectorFaces.push(face);
								}	
							}
						}
						// 부채꼴 윗면 페이스
						var blength = exceptLast.length;
						var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
						for (var k = 0; k < sectorTopFaces.length; k++) {
							sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
							sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
							sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
							sectorTopFaces[k].reverse();
						}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
						jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
						// 3차원 객체 윗면 vertex 계산
						var cp;
						if (exceptLast.length < 3) {
							var exceptLast2 = outerSector.coordinates2;
							for(var j = 1; j < exceptLast2.length; j++){
								if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
									cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
									break;
								}
							}
						} else {
							for(var j = 1; j < exceptLast.length; j++){
								if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
									cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
									break;
								}
							}	
						}
						// console.log("좌표 길이는: "+exceptLast.length);
						for (var j = 0; j < exceptLast.length; j++){
							cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
							if(j > 1){
								jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
								jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
							}
							vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
							vect.sub(centerVec);
							jointSectorVertice.push(vect);
						}
					} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
						// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
						midRects[i]["p4"] = midRects[i+1]["p2"];
						midRects[i]["p3"] = midRects[i+1]["p1"];
					}
					// 사각형 밑면 좌표
					var rectOrder = [midRects[i]["p1"], midRects[i]["p3"], midRects[i]["end"], midRects[i]["p4"], midRects[i]["p2"], midRects[i]["start"]];
					var rvlength = rectangleVertice.length;
					// 사각형 밑면 버텍스
					for (var j = 0; j < rectOrder.length; j++) {
						cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						rectangleVertice.push(vect);
					}
					// 사각형 밑면 페이스
					var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
					var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
					var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
					var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
					rectangleFacesBottom.push(rface1);
					rectangleFacesBottom.push(rface2);
					rectangleFacesBottom.push(rface3);
					rectangleFacesBottom.push(rface4);
					var currentRectangleTopFaces = [];
					currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
					currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
					currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
					currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
					// 사각형 윗면 페이스
					var rolength = rectOrder.length;
					for (var j = 0; j < currentRectangleTopFaces.length; j++) {
						currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
						currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
						currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
						currentRectangleTopFaces[j].reverse();
					}
					var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
					rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);
					// 사각형 벡터 계산
					var cp;
					for (var j = 1; j < rectOrder.length -1; j++){
						if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){
							cp = gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
							break;
						}
					}
					// console.log("좌표 길이는: "+rectOrder.length);
					// 사각형 윗면 버텍스
					for(var j = 0; j < rectOrder.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
						// 보여야 할 사각형 옆면 페이스
						if (j === 0) {
							rectangleSides.push([ rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
							rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + j ]);	
						} else if (j === 3) {
							rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length - 2), rvlength + j ]);
							rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + j + rectOrder.length, rvlength + j ]);
						}

						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						rectangleVertice.push(vect);
					}
					/*
					 * // 사각형 밑면 좌표 var rectOrder = [midRects[i+1]["p1"], midRects[i+1]["p3"],
					 * midRects[i+1]["end"], midRects[i+1]["p4"], midRects[i+1]["p2"],
					 * midRects[i+1]["start"]]; var rvlength = rectangleVertice.length; // 사각형 밑면
					 * 버텍스 for (var j = 0; j < rectOrder.length; j++) { cart =
					 * Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]); vect = new
					 * THREE.Vector3(cart.x, cart.y, cart.z); vect.sub(centerVec);
					 * rectangleVertice.push(vect); } // 사각형 밑면 페이스 var rface1 = [rvlength + 4,
					 * rvlength + 3, rvlength + 5]; var rface2 = [rvlength + 3, rvlength + 2,
					 * rvlength + 5]; var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0]; var
					 * rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
					 * rectangleFacesBottom.push(rface1); rectangleFacesBottom.push(rface2);
					 * rectangleFacesBottom.push(rface3); rectangleFacesBottom.push(rface4); var
					 * currentRectangleTopFaces = [];
					 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
					 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
					 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
					 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4))); // 사각형 윗면
					 * 페이스 var rolength = rectOrder.length; for (var j = 0; j <
					 * currentRectangleTopFaces.length; j++) { currentRectangleTopFaces[j][0] =
					 * currentRectangleTopFaces[j][0] + rolength; currentRectangleTopFaces[j][1] =
					 * currentRectangleTopFaces[j][1] + rolength; currentRectangleTopFaces[j][2] =
					 * currentRectangleTopFaces[j][2] + rolength;
					 * currentRectangleTopFaces[j].reverse(); } var rectangleTopFaces =
					 * JSON.parse(JSON.stringify(currentRectangleTopFaces)); rectangleFacesTop =
					 * rectangleFacesTop.concat(rectangleTopFaces); // 사각형 벡터 계산 var cp; for (var j =
					 * 1; j < rectOrder.length -1; j++){ if(!gb3d.Math.isParallel(rectOrder[j+1],
					 * rectOrder[j-1], rectOrder[j])){ cp =
					 * gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1],
					 * rectOrder[j]); break; } } console.log("좌표 길이는: "+rectOrder.length); // 사각형 윗면
					 * 버텍스 // rvlength = rectangleVertice.length; for(var j = 0; j <
					 * rectOrder.length; j++){ cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0],
					 * rectOrder[j][1]); // 보여야 할 사각형 옆면 페이스 if (j === 0) { rectangleSides.push([
					 * rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
					 * rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength +
					 * rectOrder.length, rvlength + j ]); } else if (j === 3) {
					 * rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length -
					 * 2), rvlength + j ]); rectangleSides.push([ rvlength + (2 * rectOrder.length -
					 * 2), rvlength + j + rectOrder.length, rvlength + j ]); }
					 * 
					 * vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y +
					 * (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth); vect.sub(centerVec);
					 * rectangleVertice.push(vect); }
					 */
				}
			}  
			if (i > 0 && i < midRects.length - 1 && midRects.length > 1) {

				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				nmid13 = turf.lineString([midRects[i+1]["p1"], midRects[i+1]["p3"]]);
				nmid24 = turf.lineString([midRects[i+1]["p2"], midRects[i+1]["p4"]]);
				var intersects13 = turf.lineIntersect(cmid13, nmid13);
				var intersects24 = turf.lineIntersect(cmid24, nmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					console.log("두 사각형이 평행임");
					midRects[i]["p4"] = midRects[i+1]["p2"];
					midRects[i]["p3"] = midRects[i+1]["p1"];
				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(midRects[i]["p3"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i+1]["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i+1]["p1"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i]["angle4"], midRects[i+1]["angle2"] );
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i]["p4"] :midRects[i+1]["p2"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? midRects[i+1]["p2"] : midRects[i]["p4"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);			
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(midRects[i]["p4"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i+1]["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i+1]["p2"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					var outerSector = gb3d.Math.getSector(midRects[i]["end"], radius, midRects[i+1]["angle1"], midRects[i]["angle3"] );
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i+1]["p1"] :midRects[i]["p3"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? midRects[i]["p3"] : midRects[i+1]["p1"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);			
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					midRects[i]["p4"] = midRects[i+1]["p2"];
					midRects[i]["p3"] = midRects[i+1]["p1"];
				}
				// 사각형 밑면 좌표
				var rectOrder = [midRects[i]["p1"], midRects[i]["p3"], midRects[i]["end"], midRects[i]["p4"], midRects[i]["p2"], midRects[i]["start"]];

				var rvlength = rectangleVertice.length;
				// 사각형 밑면 버텍스
				for (var j = 0; j < rectOrder.length; j++) {
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					vect = new THREE.Vector3(cart.x, cart.y, cart.z);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				// 사각형 밑면 페이스
				var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
				var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
				var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
				var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
				rectangleFacesBottom.push(rface1);
				rectangleFacesBottom.push(rface2);
				rectangleFacesBottom.push(rface3);
				rectangleFacesBottom.push(rface4);
				var currentRectangleTopFaces = [];
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
				// 사각형 윗면 페이스
				var rolength = rectOrder.length;
				for (var j = 0; j < currentRectangleTopFaces.length; j++) {
					currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
					currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
					currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
					currentRectangleTopFaces[j].reverse();
				}
				var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
				rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);
				// 사각형 벡터 계산
				var cp;
				for (var j = 1; j < rectOrder.length -1; j++){
					if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){
						cp = gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
						break;
					}
				}
				// console.log("좌표 길이는: "+rectOrder.length);
				// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
				for(var j = 0; j < rectOrder.length; j++){
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					// 보여야 할 사각형 옆면 페이스
					if (j === 0) {
						rectangleSides.push([ rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
						rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + j ]);	
					} else if (j === 3) {
						rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length - 2), rvlength + j ]);
						rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + j + rectOrder.length, rvlength + j ]);
					}

					vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				/*
				 * if (i+1 !== midRects.length -1) { // 사각형 밑면 좌표 var rectOrder =
				 * [midRects[i+1]["p1"], midRects[i+1]["p3"], midRects[i+1]["end"],
				 * midRects[i+1]["p4"], midRects[i+1]["p2"], midRects[i+1]["start"]];
				 * 
				 * var rvlength = rectangleVertice.length; // 사각형 밑면 버텍스 for (var j = 0; j <
				 * rectOrder.length; j++) { cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0],
				 * rectOrder[j][1]); vect = new THREE.Vector3(cart.x, cart.y, cart.z);
				 * vect.sub(centerVec); rectangleVertice.push(vect); } // 사각형 밑면 페이스 var rface1 =
				 * [rvlength + 4, rvlength + 3, rvlength + 5]; var rface2 = [rvlength + 3, rvlength +
				 * 2, rvlength + 5]; var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0]; var
				 * rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
				 * rectangleFacesBottom.push(rface1); rectangleFacesBottom.push(rface2);
				 * rectangleFacesBottom.push(rface3); rectangleFacesBottom.push(rface4); var
				 * currentRectangleTopFaces = [];
				 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
				 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
				 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
				 * currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4))); // 사각형 윗면 페이스
				 * var rolength = rectOrder.length; for (var j = 0; j <
				 * currentRectangleTopFaces.length; j++) { currentRectangleTopFaces[j][0] =
				 * currentRectangleTopFaces[j][0] + rolength; currentRectangleTopFaces[j][1] =
				 * currentRectangleTopFaces[j][1] + rolength; currentRectangleTopFaces[j][2] =
				 * currentRectangleTopFaces[j][2] + rolength; currentRectangleTopFaces[j].reverse(); }
				 * var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
				 * rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces); // 사각형 벡터 계산 var
				 * cp; for (var j = 1; j < rectOrder.length -1; j++){
				 * if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){ cp =
				 * gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
				 * break; } } console.log("좌표 길이는: "+rectOrder.length); // 사각형 윗면 버텍스 // rvlength =
				 * rectangleVertice.length; for(var j = 0; j < rectOrder.length; j++){ cart =
				 * Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]); // 보여야 할 사각형 옆면
				 * 페이스 if (j === 0) { rectangleSides.push([ rvlength + j + 1, rvlength + 1 +
				 * rectOrder.length, rvlength + j ]); rectangleSides.push([ rvlength + 1 +
				 * rectOrder.length, rvlength + rectOrder.length, rvlength + j ]); } else if (j ===
				 * 3) { rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length -
				 * 2), rvlength + j ]); rectangleSides.push([ rvlength + (2 * rectOrder.length - 2),
				 * rvlength + j + rectOrder.length, rvlength + j ]); }
				 * 
				 * vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth,
				 * cart.z + (cp.w/cp.s)*depth); vect.sub(centerVec); rectangleVertice.push(vect); } }
				 */
			}
			// 중간 사각형 중에 마지막
			if (i === midRects.length - 1) {
				cmid13 = turf.lineString([midRects[i]["p1"], midRects[i]["p3"]]);
				cmid24 = turf.lineString([midRects[i]["p2"], midRects[i]["p4"]]);
				var intersects13 = turf.lineIntersect(end13, cmid13);
				var intersects24 = turf.lineIntersect(end24, cmid24);

				if (intersects13.features.length > 0 && intersects24.features.length > 0) {
					// 두 사각형이 평행임
					console.log("두 사각형이 평행임");
					midRects[i]["p4"] = endRect["p2"];
					midRects[i]["p3"] = endRect["p1"];

				} else if (intersects13.features.length > 0 && intersects24.features.length === 0) {
					// 13번 선만 겹침
					endRect["p1"] = intersects13.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(endRect["p1"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i]["p3"] = intersects13.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p3"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					var outerSector = gb3d.Math.getSector(endRect["start"], radius, midRects[i]["angle4"], endRect["angle2"]);
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? midRects[i]["p4"] : endRect["p2"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? endRect["p2"] : midRects[i]["p4"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);		
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length > 0) {
					// 24번 선만 겹침
					endRect["p2"] = intersects24.features[0]["geometry"]["coordinates"];

					var po1 = new ol.geom.Point(endRect["p2"], "XY");
					var fe1 = new ol.Feature(po1);
					extentSource.addFeature(fe1);

					midRects[i]["p4"] = intersects24.features[0]["geometry"]["coordinates"];

					var po2 = new ol.geom.Point(midRects[i]["p4"], "XY");
					var fe2 = new ol.Feature(po2);
					extentSource.addFeature(fe2);

					var outerSector = gb3d.Math.getSector(endRect["start"], radius, endRect["angle1"], midRects[i]["angle3"]);
					outerSector.coordinates[outerSector.sindex] = !outerSector.changed ? endRect["p1"] :midRects[i]["p3"];
					outerSector.coordinates[outerSector.eindex] = !outerSector.changed ? midRects[i]["p3"] : endRect["p1"];
					var po = new ol.geom.Polygon([outerSector.coordinates], "XY");
					var fe = new ol.Feature(po);
					extentSource.addFeature(fe);

					// 부채꼴 폴리곤의 끝점을 빼고 좌표를 뽑아 저장한다
					var exceptLast = outerSector.coordinates;
					var vlength = jointSectorVertice.length;
					var currentSectorFaces = [];
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						vect = new THREE.Vector3(cart.x, cart.y, cart.z);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
						if (j !== 0 && j !== exceptLast.length - 1) {
							if (exceptLast[0] && exceptLast[j] && exceptLast[j+1]) {
								var face = [vlength, vlength + j, vlength + j + 1];
								jointSectorFacesBottom.push(face);		
								currentSectorFaces.push(face);
							}	
						}
					}
					// 부채꼴 윗면 페이스
					var blength = exceptLast.length;
					var sectorTopFaces = JSON.parse(JSON.stringify(currentSectorFaces));   
					for (var k = 0; k < sectorTopFaces.length; k++) {
						sectorTopFaces[k][0] = sectorTopFaces[k][0] +  blength;
						sectorTopFaces[k][1] = sectorTopFaces[k][1] +  blength;
						sectorTopFaces[k][2] = sectorTopFaces[k][2] +  blength;
						sectorTopFaces[k].reverse();
					}
// jointSectorFacesBottom = jointSectorFacesTop.concat(sectorTopFaces);
					jointSectorFacesTop = jointSectorFacesTop.concat(sectorTopFaces);
					// 3차원 객체 윗면 vertex 계산
					var cp;
					if (exceptLast.length < 3) {
						var exceptLast2 = outerSector.coordinates2;
						for(var j = 1; j < exceptLast2.length; j++){
							if(!gb3d.Math.isParallel(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast2[j+1], exceptLast2[j-1], exceptLast2[j]);
								break;
							}
						}
					} else {
						for(var j = 1; j < exceptLast.length; j++){
							if(!gb3d.Math.isParallel(exceptLast[j+1], exceptLast[j-1], exceptLast[j])){
								cp = gb3d.Math.crossProductFromDegrees(exceptLast[j+1], exceptLast[j-1], exceptLast[j]);
								break;
							}
						}	
					}
					// console.log("좌표 길이는: "+exceptLast.length);
					for (var j = 0; j < exceptLast.length; j++){
						cart = Cesium.Cartesian3.fromDegrees(exceptLast[j][0], exceptLast[j][1]);
						if(j > 1){
							jointSectorSides.push([ vlength + j, vlength + j - 1, vlength + j + exceptLast.length]);
							jointSectorSides.push([ vlength + j + exceptLast.length, vlength + j - 1, vlength + j - 1 + exceptLast.length ]);
						}
						vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
						vect.sub(centerVec);
						jointSectorVertice.push(vect);
					}
				} else if (intersects13.features.length === 0 && intersects24.features.length === 0) {
					// 너무 많이 꺾여서 겹쳐야 되는 두선이 거의 평행한데다가 짧아서 교차하지 않음
					midRects[i]["p4"] = endRect["p2"];
					midRects[i]["p3"] = endRect["p1"];
				}

				// 사각형 밑면 좌표
				var rectOrder = [midRects[i]["p1"], midRects[i]["p3"], midRects[i]["end"], midRects[i]["p4"], midRects[i]["p2"], midRects[i]["start"]];
				var rvlength = rectangleVertice.length;
				// 사각형 밑면 버텍스
				for (var j = 0; j < rectOrder.length; j++) {
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					vect = new THREE.Vector3(cart.x, cart.y, cart.z);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				// 사각형 밑면 페이스
				var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
				var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
				var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
				var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
				rectangleFacesBottom.push(rface1);
				rectangleFacesBottom.push(rface2);
				rectangleFacesBottom.push(rface3);
				rectangleFacesBottom.push(rface4);
				var currentRectangleTopFaces = [];
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
				// 사각형 윗면 페이스
				var rolength = rectOrder.length;
				for (var j = 0; j < currentRectangleTopFaces.length; j++) {
					currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
					currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
					currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
					currentRectangleTopFaces[j].reverse();
				}
				var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
				rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);
				// 사각형 벡터 계산
				var cp;
				for (var j = 1; j < rectOrder.length -1; j++){
					if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){
						cp = gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
						break;
					}
				}
				// console.log("좌표 길이는: "+rectOrder.length);
				// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
				for(var j = 0; j < rectOrder.length; j++){
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					// 보여야 할 사각형 옆면 페이스
					if (j === 0) {
						rectangleSides.push([ rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
						rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + j ]);	
					} else if (j === 3) {
						rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length - 2), rvlength + j ]);
						rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + j + rectOrder.length, rvlength + j ]);
					}

					vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}

				// 사각형 밑면 좌표
				var rectOrder = [endRect["p1"], endRect["p3"], endRect["end"], endRect["p4"], endRect["p2"], endRect["start"]];
				var rvlength = rectangleVertice.length;
				// 사각형 밑면 버텍스
				for (var j = 0; j < rectOrder.length; j++) {
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					vect = new THREE.Vector3(cart.x, cart.y, cart.z);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
				// 사각형 밑면 페이스
				var rface1 = [rvlength + 4, rvlength + 3, rvlength + 5];
				var rface2 = [rvlength + 3, rvlength + 2, rvlength + 5];
				var rface3 = [rvlength + 5, rvlength + 2, rvlength + 0];
				var rface4 = [rvlength + 2, rvlength + 1, rvlength + 0];
				rectangleFacesBottom.push(rface1);
				rectangleFacesBottom.push(rface2);
				rectangleFacesBottom.push(rface3);
				rectangleFacesBottom.push(rface4);
				var currentRectangleTopFaces = [];
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface1)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface2)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface3)));
				currentRectangleTopFaces.push(JSON.parse(JSON.stringify(rface4)));
				// 사각형 윗면 페이스
				var rolength = rectOrder.length;
				for (var j = 0; j < currentRectangleTopFaces.length; j++) {
					currentRectangleTopFaces[j][0] = currentRectangleTopFaces[j][0] + rolength;
					currentRectangleTopFaces[j][1] = currentRectangleTopFaces[j][1] + rolength;
					currentRectangleTopFaces[j][2] = currentRectangleTopFaces[j][2] + rolength;
					currentRectangleTopFaces[j].reverse();
				}
				var rectangleTopFaces = JSON.parse(JSON.stringify(currentRectangleTopFaces));
				rectangleFacesTop = rectangleFacesTop.concat(rectangleTopFaces);
				// 사각형 벡터 계산
				var cp;
				for (var j = 1; j < rectOrder.length -1; j++){
					if(!gb3d.Math.isParallel(rectOrder[j+1], rectOrder[j-1], rectOrder[j])){
						cp = gb3d.Math.crossProductFromDegrees(rectOrder[j+1], rectOrder[j-1], rectOrder[j]);
						break;
					}
				}
				// console.log("좌표 길이는: "+rectOrder.length);
				// 사각형 윗면 버텍스
// rvlength = rectangleVertice.length;
				for(var j = 0; j < rectOrder.length; j++){
					cart = Cesium.Cartesian3.fromDegrees(rectOrder[j][0], rectOrder[j][1]);
					// 보여야 할 사각형 옆면 페이스
					if (j === 0) {
						rectangleSides.push([ rvlength + j + 1, rvlength + 1 + rectOrder.length, rvlength + j ]);
						rectangleSides.push([ rvlength + 1 + rectOrder.length, rvlength + rectOrder.length, rvlength + j ]);	
					} else if (j === 3) {
						rectangleSides.push([ rvlength + j + 1, rvlength + (2 * rectOrder.length - 2), rvlength + j ]);
						rectangleSides.push([ rvlength + (2 * rectOrder.length - 2), rvlength + j + rectOrder.length, rvlength + j ]);
					}

					vect = new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth);
					vect.sub(centerVec);
					rectangleVertice.push(vect);
				}
			}

		}
	}
	// console.log(sectorVertice);
	// console.log(sectorFacesBottom);
	// console.log(sectorFacesTop);
	// console.log(sectorSides);

	// console.log(jointSectorVertice);
	// console.log(jointSectorFacesBottom);
	// console.log(jointSectorFacesTop);
	// console.log(jointSectorSides);

	// console.log(rectangleVertice);
	// console.log(rectangleFacesBottom);
	// console.log(rectangleFacesTop);
	// console.log(rectangleSides);

	for (var i = 0; i < jointSectorFacesBottom.length; i++) {
		jointSectorFacesBottom[i][0] = jointSectorFacesBottom[i][0] +  (sectorVertice.length);
		jointSectorFacesBottom[i][1] = jointSectorFacesBottom[i][1] +  (sectorVertice.length);
		jointSectorFacesBottom[i][2] = jointSectorFacesBottom[i][2] +  (sectorVertice.length);
	}
	for (var i = 0; i < jointSectorFacesTop.length; i++) {
		jointSectorFacesTop[i][0] = jointSectorFacesTop[i][0] +  (sectorVertice.length);
		jointSectorFacesTop[i][1] = jointSectorFacesTop[i][1] +  (sectorVertice.length);
		jointSectorFacesTop[i][2] = jointSectorFacesTop[i][2] +  (sectorVertice.length);
	}
	for (var i = 0; i < jointSectorSides.length; i++) {
		jointSectorSides[i][0] = jointSectorSides[i][0] +  (sectorVertice.length);
		jointSectorSides[i][1] = jointSectorSides[i][1] +  (sectorVertice.length);
		jointSectorSides[i][2] = jointSectorSides[i][2] +  (sectorVertice.length);
	}

	for (var i = 0; i < rectangleFacesBottom.length; i++) {
		rectangleFacesBottom[i][0] = rectangleFacesBottom[i][0] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleFacesBottom[i][1] = rectangleFacesBottom[i][1] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleFacesBottom[i][2] = rectangleFacesBottom[i][2] +  (sectorVertice.length + jointSectorVertice.length);
	}
	for (var i = 0; i < rectangleFacesTop.length; i++) {
		rectangleFacesTop[i][0] = rectangleFacesTop[i][0] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleFacesTop[i][1] = rectangleFacesTop[i][1] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleFacesTop[i][2] = rectangleFacesTop[i][2] +  (sectorVertice.length + jointSectorVertice.length);
	}
	for (var i = 0; i < rectangleSides.length; i++) {
		rectangleSides[i][0] = rectangleSides[i][0] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleSides[i][1] = rectangleSides[i][1] +  (sectorVertice.length + jointSectorVertice.length);
		rectangleSides[i][2] = rectangleSides[i][2] +  (sectorVertice.length + jointSectorVertice.length);
	}
	var sectorBottomfacesStart =  0;
	var sectorBottomfacesEnd =  sectorFacesBottom.length;
	var sectorTopfacesStart =  sectorFacesBottom.length;
	var sectorTopfacesEnd =  sectorFacesBottom.length + sectorFacesTop.length;

	var sectorSidesStart =  sectorFacesBottom.length + sectorFacesTop.length;
	var sectorSidesEnd =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length;

	var jointSectorBottomfacesStart = sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length;
	var jointSectorBottomfacesEnd = sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length;
	var jointSectorTopfacesStart = sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length;
	var jointSectorTopfacesEnd = sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length;

	var jointSectorSidesStart =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length;
	var jointSectorSidesEnd =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length;

	var rectangleBottomfacesStart =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length;
	var rectangleBottomfacesEnd =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length + rectangleFacesBottom.length;
	var rectangleTopfacesStart =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length + rectangleFacesBottom.length;
	var rectangleTopfacesEnd =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length + rectangleFacesBottom.length + rectangleFacesTop.length;

	var rectangleSidesStart =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length + rectangleFacesBottom.length + rectangleFacesTop.length;
	var rectangleSidesEnd =  sectorFacesBottom.length + sectorFacesTop.length + sectorSides.length + jointSectorFacesBottom.length + jointSectorFacesTop.length + jointSectorSides.length + rectangleFacesBottom.length + rectangleFacesTop.length + rectangleSides.length;

// var jointSectorVertice = [];
// var jointSectorFacesTop = [];
// var jointSectorFacesBottom = [];

	var points = sectorVertice.concat(jointSectorVertice).concat(rectangleVertice);
	var bfaces = sectorFacesBottom.concat(sectorFacesTop).concat(sectorSides).concat(jointSectorFacesBottom).concat(jointSectorFacesTop).concat(jointSectorSides).concat(rectangleFacesBottom).concat(rectangleFacesTop).concat(rectangleSides);
	var faces = [];
	for (var i = 0; i < bfaces.length; i++) {
		faces.push(new THREE.Face3(bfaces[i][0], bfaces[i][1], bfaces[i][2]));
	}
	return {
		points: points,
		faces: faces,
		range: {
			min: min,
			max: max
		},
		coordinates: coord,
		coordinatesSSE : points2d, 
		range2d: {
			min: {
				x: extentSource.getExtent()[0],
				y: extentSource.getExtent()[1] 
			},
			max: {
				x: extentSource.getExtent()[2],
				y: extentSource.getExtent()[3] 
			}
		},
		uvindex: {
			sectorCoordStart : sectorCoordStart,
			sectorCoordEnd : sectorCoordEnd,
			sectorBottomfacesStart : sectorBottomfacesStart,
			sectorBottomfacesEnd : sectorBottomfacesEnd,
			sectorTopfacesStart : sectorTopfacesStart,
			sectorTopfacesEnd : sectorTopfacesEnd,
			sectorSidesStart : sectorSidesStart,
			sectorSidesEnd : sectorSidesEnd,
			jointSectorBottomfacesStart : jointSectorBottomfacesStart,
			jointSectorBottomfacesEnd : jointSectorBottomfacesEnd,
			jointSectorTopfacesStart : jointSectorTopfacesStart,
			jointSectorTopfacesEnd : jointSectorTopfacesEnd,
			jointSectorSidesStart : jointSectorSidesStart,
			jointSectorSidesEnd : jointSectorSidesEnd,
			rectangleBottomfacesStart : rectangleBottomfacesStart,
			rectangleBottomfacesEnd : rectangleBottomfacesEnd,
			rectangleTopfacesStart : rectangleTopfacesStart,
			rectangleTopfacesEnd : rectangleTopfacesEnd,
			rectangleSidesStart : rectangleSidesStart,
			rectangleSidesEnd : rectangleSidesEnd
		}
	}
}

/**
 * 라인스트링 지오메트리에 따른 UV좌표를 생성한다.
 * 
 * @method gb3d.Math.createUVVerticeOnLineString
 * @param {THREE.Geometry} geometry - UV좌표를 입력할 지오메트리 객체
 * @param {Object} 지오메트리 객체에 덮어쓸 좌표값 객체
 */
gb3d.Math.createUVVerticeOnLineString = function(geometry, result){

	geometry.vertices = result.points;
	geometry.faces = result.faces;

	var sectorBottomfacesStart = result.uvindex["sectorBottomfacesStart"];
	var sectorBottomfacesEnd = result.uvindex["sectorBottomfacesEnd"];
	var sectorTopfacesStart = result.uvindex["sectorTopfacesStart"];
	var sectorTopfacesEnd = result.uvindex["sectorTopfacesEnd"];
	var sectorSidesStart = result.uvindex["sectorSidesStart"];
	var sectorSidesEnd = result.uvindex["sectorSidesEnd"];

	var jointSectorBottomfacesStart = result.uvindex["jointSectorBottomfacesStart"];
	var jointSectorBottomfacesEnd = result.uvindex["jointSectorBottomfacesEnd"];
	var jointSectorTopfacesStart = result.uvindex["jointSectorTopfacesStart"];
	var jointSectorTopfacesEnd = result.uvindex["jointSectorTopfacesEnd"];
	var jointSectorSidesStart = result.uvindex["jointSectorSidesStart"];
	var jointSectorSidesEnd = result.uvindex["jointSectorSidesEnd"];

	var rectangleBottomfacesStart = result.uvindex["rectangleBottomfacesStart"];
	var rectangleBottomfacesEnd = result.uvindex["rectangleBottomfacesEnd"];
	var rectangleTopfacesStart = result.uvindex["rectangleTopfacesStart"];
	var rectangleTopfacesEnd = result.uvindex["rectangleTopfacesEnd"];
	var rectangleSidesStart = result.uvindex["rectangleSidesStart"];
	var rectangleSidesEnd = result.uvindex["rectangleSidesEnd"];

	var sectorCoordStart = result.uvindex["sectorCoordStart"];
	var sectorCoordEnd = result.uvindex["sectorCoordEnd"];

	geometry.computeBoundingBox();
	var max = geometry.boundingBox.max,
	min = geometry.boundingBox.min;
	console.log(max);
	console.log(min);
	var offset = new THREE.Vector3(0 - min.x, 0 - min.y, 0 - min.z);
	var range = new THREE.Vector3(((min.x - max.x) * -1) ,((min.y - max.y) * -1), ((min.z - max.z) * -1));
	var offset2d = new THREE.Vector2(0 - result.range2d.min.x, 0 - result.range2d.min.y);
	var range2d = new THREE.Vector2(((result.range2d.min.x - result.range2d.max.x) * -1) ,((result.range2d.min.y - result.range2d.max.y) * -1));
	var faces = geometry.faces;

	geometry.faceVertexUvs[0] = [];
	// 양끝 부채꼴 밑면 - 0으로 없애기
	for (var i = sectorBottomfacesStart; i < sectorBottomfacesEnd; i++) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0)
			]);
	}

	var lineStart = turf.lineString(sectorCoordStart);
	var bboxStart = turf.bbox(lineStart);
	var startRange2d = {
			"min" : {
				"x" : bboxStart[0],
				"y" : bboxStart[1]
			},
			"max" : {
				"x" : bboxStart[2],
				"y" : bboxStart[3]
			}
	};
	var offset2dStart = new THREE.Vector2(0 - startRange2d.min.x, 0 - startRange2d.min.y);
	var range2dStart = new THREE.Vector2(((startRange2d.min.x - startRange2d.max.x) * -1) ,((startRange2d.min.y - startRange2d.max.y) * -1));

	var lineEnd = turf.lineString(sectorCoordEnd);
	var bboxEnd = turf.bbox(lineEnd);
	var endRange2d = {
			"min" : {
				"x" : bboxEnd[0],
				"y" : bboxEnd[1]
			},
			"max" : {
				"x" : bboxEnd[2],
				"y" : bboxEnd[3]
			}
	};
	var offset2dEnd = new THREE.Vector2(0 - endRange2d.min.x, 0 - endRange2d.min.y);
	var range2dEnd = new THREE.Vector2(((endRange2d.min.x - endRange2d.max.x) * -1) ,((endRange2d.min.y - endRange2d.max.y) * -1));

	// 양끝의 부채꼴 윗면
	for (var i = sectorTopfacesStart; i < sectorTopfacesEnd; i++) {
		// 이 버텍스와 연결되는 2d 버텍스
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		var coord1 = result.coordinatesSSE[face.a];
		var coord2 = result.coordinatesSSE[face.b];
		var coord3 = result.coordinatesSSE[face.c];

		var vt1;
		var vt2;
		var vt3;
		if ( i < (sectorTopfacesStart + sectorCoordStart.length - 2)) {
			var vt1 = new THREE.Vector2((coord1[0] + offset2dStart.x)/range2dStart.x * 0.4,(coord1[1] + offset2dStart.y)/range2dStart.y * 0.4 + 0.2);
			var vt2 = new THREE.Vector2((coord2[0] + offset2dStart.x)/range2dStart.x * 0.4,(coord2[1] + offset2dStart.y)/range2dStart.y * 0.4 + 0.2);
			var vt3 = new THREE.Vector2((coord3[0] + offset2dStart.x)/range2dStart.x * 0.4,(coord3[1] + offset2dStart.y)/range2dStart.y * 0.4 + 0.2);	
		} else if (i >= (sectorTopfacesStart + sectorCoordStart.length - 2)) {
			var vt1 = new THREE.Vector2((coord1[0] + offset2dEnd.x)/range2dEnd.x * 0.4,(coord1[1] + offset2dEnd.y)/range2dEnd.y * 0.4 + 0.2);
			var vt2 = new THREE.Vector2((coord2[0] + offset2dEnd.x)/range2dEnd.x * 0.4,(coord2[1] + offset2dEnd.y)/range2dEnd.y * 0.4 + 0.2);
			var vt3 = new THREE.Vector2((coord3[0] + offset2dEnd.x)/range2dEnd.x * 0.4,(coord3[1] + offset2dEnd.y)/range2dEnd.y * 0.4 + 0.2);
		} 
		geometry.faceVertexUvs[0].push([
			vt1,
			vt2,
			vt3
			]);
	}

	// 텍스쳐 이미지에서 옆면의 높이 최고점 비율
	var topLimit = 0.2;
	// 텍스쳐 이미지에서 옆면의 높이 최저점 비율
	var bottomLimit = 0;
	for (var i = sectorSidesStart; i < sectorSidesEnd; i = i + 2) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
// console.log(v1.x+", "+v1.y);
// console.log(v2.x+", "+v2.y);
// console.log(v3.x+", "+v3.y);

		var from1to2 = parseFloat(v1.distanceTo(v2).toFixed(4));
		var val2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
// console.log("절대적인 가로길이 비율은 "+val2);
		var ratioVal2 = from1to2 * topLimit / result.range.max.y;
		if (ratioVal2 > 1) {
			ratioVal2 = 1;
			var ratioHeight = result.range.max.y/from1to2;
			bottomLimit = topLimit - ratioHeight;
		}
// console.log("높이가 "+result.range.max.y+"일때 최고 높이에 대한 비율을 0.2으로하면 가로
// 길이"+from1to2+"의 비율은 "+ratioVal2);

// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);

		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
// console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
		var from2to3 = v2.distanceTo(v3);
// console.log("1부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, bottomLimit),
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(ratioVal2, topLimit)
			]);
		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to3 = parseFloat(v1_2.distanceTo(v3_2).toFixed(4));
		var val2_2 = from1to3 > result.range.max.x ? 1 : from1to2/result.range.max.x;
// console.log("1부터 3까지 거리(u축, x축)는: "+from1to3);
		var from2to3 = v2_2.distanceTo(v3_2);
// console.log("2부터 3까지 거리는: "+from2to3);
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
// console.log("2부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, topLimit),
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(0, topLimit)
			]);
	}

	// 부채꼴 밑면 - 0으로 없애기
	for (var i = jointSectorBottomfacesStart; i < jointSectorBottomfacesEnd; i++) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0)
			]);
	}

	// 부채꼴 윗면
	// 텍스쳐 이미지에서 높이 최고점 비율
	var topLimit = 1;
	// 텍스쳐 이미지에서 높이 최저점 비율
	var bottomLimit = 0.8;
	for (var i = jointSectorTopfacesStart; i < jointSectorTopfacesEnd; i++) {
		// 이 버텍스와 연결되는 2d 버텍스
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		var coord1 = result.coordinatesSSE[face.a];
		var coord2 = result.coordinatesSSE[face.b];
		var coord3 = result.coordinatesSSE[face.c];
// console.log("2d 좌표의 값은:");
// console.log(coord1);
// console.log(coord2);
// console.log(coord3);

		var vt1 = new THREE.Vector2(0.04, 1);
		var vt2 = new THREE.Vector2(0, 1);
		var vt3 = new THREE.Vector2(0.02, 0.8);

		geometry.faceVertexUvs[0].push([
			vt1,
			vt2,
			vt3
			]);
	}

	// 텍스쳐 이미지에서 옆면의 높이 최고점 비율
	var topLimit = 0.2;
	// 텍스쳐 이미지에서 옆면의 높이 최저점 비율
	var bottomLimit = 0;
	for (var i = jointSectorSidesStart; i < jointSectorSidesEnd; i = i + 2) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
// console.log(v1.x+", "+v1.y);
// console.log(v2.x+", "+v2.y);
// console.log(v3.x+", "+v3.y);

		var from1to2 = parseFloat(v1.distanceTo(v2).toFixed(4));
		var val2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
// console.log("절대적인 가로길이 비율은 "+val2);
		var ratioVal2 = from1to2 * topLimit / result.range.max.y;
		if (ratioVal2 > 1) {
			ratioVal2 = 1;
			var ratioHeight = result.range.max.y/from1to2;
			bottomLimit = topLimit - ratioHeight;
		}
// console.log("높이가 "+result.range.max.y+"일때 최고 높이에 대한 비율을 0.2으로하면 가로
// 길이"+from1to2+"의 비율은 "+ratioVal2);

// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);

		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
// console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
		var from2to3 = v2.distanceTo(v3);
// console.log("1부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, bottomLimit),
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(ratioVal2, topLimit)
			]);
		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to3 = parseFloat(v1_2.distanceTo(v3_2).toFixed(4));
		var val2_2 = from1to3 > result.range.max.x ? 1 : from1to2/result.range.max.x;
// console.log("1부터 3까지 거리(u축, x축)는: "+from1to3);
		var from2to3 = v2_2.distanceTo(v3_2);
// console.log("2부터 3까지 거리는: "+from2to3);
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
// console.log("2부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, topLimit),
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(0, topLimit)
			]);
	}

	// 사각형 밑면
	for (var i = rectangleBottomfacesStart; i < rectangleBottomfacesEnd; i = i + 2) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		// console.log(v1.x+", "+v1.y);
		// console.log(v2.x+", "+v2.y);
		// console.log(v3.x+", "+v3.y);

		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0)
			]);

		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];

		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0)
			]);
	}

	// 사각형 윗면
	// 텍스쳐 이미지에서 도로 윗면의 상한
	var topLimit = 1;
	// 도로중심
	var midLimit = 0.8;
	// 텍스쳐 이미지에서 도로 윗면의 하한
	var bottomLimit = 0.6;
	for (var i = rectangleTopfacesStart; i < rectangleTopfacesEnd; i = i + 4) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		// console.log(v1.x+", "+v1.y);
		// console.log(v2.x+", "+v2.y);
		// console.log(v3.x+", "+v3.y);

		var from2to3 = parseFloat(v2.distanceTo(v3).toFixed(4));
		var val2 = from2to3 > result.range.max.x ? 1 : from2to3/result.range.max.x;
		// console.log("절대적인 가로길이 비율은 "+val2);
		var ratioVal2 = from2to3 / result.range.max.x;
		var widthLimit = 1;
		if (ratioVal2 > 1) {
			ratioVal2 = 1;
			var ratioWidth = result.range.max.x/from2to3;
			widthLimit = widthLimit - ratioWidth;
		}

		// console.log("가로가 "+result.range.max.x+"일때 최고 세로 길이에 대한 비율을 1으로하면 가로
		// 길이의 비율은 "+widthLimit);
		// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
		// console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
		var from2to3 = v2.distanceTo(v3);
		// console.log("2부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, midLimit),
			new THREE.Vector2(ratioVal2, topLimit),
			new THREE.Vector2(0, topLimit)
			]);

		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val2_2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
		// console.log("1부터 3까지 거리(u축, x축)는: "+from1to2);
		var from2to3 = parseFloat(v2_2.distanceTo(v3_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
		// console.log("1부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, midLimit),
			new THREE.Vector2(ratioVal2, midLimit),
			new THREE.Vector2(ratioVal2, topLimit)
			]);

		var face = faces[i+2];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		// console.log(v1.x+", "+v1.y);
		// console.log(v2.x+", "+v2.y);
		// console.log(v3.x+", "+v3.y);

		var from2to3 = parseFloat(v2.distanceTo(v3).toFixed(4));
		var val2 = from2to3 > result.range.max.x ? 1 : from2to3/result.range.max.x;
		// console.log("절대적인 가로길이 비율은 "+val2);
		// console.log("가로가 "+result.range.max.x+"일때 최고 세로 길이에 대한 비율을 1으로하면 가로
		// 길이의 비율은 "+widthLimit);
		// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
		// console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
		var from2to3 = v2.distanceTo(v3);
		// console.log("2부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(ratioVal2, midLimit),
			new THREE.Vector2(0, midLimit)
			]);

		var face2 = faces[i+3];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val2_2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
		// console.log("1부터 3까지 거리(u축, x축)는: "+from1to2);
		var from2to3 = parseFloat(v2_2.distanceTo(v3_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
		// console.log("1부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, bottomLimit),
			new THREE.Vector2(ratioVal2, bottomLimit),
			new THREE.Vector2(ratioVal2, midLimit)
			]);
	}
	// 텍스쳐 이미지에서 건물 옆면의 비율
	var TopLimit = 0.2;
	// 건물 바닥의 비율
	var bottomLimit = 0;
	for (var i = rectangleSidesStart; i < rectangleSidesEnd; i = i + 2) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		// console.log(v1.x+", "+v1.y);
		// console.log(v2.x+", "+v2.y);
		// console.log(v3.x+", "+v3.y);

		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val2 = from1to3 > result.range.max.x ? 1 : from1to3/result.range.max.x;
		// console.log("절대적인 가로길이 비율은 "+val2);
		var ratioVal2 = from1to3 * 0.2 / result.range.max.y;
		if (ratioVal2 > 1) {
			ratioVal2 = 1;
			var ratioHeight = result.range.max.y/from1to3;
			bottomLimit = TopLimit - ratioHeight;
		}

		// console.log("높이가 "+result.range.max.y+"일때 최고 높이에 대한 비율을 0.2로하면 가로
		// 길이"+from1to3+"의 비율은 "+ratioVal2);
		// console.log("1부터 3까지 거리(u축, x축)는: "+from1to3);
		var from1to2 = parseFloat(v1.distanceTo(v2).toFixed(4));
		var val3 = from1to2 > result.range.max.y ? 1 : from1to2/result.range.max.y;
		// console.log("1부터 2까지 거리(v축, y축)는: "+from1to2);
		var from2to3 = v2.distanceTo(v3);
		// console.log("2부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, bottomLimit),
			new THREE.Vector2(ratioVal2, TopLimit),
			new THREE.Vector2(0, bottomLimit)
			]);
		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val2_2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
		// console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
		var from1to3 = v1_2.distanceTo(v3_2);
		// console.log("1부터 3까지 거리는: "+from1to3);
		var from2to3 = parseFloat(v2_2.distanceTo(v3_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
		// console.log("2부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(ratioVal2, TopLimit),
			new THREE.Vector2(0, TopLimit),
			new THREE.Vector2(0, bottomLimit)
			]);
	}

	geometry.uvsNeedUpdate = true;
}

/**
 * 지오메트리에 따른 UV좌표를 생성한다.
 * 
 * @method gb3d.Math.createUVVerticeOnPolygon
 * @param {THREE.Geometry} geometry - UV좌표를 입력할 지오메트리 객체
 * @param {Object} 지오메트리 객체에 덮어쓸 좌표값 객체
 */
gb3d.Math.createUVVerticeOnPolygon = function(geometry, result){

	geometry.vertices = result.points;
	geometry.faces = result.faces;

	console.log("좌표 범위는: ");
	console.log(result.range);
	// 이준 시작
	var bottomStart = result.uvindex["bottomStart"];
	var bottomEnd = result.uvindex["bottomEnd"];
	var topStart = result.uvindex["topStart"];
	var topEnd = result.uvindex["topEnd"];
	var sideStart = result.uvindex["sideStart"];
	var sideEnd = result.uvindex["sideEnd"];
	console.log(bottomStart);
	console.log(bottomEnd);
	console.log(topStart);
	console.log(topEnd);
	console.log(sideStart);
	console.log(sideEnd);
	geometry.computeBoundingBox();
	var max = geometry.boundingBox.max,
	min = geometry.boundingBox.min;
	console.log(max);
	console.log(min);
	var offset = new THREE.Vector3(0 - min.x, 0 - min.y, 0 - min.z);
	var range = new THREE.Vector3(((min.x - max.x) * -1) ,((min.y - max.y) * -1), ((min.z - max.z) * -1));
	var offset2d = new THREE.Vector2(0 - result.range2d.min.x, 0 - result.range2d.min.y);
	var range2d = new THREE.Vector2(((result.range2d.min.x - result.range2d.max.x) * -1) ,((result.range2d.min.y - result.range2d.max.y) * -1));
	var faces = geometry.faces;

	geometry.faceVertexUvs[0] = [];

	for (var i = bottomStart; i < bottomEnd; i++) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		geometry.faceVertexUvs[0].push([
// new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
// new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
// new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0),
			new THREE.Vector2(0, 0)
			]);
	}
	// 건물 윗면의 비율
	var bottomStart = 0.6;
	for (var i = topStart; i < topEnd; i++) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		var coord1 = result.coordinates[face.a - (result.coordinates.length - 1)];
		var coord2 = result.coordinates[face.b - (result.coordinates.length - 1)];
		var coord3 = result.coordinates[face.c - (result.coordinates.length - 1)];
		console.log("2d 좌표의 값은:");
		console.log(coord1);
		console.log(coord2);
		console.log(coord3);
		var vt1 = new THREE.Vector2((coord1[0] + offset2d.x)/range2d.x * 0.4,(coord1[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
		var vt2 = new THREE.Vector2((coord2[0] + offset2d.x)/range2d.x * 0.4,(coord2[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
		var vt3 = new THREE.Vector2((coord3[0] + offset2d.x)/range2d.x * 0.4,(coord3[1] + offset2d.y)/range2d.y * 0.4 + 0.6);
// console.log(vt1);
// console.log(vt2);
// console.log(vt3);
		geometry.faceVertexUvs[0].push([
			vt1,
			vt2,
			vt3
			]);
	}
	// 텍스쳐 이미지에서 건물 옆면의 비율
	var height = 0.6;
	// 건물 바닥의 비율
	var bottomStart = 0;
	for (var i = sideStart; i < sideEnd; i = i + 2) {
		var face = faces[i];
		var v1 = result.points[face.a],
		v2 = result.points[face.b],
		v3 = result.points[face.c];
		console.log(v1.x+", "+v1.y);
		console.log(v2.x+", "+v2.y);
		console.log(v3.x+", "+v3.y);

		var from1to2 = parseFloat(v1.distanceTo(v2).toFixed(4));
		var val2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
		console.log("절대적인 가로길이 비율은 "+val2);
// var ratioVal2 = from1to2 * 0.6 / result.range.max.y;
		var ratioVal2 = from1to2 / result.range.max.y;
		if (ratioVal2 > 1) {
			ratioVal2 = 1;
// var ratioHeight = result.range.max.y/from1to2;
// bottomStart = height - ratioHeight;
		}

		console.log("높이가 "+result.range.max.y+"일때 최고 높이에 대한 비율을 0.6으로하면 가로 길이"+from1to2+"의 비율은 "+ratioVal2);
		console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
		var from1to3 = parseFloat(v1.distanceTo(v3).toFixed(4));
		var val3 = from1to3 > result.range.max.y ? 1 : from1to3/result.range.max.y;
		console.log("1부터 3까지 거리(v축, y축)는: "+from1to3);
		var from2to3 = v2.distanceTo(v3);
// console.log("2부터 3까지 거리는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, bottomStart),
			new THREE.Vector2(ratioVal2, bottomStart),
			new THREE.Vector2(0, height)
// new THREE.Vector2(0, val3)
// new THREE.Vector2(0, 0),
// new THREE.Vector2(1, 0),
// new THREE.Vector2(0, 1),
			]);
// console.log((v1.x + offset.x)/range.x, (v1.y + offset.y)/range.y);
// console.log((v2.x + offset.x)/range.x, (v2.y + offset.y)/range.y);
// console.log((v3.x + offset.x)/range.x, (v3.y + offset.y)/range.y);
		var face2 = faces[i+1];
		var v1_2 = result.points[face2.a],
		v2_2 = result.points[face2.b],
		v3_2 = result.points[face2.c];
		var from1to2 = parseFloat(v1_2.distanceTo(v2_2).toFixed(4));
		var val2_2 = from1to2 > result.range.max.x ? 1 : from1to2/result.range.max.x;
		console.log("1부터 2까지 거리(u축, x축)는: "+from1to2);
		var from1to3 = v1_2.distanceTo(v3_2);
// console.log("1부터 3까지 거리는: "+from1to3);
		var from2to3 = parseFloat(v2_2.distanceTo(v3_2).toFixed(4));
		var val3_2 = from2to3 > result.range.max.y ? 1 : from2to3/result.range.max.y;
		console.log("2부터 3까지 거리(v축, y축)는: "+from2to3);
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2(0, height),
			new THREE.Vector2(ratioVal2, bottomStart),
			new THREE.Vector2(ratioVal2, height)
			]);
	}

	geometry.uvsNeedUpdate = true;
}

/**
 * 객체의 Matrix World 값을 초기화 한다.
 * 
 * @method gb3d.Math.resetMatrixWorld
 * @param {THREE.Object3D|THREE.Group} obj - 3d 객체
 * @param {number} quaternion - quaternion
 * @param {Object} centerHigh - center 3차원 좌표값
 * @param {Object} centerHigh.x - x
 * @param {Object} centerHigh.y - y
 * @param {Object} centerHigh.z - z
 */
gb3d.Math.resetMatrixWorld = function( obj, quaternion, centerHigh ) {
	var object = obj;
	var quat = object.rotation.clone();
	var center = centerHigh;
	var look = new THREE.Vector3(center.x, center.y, center.z);
	look.negate();
// if(object.userData.type){
// return;
// }

	if(!object.geometry){
		if(object.children instanceof Array){
			for(var i = 0; i < object.children.length; i++){
				// Three Object가 Geometry 인자를 가지고 있지않고 Children 속성을 가지고 있을 때
				// 재귀함수 요청
				object.position.copy(new THREE.Vector3(0, 0, 0));
				quat = object.rotation.clone();
				object.lookAt(new THREE.Vector3(0, 0, 1));
				object.setRotationFromEuler(quat);
// object.matrix.makeRotationFromQuaternion(quat);
// object.matrixWorld.makeRotationFromQuaternion(quat);
				gb3d.Math.resetMatrixWorld(object.children[i], quat, center);
			}
		}
	} else {
// object.position.copy(new THREE.Vector3(0, 0, 0));
		object.lookAt(new THREE.Vector3(0, 0, 1));
		object.setRotationFromEuler(quat);
// object.matrix.makeRotationFromQuaternion(quat);
// object.matrixWorld.makeRotationFromQuaternion(quat);
// object.setRotationFromQuaternion(quat);
	}
};

/**
 * 3D 객체의 위치값과 회전값을 초기화한다.
 * 
 * @method gb3d.Math.resetRotationAndPosition
 * @param {THREE.Object3D} object - 원점으로 되돌릴 3D 객체
 * @return {THREE.Object3D} 변환된 3D 객체
 */
gb3d.Math.resetRotationAndPosition = function(object) {
	if (object instanceof THREE.Object3D) {
		var pos = new THREE.Vector3();
		object.position.copy(pos);
		var eu = new THREE.Euler();
		object.setRotationFromEuler(eu);
		object.lookAt(new THREE.Vector3(0, 0, 1));
		object.updateMatrixWorld(true);
	}
	return object;
};