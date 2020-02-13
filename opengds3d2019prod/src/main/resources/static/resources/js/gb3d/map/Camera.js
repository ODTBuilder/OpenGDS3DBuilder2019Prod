if (!ol.events.Event) {
	/**
	 * @classdesc Stripped down implementation of the W3C DOM Level 2 Event interface.
	 * @see {@link https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface} This
	 * implementation only provides `type` and `target` properties, and `stopPropagation` and
	 * `preventDefault` methods. It is meant as base class for higher level events defined in the
	 * library, and works with {@link ol.events.EventTarget}.
	 * @constructor
	 * @implements {oli.events.Event}
	 * @param {string} type Type.
	 */
	ol.events.Event = function(type) {

		/**
		 * @type {boolean}
		 */
		this.propagationStopped;

		/**
		 * The event type.
		 * 
		 * @type {string}
		 * @api
		 */
		this.type = type;

		/**
		 * The event target.
		 * 
		 * @type {Object}
		 * @api
		 */
		this.target = null;

	};

	/**
	 * Stop event propagation.
	 * 
	 * @function
	 * @override
	 * @api
	 */
	ol.events.Event.prototype.preventDefault =

	/**
	 * Stop event propagation.
	 * 
	 * @function
	 * @override
	 * @api
	 */
	ol.events.Event.prototype.stopPropagation = function() {
		this.propagationStopped = true;
	};

	/**
	 * @param {Event|ol.events.Event} evt Event
	 */
	ol.events.Event.stopPropagation = function(evt) {
		evt.stopPropagation();
	};

	/**
	 * @param {Event|ol.events.Event} evt Event
	 */
	ol.events.Event.preventDefault = function(evt) {
		evt.preventDefault();
	};

	// goog.provide('ol.events.EventTarget');

	// goog.require('ol');
	// goog.require('ol.Disposable');
	// goog.require('ol.events');
	// goog.require('ol.events.Event');
}
if (!ol.MapEvent) {
	/**
	 * @classdesc Events emitted as map events are instances of this type. See {@link ol.Map} for
	 * which events trigger a map event.
	 * @constructor
	 * @extends {ol.events.Event}
	 * @implements {oli.MapEvent}
	 * @param {string} type Event type.
	 * @param {ol.Map} map Map.
	 * @param {?olx.FrameState=} opt_frameState Frame state.
	 */
	ol.MapEvent = function(type, map, opt_frameState) {

		ol.events.Event.call(this, type);

		/**
		 * The map where the event occurred.
		 * 
		 * @type {ol.Map}
		 * @api
		 */
		this.map = map;

		/**
		 * The frame state at the time of the event.
		 * 
		 * @type {?olx.FrameState}
		 * @api
		 */
		this.frameState = opt_frameState !== undefined ? opt_frameState : null;

	};
	ol.inherits(ol.MapEvent, ol.events.Event);

	// goog.provide('ol.MapBrowserEvent');

	// goog.require('ol');
	// goog.require('ol.MapEvent');
}
if (!ol.MapBrowserEvent) {
	/**
	 * @classdesc Events emitted as map browser events are instances of this type. See
	 * {@link ol.Map} for which events trigger a map browser event.
	 * @constructor
	 * @extends {ol.MapEvent}
	 * @implements {oli.MapBrowserEvent}
	 * @param {string} type Event type.
	 * @param {ol.Map} map Map.
	 * @param {Event} browserEvent Browser event.
	 * @param {boolean=} opt_dragging Is the map currently being dragged?
	 * @param {?olx.FrameState=} opt_frameState Frame state.
	 */
	ol.MapBrowserEvent = function(type, map, browserEvent, opt_dragging, opt_frameState) {

		ol.MapEvent.call(this, type, map, opt_frameState);

		/**
		 * The original browser event.
		 * 
		 * @const
		 * @type {Event}
		 * @api
		 */
		this.originalEvent = browserEvent;

		/**
		 * The map pixel relative to the viewport corresponding to the original browser event.
		 * 
		 * @type {ol.Pixel}
		 * @api
		 */
		this.pixel = map.getEventPixel(browserEvent);

		/**
		 * The coordinate in view projection corresponding to the original browser event.
		 * 
		 * @type {ol.Coordinate}
		 * @api
		 */
		this.coordinate = map.getCoordinateFromPixel(this.pixel);

		/**
		 * Indicates if the map is currently being dragged. Only set for `POINTERDRAG` and
		 * `POINTERMOVE` events. Default is `false`.
		 * 
		 * @type {boolean}
		 * @api
		 */
		this.dragging = opt_dragging !== undefined ? opt_dragging : false;

	};
	ol.inherits(ol.MapBrowserEvent, ol.MapEvent);

	/**
	 * Prevents the default browser action.
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/event.preventDefault
	 * @override
	 * @api
	 */
	ol.MapBrowserEvent.prototype.preventDefault = function() {
		ol.MapEvent.prototype.preventDefault.call(this);
		this.originalEvent.preventDefault();
	};

	/**
	 * Prevents further propagation of the current event.
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/event.stopPropagation
	 * @override
	 * @api
	 */
	ol.MapBrowserEvent.prototype.stopPropagation = function() {
		ol.MapEvent.prototype.stopPropagation.call(this);
		this.originalEvent.stopPropagation();
	};

	// goog.provide('ol.MapBrowserEventType');
	// goog.require('ol.events.EventType');
}

/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
/**
 * @classdesc Camera 객체를 정의한다.
 * @class gb3d.Camera
 * @memberof gb3d
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {Cesium.Camera} obj.cesiumCamera - 3차원 지도상에서 사용될 Cesium 카메라 객체
 * @param {THREE.Camera} obj.threeCamera - 3차원 지도상에서 사용될 THREE 카메라 객체
 * @param {ol.Map} obj.olMap - 2D 지도 객체
 * @param {boolean} obj.sync2D - 2D지도와 3D 지도의 뷰 영역 동기화 여부
 * @author SOYIJUN
 */
gb3d.Camera = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	/**
	 * Cesium 카메라 객체
	 * 
	 * @type {Cesium.Camera}
	 */
	this.cesiumCamera = options.cesiumCamera instanceof Cesium.Camera ? options.cesiumCamera : undefined;
	/**
	 * THREE 카메라 객체
	 * 
	 * @type {THREE.Camera}
	 */
	this.threeCamera = options.threeCamera instanceof THREE.Camera ? options.threeCamera : undefined;
	/**
	 * 2D 지도 객체
	 * 
	 * @type {ol.Map}
	 */
	this.olMap = options.olMap instanceof ol.Map ? options.olMap : undefined;
	/**
	 * 2D지도와 3D 지도의 뷰 영역 동기화 여부
	 * 
	 * @type {boolean}
	 */
	this.sync2D = options.sync2D;
	/**
	 * 2D, 3D 연동시 최초 수행여부를 저장하는 변수
	 * 
	 * @type {boolean}
	 */
	this.firstConst = true;
	// this.icon = options.icon ? options.icon : undefined;
	// this.sector = options.sector ? options.sector : undefined;
	if (!this.cesiumCamera || !this.threeCamera || !this.olMap) {
		console.error("constructor parameter not provided");
		return;
	}
	/**
	 * 2D 지도의 ol.View 객체
	 * 
	 * @type {ol.View}
	 */
	this.olView = this.olMap ? this.olMap.getView() : undefined;
	/**
	 * 초기화 위치
	 * 
	 * @type {number[]}
	 */
	this.initPosition = Array.isArray(options.initPosition) ? Cesium.Cartesian3.fromDegrees(options.initPosition[0], options.initPosition[1] - 1, 200000) : Cesium.Cartesian3.fromDegrees(0, 0, 200000);

	if (this.cesiumCamera !== undefined) {
		this.cesiumCamera.changed.addEventListener(function() {
			that.updateCamCartigraphicPosition();
			if (that.sync2D) {
				that.syncWith2D();
			}
		});
		this.cesiumCamera.moveStart.addEventListener(function() {
			that.updateCamCartigraphicPosition();
			if (that.sync2D) {
				that.syncWith2D();
			}
		});
		this.cesiumCamera.moveEnd.addEventListener(function() {
			that.updateCamCartigraphicPosition();
			// console.log(Cesium.Math.toDegrees(that.cesiumCamera.heading));
			if (that.firstConst) {
				that.firstConst = false;
				that.syncWith2D();
			}
			if (that.sync2D) {
				that.syncWith2D();
			}
		});
	}
	/**
	 * 오버레이 위에서도 줌인아웃을 할 수 있도록 휠 줌 인터랙션 객체를 저장하는 변수
	 * 
	 * @type {ol.interaction.MouseWheelZoom}
	 */
	this.wheelZoomIntr = undefined;
	var intrs = this.olMap.getInteractions();
	for (var i = 0; i < intrs.getLength(); i++) {
		var intr = intrs.item(i);
		if (intr instanceof ol.interaction.MouseWheelZoom) {
			this.wheelZoomIntr = intr;
			break;
		}
	}
	/**
	 * 카메라 아이콘
	 * 
	 * @type {HTMLElement}
	 */
	this.icon = $("<img>")
			.attr(
					{
						"src" : "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAyOTcuMDAxIDI5Ny4wMDEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI5Ny4wMDEgMjk3LjAwMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiPgo8Zz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6IzJDM0U1MDsiIGN4PSIxNDguNTAxIiBjeT0iMTQ4LjUiIHI9IjE0OC41Ii8+Cgk8L2c+Cgk8cGF0aCBzdHlsZT0iZmlsbDojMjEzMTNGOyIgZD0iTTI5Ni42MDcsMTU5LjI5NWwtOTQuOTg4LTk0Ljk3MUw2My44NzQsMjM2LjE0bDU4LjU4MSw1OC41ODFjOC40NTcsMS40OTYsMTcuMTYsMi4yOCwyNi4wNDYsMi4yOCAgIEMyMjYuODg1LDI5NywyOTEuMDc2LDIzNi4yNjksMjk2LjYwNywxNTkuMjk1eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6IzlBREFEOTsiIGQ9Ik03My4yOTIsMjQwLjM3NWMtNy44NjEsMC0xMy44NjMtNy4wNTktMTIuNTY0LTE0LjgxMWM3LjA1My00Mi4xMDMsNDMuNjY2LTc0LjE4OSw4Ny43NzMtNzQuMTg5ICAgIHM4MC43MiwzMi4wODUsODcuNzczLDc0LjE4OWMxLjI5OSw3Ljc1My00LjcwNCwxNC44MTEtMTIuNTY0LDE0LjgxMUg3My4yOTJ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojNzFBQUE3OyIgZD0iTTIzNi4yNzMsMjI1LjU2M2MtNy4wNTMtNDIuMTAzLTQzLjY2Ni03NC4xODgtODcuNzczLTc0LjE4OGMtMC4yMjMsMC0wLjQ0MywwLjAxMy0wLjY2NiwwLjAxNSAgICB2ODguOTg1aDc1Ljg3NUMyMzEuNTcxLDI0MC4zNzUsMjM3LjU3MywyMzMuMzE2LDIzNi4yNzMsMjI1LjU2M3oiLz4KCTwvZz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGN4PSIxNDguNTAxIiBjeT0iMTE5LjM3NSIgcj0iNzYuNSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0QwRDVEOTsiIGQ9Ik0xNDguNTAxLDQyLjg3NWMtMC4yMjMsMC0wLjQ0MywwLjAxNS0wLjY2NiwwLjAxN3YxNTIuOTY2YzAuMjIzLDAuMDAyLDAuNDQzLDAuMDE3LDAuNjY2LDAuMDE3ICAgIGM0Mi4yNSwwLDc2LjUtMzQuMjUsNzYuNS03Ni41UzE5MC43NTEsNDIuODc1LDE0OC41MDEsNDIuODc1eiIvPgoJPC9nPgoJPGc+CgkJPGNpcmNsZSBzdHlsZT0iZmlsbDojQkRDM0M3OyIgY3g9IjE0OC41MDEiIGN5PSIxMTkuMzc1IiByPSIzOC4yNSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6IzlFQTRBODsiIGQ9Ik0xNDguNTAxLDgxLjEyNWMtMC4yMjMsMC0wLjQ0NCwwLjAxMy0wLjY2NiwwLjAxN3Y3Ni40NjZjMC4yMjMsMC4wMDQsMC40NDMsMC4wMTcsMC42NjYsMC4wMTcgICAgYzIxLjEyNSwwLDM4LjI1LTE3LjEyNSwzOC4yNS0zOC4yNVMxNjkuNjI2LDgxLjEyNSwxNDguNTAxLDgxLjEyNXoiLz4KCTwvZz4KCTxnPgoJCTxjaXJjbGUgc3R5bGU9ImZpbGw6IzMyMzczQjsiIGN4PSIxNDguNTAxIiBjeT0iMTE5LjM3NSIgcj0iMTkuMTI1Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojMkMzMDMzOyIgZD0iTTE0OC41MDEsMTAwLjI1Yy0wLjIyNSwwLTAuNDQzLDAuMDI2LTAuNjY2LDAuMDM0djM4LjE4M2MwLjIyMywwLjAwOCwwLjQ0MSwwLjAzNCwwLjY2NiwwLjAzNCAgICBjMTAuNTYzLDAsMTkuMTI1LTguNTYzLDE5LjEyNS0xOS4xMjVTMTU5LjA2NCwxMDAuMjUsMTQ4LjUwMSwxMDAuMjV6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg=="
					}).css({
				"z-index" : 2,
				"width" : "64px",
				"height" : "64px",
				"cursor" : "move",
				"opacity" : 0.6
			})[0];
	/**
	 * 시야각 아이콘
	 * 
	 * @type {HTMLElement}
	 */
	this.sector = $("<img>")
			.attr(
					{
						"src" : "data:image/png;base64,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"
					}).css({
				"z-index" : 1,
				"width" : "120px",
				"height" : "120px",
				"cursor" : "pointer",
				"opacity" : 0.2
			})[0];

	// this.sector = $("<div>")[0];
	/**
	 * 카메라 오버레이의 위치
	 * 
	 * @type {ol.geom.Point}
	 */
	this.camGeom = new ol.geom.Point({
		"coordinates" : [],
		"layout" : "XY"
	});
	/**
	 * 카메라 아이콘 오버레이
	 * 
	 * @type {ol.Overlay}
	 */
	this.iconOverlay = new ol.Overlay({
		position : this.camGeom.getCoordinates(),
		positioning : 'center-center',
		element : this.icon,
		stopEvent : true
	});
	this.olMap.addOverlay(this.iconOverlay);

	/**
	 * 시야각 아이콘 오버레이
	 * 
	 * @type {ol.Overlay}
	 */
	this.sectOverlay = new ol.Overlay({
		position : this.camGeom.getCoordinates(),
		positioning : 'center-center',
		element : this.sector,
		stopEvent : true
	});
	this.olMap.addOverlay(this.sectOverlay);
	var wheelEvt = function(e) {
		var E = e.originalEvent;
		// delta = 0;
		// console.log(E);
		// if (E.detail) {
		// delta = E.detail * -40;
		// } else {
		// delta = E.wheelDelta;
		// }
		// console.log(delta);
		// if (delta === 120) {
		// } else if (delta === -120) {
		// }
		// 마우스 이벤트 만들어서
		var whevt = new ol.MapBrowserEvent("wheel", that.olMap, E);
		// 휠줌인터렉션에 전달
		if (that.wheelZoomIntr !== undefined) {
			that.wheelZoomIntr.handleEvent(whevt);
		}
	};
	$(this.icon).on('mousewheel DOMMouseScroll', wheelEvt);
	$(this.sector).on('mousewheel DOMMouseScroll', wheelEvt);

	/**
	 * 카메라 아이콘 스타일
	 * 
	 * @type {ol.style.Style}
	 */
	this.camStyle = new ol.style.Style({
		"image" : new ol.style.Icon({
			"anchor" : [ 0.5, 0.5 ],
			"crossOrigin" : 'anonymous',
			"img" : this.icon,
			"imgSize" : [ 64, 64 ],
			"size" : [ 64, 64 ]
		})
	});
	/**
	 * 시야각 아이콘 스타일
	 * 
	 * @type {ol.style.Style}
	 */
	this.sectorStyle = new ol.style.Style({
		"image" : new ol.style.Icon({
			"anchor" : [ 0.5, 0.5 ],
			"crossOrigin" : 'anonymous',
			"img" : this.sector,
			"imgSize" : [ 64, 64 ],
			"size" : [ 512, 512 ],
			"scale" : 0.2
		})
	});
	/**
	 * 커서 위치
	 * 
	 * @type {number[]}
	 */
	this.cursorCoord = [];
	this.olMap.on('pointermove', function(evt) {
		that.cursorCoord = evt.coordinate;
	});

	$(this.sector).on('dragstart', function(event) {
		event.preventDefault();
	});

	$(this.icon).on('dragstart', function(event) {
		event.preventDefault();
	});

	$(this.icon).hover(function() {
		that.isHover = true;
		$(that.icon).css({
			"opacity" : 1
		});
		$(that.sector).css({
			"opacity" : 1
		});
	}, function() {
		that.isHover = false;
		$(that.icon).css({
			"opacity" : 0.6
		});
		$(that.sector).css({
			"opacity" : 0.2
		});
	});

	this.isHover = false;

	$(this.sector).hover(function() {
		that.isHover = true;
		$(that.icon).css({
			"opacity" : 1
		});
		$(that.sector).css({
			"opacity" : 1
		});
	}, function() {
		that.isHover = false;
		if (!that.isCamMoving && !that.isCamRotating) {
			$(that.icon).css({
				"opacity" : 0.6
			});
			$(that.sector).css({
				"opacity" : 0.2
			});
		}
	});
	/**
	 * 카메라 아이콘 위치가 변경되는 중인지 여부
	 * 
	 * @type {boolean}
	 */
	this.isCamMoving = false;
	/**
	 * 카메라 아이콘을 회전 중인지 여부
	 * 
	 * @type {boolean}
	 */
	this.isCamRotating = false;

	/**
	 * 커서의 이전 위치
	 * 
	 * @type {number[]}
	 */
	this.prevCursorCoord = [];
	/**
	 * 카메라 아이콘을 드래그 중인지 여부
	 * 
	 * @type {boolean}
	 */
	this.isCamDragging = false;
	/**
	 * 카메라 아이콘을 클릭 중인지 여부
	 * 
	 * @type {boolean}
	 */
	this.isCamDown = false;
	$(this.icon).mousedown(function() {
		that.isCamMoving = true;
		that.isCamRotating = false;

		that.isCamDragging = false;
		that.isCamDown = true;
		// console.log(that.getCamIconOverlay().getPosition());
		// console.log(that.cursorCoord);
		that.prevCursorCoord = [ that.cursorCoord[0], that.cursorCoord[1] ];
	});
	$(document).mousemove(function() {
		if (that.isCamDown && that.isCamMoving) {
			that.isCamDragging = true;
			// console.log(that.getCamIconOverlay().getPosition());
			// console.log(that.cursorCoord);

			var distancex = that.cursorCoord[0] - that.prevCursorCoord[0];
			var distancey = that.cursorCoord[1] - that.prevCursorCoord[1];

			var camPos = that.getCamIconOverlay().getPosition();
			var secPos = that.getCamSectorOverlay().getPosition();

			that.getCamIconOverlay().setPosition([ camPos[0] + distancex, camPos[1] + distancey ]);
			that.getCamSectorOverlay().setPosition([ secPos[0] + distancex, secPos[1] + distancey ]);
			that.updateCesiumCameraPosition();
			that.prevCursorCoord = [ that.cursorCoord[0], that.cursorCoord[1] ];
		}
	}).mouseup(function() {
		if (that.isCamMoving) {
			that.isCamMoving = false;
			that.isCamRotating = false;

			var wasCamDragging = that.isCamDragging;
			var wasCamDown = that.isCamDown;
			that.isCamDragging = false;
			that.isCamDown = false;
			// console.log(that.getCamIconOverlay().getPosition());
			// console.log(that.cursorCoord);

			var distancex = that.cursorCoord[0] - that.prevCursorCoord[0];
			var distancey = that.cursorCoord[1] - that.prevCursorCoord[1];

			var camPos = that.getCamIconOverlay().getPosition();
			var secPos = that.getCamSectorOverlay().getPosition();

			that.getCamIconOverlay().setPosition([ camPos[0] + distancex, camPos[1] + distancey ]);
			that.getCamSectorOverlay().setPosition([ secPos[0] + distancex, secPos[1] + distancey ]);
			that.updateCesiumCameraPosition();
			that.prevCursorCoord = [ that.cursorCoord[0], that.cursorCoord[1] ];

			if (!wasCamDragging || !wasCamDown) {
				// error
			}
		}
		if (!that.isHover) {
			if (!that.isCamMoving && !that.isCamRotating) {
				$(that.icon).css({
					"opacity" : 0.6
				});
				$(that.sector).css({
					"opacity" : 0.2
				});
			}
		}
	});

	this.rdragging = false, this.target_wp, this.o_x, this.o_y, this.h_x, this.h_y, this.last_angle;
	$(this.sector).mousedown(function(e) {
		that.isCamMoving = false;
		that.isCamRotating = true;

		that.h_x = e.pageX;
		that.h_y = e.pageY; // clicked point
		e.preventDefault();
		e.stopPropagation();
		that.rdragging = true;
		that.target_wp = $(that.sector);
		that.o_x = that.target_wp.offset().left + 60;
		that.o_y = that.target_wp.offset().top + 60; // origin point
		that.last_angle = that.target_wp.data("last_angle") || 0;
	})

	$(document).mousemove(function(e) {
		if (that.rdragging && that.isCamRotating) {
			var s_x = e.pageX, s_y = e.pageY; // start rotate point
			if (s_x !== that.o_x && s_y !== that.o_y) { // start rotate
				var s_rad = Math.atan2(s_y - that.o_y, s_x - that.o_x); // current
				// to
				// origin
				s_rad -= Math.atan2(that.h_y - that.o_y, that.h_x - that.o_x); // handle
				// to
				// origin
				s_rad += that.last_angle; // relative to the last one
				var degree = (s_rad * (360 / (2 * Math.PI)));
				that.target_wp.css('-moz-transform', 'rotate(' + degree + 'deg)');
				that.target_wp.css('-moz-transform-origin', '50% 50%');
				that.target_wp.css('-webkit-transform', 'rotate(' + degree + 'deg)');
				that.target_wp.css('-webkit-transform-origin', '50% 50%');
				that.target_wp.css('-o-transform', 'rotate(' + degree + 'deg)');
				that.target_wp.css('-o-transform-origin', '50% 50%');
				that.target_wp.css('-ms-transform', 'rotate(' + degree + 'deg)');
				that.target_wp.css('-ms-transform-origin', '50% 50%');
				that.updateCesiumCameraPosition(degree);
			}
		}
	}); // end mousemove

	$(document).mouseup(function(e) {
		if (that.isCamRotating) {
			that.isCamMoving = false;
			that.isCamRotating = false;

			that.rdragging = false;
			var s_x = e.pageX, s_y = e.pageY;

			// Saves the last angle for future iterations
			var s_rad = Math.atan2(s_y - that.o_y, s_x - that.o_x); // current
			// to
			// origin
			s_rad -= Math.atan2(that.h_y - that.o_y, that.h_x - that.o_x); // handle
			// to
			// origin
			s_rad += that.last_angle;
			that.target_wp.data("last_angle", s_rad);
		}
		if (!that.isHover) {
			if (!that.isCamMoving && !that.isCamRotating) {
				$(that.icon).css({
					"opacity" : 0.6
				});
				$(that.sector).css({
					"opacity" : 0.2
				});
			}
		}
	});
}

/**
 * cesium 카메라 객체를 반환한다.
 * 
 * @method gb3d.Map#getCesiumCamera
 * @return {Cesium.Camera} cesium 카메라 객체
 */
gb3d.Camera.prototype.getCesiumCamera = function() {
	return this.cesiumCamera;
};

/**
 * three 카메라 객체를 반환한다.
 * 
 * @method gb3d.Map#getThreeCamera
 * @return {Cesium.Camera} cesium 카메라 객체
 */
gb3d.Camera.prototype.getThreeCamera = function() {
	return this.threeCamera;
};

/**
 * cesium camera의 2차원 위치를 반환한다.
 * 
 * @method gb3d.Map#getCartographicPosition
 * @return {number[]} 경위도 좌표
 */
gb3d.Camera.prototype.getCartographicPosition = function() {
	var ccam = this.getCesiumCamera();
	var cartographic = ccam.positionCartographic;
	var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(12);
	var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(12);
	return [ parseFloat(longitude), parseFloat(latitude) ];
};

/**
 * cesium camera의 2차원 지도상 위치 좌표 배열을 반환한다.
 * 
 * @method gb3d.Map#getCamGeometry
 * @return {number[]} 카메라 point geometry
 */
gb3d.Camera.prototype.getCamGeometry = function() {
	return this.camGeom;
};

/**
 * cesium camera의 아이콘 오버레이 객체를 반환한다.
 * 
 * @method gb3d.Map#getCamIconOverlay
 * @return {ol.Overlay} 카메라 아이콘 오버레이 객체
 */
gb3d.Camera.prototype.getCamIconOverlay = function() {
	return this.iconOverlay;
};

/**
 * cesium camera의 시야각을 보여주는 아이콘 오버레이 객체를 반환한다.
 * 
 * @method gb3d.Map#getCamSectorOverlay
 * @return {ol.Overlay} 시야각 아이콘 오버레이 객체
 */
gb3d.Camera.prototype.getCamSectorOverlay = function() {
	return this.sectOverlay;
};

/**
 * cesium camera의 시야각을 보여주는 이미지 객체를 반환한다.
 * 
 * @method gb3d.Map#getCamSectorImage
 * @return {HTMLElement} 시야각 아이콘 이미지
 */
gb3d.Camera.prototype.getCamSectorImage = function() {
	return this.sector;
};

/**
 * cesium camera의 2차원 지도상 위치를 업데이트 한다.
 * 
 * @method gb3d.Map#updateCamCartigraphicPosition
 */
gb3d.Camera.prototype.updateCamCartigraphicPosition = function() {
	var that = this;
	var coord = this.getCartographicPosition();
	// this.getCamGeometry().setCoordinates(coord);

	this.getCamSectorOverlay().setPosition(coord);
	this.getCamIconOverlay().setPosition(coord);

	var degree = Cesium.Math.toDegrees(this.getCesiumCamera().heading);
	$(this.getCamSectorImage()).css("transform", "rotate(" + degree + "deg)");
	// this.getCamSectorOverlay().setRotation(degree);
};

/**
 * cesium camera의 3차원 지도상 위치를 업데이트 한다.
 * 
 * @method gb3d.Map#updateCesiumCameraPosition
 * @param {number} heading - 카메라 각도 degree
 */
gb3d.Camera.prototype.updateCesiumCameraPosition = function(heading) {
	var camPos = this.getCamIconOverlay().getPosition();
	// var camCart = Cesium.Cartesian3.fromDegrees(camPos[0], camPos[1]);
	var ccam = this.getCesiumCamera();
	// console.log(ccam.positionWC);
	// console.log(ccam.positionCartographic);
	var carto = ccam.positionCartographic;
	ccam.flyTo({
		destination : Cesium.Cartesian3.fromDegrees(camPos[0], camPos[1], carto["height"]),
		duration : 0,
		orientation : {
			heading : heading ? Cesium.Math.toRadians(heading) : ccam.heading,
			pitch : ccam.pitch,
			roll : ccam.roll
		}
	});
};

/**
 * cesium camera의 시점을 openlayers 시점과 연동한다
 * 
 * @method gb3d.Map#syncWith2D
 */
gb3d.Camera.prototype.syncWith2D = function() {
	var that = this;
	if (that.olView) {
		var rect = that.cesiumCamera.computeViewRectangle();
		if (rect) {
			var rightup = Cesium.Rectangle.northeast(rect);
			var leftdown = Cesium.Rectangle.southwest(rect);
			var extent = [ Cesium.Math.toDegrees(leftdown.longitude), Cesium.Math.toDegrees(leftdown.latitude), Cesium.Math.toDegrees(rightup.longitude), Cesium.Math.toDegrees(rightup.latitude) ];
			that.olView.fit(extent);
		}
	}
};