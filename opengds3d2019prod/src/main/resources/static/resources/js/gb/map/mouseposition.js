var gb;
if (!gb)
	gb = {};
if (!gb.map)
	gb.map = {};

/**
 * @classdesc 현재 ol.Map 위에서의 Mouse pointer 위치 좌표정보를 제공
 * @class gb.map.MousePosition
 * @memberof gb.map
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {ol.Map}
 *            obj.map - ol.Map 객체
 * @param {string}
 *            [obj.projection] - projection
 * @param {HTMLElement}
 *            [obj.element=$(."mouse-position")] - 좌표정보를 가시화할 jquery 인스턴스
 * @author KIM HOCHUL
 * @date 2019. 03. 27
 * @version 0.01
 */
gb.map.MousePosition = function(obj) {
	var options = obj || {};
	this.map = options.map;
	if (!this.map instanceof ol.Map) {
		console.error("gb.map.MousePosition: 'map' is a required field. The type is {ol.Map}.");
		return;
	}
	this.projection = options.projection || this.map.getView().getProjection().getCode();
	this.element = options.element || $(".mouse-position");

	/**
	 * openlayers mouse position control
	 * 
	 * @type {ol.control.MousePosition}
	 * @private
	 */
	this.mousePositionControl = new ol.control.MousePosition({
		projection : this.projection,
		// projection : "EPSG:4326",
		className : "map-mouse-position",
		coordinateFormat : ol.coordinate.createStringXY(4),
		target : this.element[0],
		undefinedHTML : "&nbsp"
	});

	this.map.addControl(this.mousePositionControl);
	console.log(this.projection);
}

/**
 * Projection값을 설정한다. 값을 입력하지않을 시 현재 Openlayers Map의 Projection값으로 설정한다.
 * 
 * @method gb.map.MousePosition#setProjection
 * @function
 * @param {string|undefined}
 *            proj - projection
 */
gb.map.MousePosition.prototype.setProjection = function(proj) {
	var projection;
	if (!proj) {
		projection = this.map.getView().getProjection().getCode();
	} else {
		projection = proj;
	}
	this.mousePositionControl.setProjection(proj);
}