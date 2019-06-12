var gb;
if (!gb)
	gb = {};
if (!gb.validation)
	gb.validation = {};

(function($) {
	var locale = "en";
	var translation = {
		"add" : {
			"ko" : "추가",
			"en" : "Add"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"remove" : {
			"ko" : "제거",
			"en" : "Remove"
		},
		"start" : {
			"ko" : "시작",
			"en" : "Start"
		},
		"validation" : {
			"ko" : "검수",
			"en" : "Validation"
		},
		"geoserver" : {
			"ko" : "지오서버",
			"en" : "Geoserver"
		},
		"validateList" : {
			"ko" : "검수 목록",
			"en" : "Validate List"
		},
		"digitalMap" : {
			"ko" : "수치지도",
			"en" : "Digital Map"
		},
		"under" : {
			"ko" : "지하시설물",
			"en" : "Under Facility"
		},
		"forestMap" : {
			"ko" : "임상도",
			"en" : "Forest Map"
		},
		"selectUserOptionHint" : {
			"ko" : "사용자 정의 옵션을 선택해주세요",
			"en" : "Please Select The User Option"
		},
		"selectCrsHint" : {
			"ko" : "좌표계를 선택해주세요",
			"en" : "Please Select The CRS"
		},
		"selectCrsHint" : {
			"ko" : "좌표계를 선택해주세요",
			"en" : "Please Select The CRS"
		},
		"selectNodeHint" : {
			"ko" : "는(은) workspace를 하나만 선택할 수 있습니다",
			"en" : "can only select one workspace"
		},
		"selectNodesHint" : {
			"ko" : "는(은) workspace를 여러개 선택할 수 있습니다",
			"en" : "can select multiple workspace"
		},
		"nonePresetHint" : {
			"ko" : "Preset ID가 없습니다.",
			"en" : "Preset ID is missing."
		},
		"noneCategoryHint" : {
			"ko" : "Category ID가 없습니다.",
			"en" : "Category ID is missing."
		},
		"requestSuccessAlert" : {
			"ko" : "검수 요청이 완료되었습니다. 검수 결과 페이지에서 진행 상황을 확인할 수 있습니다.",
			"en" : "Your verification request has been completed. You can check your progress on the Result page."
		},
		"requestFailAlert" : {
			"ko" : "검수 요청이 실패했습니다.",
			"en" : "The validation request failed."
		}
	};
	
	/**
	 * 검수 요청 방식 INDEX
	 * 0: error
	 * 1: workspace를 여러개 선택하여 검수를 요청할 수 있음
	 * 2: 한 개의 workspace만 검수를 요청할 수 있음
	 * @type {number}
	 * @private
	 */
	var presetIndex_ = 0;
	
	/**
	 * Preset Index 목록
	 * @type {Object.<string, number>}
	 * @private
	 */
	var INDEXLIST = {
		"Digital Map 1.0" : 1,
		"Digital Map 2.0" : 1,
		"Underground Map 1.0" : 2,
		"Underground Map 2.0" : 2,
		"Forest Map" : 2,
		"nonset" : 3
	};

	/**
	 * 검수 버전, 타입값
	 * @type {Object.<string, Object.<string, string>>}
	 * @private
	 */
	var QATYPE = {
		"1" : {
			"ver" : "qa1",
			"type" : "nm5"
		},
		"2" : {
			"ver" : "qa2",
			"type" : "nm5"
		},
		"3" : {
			"ver" : "qa1",
			"type" : "ug5"
		},
		"4" : {
			"ver" : "qa2",
			"type" : "ug5"
		},
		"5" : {
			"ver" : "qa2",
			"type" : "fr5"
		},
	};

	/**
	 * @classdesc
	 * Web 검수 요청 모듈. Geoserver 레이어 목록을 불러와 레이어 선택하고 검수를 요청한다.
	 * @class gb.validation.Validation
	 * @memberof gb.validation
	 * @constructor
	 * @param {Object} obj - gb.validation.Validation 생성 옵션
	 * @param {Object} obj.url - 검수 요청 정보
	 * @param {string} obj.url.token - 요청 토큰
	 * @param {string} obj.url.requestValidate - 검수 요청 URL
	 * @param {gb.module.isEditing} [obj.isEditing] - {@link gb.edit.EditingTool} 활성화 여부 전역 변수
	 * @param {string} [obj.locale="en"] - 언어 코드
	 * @requires {@link gb.modal.ModalBase}, {@link gb.tree.GeoServer}
	 * @author KIM HOCHUL
	 * @date 2019. 03. 26
	 * @version 0.01
	 */
	gb.validation.Validation = function(obj) {
		obj.keep = true;
		gb.modal.ModalBase.call(this, obj);
		var that = this;

		/**
		 * Geoserver JSTree
		 * @type {gb.tree.GeoServer}
		 * @private
		 */
		this.geoserverTree = undefined;
		
		/**
		 * Working JSTree. Geoserver JSTree에서 선택한 노드를 옮겨놓는 트리.
		 * 검수요청 시 Working JSTree에 추가되어 있는 노드들이 요청되어진다.
		 * @type {$.jstree.plugins.wholerow}
		 * @private
		 */
		this.workingTree = undefined;
		
		/**
		 * 작업 도움말 Element Tag
		 * @type {HTMLElement}
		 * @private
		 */
		this.messageContent = undefined;
		
		/**
		 * 로딩중인 Geoserver 레이어 노드 리스트
		 * @type {Array.<Object.<string, boolean>>}
		 * @private
		 */
		this.loadingList = [];
		
		/**
		 * 로딩되야할 자식노드의 개수 리스트
		 * @type {Array.<number>}
		 * @private
		 */
		this.loadingNumber = [];
		
		/**
		 * 저장된 검수 설정 목록 Select Tag
		 * @type {HTMLElement}
		 * @private
		 */
		this.presetSelectTag = $("<select class='form-control'>");

		/**
		 * 검수 종류 Select Tag
		 * 수치지도, 지하시설물, 임상도
		 * @type {HTMLElement}
		 * @private
		 */
		this.verSelectTag = $("<div>").css({
			"width" : "100%",
			"display" : "inline-flex"
		});
		
		/**
		 * 좌표계 Select Tag
		 * @type {HTMLElement}
		 * @private
		 */
		this.srsSelectTag = $("<select class='form-control'>");
		
		var options = obj || {};
		this.url = options.url || "";
		if(this.url === ""){
			console.error("gb.validation.Validation: 'url' is a required field.");
		}
		this.isEditing = options.isEditing || undefined;
		this.locale = locale = options.locale || "en";
		
		var button = $("<button id='ug5' class='version-btn'>").attr("data-index", 2).addClass("gb-validation-btn").text(translation.under[this.locale]);
		this.verSelectTag.append(button);

		button = $("<button id='nm5' class='version-btn'>").attr("data-index", 1).addClass("gb-validation-btn").text(translation.digitalMap[this.locale]);
		this.verSelectTag.append(button);

		button = $("<button id='fr5' class='version-btn'>").attr("data-index", 2).addClass("gb-validation-btn").text(translation.forestMap[this.locale]);
		this.verSelectTag.append(button);

		$(document).on("click", ".version-btn", function() {
			$(this).parent().find("button").removeClass("active").css({
				"background" : "none rgb(224, 225, 226)",
				"color" : "rgba(0, 0, 0, 0.6)"
			});

			$(this).addClass("active").css({
				"background" : "#00b5ad none",
				"color" : "#fff"
			});

			if ($(this).data("index") === 1) {
				that.messageContent.html($(this).text() + " " + translation.selectNodesHint[locale]);
			} else if ($(this).data("index") === 2) {
				that.messageContent.html($(this).text() + " " + translation.selectNodeHint[locale]);
			}
			var nowPidx  = parseInt($(this).attr("data-index"));
			if (nowPidx !== presetIndex_) {
				var arr = that.workingTree.get_node("#").children || [];
				for (var t = 0; t < arr.length; t++) {
					that.workingTree.delete_node(arr[t]);
				}
			}
			presetIndex_ = nowPidx;
			console.log(presetIndex_);
		});
		
		this.srsSelectTag.append($("<option>").text(translation.selectCrsHint[this.locale]));
		this.srsSelectTag.append($("<option>").val("5186").text("중부원점 투영좌표계(Central Belt 2010)"));
		this.srsSelectTag.append($("<option>").val("4737").text("GRS80 경위도 좌표계(Korean 2000)"));
		this.srsSelectTag.append($("<option>").val("4326").text("WGS84 경위도 좌표계(전지구 좌표계)"));
		this.srsSelectTag.append($("<option>").val("5185").text("서부원점 투영좌표계(West Belt 2010)"));
		this.srsSelectTag.append($("<option>").val("5187").text("동부원점 투영좌표계(East Belt 2010)"));
		this.srsSelectTag.append($("<option>").val("5188").text("동해원점 투영좌표계(East Sea Belt 2010)"));
		this.srsSelectTag.append($("<option>").val("32652").text("WGS84 UTM52N 투영좌표계"));

		this.createContent();

		this.modalFooter.css({
			"position" : "relative"
		});
	}
	// gb.footer.Base 상속
	gb.validation.Validation.prototype = Object.create(gb.modal.ModalBase.prototype);
	gb.validation.Validation.prototype.constructor = gb.validation.Validation;

	/**
	 * 검수 요청창을 연다.
	 * @method gb.validation.Validation#open
	 * @function
	 */
	gb.validation.Validation.prototype.open = function() {
		if (this.isEditing instanceof Object) {
			if (this.isEditing.get()) {
				this.isEditing.alert();
				return			}
		}
		this.geoserverTree.refresh();
		gb.modal.ModalBase.prototype.open.call(this);
	}
	
	/**
	 * 검수 요청창에서 선택한 값들을 반환한다.
	 * @method gb.validation.Validation#getParameter
	 * @function
	 * @return {Object.<string, string|Object>}
	 */
	gb.validation.Validation.prototype.getParameter = function() {
		var params = {};
		var datastoreList = {};
		var node;
		var preset = this.presetSelectTag.find("option:selected");
		var srs = this.srsSelectTag.find("option:selected");
		var list = this.workingTree.get_node("#").children_d || [];

		params.geoserver = {};
		params.geoserver.layers = {};

		for (var i = 0; i < list.length; i++) {
			node = this.workingTree.get_node(list[i]);
			if (node.type === "geoserver") {
				params.geoserver.servername = node.text;
			} else if (node.type === "workspace") {
				params.geoserver.layers[node.text] = [];
			} else if (node.type === "datastore") {
				datastoreList[node.id] = this.workingTree.get_node(node.parent).text;
			} else {
				params.geoserver.layers[datastoreList[node.parent]].push(node.text);
			}
		}

		if (!srs.val()) {
			this.messageContent.html(translation.selectCrsHint[this.locale]);
			return false;
		} else {
			params.crs = "EPSG:" + srs.val();
		}

		if (!preset.data("prid")) {
			this.messageContent.html(translation.nonePresetHint[this.locale]);
			return false;
		} else {
			params.prid = preset.data("prid").toString();
		}

		if (preset.data("prid") === "nonset") {
			params.qaVer = "qa2";
			params.qaType = $(".version-btn.active").attr("id");

			for ( var i in QATYPE) {
				if (QATYPE[i].ver === params.qaVer && QATYPE[i].type === params.qaType) {
					params.cat = i;
				}
			}
		} else {
			if (!preset.data("cat")) {
				this.messageContent.html(translation.noneCategoryHint[this.locale]);
				return false;
			} else {
				params.cat = preset.data("cat");
				params.qaVer = QATYPE[preset.data("cat").toString()].ver;
				params.qaType = QATYPE[preset.data("cat").toString()].type;
			}
		}

		return params;
	}

	/**
	 * 사용하지않는 함수
	 * @method gb.validation.Validation#createStepDiv
	 * @function
	 * @private
	 */
	gb.validation.Validation.prototype.createStepDiv = function() {
		var icon1 = $("<i>");
		var title1 = $("<h2 class='step-title'>");
		var desc1 = $("<h4 class='step-desc'>");
		var content1 = $("<div class='step-content'>").append;

		var step1 = $("<div class='step'>").css({
			"position" : "relative",
			"display" : "flex",
			"padding-left" : "2em",
			"width" : "33.333%",
			"justify-content" : "center"
		}).append(icon1).append(content1);

		var steps = $("<div class='steps'>").css({
			"display" : "inline-flex",
			"-webkit-box-orient" : "horizontal",
			"-webkit-box-direction" : "normal",
			"-ms-flex-direction" : "row",
			"flex-direction" : "row",
			"-webkit-box-align" : "stretch"
		}).append(step1).append(step2);
		var wrapper = $("<div class='step-wrapper'>").css({});
	}

	/**
	 * 검수 요청 Layout에 Geoserver Tree, 검수 옵션 선택자, Working Tree를 생성한다.
	 * Body Tag 하위에 생성
	 * @method gb.validation.Validation#createContent
	 * @function
	 */
	gb.validation.Validation.prototype.createContent = function() {
		var treePanel = this.createJSTreePanel();
		var optionPanel = this.createOptionPanel();
		var workTreePanel = this.createWorkTreePanel();

		optionPanel.addClass("col-md-12");
		workTreePanel.addClass("col-md-12");

		var left = $("<div class='col-md-6'>").append(treePanel);

		var rightContent = $("<div class='row'>").append(optionPanel).append(workTreePanel);

		var right = $("<div class='col-md-6'>").append(rightContent);

		var i = $("<div>").addClass("fas fa-info-circle fa-2x");
		var messageContent = $("<div>").addClass("gb-validation-message").append(i).append(this.messageContent);
		var message = $("<div>").addClass("col-md-12 ").append(messageContent);

		var body = $("<div class='row'>").append(left).append(right).append(message).css({
			"width" : "700px"
		});
		this.setModalBody(body);
		
		var footer = this.createModalFooter();
		this.setModalFooter(footer);

		$("body").append(this.modal);
		$("body").append(this.background);
	}

	/**
	 * Geoserver JSTree 패널을 생성하여 반환한다.
	 * {@link gb.tree.GeoServer} 모듈 필수
	 * @method gb.validation.Validation#createJSTreePanel
	 * @function
	 * @return {HTMLElement}
	 */
	gb.validation.Validation.prototype.createJSTreePanel = function() {
		var that = this;

		var treeContent = $("<div>").addClass("validation-geoserver-panel").css({
			"min-height" : "500px"
		});

		var gtree = new gb.tree.GeoServer({
			"append" : treeContent[0],
			"height" : "502px",
			"locale" : this.locale,
			"url" : {
				"getTree" : "geoserver/getGeolayerCollectionTree.ajax" + this.url.token,
				"addGeoServer" : "geoserver/addGeoserver.ajax" + this.url.token,
				"deleteGeoServer" : "geoserver/removeGeoserver.ajax" + this.url.token,
				"getMapWMS" : "geoserver/geoserverWMSGetMap.ajax" + this.url.token,
				"getLayerInfo" : "geoserver/getGeoLayerInfoList.ajax" + this.url.token
			}
		});

		this.geoserverTree = gtree.getJSTree();

		var icon = $("<i class='fas fa-plus'>")

		var panelFooter = $("<div>")
			.addClass("gb-validation-footer")
			.hover(function() {
				$(this).css({
					"background-color" : "#cacbcd",
					"color" : "rgba(0,0,0,.8)"
				})
			}, function() {
				$(this).css({
					"background-color" : "#e0e1e2",
					"color" : "#333"
				})
			}).append(icon).append(translation.add[this.locale]);

		panelFooter.on("click", function(e) {
			var i, arr, children;
			var tree = that.geoserverTree;
			var workTree = that.workingTree;
			var selects = tree.get_selected(true);

			var callback = function() {
				for (i = 0; i < selects.length; i++) {
					if (selects[i].parents instanceof Array) {
						arr = selects[i].parents.slice();
					}

					// 선택된 node의 부모 node들을 전부 추가
					for (var j = arr.shift(); j !== undefined; j = arr.shift()) {
						if (j === "#") {
							continue;
						}

						if (!workTree.get_node(j)) {
							workTree.create_node("#", tree.get_node(j).original, "last", false, false);
						}

						if (tree.get_node(j).children.length > 0) {
							that.updateChildren(tree, workTree, tree.get_node(j).children);
						}

						if (tree.get_node(j).type === "workspace" && presetIndex_ === 2) {
							that.removeSameTypeNode(tree.get_node(j), workTree, "#");
						}

						if (tree.get_node(j).type === "geoserver" && (presetIndex_ === 1 || presetIndex_ === 2)) {
							that.removeSameTypeNode(tree.get_node(j), workTree, "#");
						}
					}

					// 선택된 node 추가
					if (!workTree.get_node(selects[i].id)) {
						workTree.create_node(selects[i].parent, selects[i].original, "last", false, false);
					}

					if (selects[i].type === "workspace" && presetIndex_ === 2) {
						that.removeSameTypeNode(selects[i], workTree, "#");
					}

					if (selects[i].type === "geoserver" && (presetIndex_ === 1 || presetIndex_ === 2)) {
						that.removeSameTypeNode(selects[i], workTree, "#");
					}

					var newload;
					if (typeof selects[i] === "string") {
						newload = tree.get_node(selects[i]);
					} else if (typeof selects[i] === "object") {
						newload = tree.get_node(selects[i].id);
					}
					// children = selects[i].children || [];
					children = newload.children || [];
					// 선택된 node의 자식 node들을 전부 추가
					that.createChildren(tree, workTree, children);
				}
				workTree.open_all();
			};

			that.initLoadingList();
			that.initLoadingNumber();
			var nodes = tree.get_selected();
			for (var i = 0; i < nodes.length; i++) {
				var pnodeid = nodes[i];
				console.log("선택한 노드:", pnodeid);
				console.log(that.getLoadingList());
				that.openNodeRecursive(i, tree.get_node(nodes[i]), pnodeid, callback, true);
			}

		});

		treeContent.append(panelFooter);

		return treeContent;
	}

	/**
	 * 중복되는 노드 삭제
	 * @method gb.validation.Validation#removeSameTypeNode
	 * @function
	 * @param {Object} node - JSTree 노드 정보
	 * @param {$.jstree.plugins.wholerow} workingTree - 검수 요청 JSTree
	 * @param {string} root - 부모 노드 아이디
	 */
	gb.validation.Validation.prototype.removeSameTypeNode = function(node, workingTree, root) {
		var that = this;
		var node = node;
		var workTree = workingTree;
		var workNode = workTree.get_node(root);
		var children = workNode.children || [];

		if (!!workNode) {
			if (node.type === workNode.type && node.id !== workNode.id) {
				workTree.delete_node(workNode);
			} else {
				for (var i = 0; i < children.length; i++) {
					that.removeSameTypeNode(node, workTree, children[i])
				}
			}
		}
	}

	/**
	 * 선택된 노드의 자식 노드들을 전부 Working Tree에 추가한다.
	 * @method gb.validation.Validation#createChildren
	 * @function
	 * @param {gb.tree.GeoServer} geoTree - Geoserver JSTree
	 * @param {$.jstree.plugins.wholerow} workingTree - 검수 요청 JSTree
	 * @param {Array} children - 자식 노드 리스트
	 */
	gb.validation.Validation.prototype.createChildren = function(geoTree, workingTree, children) {
		var that = this;
		var i, node;
		var tree = geoTree;
		var workTree = workingTree;
		var list = children;
		for (i = 0; i < list.length; i++) {
			node = tree.get_node(list[i]);
			if (!workTree.get_node(list[i])) {
				workTree.create_node(tree.get_node(list[i]).parent, node.original, "last", false, false);
			}
			if (node.children instanceof Array) {
				// 자식 노드가 자식 노드를 가지고 있다면 callback 실행
				that.createChildren(tree, workTree, node.children);
			}

			if (node.type === "workspace" && presetIndex_ === 2) {
				break;
			}
		}
	}

	/**
	 * Working Tree의 자식 노드들을 적절한 부모 노드 아래로 이동.
	 * 자식 노드가 이미 Working Tree에 로드되어 있는 상태에서 부모 노드가 추가될때 사용되는 함수.
	 * @method gb.validation.Validation#updateChildren
	 * @function
	 * @param {gb.tree.GeoServer} geoTree - Geoserver JSTree
	 * @param {$.jstree.plugins.wholerow} workingTree - 검수 요청 JSTree
	 * @param {Array} children - 자식 노드 리스트
	 */
	gb.validation.Validation.prototype.updateChildren = function(geoTree, workingTree, children){
		var that = this;
		var i, node;
		var tree = geoTree;
		var workTree = workingTree;
		var list = children;
		for (i = 0; i < list.length; i++) {
			node = tree.get_node(list[i]);
			if (!workTree.get_node(list[i])) {
				if (node.children.length > 0) {
					that.updateChildren(tree, workTree, node.children);
				}
			} else {
				workTree.move_node(list[i], node.parent);
			}
		}
	}

	/**
	 * Working JSTree 패널을 생성하여 반환한다.
	 * @method gb.validation.Validation#createWorkTreePanel
	 * @function
	 * @return {HTMLElement}
	 */
	gb.validation.Validation.prototype.createWorkTreePanel = function() {
		var that = this;

		var treeContent = $("<div>").addClass("gb-article-body").css({
			"height" : "365px",
			"overflow-y" : "auto"
		});

		treeContent.jstree({
			"core" : {
				"animation" : 0,
				"check_callback" : true,
				"themes" : {
					"stripes" : true
				},
				'data' : []
			},
			"types" : {
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
			"plugins" : [ "contextmenu", "dnd", "search", "state", "types", "wholerow" ]
		});

		this.workingTree = treeContent.jstree(true);

		var panelTitle = $("<p>").text(translation.validateList[this.locale]).css({
			"margin" : "0",
			"float" : "left"
		});
		var titleArea = $("<div>").append(panelTitle)
		var panelHead = $("<div>").addClass("gb-article-head").append(titleArea);

		var panelFooter = $("<div>")
		.addClass("gb-validation-footer")
		.hover(function() {
			$(this).css({
				"background-color" : "#cacbcd",
				"color" : "rgba(0,0,0,.8)"
			})
		}, function() {
			$(this).css({
				"background-color" : "#e0e1e2",
				"color" : "#333"
			})
		}).append($("<i class='fas fa-minus'>")).append(translation.remove[this.locale]);

		panelFooter.on("click", function(e) {
			var workTree = that.workingTree;
			var selects = workTree.get_selected();

			workTree.delete_node(selects);
		});

		var panel = $("<div>").addClass("gb-article").css({
			"margin" : "0"
		}).append(panelHead).append(treeContent).append(panelFooter);

		var div = $("<div>").addClass("validation-worktree-panel").append(panel);
		return div;
	}

	/**
	 * 검수 옵션 선택 패널을 생성하여 반환한다.
	 * @method gb.validation.Validation#createOptionPanel
	 * @function
	 * @return {HTMLElement}
	 */
	gb.validation.Validation.prototype.createOptionPanel = function() {

		// ==================== Create Panel body HTML Start
		// >>>>>>>>>>>>>>>>>>>>
		var presetDiv = $("<div>").addClass("gb-validation-select").append(this.presetSelectTag);
		var verDiv = $("<div>").addClass("gb-validation-select").append(this.verSelectTag);
		var srsDiv = $("<div>").addClass("gb-validation-select").append(this.srsSelectTag);

		var body = $("<div>").append(presetDiv).append(verDiv).append(srsDiv);

		this.messageContent = $("<p>").css({
			"margin" : "0 3px"
		}).html(translation.selectUserOptionHint[this.locale]);
		requestPreset(this, this.presetSelectTag, presetDiv, this.messageContent);
		customSelect(srsDiv);

		// <<<<<<<<<<<<<<<<<<<< Create Panel body HTML End
		// ======================

		var article = $("<div>").append(body).css({
			"margin" : 0
		});
		var div = $("<div>").addClass("validation-option-panel").append(article);
		return div;
	}

	/**
	 * 검수 요청 Layout의 footer tag를 생성하여 반환한다.
	 * @method gb.validation.Validation#createModalFooter
	 * @function
	 * @return {HTMLElement}
	 */
	gb.validation.Validation.prototype.createModalFooter = function() {
		var that = this;

		var closeBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-default").text(translation.close[this.locale]).click(function() {
			that.close();
		});

		var startBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-primary").text(translation.start[this.locale]).click(function(e) {
			var params = that.getParameter();
			
			if(!params){
				return;
			}
			
			var deferredObj = $.ajax({
				url : that.url.requestValidate + that.url.token,
				type : "POST",
				contentType : "application/json; charset=UTF-8",
				dataType : "json",
				cache : false,
				beforeSend : function() {
					that.modal.append($("<div id='validate-request-loading'>")
							.addClass("gb-body-loading")
							.append($("<i>").addClass("fas fa-spinner fa-spin fa-5x").addClass("gb-body-loading-icon")));
				},
				complete : function() {
					// $("body").css("cursor", "default");
					$("#validate-request-loading").remove();
				},
				data : JSON.stringify(params),
				traditional : true
			});

			deferredObj.done(function(data, textStatus, jqXHR) {
				alert(translation.requestSuccessAlert[locale]);
				that.close();
			});

			deferredObj.fail(function(jqXHR, textStatus, errorThrown) {
				alert(translation.requestFailAlert[locale]);
				that.close();
			});
		});

		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(startBtn).append(closeBtn);

		return buttonArea;
	}

	/**
	 * 검수 요청 Layout의 footer tag를 생성하여 반환한다.
	 * @function requestPreset
	 * @param {gb.validation.Validation} that
	 * @param {HTMLElement} obj - 저장된 검수 옵션 Select Tag
	 * @param {HTMLElement} div - 저장된 검수 옵션 Select Tag를 감싼 Div Tag
	 * @param {string} message - 작업 진행 도움말
	 * @private
	 */
	function requestPreset(that, obj, div, message) {
		var select = $(obj);
		var div = $(div);
		var message = message;
		$.ajax({
			url : "option/retrievePresetByUidx.ajax",
			method : "GET",
			success : function(data, textStatus, jqXHR) {
				var option = $("<option>").val("false").text(translation.selectUserOptionHint[locale]);
				select.append(option);

				option = $("<option>").attr("data-title", "nonset").attr("data-cat", 0).attr("data-prid", "nonset").val("nonset").text(
						"not set");
				select.append(option);

				for (var i = 0; i < data.length; i++) {
					option = $("<option>").val(data[i].pid).attr("data-title", data[i].title).attr("data-cat", data[i].cat).attr(
							"data-prid", data[i].pid).text(data[i].name);

					select.append(option);

				}
				customSelect(div, message, that);
			}
		});
	}

	/**
	 * Select Tag 이벤트 처리 함수
	 * @function customSelect
	 * @param {HTMLElement} selectDiv - 저장된 검수 옵션 Select Tag를 감싼 Div Tag
	 * @param {string} message - 작업 진행 도움말
	 * @param {gb.validation.Validation} that
	 * @private
	 */
	function customSelect(selectDiv, message, that) {
		var x, j, selElmnt, a, b, c;
		var that = that;
		// look for any elements with the class "custom-select":
		x = selectDiv;
		selElmnt = x.find("select")[0];
		
		// for each element, create a new DIV that will act as the selected
		// item:
		a = $("<div>").addClass("gb-validation-select-selected");
		a.html(selElmnt.options[selElmnt.selectedIndex].innerHTML);
		x.append(a);
		// for each element, create a new DIV that will contain the option list:
		b = $("<div>").addClass("gb-validation-select-items gb-validation-select-hide");
		for (j = 1; j < selElmnt.length; j++) {
			
			// for each option in the original select element, create a new DIV
			// that will act as an option item:
			
			c = $("<div>");
			c.html(selElmnt.options[j].innerHTML);
			c.on("click", function(e) {
				
				// when an item is clicked, update the original select box, and
				// the selected item:
				var y, i, k, s, h, l, list;
				s = this.parentNode.parentNode.getElementsByTagName("select")[0];
				h = this.parentNode.previousSibling;
				for (i = 0; i < s.length; i++) {
					if (s.options[i].innerHTML == this.innerHTML) {
						s.selectedIndex = i;
						h.innerHTML = this.innerHTML;
						y = this.parentNode.getElementsByClassName("same-as-selected");
						for (k = 0; k < y.length; k++) {
							y[k].removeAttribute("class");
						}
						this.setAttribute("class", "same-as-selected");
						if (!!s.options[i].dataset.title) {
							if (!!INDEXLIST[s.options[i].dataset.title]) {
								if (INDEXLIST[s.options[i].dataset.title] === 3) {
									message.html("검수 종류를 선택해주세요.");
									$(".version-btn").css({
										"cursor" : "pointer",
										"opacity" : "1",
										"pointer-events" : "auto"
									});
									$("#nm5").trigger("click");
								} else {
									$(".version-btn").css({
										"cursor" : "default",
										"opacity" : ".45",
										"pointer-events" : "none"
									});
								}
								if (INDEXLIST[s.options[i].dataset.title] === 1) {
									message.html(s.options[i].dataset.title + translation.selectNodesHint[locale]);
								} else if (INDEXLIST[s.options[i].dataset.title] === 2) {
									message.html(s.options[i].dataset.title + translation.selectNodeHint[locale]);
								}
								if (presetIndex_ !== undefined && presetIndex_ !== null) {
									if (presetIndex_ !== INDEXLIST[s.options[i].dataset.title]) {
										var arr = that.workingTree.get_node("#").children || [];
										for (var t = 0; t < arr.length; t++) {
											that.workingTree.delete_node(arr[t]);
										}
									}
									presetIndex_ = INDEXLIST[s.options[i].dataset.title];
								}
							}

						}
						break;
					}
				}
				h.click();
			});
			b.append(c);
		}
		x.append(b);
		a.on("click", function(e) {
			// when the select box is clicked, close any other select boxes, and
			// open/close the current select box:
			e.stopPropagation();
			closeAllSelect(this);
			this.nextSibling.classList.toggle("gb-validation-select-hide");
			this.classList.toggle("select-arrow-active");
		});
	}

	/**
	 * Select Tag 내용 업데이트 함수
	 * @function updateFormatSelect
	 * @param {Array} list - Select Tag options
	 * @private
	 */
	function updateFormatSelect(list) {
		var l;
		$(".validation-format-select").parent().find(".gb-validation-select-selected").empty();
		$(".validation-format-select").parent().find(".gb-validation-select-items").empty();
		$(".validation-format-select").empty();
		$(".validation-format-select").append($("<option>").text("Select File Format:"));
		$(".validation-format-select").parent().find(".gb-validation-select-selected").html("Select File Format:");
		for (l = 0; l < list.length; l++) {
			$(".validation-format-select").append($("<option>").val(list[l]).text(list[l]));
			$(".validation-format-select").parent().find(".gb-validation-select-items").append($("<div>").html(list[l]).on("click", function(e) {
				var y, i, k, s, h;
				s = this.parentNode.parentNode.getElementsByTagName("select")[0];
				h = this.parentNode.previousSibling;
				for (i = 0; i < s.length; i++) {
					if (s.options[i].innerHTML == this.innerHTML) {
						s.selectedIndex = i;
						h.innerHTML = this.innerHTML;
						y = this.parentNode.getElementsByClassName("same-as-selected");
						for (k = 0; k < y.length; k++) {
							y[k].removeAttribute("class");
						}
						this.setAttribute("class", "same-as-selected");
						break;
					}
				}
				h.click();
			}));
		}
	}

	/**
	 * Select Tag를 닫는 함수
	 * @function closeAllSelect
	 * @param {HTMLElement} elmnt - 선택된 Select Tag
	 * @private
	 */
	function closeAllSelect(elmnt) {
		// a function that will close all select boxes in the document, except
		// the current select box:
		var x, y, i, arrNo = [];
		x = document.getElementsByClassName("gb-validation-select-items");
		y = document.getElementsByClassName("gb-validation-select-selected");
		for (i = 0; i < y.length; i++) {
			if (elmnt == y[i]) {
				arrNo.push(i)
			} else {
				y[i].classList.remove("select-arrow-active");
			}
		}
		for (i = 0; i < x.length; i++) {
			if (arrNo.indexOf(i)) {
				x[i].classList.add("gb-validation-select-hide");
			}
		}
	}
}(jQuery));

/**
 * 노드를 마지막 자식 노드까지 로드한다.
 * @method gb.validation.Validation#openNodeRecursive
 * @param {Number}
 *            idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {Object}
 *            node - 열려는 노드
 * @param {Object}
 *            topNode - 레이어 목록에서 선택한 노드
 * @param {Function}
 *            afterOpen - 로드후 실행할 콜백함수
 * @param {Boolean}
 *            each - 각 노드를 불러왔을 때마다 콜백 함수를 실행할지 지정
 */
gb.validation.Validation.prototype.openNodeRecursive = function(idx, node, topNode, afterOpen, each) {
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
				var child = that.geoserverTree.get_node(childrenNodes[i]);
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
	if (!that.geoserverTree.is_open(node)) {
		that.geoserverTree.open_node(node, callback);
	} else {
		var already = node;
		callback(node, node.children.length > 0);
	}
};

/**
 * loadingNumber 객체를 반환한다.
 * @method gb.validation.Validation#getLoadingNumber
 * @return {Object} 로딩할 노드목록을 가진 객체
 */
gb.validation.Validation.prototype.getLoadingNumber = function() {
	return this.loadingNumber;
};

/**
 * loadingNumber 객체를 설정한다.
 * @method gb.validation.Validation#setLoadingNumber
 * @param {number} idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {number} num - 설정할 값
 */
gb.validation.Validation.prototype.setLoadingNumber = function(idx, num) {
	this.loadingNumber[idx] = num;
};

/**
 * loadingNumber 객체를 초기화한다.
 * @method gb.validation.Validation#initLoadingNumber
 */
gb.validation.Validation.prototype.initLoadingNumber = function() {
	this.loadingNumber = [];
};

/**
 * loadingList 객체를 반환한다.
 * @method gb.validation.Validation#getLoadingList
 * @return {Object} 로딩할 노드목록을 가진 객체
 */
gb.validation.Validation.prototype.getLoadingList = function() {
	return this.loadingList;
};

/**
 * loadingList 객체를 설정한다.
 * @method gb.validation.Validation#setLoadingList
 * @param {Array.<Object.<string, boolean>>} list - 로딩중인 Geoserver 레이어 노드 리스트
 */
gb.validation.Validation.prototype.setLoadingList = function(list) {
	this.loadingList = list;
};

/**
 * loadingList 목록에 추가한다.
 * @param {Number} idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {string} nodeId - JSTree 노드 아이디
 * @method gb.validation.Validation#addNodeToLoadingList
 */
gb.validation.Validation.prototype.addNodeToLoadingList = function(idx, nodeId) {
	var list = this.getLoadingList();
	if (Array.isArray(list)) {
		if (list[idx] === undefined) {
			list[idx] = {};
			this.setLoadingNumber(idx, 1);
		}
		list[idx][nodeId] = false;
	} else {
		console.error("gb.validation.Validation: The loadingList object is not an array.");
	}
};

/**
 * loadingList 객체를 초기화한다.
 * @method gb.validation.Validation#initLoadingList
 */
gb.validation.Validation.prototype.initLoadingList = function() {
	this.loadingList = [];
};

/**
 * loadingList 객체에 노드를 추가한다.
 * @param {Number} idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {string} nodeId - JSTree 노드 아이디
 * @param {boolean} flag
 * @method gb.validation.Validation#changeNodeOnLoadingList
 */
gb.validation.Validation.prototype.changeNodeOnLoadingList = function(idx, nodeId, flag) {
	var that = this;
	var list = this.getLoadingList();
	if (list[idx].hasOwnProperty(nodeId)) {
		list[idx][nodeId] = flag;
		// if (that.getLoadingNumber()[idx] === -1) {
		// that.setLoadingNumber(idx, 0);
		// }
		if (flag) {
			if (that.getLoadingNumber()[idx] > 0) {
				that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] - 1));
			}
		} else {
			that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] + 1));
		}
	} else {
		console.error("gb.validation.Validation: there is no node id:", nodeId);
		return;
	}
};