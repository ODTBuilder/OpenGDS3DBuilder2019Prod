var gb;
if (!gb)
	gb = {};
if (!gb.layer)
	gb.layer = {};

(function($){
	
	/**
	 * @classdesc
	 * 이미지 레이어 추가 기능. 로컬에 있는 이미지 파일을 불러와 Openlayers Map에 이미지 레이어 객체로 추가한다.
	 * @class gb.layer.ImageLayer
	 * @memberof gb.layer
	 * @constructor
	 * @param {Object} obj - gb.layer.Navigator 생성 옵션
	 * @param {ol.Map} obj.map - 기능을 적용할 Openlayers Map 객체
	 * @param {string|number} obj.width - 이미지 넓이
	 * @param {string|number} obj.height - 이미지 높이
	 * @param {string} obj.url - 이미지 파일 URL
	 * @param {string} [obj.title="New Image"] - 이미지 제목
	 * @param {string} [obj.baseDiv=".bind > div:last-child"] - Image Layer 수정을 위한 메뉴바 생성 위치 jQuery 선택자
	 * @param {gb.tree.OpenLayers} [obj.jstree] - Openlayers JSTree 객체
	 * @author KIM HOCHUL
	 * @date 2019. 03. 26
	 * @version 0.01
	 */
	gb.layer.ImageLayer = function(obj) {
		var that = this;
		
		/**
		 * Image Layer
		 * @type {ol.layer.Image}
		 * @private
		 */
		this.imageLayer = undefined;
		
		/**
		 * pointer interaction
		 * image layer scale
		 * @type {gb.layer.Pointer}
		 * @private
		 */
		this.scaleInteraction = undefined;
		
		/**
		 * Translate Interaction
		 * @type {ol.interaction.Translate}
		 * @private
		 */
		this.translateInteraction = undefined;
		
		/**
		 * listener
		 * @type {Array.<ol.events.Event>}
		 * @private
		 */
		this.listener_ = [];
		
		/**
		 * 길이, 면적 측정 피쳐 생성을 위한 임시 vector source
		 * @type {ol.source.Vector}
		 * @private
		 */
		var source = new ol.source.Vector({wrapX: false});
		
		/**
		 * 길이, 면적 측정 피쳐 생성을 위한 임시 vector layer
		 * @type {ol.layer.Vector}
		 * @private
		 */
		this.vector = new ol.layer.Vector({
			source : source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0)'
				}),
				stroke: new ol.style.Stroke({
					color: 'rgba(255, 255, 255, 0)',
					width: 0
				})
			})
		});
		
		var options = obj;
		this.map = options.map || undefined;
		if(this.map === undefined){
			console.error("gb.layer.ImageLayer: 'map' is required field");
			return;
		}
		this.imageWidth = options.width || undefined;
		this.imageHeight = options.height || undefined;
		this.imageURL = options.url || undefined;
		var title = options.title || "New Image";
		this.baseDiv = options.baseDiv ? $(options.baseDiv) : $(".bind > div:last-child");
		this.jstree = options.jstree || undefined;
		
		this.vector.set("git", {
			"editable" : true,
			"geometry" : "Polygon",
			"validation" : false
		});
		
		this.vector.setMap(this.map);
		
		// R키 입력한 상태로 객체그리기를 종료할 시 이미지 비율에 맞게 Geometry가 생성됨
		var toggleKey = false;
		$(window).bind("keypress.imageDraw", function(e){
			if(e.keyCode === 114 || e.which === 114){
				toggleKey = !toggleKey;
			}
		});
		
		/**
		 * Image Layer 생성 영역 그리기 활성 시 실행되는 함수. 이미지 생성 영역을 정하기 위한 Geometry 객체를 생성한다.
		 * R키를 누른채로 그리면 이미지의 비율에 맞게 그려진 Geometry를 반환한다.
		 * @function geometryFunction
		 * @param {Array.<number>} coordinates - 마우스 커서 좌표
		 * @param {ol.geom.Geometry} geometry - Geometry 객체
		 * @private
		 */
		function geometryFunction(coordinates, geometry){
			var geometry = geometry;
			var coordinates = coordinates;
			
			if(toggleKey){
				var center = coordinates[0];
				var last = coordinates[1];
				var dx = Math.abs(center[0] - last[0]);
				var ratio = (that.imageHeight || 0) / (that.imageWidth || Infinity);
				var y = center[1] - dx*ratio;
				var newCoordinates = [[[center[0], center[1]], [last[0], center[1]], [last[0], y], [center[0], y], [center[0], center[1]]]];
				
				if(geometry){
					geometry.setCoordinates(newCoordinates);
				} else {
					geometry = new ol.geom.Polygon(newCoordinates);
				}
			} else {
				geometry = ol.interaction.Draw.createBox()(coordinates, geometry);
			}
			return geometry;
		}
		
		ol.interaction.Draw.call(this, {
			type: "Circle",
			geometryFunction: geometryFunction,
			source: source
		});
		
		var listener;
		var startEvent = this.on("drawstart", function(evt){
			that.vector.setMap(that.getMap());
		});
		this.listener_.push(startEvent);
		
		var endEvent = this.on("drawend", function(evt){
			var feature = evt.feature;
			var geom = feature.getGeometry();
			var extent = geom.getExtent();
			var x = extent[0] + (extent[2] - extent[0]) / 2;
			var y = extent[1] + (extent[3] - extent[1]) / 2;
			
			centerCoord = [x, y];
			
			var projection = new ol.proj.Projection({
				code: 'xkcd-image',
				units: 'pixels',
				extent: extent
			});
			
			this.imageLayer = new ol.layer.Image({
				source: new ol.source.ImageStatic({
					url: that.imageURL,
					imageSize: [that.imageWidth, that.imageHeight],
					projection: projection,
					imageExtent: extent
				}),
				opacity: 1
			});
			
			this.imageLayer.set("name", title);
			this.imageLayer.set("vectorLayer", that.vector);
			this.imageLayer.set("select", this);
			that.map.addLayer(this.imageLayer);
			
			that.map.removeInteraction(that);
			
			this.imageLayer.on("change", function(e){
				console.log(e);
			});
			
			ol.Observable.unByKey(listener);
			$(window).unbind("keypress.imageDraw");
		});
		this.listener_.push(endEvent);
		
		this.map.addInteraction(this);
		
		if(this.jstree !== undefined){
			this.jstree.element.on("delete_node_layer.jstreeol3", function(e, data){
				that.vector.setMap(null)
				that.deActiveEdit();
				that.removeMenuBar();
			});
		}
	}
	
	ol.inherits(gb.layer.ImageLayer, ol.interaction.Draw);
	ol.interaction.Draw.prototype.selectedType = function(){
		return this.type_;
	}
	
	/**
	 * 이미지 레이어 편집 메뉴바를 생성한다. 설정한 엘리먼트의 왼쪽 상단에 표시된다.
	 * @function gb.layer.ImageLayer#createMenuBar
	 * @param {HTMLElement} target - 메뉴바를 생성할 element
	 */
	gb.layer.ImageLayer.prototype.createMenuBar = function(target){
		if($.find("#imageLayerMenu").length !== 0){
			this.removeMenuBar();
			return;
		}
		
		var that = this;
		var icon1 = $("<i class='fas fa-vector-square fa-lg'>");
		var item1 = $("<div>").append(icon1).css({
			"text-align": "center",
			"padding": "5px 0",
		}).hover(
			function(){
				$(this).css({
					"cursor": "pointer"
				});
			}, function(){
				$(this).css({
					"cursor": "default"
				});
			}
		).click(function(){
			that.activeEdit("scale");
		});
		
		var icon2 = $("<i class='fas fa-arrows-alt fa-lg'>");
		var item2 = $("<div>").append(icon2).css({
			"text-align": "center",
			"padding": "5px 0",
		}).hover(
			function(){
				$(this).css({
					"cursor": "pointer"
				});
			}, function(){
				$(this).css({
					"cursor": "default"
				});
			}
		).click(function(){
			that.activeEdit("move");
		});
		
		var menu = $("<div id='imageLayerMenu'>").addClass("gb-imagelayer-menu").append(item1).append(item2);
		
		$(target).append(menu);
	}
	
	/**
	 * 이미지 레이어 편집 메뉴바를 제거한다.
	 * @function gb.layer.ImageLayer#removeMenuBar
	 */
	gb.layer.ImageLayer.prototype.removeMenuBar = function(){
		var features = this.vector.getSource().getFeatures();
		for(var i = 0; i < features.length; i++){
			features[i].setStyle([ new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0)'
				}),
				stroke : new ol.style.Stroke({
					color : 'rgba(255,0,0,0)',
					width : 0
				})
			})]);
		}
		if($.find("#imageLayerMenu").length !== 0){
			$("#imageLayerMenu").remove();
		}
		this.deActiveEdit();
	}
	
	/**
	 * 선택한 이미지 레이어 편집 기능을 활성화한다.
	 * @function gb.layer.ImageLayer#activeEdit
	 * @param {string} str - 편집 기능 종류("move", "scale")
	 */
	gb.layer.ImageLayer.prototype.activeEdit = function(str){
		var editName = str;
		
		this.deActiveEdit();
		
		if(editName === "move"){
			this.move();
		} else if(editName === "scale"){
			this.scale();
		}
	}
	
	/**
	 * 선택한 이미지 레이어 편집 기능을 비활성화한다.
	 * @function gb.layer.ImageLayer#deActiveEdit
	 * @param {string} str - 편집 기능 종류("move", "scale")
	 */
	gb.layer.ImageLayer.prototype.deActiveEdit = function(){
		var that = this;
		this.map.getInteractions().forEach(function(interaction) {
			if (interaction === that.scaleInteraction || interaction === that.translateInteraction ) {
				that.map.removeInteraction(interaction);
			}
		});
	}
	
	/**
	 * 이미지 레이어 move 기능을 활성화한다.
	 * @function gb.layer.ImageLayer#move
	 */
	gb.layer.ImageLayer.prototype.move = function(){
		var that = this;
		var features = this.vector.getSource().getFeatures();
		var collection = new ol.Collection();
		
		for(var i = 0; i < features.length; i++){
			features[i].setStyle([ new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke : new ol.style.Stroke({
					color : 'rgba(255,0,0,1)',
					width : 2
				})
			}), new ol.style.Style({
				image : new ol.style.Circle({
					radius : 10,
					stroke : new ol.style.Stroke({
						color : 'rgba(255,0,0,1)',
						width : 2
					})
				})
			})]);
			
			collection.push(features[i]);
		}
		
		this.map.getInteractions().forEach(function(interaction) {
			if (interaction instanceof ol.interaction.Translate) {
				that.map.removeInteraction(interaction);
			}
		});
		
		var move = new ol.interaction.Translate({
			features : collection
		});
		
		this.translateInteraction = move;
		
		move.setProperties({"imageLayer":this.imageLayer}, true);
		
		move.on("translating", function(evt) {
			var feature = evt.features.item(0);
			var geom = feature.getGeometry();
			var center = geom.getFlatInteriorPoint();
			
			this.getProperties().imageLayer.getSource().refresh();
			this.getMap().renderSync();
		});
		
		this.map.addInteraction(move);
	}
	
	/**
	 * 이미지 레이어 scale 기능을 활성화한다.
	 * @function gb.layer.ImageLayer#scale
	 */
	gb.layer.ImageLayer.prototype.scale = function(){
		var that = this;
		var features = this.vector.getSource().getFeatures();
		var collection = new ol.Collection();
		
		for(var i = 0; i < features.length; i++){
			features[i].setStyle([ new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.2)'
				}),
				stroke : new ol.style.Stroke({
					color : 'rgba(255,0,0,1)',
					width : 2
				})
			}), new ol.style.Style({
				image : new ol.style.Circle({
					radius : 10,
					stroke : new ol.style.Stroke({
						color : 'rgba(255,0,0,1)',
						width : 2
					})
				})
			})]);
			
			collection.push(features[i]);
		}
		
		this.map.getInteractions().forEach(function(interaction) {
			if (interaction instanceof gb.layer.Pointer) {
				that.map.removeInteraction(interaction);
			}
		});
		
		var scale = new gb.layer.Pointer({
			feature: features[0],
			imageLayer: this.imageLayer,
			map: this.map
		});
		
		this.scaleInteraction = scale;
		
		this.map.addInteraction(scale);
	}
	
	/**
	 * Pointer event type
	 * @enum {string}
	 */
	gb.layer.PointerEventType = {
		/**
		 * Triggered upon feature multiTransform start 
		 * @event gb.layer.Pointer#transformstart
		 * @type {string} 
		 * @api
		 */
		TRANSFORMSTART : 'transformstart',
		/**
		 * Triggered upon feature multiTransforming 
		 * @event gb.layer.Pointer#transforming
		 * @api
		 */
		TRANSFORMING : 'transforming',
		/**
		 * Triggered upon feature multiTransform end 
		 * @event gb.layer.Pointer#transformend
		 * @api
		 */
		TRANSFORMEND : 'transformend'
	};
	
	/**
	 * Image Layer의 Pointer 이벤트 객체를 생성한다. Image Layer 편집 기능 중 scale 기능을 위해 사용한다.
	 * 편집 실행 중 마우스 이벤트 4가지(down, drag, move, up)에 대해 정의한다.
	 * @class gb.layer.Pointer
	 * @memberof gb.layer
	 * @constructor
	 * @param {Object} opt_options - Pointer 이벤트 객체 생성자 옵션
	 * @param {ol.Map} opt_options.map - 기능을 적용할 Openlayers Map 객체
	 * @param {ol.layer.Image} opt_options.imageLayer - Pointer Event를 적용할 Image Layer 객체
	 * @param {ol.Feature} opt_options.feature - 마우스 이벤트를 적용시킬 feature
	 * @param {Object} opt_options - Pointer 이벤트 객체 생성자 옵션
	 */
	gb.layer.Pointer = function(opt_options){
		var that = this;
		
		ol.interaction.Pointer.call(this, {
			handleDownEvent : gb.layer.Pointer.prototype.handleDownEvent,
			handleDragEvent : gb.layer.Pointer.prototype.handleDragEvent,
			handleMoveEvent : gb.layer.Pointer.prototype.handleMoveEvent,
			handleUpEvent : gb.layer.Pointer.prototype.handleUpEvent
		});
		
		/**
		 * 현재 커서의 위치를 저장
		 * @type {Array.<number>}
		 * @private
		 */
		this.cursorCoordinate_ = null;

		/**
		 * 이전 커서의 위치를 저장
		 * @type {Array.<number>}
		 * @private
		 */
		this.prevCursor_ = null;
		
		/**
		 * rotate, scale 함수 parameter 값을 위한 feature의 중점좌표
		 * 
		 * @type {Array.<number>}
		 * @private
		 */
		this.flatInteriorPoint_ = null;
		
		var options = opt_options ? opt_options : {};
		this.map = options.map || undefined;
		this.imageLayer = options.imageLayer || undefined;
		this.feature_ = options.feature;
		
		this.map.on('postcompose', function(evt) {
			that.map.getInteractions().forEach(function(interaction) {
				if (interaction instanceof gb.layer.Pointer) {
					if (interaction.getActive()) {
						interaction.drawMbr(evt);
					}
				}
			});
		});
	}
	ol.inherits(gb.layer.Pointer, ol.interaction.Pointer);
	
	/**
	 * Mouse down 이벤트
	 * @method gb.layer.Pointer#handleDownEvent
	 * @param {ol.MapBrowserEvent} evt - 지도 브라우저 이벤트로 방출되는 이벤트 인스턴스
	 * @return {Boolean} true 반환시 drag squence 시작
	 */
	gb.layer.Pointer.prototype.handleDownEvent = function(evt) {
		var map = evt.map;
		var element = evt.map.getTargetElement();
		var geometry = this.feature_.getGeometry();
		var extent = geometry.getExtent();
		var x = extent[0] + (extent[2] - extent[0]) / 2;
		var y = extent[1] + (extent[3] - extent[1]) / 2;
		
		if(element.style.cursor === "nw-resize" || element.style.cursor === "ne-resize"){
			this.flatInteriorPoint_ = [ x, y ];
			centerCoord = [ x, y ];
			return true;
		}
		this.dispatchEvent(new gb.layer.Pointer.Event(gb.layer.PointerEventType.TRANSFORMSTART, this.feature_, evt));
		return false;
	};

	/**
	 * Mouse Drag 이벤트
	 * @method gb.layer.Pointer#handleDragEvent
	 * @param {ol.MapBrowserEvent} evt - 지도 브라우저 이벤트로 방출되는 이벤트 인스턴스
	 */
	gb.layer.Pointer.prototype.handleDragEvent = function(evt) {
		var cursorPoint = evt.coordinate;
		var magni = this.scaleAlgorithm_(this.feature_, cursorPoint);
		
		if (magni[0] > magni[1]) {
			this.feature_.getGeometry().scale(magni[0], magni[0], this.flatInteriorPoint_);
		} else {
			this.feature_.getGeometry().scale(magni[1], magni[1], this.flatInteriorPoint_);
		}
		
		this.imageLayer.getSource().refresh();
		this.getMap().renderSync();
		
		this.dispatchEvent(new gb.layer.Pointer.Event(gb.layer.PointerEventType.TRANSFORMING, this.feature_, evt));
	};

	/**
	 * Mouse Move 이벤트. drag 실행 중에는 실행되지 않는다.
	 * @method gb.layer.Pointer#handleMoveEvent
	 * @param {ol.MapBrowserEvent} evt - 지도 브라우저 이벤트로 방출되는 이벤트 인스턴스
	 */
	gb.layer.Pointer.prototype.handleMoveEvent = function(evt) {
		if (!evt.dragging) {
			var map = evt.map
			var element = evt.map.getTargetElement();
			var task = this.selectTask_(map, this.feature_, evt.pixel);
			
			if (!!task) {
				switch (task) {
				case 'scaleW':
					element.style.cursor = 'nw-resize';
					break;
				case 'scaleE':
					element.style.cursor = 'ne-resize';
					break;
				default:
					element.style.cursor = 'pointer';
				}
			} else {
				if (element.style.cursor !== '') {
					element.style.cursor = '';
				}
			}
			this.cursorCoordinate_ = evt.coordinate;
		}
	};

	/**
	 * Mouse Up 이벤트
	 * @method gb.layer.Pointer#handleUpEvent
	 * @param {ol.MapBrowserEvent} evt - 지도 브라우저 이벤트로 방출되는 이벤트 인스턴스
	 * @return {Boolean} false 반환시 drag squence 종료
	 */
	gb.layer.Pointer.prototype.handleUpEvent = function(evt) {
		var element = evt.map.getTargetElement();
		
		this.prevCursor_ = null;
		this.flatInteriorPoint = null;
		element.style.cursor = '';
		this.dispatchEvent(new gb.layer.Pointer.Event(gb.layer.PointerEventType.TRANSFORMEND, this.feature_, evt));
		return false;
	};
	
	/**
	 * @classdesc Events emitted by {@link gb.interaction.MultiTransform} instances
	 *            are instances of this type.
	 * @class gb.layer.Pointer.Event
	 * @memberof gb.layer.Pointer
	 * @constructor
	 * @extends {ol.events.Event}
	 * @param {ol.interaction.MultiTransformEventType}
	 *            type Type.
	 * @param {ol.Feature}
	 *            feature The feature modified.
	 * @param {ol.MapBrowserPointerEvent}
	 *            mapBrowserPointerEvent Associated
	 *            {@link ol.MapBrowserPointerEvent}.
	 */
	gb.layer.Pointer.Event = function(type, feature, mapBrowserPointerEvent) {
		//ol.events.Event.call(this, type);

		/**
		 * The features being modified.
		 * @type {ol.Feature}
		 * @private
		 */
		this.feature = feature;

		/**
		 * Associated {@link ol.MapBrowserEvent}.
		 * @type {ol.MapBrowserEvent}
		 * @private
		 */
		this.mapBrowserEvent = mapBrowserPointerEvent;
	};
	//ol.inherits(gb.layer.Pointer.Event, ol.events.Event);
	
	/**
	 * 이벤트 영역을 {ol.style.Style} 객체로 그려낸다.
	 * @method gb.layer.Pointer#drawMbr
	 * @param {ol.render.Event} evt - 렌더링 이벤트 객체
	 */
	gb.layer.Pointer.prototype.drawMbr = function(evt) {

		var map = this.getMap();

		if (this.feature_ !== undefined) {

			var mbr = null;
			var line = null;
			var circle = null;

			var triangle = [];
			var square = [];
			var point = [];

			var features = [];

			var strokes = {
				'line' : new ol.style.Stroke({
					color : 'rgba(152,152,152,0.6)',
					width : 3,
					lineDash : [ 1, 4 ]
				}),
				'default' : new ol.style.Stroke({
					color : 'rgba(152,152,152,0.8)',
					width : 1.5
				})
			};

			var fill = new ol.style.Fill({
				color : 'rgba(152,152,152,0.9)'
			});

			var styles = {
				'line' : new ol.style.Style({
					stroke : strokes['line'],
					image : new ol.style.Circle({
						radius : 10,
						stroke : strokes['line']
					})
				}),
				'circle' : new ol.style.Style({
					// stroke: strokes['circle'],
					image : new ol.style.Circle({
						radius : 8,
						stroke : strokes['default']
					})
				}),
				'square' : new ol.style.Style({
					image : new ol.style.RegularShape({
						stroke : strokes['default'],
						points : 4,
						radius : 8,
						angle : Math.PI / 4
					})
				}),
				'triangle' : new ol.style.Style({
					image : new ol.style.RegularShape({
						stroke : strokes['default'],
						points : 3,
						radius : 8
					})
				})
			};

			var extent = this.feature_.getGeometry().getExtent();
			var coorX = (extent[0] + extent[2]) / 2;

			var vectorContext = evt.vectorContext;

			mbr = new ol.geom.Polygon([ [ [ extent[0], extent[3] ], [ extent[0], extent[1] ], [ extent[2], extent[1] ],
					[ extent[2], extent[3] ], [ extent[0], extent[3] ] ] ]);

			square.push(new ol.geom.Point([ extent[0], extent[1] ]));
			square.push(new ol.geom.Point([ extent[0], extent[3] ]));
			square.push(new ol.geom.Point([ extent[2], extent[1] ]));
			square.push(new ol.geom.Point([ extent[2], extent[3] ]));

			for ( var i in square) {
				vectorContext.drawFeature(new ol.Feature({
					geometry : square[i],
					name : 'scale'
				}), styles['square']);
			}

			vectorContext.setStyle(styles['line']);
			vectorContext.drawGeometry(mbr);
		}
	};
	
	/**
	 * style로 그려진 버튼들의 영역을 설정하고 cursor가 그 위치에 있을때 해당버튼에 맞는 작업의 이름을
	 * String으로 반환한다. 커서가 버튼 영역에 놓여있지 않다면 null 값을 반환한다.
	 * @method gb.layer.Pointer#selectTask_
	 * @param {ol.Map} map - 작업 중인 ol.Map 객체
	 * @param {ol.Feature} feature - 작업 중인 ol.Feature 객체
	 * @param {Array.<number>} cursor - 커서 위치 좌표
	 * @return {string} 선택된 작업명
	 */
	gb.layer.Pointer.prototype.selectTask_ = function(map, feature, cursor) {

		var AREA = 6;

		var extent = feature.getGeometry().getExtent();
		var scale = [];
		var task = null;

		scale.push(map.getPixelFromCoordinate([ extent[0], extent[1] ]));
		scale.push(map.getPixelFromCoordinate([ extent[0], extent[3] ]));
		scale.push(map.getPixelFromCoordinate([ extent[2], extent[3] ]));
		scale.push(map.getPixelFromCoordinate([ extent[2], extent[1] ]));

		for ( var i in scale) {
			if ((cursor[0] >= scale[i][0] - AREA && cursor[0] <= scale[i][0] + AREA)
					&& (cursor[1] >= scale[i][1] - AREA && cursor[1] <= scale[i][1] + AREA)) {
				(i % 2 === 0) ? task = 'scaleE' : task = 'scaleW';
			}
		}

		return task;
	};
	
	/**
	 * 피처 확대, 축소 알고리즘. 선택된 scale버튼의 이전 좌표값과 pointer를 drag함으로서 변경된 커서의 좌표, 두 좌표값사이
	 * 길이의 배율값을 구하여 그 배율의 절대값을 리턴한다.
	 * @method gb.layer.Pointer#scaleAlgorithm_
	 * @param {ol.Feature} feature - 작업 중인 ol.Feature 객체
	 * @param {Array.<number>} currentCursorPoint - drag를 통해 변경된 커서의 위치
	 * @return {Array.<number>} scale이 적용된 x좌표, y좌표 배율의 절대값
	 */
	gb.layer.Pointer.prototype.scaleAlgorithm_ = function(feature, currentCursorPoint) {
		var map = this.getMap();
		var extent = this.feature_.getGeometry().getExtent();
		var cursor = currentCursorPoint;
		var center = this.flatInteriorPoint_;
		var result = [];

		var cursorPixel = map.getPixelFromCoordinate(currentCursorPoint);
		var centerPixel = map.getPixelFromCoordinate(center);
		var subX = Math.abs(cursorPixel[0] - centerPixel[0]);
		var subY = Math.abs(cursorPixel[1] - centerPixel[1]);
		var magniX = 0;
		var magniY = 0;

		if (subX < 2 || subY < 2) {
			magniX = 1;
			magniY = 1;
		} else {
			magniX = (cursor[0] - center[0]) / (extent[0] - center[0]);
			magniY = (cursor[1] - center[1]) / (extent[1] - center[1]);
		}

		result.push(Math.abs(magniX), Math.abs(magniY));
		return result;
	};
}(jQuery));