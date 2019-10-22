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
	
	
// console.log("min: "+min.x+", "+min.y);
// console.log("max: "+max.x+", "+max.y);
// var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
// var range = new THREE.Vector2(((min.x - max.x) * -1) ,((min.y - max.y) *
// -1));
// var faces = geometry.faces;

// for (var i = bottomStart; i < bottomEnd; i++) {
// var face = faces[i];
// var v1 = points[face.a],
// v2 = points[face.b],
// v3 = points[face.c];
//		
// faceVertexUvs.push([
// new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
// new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
// new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
// ]);
// }
// for (var i = topStart; i < topEnd; i++) {
// var face = faces[i];
// var v1 = points[face.a],
// v2 = points[face.b],
// v3 = points[face.c];
//		
// faceVertexUvs.push([
// new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
// new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
// new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
// ]);
// }
// for (var i = sideStart; i < sideEnd; i++) {
// var face = faces[i];
// var v1 = points[face.a],
// v2 = points[face.b],
// v3 = points[face.c];
//		
// faceVertexUvs.push([
// new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
// new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
// new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
// ]);
// }
// geometry.faceVertexUvs[0] = [];
//
// for (var i = 0; i < faces.length ; i++) {
//
// var v1 = geometry.vertices[faces[i].a],
// v2 = geometry.vertices[faces[i].b],
// v3 = geometry.vertices[faces[i].c];
//
// geometry.faceVertexUvs[0].push([
// new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
// new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
// new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
// ]);
// console.log((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y);
// console.log((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y);
// console.log((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y);
// }
	
	return {
		points: points,
		faces: faces,
		range: {
			min: min,
			max: max
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
