/**
 * GeoGig feature 변경이력 객체를 정의한다.
 * 
 * @class gb.versioning.Feature
 * @memberof gb.versioning
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {string}
 *            obj.locale - 사용할 언어 ko | en
 * @param {Object}
 *            obj.url - 요청을 수행할 URL
 * @param {string}
 *            obj.url.featureLog - 피처의 이력 조회를 요청할 URL ex)/featureLog.do
 * @param {string}
 *            obj.url.diff - 피처간의 비교를 요청할 URL ex)/diff.do
 * @param {string}
 *            obj.url.featureRevert - 피처의 되돌리기를 요청할 URL ex)/featureRevert.do
 * @param {string}
 *            obj.url.featureAttribute - 피처의 속성 조회를 요청할 URL
 *            ex)/featureAttribute.do
 * @param {string}
 *            obj.url.catFeatureObject - 피처의 변경된 속성 조회를 요청할 URL
 *            ex)/catFeatureObject.do
 * @author SOYIJUN
 */
gb.versioning.Feature = function(obj) {
	var that = this;
	/**
	 * 번역 정보
	 * 
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"refresh" : {
			"ko" : "새로고침",
			"en" : "Refresh"
		},
		"author" : {
			"ko" : "작성자",
			"en" : "Author"
		},
		"time" : {
			"ko" : "시간",
			"en" : "Time"
		},
		"type" : {
			"ko" : "변경종류",
			"en" : "Type"
		},
		"changes" : {
			"ko" : "변경사항",
			"en" : "Changes"
		},
		"revert" : {
			"ko" : "되돌리기",
			"en" : "Revert"
		},
		"readmore" : {
			"ko" : "더 보기",
			"en" : "Read More"
		},
		"detail" : {
			"ko" : "자세히",
			"en" : "Detail"
		},
		"cmft" : {
			"ko" : "커밋된 객체",
			"en" : "Commited Feature"
		},
		"name" : {
			"ko" : "이름",
			"en" : "Name"
		},
		"value" : {
			"ko" : "값",
			"en" : "Value"
		},
		"latestft" : {
			"ko" : "최신 객체",
			"en" : "Latest Feature"
		},
		"use" : {
			"ko" : "사용",
			"en" : "Use"
		},
		"contrastchg" : {
			"ko" : "변경사항 비교",
			"en" : "Contrast The Changes"
		},
		"revertmsg1" : {
			"ko" : "해당 커밋 시점으로 객체를 되돌립니다.",
			"en" : "Revert the feature to the point in time when it was committed."
		},
		"revertmsg2" : {
			"ko" : "진행하시겠습니까?",
			"en" : 'Do you want to proceed?'
		},
		"revertsucc" : {
			"ko" : "객체가 성공적으로 되돌려졌습니다.",
			"en" : "Feature reverted successfully."
		},
		"revertfail" : {
			"ko" : "되돌리기 실패했습니다.",
			"en" : "Revert failed."
		},
		"conflictmsg1" : {
			"ko" : "충돌 객체가 있습니다. 해결하시겠습니까?",
			"en" : 'There are conflicting features. Do you want to resolve?'
		},
		"resolve" : {
			"ko" : "해결하기",
			"en" : 'Resolve'
		},
		"revertingft" : {
			"ko" : "객체 되돌리기",
			"en" : "Reverting Feature"
		},
		"ourft" : {
			"ko" : "현재 객체",
			"en" : "Current Feature"
		},
		"theirft" : {
			"ko" : "원격 객체",
			"en" : "Remote Feature"
		},
		"conflft" : {
			"ko" : "충돌 객체",
			"en" : "Conflicted Feature"
		},
		"override" : {
			"ko" : "덮어쓰기",
			"en" : "Overwrite"
		},
		"compaconfl" : {
			"ko" : "충돌객체 비교",
			"en" : "Compare Conflicts"
		},
		"retreveftfail" : {
			"ko" : "되돌리기에 실패했습니다.",
			"en" : "Retrieve feature failed."
		},
		"deleted" : {
			"ko" : "삭제됨",
			"en" : "Deleted"
		},
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"message" : {
			"ko" : "알림",
			"en" : "Message"
		},
		"nocommit" : {
			"ko" : "불러올 이력이 없습니다.",
			"en" : "No commits to load"
		},
		"run" : {
			"ko" : "수행",
			"en" : "Run"
		},
		"commitdesc" : {
			"ko" : "이 작업에 대한 설명을 입력해 주세요.",
			"en" : 'Please provide a description of this action.'
		},
		"detail" : {
			"ko" : "세부정보",
			"en" : "Detail"
		}
	};
	var options = obj ? obj : {};
	this.epsg = options.epsg ? options.epsg : undefined;
	this.editingTool = options.editingTool ? options.editingTool : undefined;
	var url = options.url ? options.url : {};
	this.featureLogURL = url.featureLog ? url.featureLog : undefined;
	this.diffURL = url.diff ? url.diff : undefined;
	this.catFeatureObjectURL = url.catFeatureObject ? url.catFeatureObject : undefined;
	this.featureRevertURL = url.featureRevert ? url.featureRevert : undefined;
	this.featureAttributeURL = url.featureAttribute ? url.featureAttribute : undefined;
	this.locale = options.locale ? options.locale : "en";

	/**
	 * 디테일 창에서 왼쪽 지도 영역
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.ofeature = $("<div>").addClass("gb-feature-map-body");
	/**
	 * 디테일 창에서 오른쪽 지도 영역
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.cfeature = $("<div>").addClass("gb-feature-map-body");
	/**
	 * 디테일 창에서 왼쪽 지도(커밋된 객체)
	 * 
	 * @private
	 * @type {ol.Map}
	 */
	this.omap = new ol.Map({
		"target" : $(this.ofeature)[0],
		"layers" : []
	});
	/**
	 * 디테일 창에서 오른쪽 지도(최신 객체)
	 * 
	 * @private
	 * @type {ol.Map}
	 */
	this.cmap = new ol.Map({
		"target" : $(this.cfeature)[0],
		"layers" : []
	});
	/**
	 * 충돌피처 영역(우리꺼)
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.comfeature = $("<div>").addClass("gb-feature-map-body");
	/**
	 * 충돌피처 영역(그들꺼)
	 * 
	 * @private
	 * @type {HTMLElement}
	 */
	this.curfeature = $("<div>").addClass("gb-feature-map-body");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.tbody = $("<div>").addClass("tbody").addClass("gb-versioning-feature-trg");
	/**
	 * @private
	 * @type {gb.panel.PanelBase}
	 */
	this.panel = new gb.panel.PanelBase({
		"width" : 500,
		"height" : 550,
		"positionX" : 4,
		"right" : true,
		"positionY" : 395,
		"autoOpen" : false
	});

	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	// 새로고침 버튼
	var refBtn = $("<button>").addClass("gb-button-clear").append(refIcon).append(" " + that.translation.refresh[that.locale]).click(
			function() {
				that.refresh();
			});
	var refBtnarea = $("<div>").addClass("gb-feature-text-center").append(refBtn);

	var th1 = $("<div>").addClass("th").addClass("gb-versioning-feature-td").text(that.translation.author[that.locale]);
	var th2 = $("<div>").addClass("th").addClass("gb-versioning-feature-td").text(that.translation.time[that.locale]);
	var th3 = $("<div>").addClass("th").addClass("gb-versioning-feature-td").text(that.translation.type[that.locale]);
	var th4 = $("<div>").addClass("th").addClass("gb-versioning-feature-td").text(that.translation.detail[that.locale]).addClass(
			"gb-feature-text-center");
	var th5 = $("<div>").addClass("th").addClass("gb-versioning-feature-td").text(that.translation.revert[that.locale]);
	var thr = $("<div>").addClass("tr").addClass("gb-versioning-feature-tr").append(th1).append(th2).append(th3).append(th4);
	var thead = $("<div>").addClass("thead").addClass("gb-versioning-feature-trg").append(thr);

	var table = $("<div>").addClass("gb-table").addClass("gb-feature-history-table").append(thead).append(this.tbody);

	var moreIcon = $("<i>").addClass("fas").addClass("fa-caret-down");
	// 더 보기 버튼
	var btn = $("<button>").addClass("gb-button-clear").append(moreIcon).append(" " + that.translation.readmore[that.locale]).click(
			function() {
				var geoserver = that.getServer();
				var repo = that.getRepo();
				var path = that.getPath();
				var until = $(that.getTBody()).find(".gb-versioning-feature-tr").last().find(".gb-button-clear").val();
				var idx = $(that.getTBody()).find(".gb-versioning-feature-tr").last().find(".gb-button-clear").attr("idx");
				var head = $(that.getTBody()).find(".gb-versioning-feature-tr").first().find(".gb-button-clear").val();
				that.loadFeatureHistory(geoserver, repo, path, 6, idx, until, head, false);
			});
	var btnarea = $("<div>").addClass("gb-feature-text-center").append(btn);
	var body = $("<div>").addClass("gb-feature-body").append(refBtnarea).append(table).append(btnarea);
	this.panel.setPanelBody(body);

	this.commits = {};
	this.curServer;
	this.curRepo;
	this.curPath;
	this.idstring;
	this.feature;
};
gb.versioning.Feature.prototype = Object.create(gb.versioning.Feature.prototype);
gb.versioning.Feature.prototype.constructor = gb.versioning.Feature;

/**
 * 피처 이력창을 닫는다.
 * 
 * @method gb.versioning.Feature#close
 */
gb.versioning.Feature.prototype.close = function() {
	this.getPanel().close();
}
/**
 * 피처 이력창을 연다.
 * 
 * @method gb.versioning.Feature#open
 */
gb.versioning.Feature.prototype.open = function() {
	this.panel.open();
};

/**
 * 피처 이력을 요청한다.
 * 
 * @private
 * @method gb.versioning.Feature#loadFeatureHistory
 * @param {string}
 *            server - 등록한 GeoServer의 이름
 * @param {string}
 *            repo - 레이어가 저장된 GeoGig 저장소의 이름
 * @param {string}
 *            path - 이력을 조회할 피처의 path
 * @param {(string|number)}
 *            limit - 불러올 이력의 개수
 * @param {(string|number)}
 *            idx - 새로 불러올 이력의 인덱스
 * @param {string}
 *            until - 새로 불러올 이력의 기준이 될 이력(특정하면 그 이력 이전에 발생한 변경사항만 가져옴)
 * @param {string}
 *            head - 현재 불러온 이력 중 최신 이력
 * @param {boolean}
 *            refresh - 현재 요청이 새로고침 요청인지 여부
 */
gb.versioning.Feature.prototype.loadFeatureHistory = function(server, repo, path, limit, idx, until, head, refresh) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"path" : path,
		"limit" : limit
	}
	if (until !== undefined) {
		params["until"] = until;
	}
	if (head !== undefined) {
		params["head"] = head;
	}
	if (idx !== undefined) {
		params["index"] = idx;
	}
	if (until === undefined || head === undefined) {
		if (this.getIDString() !== server + "/" + repo + "/" + path) {
			this.clearChangesTbody();
		}
	}
	var tranURL = this.getFeatureLogURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);

			if (data.success === "true") {
				if (refresh) {
					that.clearChangesTbody();
				}
				// 아이디 생성
				that.setIDString(server + "/" + repo + "/" + path);
				if (Array.isArray(data.simpleCommits)) {
					that.setCommitsByInfo(server, repo, path);
				}
				// 이력 출력
				for (var i = 0; i < data.simpleCommits.length; i++) {
					if ((until !== undefined || head !== undefined) && (i === 0)) {
						var early = $(that.getTBody()).find(".gb-versioning-feature-tr").last().find(".gb-button-clear").val();
						if (data.simpleCommits[i].commitId === early) {
							if (data.simpleCommits.length === 1) {
								var title = that.translation.message[that.locale];
								var msg = that.translation.nocommit[that.locale];
								that.messageModal(title, msg);
							}
							continue;
						}
					}
					var td1 = $("<div>").addClass("td").addClass("gb-versioning-feature-td").append(data.simpleCommits[i].authorName);
					var td2 = $("<div>").addClass("td").addClass("gb-versioning-feature-td").append(data.simpleCommits[i].date).addClass(
							"gb-feature-history-cell-date");
					var td3 = $("<div>").addClass("td").addClass("gb-versioning-feature-td").append(data.simpleCommits[i].changeType)
							.addClass("gb-feature-history-cell-type");
					var detailIcon = $("<i>").addClass("fas").addClass("fa-list");
					var button = $("<button>").addClass("gb-button-clear").addClass("gb-versioning-feature-detail-btn").append(detailIcon)
							.attr({
								"title" : data.simpleCommits[i].message,
								"value" : data.simpleCommits[i].commitId,
								"idx" : data.simpleCommits[i].cIdx
							}).click(function() {
								var geoserver = that.getServer();
								var repo = that.getRepo();
								var path = that.getPath();
								// var nidx = parseInt($(this).attr("idx"));
								// var nidx = 0;
								// var oidx = parseInt($(this).attr("idx"));
								var oidx = $(this).val();
								var nidx = $(that.getTBody()).find(".gb-versioning-feature-tr").first().find(".gb-button-clear").val();
								// var oidx =
								// $(that.getTBody()).find(".gb-versioning-feature-tr").last().find(".gb-button").attr("idx");
								that.openDetailChanges(geoserver, repo, path, nidx, oidx);
							});
					var td4 = $("<div>").addClass("td").addClass("gb-versioning-feature-td").append(button).addClass(
							"gb-feature-text-center");
					/*
					 * var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
					 * var rvButton = $("<button>").addClass("gb-button-clear").addClass("gb-versioning-feature-revert-btn").append(refIcon)
					 * .click(function() { var geoserver = that.getServer(); var
					 * repo = that.getRepo(); var path = that.getPath(); var
					 * ocommit =
					 * $(this).parents().eq(1).find(".gb-versioning-feature-detail-btn").val();
					 * var ncommit =
					 * $(this).parents().eq(2).children().first().find(".gb-versioning-feature-detail-btn").val();
					 * that.openRevertModal(geoserver, repo, path, ocommit,
					 * ncommit); }); var td5 = $("<div>").addClass("td").addClass("gb-versioning-feature-td").css({
					 * "text-align" : "center", "width" : "100px"
					 * }).append(rvButton);
					 */

					if (i === 0) {
						$(button).prop("disabled", true);
						// $(rvButton).prop("disabled", true);
					}

					var msg = $("<div>").addClass("gb-tooltip-text").text(data.simpleCommits[i].message);
					var tr = $("<div>").addClass("tr").addClass("gb-versioning-feature-tr").addClass("gb-tooltip").append(td1).append(td2)
							.append(td3).append(td4);
					$(that.tbody).append(tr);
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});
};

/**
 * 피처 디테일 창을 연다.
 * 
 * @private
 * @method gb.versioning.Feature#openDetailChanges
 * @param {string}
 *            server - GeoServer 이름
 * @param {string}
 *            repo - GeoGig 저장소 이름
 * @param {string}
 *            path - 피처 path
 * @param {number}
 *            nid - 최신 커밋 아이디
 * @param {number}
 *            oid - 타겟 커밋 아이디
 */
gb.versioning.Feature.prototype.openDetailChanges = function(server, repo, path, nid, oid) {
	var that = this;

	// 커밋된 피처 영역 시작
	var olabel = $("<div>").append(that.translation.cmft[that.locale]).addClass("gb-form").addClass("gb-feature-text-center");

	var oheadtd1 = $("<th>").text(that.translation.name[that.locale]);
	var oheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var oheadth = $("<tr>").append(oheadtd1).append(oheadtd2);
	var oattrthead = $("<thead>").append(oheadth);
	this.oattrtbody = $("<tbody>").addClass("gb-feature-attr-tbody");
	var oattrtable = $("<table>").append(oattrthead).append(this.oattrtbody).addClass("gb-table");
	var oattribute = $("<div>").append(oattrtable).addClass("gb-feature-attr-table-area");
	var oarea = $("<div>").append(olabel).append(this.ofeature).append(oattribute).addClass("gb-feature-attr-area-half");
	// 커밋 피처 영역 끝
	// 최신 피처 영역 시작
	var clabel = $("<div>").append(that.translation.latestft[that.locale]).addClass("gb-form").addClass("gb-feature-text-center");

	var cheadtd1 = $("<th>").text(that.translation.name[that.locale]);
	var cheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var cheadth = $("<tr>").append(cheadtd1).append(cheadtd2);
	var cattrthead = $("<thead>").append(cheadth);
	this.cattrtbody = $("<tbody>").addClass("gb-feature-attr-tbody");
	var cattrtable = $("<table>").append(cattrthead).append(this.cattrtbody).addClass("gb-table");
	// .css({
	// "width" : "100%",
	// "table-layout" : "fixed"
	// });
	var cattribute = $("<div>").append(cattrtable).addClass("gb-feature-attr-table-area");

	$(this.oattrtbody).on("scroll", function() {
		$(that.cattrtbody).prop("scrollTop", this.scrollTop).prop("scrollLeft", this.scrollLeft);
	});

	var carea = $("<div>").append(clabel).append(this.cfeature).append(cattribute).addClass("gb-feature-attr-area-half");
	// 최신 피처 영역 끝

	var ocarea = $("<div>").addClass("gb-feature-compare-area").append(oarea).append(carea);

	var body = $("<div>").append(ocarea);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.close[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-left").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.revert[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : that.translation.contrastchg[that.locale],
		"width" : 770,
		"height" : 840,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		that.openRevertModal(server, repo, path, oid, nid, modal);
	});
	$(closeBtn).click(function() {
		modal.close();
	});

	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"path" : path,
		"newCommitId" : nid,
		"oldCommitId" : oid
	}

	var tranURL = this.getDiffURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				if (data.hasOwnProperty("diffs")) {
					var diffs = data.diffs
					if (Array.isArray(diffs)) {
						if (diffs.length === 1) {
							var elem = diffs[0];

							var oldParams = {
								"serverName" : server,
								"repoName" : repo,
								"path" : elem.path,
								"commitId" : elem.oldObjectId
							}
							console.log(oldParams);

							var oldURL = that.getCatFeatureObjectURL();
							if (oldURL.indexOf("?") !== -1) {
								oldURL += "&";
								oldURL += jQuery.param(oldParams);
							} else {
								oldURL += "?";
								oldURL += jQuery.param(oldParams);
							}

							$.ajax({
								url : oldURL,
								method : "POST",
								contentType : "application/json; charset=UTF-8",
								beforeSend : function() {
									// $("body").css("cursor", "wait");
								},
								complete : function() {
									// $("body").css("cursor", "default");
								},
								success : function(data_old) {
									console.log(data_old);
									if (data_old.success === "true" && data_old.error === null) {
										var attr = data_old.attributes;
										for (var i = 0; i < attr.length; i++) {
											if (attr[i].crs !== null
													&& (attr[i].type === "MULTIPOLYGON" || attr[i].type === "MULTILINESTRING"
															|| attr[i].type === "MULTIPOINT" || attr[i].type === "POLYGON"
															|| attr[i].type === "LINESTRING" || attr[i].type === "POINT")) {
												var crs = attr[i].crs.substring(attr[i].crs.indexOf(":") + 1);

												var oldwkt = attr[i].value;
												if (oldwkt !== undefined && oldwkt !== null) {
													var format = new ol.format.WKT();
													var geom = format.readGeometry(oldwkt);
													var feature = new ol.Feature({
														"geometry" : geom
													});

													var style = new ol.style.Style({
														image : new ol.style.Circle({
															radius : 5,
															fill : new ol.style.Fill({
																color : 'orange'
															})
														}),
														stroke : new ol.style.Stroke({
															width : 1,
															color : 'orange'
														}),
														fill : new ol.style.Fill({
															color : 'orange'
														})
													});

													var vlayer = new ol.layer.Vector({
														"style" : style,
														"source" : new ol.source.Vector({
															"features" : [ feature ]
														}),
														"zIndex" : 2
													});

													var osm = new ol.layer.Tile({
														"source" : new ol.source.OSM(),
														"zIndex" : 1
													});

													that.getLeftMap().updateSize();
													that.getLeftMap().getLayers().clear();
													that.getLeftMap().addLayer(osm);
													that.getLeftMap().addLayer(vlayer);
													// that.getLeftMap().getView().fit(geom);

													// this.leftcrs = new
													// gb.crs.BaseCRS({
													// "autoOpen" : false,
													// "title" : "Base CRS",
													// "message" :
													// $(".epsg-now"),
													// "maps" : [
													// that.getLeftMap() ],
													// "epsg" : crs,
													// "callback" : function() {
													// that.getLeftMap().getView().fit(geom);
													// }
													// });
												}
											} else {
												var otd1 = $("<td>").text(attr[i].name);
												var otd2 = $("<td>").text(attr[i].value);
												var otr1 = $("<tr>").append(otd1).append(otd2);
												$(that.getLeftTBody()).append(otr1);
											}
										}
									}
								}
							});

							var newParams = {
								"serverName" : server,
								"repoName" : repo,
								"path" : elem.newPath,
								"commitId" : elem.newObjectId
							}
							console.log(newParams);

							var newURL = that.getCatFeatureObjectURL();
							if (newURL.indexOf("?") !== -1) {
								newURL += "&";
								newURL += jQuery.param(newParams);
							} else {
								newURL += "?";
								newURL += jQuery.param(newParams);
							}

							$.ajax({
								url : newURL,
								method : "POST",
								contentType : "application/json; charset=UTF-8",
								beforeSend : function() {
									// $("body").css("cursor", "wait");
								},
								complete : function() {
									// $("body").css("cursor", "default");
								},
								success : function(data_new) {
									console.log(data_new);
									if (data_new.success === "true" && data_new.error === null) {
										var attr = data_new.attributes;
										for (var i = 0; i < attr.length; i++) {
											if (attr[i].crs !== null
													&& (attr[i].type === "MULTIPOLYGON" || attr[i].type === "MULTILINESTRING"
															|| attr[i].type === "MULTIPOINT" || attr[i].type === "POLYGON"
															|| attr[i].type === "LINESTRING" || attr[i].type === "POINT")) {
												var crs = attr[i].crs.substring(attr[i].crs.indexOf(":") + 1);

												var newwkt = attr[i].value;
												if (newwkt !== undefined && newwkt !== null) {
													var format = new ol.format.WKT();
													var geom = format.readGeometry(newwkt);
													var feature = new ol.Feature({
														"geometry" : geom
													});

													var style = new ol.style.Style({
														image : new ol.style.Circle({
															radius : 5,
															fill : new ol.style.Fill({
																color : 'orange'
															})
														}),
														stroke : new ol.style.Stroke({
															width : 1,
															color : 'orange'
														}),
														fill : new ol.style.Fill({
															color : 'orange'
														})
													});

													var vlayer = new ol.layer.Vector({
														"style" : style,
														"source" : new ol.source.Vector({
															"features" : [ feature ]
														}),
														"zIndex" : 2
													});

													var osm = new ol.layer.Tile({
														"source" : new ol.source.OSM(),
														"zIndex" : 1
													});

													that.getRightMap().updateSize();
													that.getRightMap().getLayers().clear();
													that.getRightMap().addLayer(osm);
													that.getRightMap().addLayer(vlayer);
													// that.getLeftMap().getView().fit(geom);

													this.crs = new gb.crs.BaseCRS({
														"autoOpen" : false,
														"title" : "Base CRS",
														"message" : $(".epsg-now"),
														"maps" : [ that.getLeftMap(), that.getRightMap() ],
														"epsg" : crs,
														"callback" : function() {
															that.getRightMap().getView().fit(geom);
														}
													});
												}
											} else {
												var ctd1 = $("<td>").text(attr[i].name);
												var ctd2 = $("<td>").text(attr[i].value);
												var ctr1 = $("<tr>").append(ctd1).append(ctd2);
												$(that.getRightTBody()).append(ctr1);
											}
										}
									}
								}
							});
						}
					} else {

						var oldParams = {
							"serverName" : server,
							"repoName" : repo,
							"path" : path,
							"commitId" : oid
						}
						console.log(oldParams);

						var oldURL = that.getFeatureAttributeURL();
						if (oldURL.indexOf("?") !== -1) {
							oldURL += "&";
							oldURL += jQuery.param(oldParams);
						} else {
							oldURL += "?";
							oldURL += jQuery.param(oldParams);
						}

						$.ajax({
							url : oldURL,
							method : "POST",
							contentType : "application/json; charset=UTF-8",
							beforeSend : function() {
								// $("body").css("cursor", "wait");
							},
							complete : function() {
								// $("body").css("cursor", "default");
							},
							success : function(data_old) {
								console.log(data_old);
								if (data_old.success === "true" && data_old.error === null) {
									var attr = data_old.attributes;
									for (var i = 0; i < attr.length; i++) {
										if (attr[i].crs !== null
												&& (attr[i].type === "MULTIPOLYGON" || attr[i].type === "MULTILINESTRING"
														|| attr[i].type === "MULTIPOINT" || attr[i].type === "POLYGON"
														|| attr[i].type === "LINESTRING" || attr[i].type === "POINT")) {
											var crs = attr[i].crs.substring(attr[i].crs.indexOf(":") + 1);

											var oldwkt = attr[i].value;
											if (oldwkt !== undefined && oldwkt !== null) {
												var format = new ol.format.WKT();
												var geom = format.readGeometry(oldwkt);
												var feature = new ol.Feature({
													"geometry" : geom
												});

												var style = new ol.style.Style({
													image : new ol.style.Circle({
														radius : 5,
														fill : new ol.style.Fill({
															color : 'orange'
														})
													}),
													stroke : new ol.style.Stroke({
														width : 1,
														color : 'orange'
													}),
													fill : new ol.style.Fill({
														color : 'orange'
													})
												});

												var vlayer = new ol.layer.Vector({
													"style" : style,
													"source" : new ol.source.Vector({
														"features" : [ feature ]
													}),
													"zIndex" : 2
												});

												var osm = new ol.layer.Tile({
													"source" : new ol.source.OSM(),
													"zIndex" : 1
												});

												that.getLeftMap().updateSize();
												that.getLeftMap().getLayers().clear();
												that.getLeftMap().addLayer(osm);
												that.getLeftMap().addLayer(vlayer);
												// that.getLeftMap().getView().fit(geom);

												// this.leftcrs = new
												// gb.crs.BaseCRS({
												// "autoOpen" : false,
												// "title" : "Base CRS",
												// "message" :
												// $(".epsg-now"),
												// "maps" : [
												// that.getLeftMap() ],
												// "epsg" : crs,
												// "callback" : function() {
												// that.getLeftMap().getView().fit(geom);
												// }
												// });
											}
										} else {
											var otd1 = $("<td>").text(attr[i].name);
											var otd2 = $("<td>").text(attr[i].value);
											var otr1 = $("<tr>").append(otd1).append(otd2);
											$(that.getLeftTBody()).append(otr1);
										}
									}
								}
							}
						});

						var newParams = {
							"serverName" : server,
							"repoName" : repo,
							"path" : path,
							"commitId" : nid
						}
						console.log(newParams);

						var newURL = that.getFeatureAttributeURL();
						if (newURL.indexOf("?") !== -1) {
							newURL += "&";
							newURL += jQuery.param(newParams);
						} else {
							newURL += "?";
							newURL += jQuery.param(newParams);
						}

						$.ajax({
							url : newURL,
							method : "POST",
							contentType : "application/json; charset=UTF-8",
							beforeSend : function() {
								// $("body").css("cursor", "wait");
							},
							complete : function() {
								// $("body").css("cursor", "default");
							},
							success : function(data_new) {
								console.log(data_new);
								if (data_new.success === "true" && data_new.error === null) {
									var attr = data_new.attributes;
									for (var i = 0; i < attr.length; i++) {
										if (attr[i].crs !== null
												&& (attr[i].type === "MULTIPOLYGON" || attr[i].type === "MULTILINESTRING"
														|| attr[i].type === "MULTIPOINT" || attr[i].type === "POLYGON"
														|| attr[i].type === "LINESTRING" || attr[i].type === "POINT")) {
											var crs = attr[i].crs.substring(attr[i].crs.indexOf(":") + 1);

											var newwkt = attr[i].value;
											if (newwkt !== undefined && newwkt !== null) {
												var format = new ol.format.WKT();
												var geom = format.readGeometry(newwkt);
												var feature = new ol.Feature({
													"geometry" : geom
												});

												var style = new ol.style.Style({
													image : new ol.style.Circle({
														radius : 5,
														fill : new ol.style.Fill({
															color : 'orange'
														})
													}),
													stroke : new ol.style.Stroke({
														width : 1,
														color : 'orange'
													}),
													fill : new ol.style.Fill({
														color : 'orange'
													})
												});

												var vlayer = new ol.layer.Vector({
													"style" : style,
													"source" : new ol.source.Vector({
														"features" : [ feature ]
													}),
													"zIndex" : 2
												});

												var osm = new ol.layer.Tile({
													"source" : new ol.source.OSM(),
													"zIndex" : 1
												});

												that.getRightMap().updateSize();
												that.getRightMap().getLayers().clear();
												that.getRightMap().addLayer(osm);
												that.getRightMap().addLayer(vlayer);
												// that.getLeftMap().getView().fit(geom);

												this.crs = new gb.crs.BaseCRS({
													"autoOpen" : false,
													"title" : "Base CRS",
													"message" : $(".epsg-now"),
													"maps" : [ that.getLeftMap(), that.getRightMap() ],
													"epsg" : crs,
													"callback" : function() {
														that.getRightMap().getView().fit(geom);
													}
												});
											}
										} else {
											var ctd1 = $("<td>").text(attr[i].name);
											var ctd2 = $("<td>").text(attr[i].value);
											var ctr1 = $("<tr>").append(ctd1).append(ctd2);
											$(that.getRightTBody()).append(ctr1);
										}
									}
								}
							}
						});
					}
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});

};

/**
 * 피처 revert 요청 모달을 연다.
 * 
 * @private
 * @method gb.versioning.Feature#openRevertModal
 * @param {string}
 *            server - GeoServer 이름
 * @param {string}
 *            repo - GeoGig 저장소
 * @param {string}
 *            path - 피처 path
 * @param {string}
 *            oc - 되돌릴 이전 커밋 아이디
 * @param {string}
 *            nc - 새로운 커밋 아이디
 * @param {gb.modal.ModalBase}
 *            cmpmodal - 요청 완료 후 닫을 모달 객체
 */
gb.versioning.Feature.prototype.openRevertModal = function(server, repo, path, oc, nc, cmpmodal) {
	var that = this;
	var msg1 = $("<div>").text(that.translation.revertmsg1[that.locale]).addClass("gb-feature-msg16");
	var msg2 = $("<div>").text(that.translation.revertmsg2[that.locale]).addClass("gb-feature-msg16");
	var inputMsg = $("<input>").attr({
		"type" : "text",
		"placeholder" : that.translation.commitdesc[that.locale]
	}).addClass("gb-form");
	var msg3 = $("<div>").append(inputMsg);

	var body = $("<div>").append(msg1).append(msg2).append(msg3);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.cancel[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.revert[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var commitModal = new gb.modal.ModalBase({
		"title" : that.translation.revert[that.locale],
		"width" : 494,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		commitModal.close();
	});
	$(okBtn).click(function() {
		var message = inputMsg.val();
		that.revert(server, repo, path, oc, nc, message, message, commitModal, cmpmodal);
	});
};

/**
 * 피처 revert 요청한다.
 * 
 * @private
 * @method gb.versioning.Feature#revert
 * @param {string}
 *            server - GeoServer 이름
 * @param {string}
 *            repo - GeoGig 저장소 이름
 * @param {string}
 *            path - 피처 path
 * @param {string}
 *            oc - 되돌릴 이전 커밋 아이디
 * @param {string}
 *            nc - 새로운 커밋 아이디
 * @param {string}
 *            cm - 커밋 메세지
 * @param {string}
 *            mm - 머지 메세지
 * @param {gb.modal.ModalBase}
 *            rmodal - 완료 후 닫을 메세지 입력 모달 객체
 * @param {gb.modal.ModalBase}
 *            cmpmodal - 완료 후 닫을 피처 비교 모달 객체
 */
gb.versioning.Feature.prototype.revert = function(server, repo, path, oc, nc, cm, mm, rmodal, cmpmodal) {
	var that = this;

	var params = {
		"serverName" : server,
		"repoName" : repo,
		"path" : path,
		"oldCommitId" : oc,
		"newCommitId" : nc,
		"commitMessage" : cm,
		"mergeMessage" : mm
	}
	console.log(params);

	var tranURL = that.getFeatureRevertURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				cmpmodal.close();
				that.refresh();
				// 충돌이 없으면
				if (data.merge.conflicts === null) {
					var msg1 = $("<div>").text(that.translation.revertsucc[that.locale]).addClass("gb-feature-msg16");
					var body = $("<div>").append(msg1);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.ok[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);
					// 완료 메세지 출력
					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.revert[that.locale],
						"width" : 350,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
						that.runAfterSaveCallback();
					});
					rmodal.close();
					// 충돌이 있으면
				} else if (Array.isArray(data.merge.conflicts)) {
					var msg1 = $("<div>").text(that.translation.revertfail[that.locale]).addClass("gb-feature-msg16");
					var msg2 = $("<div>").text(that.translation.conflictmsg1[that.locale]).addClass("gb-feature-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.cancel[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.resolve[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
					// 오류 메세지 출력
					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.revert[that.locale],
						"width" : 350,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(
							function() {
								mModal.close();
								that.endTransaction(server, repo, tid, commitModal);
								that.resolveConflictModal(server, repo, repo, that.getNowBranch().text, branch, data.merge.ours,
										data.merge.theirs, data.merge.features, commitModal);
								that.openConflictDetailModal();
							});
				}
			}
		}
	});
};

/**
 * 피처 충돌 정보창을 연다.
 * 
 * @method gb.versioning.Feature#openConflictDetailModal
 */
gb.versioning.Feature.prototype.openConflictDetailModal = function() {
	var that = this;

	var crepo = $("<div>").append(that.translation.revertingft[that.locale]).addClass("gb-form").addClass("gb-feature-text-center");

	var cheadtd1 = $("<th>").text(that.translation.name[that.locale]);
	var cheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var cheadth = $("<tr>").append(cheadtd1).append(cheadtd2);
	var cattrthead = $("<thead>").append(cheadth);
	var cattrtbody = $("<tbody>").addClass("gb-feature-attr-tbody");
	var cattrtable = $("<table>").append(cattrthead).append(cattrtbody).addClass("gb-table");
	var cattribute = $("<div>").append(cattrtable).addClass("gb-feature-attr-table-area");
	var carea = $("<div>").append(crepo).append(this.comfeature).append(cattribute).addClass("gb-feature-attr-area-half");
	// this.conflictView = new ol.View({
	// "center" : [ 0, 0 ],
	// "zoom" : 1
	// });
	// this.cmap = new ol.Map({
	// "target" : $(cfeature)[0],
	// "view" : this.conflictView,
	// "layers" : []
	// });

	var trepo = $("<div>").append(that.translation.conflft[that.locale]).addClass("gb-form").addClass("gb-feature-text-center");

	// var tfeature = $("<div>").css({
	// "width" : "100%",
	// "height" : "200px",
	// "background-color" : "#dbdbdb"
	// });
	var theadtd1 = $("<th>").text(that.translation.name[that.locale]);
	var theadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var theadth = $("<tr>").append(theadtd1).append(theadtd2);
	var tattrthead = $("<thead>").append(theadth);
	var tattrtbody = $("<tbody>").addClass("gb-feature-attr-tbody");
	var tattrtable = $("<table>").append(tattrthead).append(tattrtbody).addClass("gb-table");
	// .css({
	// "width" : "100%",
	// "table-layout" : "fixed"
	// });
	var tattribute = $("<div>").append(tattrtable).addClass("gb-feature-attr-table-area");

	$(cattrtbody).on("scroll", function() {
		$(tattrtbody).prop("scrollTop", this.scrollTop).prop("scrollLeft", this.scrollLeft);
	});

	// $(tattribute).on("scroll", function() {
	// $(cattribute).prop("scrollTop", this.scrollTop).prop("scrollLeft",
	// this.scrollLeft);
	// });

	var tarea = $("<div>").append(trepo).append(this.curfeature).append(tattribute).addClass("gb-feature-attr-area-half");
	// this.tmap = new ol.Map({
	// "target" : $(tfeature)[0],
	// "view" : this.conflictView,
	// "layers" : []
	// });

	var ctarea = $("<div>").append(carea).append(tarea);

	var cubOpt = $("<option>").text(that.translation.ourft[that.locale]).attr({
		"value" : "ours"
	});
	var tabOpt = $("<option>").text(that.translation.theirft[that.locale]).attr({
		"value" : "theirs"
	});
	var branchSelect = $("<select>").addClass("gb-form").append(cubOpt).append(tabOpt);
	// $(branchSelect).val(val);
	var sarea = $("<div>").append(branchSelect).addClass("gb-feature-conflict-select-area");

	var body = $("<div>").append(ctarea).append(sarea);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.cancel[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.override[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : that.translation.compaconfl[that.locale],
		"width" : 770,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		modal.close();
	});
	$(okBtn).click(function() {
		console.log(idx);
		$(branchSelect).val();
		console.log($(branchSelect).val());
		var select = $(that.conflictFeatureTbody).find("tr").eq(idx).find(".gb-repository-instead-branch");
		$(select).filter("option:selected").text();
		console.log($(select).find("option").filter(":selected").val());
		$(select).val($(branchSelect).val());
		$(select).trigger("change");
		modal.close();
	});

	var cparams1 = {
		"serverName" : server,
		"repoName" : crepos,
		"path" : path,
		"commitId" : this.getCommitId().ours,
		"featureId" : fid1
	}

	var cparams2 = {
		"serverName" : server,
		"repoName" : crepos,
		"path" : path,
		"commitId" : this.getCommitId().theirs,
		"featureId" : fid2
	}

	var wkt1;
	var wkt2;
	if (fid1 !== "0000000000000000000000000000000000000000") {
		var fobjectURL1 = this.getCatFeatureObjectURL();
		if (fobjectURL1.indexOf("?") !== -1) {
			fobjectURL1 += "&";
			fobjectURL1 += jQuery.param(cparams1);
		} else {
			fobjectURL1 += "?";
			fobjectURL1 += jQuery.param(cparams1);
		}

		$.ajax({
			url : fobjectURL1,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			// data : cparams1,
			// dataType : 'jsonp',
			// jsonpCallback : 'getJson',
			beforeSend : function() {
				// $("body").css("cursor", "wait");
			},
			complete : function() {
				// $("body").css("cursor", "default");
			},
			success : function(data) {
				console.log(data);
				if (data.success === "true") {
					var attrs = data.attributes;
					for (var i = 0; i < attrs.length; i++) {
						if (attrs[i].type === "POINT" || attrs[i].type === "LINESTRING" || attrs[i].type === "POLYGON"
								|| attrs[i].type === "MULTIPOINT" || attrs[i].type === "MULTILINESTRING"
								|| attrs[i].type === "MULTIPOLYGON") {
							var wkt = attrs[i].value;
							wkt1 = wkt;
							console.log(wkt1);
							var format = new ol.format.WKT();
							var geom = format.readGeometry(wkt);
							var feature = new ol.Feature({
								"geometry" : geom
							});
							feature.setId(data.featureId);
							console.log(feature);
							console.log(feature.getId());
							var style = new ol.style.Style({
								image : new ol.style.Circle({
									radius : 5,
									fill : new ol.style.Fill({
										color : 'orange'
									})
								}),
								stroke : new ol.style.Stroke({
									width : 1,
									color : 'orange'
								}),
								fill : new ol.style.Fill({
									color : 'orange'
								})
							});

							var vlayer = new ol.layer.Vector({
								"style" : style,
								"source" : new ol.source.Vector({
									"features" : [ feature ]
								}),
								"zIndex" : 2
							});

							var osm = new ol.layer.Tile({
								"source" : new ol.source.OSM(),
								"zIndex" : 1
							});

							var epsg = attrs[i].crs.toLowerCase();
							var code = epsg.substring(epsg.indexOf("epsg:") + 5);
							var intcode = parseInt(code);
							console.log(code);

							var ccrs = new gb.crs.BaseCRS({
								"title" : "Base CRS",
								"width" : 300,
								"height" : 200,
								"autoOpen" : false,
								"message" : undefined,
								"map" : that.getCurrentMap(),
								"epsg" : Number.isInteger(intcode) ? code : "4326"
							});

							that.getCurrentMap().updateSize();
							that.getCurrentMap().getLayers().clear();
							that.getCurrentMap().addLayer(osm);
							that.getCurrentMap().addLayer(vlayer);
							that.getCurrentMap().getView().fit(geom);

						} else {
							var name = attrs[i].name;
							var value = attrs[i].value;
							var td1 = $("<td>").text(name);
							var td2 = $("<td>").text(value).addClass("gb-feature-attr-tbody-value");
							var tr = $("<tr>").append(td1).append(td2);
							$(cattrtbody).append(tr);
						}

					}

					if (fid2 !== "0000000000000000000000000000000000000000") {
						var fobjectURL2 = that.getCatFeatureObjectURL();
						if (fobjectURL2.indexOf("?") !== -1) {
							fobjectURL2 += "&";
							fobjectURL2 += jQuery.param(cparams2);
						} else {
							fobjectURL2 += "?";
							fobjectURL2 += jQuery.param(cparams2);
						}

						$.ajax({
							url : fobjectURL2,
							method : "POST",
							contentType : "application/json; charset=UTF-8",
							// data : cparams2,
							// dataType : 'jsonp',
							// jsonpCallback : 'getJson',
							beforeSend : function() {
								// $("body").css("cursor", "wait");
							},
							complete : function() {
								// $("body").css("cursor", "default");
							},
							success : function(data) {
								console.log(data);
								if (data.success === "true") {
									var attrs = data.attributes;
									for (var i = 0; i < attrs.length; i++) {
										if (attrs[i].type === "POINT" || attrs[i].type === "LINESTRING" || attrs[i].type === "POLYGON"
												|| attrs[i].type === "MULTIPOINT" || attrs[i].type === "MULTILINESTRING"
												|| attrs[i].type === "MULTIPOLYGON") {
											var wkt = attrs[i].value;
											wkt2 = wkt;
											if (wkt1 !== wkt2) {
												$(that.cfeature).css({
													"border" : "3px solid #ffc523"
												});
												$(that.tfeature).css({
													"border" : "3px solid #ffc523"
												});
											} else {
												$(that.cfeature).css({
													"border" : "1px solid #ccc"
												});
												$(that.tfeature).css({
													"border" : "1px solid #ccc"
												});
											}
											console.log(wkt2);
											var format = new ol.format.WKT();
											var geom = format.readGeometry(wkt);
											var feature = new ol.Feature({
												"geometry" : geom
											});
											feature.setId(data.featureId);
											console.log(feature);
											console.log(feature.getId());
											var style = new ol.style.Style({
												image : new ol.style.Circle({
													radius : 5,
													fill : new ol.style.Fill({
														color : 'orange'
													})
												}),
												stroke : new ol.style.Stroke({
													width : 1,
													color : 'orange'
												}),
												fill : new ol.style.Fill({
													color : 'orange'
												})
											});

											var vlayer = new ol.layer.Vector({
												"style" : style,
												"source" : new ol.source.Vector({
													"features" : [ feature ]
												}),
												"zIndex" : 2
											});

											var osm = new ol.layer.Tile({
												"source" : new ol.source.OSM(),
												"zIndex" : 1
											});

											var epsg = attrs[i].crs.toLowerCase();
											var code = epsg.substring(epsg.indexOf("epsg:") + 5);
											var intcode = parseInt(code);
											console.log(code);

											var ccrs = new gb.crs.BaseCRS({
												"title" : "Base CRS",
												"width" : 300,
												"height" : 200,
												"autoOpen" : false,
												"message" : undefined,
												"map" : that.getTargetMap(),
												"epsg" : Number.isInteger(intcode) ? code : "4326"
											});

											that.getTargetMap().updateSize();
											that.getTargetMap().getLayers().clear();
											that.getTargetMap().addLayer(osm);
											that.getTargetMap().addLayer(vlayer);
											var geom = feature.getGeometry();

											that.getTargetMap().getView().fit(geom);

										} else {
											var name = attrs[i].name;
											var value = attrs[i].value;
											var td1 = $("<td>").text(name);
											var td2 = $("<td>").text(value).addClass("gb-feature-attr-tbody-value");
											var tr = $("<tr>").append(td1).append(td2);
											$(tattrtbody).append(tr);
										}

									}
									if ($(cattrtbody).find("tr").length === $(tattrtbody).find("tr").length) {
										var trs = $(cattrtbody).find("tr");
										var ttrs = $(tattrtbody).find("tr");
										for (var j = 0; j < trs.length; j++) {
											if ($(trs[j]).find("td").eq(0).text() === $(ttrs[j]).find("td").eq(0).text()) {

												if ($(trs[j]).find("td").eq(1).text() !== $(ttrs[j]).find("td").eq(1).text()) {
													$(trs[j]).css({
														"background-color" : "#ffc523"
													});
													$(ttrs[j]).css({
														"background-color" : "#ffc523"
													});
												}
											}
										}
									}
								} else {
									var title = that.translation.err[that.locale];
									var msg = that.translation.retreveftfail[that.locale];
									that.messageModal(title, msg);
								}
							},
							error : function(jqXHR, textStatus, errorThrown) {

							}
						});
					} else {
						that.getTargetMap().updateSize();
						var td1 = $("<td>").text(that.translation.deleted[that.locale]);
						var td2 = $("<td>").text(that.translation.deleted[that.locale]);
						var tr = $("<tr>").append(td1).append(td2);
						$(tattrtbody).append(tr);
					}
				} else {
					var title = that.translation.err[that.locale];
					var msg = that.translation.retreveftfail[that.locale];
					that.messageModal(title, msg);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {

			}
		});
	}
};

/**
 * 피처의 이력 조회 URL을 반환한다.
 * 
 * @method gb.versioning.Feature#getFeatureLogURL
 * @return {string} 요청 URL
 */
gb.versioning.Feature.prototype.getFeatureLogURL = function() {
	return this.featureLogURL;
};

/**
 * 피처 비교 URL을 반환한다.
 * 
 * @method gb.versioning.Feature#getDiffURL
 * @return {string} 요청 URL
 */
gb.versioning.Feature.prototype.getDiffURL = function() {
	return this.diffURL;
};

/**
 * 변경 피처 속성 조회 URL을 반환한다.
 * 
 * @method gb.versioning.Feature#getCatFeatureObjectURL
 * @return {string} 요청 URL
 */
gb.versioning.Feature.prototype.getCatFeatureObjectURL = function() {
	return this.catFeatureObjectURL;
};

/**
 * 피처 되돌리기 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Feature#getFeatureRevertURL
 * @return {string}요청 URL
 */
gb.versioning.Feature.prototype.getFeatureRevertURL = function() {
	return this.featureRevertURL;
};

/**
 * 피처 비교 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Feature#getFeatureAttributeURL
 */
gb.versioning.Feature.prototype.getFeatureAttributeURL = function() {
	return this.featureAttributeURL;
};

/**
 * 피처이력 목록을 비운다.
 * 
 * @method gb.versioning.Feature#clearChangesTbody
 */
gb.versioning.Feature.prototype.clearChangesTbody = function() {
	$(this.tbody).empty();
};

/**
 * 피처이력 목록 테이블 바디를 반환한다.
 * 
 * @method gb.versioning.Feature#getTBody
 * @return {HTMLElement} 피처 이력 목록을 표시하는 tbody 요소
 */
gb.versioning.Feature.prototype.getTBody = function() {
	return this.tbody;
};

/**
 * 피처이력 객체를 설정한다.
 * 
 * @method gb.versioning.Feature#setCommits
 * @param {Object}
 *            obj - 피처 이력 객체
 */
gb.versioning.Feature.prototype.setCommits = function(obj) {
	this.commits = obj;
};

/**
 * 피처이력 객체를 반환한다.
 * 
 * @method gb.versioning.Feature#getCommits
 * @return {Object} 피처 이력 객체
 */
gb.versioning.Feature.prototype.getCommits = function() {
	return this.commits;
};

/**
 * 조회한 피처이력을 분류 보관한다.
 * 
 * @method gb.versioning.Feature#setCommitsByInfo
 * @param {string}
 *            server - GeoServer 이름
 * @param {string}
 *            repo - GeoGig 저장소 이름
 * @param {string}
 *            path - 피처 path
 * @param {Array.
 *            <Object>} arr - 변경 이력 정보
 */
gb.versioning.Feature.prototype.setCommitsByInfo = function(server, repo, path, arr) {
	if (server || repo || path || arr) {
		return;
	}
	if (!this.commits.hasOwnProperty(server)) {
		this.commits[server] = {};
	}
	if (!this.commits[server].hasOwnProperty(repo)) {
		this.commits[server][repo] = {};
	}
	if (!this.commits[server][repo].hasOwnProperty(path)) {
		this.commits[server][repo][path] = [];
	}
	this.commits[server][repo][path] = this.commits[server][repo][path].concat(arr);
};

/**
 * 현재 편집중인 객체 path를 설정한다.
 * 
 * @method gb.versioning.Feature#setPath
 * @param {string}
 *            path - 피처 path
 */
gb.versioning.Feature.prototype.setPath = function(path) {
	this.curPath = path;
};

/**
 * 현재 편집중인 객체 path를 반환한다.
 * 
 * @method gb.versioning.Feature#getPath
 * @return {string} 피처 path
 */
gb.versioning.Feature.prototype.getPath = function() {
	return this.curPath;
};

/**
 * 현재 편집중인 객체 repo 를 설정한다.
 * 
 * @method gb.versioning.Feature#setRepo
 * @param {string}
 *            repo - GeoGig 저장소 이름
 */
gb.versioning.Feature.prototype.setRepo = function(repo) {
	this.curRepo = repo;
};

/**
 * 현재 편집중인 객체 repo 를 반환한다.
 * 
 * @method gb.versioning.Feature#getRepo
 * @return {string} GeoGig 저장소 이름
 */
gb.versioning.Feature.prototype.getRepo = function() {
	return this.curRepo;
};

/**
 * 현재 편집중인 객체 server 를 설정한다.
 * 
 * @method gb.versioning.Feature#setServer
 * @param {string}
 *            server - GeoServer 이름
 */
gb.versioning.Feature.prototype.setServer = function(server) {
	this.curServer = server;
};

/**
 * 현재 편집중인 객체 server 를 반환한다.
 * 
 * @method gb.versioning.Feature#getServer
 * @return {string} GeoServer 이름
 */
gb.versioning.Feature.prototype.getServer = function() {
	return this.curServer;
};

/**
 * 현재 편집중인 객체 idstring을 설정한다.
 * 
 * @method gb.versioning.Feature#setIDString
 * @param {string}
 *            id - 객체의 idstring
 */
gb.versioning.Feature.prototype.setIDString = function(id) {
	this.idstring = id;
};

/**
 * 현재 편집중인 객체 idstring을 반환한다.
 * 
 * @method gb.versioning.Feature#getIDString
 * @return {string} 객체의 idstring
 */
gb.versioning.Feature.prototype.getIDString = function() {
	return this.idstring;
};

/**
 * panel 을 반환한다.
 * 
 * @method gb.versioning.Feature#getPanel
 * @return {gb.panel.PanelBase} 피처 이력 패널 객체
 */
gb.versioning.Feature.prototype.getPanel = function() {
	return this.panel;
};

/**
 * 현재 편집중인 객체 이력을 새로고침한다.
 * 
 * @method gb.versioning.Feature#refresh
 */
gb.versioning.Feature.prototype.refresh = function() {
	if ($(this.getPanel().getPanel()).css("display") !== "none") {
		var geoserver = this.getServer();
		var repo = this.getRepo();
		var path = this.getPath();
		this.loadFeatureHistory(geoserver, repo, path, 10, 0, undefined, undefined, true);
	}
};

/**
 * 현재 편집중인 객체를 설정한다.
 * 
 * @method gb.versioning.Feature#setFeature
 * @param {ol.Feature}
 *            feature - 현재 편집중인 피처 객체
 */
gb.versioning.Feature.prototype.setFeature = function(feature) {
	this.feature = feature;
};

/**
 * 현재 편집중인 객체를 반환한다.
 * 
 * @method gb.versioning.Feature#getFeature
 * @return {ol.Feature} 현재 편집중인 피처 객체
 */
gb.versioning.Feature.prototype.getFeature = function() {
	return this.feature;
};

/**
 * 오류 메세지 창을 생성한다.
 * 
 * @method gb.versioning.Feature#messageModal
 * @param {string}
 *            title - 메세지 창의 제목
 * @param {string}
 *            msg - 메세지 내용
 */
gb.versioning.Feature.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").text(msg).addClass("gb-feature-msg16");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.ok[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 310,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};

/**
 * 왼쪽 ol.Map을 반환한다.
 * 
 * @method gb.versioning.Feature#getLeftMap
 * @return {ol.Map} 왼쪽 지도 객체
 */
gb.versioning.Feature.prototype.getLeftMap = function() {
	return this.omap;
}

/**
 * 오른쪽 ol.Map을 반환한다.
 * 
 * @method gb.versioning.Feature#getRightMap
 * @return {ol.Map} 오른쪽 지도 객체
 */
gb.versioning.Feature.prototype.getRightMap = function() {
	return this.cmap;
}

/**
 * 왼쪽 피처 tbody를 반환한다.
 * 
 * @method gb.versioning.Feature#getLeftTBody
 * @return {HTMLElement} 피처 속성을 표시하는 tbody 객체
 */
gb.versioning.Feature.prototype.getLeftTBody = function() {
	return this.oattrtbody;
}

/**
 * 오른쪽 피처 tbody를 반환한다.
 * 
 * @method gb.versioning.Feature#getRightTBody
 * @return {HTMLElement} 피처 속성을 표시하는 tbody 객체
 */
gb.versioning.Feature.prototype.getRightTBody = function() {
	return this.cattrtbody;
}

/**
 * 레이어 저장후 타일 레이어를 새로고침 한다.
 * 
 * @method gb.versioning.Feature#runAfterSaveCallback
 */
gb.versioning.Feature.prototype.runAfterSaveCallback = function() {
	this.editingTool.refreshTileLayer();
}

/**
 * EditingTool 객체를 설정한다.
 * 
 * @method gb.versioning.Feature#setEditingTool
 * @param {gb.edit.EditingTool}
 *            tool - EditingTool 객체
 */
gb.versioning.Feature.prototype.setEditingTool = function(tool) {
	this.editingTool = tool;
}

/**
 * EditingTool 객체를 반환한다.
 * 
 * @method gb.versioning.Feature#getEditingTool
 * @return {gb.edit.EditingTool} EditingTool 객체
 */
gb.versioning.Feature.prototype.getEditingTool = function() {
	return this.editingTool;
}