/**
 * ### geogigfunction plugin
 */

/**
 * 
 * @name $.jstree.defaults.geogigfunction
 * @plugin geogigfunction
 * @comment 적용중인 기능 표시
 * @author 소이준
 */
$.jstree.defaults.geogigfunction = {
	"repository" : undefined,
	"status" : {
		"checkout" : "fas fa-check",
		"unstaged" : "gb-geogig-unstaged",
		"staged" : "gb-geogig-staged",
		"unmerged" : "gb-geogig-unmerged",
		"merged" : "gb-geogig-merged",
		"connected" : "fas fa-link",
		"disconnected" : "fas fa-unlink"
	}
};

$.jstree.plugins.geogigfunction = function(options, parent) {
	this.init = function(el, options) {
		this._data.geogigfunction = {
			"repository" : options.geogigfunction.repository,
			"status" : options.geogigfunction.status,
			"transactionId" : {},
			"fetchRemote" : {}
		};
		// var optKeys = Object.keys(options.geogigfunction.status);
		// for (var i = 0; i < optKeys.length; i++) {
		// this._data.geogigfunction.status[optKeys[i]] = {
		// "list" : [],
		// "css" : options.geogigfunction[optKeys[i]]
		// };
		// }
		// console.log(this._data.geogigfunction);
		parent.init.call(this, el, options);
	};
	this.refresh = function(skip_loading, forget_state) {
		parent.refresh.call(this, skip_loading, forget_state);
	};
	this.bind = function() {
		this.element.on('ready.jstree', $.proxy(function(e, data) {
			console.log("ready");
			// var optKeys = Object.keys(this._data.geogigfunction), node =
			// data.node;
		}, this)).on('model.jstree', $.proxy(function(e, data) {
			var m = this._model.data, dpc = data.nodes, i, j, c = 'default', k;
			// optKeys = Object.keys(this._data.geogigfunction);
			for (i = 0, j = dpc.length; i < j; i++) {
				// for (var k = 0; k < optKeys.length; k++) {
				// var list = this._data.geogigfunction.status[optKeys[k]].list;
				if (m[dpc[i]].original.hasOwnProperty("type")) {
					if (m[dpc[i]].original.type === "geoserver") {

					} else if (m[dpc[i]].original.type === "repository") {

					} else if (m[dpc[i]].original.type === "branch") {
						if (m[dpc[i]].original.hasOwnProperty("status")) {
							if (m[dpc[i]].original.status !== null && m[dpc[i]].original.status !== undefined) {
								if (m[dpc[i]].original.status.toLowerCase() === "merged") {
									m[dpc[i]].state["merged"] = true;
								} else {
									m[dpc[i]].state["merged"] = false;
								}
								if (m[dpc[i]].original.status.toLowerCase() === "unmerged") {
									m[dpc[i]].state["unmerged"] = true;
								} else {
									m[dpc[i]].state["unmerged"] = false;
								}
								if (m[dpc[i]].original.status.toLowerCase() === "unstaged") {
									m[dpc[i]].state["unstaged"] = true;
								} else {
									m[dpc[i]].state["unstaged"] = false;
								}
								if (m[dpc[i]].original.status.toLowerCase() === "staged") {
									m[dpc[i]].state["staged"] = true;
								} else {
									m[dpc[i]].state["staged"] = false;
								}
							}
						}
					} else if (m[dpc[i]].original.type === "layer") {

					} else if (m[dpc[i]].original.type === "remoteRepository") {
						if (m[dpc[i]].original.hasOwnProperty("ping")) {
							if (m[dpc[i]].original.ping !== null && m[dpc[i]].original.ping !== undefined) {
								if (m[dpc[i]].original.ping === true) {
									m[dpc[i]].state["connected"] = true;
									m[dpc[i]].state["disconnected"] = false;
								} else {
									m[dpc[i]].state["connected"] = false;
									m[dpc[i]].state["disconnected"] = true;
								}
							}
						}
					} else if (m[dpc[i]].original.type === "remoteBranch") {
						if (m[dpc[i]].original.hasOwnProperty("fetchSize")) {
							var fcount = m[dpc[i]].original["fetchSize"];
							if (fcount > 0) {
								this._data.geogigfunction.fetchRemote[m[dpc[i]].id] = fcount;
							}
							console.log(this._data.geogigfunction.fetchRemote);
						}
					}

				}
				/*
				 * if (list.indexOf(m[dpc[i]].id) !== -1) {
				 * m[dpc[i]].state[optKeys[k]] = true; } else {
				 * m[dpc[i]].state[optKeys[k]] = false; }
				 */
				// }
			}
		}, this)).on('delete_node.jstree', $.proxy(function(e, data) {
			console.log("delete layer");
			var optKeys = Object.keys(this._data.geogigfunction), node = data.node;
			for (var k = 0; k < optKeys.length; k++) {
				var list = this._data.geogigfunction.status[optKeys[k]].list;
				for (var l = 0; l < list.length; l++) {
					if (list.indexOf(node.id) !== -1) {
						list.splice(list.indexOf(node.id), 1);
					}
				}
			}
		}, this)).on(
				'select_node.jstree',
				$.proxy(function(e, data) {
					var geogig = this._data.geogigfunction.repository, node = data.node;
					var that = this;
					console.log(node);
					var type = this.get_type(node);
					console.log(type);
					var root = this.get_node("#", true);
					$(root).find(".gb-versioning-repository-btnarea").remove();
					if (type === "geoserver") {
						if (!!node.children) {
							var repoBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
									that._data.geogigfunction.repository.translation.newrepo[that._data.geogigfunction.repository.locale])
									.addClass("gb-repository-tree-btn-inline").click(function() {
										console.log("new repo");
										console.log(node);
										var server = node;
										that._data.geogigfunction.repository.setNowServer(server);
										that._data.geogigfunction.repository.initRepositoryModal();
									});
							var btnArea = $("<span>").addClass("gb-versioning-repository-btnarea").append(repoBtn);
							var obj = this.get_node(node, true);
							$(obj[0].childNodes[1]).after(btnArea);
						}
					} else if (type === "repository") {
						var branchBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.newbranch[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[0]);
									var repo = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.newBranchModal(server.text, repo.text);
								});
						var remoteBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.remoterepo[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									console.log("checkout");
									console.log(node);
									var server = that.get_node(node.parents[0]);
									var repo = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.manageRemoteRepository(server.text, repo.text);
								});
						var infoBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.info[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[0]);
									var repo = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.infoRepoModal(server.text, repo.text);
								});
						var removeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.remove[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[0]);
									var repo = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.removeRepositoryModal(repo.text);
								});
						var btnArea = $("<span>").addClass("gb-versioning-repository-btnarea").append(branchBtn).append(remoteBtn).append(
								infoBtn).append(removeBtn);
						var obj = this.get_node(node, true);
						$(obj[0].childNodes[1]).after(btnArea);
					} else if (type === "remoteRepository") {
						that._data.geogigfunction.repository.setNowRemoteRepository(node);
						var fetchBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.fetch[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that._data.geogigfunction.repository.getNowServer();
									console.log(server);
									var repo = that._data.geogigfunction.repository.getNowRepository();
									console.log(repo);
									var remote = that._data.geogigfunction.repository.getNowRemoteRepository();
									console.log(remote);
									that._data.geogigfunction.repository.setFetchRepository(remote.text);
									that.refresh();
								});
						var removeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.remove[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that._data.geogigfunction.repository.getNowServer();
									console.log(server);
									var repo = that._data.geogigfunction.repository.getNowRepository();
									console.log(repo);
									var remote = that._data.geogigfunction.repository.getNowRemoteRepository();
									console.log(remote);
									that._data.geogigfunction.repository.removeRemoteRepository(server.text, repo.text, remote.text);
								});
						var btnArea = $("<span>").addClass("gb-versioning-repository-btnarea").append(fetchBtn).append(removeBtn);
						var obj = this.get_node(node, true);
						$(obj[0].childNodes[1]).after(btnArea);
					} else if (type === "branch") {
						var states = Object.keys(node.state);

						var quitBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.end[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									console.log("quit");
									console.log(node);
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									var branch = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									var tid = that.getTransactionId(repo.id);
									that._data.geogigfunction.repository.quitModal(server, repo, branch, tid);
								});

						var checkoutBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.checkout[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									console.log("checkout");
									console.log(node);
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									var branch = node;
									that._data.geogigfunction.repository.checkoutBranch(server, repo, branch);
								});

						var addBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.add[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline");
						var commitBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.commit[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline");
						var pullBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.pull[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									var branch = node;
									var tid = that.getTransactionId(repo.id);
									if (typeof tid === "string") {
										that._data.geogigfunction.repository.setNowServer(server);
										that._data.geogigfunction.repository.setNowRepository(repo);
										that._data.geogigfunction.repository.setNowBranch(branch);
										that._data.geogigfunction.repository.pullRepositoryModal(server.text, repo.text, tid);
									}
								});
						var pushBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.push[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									var branch = node;
									var tid = that.getTransactionId(repo.id);
									if (typeof tid === "string") {
										that._data.geogigfunction.repository.setNowServer(server);
										that._data.geogigfunction.repository.setNowRepository(repo);
										that._data.geogigfunction.repository.setNowBranch(branch);
										that._data.geogigfunction.repository.pushRepositoryModal(server.text, repo.text);
									}
								});
						var mergeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.merge[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									var branch = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.setNowBranch(branch);
									that._data.geogigfunction.repository.mergeModal(server.text, repo.text, branch.text);
								});

						var publishBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.publish[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									var server = that.get_node(node.parents[1]);
									var repo = that.get_node(node.parents[0]);
									var branch = node;
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.setNowBranch(branch);
									that._data.geogigfunction.repository.publishModal(server.text, repo.text, branch.text);
								});

						if (states.indexOf("merged") !== -1 || states.indexOf("staged") !== -1 || states.indexOf("unmerged") !== -1
								|| states.indexOf("unstaged") !== -1) {
							$(quitBtn).css("display", "inline-block");
							$(quitBtn).prop("disabled", false);
							$(checkoutBtn).css("display", "none");
							$(checkoutBtn).prop("disabled", true);
							$(pullBtn).prop("disabled", false);
							$(pushBtn).prop("disabled", false);
							$(mergeBtn).prop("disabled", false);
						} else {
							$(quitBtn).css("display", "none");
							$(quitBtn).prop("disabled", true);
							$(checkoutBtn).css("display", "inline-block");
							$(checkoutBtn).prop("disabled", false);
							$(pullBtn).prop("disabled", true);
							$(pushBtn).prop("disabled", true);
							$(mergeBtn).prop("disabled", true);
						}

						var parent = that.get_node(node.parent);
						if (parent.children.length === 1 && parent.children[0] === node.id) {
							$(mergeBtn).prop("disabled", true);
						} else if (parent.children.length > 1) {
							if (states.indexOf("merged") !== -1 || states.indexOf("staged") !== -1 || states.indexOf("unmerged") !== -1
									|| states.indexOf("unstaged") !== -1) {
								$(mergeBtn).prop("disabled", false);
							} else {
								$(mergeBtn).prop("disabled", true);
							}
						}

						var btnArea = $("<span>").addClass("gb-versioning-repository-btnarea").append(quitBtn).append(checkoutBtn).append(
								pullBtn).append(pushBtn).append(mergeBtn).append(publishBtn);
						var obj = this.get_node(node, true);
						$(obj[0].childNodes[1]).after(btnArea);
					} else if (type === "layer") {
						var pnode = this.get_node(node.parent);
						var states = Object.keys(pnode.state);
						var server = that.get_node(node.parents[2]);
						var repo = that.get_node(node.parents[1]);
						var branch = that.get_node(node.parents[0]);
						var layer = node;

						var historyBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.history[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.setNowBranch(branch);
									that._data.geogigfunction.repository.layerHistoryModal(server, repo, layer);
								});
						var removeBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
								that._data.geogigfunction.repository.translation.remove[that._data.geogigfunction.repository.locale])
								.addClass("gb-repository-tree-btn-inline").click(function() {
									that._data.geogigfunction.repository.setNowServer(server);
									that._data.geogigfunction.repository.setNowRepository(repo);
									that._data.geogigfunction.repository.setNowBranch(branch);
									that._data.geogigfunction.repository.removeLayerModal(layer.text);
								});
						var btnArea = $("<span>").addClass("gb-versioning-repository-btnarea").append(removeBtn);
						if (branch !== undefined && branch.text === "master") {
							$(btnArea).append(historyBtn);
						}
						if (states.indexOf("merged") !== -1 || states.indexOf("staged") !== -1 || states.indexOf("unmerged") !== -1
								|| states.indexOf("unstaged") !== -1) {
							// $(removeBtn).css("display", "inline-block");
							$(removeBtn).prop("disabled", false);

						} else {
							// $(removeBtn).css("display", "none");
							$(removeBtn).prop("disabled", true);
						}

						var obj = this.get_node(node, true);
						$(obj[0].childNodes[1]).after(btnArea);
					}
				}, this)).on('load_node.jstree', $.proxy(function(e, data) {
			console.log("delete layer");
			var optKeys = Object.keys(this._data.geogigfunction), node = data.node;
			console.log(data);
		}, this));

		parent.bind.call(this);
	};
	this.redraw_node = function(obj, deep, is_callback, force_render) {
		var that = this;
		obj = parent.redraw_node.apply(this, arguments);
		console.log(this.get_node(obj.id));
		if (obj) {
			var nobj = this.get_node(obj.id);
			if (nobj.type === "remoteBranch") {
				if (this._data.geogigfunction.fetchRemote.hasOwnProperty(nobj.id)) {
					var num = this._data.geogigfunction.fetchRemote[nobj.id];
					var fetchNum = $("<div>").addClass("gb-repository-tree-fetch-number").text(num);
					var fetchCircle = $("<div>").addClass("gb-repository-tree-fetch-circle").append(fetchNum);
					$(obj.childNodes[1]).append(fetchCircle);
				}
			} else if (nobj.type === "default") {
				console.log(nobj);
				var ntxt = this._data.geogigfunction.repository.translation[nobj.text][this._data.geogigfunction.repository.locale];
				var o = nobj["original"];
				if (o.text !== undefined) {
					o.text = ntxt;
				}
				this.rename_node(nobj, ntxt);
				var icon = $(obj).find("a").find("i");
				$(obj).find("a").empty();
				$(obj).find("a").append(icon).append(ntxt);

				console.log(nobj);
			}
			var fnmks = Object.keys(this._data.geogigfunction.status);
			for (var i = 0; i < fnmks.length; i++) {
				if (nobj.state[fnmks[i]]) {
					if (fnmks[i] === "checkout") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(this._data.geogigfunction.status[fnmks[i]]);
						$(obj.childNodes[1]).append(ic);
					} else if (fnmks[i] === "staged") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["checkout"]);
						$(obj.childNodes[1]).append(ic);
						var lb = $("<span>").text(
								" [" + that._data.geogigfunction.repository.translation.staged[that._data.geogigfunction.repository.locale]
										+ "]").attr({
							"role" : "presentation"
						}).addClass(this._data.geogigfunction.status[fnmks[i]]);
						$(obj.childNodes[1]).append(lb);
					} else if (fnmks[i] === "unstaged") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["checkout"]);
						$(obj.childNodes[1]).append(ic);
						var lb = $("<span>")
								.text(
										" ["
												+ that._data.geogigfunction.repository.translation.unstaged[that._data.geogigfunction.repository.locale]
												+ "]").attr({
									"role" : "presentation"
								}).addClass(this._data.geogigfunction.status[fnmks[i]]);
						$(obj.childNodes[1]).append(lb);
					} else if (fnmks[i] === "merged") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["checkout"]);
						$(obj.childNodes[1]).append(ic);
						var lb = $("<span>").text(
								" [" + that._data.geogigfunction.repository.translation.merged[that._data.geogigfunction.repository.locale]
										+ "]").attr({
							"role" : "presentation"
						}).addClass(this._data.geogigfunction.status[fnmks[i]]);
						$(obj.childNodes[1]).append(lb);
					} else if (fnmks[i] === "unmerged") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["checkout"]);
						$(obj.childNodes[1]).append(ic);
						var lb = $("<span>")
								.text(
										" ["
												+ that._data.geogigfunction.repository.translation.unmerged[that._data.geogigfunction.repository.locale]
												+ "]").attr({
									"role" : "presentation"
								}).addClass(this._data.geogigfunction.status[fnmks[i]]);
						$(obj.childNodes[1]).append(lb);
					} else if (fnmks[i] === "connected") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["connected"]);
						$(obj.childNodes[1]).append(ic);
					} else if (fnmks[i] === "disconnected") {
						var ic = $("<i>").attr({
							"role" : "presentation"
						}).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(
								this._data.geogigfunction.status["disconnected"]);
						$(obj.childNodes[1]).append(ic);
					}
					/*
					 * var ic = $("<i>").attr({ "role" : "presentation"
					 * }).addClass("jstree-icon").addClass("jstree-themeicon-custom").addClass(this._data.geogigfunction.status[fnmks[i]].icon);
					 * $(obj.childNodes[1]).append(ic);
					 */
				}
			}
		}
		return obj;
	};
	/**
	 * set flag
	 * 
	 * @method set_flag
	 * @plugin geogigfunction
	 */
	this.set_flag = function(obj, funcname, flag) {
		obj.state[funcname] = flag;
		if (flag) {
			var list = this._data.geogigfunction.status[funcname].list;
			if (list.indexOf(obj.id) === -1) {
				list.push(obj.id);
				this.redraw_node(obj.id);
			}
		} else {
			var list = this._data.geogigfunction.status[funcname].list;
			if (list.indexOf(obj.id) !== -1) {
				list.splice(list.indexOf(obj.id), 1);
				this.redraw_node(obj.id);
			}
		}
	};
	/**
	 * 노드에 맞는 트랜잭션 아이디를 반환한다.
	 * 
	 * @method getTransactionId
	 * @plugin geogigfunction
	 * @param {String}
	 *            nid - 노드 아이디
	 */
	this.getTransactionId = function(nid) {
		var list = this._data.geogigfunction.transactionId;
		var id = list[nid];
		return id;
	};
	/**
	 * 노드에 맞는 트랜잭션 아이디를 삭제한다.
	 * 
	 * @method removeTransactionId
	 * @plugin geogigfunction
	 * @param {String}
	 *            nid - 노드 아이디
	 * @return {Boolean}
	 */
	this.removeTransactionId = function(nid) {
		var list = this._data.geogigfunction.transactionId;
		return delete list[nid];
	};

	/**
	 * 노드에 맞는 fetch 숫자를 삭제한다.
	 * 
	 * @method removeFetchCount
	 * @plugin geogigfunction
	 * @param {String}
	 *            nid - 노드 아이디
	 * @return {Boolean}
	 */
	this.removeFetchCount = function(nid) {
		var list = this._data.geogigfunction.fetchRemote;
		return delete list[nid];
	};
	/**
	 * 체크아웃을 요청한다.
	 * 
	 * @method set_flag
	 * @plugin geogigfunction
	 */
	this.set_flag = function(obj, funcname, flag) {
		obj.state[funcname] = flag;
		if (flag) {
			var list = this._data.geogigfunction.status[funcname].list;
			if (list.indexOf(obj.id) === -1) {
				list.push(obj.id);
				this.redraw_node(obj.id);
			}
		} else {
			var list = this._data.geogigfunction.status[funcname].list;
			if (list.indexOf(obj.id) !== -1) {
				list.splice(list.indexOf(obj.id), 1);
				this.redraw_node(obj.id);
			}
		}
	};
};
// include the geogigfunction plugin by default
// $.jstree.defaults.plugins.push("geogigfunction");
