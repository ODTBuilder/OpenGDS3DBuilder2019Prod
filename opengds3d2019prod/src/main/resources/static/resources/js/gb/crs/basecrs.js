/**
 * @classdesc 베이스 좌표계 변경 모달 객체를 정의한다.
 * 
 * @class gb.crs.BaseCRS
 * @memberof gb.crs
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {string}
 *            [obj.locale="en"] - 사용할 언어 ko | en
 * @param {HTMLElement}
 *            obj.message - 현재 좌표계를 출력할 HTMLElement
 * @param {Array.
 *            <ol.Map>} obj.maps - 베이스 좌표계를 변경할 ol.Map 객체
 * @param {string}
 *            obj.epsg - 설정하고자 하는 좌표계의 EPSG 코드
 * @author SOYIJUN
 */
gb.crs.BaseCRS = function(obj) {
	var that = this;
	/**
	 * 다국어화 정보 객체
	 * 
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"bcrs" : {
			"ko" : "기본 좌표계",
			"en" : "Base CRS"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"applyingerror" : {
			"ko" : "오류: 좌표계 적용 실패",
			"en" : "Error: Applying CRS Failed"
		}
	};
	var options = obj ? obj : {};
	/**
	 * 언어 설정 코드
	 * 
	 * @private
	 * @type {string}
	 */
	this.locale = options.locale ? options.locale : "en";

	obj.title = this.translation.bcrs[this.locale];
	obj.width = 435;
	obj.height = 180;
	obj.keep = true;
	gb.modal.ModalBase.call(this, obj);

	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.message = options.message ? options.message : undefined;
	if (Array.isArray(options.maps) && options.maps.length > 0) {
		var flag = true;
		for (var i = 0; i < options.maps.length; i++) {
			if (!options.maps[i] instanceof ol.Map) {
				flag = false;
			}
		}
		if (!flag) {
			console.error("maps must Array.<ol.Map>");
			return;
		}
	}
	/**
	 * 베이스 좌표계를 적용할 ol.Map 객체
	 * 
	 * @private
	 * @type {Array.<ol.Map>}
	 */
	this.maps = undefined;
	var tempmaps = options.maps ? options.maps : undefined;
	if (tempmaps === undefined) {
		console.error("maps parameter is required.");
		return;
	} else if (Array.isArray(tempmaps)) {
		for (var i = 0; i < tempmaps.length; i++) {
			if (!tempmaps[i] instanceof ol.Map) {
				console.error("maps element must be ol.Map type");
				return;
			}
		}
	}
	this.maps = tempmaps;
	/**
	 * EPSG 코드
	 * 
	 * @private
	 * @type {string}
	 */
	this.epsg = typeof options.epsg === "string" ? options.epsg : "3857";
	/**
	 * 좌표계 검색 후 수행할 콜백함수
	 * 
	 * @private
	 * @type {function}
	 */
	this.callback = typeof options.callback === "function" ? options.callback : undefined;
	/**
	 * 좌표계 정보
	 * 
	 * @private
	 * @type {function}
	 */
	this.projObj = undefined;
	/**
	 * epsg코드의 유효성
	 * 
	 * @private
	 * @type {number}
	 */
	this.validEPSG = undefined;
	/**
	 * 검색 폼 객체
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchBar = $("<input>").attr({
		"type" : "number",
		"placeholder" : "EX) 3857"
	}).addClass("gb-form").addClass("gb-basecrs-searchbar");

	/**
	 * 검색값 입력시 타임아웃 이벤트
	 * 
	 * @private
	 * @type {function}
	 */
	this.tout = false;
	// 좌표계 입력시 EPSG검색
	$(this.searchBar).keyup(function() {
		that.setValidEPSG(1);
		if (that.tout) {
			clearTimeout(that.tout);
		}
		// 시간을 두고 입력값을 검색하도록 함
		that.tout = setTimeout(function() {
			var v = $(that.searchBar).val();
			console.log(v);
			that.searchEPSGCode(v);
		}, 250);
	});
	/**
	 * 좌표계 유효성 아이콘
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.validIconSpan = $("<span>").addClass("gb-basecrs-icon-margin");

	var label = $("<span>").text("EPSG: ");
	var area = $("<div>").addClass("gb-basecrs-area").append(label).append(this.searchBar).append(this.validIconSpan);
	this.setModalBody(area);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]).click(function() {
		that.close();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.ok[this.locale]).click(
			function() {
				// 공백 제거
				var val = $(that.searchBar).val().replace(/(\s*)/g, '');
				if (that.getValidEPSG()) {
					that.applyProjection(that.getProjection().code, that.getProjection().name, that.getProjection().proj4, that
							.getProjection().bbox);
					that.close();
				}
			});
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(this.searchBtn).append(closeBtn);
	this.setModalFooter(buttonArea);
	$("body").append(this.modal);
	$("body").append(this.background);
	this.searchEPSGCode(this.epsg, true, this.callback);
};
gb.crs.BaseCRS.prototype = Object.create(gb.modal.ModalBase.prototype);
gb.crs.BaseCRS.prototype.constructor = gb.crs.BaseCRS;

/**
 * 베이스 좌표계를 변경하고자 하는 ol.Map 객체를 반환한다.
 * 
 * @method gb.crs.BaseCRS#getMaps
 * @return {Array.<ol.Map>} 베이스 좌표계를 변경하고자 하는 ol.Map 객체
 */
gb.crs.BaseCRS.prototype.getMaps = function() {
	return this.maps;
};

/**
 * 베이스 좌표계를 변경하고자 하는 ol.Map 객체를 설정한다.
 * 
 * @method gb.crs.BaseCRS#setMaps
 * @param {Array.
 *            <ol.Map>} maps - 베이스 좌표계를 변경하고자 하는 ol.Map 객체의 배열
 */
gb.crs.BaseCRS.prototype.setMaps = function(maps) {
	if (maps === undefined) {
		console.error("maps parameter is required.");
		return;
	} else if (Array.isArray(maps)) {
		for (var i = 0; i < maps.length; i++) {
			if (!maps[i] instanceof ol.Map) {
				console.error("maps element must be ol.Map type");
				return;
			}
		}
	}
	this.maps = maps;
};

/**
 * 현재 좌표계를 표시할 HTMLElement 객체를 반환한다.
 * 
 * @method gb.crs.BaseCRS#getMessage
 * @return {HTMLElement} 좌표계가 표시되는 HTMLElement
 */
gb.crs.BaseCRS.prototype.getMessage = function() {
	return this.message;
};

/**
 * 현재 좌표계를 표시할 HTMLElement 객체를 설정한다.
 * 
 * @method gb.crs.BaseCRS#setMessage
 * @param {HTMLElement}
 *            message - 현재 좌표계를 표시할 HTMLElement 객체
 */
gb.crs.BaseCRS.prototype.setMessage = function(message) {
	this.message = message;
};

/**
 * 현재 적용된 베이스 좌표계의 EPSG 코드를 반환한다.
 * 
 * @method gb.crs.BaseCRS#getEPSGCode
 * @return {string} 현재 적용된 베이스 좌표계의 EPSG 코드
 */
gb.crs.BaseCRS.prototype.getEPSGCode = function() {
	return this.epsg;
};

/**
 * 현재 적용된 베이스 좌표계의 EPSG 코드를 설정한다.
 * 
 * @method gb.crs.BaseCRS#setEPSGCode
 * @param {string}
 *            code - 현재 적용된 베이스 좌표계의 EPSG 코드
 */
gb.crs.BaseCRS.prototype.setEPSGCode = function(code) {
	this.epsg = code;
};

/**
 * 베이스 좌표계를 변경하기 위한 EPSG 코드를 검색한다.
 * 
 * @method gb.crs.BaseCRS#searchEPSGCode
 * @param {string}
 *            code - 베이스 좌표계를 변경하기 위한 EPSG 코드
 * @param {boolean}
 *            apply - 검색된 좌표계를 적용
 * @param {function}
 *            callback - 좌표계 적용 후 수행할 콜백함수
 */
gb.crs.BaseCRS.prototype.searchEPSGCode = function(code, apply, callback) {
	console.log(code);
	var that = this;

	$.ajax({
		url : 'https://epsg.io/?format=json&q=' + code,
		dataType : "jsonp",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			var json = data;
			if (json.number_result !== 1) {
				that.setValidEPSG(0);
				that.setProjection(undefined, undefined, undefined, undefined);
				console.error("no crs");
				return;
			} else if (json.number_result < 1) {
				that.setValidEPSG(0);
				that.setProjection(undefined, undefined, undefined, undefined);
				console.error("no crs");
				return;
			}
			var results = json['results'];
			if (results && results.length > 0) {
				for (var i = 0, ii = results.length; i < ii; i++) {
					var result = results[i];
					if (result) {
						var codes = result['code'], name = result['name'], proj4def = result['proj4'], bbox = result['bbox'];
						if (codes && codes.length > 0 && proj4def && proj4def.length > 0 && bbox && bbox.length == 4) {
							if (code === codes) {
								that.setEPSGCode(code);
								that.setValidEPSG(2);
								that.setProjection(code, name, proj4def, bbox);
								if (apply) {
									that.applyProjection(code, name, proj4def, bbox, callback);
								}
							}
							return;
						} else {
							console.error("no crs");
							that.setValidEPSG(0);
							that.setProjection(undefined, undefined, undefined, undefined);
							return;
						}
					}
				}
			}
			return;
		},
		error : function(jqXHR, textStatus, errorThrown) {
			that.applyProjection(null, null, null, null, callback);
		}
	});
};

/**
 * 베이스 좌표계를 적용한다.
 * 
 * @method gb.crs.BaseCRS#applyProjection
 * @param {string}
 *            code - EPSG 코드
 * @param {string}
 *            name - 좌표계 이름
 * @param {string}
 *            proj4def - proj4 좌표계
 * @param {Array.
 *            <number>} bbox - 좌표계 영역
 * @param {function}
 *            callback - 적용 후 수행할 콜백함수
 */
gb.crs.BaseCRS.prototype.applyProjection = function(code, name, proj4def, bbox, callback) {
	var that = this;
	var view;
	if (code === null || name === null || proj4def === null || bbox === null) {
		$(that.getMessage()).text("EPSG:3857 " + "[" + this.translation.applyingerror[this.locale] + "]");
		view = new ol.View({
			projection : 'EPSG:3857',
			center : [ 0, 0 ],
			zoom : 1
		});
	} else {
		this.setEPSGCode(code);
		var newProjCode = 'EPSG:' + code;
		$(this.getMessage()).text(newProjCode);
		proj4.defs(newProjCode, proj4def);
		ol.proj.proj4.register(proj4);
		var newProj = ol.proj.get(newProjCode);
		ol.proj.addProjection(newProj);
		var fromLonLat = ol.proj.getTransform('EPSG:4326', newProj);

		// very approximate calculation of projection extent
		var extent = ol.extent.applyTransform([ bbox[1], bbox[2], bbox[3], bbox[0] ], fromLonLat);
		newProj.setExtent(extent);
		view = new ol.View({
			projection : newProj
		});
	}
	var maps = this.getMaps();
	if (Array.isArray(maps)) {
		for (var i = 0; i < maps.length; i++) {
			if (maps[i] instanceof ol.Map) {
				maps[i].setView(view);
				var controls = maps[i].getControls();
				for (var j = 0; j < controls.getLength(); j++) {
					if (controls.item(j) instanceof ol.control.MousePosition) {
						controls.item(j).setProjection(newProj);
					}
				}
			}
		}
	} else if (maps instanceof ol.Map) {
		this.getMaps().setView(view);
		var controls = this.getMaps().getControls();
		for (var j = 0; j < controls.getLength(); j++) {
			if (controls.item(j) instanceof ol.control.MousePosition) {
				controls.item(j).setProjection(newProj);
			}
		}
	}
	view.fit(extent);
	console.log(this.getEPSGCode());
	if (typeof callback === "function") {
		callback();
	}
};

/**
 * 베이스 좌표계를 설정한다.
 * 
 * @method gb.crs.BaseCRS#setProjection
 * @param {string}
 *            code - EPSG 코드
 * @param {string}
 *            name - 좌표계 이름
 * @param {string}
 *            proj4def - proj4 좌표계
 * @param {number[]}
 *            bbox - 좌표계 영역
 */
gb.crs.BaseCRS.prototype.setProjection = function(code, name, proj4def, bbox) {
	var that = this;
	this.projObj = {
		"code" : code,
		"name" : name,
		"proj4" : proj4def,
		"bbox" : bbox
	};
};

/**
 * 베이스 좌표계 정보를 반환한다.
 * 
 * @method gb.crs.BaseCRS#getProjection
 * @return {Object} 좌표계 정보
 */
gb.crs.BaseCRS.prototype.getProjection = function() {
	return this.projObj;
};

/**
 * epsg 코드의 유효성을 설정한다.
 * 
 * @method gb.crs.BaseCRS#setValidEPSG
 * @param {number}
 *            flag - EPSG 코드 유효성 0 - 불가, 1 - 로딩중, 2 - 가능
 */
gb.crs.BaseCRS.prototype.setValidEPSG = function(flag) {
	this.validEPSG = flag;

	$(this.validIconSpan).empty();

	if (flag === 2) {
		var validIcon = $("<i>").addClass("fas").addClass("fa-check");
		$(this.validIconSpan).append(validIcon);
		if (!$(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-valid-icon")) {
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-invalid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-invalid-icon");
			}
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-loading-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-loading-icon");
			}
			$(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-valid-icon");
		}
		$(this.searchBtn).prop("disabled", false);
	} else if (flag === 1) {
		var validIcon = $("<i>").addClass("fas").addClass("fa-spinner").addClass("fa-spin");
		$(this.validIconSpan).append(validIcon);
		if (!$(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-loading-icon")) {
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-valid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-valid-icon");
			}
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-invalid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-invalid-icon");
			}
			$(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-loading-icon");
		}
		$(this.searchBtn).prop("disabled", true);
	} else if (flag === 0) {
		var validIcon = $("<i>").addClass("fas").addClass("fa-times");
		$(this.validIconSpan).append(validIcon);

		if (!$(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-invalid-icon")) {
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-valid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-valid-icon");
			}
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-loading-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-loading-icon");
			}
			$(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-invalid-icon");
		}
		$(this.searchBtn).prop("disabled", true);
	}
};

/**
 * epsg 코드의 유효성을 반환한다.
 * 
 * @method gb.crs.BaseCRS#getValidEPSG
 * @return {boolean} EPSG 코드 유효성
 */
gb.crs.BaseCRS.prototype.getValidEPSG = function() {
	return this.validEPSG === 2 ? true : false;
};

/**
 * 모달을 연다
 * 
 * @method gb.crs.BaseCRS#open
 * @override
 */
gb.crs.BaseCRS.prototype.open = function() {
	gb.modal.ModalBase.prototype.open.call(this);
	$(this.searchBar).val(this.getEPSGCode());
	if (this.getValidEPSG()) {
		$(this.searchBtn).prop("disabled", false);
	} else {
		$(this.searchBtn).prop("disabled", true);
	}
};