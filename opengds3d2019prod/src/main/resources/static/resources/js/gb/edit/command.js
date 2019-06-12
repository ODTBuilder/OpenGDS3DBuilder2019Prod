var gb;
if (!gb)
	gb = {};
if (!gb.edit)
	gb.edit = {};

(function($){
	/**
	 * @classdesc
	 * 값을 직접 입력하여 기능을 수행하는 명령어 기능. Custom 명령어를 추가할 수 있다.
	 * @description
	 * 명령어를 추가하기위해 입력해야할 값들은 다음과 같다.
	 * 
	 * tip: 명령어 입력 도움말
	 * 
	 * paramKey: 입력값을 저장하기위한 Key값
	 * 
	 * inputValue: input 입력창에 입력할 값. function return 형식 또는 String 형식
	 * 
	 * before: 다음 입력 단계로 넘어가기전에 수행할 함수. return true일때 다음 작업으로 넘어감. false 일시 재입력
	 * 
	 * beforeFailLog: before 함수가 false를 return할때의 log
	 * 
	 * beforeSuccessLog: before 함수가 true를 return할때의 log
	 * 
	 * log: 현재 입력 단계 log
	 * 
	 * next: 다음 입력 단계
	 * 
	 * end: 마무리 단계에서 수행할 함수. 현재까지 입력한 값들을 Object에 담아 함수의 인자값으로 전달함
	 * 
	 * successLog: 작업 성공시 log. end함수가 true 값을 return할때
	 * 
	 * failLog: 작업 실패시 log. end함수가 false 값을 return할때
	 * @example
	 * var commandLine = new gb.edit.CommandLine({
	 * 	targetElement : $(".map-div"),
	 * 	jstree : <gb.tree.OpenLayers>,
	 * 	editTool : <gb.edit.EditingTool>,
	 * 	title : "Command",
	 * 	toggleTarget : "#cmd-toggle-btn",
	 * 	isDisplay : false,
	 * 	map : <ol.Map>
	 * });
	 * 
	 * commandLine.addCommand("customCmd", {
	 * 	tip: "Enter Value",
	 * 	paramKey: "value",
	 * 	before: function(value){
	 * 		console.log("before cmd")
	 * 		return true;
	 * 	},
	 * 	beforeFailLog: "before function fail",
	 * 	beforeSuccesslog: "before function success!",
	 * 	log: "Command start!",
	 * 	next: {
	 * 		tip: "type? ( point / lineString / polygon )",
	 * 		point: {
	 * 			end: function(params){
	 * 				console.log(params.value);
	 * 				return true;
	 * 			},
	 * 			successLog: "POINT success!",
	 * 			failLog: "POINT falied!"
	 * 		},
	 * 		lineString: {
	 * 			end: function(params){
	 * 				console.log(params.value);
	 * 				return true;
	 * 			},
	 * 			successLog: "LINESTRING success!",
	 * 			failLog: "LINESTRING falied!"
	 * 		},
	 * 		polygon: {
	 * 			end: function(params){
	 * 				console.log(params.value);
	 * 				return true;
	 * 			},
	 * 			successLog: "POLYGON success!",
	 * 			failLog: "POLYGON falied!"
	 * 		}
	 * 	}
	 * });
	 * @class gb.edit.CommandLine
	 * @memberof gb.edit
	 * @constructor
	 * @param {Object} obj - gb.edit.CommandLine 생성 옵션
	 * @param {ol.Map} obj.map - ol Map 객체
	 * @param {gb.tree.OpenLayers} obj.jstree - 선택된 레이어를 인지하기위한 jstree 객체
	 * @param {gb.edit.EditingTool} obj.editTool - 현재 편집 중인 Feature를 인지하기위한 EditingTool 객체
	 * @param {string} [obj.locale="en"] - 언어 코드
	 * @author KIM HOCHUL
	 * @date 2019. 03. 26
	 * @version 0.01
	 */
	gb.edit.CommandLine = function(obj) {
		var that = this;
		gb.footer.FooterBase.call(this, obj);
		
		var options = obj || {};
		this.map = options.map;
		// this.serverURL = options.serverURL;
		this.jstree = options.jstree || undefined;
		this.editTool = options.editTool || undefined;
		this.locale = options.locale || "en";
		
		/**
		 * 번역
		 * @type {Object.<string, Object<string, string>>}
		 * @private
		 */
		this.translation = {
			"history": {
				"en": "History",
				"ko": "이력"
			},
			"log": {
				"en": "Log",
				"ko": "로그"
			},
			"commandLine": {
				"en": "Command line",
				"ko": "명령어 입력"
			},
			"layerNameHint" : {
				"ko" : "레이어 이름은 문자로 시작해야하며 영어 대소문자, 숫자, 언더스코어(_), 하이픈(-) 만 입력이 가능합니다.",
				"en" : "Layer names must begin with a letter and can only contain letters in English, capital letters, numbers, hyphens(-) and underscores(_)."
			}
		}
		
		/**
		 * 명령어 입력 도우미 영역 jquery instance.
		 * input Tag 왼쪽 부분의 영역에 표시될 데이터.
		 * @type {n.fn.init}
		 * @private
		 */
		this.label = undefined;
		
		/**
		 * 명령어 이력
		 * @type {Object.<string, Array.<string>>}
		 * @private
		 */
		this.workHistory_ = {};
		
		/**
		 * input tag 입력된 값 임시 저장 배열
		 * @type {Array.<string>}
		 * @private
		 */
		this.inputHistory_ = [];
		
		/**
		 * input에 입력된 값들을 Key, Value 형식으로 저장
		 * @type {Object.<string, string>}
		 * @private
		 */
		this.params_ = {};
		
		/**
		 * Command 작업 리스트
		 * tip: 명령어 입력 도움말
		 * paramKey: 입력값을 저장하기위한 Key값
		 * inputValue: input 입력창에 입력할 값. function return 형식 또는 String 형식
		 * before: 다음 입력 단계로 넘어가기전에 수행할 함수. return true일때 다음 작업으로 넘어감. false 일시 재입력
		 * beforeFailLog: before 함수가 false를 return할때의 log
		 * beforeSuccessLog: before 함수가 true를 return할때의 log
		 * log: 현재 입력 단계 log
		 * next: 다음 입력 단계
		 * end: 마무리 단계에서 수행할 함수. 현재까지 입력한 값들을 Object에 담아 함수의 인자값으로 전달함
		 * successLog: 작업 성공시 log. end함수가 true 값을 return할때
		 * failLog: 작업 실패시 log. end함수가 false 값을 return할때
		 * @type {Object}
		 * @private
		 */
		this.commandList_ = {
//			createLayer: {
//				tip: "Enter layer name",
//				paramKey: "layerName",
//				before: function(value){
//					var layername_pattern = /^([A-Za-z])([A-Za-z0-9_-]+)$/;
//					return layername_pattern.test(value)
//				},
//				beforeFailLog: this.translation.layerNameHint[this.locale],
//				beforeSuccesslog: "Enter layer name success!",
//				log: "CreateLayer command start!",
//				next: {
//					tip: "Layer type? ( point / lineString / polygon )",
//					point: {
//						end: function(params){
//							return createVectorLayer(that.map, params.layerName, "Point");
//						},
//						successLog: "create POINT Layer success!",
//						failLog: "create POINT Layer falied!"
//					},
//					lineString: {
//						end: function(params){
//							return createVectorLayer(that.map, params.layerName, "LineString");
//						},
//						successLog: "create LINESTRING Layer success!",
//						failLog: "create LINESTRING Layer falied!"
//					},
//					polygon: {
//						end: function(params){
//							return createVectorLayer(that.map, params.layerName, "Polygon");
//						},
//						successLog: "create POLYGON Layer success!",
//						failLog: "create POLYGON Layer falied!"
//					}
//				}
//			},
			createFeature: {
				tip: "Enter Coodinates (ex.point: [x,y] / lineString & polygon: [[x,y], ...])",
				paramKey: "coordinates",
				before: function(value){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					return true;
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var layers = that.jstree.getJSTree().get_selected_layer();
					var insertCoords = params.coordinates;
					var coords = insertCoords.replace(/[[\]\s]/g, '').split(",");
					var layer, type, geometry, feature, git, vectorLayer, source;
					
					if(coords.length === 0 || coords.length % 2 !== 0){
						this.failLog = "Wrong Coordinates";
						return false;
					}
					if(layers.length === 1){
						layer = layers[0];
						git = layer.get("git");
						if(!(git instanceof Object)){
							this.failLog = "The layer has not 'git' property";
							return false;
						}
						vectorLayer = git.tempLayer;
						if(!(vectorLayer instanceof ol.layer.Vector)){
							this.failLog = "The layer has not ol.layer.Vector";
							return false;
						}
						type = git.geometry;
						switch(type){
							case "Point":
								if(!regexCoordinate(coords[0]) || !regexCoordinate(coords[1]) || coords.length < 2){
									this.failLog = "Wrong Coordinates";
									return false;
								}
								geometry = new ol.geom.Point([parseFloat(coords[0]), parseFloat(coords[1])]);
								break;
							case "LineString":
								var lineCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 4){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									lineCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry = new ol.geom.LineString(lineCoord);
								break;
							case "Polygon":
								var polyCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 6){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									polyCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry = new ol.geom.Polygon([polyCoord]);
								break;
							case "MultiPoint":
								if(!regexCoordinate(coords[0]) || !regexCoordinate(coords[1]) || coords.length < 2){
									this.failLog = "Wrong Coordinates";
									return false;
								}
								geometry = new ol.geom.MultiPoint([[parseFloat(coords[0]), parseFloat(coords[1])]]);
								break;
							case "MultiLineString":
								var lineCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 4){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									lineCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry = new ol.geom.MultiLineString([lineCoord]);
								break;
							case "MultiPolygon":
								var polyCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 6){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									polyCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry = new ol.geom.MultiPolygon([[polyCoord]]);
								break;
						}
						feature = new ol.Feature({
							geometry: geometry
						});
						that.editTool.featureRecord.create(layer, feature);
						vectorLayer.getSource().addFeature(feature);
						feature.setId(createFeatureId(layer, that.editTool));
						
						gb.undo.pushAction({
							undo: function(data){
								data.layer.getSource().removeFeature(data.feature);
								data.edit.featureRecord.deleteFeatureCreated(data.layer.get("id"), data.feature.getId());
							},
							redo: function(data){
								data.layer.getSource().addFeature(data.feature);
								data.edit.featureRecord.create(data.layer, data.feature);
							},
							data: {
								edit: that.editTool,
								layer: layer,
								feature: feature
							}
						});
						
						return true;
					} else {
						return false;
					}
				},
				successLog: "create Feature success!",
				failLog: "Wrong Coordinates"
			},
			moveFeature: {
				tip: "Enter coordinate (ex.[x,y])",
				paramKey: "coordinates",
				before: function(value){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					var git = layer.get("git");
					var features = that.editTool.selected;
					if(!features.getLength()){
						this.beforeFailLog = "You must select feature";
						return false;
					}
					
					var feature = features.item(0);
					if(feature instanceof ol.Feature){
						return true;
					} else {
						this.beforeFailLog = "You must select feature";
						return false;
					}
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var insertCoords = params.coordinates;
					var coords = insertCoords.replace(/[[\]\s]/g, '').split(",");
					
					var feature, geometry, lastCoord, prevCoord, deltaX, deltaY;
					
					if(coords.length !== 2){
						return false;
					}
					
					if(!regexCoordinate(coords[0]) || !regexCoordinate(coords[1])){
						return false;
					}
						
					feature = that.editTool.selected.item(0);
					
					if(!(feature instanceof ol.Feature)){
						return false;
					}
					geometry = feature.getGeometry();
					prevCoord = geometry.getCoordinates();
					lastCoord = geometry.getLastCoordinate();
					
					deltaX = parseFloat(coords[0]) - lastCoord[0];
					deltaY = parseFloat(coords[1]) - lastCoord[1];
					
					geometry.translate(deltaX, deltaY);
					feature.setGeometry(geometry);
					
					gb.undo.pushAction({
						undo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.prevCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						redo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.newCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						data: {
							edit: that.editTool,
							layer: that.jstree.getJSTree().get_selected_layer()[0],
							feature: feature,
							prevCoord: prevCoord,
							newCoord: feature.getGeometry().getCoordinates()
						}
					});
					
					return true;
				},
				successLog: "Move Feature success!",
				failLog: "Move Feature fail!"
			},
			rotateFeature: {
				tip: "Enter degree",
				paramKey: "degree",
				before: function(value){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					var git = layer.get("git");
					var features = that.editTool.selected;
					if(!features.getLength()){
						this.beforeFailLog = "You must select feature";
						return false;
					}
					
					var feature = features.item(0);
					if(feature instanceof ol.Feature){
						if(/^[-+]?[0-9]*\.?[0-9]+$/.test(value)){
							return true;
						} else {
							this.beforeFailLog = "You must enter float type value";
							return false;
						}
					} else {
						this.beforeFailLog = "You must select feature";
						return false;
					}
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var feature = that.editTool.selected.item(0);
					
					if(!(feature instanceof ol.Feature)){
						return false;
					}
					var geometry, prevCoord, extent, x, y, radian;
					
					geometry = feature.getGeometry();
					prevCoord = geometry.getCoordinates();
					extent = geometry.getExtent();
					x = extent[0] + (extent[2] - extent[0]) / 2;
					y = extent[1] + (extent[3] - extent[1]) / 2;
					radian = parseFloat(params.degree) * Math.PI / 180;
					geometry.rotate(radian, [x, y]);
					
					gb.undo.pushAction({
						undo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.prevCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						redo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.newCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						data: {
							edit: that.editTool,
							layer: that.jstree.getJSTree().get_selected_layer()[0],
							feature: feature,
							prevCoord: prevCoord,
							newCoord: feature.getGeometry().getCoordinates()
						}
					});
					
					return true;
				},
				successLog: "Rotate Feature success!",
				failLog: "Rotate Feature fail!"
			},
			modifyFeature: {
				tip: "Enter Coodinates (ex.point: [x,y] / lineString & polygon: [[x,y], ...])",
				inputValue: function(){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						return;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						return;
					}
					
					var git = layer.get("git");
					var features = that.editTool.selected;
					if(!features.getLength()){
						return;
					}
					
					var feature = features.item(0);
					var coords, str = "";
					if(feature instanceof ol.Feature){
						coords = feature.getGeometry().getCoordinates().toString().split(",");
						for(var i = 0; i < coords.length; i = i + 2){
							if(str !== ""){
								str += ",";
							}
							str += "[" + coords[i] + "," + coords[i+1] + "]";
						}
						return str;
					}
					return;
				},
				paramKey: "coordinates",
				before: function(value){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					var git = layer.get("git");
					var features = that.editTool.selected;
					if(!features.getLength()){
						this.beforeFailLog = "You must select feature";
						return false;
					}
					
					var feature = features.item(0);
					var coords, str = "";
					if(feature instanceof ol.Feature){
						return true;
					} else {
						this.beforeFailLog = "You must select feature";
						return false;
					}
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var layers = that.jstree.getJSTree().get_selected_layer();
					var insertCoords = params.coordinates;
					var coords = insertCoords.replace(/[[\]\s]/g, '').split(",");
					var layer, type, geometry, prevCoord, features, feature, git, source;
					
					if(coords.length === 0 || coords.length % 2 !== 0){
						this.failLog = "Wrong Coordinates";
						return false;
					}
					if(layers.length === 1){
						layer = layers[0];
						git = layer.get("git");
						if(!(git instanceof Object)){
							this.failLog = "The layer has not 'git' property";
							return false;
						}
						
						features = that.editTool.selected;
						feature = features.item(0);
						type = git.geometry;
						geometry = feature.getGeometry();
						prevCoord = geometry.getCoordinates();
						
						switch(type){
							case "Point":
								if(!regexCoordinate(coords[0]) || !regexCoordinate(coords[1]) || coords.length < 2){
									this.failLog = "Wrong Coordinates";
									return false;
								}
								geometry.setCoordinates([parseFloat(coords[0]), parseFloat(coords[1])]);
								break;
							case "LineString":
								var lineCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 4){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									lineCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry.setCoordinates(lineCoord);
								break;
							case "Polygon":
								var polyCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 6){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									polyCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry.setCoordinates([polyCoord]);
								break;
							case "MultiPoint":
								if(!regexCoordinate(coords[0]) || !regexCoordinate(coords[1]) || coords.length < 2){
									this.failLog = "Wrong Coordinates";
									return false;
								}
								geometry.setCoordinates([[parseFloat(coords[0]), parseFloat(coords[1])]]);
								break;
							case "MultiLineString":
								var lineCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 4){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									lineCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry.setCoordinates([lineCoord]);
								break;
							case "MultiPolygon":
								var polyCoord = [];
								for(var i = 0; i < coords.length; i = i + 2){
									if(!regexCoordinate(coords[i]) || !regexCoordinate(coords[i+1]) || coords.length < 6){
										this.failLog = "Wrong Coordinates";
										return false;
									}
									polyCoord.push([parseFloat(coords[i]), parseFloat(coords[i+1])]);
								}
								geometry.setCoordinates([[polyCoord]]);
								break;
						}
						
						gb.undo.pushAction({
							undo: function(data){
								var geom = data.feature.getGeometry();
								geom.setCoordinates(data.prevCoord);
								data.feature.setGeometry(geom);
								data.edit.featureRecord.update(data.layer, data.feature);
							},
							redo: function(data){
								var geom = data.feature.getGeometry();
								geom.setCoordinates(data.newCoord);
								data.feature.setGeometry(geom);
								data.edit.featureRecord.update(data.layer, data.feature);
							},
							data: {
								edit: that.editTool,
								layer: layer,
								feature: feature,
								prevCoord: prevCoord,
								newCoord: feature.getGeometry().getCoordinates()
							}
						});
						
						return true;
					} else {
						return false;
					}
				},
				successLog: "Modify Feature success!",
				failLog: "Wrong Coordinates"
			},
			scaleFeature: {
				tip: "Enter magnification (ex. [x magnification, y magnification])",
				paramKey: "magni",
				before: function(value){
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					var git = layer.get("git");
					var features = that.editTool.selected;
					if(!features.getLength()){
						this.beforeFailLog = "You must select feature";
						return false;
					}
					
					var feature = features.item(0);
					if(feature instanceof ol.Feature){
						return true;
					} else {
						this.beforeFailLog = "You must select feature";
						return false;
					}
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var magni = params.magni;
					var magniArr = magni.replace(/[[\]\s]/g, '').split(",");
					var feature = that.editTool.selected.item(0);
					
					if(!(feature instanceof ol.Feature)){
						return false;
					}
					
					if(magniArr.length !== 2){
						this.failLog = "Wrong value. ex) [2.5, 1.5]";
						return false;
					}
					
					if(!/^[0-9]*\.?[0-9]+$/.test(magniArr[0]) || !/^[0-9]*\.?[0-9]+$/.test(magniArr[1])){
						this.failLog = "You must enter rational number";
						return false;
					}
					
					var geometry, prevCoord, extent, x, y;
					
					geometry = feature.getGeometry();
					prevCoord = geometry.getCoordinates();
					extent = geometry.getExtent();
					x = extent[0] + (extent[2] - extent[0]) / 2;
					y = extent[1] + (extent[3] - extent[1]) / 2;
					geometry.scale(magniArr[0], magniArr[1], [x, y]);
					
					gb.undo.pushAction({
						undo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.prevCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						redo: function(data){
							var geom = data.feature.getGeometry();
							geom.setCoordinates(data.newCoord);
							data.feature.setGeometry(geom);
							data.edit.featureRecord.update(data.layer, data.feature);
						},
						data: {
							edit: that.editTool,
							layer: that.jstree.getJSTree().get_selected_layer()[0],
							feature: feature,
							prevCoord: prevCoord,
							newCoord: feature.getGeometry().getCoordinates()
						}
					});
					
					return true;
				},
				successLog: "Scale Feature success!",
				failLog: "Scale Feature fail!"
			},
			removeFeature: {
				tip: "Are you sure remove this feature?(y/n)",
				before: function(value){
					if(value !== "y"){
						that.resetAll();
						return false;
					}
					
					var layers = that.jstree.getJSTree().get_selected_layer();
					if(layers.length !== 1){
						this.beforeFailLog = "You must select only one layer";
						return false;
					}
					
					var layer = layers[0];
					if(!(layer instanceof ol.layer.Vector)){
						this.beforeFailLog = "You must select only vector type layer";
						return false;
					}
					
					var features = that.editTool.selected;
					if(!features.getLength()){
						this.beforeFailLog = "You must select feature";
						return false;
					}
					
					var feature = features.item(0);
					if(feature instanceof ol.Feature){
						return true;
					} else {
						this.beforeFailLog = "You must select feature";
						return false;
					}
				},
				beforeFailLog: "You must select only one layer",
				end: function(params){
					var layer = that.jstree.getJSTree().get_selected_layer()[0];
					var source = layer.getSource();
					var feature = that.editTool.selected.item(0);
					
					var fill = new ol.style.Fill({
						color : "rgba(255,0,0,0.01)"
					});

					var stroke = new ol.style.Stroke({
						color : "rgba(255,0,0,0.7)",
						width : 1.25
					});

					var text = new ol.style.Text({});
					var style = new ol.style.Style({
						image : new ol.style.Circle({
							fill : fill,
							stroke : stroke,
							radius : 5
						}),
						fill : undefined,
						stroke : undefined
					});
					
					if (feature.getId().search(".new") !== -1) {
						source.removeFeature(feature);
					} else {
						feature.setStyle(style);
					}
					that.editTool.featureRecord.remove(source.get("git").tempLayer, feature);
					
					gb.undo.pushAction({
						undo: function(data){
							var feature;
							var id = data.feature.getId();
							if (id.search(".new") !== -1) {
								data.source.addFeature(data.feature);
							} else {
								feature = data.source.getFeatureById(id);
								feature.setStyle(data.defaultStyle);
							}
							data.edit.featureRecord.deleteFeatureRemoved(data.source.get("git").tempLayer.get("id"), data.feature.getId());
						},
						redo: function(data){
							var feature;
							var id = data.feature.getId();
							if (id.search(".new") !== -1) {
								data.source.removeFeature(data.feature);
							} else {
								feature = data.source.getFeatureById(id);
								feature.setStyle(data.removeStyle);
							}
							data.edit.featureRecord.remove(data.source.get("git").tempLayer, data.feature);
						},
						data: {
							edit: that.editTool,
							source: source,
							feature: feature,
							defaultStyle: source.get("git").tempLayer.getStyle(),
							removeStyle: style
						}
					});
					
					return true;
				},
				successLog: "Remove Feature success!",
				failLog: "Remove Feature fail!"
			}
		}
		
		/**
		 * command 리스트에서의 현재 작업 위치
		 * @type {Object}
		 * @private
		 */
		this.currentCmd = this.commandList_;
		
		/**
		 * command layout css style
		 * @type {Object}
		 * @private
		 */
		this.elementStyle_ = {
			content: {
				"width": "100%",
				"color": "white",
				"display": "inline-flex"
			},
			commandWrapper: {
				"width": "100%",
				"height": "100%"
			},
			logHistoryWrapper: {
				"width": "100%",
				"height": "80%",
				"display": "inline-flex"
			},
			history: {
				"width": "50%",
				"height": "100%",
				"border-top-left-radius": "10px",
				"border-top-right-radius": "10px",
				"display": "flex",
				"flex-direction": "column",
				"box-shadow": "rgba(0, 0, 0, 0.5) 0px 0px 20px",
				"background-color": "rgba(75, 90, 106, 0.8)"
			},
			historyTitle: {
				"flex": "0 0 auto",
				"padding": "8px 16px",
				"border-bottom": "0.5px solid rgba(255,255,255,.4)"
			},
			historyFunction: {
				"display": "inline-block",
				"float": "right"
			},
			historyContent: {
				"flex": "1 1 auto",
				"overflow": "auto"
			},
			log: {
				"width": "50%",
				"height": "100%",
				"border-top-left-radius": "10px",
				"border-top-right-radius": "10px",
				"display": "flex",
				"flex-direction": "column",
				"box-shadow": "rgba(0, 0, 0, 0.5) 0px 0px 20px",
				"background-color": "rgba(75, 90, 106, 0.8)"
			},
			logTitle: {
				"flex": "0 0 auto",
				"padding": "8px 16px",
				"border-bottom": "0.5px solid rgba(255,255,255,.4)"
			},
			logContent: {
				"flex": "1 1 auto",
				"overflow": "auto",
			},
			lineWrapper: {
				"width": "100%",
				"height": "20%",
				"border-top": "1px solid #838383",
				"display": "flex",
				"position": "relative"
			},
			label: {
				"background-color": "rgba(0, 181, 173, .6)",
				"padding": ".5833em .833em",
				"flex": "0 0 auto"
			},
			line: {
				"padding": ".67857143em 1em",
				"border": "none",
				"color": "rgba(0, 0, 0, .87)",
				"flex": "1 0 auto"
			},
			item: {
				"padding": "0px 16px"
			}
		}
		
		// 명령어 Layout 생성
		this.createContent();
		
		// input Tag 자동완성 기능적용
		this.autocomplete();
		
		this.footerTag.on("footeropen", function(){
			var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
			if(isEdit instanceof Object){
				if(!isEdit.get()){
					that.close();
					alert("편집기능 활성화 중에만 실행가능한 작업입니다.");
					return
				}
			}
		});
	}
	// gb.footer.FooterBase 상속
	gb.edit.CommandLine.prototype = Object.create(gb.footer.FooterBase.prototype);
	gb.edit.CommandLine.prototype.constructor = gb.edit.CommandLine;
	
	/**
	 * command layout안에 내용 element를 생성한다.
	 * @method gb.edit.CommandLine#createContent
	 * @function
	 */
	gb.edit.CommandLine.prototype.createContent = function(){
		var that = this;
		
		this.contentTag.empty();
//		this.adjustStyle_(this.contentTag, this.elementStyle_.content);
		
		var commandWrapper = $("<div>").addClass("gb-commandline-wrapper-cmd");
//		this.adjustStyle_(commandWrapper, this.elementStyle_.commandWrapper);
		
		var logHistoryWrapper = $("<div>").addClass("gb-commandline-wrapper-log");
//		this.adjustStyle_(logHistoryWrapper, this.elementStyle_.logHistoryWrapper);
		
		var history = $("<div>").addClass("gb-commandline-history");
//		this.adjustStyle_(history, this.elementStyle_.history);
		
		var historyTitle = $("<div>").addClass("gb-commandline-history-title");
//		this.adjustStyle_(historyTitle, this.elementStyle_.historyTitle);
		historyTitle.text(this.translation.history[this.locale]);
		
		var historyFunction = $("<div>").addClass("gb-commandline-history-function");
//		this.adjustStyle_(historyFunction, this.elementStyle_.historyFunction);
		
		this.historyContent = $("<div>").addClass("gb-commandline-history-content");
//		this.adjustStyle_(this.historyContent, this.elementStyle_.historyContent);
		
		var log = $("<div>").addClass("gb-commandline-log");
//		this.adjustStyle_(log, this.elementStyle_.log);
		
		var logTitle = $("<div>").addClass("gb-commandline-log-title");
//		this.adjustStyle_(logTitle, this.elementStyle_.logTitle);
		logTitle.text(this.translation.log[this.locale]);
		
		this.logContent = $("<div>").addClass("gb-commandline-log-content");
//		this.adjustStyle_(this.logContent, this.elementStyle_.logContent);
		
		var lineWrapper = $("<div>").addClass("gb-commandline-wrapper-line");
//		this.adjustStyle_(lineWrapper, this.elementStyle_.lineWrapper);
		
		this.label = $("<div>").addClass("gb-commandline-label");
		this.setLabel();
//		this.adjustStyle_(this.label, this.elementStyle_.label);
		
		var line = this.input = $("<input id='commandInput' placeholder='" + this.translation.commandLine[this.locale] + "'>").addClass("gb-commandline-line");
//		this.adjustStyle_(line, this.elementStyle_.line);
		line.keypress(function(e){
			if(e.which === 13){
				that.executeCommand(this.value);
			}
		});
		
		// 파일 선택 input
		var fileSelect = 
			$("<input type='file' multiple size='50'>")
				.change(function(){
					that.uploadHistory(this);
					$(this).val("");
				});
		// upload 버튼 추가
		historyFunction.append(
			$("<i>")
				.addClass("fas fa-upload")
				.mouseenter(function(){
					$(this).css("cursor", "pointer");
					$(this).addClass("fa-lg");
				})
				.mouseleave(function(){
					$(this).removeClass("fa-lg");
				})
				.click(function(){
					fileSelect.click();
				})
				.css({"margin-right": "10px"}));
		// download 버튼 추가
		historyFunction.append(
			$("<i>")
				.mouseenter(function(){
					$(this).css("cursor", "pointer");
					$(this).addClass("fa-lg");
				})
				.mouseleave(function(){
					$(this).removeClass("fa-lg");
				})
				.click(function(){
					that.downHistory();
				})
				.addClass("fas fa-download")
				.css({"margin-right": "10px"}));
		// clear 버튼 추가
		historyFunction.append(
			$("<i>")
				.mouseenter(function(){
					$(this).css("cursor", "pointer");
					$(this).addClass("fa-lg");
				})
				.mouseleave(function(){
					$(this).removeClass("fa-lg");
				})
				.click(function(){
					that.emptyHistoryLayout();
					that.emptyLogLayout();
					that.resetWorkHistory();
				})
				.addClass("fas fa-eraser"));
		historyTitle.append(historyFunction);
		
		history.append(historyTitle);
		history.append(this.historyContent);
		
		log.append(logTitle);
		log.append(this.logContent);
		
		logHistoryWrapper.append(history);
		logHistoryWrapper.append(log);
		
		lineWrapper.append(this.label);
		lineWrapper.append(line);
		
		commandWrapper.append(logHistoryWrapper);
		commandWrapper.append(lineWrapper);
		
		this.contentTag.append(commandWrapper);
	}
	
	/**
	 * 명령어 입력 도움글 설정
	 * @method gb.edit.CommandLine#setLabel
	 * @function
	 * @param {string} label 명령어 입력 도움글
	 */
	gb.edit.CommandLine.prototype.setLabel = function(label){
		if(typeof label === "string"){
			this.label.text(label);
		} else if(!label){
			this.label.text(">_");
		}
	}
	
	/**
	 * input에 입력된 모든 값을 저장한 변수를 초기화한다.
	 * @method gb.edit.CommandLine#resetParams
	 * @function
	 */
	gb.edit.CommandLine.prototype.resetParams = function(){
		for(var i in this.params_){
			delete this.params_[i];
		}
	}
	
	/**
	 * 값을 Key, Value 형태로 저장
	 * @method gb.edit.CommandLine#pushParam
	 * @function
	 * @param {string} value - 저장할 값
	 * @return {number}
	 */
	gb.edit.CommandLine.prototype.pushParam = function(value){
		var num = 0;
		var index = [];
		for(var i in this.params_){
			index.push(i);
		}
		while(index.includes(num)){
			num++;
		}
		this.params_[num] = value;
		return num;
	}
	
	/**
	 * 작업 이력을 저장
	 * @method gb.edit.CommandLine#pushWorkHistory
	 * @function
	 * @param {Array.<string>} list - input에 입력된 값들의 배열
	 */
	gb.edit.CommandLine.prototype.pushWorkHistory = function(list){
		var time = getTime();
		var features = this.editTool.selected;
		var feature = undefined;
		if(features.getLength() !== 0){
			feature = features.item(0);
		}
		
		if($.isArray(list)){
			if(feature instanceof ol.Feature){
				list.unshift(feature.getId());
			}
			this.workHistory_[time.flat] = list.slice();
			this.insertHistoryLayout(time.format, list);
		}
	}
	
	/**
	 * 작업 이력을 초기화한다. 모든 명령어 작업을 삭제.
	 * @method gb.edit.CommandLine#resetWorkHistory
	 * @function
	 */
	gb.edit.CommandLine.prototype.resetWorkHistory = function(){
		this.workHistory_ = {};
	}
	
	/**
	 * 작업 이력 다운로드. 텍스트형식으로 저장
	 * @method gb.edit.CommandLine#downHistory
	 * @function
	 */
	gb.edit.CommandLine.prototype.downHistory = function(){
		var text = "";
		for(var i in this.workHistory_){
			for(var j = 0; j < this.workHistory_[i].length; j++){
				text += this.workHistory_[i][j];
				if(j !== (this.workHistory_[i].length - 1)){
					text += ">";
				}
			}
			text += "\n";
		}
		var file = new Blob([text], {type: "text/plain"});
		var down = document.createElement("a");
		down.setAttribute("href", URL.createObjectURL(file));
		down.setAttribute("download", "history.txt");
		down.click();
	}
	
	/**
	 * 작업 이력 업로드. 자동으로 이력 내용을 실행함.
	 * @method gb.edit.CommandLine#uploadHistory
	 * @function
	 * @param {HTMLElement} input - 파일을 포함하고 있는 HTMLElement 객체
	 */
	gb.edit.CommandLine.prototype.uploadHistory = function(input){
		var that = this;
		
		var layers = this.jstree.getJSTree().get_selected_layer();
		if(layers.length !== 1){
			this.insertLogLayout("You must select only one layer");
			return false;
		}
		
		var layer = layers[0];
		if(!(layer instanceof ol.layer.Vector)){
			this.insertLogLayout("You must select only vector type layer");
			return false;
		}
		
		if("files" in input){
			var files = input.files;
			var r = new FileReader();
			
			r.onloadend = function(e){
				if(e.target.readyState === FileReader.DONE){
					that.parseCmdText(e.target.result);
				}
			}
			
			for(var i = 0; i < files.length; i++){
				r.readAsText(files[i]);
			}
		}
	}
	
	/**
	 * 명령어 이력을 파싱하여 적절한 명령어를 실행한다. \n 으로 작업단위를 구분한다.
	 * @method gb.edit.CommandLine#parseCmdText
	 * @function
	 * @param {string} text - 명령어 이력
	 */
	gb.edit.CommandLine.prototype.parseCmdText = function(text){
		var lines, cmds, features, arr;
		
		var layers = this.jstree.getJSTree().get_selected_layer();
		var layer = layers[0];
		var source = layer.getSource();
		
		if(typeof text === "string"){
			lines = text.split("\n").slice();
			for(var i = 0; i < lines.length; i++){
				if(!!lines[i].trim()){
					cmds = lines[i].split(">");
					
					// createFeature 명령어가 아니면 제일 처음 입력값이 featureID임. Feature 검색 후 명령어 실행
					if(cmds[0] !== "createFeature"){
						features = this.editTool.selected;
						if(source.getFeatureById(cmds[0]) !== null){
							features.clear();
							features.push(source.getFeatureById(cmds[0]));
							cmds.splice(0, 1);
						} else {
							continue;
						}
					}
					
					for(var j = 0; j < cmds.length; j++){
						this.executeCommand(cmds[j].trim());
					}
				}
			}
		}
	}
	
	/**
	 * 이력 Layout에 배열값을 순서대로 표시한다.
	 * @method gb.edit.CommandLine#insertHistoryLayout
	 * @function
	 * @param {string} time - 표시할 시간
	 * @param {Array.<string>} list - Layout에 표시할 값들의 배열
	 */
	gb.edit.CommandLine.prototype.insertHistoryLayout = function(time, list){
		if($.isArray(list)){
			var item = $("<div class='gb-commandline-item'>");
//			this.adjustStyle_(item, this.elementStyle_.item);
			item.text(time + " " + list.join(" > "));
			this.historyContent.append(item);
			this.historyContent.scrollTop(this.historyContent[0].scrollHeight)
		}
	}
	
	/**
	 * 이력 Layout 내용을 초기화한다.
	 * @method gb.edit.CommandLine#emptyHistoryLayout
	 * @function
	 */
	gb.edit.CommandLine.prototype.emptyHistoryLayout = function(){
		this.historyContent.empty();
	}
	
	/**
	 * Log Layout에 입력값을 표시한다.
	 * @method gb.edit.CommandLine#insertLogLayout
	 * @function
	 * @param {string} text - 표시할 값
	 */
	gb.edit.CommandLine.prototype.insertLogLayout = function(text){
		if(typeof text === "string"){
			var item = $("<div class='gb-commandline-item'>");
//			this.adjustStyle_(item, this.elementStyle_.item);
			item.text(text);
			this.logContent.append(item);
			this.logContent.scrollTop(this.logContent[0].scrollHeight)
		}
	}
	
	/**
	 * Log Layout 내용을 초기화한다.
	 * @method gb.edit.CommandLine#emptyLogLayout
	 * @function
	 */
	gb.edit.CommandLine.prototype.emptyLogLayout = function(){
		this.logContent.empty();
	}
	
	/**
	 * 입력한 값에 따라 적절한 명령어를 실행한다. 저장되어있는 명령어 리스트에 따라 실행된다.
	 * @method gb.edit.CommandLine#executeCommand
	 * @function
	 * @param {string} value - 명령어를 실행하기 위한 값
	 */
	gb.edit.CommandLine.prototype.executeCommand = function(value){
		if(!!value){
			if(!!this.currentCmd[value]){
				this.insertLogLayout(this.currentCmd.log);
				
				// input창 값 입력
				if(this.currentCmd[value].inputValue instanceof String){
					this.input.val(this.currentCmd[value].inputValue);
				} else if(this.currentCmd[value].inputValue instanceof Function){
					this.input.val(this.currentCmd[value].inputValue());
				} else {
					this.input.val("");
				}
				
				// 명령어 힌트 라벨창에 표시
				if(!!this.currentCmd[value].tip){
					// tip option이 존재하면 라벨창에 tip 가시화
					this.setLabel(this.currentCmd[value].tip);
					this.inputHistory_.push(value);
					this.insertLogLayout(this.currentCmd[value].log);
					// 명령어를 다음 단계로 이동
					this.currentCmd = this.currentCmd[value];
				} else if(!!this.currentCmd[value].end){
					// end function이 존재하면 실행 후 모든 변수를 초기화
					if(this.currentCmd[value].end(this.params_) === false){
						this.insertLogLayout(this.currentCmd[value].failLog);
						return;
					} else {
						this.insertLogLayout(this.currentCmd[value].successLog);
					}
					this.inputHistory_.push(value);
					this.pushWorkHistory(this.inputHistory_);
					this.insertLogLayout(this.currentCmd[value].log);
					this.resetAll();
				}
				
			} else if(!!this.currentCmd.end){
				// 현재 명령 위치에 end function이 존재할 때 실행부분
				if(!!this.currentCmd.before){
					// 현재 명령 위치에 before function이 존재할 때 실행
					if(!this.currentCmd.before(value)){
						// before function 실행 실패 시
						this.insertLogLayout(this.currentCmd.beforeFailLog);
						return;
					} else {
						// before function 실행 성공
						this.insertLogLayout(this.currentCmd.beforeSuccesslog);
					}
				}
				
				if(!!this.currentCmd.paramKey){
					// end function 실행을 위한 파라미터값에 key값이 필요할 때
					this.params_[this.currentCmd.paramKey] = value;
				} else {
					// end function 실행을 위한 파라미터값에 key값이 필요하지않을 때
					this.pushParam(value);
				}
				
				// end function 실행
				if(this.currentCmd.end(this.params_) === false){
					this.insertLogLayout(this.currentCmd.failLog);
					return;
				} else {
					this.insertLogLayout(this.currentCmd.successLog);
				}
				
				this.inputHistory_.push(value);
				this.pushWorkHistory(this.inputHistory_);
				this.resetAll();
//				this.insertLogLayout(this.currentCmd.log);
				
			} else if(!!this.currentCmd.next){
				// 현재 명령 위치에 next 객체가 존재할 시 실행
				if(!!this.currentCmd.before){
					// before function이 존재할 시 실행
					if(!this.currentCmd.before(value)){
						// before function 실행 실패 시 다음 명령으로 이동하지않음
						this.insertLogLayout(this.currentCmd.beforeFailLog);
						return;
					} else {
						// before function 실행 성공
						this.insertLogLayout(this.currentCmd.beforeSuccesslog);
					}
				}
				
				this.setLabel(this.currentCmd.next.tip);
				
				// input창 값 입력
				if(this.currentCmd.next.inputValue instanceof String){
					this.input.val(this.currentCmd.next.inputValue);
				} else if(this.currentCmd.next.inputValue instanceof Function){
					this.input.val(this.currentCmd.next.inputValue());
				} else {
					this.input.val("");
				}
				
				if(!!this.currentCmd.paramKey){
					// 다음 명령 실행을 위한 파라미터값에 key값이 필요할 때
					this.params_[this.currentCmd.paramKey] = value;
				} else {
					// 다음 명령 실행을 위한 파라미터값에 key값이 필요하지않을 때
					this.pushParam(value);
				}
				
				this.inputHistory_.push(value);
//				this.insertLogLayout(this.currentCmd.log);
				this.currentCmd = this.currentCmd.next;
			} else {
				this.insertLogLayout(value + " is not command");
			}
		} else {
			this.resetAll();
		}
	}
	
	/**
	 * 임시적으로 값을 저장한 모든 변수들을 초기화한다.
	 * @method gb.edit.CommandLine#resetAll
	 * @function
	 */
	gb.edit.CommandLine.prototype.resetAll = function(){
		this.resetCommand();
		this.setLabel();
		this.resetParams();
		this.input.val("");
		this.inputHistory_ = [];
	}
	
	/**
	 * 명령어 단계를 다시 초기단계로 되돌린다.(명령어 작업을 선택하는 단계)
	 * @method gb.edit.CommandLine#resetCommand
	 * @function
	 */
	gb.edit.CommandLine.prototype.resetCommand = function(){
		this.currentCmd = this.commandList_;
	}
	
	/**
	 * 커스텀 명령어를 추가한다.
	 * @method gb.edit.CommandLine#addCommand
	 * @function
	 * @param {string} cmdName - 명령어 시작 이름
	 * @param {Object} cmdCallback - 명령어 작업 실행 단계
	 */
	gb.edit.CommandLine.prototype.addCommand = function(cmdName, cmdCallback){
		if(!this.commandList[cmdName]){
			this.commandList[cmdName] = cmdCallback;
		}
	}
	
	/**
	 * 현재 저장되어있는 모든 명령어의 작업 이름을 반환한다.
	 * @method gb.edit.CommandLine#getCommandList
	 * @function
	 * @return {Array.<string>}
	 */
	gb.edit.CommandLine.prototype.getCommandList = function(){
		var a = [];
		for(name in this.commandList_){
			a.push(name);
		}
		return a;
	}
	
	/**
	 * VectorLayer를 생성하여 olMap 객체에 추가한다. 성공시 True 반환.
	 * @method createVectorLayer
	 * @function
	 * @param {ol.Map} map - ol Map 객체
	 * @param {string} name - VectorLayer의 이름
	 * @param {string} type - VectorLayer의 Geometry 타입
	 * @return {boolean}
	 * @private
	 */
	function createVectorLayer(map, name, type){
		var vectorLayer = new ol.layer.Vector({
			renderMode : "image",
			source: new ol.source.Vector()
		});
		var gitLayer = {
			"editable" : true,
			"geometry" : type,
			"validation" : false,
			"attribute" : []
		};
		vectorLayer.set("git", gitLayer);
		vectorLayer.set("name", name);
		map.addLayer(vectorLayer);
		return true;
	}
	
	/**
	 * 레이어의 Feature들을 확인하여 유일한 Feature ID값을 생성한다.
	 * @method createFeatureId
	 * @function
	 * @param {ol.layer.Base} layer - ol layer 객체
	 * @param {gb.edit.EditingTool} epan - gb EditingTool 객체
	 * @return {string} Feature 아이디
	 * @private
	 */
	function createFeatureId(layer, epan){
		if(!epan){
			return "null";
		}
		var a = epan.featureRecord.getCreated();
		var b = a[layer.get("id")];
		var fid;
		if(!b){
			fid = layer.get("id") + ".new0";
		} else {
			var keys = Object.Keys(b);
			var count;
			if(keys.length === 0){
				count = 0;
			} else {
				var id = keys[keys.length - 1];
				var nposit = (id.search(".new")) + 4;
				count = (parseInt(id.substr(nposit, id.length)) + 1);
			}
			fid = layer.get("id") + ".new" + count;
		}
		return fid;
	}
	
	/**
	 * Geoserver로부터 Feature정보를 불러온다. 사용하지않음.
	 * @method getFeatureByServer
	 * @function
	 * @param {string} workId - workspace ID
	 * @param {string} layerId - layer ID
	 * @param {string} featureId - feature ID
	 * @return {ol.source.Vector}
	 * @private
	 */
	function getFeatureByServer(workId, layerId, featureId){
		var params = {
			"service" : "WFS",
			"version" : gb.module.serviceVersion.WFS,
			"request" : "GetFeature",
			"typeName" : layerId,
			"outputformat" : "text/javascript",
			"featureID" : featureId,
			"format_options" : "callback:getJson"
		};
		var feature;
		var url = this.serverURL;
		$.ajax({
			url : url,
			data : params,
			async: false,
			dataType : 'jsonp',
			jsonpCallback : 'getJson',
			success : function(data) {
				feature = new ol.format.GeoJSON().readFeature(JSON.stringify(data.features[0]));
			}
		});
		
		var vectorSource = new ol.source.Vector({
			format: new ol.format.GeoJSON(),
			url: function(extent){
				var url = url + "version=1.0.0&request=GetFeature&typename=" + layerId + "&" +
				"outputFormat=text/javascript&bbox=" + extent.join(",");
			}
		});
		
		return vectorSource;
	}
	
	/**
	 * 좌표 형식 유효성을 검사한다.(실수)
	 * @method regexCoordinate
	 * @function
	 * @param {string} coord - 좌표값
	 * @return {boolean}
	 * @private
	 */
	function regexCoordinate(coord){
		if(typeof coord === "string"){
			return /^-?[0-9]*(?:\.[0-9]*)?$/g.test(coord.trim());
		} else {
			return false;
		}
	}
	
	/**
	 * 현재시간을 반환한다.
	 * @method getTime
	 * @function
	 * @return {string}
	 * @private
	 */
	function getTime(){
		var time = {};
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() < 9 ? "0" + ( date.getMonth() + 1 ) : ( date.getMonth() + 1 );
		var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
		var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
		var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
		var sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
			
		time.format = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
		time.flat = year + month + day + hour + min + sec;
		return time;
	}
	
	/**
	 * 명령어 자동 완성 기능 활성화
	 * @method gb.edit.CommandLine#autocomplete
	 * @function
	 */
	gb.edit.CommandLine.prototype.autocomplete = function(){
		var that = this;
		var except = ["tip", "paramKey", "before", "beforeFailLog", "log", "next", "end", "successLog", "failLog"];
		/*the autocomplete function takes two arguments,
		the text field element and an array of possible autocompleted values:*/
		var currentFocus;
		/*execute a function when someone writes in the text field:*/
		var inp = this.input[0];
		inp.setAttribute("autocomplete", "off");
		inp.addEventListener("input", function(e) {
			var a, b, i, val = this.value;
			// 명령어 목록 배열
			var arr = Object.keys(that.currentCmd);
			
			var labelWidth = this.parentNode.getElementsByClassName("gb-commandline-label")[0].clientWidth;
			/*close any already open lists of autocompleted values*/
			closeAllLists();
			if (!val) { return false;}
			currentFocus = -1;
			/*create a DIV element that will contain the items (values):*/
			a = document.createElement("DIV");
			a.setAttribute("id", this.id + "autocomplete-list");
			a.setAttribute("class", "autocomplete-items");
			a.style["position"] = "absolute";
			a.style["border"] = "1px solid #d4d4d4";
			a.style["border-bottom"] = "none";
			a.style["border-top"] = "none";
			a.style["z-index"] = "99";
			/*position the autocomplete items to be the same width as the container =*/
			a.style["bottom"] = "100%";
			a.style["left"] = labelWidth + "px";
			a.style["right"] = "auto";
			a.style["color"] = "rgba(0, 0, 0, 0.87)";
			/*append the DIV element as a child of the autocomplete container:*/
			this.parentNode.appendChild(a);
			/*for each item in the array...*/
			for (i = 0; i < arr.length; i++) {
				if(except.indexOf(arr[i]) !== -1){
					continue;
				}
				/*check if the item starts with the same letters as the text field value:*/
				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					/*create a DIV element for each matching element:*/
					b = document.createElement("DIV");
					/*make the matching letters bold:*/
					b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
					b.innerHTML += arr[i].substr(val.length);
					/*insert a input field that will hold the current array item's value:*/
					b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
					/*execute a function when someone clicks on the item value (DIV element):*/
					b.style["padding"] = "10px";
					b.style["cursor"] = "pointer";
					b.style["background-color"] = "#fff";
					b.style["border-bottom"] = "1px solid #d4d4d4";
					b.addEventListener("click", function(e) {
						/*insert the value for the autocomplete text field:*/
						inp.value = this.getElementsByTagName("input")[0].value;
						/*close the list of autocompleted values,
						(or any other open lists of autocompleted values:*/
						closeAllLists();
					});
					a.appendChild(b);
				}
			}
		});
		
		/*execute a function presses a key on the keyboard:*/
		inp.addEventListener("keydown", function(e) {
			var x = document.getElementById(this.id + "autocomplete-list");
			if (x) x = x.getElementsByTagName("div");
			if (e.keyCode == 40) {
				/*If the arrow DOWN key is pressed,
				increase the currentFocus variable:*/
				currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			} else if (e.keyCode == 38) { //up
				/*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
				currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			} else if (e.keyCode == 13) {
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				if (currentFocus > -1) {
					/*and simulate a click on the "active" item:*/
					if (x) x[currentFocus].click();
				}
			}
		});
		
		function addActive(x) {
			/*a function to classify an item as "active":*/
			if (!x) return false;
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
			/*add class "autocomplete-active":*/
			x[currentFocus].classList.add("autocomplete-active");
			x[currentFocus].style.backgroundColor = "DodgerBlue";
		}
		
		function removeActive(x) {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
				x[i].classList.remove("autocomplete-active");
				x[i].style.backgroundColor = "#fff";
			}
		}
		
		function closeAllLists(elmnt) {
			/*close all autocomplete lists in the document,
			except the one passed as an argument:*/
			var x = document.getElementsByClassName("autocomplete-items");
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != inp) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}
	}
}(jQuery));