var gb;
if (!gb)
	gb = {};
if (!gb.geoserver)
	gb.geoserver = {};

gb.geoserver.CHECKBOXINPUT = {
	"vertical-align": "text-bottom",
	"width": "17px",
	"height": "17px"
};

/**
 * @classdesc
 * 지오서버에 레이어를 업로드 하기위한 모달 객체를 정의한다.
 * @class gb.geoserver.UploadSHP
 * @memberof gb.geoserver
 * @constructor
 * @param {Object} obj - gb.geoserver.UploadSHP 생성 옵션
 * @param {string} obj.url - 파일 업로드 요청 URL
 * @param {string} [obj.locale="en"] - 언어 코드
 * @author SOYIJUN
 * @date 2019. 03. 26
 * @version 0.01
 */
gb.geoserver.UploadSHP = function(obj) {
	var that = this;
	
	this.translation = {
		"uploadshp" : {
			"ko" : "SHP 레이어 업로드",
			"en" : "Upload SHP Layer"
		},
		"inzip" : {
			"ko" : "업로드할 SHP 파일은 ZIP 형태로 압축해주세요. ",
			"en" : "Please input SHP file compressed in ZIP format."
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"add" : {
			"ko" : "추가",
			"en" : "Add"
		},
		"browse" : {
			"ko" : "찾아보기",
			"en" : "Browse"
		},
		"remarks" : {
			"ko" : "비고",
			"en" : "Remarks"
		},
		"success" : {
			"ko" : "성공",
			"en" : "Success"
		},
		"fileUploadHint" : {
			"ko" : "업로드할 파일을 선택해주세요.",
			"en" : "Please select a file to upload."
		},
		"uploadShpAlert" : {
			"ko" : "zip파일 형식만 업로드가능합니다.",
			"en" : "Only zip file types can be uploaded."
		},
		"alert" : {
			"ko" : "대용량 파일(100MB 이상)은 Geoserver에 직접 업로드하는 것을 권장합니다.",
			"en" : "Recommend uploading large file(100MB or more) directly to Geoserver."
		},
		"ignorePublic" : {
			"ko" : "미발행 레이어 이름 중복 무시하기",
			"en" : "Ignore duplicate name of unpulished layer"
		},
		"200" : {
			"ko" : "정상처리",
			"en" : "Success Request"
		},
		"500" : {
			"ko" : "서버 내부오류",
			"en" : "Internal Server Error"
		},
		"600" : {
			"ko" : "로그인을 해주세요",
			"en" : "Please log in"
		},
		"603" : {
			"ko" : "다시 로그인을 해주세요",
			"en" : "Please log in again"
		},
		"604" : {
			"ko" : "잘못 입력한 정보가 있습니다",
			"en" : "You have entered wrong information"
		},
		"607" : {
			"ko" : "해당 작업공간, 저장소가 존재하지 않습니다",
			"en" : "Workspace or datastore does not exist"
		},
		"608" : {
			"ko" : "올바른 파일을 넣어 주세요",
			"en" : "Please input the correct file"
		},
		"609" : {
			"ko" : "레이어가 중복됩니다",
			"en" : "Duplicate layers"
		},
		"613" : {
			"ko" : "미발행 레이어와 중복됩니다.",
			"en" : "Duplicate Unpulished layer"
		},
		"615" : {
			"ko" : "prj파일이 없어서 레이어 발행에 실패하였습니다.",
			"en" : "There is no prj file. So it failed to publish."
		},
		"616" : {
			"ko" : "shp파일이 없어서 레이어 발행에 실패하였습니다.",
			"en" : "There is no shp file. So it failed to publish."
		},
		"617" : {
			"ko" : "shp파일이 1개 이상이여서 레이어 발행에 실패하였습니다.",
			"en" : "The layer failed to publish because there is more than one shp file."
		},
		"618" : {
			"ko" : "압축파일내에 폴더가 포함되어있어 발행에 실패하였습니다.",
			"en" : "The publication failed because the compressed file contains a folder."
		}
	};
	
	/**
	 * geoserver명
	 * @type {string}
	 * @private
	 */
	this.geoserver = undefined;
	
	/**
	 * workspace명
	 * @type {string}
	 * @private
	 */
	this.workspace = undefined;
	
	/**
	 * datastore명
	 * @type {string}
	 * @private
	 */
	this.datastore = undefined;
	
	/**
	 * 파일 업로드 요청 콜백함수
	 * @type {function}
	 * @private
	 */
	this.callback = undefined;
	
	/**
	 * 좌표계 코드 유효성 여부
	 * @type {boolean}
	 * @private
	 */
	this.validEPSG = false;
	
	/**
	 * 좌표계 코드
	 * @type {string|number}
	 * @private
	 */
	this.epsg = undefined;
	
	/**
	 * 파일 업로드 요청창 내용 부분 Element
	 * @type {HTMLElement}
	 * @private
	 */
	this.bodyArea = undefined;
	
	/**
	 * 좌표계 유효성 결과 아이콘 Element
	 * @type {HTMLElement}
	 * @private
	 */
	this.validIconSpan = $("<span>").addClass("gb-geoserver-uploadshp-epsg-icon");
	
	/**
	 * 미발행 레이어 이름 중복 무시 여부 변수
	 * @type {boolean}
	 * @private
	 */
	this.ignorePublic = false;
	
	/**
	 * 좌표계 입력 Element
	 * @type {HTMLElement}
	 * @private
	 */
	this.epsgInput = $("<input>").addClass("gb-geoserver-uploadshp-epsg-input").attr({
		"type" : "text",
		"placeholder" : "EX) 3857"
	});
	
	var options = obj ? obj : {};
	this.url = typeof options.url === "string" ? options.url : undefined;
	if(!this.url){
		console.error("gb.geoserver.UploadSHP: 'url' is required field!");
		return;
	}
	this.locale = options.locale ? options.locale : "en";
	
	this.tout = false;
	$(this.epsgInput).keyup(function() {
		if (that.tout) {
			clearTimeout(that.tout);
		}
		that.tout = setTimeout(function() {
			var v = $(that.epsgInput).val();
			console.log(v);
			that.searchEPSGCode(v);
		}, 250);
	});
};
gb.geoserver.UploadSHP.prototype = Object.create(gb.geoserver.UploadSHP.prototype);
gb.geoserver.UploadSHP.prototype.constructor = gb.geoserver.UploadSHP;

/**
 * 현재 검색한 좌표계의 EPSG 코드를 반환한다.
 * @method gb.geoserver.UploadSHP#getEPSGCode
 * @function
 * @return {string} 현재 검색한 좌표계의 EPSG 코드
 */
gb.geoserver.UploadSHP.prototype.getEPSGCode = function() {
	return this.epsg;
};

/**
 * 현재 검색한 좌표계의 EPSG 코드를 설정한다.
 * @method gb.geoserver.UploadSHP#setEPSGCode
 * @function
 * @param {string} code - 현재 검색한 좌표계의 EPSG 코드
 */
gb.geoserver.UploadSHP.prototype.setEPSGCode = function(code) {
	this.epsg = code;
};

/**
 * epsg 코드의 유효성을 설정한다.
 * @method gb.geoserver.UploadSHP#setValidEPSG
 * @function
 * @param {boolean} flag - EPSG 코드 유효성
 */
gb.geoserver.UploadSHP.prototype.setValidEPSG = function(flag) {
	this.validEPSG = flag;

	$(this.validIconSpan).empty();

	if (flag) {
		var validIcon = $("<i>").addClass("fas").addClass("fa-check");
		$(this.validIconSpan).append(validIcon);

		if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-valid-icon")) {
			// $(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-invalid-icon");
		} else {
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-invalid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-invalid-icon");
			}
			$(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-valid-icon");
		}
	} else {
		var validIcon = $("<i>").addClass("fas").addClass("fa-times");
		$(this.validIconSpan).append(validIcon);

		if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-invalid-icon")) {
			// $(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-invalid-icon");
		} else {
			if ($(this.validIconSpan).hasClass("gb-geoserver-uploadshp-epsg-valid-icon")) {
				$(this.validIconSpan).removeClass("gb-geoserver-uploadshp-epsg-valid-icon");
			}
			$(this.validIconSpan).addClass("gb-geoserver-uploadshp-epsg-invalid-icon");
		}
	}
};

/**
 * epsg 코드의 유효성을 반환한다.
 * @method gb.geoserver.UploadSHP#getValidEPSG
 * @function
 * @return {boolean} EPSG 코드 유효성
 */
gb.geoserver.UploadSHP.prototype.getValidEPSG = function() {
	return this.validEPSG;
};

/**
 * 업로드 URL 주소를 반환한다.
 * @method gb.geoserver.UploadSHP#getUploadURL
 * @function
 * @return {string} 업로드 URL 주소
 */
gb.geoserver.UploadSHP.prototype.getUploadURL = function() {
	return this.url;
};

/**
 * 파일 업로드 모달을 연다
 * @method gb.geoserver.UploadSHP#open
 * @function
 * @param {string} geoserver - geoserver명
 * @param {string} workspace - workspace명
 * @param {string} datastore - datastore명
 * @override
 */
gb.geoserver.UploadSHP.prototype.open = function(geoserver, workspace, datastrore) {
	var that = this;

	// EPSG 입력 창 생성
	/*
	 * var message1 = $("<div>").text("1. Select your coordinate
	 * system(EPSG)."); var label = $("<span>").addClass("gb-geoserver-uploadshp-epsg-label").text("EPSG:");
	 * 
	 * this.setValidEPSG(false);
	 * 
	 * var inputDiv = $("<div>").css({ "margin" : "10px"
	 * }).append(label).append(this.epsgInput).append(this.validIconSpan);
	 */

	var icon = $("<div>").addClass("fas fa-info-circle fa-2x");
	var messageContent = $("<p>").css({
		"margin" : "0 10px"
	}).html(this.translation.inzip[this.locale]);
	var message2 = $("<div>").addClass("gb-info-message").append(icon).append(messageContent);

	var file;
	var fileSelect = $("<input accept='.zip'>").attr({
		"type" : "file"
	}).change(function() {
		if (!!this.files) {
			file = this.files[0];
			if (file.size > 0) {
				fileInfo.text(file.name + ' , ' + file.size + ' kb');
			}
		}
	});

	var fileArea = $("<button type='button'>").addClass("btn btn-primary btn-lg btn-block").text(this.translation.browse[this.locale])
			.mouseenter(function() {
				$(this).css({
					"background-color" : "#00c4bc"
				});
			}).mouseleave(function() {
				$(this).css({
					"background-color" : "#00b5ad"
				});
			}).click(function() {
				fileSelect.click();
			}).css({
				"background-color" : "#00b5ad",
				"border-color" : "transparent",
			});

	var checkboxInput = 
		$("<input type='checkbox' tabindex='0'>")
			.css(gb.geoserver.CHECKBOXINPUT)
			.change(function(){
				that.ignorePublic = this.checked;
			});
	
	var checkboxLabel = $("<label>").text(this.translation.ignorePublic[this.locale]);
	var checkboxDiv = $("<div>").append(checkboxInput).append(checkboxLabel);
	
	var fileInfo = $("<div role='alert'>").css({
		"text-align" : "center"
	});
	
	icon = $("<div>").addClass("fas fa-exclamation-circle fa-2x");
	messageContent = $("<p>").css({
		"margin" : "0 10px"
	}).html(this.translation.alert[this.locale]);
	var message3 = $("<div>").addClass("gb-alert-message").append(icon).append(messageContent);

	var bodyArea = this.bodyArea = 
		$("<div>")
			.append(message2)
			.append(message3)
			.append(fileArea)
			.append(checkboxDiv)
			.append(fileInfo)
			.css({"max-height": "400px", "overflow": "auto"});

	var closeBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]);
	var okBtn = $("<button>").css({
		"float" : "right"
	}).addClass("gb-button").addClass("gb-button-primary").text(this.translation.add[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);
	var uploadModal = new gb.modal.ModalBase({
		"title" : this.translation.uploadshp[this.locale],
		"width" : 450,
		"autoOpen" : true,
		"body" : bodyArea,
		"footer" : modalFooter
	});
	$(closeBtn).click(function() {
		uploadModal.close();
	});
	$(okBtn).click(function() {
		if(!file){
			alert(that.translation.fileUploadHint[that.locale]);
			return;
		}
		
		if(file.type !== "application/x-zip-compressed"){
			alert(that.translation.uploadShpAlert[that.locale]);
			return;
		}
		that.uploadFile(file, uploadModal);
	});
};

/**
 * 파일 업로드 요청 결과 테이블을 생성한다. 객체의 배열을 인자값으로 주어야하며
 * 각 결과 정보 객체는 요청결과 코드를 가지고 있어야한다.
 * @method gb.geoserver.UploadSHP#resultTable
 * @function
 * @param {Array.<string, Object<string, string>>} result - 요청 결과 목록
 */
gb.geoserver.UploadSHP.prototype.resultTable = function(result) {
	if(!(result instanceof Array)){
		return null;
	}
	
	var list = result;
	var th, tr, key, value, detail, keys;
	var thead = $("<thead>");
	var tbody = $("<tbody>");
	var table = $("<table>").css("width", "100%").append(thead).append(tbody);
	
	tr = $("<tr>").addClass("gb-modifylayerproperties-tr");
	th = $("<th>");
	tr.append(th);
	th = $("<th>").addClass("gb-modifylayerproperties-th").text(this.translation.success[this.locale]);
	tr.append(th);
	th = $("<th>").addClass("gb-modifylayerproperties-th").text(this.translation.remarks[this.locale]);
	tr.append(th);
	thead.append(tr);
	
	for(var i = 0; i < list.length; i++){
		if(list[i] instanceof Object){
			keys = Object.keys(list[i]);
			for(var j = 0; j < keys.length; j++){
				key = $("<td>").addClass("gb-modifylayerproperties-td-key").text(keys[j]);
				value = $("<td>").addClass("gb-modifylayerproperties-td").css("text-align", "center");
				if(list[i][keys[j]] == "200"){
					value.append($("<i>").addClass("fas fa-check").css("color", "#2c662d"));
					value.css("background", "#fcfff5");
				} else {
					value.append($("<i>").addClass("fas fa-times").css("color", "#9f3a38"));
					value.css("background", "#fff6f6");
				}
				detail = $("<td>").addClass("gb-modifylayerproperties-td").text(this.translation[list[i][keys[j]]][this.locale]);
				
				tr = $("<tr>").addClass("gb-modifylayerproperties-tr").append(key).append(value).append(detail);
				tbody.append(tr);
			}
		}
	}
	
	this.bodyArea.find("table").remove();
	this.bodyArea.append(table);
}

/**
 * callback 함수를 설정한다.
 * @method gb.geoserver.UploadSHP#setCallback
 * @function
 * @param {string} callback - 설정할 콜백함수
 */
gb.geoserver.UploadSHP.prototype.setCallback = function(callback) {
	this.callback = callback;
}

/**
 * callback 함수를 반환한다.
 * @method gb.geoserver.UploadSHP#getCallback
 * @function
 * @return {string} 반환할 콜백함수
 */
gb.geoserver.UploadSHP.prototype.getCallback = function() {
	return this.callback;
}

/**
 * geoserver명을 설정한다.
 * @method gb.geoserver.UploadSHP#setGeoServer
 * @function
 * @param {string} geoserver - 설정할 geoserver명
 */
gb.geoserver.UploadSHP.prototype.setGeoServer = function(geoserver) {
	this.geoserver = geoserver;
}

/**
 * geoserver명을 반환한다.
 * @method gb.geoserver.UploadSHP#getGeoServer
 * @function
 * @return {string} 설정한 geoserver명
 */
gb.geoserver.UploadSHP.prototype.getGeoServer = function() {
	return this.geoserver;
}

/**
 * workspace명을 설정한다.
 * @method gb.geoserver.UploadSHP#setWorkspace
 * @function
 * @param {string} workspace - 설정할 workspace명
 */
gb.geoserver.UploadSHP.prototype.setWorkspace = function(workspace) {
	this.workspace = workspace;
}

/**
 * workspace명을 반환한다.
 * @method gb.geoserver.UploadSHP#getWorkspace
 * @function
 * @return {string} 설정한 workspace명
 */
gb.geoserver.UploadSHP.prototype.getWorkspace = function() {
	return this.workspace;
}

/**
 * datastore명을 설정한다.
 * @method gb.geoserver.UploadSHP#setDatastore
 * @function
 * @param {string} datastore - 설정할 datastore명
 */
gb.geoserver.UploadSHP.prototype.setDatastore = function(datastore) {
	this.datastore = datastore
}

/**
 * datastore명을 반환한다.
 * @method gb.geoserver.UploadSHP#getDatastore
 * @function
 * @return {String} 설정한 datastore명
 */
gb.geoserver.UploadSHP.prototype.getDatastore = function() {
	return this.datastore;
}

/**
 * 선택한 파일을 업로드한다.
 * @method gb.geoserver.UploadSHP#uploadFile
 * @function
 * @param {window.File} input - 업로드할 파일
 * @param {gb.modal.ModalBase} modal - 업로드 모달 객체. 요청 완료 후 닫기 위함.
 */
gb.geoserver.UploadSHP.prototype.uploadFile = function(input, modal) {
	var that = this;
	var modal = modal;

	var params = {
		"serverName" : this.getGeoServer(),
		"workspace" : this.getWorkspace(),
		"datastore" : this.getDatastore(),
		"ignorePublication" : this.ignorePublic
	};

	var url = this.getUploadURL();
	var withoutParamURL = url.substring(0, url.indexOf("?") !== -1 ? url.indexOf("?") : undefined);
	var queryString = url.indexOf("?") !== -1 ? url.substring(url.indexOf("?") + 1) : undefined;
	var queryParams = {};

	/*
	 * if (queryString) { queryParams = JSON.parse('{"' +
	 * queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
	 * function(key, value) { return key === "" ? value :
	 * decodeURIComponent(value); }); } console.log(queryParams);
	 */
	var finalParams = {};
	$.extend(finalParams, params, {});

	var form = $("<form>");
	var formData = new FormData(form[0]);
	formData.append("file", input);
	var keys = Object.keys(finalParams);
	for (var i = 0; i < keys.length; i++) {
		formData.append(keys[i], finalParams[keys[i]]);
	}

	$.ajax({
		// url : withoutParamURL,
		url : this.url,
		method : "POST",
		enctype : 'multipart/form-data',
		contentType : false,
		data : formData,
		processData : false,
		beforeSend : function() {
			// $("body").css("cursor", "wait");
			modal.modal.append($("<div id='shp-upload-loading' class='gb-body-loading'>")
					.append($("<i>").addClass("gb-body-loading-icon").addClass("fas fa-spinner fa-spin fa-5x")));
		},
		complete : function() {
			// $("body").css("cursor", "default");
			$("#shp-upload-loading").remove();
		},
		success : function(data) {
			console.log(data);
			modal.close();
			that.open();
			that.resultTable(data.layers);
			that.callback();
		}
	});
}

/**
 * 베이스 좌표계를 변경하기 위한 EPSG 코드를 검색한다.
 * @method gb.geoserver.UploadSHP#searchEPSGCode
 * @function
 * @param {string} code - 베이스 좌표계를 변경하기 위한 EPSG 코드
 */
gb.geoserver.UploadSHP.prototype.searchEPSGCode = function(code) {
	console.log(code);
	var that = this;
	fetch('https://epsg.io/?format=json&q=' + code).then(function(response) {
		return response.json();
	}).then(function(json) {
		if (json.number_result !== 1) {
			that.setValidEPSG(false);
			console.error("no crs");
			return;
		} else if (json.number_result < 1) {
			that.setValidEPSG(false);
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
						console.log(code);
						console.log(codes);
						if (code === codes) {
							that.setEPSGCode(code);
							that.setValidEPSG(true);
						}
						return;
					} else {
						console.error("no crs");
						that.setValidEPSG(false);
						return;
					}
				}
			}
		}
		return;
	});
};