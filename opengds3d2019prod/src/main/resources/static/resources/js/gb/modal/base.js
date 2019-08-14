/**
 * @classdesc 모달 객체를 정의한다.
 * 
 * @class gb.modal.ModalBase
 * @memberof gb.modal
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {string}
 *            obj.title - 모달의 제목
 * @param {number}
 *            [obj.width="auto"] - 모달의 너비 (픽셀)
 * @param {boolean}
 *            obj.autoOpen - 선언과 동시에 표출 할 것인지 선택
 * @param {boolean}
 *            [obj.keep="false"] - 모달 element를 생성시 미리 body에 append한다. true시
 *            append된 element를 css를 통해 보이거나 감춤, false시 open때마다 새롭게 body에
 *            append한다.
 * @param {function |
 *            string | HTMLElement} obj.body - Modal 본문에 삽입될 내용
 * @param {function |
 *            string | HTMLElement} obj.footer- Modal 푸터에 삽입될 내용
 * @author SOYIJUN
 */
gb.modal.ModalBase = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	this.title = options.title ? options.title : "";
	this.width = options.width ? options.width : "auto";
	this.height = "auto";
	this.keep = options.keep || false;
	this.autoOpen = options.autoOpen ? true : false;
	var span = $("<span>").html("&times;");
	var btn = $("<button>").append(span).click(function() {
		that.close();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.titleArea = $("<span>").addClass("gb-modal-title").text(this.title);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.modalHead = $("<div>").addClass("gb-modal-head").append(this.titleArea).append(btn);
	var body = typeof options.body === "function" ? options.body() : options.body;
	var footer = typeof options.footer === "function" ? options.footer() : options.footer;
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.modalBody = $("<div>").addClass("gb-modal-body");
	if (body) {
		$(this.modalBody).append(body);
	}
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.modalFooter = $("<div>").addClass("gb-modal-footer");
	if (footer) {
		$(this.modalFooter).append(footer);
	}
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.modal = $("<div>").addClass("gb-modal").css({
		"width" : typeof this.width === "number" ? this.width+"px" : this.width,
				"height" : typeof this.height === "number" ? this.height+"px" : this.height,
						"position" : "absolute",
						"z-Index" : "999"
	}).append(this.modalHead).append(this.modalBody).append(this.modalFooter);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.background = $("<div>").addClass("gb-modal-background");
	if (this.keep) {
		$("body").append(this.modal);
		$("body").append(this.background);
	}
	if (this.autoOpen) {
		this.open();
	}
};
/**
 * 모달 바디를 반환한다.
 * 
 * @method gb.modal.ModalBase#getModalBody
 * @return {HTMLElement} 모달 본문에 해당하는 HTMLElement
 */
gb.modal.ModalBase.prototype.getModalBody = function() {
	return this.modalBody;
};
/**
 * 모달 바디를 설정한다.
 * 
 * @method gb.modal.ModalBase#setModalBody
 * @param {HTMLElement |
 *            function} body - 모달 본문으로 삽입될 내용
 */
gb.modal.ModalBase.prototype.setModalBody = function(body) {
	if (typeof body === "function") {
		var inner = body();
		$(this.modalBody).append(inner);
	} else {
		var inner = body;
		$(this.modalBody).append(inner);
	}
};
/**
 * 모달 푸터를 반환한다.
 * 
 * @method gb.modal.ModalBase#getModalFooter
 * @return {HTMLElement} 모달 푸터에 해당하는 HTMLElement
 */
gb.modal.ModalBase.prototype.getModalFooter= function() {
	return this.modalFooter;
};
/**
 * 모달 푸터를 설정한다.
 * 
 * @method gb.modal.ModalBase#setModalFooter
 * @param {HTMLElement |
 *            function} footer - 모달 푸터로 삽입될 내용
 */
gb.modal.ModalBase.prototype.setModalFooter = function(footer) {
	if (typeof footer === "function") {
		$(this.modalFooter).append(footer());
	} else {
		$(this.modalFooter).append(footer);
	}
};
/**
 * 모달을 반환한다.
 * 
 * @method gb.modal.ModalBase#getModal
 * @return {HTMLElement} 모달의 HTMLElement
 */
gb.modal.ModalBase.prototype.getModal = function() {
	return this.modal;
};
/**
 * 모달을 나타낸다.
 * 
 * @method gb.modal.ModalBase#open
 */
gb.modal.ModalBase.prototype.open = function() {
	if(!this.keep){
		$("body").append(this.background);
		$("body").append(this.modal);
	}
	var highz = this.getMaxZIndex();
	this.background.css({
		"display" : "block",
		"z-index" : highz + 1 
	});

	this.modal.css({
		"display" : "block",
		"z-index" : highz + 2 
	});
	this.refreshPosition();
};
/**
 * 모달을 숨긴다.
 * 
 * @method gb.modal.ModalBase#close
 */
gb.modal.ModalBase.prototype.close = function() {
	if(this.keep){
		this.background.css("display", "none");
		this.modal.css("display", "none");
	} else {
		this.background.detach();
		this.modal.detach();
	}
};
/**
 * 모달위치를 최신화한다.
 * 
 * @method gb.modal.ModalBase#refreshPosition
 */
gb.modal.ModalBase.prototype.refreshPosition = function() {
	var maskHeight = $(document).height();  
	var maskWidth = $(window).width();
	
	var dialogTop =  (maskHeight) - (this.getHeight()*3);  
	var dialogLeft = (maskWidth/2) - (this.getWidth()/2);
	
	$(this.modal).css({
		"top" : 0,
		"left" : dialogLeft,
		"position" : "fixed",
		"margin" : "50px auto"
	});
// $(this.modal).css({
// "top" : ($(window).innerHeight() / 2) - (this.getHeight()/2+50) + "px",
// "left" : ($(window).innerWidth() / 2) - (this.getWidth()/2) + "px"
// });
};
/**
 * 너비를 설정한다.
 * 
 * @method gb.modal.ModalBase#setWidth
 * @param {number}
 *            width - 모달의 너비(픽셀)
 */
gb.modal.ModalBase.prototype.setWidth = function(width) {
	this.width = width;
	var value;
	if (typeof width === "number") {
		if (height > 0) {
			value = width + "px";
		} else {
			value = 0;
		}
	} else if (width === "auto"){
		value = "auto";
	}
	$(this.modal).css("width", value);
	this.refreshPosition();
};
/**
 * 너비를 반환한다.
 * 
 * @method gb.modal.ModalBase#getWidth
 * @return {number} 모달의 너비(픽셀)
 */
gb.modal.ModalBase.prototype.getWidth = function() {
	return $(this.modal).outerWidth();
};
/**
 * 높이를 설정한다.
 * 
 * @method gb.modal.ModalBase#setHeight
 * @param {number}
 *            height - 모달의 높이(픽셀)
 */
gb.modal.ModalBase.prototype.setHeight = function(height) {
	this.height = height;
	var value;
	if (typeof height === "number") {
		if (height > 0) {
			value = height + "px";
		} else {
			value = 0;
		}
	} else if (height === "auto"){
		value = "auto";
	}
	$(this.modal).css("height", value);
	this.refreshPosition();
};

/**
 * 높이를 반환한다.
 * 
 * @method gb.modal.ModalBase#getHeight
 * @return {number} 모달의 높이(픽셀)
 */
gb.modal.ModalBase.prototype.getHeight = function() {
	return $(this.modal).outerHeight();
};

/**
 * 모달의 최고 z-index 값을 반환한다.
 * 
 * @method gb.modal.ModalBase#getMaxZIndex
 * @return {number} 최고 z-index
 */
gb.modal.ModalBase.prototype.getMaxZIndex = function() {
	var maxZ = Math.max.apply(null,$.map($('body > div'), function(e,n){
		if($(e).css('position')=='absolute'){
			return parseInt($(e).css('z-index'))||1 ;
		}
	}));
	return maxZ;
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb.modal.ModalBase#showSpinner
 * @param {boolean}
 *            show - 스피너 표시 유무
 */
gb.modal.ModalBase.prototype.showSpinner = function(show) {
	if (show) {
		var spinnerArea = $("<div>").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x")).addClass("gb-spinner-wrap").addClass(
				"gb-spinner-body").addClass("gb-spinner-position");
		$(this.getModal()).append(spinnerArea);
	} else {
		$(this.getModal()).find(".gb-spinner-wrap").remove();
	}
};