/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.Math)
	gb3d.Math = {};

gb3d.Math.crossProductFromDegrees = function(pointA, pointB, standard){
	var a, b, u, v, w, s, cart;
		
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
	
	s = Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2) + Math.pow(w, 2));
	
	return {
		u: u,
		v: v,
		w: w,
		s: s
	}
}

gb3d.Math.getPolygonVertexAndFaceFromDegrees = function(arr, depth){
	var coord = arr,
		points = [],
		faceBottom = [],
		faceTop = [],
		faceSide = [],
		faces = [],
		coordLength = coord.length - 1,
		cart,
		depth = depth;
	
	// 3차원 객체 밑면 vertex 계산
	for(var i = 0; i < coordLength; i++){
		cart = Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]);
		points.push(new THREE.Vector3(cart.x, cart.y, cart.z));
	}
	
	faceBottom = THREE.ShapeUtils.triangulateShape(points, []);
	
	for(var i = 0; i < faceBottom.length; i++){
		faceTop.push([faceBottom[i][0] + coordLength, faceBottom[i][1] + coordLength, faceBottom[i][2] + coordLength]);
	}
	
	// 3차원 객체 윗면 vertex 계산
	var cp;
	for(var i = 0; i < coordLength; i++){
		cart = Cesium.Cartesian3.fromDegrees(coord[i][0], coord[i][1]);
		
		if(i !== 0){
	//		faceSide.push([i + coordLength, i - 1 + coordLength, i - 1]);
	//		faceSide.push([i - 1, i, i + coordLength]);
			
			faceSide.push([i - 1, i - 1 + coordLength, i]);
			faceSide.push([i - 1 + coordLength, i + coordLength, i]);
		}
		
		if(i === 0){
			cp = gb3d.Math.crossProductFromDegrees(coord[i+1], coord[coordLength - 1], coord[i]);
		}
		
		points.push(new THREE.Vector3(cart.x + (cp.u/cp.s)*depth, cart.y + (cp.v/cp.s)*depth, cart.z + (cp.w/cp.s)*depth));
	}
	
	for(var i = 0; i < faceBottom.length; i++){
		faces.push(new THREE.Face3(faceBottom[i][0], faceBottom[i][1], faceBottom[i][2]));
	}
	
	for(var i = 0; i < faceTop.length; i++){
		faces.push(new THREE.Face3(faceTop[i][0], faceTop[i][1], faceTop[i][2]));
	}
	
	for(var i = 0; i < faceSide.length; i++){
		faces.push(new THREE.Face3(faceSide[i][0], faceSide[i][1], faceSide[i][2]));
	}
	
	return {
		points: points,
		faces: faces
	}
}