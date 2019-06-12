/**
 * @classdesc 지오서버에 레이어를 업로드 하기위한 모달 객체를 정의한다.
 * 
 * @class gb.geoserver.UploadGeoJSON
 * @memberof gb.geoserver
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {string}
 *            obj.url - json객체를 업로드할 URL
 * @param {(string|number|function)}
 *            obj.epsg - 업로드할 레이어의 좌표계
 * @param {gb.tree.GeoServer}
 *            obj.geoserverTree - 연동될 gb.tree.GeoServer 객체
 * @param {string}
 *            [obj.locale="en"] - 사용할 언어 ko | en
 * @author SOYIJUN
 */
gb.geoserver.UploadGeoJSON = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	/**
	 * 업로드 주소 URL
	 * 
	 * @private
	 * @type {string}
	 */
	this.url = typeof options.url === "string" ? options.url : undefined;
	/**
	 * EPSG 코드 저장
	 * 
	 * @private
	 * @type {(string|number|function)}
	 */
	this.epsginit = (typeof options.epsg === "number" || typeof options.epsg === "string" || typeof options.epsg === "function") ? options.epsg
			: undefined;
	/**
	 * GeoServer 트리 객체
	 * 
	 * @private
	 * @type {gb.tree.GeoServer}
	 */
	this.geoserverTree = typeof options.geoserverTree === "function" ? options.geoserverTree : undefined;
	/**
	 * GeoServer 이름
	 * 
	 * @private
	 * @type {string}
	 */
	this.geoserver = undefined;
	/**
	 * Workspace 이름
	 * 
	 * @private
	 * @type {string}
	 */
	this.workspace = undefined;
	/**
	 * Datastore 이름
	 * 
	 * @private
	 * @type {string}
	 */
	this.datastore = undefined;
	/**
	 * EPSG 코드 유효성
	 * 
	 * @private
	 * @type {boolean}
	 */
	this.validEPSG = false;
	/**
	 * @private
	 * @type {string}
	 */
	this.epsg = undefined;
	/**
	 * @private
	 * @type {string}
	 */
	this.locale = options.locale ? options.locale : "en";
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.validIconSpan = $("<span>").addClass("gb-geoserver-uploadshp-epsg-icon");

	// 미발행 레이어 이름 중복 무시 여부 변수
	/**
	 * @private
	 * @type {boolean}
	 */
	this.ignorePublic = false;
	/**
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"400" : {
			"ko" : "요청값 잘못입력",
			"en" : "Bad request"
		},
		"404" : {
			"ko" : "페이지 없음",
			"en" : "Not found"
		},
		"405" : {
			"ko" : "요청 타입 에러",
			"en" : "Method not allowed"
		},
		"406" : {
			"ko" : "요청 형식 에러",
			"en" : "Not acceptable"
		},
		"407" : {
			"ko" : "프록시 에러",
			"en" : "Proxy authentication required"
		},
		"408" : {
			"ko" : "요청시간 초과",
			"en" : "Request timeout"
		},
		"415" : {
			"ko" : "지원하지 않는 타입 요청",
			"en" : "Unsupported media type"
		},
		"500" : {
			"ko" : "서버 내부 오류",
			"en" : "Internal server error"
		},
		"600" : {
			"ko" : "로그인을 해주세요",
			"en" : "Please log in"
		},
		"600" : {
			"ko" : "로그인을 해주세요",
			"en" : "Please log in"
		},
		"601" : {
			"ko" : "미 입력 값이 존재합니다",
			"en" : "You have not entered any required parameters"
		},
		"602" : {
			"ko" : "서버 이름 또는 URL이 중복됩니다",
			"en" : "Server name or URL are duplicated"
		},
		"603" : {
			"ko" : "다시 로그인을 해주세요",
			"en" : "Please log in again"
		},
		"604" : {
			"ko" : "잘못 입력한 정보가 있습니다",
			"en" : "You have entered wrong information"
		},
		"605" : {
			"ko" : "해당 서버가 존재하지 않습니다",
			"en" : "The server does not exist"
		},
		"606" : {
			"ko" : "일부 성공 또는 실패하였습니다.",
			"en" : "Some have succeed or failed"
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
		"610" : {
			"ko" : "레이어 발행이 실패하였습니다",
			"en" : "Publishing layer failed"
		},
		"611" : {
			"ko" : "Geoserver와 연결이 안정적이지 않습니다",
			"en" : "The connection with geoserver is not stable"
		},
		"612" : {
			"ko" : "작업공간에 레이어가 존재하지 않습니다",
			"en" : "The is no layer in the workspace"
		},
		"uploadgeojson" : {
			"ko" : "GeoJSON 레이어 업로드",
			"en" : "Upload GeoJSON Layer"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"err" : {
			"ko" : "오류",
			"en" : "Error"
		},
		"upload" : {
			"ko" : "업로드",
			"en" : "Upload"
		},
		"noset" : {
			"ko" : "선택 없음",
			"en" : "Not selected"
		},
		"noserver1" : {
			"ko" : "지오서버 없음",
			"en" : "No GeoServer"
		},
		"workspace" : {
			"ko" : "작업공간",
			"en" : "Workspace"
		},
		"datastore" : {
			"ko" : "데이터저장소",
			"en" : "Datastore"
		},
		"crs" : {
			"ko" : "좌표계",
			"en" : "CRS"
		},
		"slayer" : {
			"ko" : "선택한 레이어",
			"en" : "Selected Layer"
		},
		"ignore" : {
			"ko" : "중복되는 미발행 레이어 덮어쓰기",
			"en" : "Overwrite duplicate unpublished layers"
		},
		"noserver2" : {
			"ko" : "GeoServer가 설정되지 않았습니다.",
			"en" : "GeoServer is not set up."
		},
		"nowork" : {
			"ko" : "작업공간이 설정되지 않았습니다.",
			"en" : "Workspace is not set up."
		},
		"nostore" : {
			"ko" : "데이터저장소가 설정되지 않았습니다.",
			"en" : "Datastore is not set up."
		},
		"nocrs" : {
			"ko" : "좌표계가 설정되지 않았습니다.",
			"en" : "Coordinate reference system  is not set up."
		},
		"dupname" : {
			"ko" : "같은 이름의 레이어들을 올릴 수 없습니다.",
			"en" : "You can not upload layers with the same name."
		},
	};
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.epsgInput = $("<input>").addClass("gb-geoserver-uploadshp-epsg-input").attr({
		"type" : "text",
		"placeholder" : "EX) 3857"
	});
	/**
	 * @private
	 * @type {(boolean|function)}
	 */
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
gb.geoserver.UploadGeoJSON.prototype = Object.create(gb.geoserver.UploadGeoJSON.prototype);
gb.geoserver.UploadGeoJSON.prototype.constructor = gb.geoserver.UploadGeoJSON;

/**
 * 지오서버 트리를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getGeoserverTree
 * @return {gb.tree.GeoServer} 지오서버 트리 객체
 */
gb.geoserver.UploadGeoJSON.prototype.getGeoserverTree = function() {
	return this.geoserverTree();
};

/**
 * 지오서버 트리를 설정한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#setGeoserverTree
 * @param {function}
 *            fnc - 지오서버 트리 객체를 반환하는 함수
 */
gb.geoserver.UploadGeoJSON.prototype.setGeoserverTree = function(fnc) {
	this.geoserverTree = fnc;
};

/**
 * 업로드할 레이어 좌표계의 EPSG 코드를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getEPSGCode
 * @return {string} 좌표계의 EPSG 코드
 */
gb.geoserver.UploadGeoJSON.prototype.getEPSGCode = function() {
	return this.epsg;
};

/**
 * 업로드할 레이어 좌표계의 EPSG 코드를 설정한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#setEPSGCode
 * @param {string}
 *            code - 좌표계의 EPSG 코드
 */
gb.geoserver.UploadGeoJSON.prototype.setEPSGCode = function(code) {
	this.epsg = code;
};

/**
 * 업로드 URL 주소를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getUploadURL
 * @return {string} 업로드 URL 주소
 */
gb.geoserver.UploadGeoJSON.prototype.getUploadURL = function() {
	return this.url;
};

/**
 * 모달을 연다
 * 
 * @method gb.geoserver.UploadGeoJSON#open
 * @param {string}
 *            epsg - 업로드 할 레이어의 좌표계
 * @param {Array.
 *            <ol.layer.Vector>} layers - 업로드 할 벡터 레이어
 * @override
 */
gb.geoserver.UploadGeoJSON.prototype.open = function(epsg, layers) {
	var that = this;
	// 업로드 할 트리 객체 가져오기
	var tree = typeof this.getGeoserverTree === "function" ? this.getGeoserverTree() : undefined;
	if (tree === undefined) {
		return;
	}
	// jstree 객체 가져오기
	var jstree = tree.getJSTree();
	// 루트 노드 가져오기
	var root = jstree.get_node("#");
	console.log(root);
	// 루트의 자식 노드는 서버
	var servers = root.children;
	var serverLabel = $("<div>").text("GeoServer");
	var serversel = $("<select>").addClass("gb-form").addClass("gb-uploadgeojson-margin-bottom").change(function() {
		console.log("server change");
		// 선택한 서버 노드 가져오기
		var wnode = jstree.get_node($(serversel).find("option:selected").attr("nodeid"));
		// 서버 노드의 자식노드는 작업공간 노드
		var works = wnode.children;
		// 작업공간 노드의 자식노드 모음이 배열이 아님 -> 서버 노드 찾을 수 없음
		if (!Array.isArray(works)) {
			$(serversel).empty();
			var opt = $("<option>").attr({
				"value" : "noset"
			}).text(that.translation.noserver1[that.locale]);
			$(serversel).append(opt);
			// 작업공간 노드 배열의 길이가 0임 -> 작업공간이 없음
		} else if (works.length === 0 && wnode.state.loaded === false) {
			var rootNode = jstree.get_node("#");
			var nodes = root.children;
			var callback = function() {
				$(worksel).empty();
				var wnode2 = jstree.get_node($(serversel).find("option:selected").attr("nodeid"));
				var works2 = wnode2.children;
				if (wnode2.state.loaded === true && works2.length > 0) {
					console.log(works);
					for (var i = 0; i < works2.length; i++) {
						var node = jstree.get_node(works2[i]);
						var opt = $("<option>").attr({
							"value" : node.text,
							"nodeid" : node.id
						}).text(node.text);
						$(worksel).append(opt);
					}
					$(worksel).trigger("change");
				}
			};
			tree.initLoadingList();
			tree.initLoadingNumber();
			for (var i = 0; i < nodes.length; i++) {
				var pnodeid = nodes[i];
				console.log("선택한 노드:", pnodeid);
				console.log(tree.getLoadingList());
				tree.openNodeRecursive(i, jstree.get_node(nodes[i]), pnodeid, callback, true);
			}
		} else {
			$(worksel).empty();
			for (var i = 0; i < works.length; i++) {
				var node = jstree.get_node(works[i]);
				var opt = $("<option>").attr({
					"value" : node.text,
					"nodeid" : node.id
				}).text(node.text);
				$(worksel).append(opt);
			}
			$(worksel).trigger("change");
		}

	});
	if (servers.length === 0) {
		var opt = $("<option>").attr({
			"value" : "noset"
		}).text(this.translation.noserver1[this.locale]);
		$(serversel).append(opt);
	} else {
		for (var i = 0; i < servers.length; i++) {
			var node = jstree.get_node(servers[i]);
			var opt = $("<option>").attr({
				"value" : node.text,
				"nodeid" : node.id
			}).text(node.text);
			$(serversel).append(opt);
		}
	}
	var nowork = $("<option>").attr({
		"value" : "noset"
	}).text(this.translation.noset[this.locale]);
	var workLabel = $("<div>").text(this.translation.workspace[this.locale]);
	var worksel = $("<select>").addClass("gb-form").addClass("gb-uploadgeojson-margin-bottom").append(nowork).change(function() {
		console.log("work change");

		var snode = jstree.get_node($(worksel).find("option:selected").attr("nodeid"));
		var stores = snode.children;
		if (stores.length === 0 && snode.state.loaded === false) {
			var rootNode = jstree.get_node("#");
			var nodes = root.children;
			var callback = function() {
				$(storesel).empty();
				var snode2 = jstree.get_node($(worksel).find("option:selected").attr("nodeid"));
				var stores2 = snode2.children;
				if (snode2.state.loaded === true && stores2.length > 0) {
					console.log(stores);
					for (var i = 0; i < stores2.length; i++) {
						var node = jstree.get_node(stores2[i]);
						var opt = $("<option>").attr({
							"value" : node.text,
							"nodeid" : node.id
						}).text(node.text);
						$(storesel).append(opt);
					}
				}
			};
			tree.initLoadingList();
			tree.initLoadingNumber();
			for (var i = 0; i < nodes.length; i++) {
				var pnodeid = nodes[i];
				console.log("선택한 노드:", pnodeid);
				console.log(tree.getLoadingList());
				tree.openNodeRecursive(i, jstree.get_node(nodes[i]), pnodeid, callback, true);
			}
		} else {
			$(storesel).empty();
			for (var i = 0; i < stores.length; i++) {
				var node = jstree.get_node(stores[i]);
				var opt = $("<option>").attr({
					"value" : node.text,
					"nodeid" : node.id
				}).text(node.text);
				$(storesel).append(opt);
			}
		}
	});
	var nostore = $("<option>").attr({
		"value" : "noset"
	}).text(this.translation.noset[this.locale]);
	var storeLabel = $("<div>").text(this.translation.datastore[this.locale]);
	var storesel = $("<select>").addClass("gb-form").addClass("gb-uploadgeojson-margin-bottom").append(nostore);
	// 미발행 이름 중복 레이어 덮어쓰기 체크박스
	var ignoredup = $("<input>").attr({
		"type" : "checkbox"
	}).addClass("gb-uploadgeojson-checkbox");
	var ignoreLabel = $("<label>").append(ignoredup).append(this.translation.ignore[this.locale]);
	var ignoreArea = $("<div>").append(ignoreLabel).addClass("gb-uploadgeojson-ignore");
	var left = $("<div>").addClass("gb-uploadgeojson-left").append(serverLabel).append(serversel).append(workLabel).append(worksel).append(
			storeLabel).append(storesel).append(ignoreArea);

	var crsLabel = $("<div>").text(this.translation.crs[this.locale]);
	var epsgVal = $("<span>").text(epsg);
	var epsgArea = $("<div>").addClass("gb-form").append(epsgVal).addClass("gb-uploadgeojson-margin-bottom");
	var layerLabel = $("<div>").text(this.translation.slayer[this.locale]);
	var list = $("<div>").addClass("gb-form").addClass("gb-uploadgeojson-margin-bottom").addClass("gb-uploadgeojson-list");
	var ul = $("<ul>").addClass("gb-uploadgeojson-ul");
	if (Array.isArray(layers)) {
		var checkObj = {};
		var duplicateFlag = false;
		for (var i = 0; i < layers.length; i++) {
			var name = layers[i].get("name");
			if (!checkObj.hasOwnProperty(name)) {
				checkObj[name] = true;
			} else {
				duplicateFlag = true;
			}
			var span1 = $("<span>").addClass("gb-uploadgeojson-layer").text(layers[i].get("name"));
			var span2 = $("<span>").addClass("gb-uploadgeojson-icon");
			var li = $("<li>").addClass("gb-uploadgeojson-li").append(span1).append(span2);
			$(ul).append(li);
		}
		$(list).append(ul);
		if (duplicateFlag) {
			that.messageModal(that.translation.err[that.locale], that.translation.dupname[that.locale]);
			return;
		}
	}
	var right = $("<div>").addClass("gb-uploadgeojson-right").append(crsLabel).append(epsgArea).append(layerLabel).append(list);
	var bodyArea = $("<div>").addClass("gb-uploadgeojson-body").append(left).append(right);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.upload[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);
	var uploadModal = new gb.modal.ModalBase({
		"title" : this.translation.uploadgeojson[this.locale],
		"width" : 440,
		"autoOpen" : true,
		"body" : bodyArea,
		"footer" : modalFooter
	});

	$(serversel).trigger("change");

	$(closeBtn).click(function() {
		uploadModal.close();
	});
	$(okBtn).click(function() {
		var sendObj = {};
		var server = $(serversel).val();
		if (server === "noset" || server === "" || server === undefined) {
			that.messageModal(that.translation.err[that.locale], that.translation.noserver2[that.locale]);
			return;
		}
		sendObj["serverName"] = server;
		var work = $(worksel).val();
		if (work === "noset" || work === "" || work === undefined) {
			that.messageModal(that.translation.err[that.locale], that.translation.nowork[that.locale]);
			return;
		}
		sendObj["workspace"] = work;
		var store = $(storesel).val();
		if (store === "noset" || store === "" || store === undefined) {
			that.messageModal(that.translation.err[that.locale], that.translation.nostore[that.locale]);
			return;
		}
		sendObj["datastore"] = store;
		var epsg = $(epsgVal).text();
		var epsgid = epsg.substring((epsg.indexOf("EPSG:") + 5));
		if (epsgid === "" || epsgid === undefined) {
			that.messageModal(that.translation.err[that.locale], that.translation.nocrs[that.locale]);
			return;
		}
		sendObj["epsg"] = epsgid;
		var ignore = $(ignoredup).is(":checked");
		sendObj["ignorePublication"] = !!ignore;
		var uploadJson = [];
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			var obj = {};
			obj["layername"] = layer.get("name");
			var source = layer.getSource();
			if (source instanceof ol.source.Vector) {
				var geojson = new ol.format.GeoJSON();
				var geoobj = geojson.writeFeaturesObject(source.getFeatures());
				obj["geojson"] = geoobj;
			}
			var attJson = {};
			var git = layer.get("git");
			var attributes = git.attribute;
			if (attributes !== undefined && Array.isArray(attributes)) {
				for (var j = 0; j < attributes.length; j++) {
					var attr = attributes[j];
					attJson[attr.getOriginFieldName()] = attr.getType();
				}
				obj["attjson"] = attJson;
			}
			uploadJson.push(obj);
		}
		sendObj["uploadJson"] = uploadJson;
		console.log(sendObj);
		that.sendJSON(sendObj, uploadModal, ul, tree);
	});
};

/**
 * 지오서버를 설정한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#setGeoServer
 * @param {string}
 *            geoserver - 설정할 지오서버의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.setGeoServer = function(geoserver) {
	this.geoserver = geoserver;
}

/**
 * 지오서버를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getGeoServer
 * @return {string} 설정한 지오서버의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.getGeoServer = function() {
	return this.geoserver;
}

/**
 * 워크스페이스를 설정한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#setWorkspace
 * @param {string}
 *            workspace - 설정할 워크스페이스의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.setWorkspace = function(workspace) {
	this.workspace = workspace;
}

/**
 * 워크스페이스를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getWorkspace
 * @return {string} 설정한 워크스페이스의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.getWorkspace = function() {
	return this.workspace;
}

/**
 * 데이터스토어를 설정한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#setDatastore
 * @param {string}
 *            datastore - 설정할 데이터스토어의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.setDatastore = function(datastore) {
	this.datastore = datastore
}

/**
 * 데이터스토어를 반환한다.
 * 
 * @method gb.geoserver.UploadGeoJSON#getDatastore
 * @return {string} 설정한 데이터스토어의 이름
 */
gb.geoserver.UploadGeoJSON.prototype.getDatastore = function() {
	return this.datastore;
}

/**
 * JSON 객체를 전송한다.
 * 
 * @private
 * @method gb.geoserver.UploadGeoJSON#sendJSON
 * @param {Object}
 *            obj - 서버에 업로드할 레이어 정보
 * @param {gb.modal.ModalBase}
 *            modal - 업로드 후 닫을 모달 객체
 * @param {HTMLElement}
 *            ul - 레이어 이름이 표시될 UL 태그 영역
 * @param {gb.tree.GeoServer}
 *            tree - 업로드 완료 후 새로고침 될 지오서버 레이어 목록 객체
 */
gb.geoserver.UploadGeoJSON.prototype.sendJSON = function(obj, modal, ul, tree) {
	var that = this;
	var toJSON = function(str) {
		return (str).replace(/(^\?)/, '').split("&").map(function(n) {
			return n = n.split("="), this[n[0]] = n[1], this
		}.bind({}))[0];
	}
	var url = this.getUploadURL();
	if (url.indexOf("?") !== -1) {
		var paramstr = url.substring(url.indexOf("?") + 1);
		console.log(paramstr);
		var queryJson = toJSON(paramstr);
		console.log(queryJson);
		if (queryJson.hasOwnProperty("_csrf")) {

		}
	}

	var tranURL = this.getUploadURL();
	$.ajax(
			{
				url : tranURL,
				method : "POST",
				contentType : "application/json; charset=UTF-8",
				data : JSON.stringify(obj),
				dataType : 'json',
				beforeSend : function() {
					// $("body").css("cursor", "wait");
				},
				complete : function() {
					// $("body").css("cursor", "default");
				},
				success : function(data) {
					console.log(data);
					if (data.status_Code === 200) {
						tree.refreshList();
						var layers = data.layers;
						var lilayers = $(ul).children("li");
						if (Array.isArray(layers)) {
							for (var i = 0; i < layers.length; i++) {
								for (var j = 0; j < lilayers.length; j++) {
									var litext = $(lilayers[j]).find(".gb-uploadgeojson-layer").text();
									console.log(litext);
									if (layers[i][litext] !== undefined) {
										var iconSpan = $(lilayers[j]).find(".gb-uploadgeojson-icon");
										$(iconSpan).empty();
										if (layers[i][litext] === 200) {
											var icon = $("<i>").addClass("fas").addClass("fa-check").addClass(
													"gb-geoserver-uploadjson-valid-icon");
											$(iconSpan).append(icon);
										} else {
											var icon = $("<i>").addClass("fas").addClass("fa-times").addClass(
													"gb-geoserver-uploadjson-invalid-icon");
											var msg = $("<span>").text(that.translation[layers[i][litext]][that.locale]);
											$(iconSpan).append(icon);
											$(lilayers[j]).attr({
												"title" : that.translation[layers[i][litext]][that.locale]
											});
										}
									}
								}
							}
						}
						// modal.close();
					} else {
						that.errorModal(data.status_Code);
					}
				}
			}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
}

/**
 * 오류 코드에 따른 메세지를 보여준다
 * 
 * @private
 * @method gb.geoserver.UploadGeoJSON#errorModal
 * @param {string}
 *            code - 오류 코드
 */
gb.geoserver.UploadGeoJSON.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @private
 * @method gb.geoserver.UploadGeoJSON#messageModal
 * @param {string}
 *            title - 모달 제목
 * @param {msg}
 *            msg - 메세지 내용
 */
gb.geoserver.UploadGeoJSON.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").append(msg).addClass("gb-uploadgeojson-msg-body");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.ok[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 390,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};