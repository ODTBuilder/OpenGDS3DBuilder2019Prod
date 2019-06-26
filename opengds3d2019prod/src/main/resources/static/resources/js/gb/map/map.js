/**
 * @classdesc Map 객체를 정의한다.
 * 
 * @class gb.Map
 * @memberof gb
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {HTMLElement}
 *            obj.target - 지도 영역이 될 Div의 HTMLElement
 * @param {ol.View}
 *            obj.view - 지도 영역에 사용될 ol.View 객체
 * @param {Object}
 *            obj.upperMap - 상위 ol.Map 객체의 생성자 옵션
 * @param {Array.
 *            <ol.control.Control>} obj.upperMap.controls - 상위 ol.Map 객체에 적용할
 *            컨트롤 객체
 * @param {number}
 *            obj.upperMap.pixelRatio - 상위 ol.Map 객체에 적용할 픽셀 레이쇼
 * @param {Array.
 *            <ol.interaction.Interaction>} obj.upperMap.interactions - 상위
 *            ol.Map 객체에 적용할 인터랙션 객체
 * @param {(HTMLElement|Document|string)}
 *            obj.upperMap.keyboardEventTarget - 상위 ol.Map 객체에 적용할 키보드 이벤트 타겟
 * @param {Array.
 *            <ol.layer.Base>} obj.upperMap.layers - 상위 ol.Map 객체에 적용할 레이어 객체
 * @param {number}
 *            obj.upperMap.maxTilesLoading - 상위 ol.Map 객체에 적용할 한번에 로드할 최대 타일 개수
 * @param {boolean}
 *            obj.upperMap.loadTilesWhileAnimating - 상위 ol.Map 객체에 적용할 애니메이션 중
 *            타일 로드 여부
 * @param {boolean}
 *            obj.upperMap.loadTilesWhileInteracting - 상위 ol.Map 객체에 적용할 인터랙션 동작
 *            중 타일 로드 여부
 * @param {number}
 *            obj.upperMap.moveTolerance - 상위 ol.Map 객체에 적용할 커서 최소 이동 거리
 * @param {Array.
 *            <ol.Overlay>} obj.upperMap.overlays - 상위 ol.Map 객체에 적용할 오버레이 객체
 * @param {Object}
 *            obj.lowerMap - 하위 ol.Map 객체의 생성자 옵션
 * @param {Array.
 *            <ol.control.Control>} obj.lowerMap.controls - 상위 ol.Map 객체에 적용할
 *            컨트롤 객체
 * @param {number}
 *            obj.lowerMap.pixelRatio - 상위 ol.Map 객체에 적용할 픽셀 레이쇼
 * @param {Array.
 *            <ol.interaction.Interaction>} obj.lowerMap.interactions - 상위
 *            ol.Map 객체에 적용할 인터랙션 객체
 * @param {(HTMLElement|Document|string)}
 *            obj.lowerMap.keyboardEventTarget - 상위 ol.Map 객체에 적용할 키보드 이벤트 타겟
 * @param {Array.
 *            <ol.layer.Base>} obj.lowerMap.layers - 상위 ol.Map 객체에 적용할 레이어 객체
 * @param {number}
 *            obj.lowerMap.maxTilesLoading - 상위 ol.Map 객체에 적용할 한번에 로드할 최대 타일 개수
 * @param {boolean}
 *            obj.lowerMap.loadTilesWhileAnimating - 상위 ol.Map 객체에 적용할 애니메이션 중
 *            타일 로드 여부
 * @param {boolean}
 *            obj.lowerMap.loadTilesWhileInteracting - 상위 ol.Map 객체에 적용할 인터랙션 동작
 *            중 타일 로드 여부
 * @param {number}
 *            obj.lowerMap.moveTolerance - 상위 ol.Map 객체에 적용할 커서 최소 이동 거리
 * @param {Array.
 *            <ol.Overlay>} obj.lowerMap.overlays - 상위 ol.Map 객체에 적용할 오버레이 객체
 * @author SOYIJUN
 */
gb.Map = function(obj) {

	var that = this;
	var options = obj ? obj : {};

	this.view = options.view instanceof ol.View ? options.view : new ol.View({});

	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.upperDiv = $("<div>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.lowerDiv = $("<div>");

	if ($(options.target).is("div")) {
		this.bind = $(options.target).append(this.upperDiv).append(this.lowerDiv);
	} else {
		console.error("target must be div element");
		return;
	}
	// 윗 지도 영역을 상단에 정렬
	$(this.upperDiv).css({
		"top" : 0
	});
	// 아래 지도 영역을 윗 지도 영역과 동일하게(겹치도록) 정렬
	$(this.lowerDiv).css({
		"top" : $(this.upperDiv).outerHeight() !== 0 ? "-" + $(this.upperDiv).outerHeight() + "px" : 0,
		"position" : "relative"
	});

	this.upperMap = new ol.Map(
			{
				controls : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("controls") ? options.upperMap.controls
						: undefined : undefined,
				pixelRatio : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("pixelRatio") ? options.upperMap.pixelRatio
						: undefined
						: undefined,
				interactions : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("interactions") ? options.upperMap.interactions
						: undefined
						: undefined,
				keyboardEventTarget : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("keyboardEventTarget") ? options.upperMap.keyboardEventTarget
						: undefined
						: undefined,
				layers : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("layers") ? options.upperMap.layers
						: undefined : undefined,
				maxTilesLoading : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("maxTilesLoading") ? options.upperMap.maxTilesLoading
						: undefined
						: undefined,
				loadTilesWhileAnimating : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("loadTilesWhileAnimating") ? options.upperMap.loadTilesWhileAnimating
						: undefined
						: undefined,
				loadTilesWhileInteracting : options.hasOwnProperty("upperMap") ? options.upperMap
						.hasOwnProperty("loadTilesWhileInteracting") ? options.upperMap.loadTilesWhileInteracting : undefined : undefined,
				moveTolerance : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("moveTolerance") ? options.upperMap.moveTolerance
						: undefined
						: undefined,
				overlays : options.hasOwnProperty("upperMap") ? options.upperMap.hasOwnProperty("overlays") ? options.upperMap.overlays
						: undefined : undefined,
				target : this.upperDiv[0],
				view : this.view
			});
	this.lowerMap = new ol.Map(
			{
				controls : options.hasOwnProperty("upperMap") ? options.lowerMap.hasOwnProperty("controls") ? options.lowerMap.controls
						: undefined : undefined,
				pixelRatio : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("pixelRatio") ? options.lowerMap.pixelRatio
						: undefined
						: undefined,
				interactions : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("interactions") ? options.lowerMap.interactions
						: undefined
						: undefined,
				keyboardEventTarget : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("keyboardEventTarget") ? options.lowerMap.keyboardEventTarget
						: undefined
						: undefined,
				layers : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("layers") ? options.lowerMap.layers
						: undefined : undefined,
				maxTilesLoading : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("maxTilesLoading") ? options.lowerMap.maxTilesLoading
						: undefined
						: undefined,
				loadTilesWhileAnimating : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("loadTilesWhileAnimating") ? options.lowerMap.loadTilesWhileAnimating
						: undefined
						: undefined,
				loadTilesWhileInteracting : options.hasOwnProperty("lowerMap") ? options.lowerMap
						.hasOwnProperty("loadTilesWhileInteracting") ? options.lowerMap.loadTilesWhileInteracting : undefined : undefined,
				moveTolerance : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("moveTolerance") ? options.lowerMap.moveTolerance
						: undefined
						: undefined,
				overlays : options.hasOwnProperty("lowerMap") ? options.lowerMap.hasOwnProperty("overlays") ? options.lowerMap.overlays
						: undefined : undefined,
				target : this.lowerDiv[0],
				view : this.view
			});

	$(this.lowerDiv).find(".ol-viewport").css("z-index", 1);
	// 윗 지도가 아래 지도보다 우선적으로 보여지도록 인덱스 설정
	$(this.upperDiv).find(".ol-viewport").css("z-index", 2);
};
/**
 * 상위 지도 영역 ol.Map 객체를 반환한다.
 * 
 * @method gb.Map#getUpperMap
 * @return {ol.Map} 상위 영역 ol.Map 객체
 */
gb.Map.prototype.getUpperMap = function() {
	return this.upperMap;
};

/**
 * 상위 지도 영역 ol.Map 객체를 설정한다.
 * 
 * @method gb.Map#setUpperMap
 * @param {ol.Map}
 *            map - 상위 영역 ol.Map 객체
 */
gb.Map.prototype.setUpperMap = function(map) {
	this.upperMap = map;
};

/**
 * 하위 지도 영역 ol.Map 객체를 반환한다.
 * 
 * @method gb.Map#getLowerMap
 * @return {ol.Map} 하위 영역 ol.Map 객체
 */
gb.Map.prototype.getLowerMap = function() {
	return this.lowerMap;
};

/**
 * 하위 지도 영역 ol.Map 객체를 설정한다.
 * 
 * @method gb.Map#setLowerMap
 * @param {ol.Map}
 *            map - 하위 영역 ol.Map 객체
 */
gb.Map.prototype.setLowerMap = function(map) {
	this.lowerMap = map;
};

/**
 * 상위 지도 영역 HTMLElement를 반환한다.
 * 
 * @method gb.Map#getUpperDiv
 * @return {HTMLElement} 상위 영역 HTMLElement
 */
gb.Map.prototype.getUpperDiv = function() {
	return this.upperDiv;
};

/**
 * 하위 지도 영역 HTMLElement를 반환한다.
 * 
 * @method gb.Map#getLowerDiv
 * @return {HTMLElement} 하위 영역 HTMLElement
 */
gb.Map.prototype.getLowerDiv = function() {
	return this.lowerDiv;
};

/**
 * 지도 영역의 크기를 설정한다.
 * 
 * @method gb.Map#setSize
 * @param {(number|string)}
 *            width - 지도의 너비
 * @param {(number|string)}
 *            height - 지도의 높이
 */
gb.Map.prototype.setSize = function(width, height) {
	$(this.bind).css({
		"width" : width + "px",
		"height" : height + "px"
	});
	$(this.lowerDiv).css({
		"width" : width + "px",
		"height" : height + "px"
	});
	$(this.upperDiv).css({
		"width" : width + "px",
		"height" : height + "px"
	});
	this.getUpperMap().updateSize();
	this.getLowerMap().updateSize();

	$(this.upperDiv).css({
		"top" : 0
	});
	$(this.lowerDiv).css({
		"top" : $(this.upperDiv).outerHeight() !== 0 ? "-" + $(this.upperDiv).outerHeight() + "px" : 0,
		"position" : "relative"
	});

};