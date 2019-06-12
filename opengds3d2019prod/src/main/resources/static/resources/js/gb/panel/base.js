/**
 * @classdesc
 * 패널 객체를 정의한다.
 * 
 * @class gb.panel.PanelBase
 * @memberof gb.panel
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {(number|string)}
 *            [obj.width="auto"] - 패널의 너비 (픽셀)
 * @param {(number|string)}
 *            [obj.height="auto"] - 패널의 높이 (픽셀)
 * @param {(number|string)}
 *            [obj.positionX=0] - 패널의 페이지 왼편 또는 오른편으로 부터의 거리 (픽셀)
 * @param {boolean}
 *            [obj.right=false] - positionX를 오른쪽 기준으로 적용할것인지 (false일땐 왼쪽)
 * @param {(number|string)}
 *            [obj.positionY=0] - 패널의 페이지 상단으로 부터의 거리 (픽셀)
 * @param {boolean}
 *            [obj.autoOpen=false] - 패널을 선언과 동시에 표출 할 것인지 선택
 * @author SOYIJUN
 */
gb.panel.PanelBase = function(obj) {

	var that = this;
	var options = obj ? obj : {};
	this.width = options.width ? options.width : "auto";
	this.height = options.height ? options.height : "auto";
	this.x = options.positionX ? options.positionX : 0;
	this.right = options.right ? true : false;
	this.y = options.positionY ? options.positionY : 0;
	this.autoOpen = options.autoOpen ? true : false;
	var span = $("<span>").html("&times;");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.closeBtn = $("<button>").append(span).click(function() {
		that.close();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelHead = $("<div>").addClass("gb-panel-head").append(this.closeBtn);
	var body = typeof options.body === "function" ? options.body() : options.body;
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelBody = $("<div>").addClass("gb-panel-body");
	if (body) {
		$(this.panelBody).append(body);
	}
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panel = $("<div>").addClass("gb-panel").css({
		"width" : !isNaN(parseInt(this.width)) ? this.width + "px" : "auto",
		"height" : !isNaN(parseInt(this.height)) ? this.height + "px" : "auto",
		"position" : "absolute",
		"z-Index" : "999",
		"top" : !isNaN(parseInt(this.y)) ? this.y + "px" : 0
	}).append(this.panelHead).append(this.panelBody);

	if (this.right) {
		$(this.panel).css({
			"right" : !isNaN(parseInt(this.x)) ? this.x + "px" : 0
		});
	} else {
		$(this.panel).css({
			"left" : !isNaN(parseInt(this.x)) ? this.x + "px" : 0
		});
	}

	// $(this.panel).draggable({
	// appendTo : "body",
	// containment : "body"
	// });

	$("body").append(this.panel);

	if (this.autoOpen) {
		this.open();
	} else {
		this.close();
	}
};
/**
 * 패널 바디를 삽입한다.
 * 
 * @method gb.panel.PanelBase#setPanelBody
 * @function
 * @param {(HTMLElement|function)}
 *            body - 패널에 표시될 내용
 */
gb.panel.PanelBase.prototype.setPanelBody = function(body) {
	if (typeof body === "function") {
		$(this.panelBody).append(body());
	} else {
		$(this.panelBody).append(body);
	}
};
/**
 * 패널을 HTMLElement 형태로 반환한다.
 * 
 * @method gb.panel.PanelBase#getPanel
 * @return {HTMLElement} HTMLElement 형태의 패널
 */
gb.panel.PanelBase.prototype.getPanel = function() {
	return this.panel;
};
/**
 * 패널을 나타낸다.
 * 
 * @method gb.panel.PanelBase#open
 */
gb.panel.PanelBase.prototype.open = function() {
	this.panel.css("display", "block");
};
/**
 * 패널을 숨긴다.
 * 
 * @method gb.panel.PanelBase#close
 */
gb.panel.PanelBase.prototype.close = function() {
	this.panel.css("display", "none");
};
/**
 * 패널의 너비를 설정한다.
 * 
 * @method gb.panel.PanelBase#setWidth
 * @param {(number|string)}
 *            width - 패널의 너비 (픽셀)
 */
gb.panel.PanelBase.prototype.setWidth = function(width) {
	this.width = width;
	$(this.panel).css("width", (width + "px"));
};
/**
 * 너비를 반환한다.
 * 
 * @method gb.panel.PanelBase#getWidth
 * @return {(number|string)} 패널의 너비 (픽셀)
 */
gb.panel.PanelBase.prototype.getWidth = function() {
	return this.width;
};
/**
 * 높이를 설정한다.
 * 
 * @method gb.panel.PanelBase#setHeight
 * @param {(number|string)}
 *            height - 패널의 높이 (픽셀)
 */
gb.panel.PanelBase.prototype.setHeight = function(height) {
	this.height = height;
	$(this.panel).css("height", (height + "px"));
};

/**
 * 높이를 반환한다.
 * 
 * @method gb.panel.PanelBase#getHeight
 * @return {(number|string)} 패널의 높이 (픽셀)
 */
gb.panel.PanelBase.prototype.getHeight = function() {
	return this.height;
};
/**
 * 패널의 수평 위치를 설정한다.
 * 
 * @method gb.panel.PanelBase#setPositionX
 * @param {(number|string)}
 *            x - 페이지의 왼편으로 부터의 거리 (픽셀)
 */
gb.panel.PanelBase.prototype.setPositionX = function(x) {
	this.positionX = x;
	$(this.panel).css("left", (x + "px"));
};

/**
 * 패널의 수평 위치를 반환한다.
 * 
 * @method gb.panel.PanelBase#getPositionX
 * @return {(number|string)} 페이지의 왼편으로 부터의 거리 (픽셀)
 */
gb.panel.PanelBase.prototype.getPositionX = function() {
	return this.positionX;
};
/**
 * 패널의 수직 위치를 설정한다.
 * 
 * @method gb.panel.PanelBase#setPositionY
 * @param {(number|string)}
 *            y - 페이지의 상단으로 부터의 거리 (픽셀)
 */
gb.panel.PanelBase.prototype.setPositionY = function(y) {
	this.positionY = y;
	$(this.panel).css("top", (y + "px"));
};

/**
 * 패널의 수직 위치를 반환한다.
 * 
 * @method gb.panel.PanelBase#getPositionY
 * @return {(number|string)} 페이지의 상단으로 부터의 거리 (픽셀)
 */
gb.panel.PanelBase.prototype.getPositionY = function() {
	return this.positionY;
};