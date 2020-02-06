/**
 * 지오서버 커스텀 플러그인 로드 필요
 * @external "jsTree-geoserver plugin"
 */
/**
 * @namespace {Object} gb3d
 */
var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.tree)
	gb3d.tree = {};
/**
 * @classdescs 지오서버 레이어 목록을 표시하는 객체
 * @class gb3d.tree.GeoServer
 * @memberof gb3d.tree
 * @param {Object} obj - 생성자 옵션을 담은 객체
 * @param {string} [obj.locale="en"] - 사용할 언어 ko | en
 * @param {HTMLElement} obj.append - 영역 본문이 삽입될 부모 노드의 HTMLElement
 * @param {gb.tree.Openlayers} obj.cliendTree - 클라이언트 레이어 트리 객체
 * @param {ol.Map} obj.map - 편집 영역의 ol.Map
 * @param {gb.geoserver.UploadSHP} obj.uploadSHP - SHP 파일 업로드 객체
 * @param {Object} obj.url - 요청을 처리하기 위한 URL 객체
 * @param {string} obj.url.getTree - 지오서버 트리 구조를 요청하기 위한 URL
 * @param {string} obj.url.addGeoServer - 지오서버를 추가하기 위한 URL
 * @param {string} obj.url.deleteGeoServer - 지오서버를 삭제하기 위한 URL
 * @param {string} obj.url.deleteGeoServerLayer - 지오서버 레이어를 삭제하기 위한 URL
 * @param {string} obj.url.getMapWMS - WMS 레이어를 요청하기 위한 URL
 * @param {string} obj.url.getLayerInfo - WMS 레이어 세부 정보를 요청하기 위한 URL
 * @param {string} obj.url.getWFSFeature - WMS 레이어의 피처 세부 정보를 요청하기 위한 URL
 * @param {string} obj.url.switchGeoGigBranch - GeoGig 데이터저장소의 연결 브랜치 변경을 요청하기 위한 URL
 * @param {string} obj.url.geoserverInfo - GeoServer 정보를 요청하기 위한 URL
 * @param {gb.edit.ModifyLayerProperties} obj.properties - GeoServer 레이어 속성 편집 객체
 * @author SOYIJUN
 */
gb3d.tree.GeoServer = function(obj) {
	var that = this;
	var options = obj ? obj : {};
	this.map = options.map instanceof ol.Map ? options.map : undefined;
	var url = options.url ? options.url : undefined;
	this.clientTree = options.clientTree ? options.clientTree : undefined;
	this.properties = options.properties || undefined;
	this.getTreeURL = url.getTree ? url.getTree : undefined;
	this.addGeoServerURL = url.addGeoServer ? url.addGeoServer : undefined;
	this.deleteGeoServerURL = url.deleteGeoServer ? url.deleteGeoServer : undefined;
	this.deleteGeoServerLayerURL = url.deleteGeoServerLayer ? url.deleteGeoServerLayer : undefined;
	this.geoserverInfoURL = url.geoserverInfo ? url.geoserverInfo : undefined;

	this.getTreeURL = url.getTree ? url.getTree : undefined;
	this.getMapWMS = url.getMapWMS ? url.getMapWMS : undefined;
	this.getWFSFeature = url.getWFSFeature ? url.getWFSFeature : undefined;
	this.getLayerInfo = url.getLayerInfo ? url.getLayerInfo : undefined;
	this.switchGeoGigBranchURL = url.switchGeoGigBranch ? url.switchGeoGigBranch : undefined;
	this.uploadSHP = options.uploadSHP ? options.uploadSHP : undefined;
	this.simple3DManager = options.simple3DManager ? options.simple3DManager : undefined;
	this.multiOBJManager = options.multiOBJManager ? options.multiOBJManager : undefined;
	this.locale = options.locale ? options.locale : "en";

	this.height = options.height || undefined;
	this.downloadGeoserver = url.downloadGeoserver || undefined;

	this.addGeoserverModal = $("#geoserverAdd");
	/**
	 * @private
	 * @type {Array.<string>}
	 */
	this.loadingList = [];
	/**
	 * @private
	 * @type {Array.<number>}
	 */
	this.loadingNumber = [];

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
			"err" : {
				"ko" : "오류",
				"en" : "Error"
			},
			"geoserver" : {
				"ko" : "GeoServer",
				"en" : "GeoServer"
			},
			"addgeoserver" : {
				"ko" : "새로운 지오서버 연결",
				"en" : "Connecting a new Geo Server"
			},
			"name" : {
				"ko" : "이름",
				"en" : "Name"
			},
			"id" : {
				"ko" : "아이디",
				"en" : "ID"
			},
			"password" : {
				"ko" : "비밀번호",
				"en" : "Password"
			},
			"add" : {
				"ko" : "추가",
				"en" : "Add"
			},
			"close" : {
				"ko" : "닫기",
				"en" : "Close"
			},
			"remove" : {
				"ko" : "삭제",
				"en" : "Remove"
			},
			"removeserver" : {
				"ko" : "닫기",
				"en" : "Close"
			},
			"import" : {
				"ko" : "불러오기",
				"en" : "Import"
			},
			"importwz" : {
				"ko" : "Zip(*.obj) 파일과 함께 불러오기",
				"en" : "Import with zip file(*.obj)"
			},
			"importas3d" : {
				"ko" : "3차원으로 변환하여 불러오기",
				"en" : "Import as 3D"
			},
			"importonly" : {
				"ko" : "레이어만 불러오기",
				"en" : "Import only layer"
			},
			"export" : {
				"ko" : "내보내기",
				"en" : "Export"
			},
			"upload" : {
				"ko" : "업로드",
				"en" : "Upload"
			},
			"branch" : {
				"ko" : "브랜치",
				"en" : "Branch"
			},
			"prop" : {
				"ko" : "속성",
				"en" : "Properties"
			},
			"removegeo" : {
				"ko" : "지오서버 삭제",
				"en" : "Remove GeoServer"
			},
			"removelayer" : {
				"ko" : "레이어 삭제",
				"en" : "Remove Layer"
			},
			"removegeomsg" : {
				"ko" : "아래 지오서버를 목록에서 삭제하시겠습니까?",
				"en" : "Are you sure to remove this GeoServer?"
			},
			"removelayermsg1" : {
				"ko" : "아래 레이어를 지오서버에서 삭제하시겠습니까?",
				"en" : "Are you sure to remove this layer?"
			},
			"removelayermsg2" : {
				"ko" : "아래 레이어들을 지오서버에서 삭제하시겠습니까?",
				"en" : "Are you sure to remove these layers?"
			},
			"and" : {
				"ko" : "외",
				"en" : "and"
			},
			"more" : {
				"ko" : "개",
				"en" : "more"
			},
			"cancel" : {
				"ko" : "취소",
				"en" : "Cancel"
			},
			"switchbr1" : {
				"ko" : "지오서버의 설정이 변경됩니다.",
				"en" : "This will change the geoserver setting."
			},
			"switchbr1" : {
				"ko" : "지오서버의 설정이 변경됩니다.",
				"en" : "This will change the geoserver setting."
			},
			"switchbr2" : {
				"ko" : "다른 사용자에게 영향을 미칠 수 있습니다.",
				"en" : "Other users can be affected."
			},
			"switchbr3" : {
				"ko" : "해당 브랜치로 변경하시겠습니까?",
				"en" : "Would you like to switch over to this branch?"
			},
			"brswitch" : {
				"ko" : "브랜치 변경",
				"en" : "Switch Branch"
			},
			"switch" : {
				"ko" : "변경",
				"en" : "Switch"
			},
			"info" : {
				"ko" : "정보",
				"en" : "Information"
			},
			"serverinfo" : {
				"ko" : "GeoServer 정보",
				"en" : "GeoServer Information"
			},
			"version" : {
				"ko" : "버전",
				"en" : "Version"
			},
			"setting" : {
				"ko" : "설정",
				"en" : "Setting"
			},
			"wfs" : {
				"ko" : "WFS",
				"en" : "WFS"
			},
			"wms" : {
				"ko" : "WMS",
				"en" : "WMS"
			},
			"nodelsamestore" : {
				"ko" : "동일 데이터스토어에 포함된 레이어만 복수 삭제할 수 있습니다.",
				"en" : "You can delete multiple layers included in the same datastore."
			},
			"noimpsamestore" : {
				"ko" : "이미 불러온 레이어는 제외됩니다.",
				"en" : "Except for layers that have already been imported."
			},
			"ok" : {
				"ko" : "확인",
				"en" : "OK"
			}
	};
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelTitle = $("<p>").text("GeoServer");
	var addIcon = $("<i>").addClass("fas").addClass("fa-plus");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.addBtn = $("<button>").addClass("gb-button-clear").addClass("gb-button-float-right").append(addIcon).click(function() {
		that.openAddGeoServer();
	});
	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.refBtn = $("<button>").addClass("gb-button-clear").addClass("gb-button-float-right").append(refIcon).click(function() {
		that.refreshList();
	});
	var searchIcon = $("<i>").addClass("fas").addClass("fa-search");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchBtn = $("<button>").addClass("gb-button-clear").addClass("gb-button-float-right").append(searchIcon).click(function() {
		that.openSearchBar();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.titleArea = $("<div>").append(this.panelTitle).append(this.searchBtn).append(this.refBtn).append(this.addBtn);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchInput = $("<input>").attr({
		"type" : "text"
	});

	/**
	 * @private
	 * @type {(boolean|function)}
	 */
	this.tout = false;
	$(this.searchInput).keyup(function() {
		var root = that.getJSTree().get_node("#");
		var nodes = root.children;
		var callback = function() {
			var v = $(that.searchInput).val();
			that.getJSTree().search(v);
		};
		that.initLoadingList();
		that.initLoadingNumber();
		for (var i = 0; i < nodes.length; i++) {
			var pnodeid = nodes[i];
			console.log("선택한 노드:", pnodeid);
			console.log(that.getLoadingList());
			that.openNodeRecursive(i, that.getJSTree().get_node(nodes[i]), pnodeid, callback, true);
		}
	});
	var closeIcon = $("<i>").addClass("fas").addClass("fa-times");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.closeSearchBtn = $("<button>").addClass("gb-button-clear").addClass("gb-button-float-right").append(closeIcon).click(function() {
		$(that.searchInput).val("");
		that.getJSTree().search("");
		that.closeSearchBar();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchArea = $("<div>").css({
		"display" : "none"
	}).append(this.searchInput).append(this.closeSearchBtn);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelHead = $("<div>").addClass("gb-article-head").append(this.titleArea).append(this.searchArea);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panelBody = $("<div>").addClass("gb-article-body");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.article = $("<div>").addClass("gb-article").append(this.panelHead).append(this.panelBody);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.panel = $("<div>").addClass("gb-geoserver-body").append(this.article);

	$(options.append).append(this.panel);

	// 높이 설정됨
	if (!this.height) {
		// 로드시 계산
		$(document).ready(function() {
			var parentHeight = $(that.panel).parent().innerHeight();
			var headHeight = $(that.panel).find(".gb-article-head").outerHeight();
			var bodyHeight = parentHeight - headHeight;
			$(that.panelBody).outerHeight(bodyHeight);
		});
		// 리사이즈시 계산
		$(window).resize(function() {
			var parentHeight = $(that.panel).parent().innerHeight();
			var headHeight = $(that.panel).find(".gb-article-head").outerHeight();
			var bodyHeight = parentHeight - headHeight;
			$(that.panelBody).outerHeight(bodyHeight);
		});
		// 로드이후 시간차를 두고 한번 더 계산
		setTimeout(function() {
			var parentHeight = $(that.panel).parent().innerHeight();
			var headHeight = $(that.panel).find(".gb-article-head").outerHeight();
			var bodyHeight = parentHeight - headHeight;
			$(that.panelBody).outerHeight(bodyHeight);
		}, 1000);
	} else {
		$(this.panelBody).outerHeight(this.height);
	}
// 지오서버 구조를 트리 형태로 보여줄 jstree 선언
	$(this.panelBody).jstree(
			{
				"core" : {
					"animation" : 0,
					"check_callback" : true,
					"themes" : {
						"stripes" : true
					},
					"data" : {
						'url' : function(node) {
							var url = that.getGetTreeURL();
							console.log(url);
							return url;
						},
						"data" : function(node) {
							var obj = {};
							if (node.id === "#") {
								obj["type"] = "server";
							} else if (node.type === "geoserver") {
								obj["type"] = "workspace";
								obj["serverName"] = node.id;
								obj["node"] = node.id;
							} else if (node.type === "workspace") {
								obj["type"] = "datastore";
								obj["serverName"] = node.parent;
								obj["node"] = node.id;
							} else if (node.type === "datastore") {
								obj["type"] = "layer";
								obj["serverName"] = node.parents[1];
								obj["node"] = node.id
							}
							console.log(obj);
							return obj;
						}
					}
				},
				"geoserver" : {
					"map" : this.map instanceof ol.Map ? this.map : undefined,
					"getMapWMS" : this.getMapWMS,
					"getLayerInfo" : this.getLayerInfo,
					"clientTree" : this.clientTree,
					"serverTree" : that,
					"getWFSFeature" : this.getWFSFeature
				},
				"search" : {
					show_only_matches : true
				},
				"contextmenu" : {
					items : function(o, cb) { 
						var totalObj = {};
						if (o.type === "geoserver") {
							var infoObj = {
									"separator_before" : false,
									"icon" : "fas fa-info",
									"separator_after" : false,
									"_disabled" : function() {
										console.log(o);
										console.log(cb);
										var result = true;
										if (o.type === "geoserver") {
											result = false;
										}
										return result;
									},
									"label" : that.translation.info[that.locale],
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var server = obj.text;
										console.log(server);
										that.geoserverInfoModal(server);
									}
							}
							totalObj["info"] = infoObj;

							/*
							 * var setObj = { "separator_before" : false, "icon" : "fas fa-cog",
							 * "separator_after" : false, "_disabled" : function() { console.log(o);
							 * console.log(cb); var result = true; if (o.type === "geoserver") {
							 * result = false; } return result; }, "label" :
							 * that.translation.setting[that.locale], "action" : function(data) {
							 * var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) :
							 * undefined; var inst = $.jstree.reference(data.reference), obj =
							 * inst.get_node(data.reference); var server = obj.text;
							 * 
							 * that.geoserverSettingModal(); } } totalObj["set"] = setObj;
							 */
						}
						// 지오긱 저장소이면 브랜치 서브메뉴 객체를 만듬
						var repoObj = {};
						if (o.type === "datastore") {
							var storeType = o.original.storeType;
							if (storeType === "GeoGIG") {
								var nowBranch = o.original.geogigBranch;
								var branches = o.original.geogigBranches;
								for (var i = 0; i < branches.length; i++) {
									var obj = {
											"separator_before" : true,
											"separator_after" : false,
											"label" : branches[i],
											"action" : function(data) {
												var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
												console.log(data);
												console.log(nowBranch);
												var ds = obj;
												var ws = inst.get_node(ds.parents[0]);
												var server = inst.get_node(ds.parents[1]);
												var targetBranch = data.item.label;
												console.log(ds);
												if (nowBranch === data.item.label) {

												} else {
													var msg1 = $("<div>").addClass("gb-geoserver-msg16").text(that.translation.switchbr1[that.locale]);
													var msg2 = $("<div>").addClass("gb-geoserver-msg16").text(that.translation.switchbr2[that.locale]);
													var msg3 = $("<div>").addClass("gb-geoserver-msg16").text(that.translation.switchbr3[that.locale]);
													var msg4 = $("<div>").addClass("gb-geoserver-msg24").text(data.item.label);
													var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(that.translation.cancel[that.locale]);
													var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(that.translation.switch[that.locale]);

													var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
													var modalFooter = $("<div>").append(buttonArea);

													var gBody = $("<div>").append(msg1).append(msg2).append(msg3).append(msg4);
													var switchModal = new gb.modal.ModalBase({
														"title" : that.translation.brswitch[that.locale],
														"width" : 414,
														"height" : 228,
														"autoOpen" : true,
														"body" : gBody,
														"footer" : modalFooter
													});
													$(closeBtn).click(function() {
														switchModal.close();
													});
													$(okBtn).click(function() {
														console.log("switch");
														that.switchBranch(server.text, ws.text, ds.text, targetBranch, switchModal);
													});
												}
											}
									};
									if (branches[i] === nowBranch) {
										obj["icon"] = "fas fa-check";
									}
									repoObj[branches[i]] = obj;
								}
								console.log(repoObj);
							}
						}
						// 3d임포트 zip과 함께
//						if (o.type === "point" || o.type === "multipoint"
//							|| o.type === "linestring" || o.type === "multilinestring" || o.type ===
//								"polygon"
//								|| o.type === "multipolygon") {
//							var importObj = {
//									"separator_before" : true,
//									"icon" : "fas fa-file-archive",
//									"separator_after" : true,
//									"label" : that.translation.importwz[that.locale],
//									"action" : function(data) {
//										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
//										// Edit Tool 활성화 상태시 실행 중지
//										if(isEdit instanceof Object){
//											if(isEdit.get()){
//												isEdit.alert();
//												return
//											}
//										}
//
//										var inst = $.jstree.reference(data.reference), obj =
//											inst.get_node(data.reference);
//										var nodes = inst.get_selected();
//
//										console.log(obj);
//										console.log(nodes);
//										that.getMultiOBJManager().open();
//									}
//							};
//							totalObj["importzip"] = importObj;
//						}
						// 3d임포트 as 3d
						if (o.type === "point" || o.type === "multipoint") {
							var importObj = {
									"separator_before" : true,
									"icon" : "fas fa-cube",
									"separator_after" : true,
									"label" : that.translation.importas3d[that.locale],
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										// Edit Tool 활성화 상태시 실행 중지
										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var nodes = inst.get_selected();

										console.log(obj);
										console.log(nodes);
										
										var server = obj.id.split(":")[0];
										var work = obj.id.split(":")[1];
										var store = obj.id.split(":")[2];
										var layer = obj.id.split(":")[3];
										
										var callback = function(id, callback2) {
											console.log(that.getLoadingList());
											var pnode = inst.get_node(id);
											var duplication = false;
											var isLast = false;
											inst.recursive_node_load(pnode, that.map.getLayers(), duplication, isLast, callback2);
										};
										
										that.getSimple3DManager().showPointTo3DModal(server, work, store, layer, callback);
									}
							};
							totalObj["importas3d"] = importObj;
						} else if (o.type === "linestring" || o.type === "multilinestring") {
							var importObj = {
									"separator_before" : true,
									"icon" : "fas fa-cube",
									"separator_after" : true,
									"label" : that.translation.importas3d[that.locale],
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										// Edit Tool 활성화 상태시 실행 중지
										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var nodes = inst.get_selected();

										console.log(obj);
										console.log(nodes);
										
										var server = obj.id.split(":")[0];
										var work = obj.id.split(":")[1];
										var store = obj.id.split(":")[2];
										var layer = obj.id.split(":")[3];
										
										var callback = function(id, callback2) {
											console.log(that.getLoadingList());
											var pnode = inst.get_node(id);
											var duplication = false;
											var isLast = false;
											inst.recursive_node_load(pnode, that.map.getLayers(), duplication, isLast, callback2);
										};
										
										that.getSimple3DManager().showLineStringTo3DModal(server, work, store, layer, callback);
									}
							};
							totalObj["importas3d"] = importObj;
						} else if (o.type === "polygon"	|| o.type === "multipolygon") {
							var importObj = {
									"separator_before" : true,
									"icon" : "fas fa-cube",
									"separator_after" : true,
									"label" : that.translation.importas3d[that.locale],
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										// Edit Tool 활성화 상태시 실행 중지
										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var nodes = inst.get_selected();

										console.log(obj);
										console.log(nodes);
										
										var server = obj.id.split(":")[0];
										var work = obj.id.split(":")[1];
										var store = obj.id.split(":")[2];
										var layer = obj.id.split(":")[3];
										
										var callback = function(id, callback2) {
											console.log(that.getLoadingList());
											var pnode = inst.get_node(id);
											var duplication = false;
											var isLast = false;
											inst.recursive_node_load(pnode, that.map.getLayers(), duplication, isLast, callback2);
										};
										
										that.getSimple3DManager().showPolygonTo3DModal(server, work, store, layer, callback);
									}
							};
							totalObj["importas3d"] = importObj;
						}
						// 임포트는 워크스페이스 포함 아래로 적용
						if (o.type === "workspace" || o.type === "datastore" || o.type === "point" || o.type === "multipoint"
							|| o.type === "linestring" || o.type === "multilinestring" || o.type === "polygon"
								|| o.type === "multipolygon") {
							var importObj = {
									"separator_before" : true,
									"icon" : "fas fa-file-import",
									"separator_after" : true,
									"label" : that.translation.importonly[that.locale],
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										// Edit Tool 활성화 상태시 실행 중지
										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var nodes = inst.get_selected();

										console.log(obj);
										console.log(nodes);
										var work = [];
										var store = [];
										var layer = [];
										for (var i = 0; i < nodes.length; i++) {
											var node = inst.get_node(nodes[i]);
											if (node.type === "workspace") {
												work.push(node.id);
											} else if (node.type === "datastore") {
												store.push(node.id);
											} else if (node.type === "point" || node.type === "multipoint"
												|| node.type === "linestring" || node.type === "multilinestring" || node.type === "polygon"
													|| node.type === "multipolygon") {
												layer.push(node.id);
											}
										}

										for (var i = 0; i < layer.length; i++) {
											var layerObj =  inst.get_node(layer[i]);
											var parent = layerObj.parent;
											if (store.indexOf(parent) !== -1) {
												layer.splice(i, 1);
												i--;
											}
										}
										console.log(layer);

										for (var i = 0; i < store.length; i++) {
											var storeObj =  inst.get_node(store[i]);
											var parent = storeObj.parent;
											if (work.indexOf(parent) !== -1) {
												store.splice(i, 1);
												i--;
											}
										}
										console.log(store);

										var sortNodes = work.concat(store).concat(layer);
										console.log(sortNodes);
										var loadOrder = [];
										var callback = function(id) {
											console.log(that.getLoadingList());
											var pnode = inst.get_node(id);
											var duplication = false;
											var isLast = false;
											inst.recursive_node_load(pnode, that.map.getLayers(), duplication, isLast);
										};
										that.initLoadingList();
										that.initLoadingNumber();
										for (var i = 0; i < sortNodes.length; i++) {
											var pnodeid = sortNodes[i];
											console.log("선택한 노드:", pnodeid);
											console.log(that.getLoadingList());
											that.openNodeRecursive(i, inst.get_node(sortNodes[i]), pnodeid, callback, false);
										}
// 여기까지
									}
							};
							totalObj["import"] = importObj;
						}
						// 익스포트
						if (o.type === "point" || o.type === "multipoint" || o.type === "linestring" || o.type === "multilinestring"
							|| o.type === "polygon" || o.type === "multipolygon") {
							var exportObj = {
									"separator_before" : true,
									"icon" : "fas fa-file-export",
									"separator_after" : true,
									"label" : that.translation["export"][that.locale],
									"action" : false,
									"submenu" : {
										"wfs": {
											"separator_befor": true,
											"icon": "",
											"separator_after": true,
											"label": that.translation["wfs"][that.locale],
											"action": false,
											"submenu": {
												"shp" : {
													"separator_before" : true,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "SHP",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}

														for (var i = 0; i < selectedObj.length; i++) {
															inst.download_wfs_layer(selectedObj[i], "shape-zip");
														}
													}
												},
												"gml2" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GML2",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}

														for (var i = 0; i < selectedObj.length; i++) {
															inst.download_wfs_layer(selectedObj[i], "gml2");
														}
													}
												},
												"gml3" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GML3",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}

														for (var i = 0; i < selectedObj.length; i++) {
															inst.download_wfs_layer(selectedObj[i], "gml3");
														}
													}
												},
												"json" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "JSON",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}

														for (var i = 0; i < selectedObj.length; i++) {
															inst.download_wfs_layer(selectedObj[i], "application/json");
														}
													}
												},
												"csv" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "CSV",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}

														for (var i = 0; i < selectedObj.length; i++) {
															inst.download_wfs_layer(selectedObj[i], "csv");
														}
													}
												}
											}
										},
										"wms": {
											"separator_befor": true,
											"icon": "",
											"separator_after": true,
											"label": that.translation["wms"][that.locale],
											"action": false,
											"submenu": {
												"png" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "PNG",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/png");
														}
													}
												},
												"png8" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "PNG8",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/png8");
														}
													}
												},
												"jpeg" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "JPEG",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/jpeg");
														}
													}
												},
												"gif" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GIF",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/gif");
														}
													}
												},
												"tiff" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "TIFF",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/tiff");
														}
													}
												},
												"tiff8" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "TIFF8",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/tiff8");
														}
													}
												},
												"geotiff" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GeoTIFF",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/geotiff");
														}
													}
												},
												"geotiff8" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GeoTIFF8",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/geotiff8");
														}
													}
												},
												"svg" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "SVG",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "image/svg");
														}
													}
												},
												"pdf" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "PDF",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "application/pdf");
														}
													}
												},
												"rss" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "GEORSS",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "rss");
														}
													}
												},
												"kml" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "KML",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "kml");
														}
													}
												},
												"kmz" : {
													"separator_before" : false,
													"icon" : "fa fa-file-excel-o",
													"separator_after" : false,
													"label" : "KMZ",
													"action" : function(data) {
														var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
														var selected = inst.get_selected();
														var selectedObj = inst.get_selected(true);
														for (var i = 0; i < selectedObj.length; i++) {
															if (selectedObj[i].type === "datastore" || selectedObj[i].type === "workspace"
																|| selectedObj[i].type === "geoserver") {
																console.error("not support");
																return;
															}
														}
														var a = {
																serverName : undefined,
																workspace : undefined,
																geoLayerList : undefined
														};
														for (var i = 0; i < selectedObj.length; i++) {
															a.serverName = selectedObj[i].id.split(":")[0];
															a.workspace = selectedObj[i].id.split(":")[1];
															a.geoLayerList = [ selectedObj[i].id.split(":")[3] ];
															inst.download_wms_layer(a, "kmz");
														}
													}
												}
											}
										}
									}
							}
							totalObj["export"] = exportObj;
						}
						// 업로드
						if (o.type === "datastore") {
							var uploadObj = {
									"separator_before" : false,
									"icon" : "fas fa-upload",
									"separator_after" : false,
									"_disabled" : function() {
										console.log(o);
										console.log(cb);
										var result = true;
										if (o.type === "datastore") {
											result = false;
										}
										return result;
									},
									"label" : that.translation.upload[that.locale],
									/*
									 * ! "shortcut" : 113, "shortcut_label" : 'F2', "icon" :
									 * "glyphicon glyphicon-leaf",
									 */
									"action" : function(data) {
										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										if (obj.type === "datastore") {
											var upload = that.getUploadSHP();
											var datastore = obj.text;
											var workspace = inst.get_node(obj.parent).text;
											var geoserver = inst.get_node(obj.parents[1]).text;
											console.log(datastore);
											console.log(workspace);
											console.log(geoserver);
											upload.setGeoServer(geoserver);
											upload.setWorkspace(workspace);
											upload.setDatastore(datastore);
											upload.setCallback(function(){
												inst.refresh();
											});
											upload.open();
										}
									}
							}
							totalObj["upload"] = uploadObj;
						}

						// 삭제
						if (o.type === "geoserver" || o.type === "point" || o.type === "multipoint" || o.type === "linestring"
							|| o.type === "multilinestring" || o.type === "polygon" || o.type === "multipolygon") {
							var deleteObj = {
									"separator_before" : false,
									"icon" : "fa fa-trash",
									"separator_after" : false,
									"_disabled" : function() {
										console.log(o);
										console.log(cb);
										var result = true;
										if (o.type === "geoserver" || o.type === "point" || o.type === "multipoint" || o.type === "linestring"
											|| o.type === "multilinestring" || o.type === "polygon" || o.type === "multipolygon") {
											result = false;
										}
										return result;
									},
									"label" : that.translation.remove[that.locale],
									/*
									 * ! "shortcut" : 113, "shortcut_label" : 'F2', "icon" :
									 * "glyphicon glyphicon-leaf",
									 */
									"action" : function(data) {
										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;

										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										if (obj.type === "geoserver") {
											// 선택한 노드가 서버이면 삭제창 출력
											that.openDeleteGeoServer(obj.id);
										} else if (obj.type === "point" || obj.type === "multipoint" || obj.type === "linestring"
											|| obj.type === "multilinestring" || obj.type === "polygon" || obj.type === "multipolygon") {
											// 선택한 노드가 레이어면
											var nodes = inst.get_selected(true);
											var server = [];
											var ws = [];
											var ds = [];
											var layers = [];
											var layerstxt = [];
											isValid = true;
											for (var i = 0; i < nodes.length; i++) {
												var node = nodes[i];
												console.log(node);
												if (node.type === "geoserver") {
													// 서버 배열에 현재 노드가 없으면 추가
													if (server.indexOf(node.id) === -1) {
														server.push(node.id);
													}
												} else if (node.type === "workspace") {
													// 워크스페이스 없으면 추가
													if (ws.indexOf(node.id) === -1) {
														ws.push(node.id);
													}
												} else if (node.type === "datastore") {
													// 데이터스토어 없으면 추가
													if (ds.indexOf(node.id) === -1) {
														ds.push(node.id);
													}
												} else if (node.type === "point" || node.type === "multipoint" || node.type === "linestring"
													|| node.type === "multilinestring" || node.type === "polygon"
														|| node.type === "multipolygon") {
													// 레이어 없으면 추가
													if (layers.indexOf(node.id) === -1) {
														layers.push(node.id);
														layerstxt.push(node.text);
													}
												}
											}
											// 삭제할 노드가 복수로 여러 타입이 섞여있으면 불가
											if (server.length > 0 || ws.length > 0 || ds.length > 0) {
												isValid = false;
												that.messageModal(that.translation.err[that.locale], that.translation.nodelsamestore[that.locale]);
											} else {
												// 레이어만 선택했을 경우
												for (var i = 0; i < layers.length; i++) {
													var layerNode = inst.get_node(layers[i]);
													var serverId = inst.get_node(layerNode.parents[2]);
													if (server.indexOf(serverId.id) === -1) {
														server.push(serverId.id);
													}
													var workId = inst.get_node(layerNode.parents[1]);
													if (ws.indexOf(workId.id) === -1) {
														ws.push(workId.id);
													}
													var storeId = inst.get_node(layerNode.parents[0]);
													if (ds.indexOf(storeId.id) === -1) {
														ds.push(storeId.id);
													}
													// 서버 두 개 이상 선택 불가
													if (server.length > 1) {
														isValid = false;
													}
													// 워크스페이스 두 개 이상 선택 불가
													if (ws.length > 1) {
														isValid = false;
													}
													// 데이터스토어 두 개 이상 선택 불가
													if (ds.length > 1) {
														isValid = false;
													}
												}
												if (isValid) {
													var sendServer = inst.get_node(server[0]);
													var sendws = inst.get_node(ws[0]);
													var sendds = inst.get_node(ds[0]);
													// 선택 레이어들 삭제
													that.openDeleteGeoServerLayer(sendServer.text, sendws.text, sendds.text, layerstxt);
												} else {
													that.messageModal(that.translation.err[that.locale], that.translation.nodelsamestore[that.locale]);
												}
											}
										}
									}
							}
							totalObj["delete"] = deleteObj;
						}

						if (o.type === "datastore" && o.original.storeType === "GeoGIG") {
							var branchObj = {
									"separator_before" : true,
									"icon" : "fas fa-code-branch",
									"separator_after" : true,
									"label" : that.translation.branch[that.locale],
									"action" : false,
									"_disabled" : function() {
										console.log(o);
										console.log(cb);
										var result = true;
										if (o.type === "datastore") {
											var storeType = o.original.storeType;
											if (storeType === "GeoGIG") {
												result = false;
											}
										}
										return result;
									},
									"submenu" : repoObj
							}
							totalObj["branch"] = branchObj;
						}

						if (o.type === "point" || o.type === "multipoint" || o.type === "linestring" || o.type === "multilinestring"
							|| o.type === "polygon" || o.type === "multipolygon") {
							var propObj = {
									"separator_before" : false,
									"icon" : "fa fa-info-circle",
									"separator_after" : false,
									"_disabled" : function() {
										console.log(o);
										console.log(cb);
										var result = true;
										if (o.type === "point" || o.type === "multipoint" || o.type === "linestring"
											|| o.type === "multilinestring" || o.type === "polygon" || o.type === "multipolygon") {
											result = false;
										}
										return result;
									},
									"label" : that.translation.prop[that.locale],
									"action" : function(data) {
										var inst = $.jstree.reference(data.reference), obj = inst.get_node(data.reference);
										var arr, workspace = [];

										var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
										// Edit Tool 활성화 상태시 실행 중지
										if(isEdit instanceof Object){
											if(isEdit.get()){
												isEdit.alert();
												return
											}
										}

										if (inst.is_selected(obj)) {
											arr = inst.get_node(obj.parents[obj.parents.length - 2]).children;
											for (var i = 0; i < arr.length; i++) {
												workspace.push(inst.get_node(arr[i]).text);
											}
											that.properties.setWorkSpaceList(workspace);
											that.properties.setForm({
												geoserver : obj.id.split(":")[0],
												workspace : obj.id.split(":")[1],
												datastore : obj.id.split(":")[2],
												layername : obj.id.split(":")[3]
											});
											that.properties.open();
										} else {
											// inst.delete_node_layer(obj);
										}
									}
							}
							totalObj["properties"] = propObj;
						}
						console.log(totalObj);
						return totalObj;
					}
				},
				types : {
					"#" : {
						"valid_children" : [ "geoserver", "default" ]
					},
					"default" : {
						"icon" : "fas fa-exclamation-circle"
					},
					"geoserver" : {
						"icon" : "fas fa-globe",
						"valid_children" : [ "workspace" ]
					},
					"workspace" : {
						"icon" : "fas fa-archive",
						"valid_children" : [ "datastore" ]
					},
					"datastore" : {
						"icon" : "fas fa-hdd",
						"valid_children" : [ "raster", "polygon", "multipolygon", "linestring", "multilinestring", "point", "multipoint" ]
					},
					"raster" : {
						"icon" : "fas fa-chess-board"
					},
					"polygon" : {
						"icon" : "fas fa-square-full"
					},
					"multipolygon" : {
						"icon" : "fas fa-square-full"
					},
					"linestring" : {
						"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
					},
					"multilinestring" : {
						"icon" : "fas fa-minus fa-lg gb-fa-rotate-135"
					},
					"point" : {
						"icon" : "fas fa-circle gb-fa-xxs"
					},
					"multipoint" : {
						"icon" : "fas fa-circle gb-fa-xxs"
					}
				},
				"plugins" : [ "contextmenu", "search", "types", "geoserver" ]
			});
	this.jstree = $(this.panelBody).jstree(true);
	if (!!this.properties) {
		this.properties.setRefer(this.jstree);
	}

	$(document).on("click", "#geoserverAddConfirm", function(e){
		var name,
		url,
		id,
		pass;

		$(".gb-geoserver-add-input").each(function(index){
			if($(this).hasClass("geoserver-name")){
				name = $(this).val();
			} else if($(this).hasClass("geoserver-url")){
				url = $(this).val();
			} else if($(this).hasClass("geoserver-id")){
				id = $(this).val();
			} else if($(this).hasClass("geoserver-password")){
				pass = $(this).val();
			}
		});

		that.addGeoServer(name, url, id, pass);
	});
};
gb3d.tree.GeoServer.prototype = Object.create(gb3d.tree.GeoServer.prototype);
gb3d.tree.GeoServer.prototype.constructor = gb3d.tree.GeoServer;

/**
 * jstree 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getJSTree
 * @return {$.jstree} GeoServer 목록을 표출할 jsTree 객체
 */
gb3d.tree.GeoServer.prototype.getJSTree = function() {
	return this.jstree;
};

/**
 * jstree 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setJSTree
 * @param {$.jstree} jstree - GeoServer 목록을 표출할 jsTree 객체
 */
gb3d.tree.GeoServer.prototype.setJSTree = function(jstree) {
	this.jstree = jstree;
};

/**
 * loadingNumber 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getLoadingNumber
 * @return {Array.<number>} 로딩할 노드목록을 가진 객체
 */
gb3d.tree.GeoServer.prototype.getLoadingNumber = function() {
	return this.loadingNumber;
};

/**
 * loadingNumber 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setLoadingNumber
 * @param {number} idx - 남은 레이어 로딩 개수를 설정할 인덱스
 * @param {number} num - 남은 레이어 로딩 개수
 */
gb3d.tree.GeoServer.prototype.setLoadingNumber = function(idx, num) {
	this.loadingNumber[idx] = num;
};

/**
 * loadingNumber 객체를 초기화한다.
 * 
 * @method gb3d.tree.GeoServer#initLoadingNumber
 */
gb3d.tree.GeoServer.prototype.initLoadingNumber = function() {
	this.loadingNumber = [];
};

/**
 * loadingList 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getLoadingList
 * @return {Object} 로딩할 레이어 목록을 가진 객체
 */
gb3d.tree.GeoServer.prototype.getLoadingList = function() {
	return this.loadingList;
};

/**
 * loadingList 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setLoadingList
 * @param {Array.<Object>} list - 로딩할 레이어 목록
 */
gb3d.tree.GeoServer.prototype.setLoadingList = function(list) {
	this.loadingList = list;
};

/**
 * loadingList 목록에 추가한다.
 * 
 * @method gb3d.tree.GeoServer#addLoadingList
 * @param {number} idx - 레이어 식별자가 저장될 배열의 인덱스
 * @param {string} nodeId - 레이어 식별자
 */
gb3d.tree.GeoServer.prototype.addNodeToLoadingList = function(idx, nodeId) {
	var list = this.getLoadingList();
	if (Array.isArray(list)) {
		if (list[idx] === undefined) {
			list[idx] = {};
			this.setLoadingNumber(idx, 1);
		}
		list[idx][nodeId] = false;
	} else {
		console.error("로딩 리스트 객체가 배열이 아닙니다.");
	}
};

/**
 * loadingList 객체를 초기화한다.
 * 
 * @method gb3d.tree.GeoServer#initLoadingList
 */
gb3d.tree.GeoServer.prototype.initLoadingList = function() {
	this.loadingList = [];
};

/**
 * loadingList, loadingNumber 객체에 로딩 정보를 변경한다
 * 
 * @method gb3d.tree.GeoServer#changeNodeOnLoadingList
 * @param {number} idx - 로딩 정보가 저장된 인덱스
 * @param {string} nodeId - 레이어 식별자
 * @param {boolean} flag - 증감여부 (true 감소, false 증가)
 */
gb3d.tree.GeoServer.prototype.changeNodeOnLoadingList = function(idx, nodeId, flag) {
	var that = this;
	var list = this.getLoadingList();
	if (list[idx].hasOwnProperty(nodeId)) {
		list[idx][nodeId] = flag;
		// if (that.getLoadingNumber()[idx] === -1) {
		// that.setLoadingNumber(idx, 0);
		// }
		if (flag) {
			// 0보다크면 감소
			if (that.getLoadingNumber()[idx] > 0) {
				that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] - 1));
			}
		} else {
			that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] + 1));
		}
	} else {
		console.error("there is no node id:", nodeId);
		return;
	}
};

/**
 * GeoServer 등록창을 연다.
 * 
 * @method gb3d.tree.GeoServer#openAddGeoServer
 */
gb3d.tree.GeoServer.prototype.openAddGeoServer = function() {
	var that = this;
	var gName = $("<div>").addClass("gb-geoserver-add-label").text(that.translation["name"][that.locale]+": ");
	var gNameInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : "EX) Geoserver",
		"value" : "geo32"
	}).addClass("gb-geoserver-add-input");
	var gNameInputDiv = $("<div>").append(gNameInput).addClass("gb-geoserver-add-input-cell");
	var gNameArea = $("<div>").append(gName).append(gNameInputDiv).addClass("gb-geoserver-add-row");

	var gURL = $("<div>").text("URL: ").addClass("gb-geoserver-add-label");
	var gURLInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : "EX) http://127.0.0.1:9990/geoserver",
		"value" : "http://175.116.181.32:9999/geoserver"
	}).addClass("gb-geoserver-add-input");
	var gURLInputDiv = $("<div>").append(gURLInput).addClass("gb-geoserver-add-input-cell");
	var gURLArea = $("<div>").append(gURL).append(gURLInputDiv).addClass("gb-geoserver-add-row");

	var gID = $("<div>").text(that.translation["id"][that.locale]+": ").addClass("gb-geoserver-add-label");
	var gIDInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : "EX) admin",
		"value" : "admin"
	}).addClass("gb-geoserver-add-input");
	var gIDInputDiv = $("<div>").append(gIDInput).addClass("gb-geoserver-add-input-cell");
	var gIDArea = $("<div>").append(gID).append(gIDInputDiv).addClass("gb-geoserver-add-row");

	var gPass = $("<div>").text(that.translation["password"][that.locale]+": ").addClass("gb-geoserver-add-label");
	var gPassInput = $("<input>").attr({
		"type" : "password",
		"autocomplete": "username",
		"placeholder" : "EX) geoserver",
		"value" : "geoserver"
	}).addClass("gb-geoserver-add-input");
	var gPassInputDiv = $("<div>").append(gPassInput).addClass("gb-geoserver-add-input-cell");
	var gPassArea = $("<div>").append(gPass).append(gPassInputDiv).addClass("gb-geoserver-add-row");

	var closeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").addClass("gb-button-float-right").text(that.translation["close"][that.locale]);
	var okBtn = $("<button>").addClass("gb-button").addClass("gb-button-primary").addClass("gb-button-float-right").text(that.translation["add"][that.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var gBody = $("<form>").addClass("gb-geoserver-add-table").append(gNameArea).append(gURLArea).append(gIDArea).append(gPassArea);

	var addGeoServerModal = new gb.modal.ModalBase({
		"title" : that.translation["addgeoserver"][that.locale],
		"width" : 540,
		"height" : 400,
		"autoOpen" : true,
		"body" : gBody,
		"footer" : modalFooter
	});
	$(closeBtn).click(function() {
		addGeoServerModal.close();
	});
	$(okBtn).click(function() {
		that.addGeoServer($(gNameInput).val(), $(gURLInput).val(), $(gIDInput).val(),
				$(gPassInput).val(), addGeoServerModal);
	});
// that.addGeoserverModal.modal("show");
};

/**
 * GeoServer를 등록한다.
 * 
 * @method gb3d.tree.GeoServer#addGeoServer
 * @param {string} name - 지오서버의 이름
 * @param {string} url - 지오서버의 URL
 * @param {string} id - 지오서버 접속을 위한 ID
 * @param {string} password - 지오서버 접속을 위한 비밀번호
 * @param {gb.modal.ModalBase} modal - 완료 후 창을 닫을 모달 객체
 */
gb3d.tree.GeoServer.prototype.addGeoServer = function(name, url, id, password, modal) {
	var that = this;
	console.log("add geoserver");
	console.log(name);
	console.log(url);
	console.log(id);
	console.log(password);
	var params = {
			"serverName" : name,
			"serverURL" : url,
			"Id" : id,
			"pw" : password
	};
	$.ajax({
		url : this.getAddGeoServerURL() + (this.getAddGeoServerURL().indexOf("?") !== -1 ? "&" : "?") + jQuery.param(params),
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
			that.showSpinner(true, that.addGeoserverModal);
		},
		complete : function() {
			$("body").css("cursor", "default");
			that.showSpinner(false, that.addGeoserverModal);
		},
		success : function(data,textStatus,jqXHR) {
			console.log(data);
			modal.close();
			if (data === true) {
				that.refreshList();
			}
		}		
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * GeoServer 삭제 확인창을 연다.
 * 
 * @method gb3d.tree.GeoServer#openDeleteGeoServer
 * @param {string} geoserver - 목록에서 삭제할 GeoServer 이름
 */
gb3d.tree.GeoServer.prototype.openDeleteGeoServer = function(geoserver) {
	var that = this;
	console.log("open delete geoserver");
	var msg1 = $("<div>").text(this.translation.removegeomsg[this.locale]).addClass("gb-geoserver-msg16");
	var msg2 = $("<div>").text('"' + geoserver + '"').addClass("gb-geoserver-msg24");
	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(this.translation.remove[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var deleteModal = new gb.modal.ModalBase({
		"title" : this.translation.removegeo[this.locale],
		"width" : 340,
		"height" : 200,
		"autoOpen" : false,
		"body" : body,
		"footer": buttonArea
	});
	$(closeBtn).click(function() {
		deleteModal.close();
	});
	$(okBtn).click(function() {
		that.deleteGeoServer(geoserver, deleteModal);
	});
	deleteModal.open();
};

/**
 * GeoServer를 삭제한다.
 * 
 * @method gb3d.tree.GeoServer#deleteGeoServer
 * @param {string} geoserver - 삭제할 지오서버의 이름
 * @param {gb.modal.ModalBase} modal - 완료후 닫을 모달 객체
 */
gb3d.tree.GeoServer.prototype.deleteGeoServer = function(geoserver, modal) {
	var that = this;
	console.log("delete geoserver");
	var params = {
			"serverName" : geoserver
	};
	$.ajax({
		url : this.getDeleteGeoServerURL() + "&" + jQuery.param(params),
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			modal.close();
			if (data === true) {
				that.refreshList();
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * GeoServer 레이어 삭제 확인창을 연다.
 * 
 * @method gb3d.tree.GeoServer#openDeleteGeoServerLayer
 * @param {string} server - 지오서버 이름
 * @param {string} work - 작업공간 이름
 * @param {string} store - 데이터저장소 이름
 * @param {string} layer - 레이어 이름
 */
gb3d.tree.GeoServer.prototype.openDeleteGeoServerLayer = function(server, work, store, layer) {
	var that = this;
	console.log("open delete geoserver layer");
	console.log(layer);
	var todel;
	if (Array.isArray(layer)) {
		if (layer.length > 1) {
			todel = '"' + layer[0] + '" ' + that.translation.and[that.locale]+" " + (layer.length - 1) +that.translation.more[that.locale];
		} else {
			todel = '"' + layer[0] + '" ';
		}
	}
	var msg1 = $("<div>").addClass("gb-geoserver-msg16");
	if (layer.length > 1) {
		$(msg1).text(that.translation.removelayermsg2[that.locale]);
	} else {
		$(msg1).text(that.translation.removelayermsg1[that.locale]);
	}
	var msg2 = $("<div>").text(todel).addClass("gb-geoserver-msg24");
	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(that.translation.cancel[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(that.translation.remove[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var deleteModal = new gb.modal.ModalBase({
		"title" : that.translation.removelayer[that.locale],
		"width" : 340,
		"height" : 225,
		"autoOpen" : false,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		deleteModal.close();
	});
	$(okBtn).click(function() {
		that.deleteGeoServerLayer(server, work, store, layer, deleteModal);
	});
	deleteModal.open();
};

/**
 * GeoServer Layer 를 삭제한다.
 * 
 * @method gb3d.tree.GeoServer#deleteGeoServerLayer
 * @param {string} geoserver - 삭제할 레이어의 지오서버 이름
 * @param {string} work - 삭제할 레이어의 지오서버 워크스페이스 이름
 * @param {string} store - 삭제할 레이어의 데이터저장소 이름
 * @param {(string|Array.<string>)} layer - 삭제할 레이어의 이름
 * @param {gb.modal.ModalBase} modal - 완료후 창을 닫을 모달 객체
 */
gb3d.tree.GeoServer.prototype.deleteGeoServerLayer = function(geoserver, work, store, layer, modal) {
	var that = this;
	console.log("delete geoserver layer");
	var params = {
			"serverName" : geoserver,
			"workspace" : work,
			"datastore" : store,
			"layerList" : typeof layer === "string" ? [ layer ] : Array.isArray(layer) ? layer : undefined
	};

	$.ajax({
		url : this.deleteGeoServerLayerURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify(params),
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data, status, xhr) {
			console.log(data);
			modal.close();
			if (data === true) {
				that.refreshList();
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * GeoServer 목록을 새로고침한다.
 * 
 * @method gb3d.tree.GeoServer#refreshList
 */
gb3d.tree.GeoServer.prototype.refreshList = function() {
	console.log("refresh list");
	this.getJSTree().refresh();
};
/**
 * 레이어 검색창을 연다.
 * 
 * @method gb3d.tree.GeoServer#openSearchBar
 */
gb3d.tree.GeoServer.prototype.openSearchBar = function() {
	console.log("open search on geoserver");
	$(this.titleArea).css({
		"display" : "none"
	});
	$(this.searchArea).css({
		"display" : "block"
	});
};
/**
 * 레이어 검색창을 닫는다.
 * 
 * @method gb3d.tree.GeoServer#closeSearchBar
 */
gb3d.tree.GeoServer.prototype.closeSearchBar = function() {
	console.log("close search geoserver");
	$(this.titleArea).css({
		"display" : "block"
	});
	$(this.searchArea).css({
		"display" : "none"
	});
};
/**
 * 지오서버 추가를 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getAddGeoServerURL
 * @return {string} GeoServer 추가 URL
 */
gb3d.tree.GeoServer.prototype.getAddGeoServerURL = function() {
	return this.addGeoServerURL;
};
/**
 * 지오서버 추가를 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setAddGeoServerURL
 * @param {string} url - GeoServer 추가 URL
 */
gb3d.tree.GeoServer.prototype.setAddGeoServerURL = function(url) {
	this.addGeoServerURL = url;
};
/**
 * 지오서버 삭제를 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getDeleteGeoServerURL
 * @return {string} GeoServer 삭제 URL
 */
gb3d.tree.GeoServer.prototype.getDeleteGeoServerURL = function() {
	return this.deleteGeoServerURL;
};

/**
 * 지오서버 삭제를 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setDeleteGeoServerURL
 * @param {string} url - GeoServer 삭제 URL
 */
gb3d.tree.GeoServer.prototype.setDeleteGeoServerURL = function(url) {
	this.deleteGeoServerURL = url;
};

/**
 * 지오서버 정보 조회를 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getGeoServerInfoURL
 * @return {string} GeoServer 정보 조회 URL
 */
gb3d.tree.GeoServer.prototype.getGeoServerInfoURL = function() {
	return this.geoserverInfoURL;
};

/**
 * 지오서버 정보 조회를 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setGeoServerInfoURL
 * @param {string} url - GeoServer 정보 조회 URL
 */
gb3d.tree.GeoServer.prototype.setGeoServerInfoURL = function(url) {
	this.geoserverInfoURL = url;
};

/**
 * 지오서버 레이어 삭제를 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getDeleteGeoServerLayerURL
 * @return {string} GeoServer 레이어 삭제 URL
 */
gb3d.tree.GeoServer.prototype.getDeleteGeoServerLayerURL = function() {
	return this.deleteGeoServerLayerURL;
};
/**
 * 지오서버 레이어 삭제를 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setDeleteGeoServerLayerURL
 * @param {string} url - GeoServer 레이어 삭제 URL
 */
gb3d.tree.GeoServer.prototype.setDeleteGeoServerLayerURL = function(url) {
	this.deleteGeoServerLayerURL = url;
};

/**
 * 지오서버 트리구조 요청을 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getGetTreeURL
 * @return {string} GeoServer 트리구조 요청 URL
 */
gb3d.tree.GeoServer.prototype.getGetTreeURL = function() {
	return this.getTreeURL;
};
/**
 * 지오서버 트리구조 요청을 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setGetTreeURL
 * @param {string} url - GeoServer 트리구조 요청 URL
 */
gb3d.tree.GeoServer.prototype.setGetTreeURL = function(url) {
	this.getTreeURL = url;
};

/**
 * 데이터스토어 타겟 브랜치 전환 요청을 위한 URL을 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getSwitchGeoGigBranchURL
 * @return {string} 브랜치 변경 URL
 */
gb3d.tree.GeoServer.prototype.getSwitchGeoGigBranchURL = function() {
	return this.switchGeoGigBranchURL;
};
/**
 * 데이터스토어 타겟 브랜치 전환 요청을 위한 URL을 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setSwitchGeoGigBranchURL
 * @param {string} url - 브랜치 변경 URL
 */
gb3d.tree.GeoServer.prototype.setSwitchGeoGigBranchURL = function(url) {
	this.switchGeoGigBranchURL = url;
};

/**
 * SHP 파일 업로드 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getUploadSHP
 * @return {gb.geoserver.UploadSHP} SHP 업로드 객체
 */
gb3d.tree.GeoServer.prototype.getUploadSHP = function() {
	return this.uploadSHP;
};
/**
 * SHP 파일 업로드 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setUploadSHP
 * @param {gb.geoserver.UploadSHP} upload - SHP 업로드 객체
 */
gb3d.tree.GeoServer.prototype.setUploadSHP = function(upload) {
	this.uploadSHP = upload;
};

/**
 * Simple3DManager 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getSimple3DManager
 * @return {gb3d.io.Simple3DManager} Simple3DManager 객체
 */
gb3d.tree.GeoServer.prototype.getSimple3DManager = function() {
	return this.simple3DManager;
};
/**
 * Simple3DManager 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setSimple3DManager
 * @param {gb3d.io.Simple3DManager} upload - SHP 업로드 객체
 */
gb3d.tree.GeoServer.prototype.setSimple3DManager = function(simple3d) {
	this.simple3DManager = simple3d;
};

/**
 * OBJ zip 파일 업로드 객체를 반환한다.
 * 
 * @method gb3d.tree.GeoServer#getMultiOBJManager
 * @return {gb3d.io.MultiOBJManager} MultiOBJManager 객체
 */
gb3d.tree.GeoServer.prototype.getMultiOBJManager = function() {
	return this.multiOBJManager;
};
/**
 * OBJ zip 파일 업로드 객체를 설정한다.
 * 
 * @method gb3d.tree.GeoServer#setMultiOBJManager
 * @param {gb3d.io.MultiOBJManager} upload - SHP 업로드 객체
 */
gb3d.tree.GeoServer.prototype.setMultiOBJManager = function(multi) {
	this.multiOBJManager = multi;
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @method gb3d.tree.GeoServer#messageModal
 * @param {string} title - 모달의 타이틀
 * @param {string} msg - 보여줄 메세지
 */
gb3d.tree.GeoServer.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").append(msg).addClass("gb-geoserver-msgmodal-body");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text("OK");
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 310,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};

/**
 * GeoGig 저장소의 타겟 브랜치를 변경한다.
 * 
 * @method gb3d.tree.GeoServer#switchBranch
 * @param {string} server - 작업 중인 GeoServer 이름
 * @param {string} work - 작업 중인 작업공간 이름
 * @param {string} store - 작업 중인 데이터저장소 이름
 * @param {string} branch - 작업 중인 브랜치 이름
 * @param {gb.modal.ModalBase} modal - 완료 후 닫을 모달 객체
 */
gb3d.tree.GeoServer.prototype.switchBranch = function(server, work, store, branch, modal) {
	var that = this;
	console.log("switch branch");
	var params = {
			"serverName" : server,
			"workspace" : work,
			"datastore" : store,
			"branch" : branch
	};

	var checkURL = this.getSwitchGeoGigBranchURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}
	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			modal.close();
			if (data === true) {
				that.refreshList();
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 노드를 마지막 자식 노드까지 로드한다.
 * 
 * @method gb3d.tree.GeoServer#openNodeRecursive
 * @param {number} idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {Object} node - 열려는 노드
 * @param {Object} topNode - 레이어 목록에서 선택한 노드
 * @param {function} afterOpen - 로드후 실행할 콜백함수
 * @param {boolean} each - 각 노드를 불러왔을 때마다 콜백 함수를 실행할지 지정
 */
gb3d.tree.GeoServer.prototype.openNodeRecursive = function(idx, node, topNode, afterOpen, each) {
	var that = this;
	var callback = function(opened, children) {
		if (that.getLoadingNumber()[idx] > -1) {
			that.setLoadingNumber(idx, that.getLoadingNumber()[idx] + opened.children.length);
		}
		console.log("현재 로딩 리스트 인덱스에 로딩되야할 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
		that.changeNodeOnLoadingList(idx, opened.id, true);
		console.log("현재 로딩이 완료된 부모 노드는: ", opened.id.toString());
		console.log("현재 로딩 리스트 인덱스에 로딩되야할 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
		if (children) {
			var childrenNodes = opened.children;
			for (var i = 0; i < childrenNodes.length; i++) {
				that.addNodeToLoadingList(idx, childrenNodes[i]);
				var child = that.getJSTree().get_node(childrenNodes[i]);
				console.log("지금 로딩 리스트에 추가된 자식 노드는: ", child.id.toString());
				console.log("지금 로딩 리스트의 로딩되야할 자식 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
				if (each) {
					that.openNodeRecursive(idx, child, topNode, afterOpen, true);
				} else {
					if (i === (childrenNodes.length - 1)) {
						that.openNodeRecursive(idx, child, topNode, afterOpen, false);
					} else {
						that.openNodeRecursive(idx, child, topNode, undefined, false);
					}
				}
			}
		} else {
			if (typeof afterOpen === "function" && that.getLoadingNumber()[idx] === 0) {
				afterOpen(topNode);
			}
		}
	};
	that.addNodeToLoadingList(idx, node.id);
	if (!that.getJSTree().is_open(node)) {
		that.getJSTree().open_node(node, callback);
	} else {
		var already = node;
		callback(node, node.children.length > 0);
	}
};

/**
 * GeoGig 저장소의 타겟 브랜치를 변경한다.
 * 
 * @method gb3d.tree.GeoServer#errorModal
 * @param {string} code - 오류 코드
 */
gb3d.tree.GeoServer.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * GeoServer 정보 확인창을 생성한다.
 * 
 * @method gb.versioning.Repository#geoserverInfoModal
 * @param {string} serverName - 작업 중인 서버 노드
 */
gb3d.tree.GeoServer.prototype.geoserverInfoModal = function(serverName) {
	var that = this;

	var geoserverkey = $("<div>").addClass("gb-geoserver-info-key").text("GeoServer "+this.translation.version[this.locale]);
	var geoserverval = $("<div>").addClass("gb-geoserver-info-value");
	var row1 = $("<div>").addClass("gb-geoserver-info-row").append(geoserverkey).append(geoserverval);

	var geotoolskey = $("<div>").addClass("gb-geoserver-info-key").text("GeoTools "+this.translation.version[this.locale]);
	var geotoolsval = $("<div>").addClass("gb-geoserver-info-value");
	var row2 = $("<div>").addClass("gb-geoserver-info-row").append(geotoolskey).append(geotoolsval);

	var cachekey = $("<div>").addClass("gb-geoserver-info-key").text("GeoWebCache "+this.translation.version[this.locale]);
	var cacheval = $("<div>").addClass("gb-geoserver-info-value");
	var row3 = $("<div>").addClass("gb-geoserver-info-row").append(cachekey).append(cacheval);

	var idkey = $("<div>").addClass("gb-geoserver-info-key").text(this.translation.id[this.locale]);
	var idval = $("<div>").addClass("gb-geoserver-info-value");
	var row4 = $("<div>").addClass("gb-geoserver-info-row").append(idkey).append(idval);

	var urlkey = $("<div>").addClass("gb-geoserver-info-key").text("URL");
	var urlval = $("<div>").addClass("gb-geoserver-info-value");
	var row5 = $("<div>").addClass("gb-geoserver-info-row").append(urlkey).append(urlval);

	var tb = $("<div>").addClass("gb-geoserver-info-table").append(row1).append(row2).append(row3).append(row4).append(row5);
	var body = $("<div>").append(tb);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(this.translation.close[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

	var params = {
			"serverName" : serverName,
			"type" : "server",
			"format" : "json",
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getGeoServerInfoURL();
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
		// data : params,
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
			if (data !== undefined) {
				data = JSON.parse(data);
				var resource = data.about.resource;
				var info = data.info;
				$(geoserverval).html(resource[0]["Version"]);
				$(geotoolsval).html(resource[1]["Version"]);
				$(cacheval).html(resource[2]["Version"]);
				$(idval).html(info.id);
				$(urlval).html(info.url);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});

	var removeModal = new gb.modal.ModalBase({
		"title" : this.translation.serverinfo[this.locale],
		"width" : 574,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		removeModal.close();
	});
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb3d.tree.GeoServer#showSpinner
 * @param {boolean} show - 스피너 표시 유무
 * @param {gb.modal.ModalBase} modal - 스피너를 보이거나 숨길 모달 객체
 */
gb3d.tree.GeoServer.prototype.showSpinner = function(show, modal) {
	if (show) {
		var spinnerArea = $("<div>").addClass("gb-spinner-wrap").addClass("gb-spinner-body").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x").addClass("gb-spinner-position"));
		$(modal).append(spinnerArea);
	} else {
		$(modal).find(".gb-spinner-wrap").remove();
	}
};

