var gb;
if (!gb)
	gb = {};
if (!gb.interaction)
	gb.interaction = {};

(function($){
	/**
	 * @classdesc
	 * Hole Polygon 그리기 기능
	 * @class gb.interaction.HoleDraw
	 * @memberof gb.interaction
	 * @param {Object} opt_options - gb.interaction.HoleDraw 생성 옵션
	 * @param {gb.edit.EditingTool} opt_options.editTool - 피처 편집 기능 객체. 선택된 피처를 가져오기위한 필수 옵션
	 * @param {gb.edit.FeatureRecord} [opt_options.featureRecord] - feature 편집 이력 관리 객체
	 * @extends {ol.interaction.Interaction}
	 * @author KIM HOCHUL
	 * @date 2019. 03. 25
	 * @version 0.01
	 */
	gb.interaction.HoleDraw = function(opt_options) {
		var that = this;
		
		/**
		 * 임시 vector source
		 * @type {ol.source.Vector}
		 * @private
		 */
		this.source_ = new ol.source.Vector();
		
		
		var options = opt_options ? opt_options : {};
		this.featureRecord = options.featureRecord || undefined;
		this.editTool = options.editTool || undefined;
		// this.coordinates = undefined;
		
		this.selected = this.editTool ? this.editTool.selected : undefined;
		
		ol.interaction.Draw.call(this, {
			type: "Polygon",
			source: this.source_
		});
		
		this.on("drawstart", function(e){
			var feature = e.feature;
			var ringAdded = false;
			var index = null;
			var appendPolygon = new ol.geom.Polygon([]);
			
			if(!that.checkSelected()){
				that.setActive(false);
				return;
			}
			feature.on("change", function(e){
				var a = that.selected.getArray()[0].getGeometry();
				var b = feature.getGeometry();
				var drawCoords = b.getCoordinates(false)[0];
				var polygons = undefined;
				var array = [];
				
				if(drawCoords.length > 2){
					if(ringAdded === false){
						var testCoords = b.getCoordinates(false)[0];
						var testCoordsLength = testCoords.length;
						if(testCoords.length === 3 && 
								testCoords[testCoordsLength - 1][0] === testCoords[testCoordsLength - 2][0] && 
								testCoords[testCoordsLength - 1][1] === testCoords[testCoordsLength - 2][1]){
							console.log("do nothing!!");
							return;
						} else {
							if(a.getType() === "Polygon"){
								a.appendLinearRing(
									new ol.geom.LinearRing(
										pushFirstElement(b.getCoordinates()[0])
									)
								);
							} else if(a.getType() === "MultiPolygon"){
								polygons = a.getPolygons();
								for(var i = 0; i < polygons.length; i++){
									if(polygons[i].intersectsCoordinate(b.getFirstCoordinate())){
										appendPolygon.setCoordinates(polygons[i].getCoordinates());
										appendPolygon.appendLinearRing(
											new ol.geom.LinearRing(
												pushFirstElement(b.getCoordinates()[0])
											)
										);
										index = i;
										break;
									}
								}
								if(index === null){
									return false;
								}
								/*appendPolygon.setCoordinates(a.getCoordinates()[0]);
								appendPolygon.appendLinearRing(
									new ol.geom.LinearRing(
										pushFirstElement(b.getCoordinates()[0])
									)
								);*/
							}
							
							ringAdded = true;
						}
					} else {
						
						var coordElemntLength, coordsExt;
						var coordsInter = [];
						var setCoords = [];
						
						if(a.getType() === "Polygon"){
							
							coordElemntLength = a.getCoordinates().length;
							coordsExt = a.getCoordinates()[0];
							
						} else if(a.getType() === "MultiPolygon"){
							
							coordElemntLength = appendPolygon.getCoordinates().length;
							coordsExt = appendPolygon.getCoordinates()[0];
						}
						
						if (coordElemntLength > 2) {
							for (var i = 1; i < coordElemntLength - 1; i++) {
								if(a.getType() === "Polygon"){
									coordsInter.push(a.getCoordinates()[i]);
								} else if(a.getType() === "MultiPolygon"){
									coordsInter.push(a.getCoordinates()[index][i]);
								}
							}
						}
	
						if (coordsInter.length > 0) {
							setCoords.push(coordsExt);
							for (var z = 0; z < coordsInter.length; z++) {
								setCoords.push(coordsInter[z]);
							}
							
							setCoords.push(pushFirstElement(b.getCoordinates(false)[0]));
						} else {
							
							setCoords = [coordsExt, pushFirstElement(b.getCoordinates(false)[0])];
						}
						
						if(a.getType() === "Polygon"){
							a.setCoordinates(setCoords);
						} else if(a.getType() === "MultiPolygon"){
							polygons = a.getPolygons();
							appendPolygon.setCoordinates(setCoords);
							for(var i = 0; i < polygons.length; i++){
								if(index === i){
									array.push(appendPolygon.getCoordinates());
								} else {
									array.push(polygons[i].getCoordinates());
								}
							}
							a.setCoordinates(array);
							/*appendPolygon.setCoordinates(setCoords);
							array = a.getCoordinates();
							array.push(appendPolygon.getCoordinates());
							that.coordinates = [appendPolygon.getCoordinates()];*/
						}
					}
				}
			});
		});
		
		this.on("drawend", function(e){
			/*var a = that.selected.getArray()[0].getGeometry();
			a.setCoordinates(that.coordinates);*/
			var updateFeature = that.selected.getArray()[0];
			that.featureRecord.update(that.editTool.selectedSource.get("git").tempLayer, updateFeature);
		});
	};
	ol.inherits(gb.interaction.HoleDraw, ol.interaction.Draw);

	/**
	 * 선택된 피처의 유효성을 확인한다. 선택된 피쳐는 타입이 Polygon또는 MultiPolygon인
	 * ol.Feature 객체이여야하며 한 개의 피쳐만 선택되어있어야한다.
	 * @method gb.interaction.HoleDraw#checkSelected
	 * @function
	 * @return {boolean} 유효성 검사 결과
	 */
	gb.interaction.HoleDraw.prototype.checkSelected = function(){
		if(!(this.selected instanceof ol.Collection)){
			alert("There is no object of ol.interaction.Select");
			return false;
		} else {
			if(this.selected.getArray().length !== 1){
				alert("You must select only one feature");
				return false;
			} else {
				if(!(this.selected.getArray()[0].getGeometry().getType() === "Polygon" || 
						this.selected.getArray()[0].getGeometry().getType() === "MultiPolygon")){
					alert("Only Polygon geometry selections.");
					return false;
				} else {
					return true;
				}
			}
		}
	}
	
	/**
	 * 선택된 피처를 설정한다.
	 * @method gb.interaction.HoleDraw#setSelectFeatures
	 * @function
	 * @param {ol.Collection} sel - 선택된 피처 모음 객체
	 * @return {boolean} 선택된 피처 설정 성공 여부
	 */
	gb.interaction.HoleDraw.prototype.setSelectFeatures = function(sel){
		if(sel instanceof ol.Collection){
			this.selected = sel;
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * 인자값으로 주어진 배열 객체의 첫번째 항목을 복사하여 배열의 맨마지막 항목에 추가한다.
	 * Geometry 객체를 생성하기 위한 좌표 배열을 만들기위해 사용한다.
	 * @method pushFirstElement
	 * @function
	 * @param {Array} arr - 재배열할 배열 객체
	 * @return {Array}
	 * @private
	 */
	function pushFirstElement(arr){
		var retArray = new Array()
		for (var i = 0; i < arr.length; i++) {
			retArray.push(arr[i])
		}
		retArray.push(arr[0])
		return retArray;
	}
}(jQuery));