/**
 * stores all defaults for the geoserver plugin
 * 
 * @name $.jstree.defaults.geoserver
 * @plugin geoserver
 */
$.jstree.defaults.geoserver = {
	/**
	 * 레이어가 편입될 ol.Map객체
	 */
	map : undefined,
};

$.jstree.plugins.geoserver = function(options, parent) {
	var that = this;

	this.init = function(el, options) {
		this._data.geoserver = {};
		parent.init.call(this, el, options);
	};
	this.bind = function() {
		parent.bind.call(this);
		this._data.geoserver.map = this.settings.geoserver.map;
		/*
		 * this._data.geoserver.user = this.settings.geoserver.user;
		 * this._data.geoserver.layerInfo = this.settings.geoserver.layerInfo;
		 * this._data.geoserver.layerInfoURL =
		 * this.settings.geoserver.layerInfoURL;
		 * this._data.geoserver.groupLayerInfoURL =
		 * this.settings.geoserver.groupLayerInfoURL;
		 * this._data.geoserver.createLayer =
		 * this.settings.geoserver.createLayer; this._data.geoserver.deleteLayer =
		 * this.settings.geoserver.deleteLayer;
		 * this._data.geoserver.downloadNGIDXF =
		 * this.settings.geoserver.downloadNGIDXF;
		 * this._data.geoserver.downloadGeoserver =
		 * this.settings.geoserver.downloadGeoserver;
		 * this._data.geoserver.clientRefer =
		 * this.settings.geoserver.clientRefer;
		 */
		this._data.geoserver.getMapWMS = this.settings.geoserver.getMapWMS;
		this._data.geoserver.getLayerInfo = this.settings.geoserver.getLayerInfo;
		this._data.geoserver.clientTree = this.settings.geoserver.clientTree;
		this._data.geoserver.serverTree = this.settings.geoserver.serverTree;
		this._data.geoserver.getWFSFeature = this.settings.geoserver.getWFSFeature;
	};

	/**
	 * Geoserver WFS Layer 파일 다운로드를 요청한다
	 * 
	 * @method download_wfs_layer
	 * @param {Object}
	 *            layer - 트리에서 선택한 레이어 노드 객체
	 * @param {String}
	 *            outputformat - output 포맷 형식
	 */
	this.download_wfs_layer = function(layer, outputformat) {
		var out = outputformat;
		var params = {
			"serverName" : layer.id.split(":")[0],
			"workspace" : layer.id.split(":")[1],
			"version" : gb.module.serviceVersion.WFS,
			"outputformat" : out,
			"typeName" : layer.id.split(":")[3]
		}

		downloadWithCRS(this._data.geoserver.getWFSFeature, params);
	}

	var downloadWithCRS = function(url, params) {
		var a = url, b = params;

		var modal = new gb.modal.ModalBase({
			width : 435,
			height : 180
		});

		var label = $("<span>").text("EPSG: ");
		var searchBar = $("<input>").attr({
			"type" : "number"
		}).addClass("gb-form").css({
			"width" : "346px",
			"display" : "inline-block"
		});

		var area = $("<div>").append(label).append(searchBar).css({
			"margin" : "10px 10px"
		});
		modal.setModalBody(area);

		var closeBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-default").text("Close").click(function() {
			modal.close();
		});
		var downBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-primary").text("Download").click(function() {
			var val = $(searchBar).val().replace(/(\s*)/g, '') || "4326";
			b.srsname = "EPSG:" + val;
			var form = document.createElement("form");
			form.setAttribute("method", "get");
			form.setAttribute("action", a);
			var keys = Object.keys(b);
			for (var j = 0; j < keys.length; j++) {
				var hiddenField = document.createElement("input");
				hiddenField.setAttribute("type", "hidden");
				hiddenField.setAttribute("name", keys[j]);
				hiddenField.setAttribute("value", params[keys[j]]);
				form.appendChild(hiddenField);
			}
			form.target = "_blank";
			document.body.appendChild(form);
			form.submit();
			modal.close();
		});

		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(downBtn).append(closeBtn);

		modal.setModalFooter(buttonArea);

		modal.open();
	}

	/**
	 * Geoserver WMS Layer 파일 다운로드를 요청한다
	 * 
	 * @method download_wms_layer
	 * @param {Object}
	 *            layer - 트리에서 선택한 레이어 노드 객체
	 * @param {String}
	 *            outputformat - output 포맷 형식
	 */
	this.download_wms_layer = function(layer, outputformat) {
		var that = this;
		var a = layer;
		var format = outputformat;

		$.ajax({
			url : that._data.geoserver.getLayerInfo,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(a),
			beforeSend : function() { // 호출전실행
				// loadImageShow();
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				var params, form, keys;

				for (var i = 0; i < data.length; i++) {
					params = {
						"serverName" : a.serverName,
						"workspace" : a.workspace,
						"version" : gb.module.serviceVersion.WMS,
						"format" : format,
						"bbox" : [ data[i].nbBox.minx, data[i].nbBox.miny, data[i].nbBox.maxx, data[i].nbBox.maxy ],
						"layers" : data[i].lName,
						"width" : 1024,
						"height" : 768
					};
					params[gb.module.serviceVersion.getWMSCrs()] = data[i].srs;

					form = document.createElement("form");
					form.setAttribute("method", "get");
					form.setAttribute("action", that._data.geoserver.getMapWMS);
					keys = Object.keys(params);
					for (var j = 0; j < keys.length; j++) {
						var hiddenField = document.createElement("input");
						hiddenField.setAttribute("type", "hidden");
						hiddenField.setAttribute("name", keys[j]);
						hiddenField.setAttribute("value", params[keys[j]]);
						form.appendChild(hiddenField);
					}
					form.target = "_blank";
					document.body.appendChild(form);
					form.submit();
				}
			}
		}).fail(function(xhr, status, errorThrown) {
			that.errorModal(xhr.responseJSON.status);
		});
	}

	/**
	 * 레이어 정보를 조회 및 입력한다.
	 * 
	 * @method load_each_wms_layer
	 * @param {Object}
	 *            node - 트리에서 조회한 레이어 노드 객체
	 * @param {ol.Collection}
	 *            collection - 레이어를 주입할 콜렉션
	 */
	this.load_each_wms_layer = function(node, collection) {
		var that = this;
		if (Array.isArray(node)) {
			var workArr = [];
			var storeArr = [];
			var layerArr = [];
			var params = {
				"serverName" : undefined,
				"workspace" : undefined,
				"geoLayerList" : []
			};
			var geogig = {};
			for (var a = 0; a < node.length; a++) {
				if (node[a].type === "workspace") {
					console.log("workspace array");
				} else if (node[a].type === "datastore") {
					console.log("datastore array");

				} else if (node[a].type === "point" || node[a].type === "multipoint" || node[a].type === "linestring"
						|| node[a].type === "multilinestring" || node[a].type === "polygon" || node[a].type === "multipolygon") {
					var server = this.get_node(node[a].parents[2]);
					var workspace = this.get_node(node[a].parents[1]);
					var datastore = this.get_node(node[a].parents[0]);
					if (datastore.original.hasOwnProperty("storeType")) {
						if (datastore.original.storeType === "GeoGIG") {
							geogig["repo"] = datastore.original.geogigRepos;
							geogig["branch"] = datastore.original.geogigBranch;
						}
					}
					layerArr.push(node[a]);
					params["serverName"] = server.text;
					params["workspace"] = workspace.text;
					params["geoLayerList"].push(node[a].text);
					console.log(params);

				}
			}
			// 배열 길이에 따라 처리
			if (layerArr.length > 0) {
				$.ajax({
					url : that._data.geoserver.getLayerInfo,
					method : "POST",
					contentType : "application/json; charset=UTF-8",
					data : JSON.stringify(params),
					beforeSend : function() {
						// $("body").css("cursor", "wait");
					},
					complete : function() {
						// $("body").css("cursor", "default");
					},
					success : function(data, textStatus, jqXHR) {
						console.log(data);
						if (Array.isArray(data)) {
							for (var i = 0; i < data.length; i++) {
								var obj = {
									"serverName" : params["serverName"],
									"workspace" : params["workspace"],
									"LAYERS" : params["workspace"] + ":" + data[i].lName,
									// "STYLES" : undefined,
									"VERSION" : gb.module.serviceVersion.WMS,
									"BBOX" : data[i].nbBox.minx.toString() + "," + data[i].nbBox.miny.toString() + ","
											+ data[i].nbBox.maxx.toString() + "," + data[i].nbBox.maxy.toString(),
									"TILED" : true,
									"FORMAT" : 'image/png8',
									"SLD_BODY" : data[i].sld
//									"salt" : Math.random()
								};
								obj[gb.module.serviceVersion.getWMSCrs()] = data[i].srs;

								var wms = new ol.layer.Tile({
									extent : [ data[i].nbBox.minx.toString(), data[i].nbBox.miny.toString(), data[i].nbBox.maxx.toString(),
											data[i].nbBox.maxy.toString() ],
									source : new ol.source.TileWMS({
										url : that._data.geoserver.getMapWMS,
										params : obj,
										serverType : "geoserver"
									})
								});

								var attributes = [];
								if (data[i].attInfo instanceof Object) {
									var attribute
									for ( var j in data[i].attInfo) {
										attribute = new gb.layer.Attribute({
											originFieldName : j.replace(/(\s*)/g, ''),
											fieldName : j.replace(/(\s*)/g, ''),
											type : data[i].attInfo[j].type,
											decimal : data[i].attInfo[j].type === "Double" ? 30 : null,
											size : 256,
											isUnique : false,
											nullable : data[i].attInfo[j].nillable === "true" ? true : false,
											isNew : true
										});

										attributes.push(attribute);
									}
								}

								var git = {
									"geoserver" : params["serverName"],
									"workspace" : params["workspace"],
									"layers" : data[i].lName,
									"geometry" : data[i].geomType,
									"editable" : true,
									"sld" : data[i].sld,
									"native" : data[i].nativeName,
									"attribute" : attributes
								};
								if (geogig["repo"] !== undefined && geogig["branch"] !== undefined) {
									git["geogigRepo"] = geogig["repo"];
									git["geogigBranch"] = geogig["branch"];
								}
								wms.set("git", git);
								wms.set("id", layerArr[i].id);
								wms.set("name", layerArr[i].text);
								if (collection instanceof ol.Collection) {
									collection.push(wms);
									that._data.geoserver.clientTree.initTreeId();
								} else {
									console.error("no collection to push");
								}

								if (i === (data.length - 1)) {
									that._data.geoserver.clientTree.refresh();
								}
							}
						}
					}
				});
			}

		} else if (node.type === "workspace") {

			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				var serverTree = that._data.geoserver.serverTree;
				that.messageModal(serverTree.translation.err[serverTree.locale], serverTree.translation.noimpsamestore[serverTree.locale]);
				console.error("layer duplicated");
				return;
			}

			var childrenLength = node.children.length;
			console.log("자식노드: " + childrenLength);
			var git = {
				"allChildren" : childrenLength,
				"loadedChildren" : 0,
				"failedChildren" : 0
			};

			var workspace = new ol.layer.Group({});
			workspace.set("id", node.id);
			workspace.set("name", node.text);
			workspace.set("git", git);

			if (collection instanceof ol.Collection) {
				collection.push(workspace);
				var domnode = that._data.geoserver.clientTree.get_node(workspace.get("treeid"), true);
				$(domnode).addClass("jstreeol3-loading");
				console.log(domnode);
			} else {
				console.error("no collection to push");
			}

			var children = node.children;
			if (children.length === 0) {
				that._data.geoserver.clientTree.refresh();
			}
			for (var i = 0; i < children.length; i++) {
				var store = this.get_node(children[i]);
				this.load_each_wms_layer(store, workspace.getLayers());
			}

		} else if (node.type === "datastore") {
			var workspaceNode = this.get_node(node.parents[0]);
			var datastoreNode = node;

			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				var serverTree = that._data.geoserver.serverTree;
				that.messageModal(serverTree.translation.err[serverTree.locale], serverTree.translation.noimpsamestore[serverTree.locale]);
				console.error("layer duplicated");

				var parent = that._data.geoserver.clientTree.get_LayerByOLId(workspaceNode.id);
				console.log(parent);
				if (parent instanceof ol.layer.Group) {
					var git = parent.get("git");
					if (git !== undefined) {
						var all = git["allChildren"];
						var allInt = parseInt(all);
						var fail = git["failedChildren"];
						var failInt = parseInt(fail);
						if (!isNaN(failInt)) {
							git["failedChildren"] = failInt + 1;
						}
						if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
							that._data.geoserver.clientTree.refresh();
						}
					}
				}
				return;
			}

			var childrenLength = node.children.length;
			console.log("자식노드: " + childrenLength);
			var git = {
				"allChildren" : childrenLength,
				"loadedChildren" : 0,
				"failedChildren" : 0
			};

			var datastore = new ol.layer.Group({});
			datastore.set("id", node.id);
			datastore.set("name", node.text);
			datastore.set("git", git);

			if (collection instanceof ol.Collection) {
				collection.push(datastore);
				var domnode = that._data.geoserver.clientTree.get_node(datastore.get("treeid"), true);
				$(domnode).addClass("jstreeol3-loading");
				console.log(domnode);

			} else {
				console.error("no collection to push");
			}

			var children = node.children;
			var objNodes = [];
			if (children.length === 0) {
				that._data.geoserver.clientTree.refresh();
			}
			for (var i = 0; i < children.length; i++) {
				var layer = this.get_node(children[i]);
				this.load_each_wms_layer(layer, datastore.getLayers());
				// objNodes.push(layer);
			}

			/*
			 * if (collection instanceof ol.Collection) {
			 * collection.push(datastore); this.load_each_wms_layer(objNodes,
			 * datastore.getLayers()); } else { console.error("no collection to
			 * push"); }
			 */
		} else if (node.type === "point" || node.type === "multipoint" || node.type === "linestring" || node.type === "multilinestring"
				|| node.type === "polygon" || node.type === "multipolygon") {

			var server = this.get_node(node.parents[2]);
			var workspace = this.get_node(node.parents[1]);
			var datastore = this.get_node(node.parents[0]);

			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				console.error("layer duplicated");
				var grandParent = that._data.geoserver.clientTree.get_LayerByOLId(workspace.id);
				var parent = that._data.geoserver.clientTree.get_LayerByOLId(datastore.id);
				console.log(parent);
				if (parent instanceof ol.layer.Group) {
					var git = parent.get("git");
					if (git !== undefined) {
						var all = git["allChildren"];
						var allInt = parseInt(all);
						var fail = git["failedChildren"];
						var failInt = parseInt(fail);
						if (!isNaN(failInt)) {
							git["failedChildren"] = failInt + 1;
						}
						if ((allInt === (git["loadedChildren"] + git["failedChildren"])) && (grandParent === undefined)) {
							that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
							that._data.geoserver.clientTree.refresh();
						} else if ((allInt === (git["loadedChildren"] + git["failedChildren"])) && (grandParent instanceof ol.layer.Group)) {
							var git = grandParent.get("git");
							if (git !== undefined) {
								var all = git["allChildren"];
								var allInt = parseInt(all);
								var fail = git["failedChildren"];
								var failInt = parseInt(fail);
								if (!isNaN(failInt)) {
									git["failedChildren"] = failInt + 1;
								}
								if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
									console.log("done");
									that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
									that._data.geoserver.clientTree.refresh();
								}
							}
						}
					}
				}
				return;
			}

			var geogig = {};
			if (datastore.original.hasOwnProperty("storeType")) {
				if (datastore.original.storeType === "GeoGIG") {
					geogig["repo"] = datastore.original.geogigRepos;
					geogig["branch"] = datastore.original.geogigBranch;
				}
			}
			var params = {
				"serverName" : server.text,
				"workspace" : workspace.text,
				"geoLayerList" : [ node.text ]
			};
			console.log(params);

			$.ajax({
				url : that._data.geoserver.getLayerInfo,
				method : "POST",
				contentType : "application/json; charset=UTF-8",
				data : JSON.stringify(params),
				beforeSend : function() {
					// $("body").css("cursor", "wait");
				},
				complete : function() {
					// $("body").css("cursor", "default");
				},
				success : function(data, textStatus, jqXHR) {
					console.log(data);
					if (Array.isArray(data)) {
						for (var i = 0; i < data.length; i++) {
							var obj = {
								"serverName" : server.text,
								"workspace" : workspace.text,
								"LAYERS" : params["workspace"] + ":" + node.text,
								// "STYLES" : data[i].style,
								"VERSION" : gb.module.serviceVersion.WMS,
								"BBOX" : data[i].nbBox.minx.toString() + "," + data[i].nbBox.miny.toString() + ","
										+ data[i].nbBox.maxx.toString() + "," + data[i].nbBox.maxy.toString(),
								"TILED" : true,
								"FORMAT" : 'image/png8',
								"SLD_BODY" : data[i].sld
//								"salt" : Math.random()
							};

							obj[gb.module.serviceVersion.getWMSCrs()] = data[i].srs;

							var wms = new ol.layer.Tile({
								extent : [ data[i].nbBox.minx.toString(), data[i].nbBox.miny.toString(), data[i].nbBox.maxx.toString(),
										data[i].nbBox.maxy.toString() ],
								source : new ol.source.TileWMS({
									url : that._data.geoserver.getMapWMS,
									params : obj,
									serverType : "geoserver"
								})
							});

							var git = {
								"geoserver" : server.text,
								"workspace" : workspace.text,
								"layers" : data[i].lName,
								"geometry" : data[i].geomType,
								"editable" : true,
								"sld" : data[i].sld,
								"native" : data[i].nativeName
							};
							if (geogig["repo"] !== undefined && geogig["branch"] !== undefined) {
								git["geogigRepo"] = geogig["repo"];
								git["geogigBranch"] = geogig["branch"];
							}
							wms.set("git", git);
							wms.set("id", node.id);
							wms.set("name", node.text);

							if (collection instanceof ol.Collection) {
								collection.push(wms);
								// that._data.geoserver.clientTree.initTreeId();
								var parent = that._data.geoserver.clientTree.get_LayerByOLId(datastore.id);
								console.log(parent);
								if (parent instanceof ol.layer.Group) {
									var git = parent.get("git");
									if (git !== undefined) {
										var all = git["allChildren"];
										var allInt = parseInt(all);
										var load = git["loadedChildren"];
										var loadInt = parseInt(load);
										if (!isNaN(loadInt)) {
											git["loadedChildren"] = loadInt + 1;
										}
										if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
											console.log("done");
											that._data.geoserver.clientTree.refresh();
											if (git["failedChildren"] > 0) {
												that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
											}
											var grandParent = that._data.geoserver.clientTree.get_LayerByOLId(workspace.id);
											console.log(parent);
											if (grandParent instanceof ol.layer.Group) {
												var git = grandParent.get("git");
												if (git !== undefined) {
													var all = git["allChildren"];
													var allInt = parseInt(all);
													var load = git["loadedChildren"];
													var loadInt = parseInt(load);
													if (!isNaN(loadInt)) {
														git["loadedChildren"] = loadInt + 1;
													}
													if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
														console.log("done");
														that._data.geoserver.clientTree.refresh();
														if (git["failedChildren"] > 0) {
															that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
														}
													}
												}
											} else {
												that._data.geoserver.clientTree.refresh();
											}
										}
									}
								} else {
									that._data.geoserver.clientTree.refresh();
								}
							} else {
								console.error("no collection to push");
							}
						}
					}
				}
			});
		}
	};

	/**
	 * 레이어를 묶어서 요청한다.
	 * 
	 * @method recursive_node_load
	 * @param {Object}
	 *            node - 트리에서 조회한 레이어 노드 객체
	 * @param {ol.Collection}
	 *            collection - 레이어를 주입할 콜렉션
	 */
	this.recursive_node_load = function(node, collection, duplication, isLast, callback) {
		var that = this;
		if (node.type === "workspace") {
			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				var serverTree = that._data.geoserver.serverTree;
				// that.messageModal(serverTree.translation.err[serverTree.locale],
				// serverTree.translation.noimpsamestore[serverTree.locale]);
				console.error("layer duplicated");
				duplication = true;
				return;
			}

			var childrenLength = node.children.length;
			console.log("자식노드: " + childrenLength);
			var git = {
				"allChildren" : childrenLength,
				"loadedChildren" : 0,
				"failedChildren" : 0
			};

			var workspace = new ol.layer.Group({});
			workspace.set("id", node.id);
			workspace.set("name", node.text);
			workspace.set("git", git);

			if (collection instanceof ol.Collection) {
				collection.push(workspace);
				var domnode = that._data.geoserver.clientTree.get_node(workspace.get("treeid"), true);
				$(domnode).addClass("jstreeol3-loading");
				console.log(domnode);
			} else {
				console.error("no collection to push");
			}

			var children = node.children;
			if (children.length === 0) {
				that._data.geoserver.clientTree.refresh();
			}
			for (var i = 0; i < children.length; i++) {
				var store = this.get_node(children[i]);
				var isLast = false;
				if (i == (children.length - 1)) {
					isLast = true;
				}
				this.recursive_node_load(store, workspace.getLayers(), duplication, isLast);
			}
		} else if (node.type === "datastore") {
			var workspaceNode = this.get_node(node.parents[0]);
			var datastoreNode = node;

			var geogig = {};
			if (datastoreNode.original.hasOwnProperty("storeType")) {
				if (datastoreNode.original.storeType === "GeoGIG") {
					geogig["repo"] = datastoreNode.original.geogigRepos;
					geogig["branch"] = datastoreNode.original.geogigBranch;
				}
			}

			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				var serverTree = that._data.geoserver.serverTree;
				// that.messageModal(serverTree.translation.err[serverTree.locale],
				// serverTree.translation.noimpsamestore[serverTree.locale]);
				duplication = true;
				console.error("layer duplicated");

				var parent = that._data.geoserver.clientTree.get_LayerByOLId(workspaceNode.id);
				console.log(parent);
				if (parent instanceof ol.layer.Group) {
					var git = parent.get("git");
					if (git !== undefined) {
						var all = git["allChildren"];
						var allInt = parseInt(all);
						var fail = git["failedChildren"];
						var failInt = parseInt(fail);
						if (!isNaN(failInt)) {
							git["failedChildren"] = failInt + 1;
						}
						if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
							that._data.geoserver.clientTree.refresh();
						}
					}
				}
				return;
			}

			var children = node.children;
			var childrenLength = node.children.length;
			console.log(node.children);
			console.log("자식노드: " + childrenLength);
			// var git = {
			// "allChildren" : childrenLength,
			// "loadedChildren" : 0,
			// "failedChildren" : 0
			// };

			if (gb.module.serviceVersion.loadPerformance.active && childrenLength >= gb.module.serviceVersion.loadPerformance.limit) {
				if (collection instanceof ol.Collection) {
					var params = {
						"serverName" : undefined,
						"workspace" : undefined,
						"geoLayerList" : []
					};
					var layerString = [];
					var wms;
					var except = [];
					if (children.length > 0) {
						var child = that.get_node(children[0]);
						var server = that.get_node(child.parents[2]);
						var workspace = that.get_node(child.parents[1]);
						params["serverName"] = server.text;
						params["workspace"] = workspace.text;
						for (var a = 0; a < children.length; a++) {
							var item = that.get_node(children[a]);

							var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(item.id);
							if (dupLayer !== undefined) {
								var serverTree = that._data.geoserver.serverTree;
								// that.messageModal(serverTree.translation.err[serverTree.locale],
								// serverTree.translation.noimpsamestore[serverTree.locale]);
								duplication = true;
								except.push(item);
							} else {
								params["geoLayerList"].push(item.text);
								var layer = workspace.text + ":" + item.text;
								layerString.push(layer);
							}
						}

						wms = new ol.layer.Tile({
							extent : undefined,
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									"serverName" : params["serverName"],
									"workspace" : params["workspace"],
									"LAYERS" : layerString.toString(),
									"VERSION" : "1.1.0",
									"TILED" : true,
									"FORMAT" : 'image/png8'
//									"salt" : Math.random()
								// "SLD_BODY" : mysld
								},
								serverType : "geoserver"
							})
						});

						var git = {
							"fake" : "parent",
							"geoserver" : params["serverName"],
							"workspace" : params["workspace"],
							"layers" : new ol.Collection(),
							"geometry" : false,
							"editable" : false,
							"sld" : false,
							"native" : false,
							"allChildren" : childrenLength,
							"loadedChildren" : 0,
							"failedChildren" : 0
						};
						wms.set("git", git);
						wms.set("id", node.id);
						wms.set("name", node.text);
						collection.push(wms);

						var layers = wms.get("git").layers;
						if (layers instanceof ol.Collection) {
							var domnode = that._data.geoserver.clientTree.get_node(wms.get("treeid"), true);
							$(domnode).addClass("jstreeol3-loading");
							console.log(domnode);
						}
					}
					$.ajax({
						url : that._data.geoserver.getLayerInfo,
						method : "POST",
						contentType : "application/json; charset=UTF-8",
						data : JSON.stringify(params),
						beforeSend : function() {
							// $("body").css("cursor", "wait");
						},
						complete : function() {
							// $("body").css("cursor", "default");
						},
						success : function(data, textStatus, jqXHR) {
							console.log(data);
							if (Array.isArray(data)) {
								for (var i = 0; i < data.length; i++) {
									var ext = [ data[i].nbBox.minx.toString(), data[i].nbBox.miny.toString(),
											data[i].nbBox.maxx.toString(), data[i].nbBox.maxy.toString() ];
									var psource = wms.getSource();
									var pext = psource.getParams()["BBOX"];
									if (pext === undefined) {
										// wms.setExtent(ext);
										psource.getParams()["BBOX"] = ext.toString();
									} else {
										var arrpext = pext.split(",");
										var newext = ol.extent.extend(arrpext, ext);
										psource.getParams()["BBOX"] = newext.toString();
										// wms.setExtent(newext);
									}
									var wmsChild = new ol.layer.Tile({
										extent : [ data[i].nbBox.minx.toString(), data[i].nbBox.miny.toString(),
												data[i].nbBox.maxx.toString(), data[i].nbBox.maxy.toString() ],
										source : new ol.source.TileWMS({
											url : that._data.geoserver.getMapWMS,
											params : {
												"serverName" : params["serverName"],
												"workspace" : params["workspace"],
												"LAYERS" : params["workspace"] + ":" + data[i].lName,
												// "STYLES" : undefined,
												"VERSION" : "1.1.0",
												"BBOX" : data[i].nbBox.minx.toString() + "," + data[i].nbBox.miny.toString() + ","
														+ data[i].nbBox.maxx.toString() + "," + data[i].nbBox.maxy.toString(),
												"TILED" : true,
												"FORMAT" : 'image/png8',
												"CRS" : data[i].srs,
												"SLD_BODY" : data[i].sld
//												"salt" : Math.random()
											},
											serverType : "geoserver"
										})
									});
									var gitChild = {
										"fake" : "child",
										"geoserver" : params["serverName"],
										"workspace" : params["workspace"],
										'layers' : data[i].lName,
										"geometry" : data[i].geomType,
										"editable" : true,
										"sld" : data[i].sld,
										"native" : data[i].nativeName
									};
									if (geogig["repo"] !== undefined && geogig["branch"] !== undefined) {
										gitChild["geogigRepo"] = geogig["repo"];
										gitChild["geogigBranch"] = geogig["branch"];
									}
									wmsChild.set("git", gitChild);
									wmsChild.set("id", node.id + ":" + data[i].lName);
									wmsChild.set("name", data[i].lName);
									var layers = wms.get("git").layers;
									if (layers instanceof ol.Collection) {
										layers.push(wmsChild);
										that._data.geoserver.clientTree.initTreeId();
									} else {
										console.error("no collection to push");
									}
									if (wms instanceof ol.layer.Tile) {
										var git = wms.get("git");
										if (git !== undefined) {
											var fakeType = git.fake;
											if (fakeType !== undefined) {
												if (fakeType === "parent") {
													var all = git["allChildren"];
													var allInt = parseInt(all);
													var load = git["loadedChildren"];
													var loadInt = parseInt(load);
													if (!isNaN(loadInt)) {
														git["loadedChildren"] = loadInt + 1;
													}
													if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
														that._data.geoserver.clientTree.refresh();

													}
												}
											}
										}
									}
									if (i === (data.length - 1)) {
										that._data.geoserver.clientTree.refresh();
									}
								}
							}
						}
					});
				} else {
					console.error("no collection to push");
				}
			} else {
				
				var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
				if (dupLayer !== undefined) {
					var serverTree = that._data.geoserver.serverTree;
					// that.messageModal(serverTree.translation.err[serverTree.locale],
					// serverTree.translation.noimpsamestore[serverTree.locale]);
					duplication = true;
				}
				
				var git = {
					"allChildren" : childrenLength,
					"loadedChildren" : 0,
					"failedChildren" : 0
				};

				var datastore = new ol.layer.Group({});
				datastore.set("id", node.id);
				datastore.set("name", node.text);
				datastore.set("git", git);

				if (collection instanceof ol.Collection) {
					collection.push(datastore);
					var domnode = that._data.geoserver.clientTree.get_node(datastore.get("treeid"), true);
					$(domnode).addClass("jstreeol3-loading");
					console.log(domnode);

				} else {
					console.error("no collection to push");
				}

				var objNodes = [];
				if (children.length === 0) {
					that._data.geoserver.clientTree.refresh();
				}
				for (var i = 0; i < children.length; i++) {
					var layer = this.get_node(children[i]);
					var isLast = false;
					if (i == (children.length - 1)) {
						isLast = true;
					}
					this.recursive_node_load(layer, datastore.getLayers(), duplication, isLast);
					// objNodes.push(layer);
				}
			}

			// var children = node.children;
			// var objNodes = [];
			// if (children.length === 0) {
			// that._data.geoserver.clientTree.refresh();
			// }
			// for (var i = 0; i < children.length; i++) {
			// var layer = this.get_node(children[i]);
			// this.load_each_wms_layer(layer, datastore.getLayers());
			// // objNodes.push(layer);
			// }

			/*
			 * if (collection instanceof ol.Collection) {
			 * collection.push(datastore); this.load_each_wms_layer(objNodes,
			 * datastore.getLayers()); } else { console.error("no collection to
			 * push"); }
			 */
		} else if (node.type === "point" || node.type === "multipoint" || node.type === "linestring" || node.type === "multilinestring"
				|| node.type === "polygon" || node.type === "multipolygon") {

			var server = this.get_node(node.parents[2]);
			var workspace = this.get_node(node.parents[1]);
			var datastore = this.get_node(node.parents[0]);

			var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
			if (dupLayer !== undefined) {
				var serverTree = that._data.geoserver.serverTree;
				// that.messageModal(serverTree.translation.err[serverTree.locale],
				// serverTree.translation.noimpsamestore[serverTree.locale]);
				console.error("layer duplicated");
				duplication = true;
				var grandParent = that._data.geoserver.clientTree.get_LayerByOLId(workspace.id);
				var parent = that._data.geoserver.clientTree.get_LayerByOLId(datastore.id);
				console.log(parent);
				if (parent instanceof ol.layer.Group) {
					var git = parent.get("git");
					if (git !== undefined) {
						var all = git["allChildren"];
						var allInt = parseInt(all);
						var fail = git["failedChildren"];
						var failInt = parseInt(fail);
						if (!isNaN(failInt)) {
							git["failedChildren"] = failInt + 1;
						}
						if ((allInt === (git["loadedChildren"] + git["failedChildren"])) && (grandParent === undefined)) {
							// that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
							that._data.geoserver.clientTree.refresh();
						} else if ((allInt === (git["loadedChildren"] + git["failedChildren"])) && (grandParent instanceof ol.layer.Group)) {
							var git = grandParent.get("git");
							if (git !== undefined) {
								var all = git["allChildren"];
								var allInt = parseInt(all);
								var fail = git["failedChildren"];
								var failInt = parseInt(fail);
								if (!isNaN(failInt)) {
									git["failedChildren"] = failInt + 1;
								}
								if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
									console.log("done");
									// that.messageModal("Error", "이미 불러온 레이어는
									// 제외됩니다.");
									that._data.geoserver.clientTree.refresh();
								}
							}
						}
					}
				}
				return;
			}

			var geogig = {};
			if (datastore.original.hasOwnProperty("storeType")) {
				if (datastore.original.storeType === "GeoGIG") {
					geogig["repo"] = datastore.original.geogigRepos;
					geogig["branch"] = datastore.original.geogigBranch;
				}
			}
			var params = {
				"serverName" : server.text,
				"workspace" : workspace.text,
				"geoLayerList" : [ node.text ]
			};
			console.log(params);

			$.ajax({
				url : that._data.geoserver.getLayerInfo,
				method : "POST",
				contentType : "application/json; charset=UTF-8",
				data : JSON.stringify(params),
				beforeSend : function() {
					// $("body").css("cursor", "wait");
				},
				complete : function() {
					// $("body").css("cursor", "default");
				},
				success : function(data, textStatus, jqXHR) {
					console.log(data);
					if (Array.isArray(data)) {
						for (var i = 0; i < data.length; i++) {
							var obj = {
								"serverName" : server.text,
								"workspace" : workspace.text,
								"LAYERS" : params["workspace"] + ":" + node.text,
								// "STYLES" : data[i].style,
								"VERSION" : gb.module.serviceVersion.WMS,
								"BBOX" : data[i].nbBox.minx.toString() + "," + data[i].nbBox.miny.toString() + ","
										+ data[i].nbBox.maxx.toString() + "," + data[i].nbBox.maxy.toString(),
								"TILED" : true,
								"FORMAT" : 'image/png8',
								"SLD_BODY" : data[i].sld
//								"salt" : Math.random()
							};
							obj[gb.module.serviceVersion.getWMSCrs()] = data[i].srs;

							var wms = new ol.layer.Tile({
								extent : [ data[i].nbBox.minx.toString(), data[i].nbBox.miny.toString(), data[i].nbBox.maxx.toString(),
										data[i].nbBox.maxy.toString() ],
								source : new ol.source.TileWMS({
									url : that._data.geoserver.getMapWMS,
									params : obj,
									serverType : "geoserver"
								})
							});

							var attributes = [];
							if (data[i].attInfo instanceof Object) {
								var attribute
								for ( var j in data[i].attInfo) {
									attribute = new gb.layer.Attribute({
										originFieldName : j.replace(/(\s*)/g, ''),
										fieldName : j.replace(/(\s*)/g, ''),
										type : data[i].attInfo[j].type,
										decimal : data[i].attInfo[j].type === "Double" ? 30 : null,
										size : 256,
										isUnique : false,
										nullable : data[i].attInfo[j].nillable === "true" ? true : false,
										isNew : true
									});

									attributes.push(attribute);
								}
							}

							var git = {
								"geoserver" : server.text,
								"workspace" : workspace.text,
								"layers" : data[i].lName,
								"geometry" : data[i].geomType,
								"editable" : true,
								"sld" : data[i].sld,
								"native" : data[i].nativeName,
								"attribute" : attributes
							};
							if (geogig["repo"] !== undefined && geogig["branch"] !== undefined) {
								git["geogigRepo"] = geogig["repo"];
								git["geogigBranch"] = geogig["branch"];
							}
							wms.set("git", git);
							wms.set("id", node.id);
							wms.set("name", node.text);
							// ====================
							var dupLayer = that._data.geoserver.clientTree.get_LayerByOLId(node.id);
							if (dupLayer !== undefined) {
								var serverTree = that._data.geoserver.serverTree;
								// that.messageModal(serverTree.translation.err[serverTree.locale],
								// serverTree.translation.noimpsamestore[serverTree.locale]);
								console.error("layer duplicated");
								duplication = true;
								continue;
							}
							// ====================

							if (collection instanceof ol.Collection) {
								collection.push(wms);
								// that._data.geoserver.clientTree.initTreeId();
								var parent = that._data.geoserver.clientTree.get_LayerByOLId(datastore.id);
								console.log(parent);
								if (parent instanceof ol.layer.Group) {
									var git = parent.get("git");
									if (git !== undefined) {
										var all = git["allChildren"];
										var allInt = parseInt(all);
										var load = git["loadedChildren"];
										var loadInt = parseInt(load);
										if (!isNaN(loadInt)) {
											git["loadedChildren"] = loadInt + 1;
										}
										if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
											console.log("done");
											that._data.geoserver.clientTree.refresh();
											if (git["failedChildren"] > 0) {
												that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.");
											}
											var grandParent = that._data.geoserver.clientTree.get_LayerByOLId(workspace.id);
											console.log(parent);
											if (grandParent instanceof ol.layer.Group) {
												var git = grandParent.get("git");
												if (git !== undefined) {
													var all = git["allChildren"];
													var allInt = parseInt(all);
													var load = git["loadedChildren"];
													var loadInt = parseInt(load);
													if (!isNaN(loadInt)) {
														git["loadedChildren"] = loadInt + 1;
													}
													if (allInt === (git["loadedChildren"] + git["failedChildren"])) {
														console.log("done");
														that._data.geoserver.clientTree.refresh();
														if (git["failedChildren"] > 0) {
															that.messageModal("Error", "이미 불러온 레이어는 제외됩니다.", 206);
														}
													}
												}
											} else {
												that._data.geoserver.clientTree.refresh();
											}
										}
									}
								} else {
									that._data.geoserver.clientTree.refresh();
								}
							} else {
								console.error("no collection to push");
							}
							if (typeof callback === "function") {
								callback();	
							}
						}
					}
				}
			});
		}
		if (isLast && duplication) {
			var serverTree = that._data.geoserver.serverTree;
			that.messageModal(serverTree.translation.err[serverTree.locale],
					serverTree.translation.noimpsamestore[serverTree.locale]);
		}
	};

	/**
	 * 오류 메시지 창을 생성한다.
	 * 
	 * @method messageModal
	 * @param {String}
	 *            title - 모달의 타이틀
	 * @param {String}
	 *            msg - 보여줄 메세지
	 * @param {Number}
	 *            height - 모달의 높이(px)
	 */
	this.messageModal = function(title, msg) {
		var that = this;
		var msg1 = $("<div>").text(msg).css({
			"text-align" : "center",
			"font-size" : "16px",
			"margin-top" : "18px",
			"margin-bottom" : "18px"
		});
		var body = $("<div>").append(msg1);
		var okBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-primary").text("OK");
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
	 * WMS 레이어를 임포트 한다.
	 * 
	 * @method import_each_wms
	 * @param {Object}
	 *            obj - WMS 레이어를 임포트하기 위한 정보
	 */
	this.import_each_wms = function(node) {
		var that = this;

		this.load_layer_info();
		// var server = this.get_node(obj.parents[2]);
		// var workspace = this.get_node(obj.parents[1]);
		// var datastore = this.get_node(obj.parents[0]);
		// var wmsInfo = {
		// "server" : server.text,
		// "workspace" : workspace.text,
		// "layers" : datastore.text + ":" + obj.text
		// };
		// console.log(wmsInfo);

	};

	this.import_fake_group_notload = function(obj) {
		// // =======================================
		var that = this;
		var parentLayer;
		var farr = {
			"geoLayerList" : obj.arr
		}
		console.log(JSON.stringify(farr));
		var parentParam;
		$.ajax({
			url : that._data.geoserver.groupLayerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(farr),
			beforeSend : function() { // 호출전실행
				$("body").css("cursor", "wait");
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : obj.refer.get_node(data[i].name).children.toString(),
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].bbox.minx.toString() + "," + data[i].bbox.miny.toString() + ","
											+ data[i].bbox.maxx.toString() + "," + data[i].bbox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});
						var layers = new ol.Collection();
						for (var j = 0; j < data[i].publishedList.names.length; j++) {
							var layer = new ol.layer.Layer({
								opacity : 1,
								visible : true
							});
							var id = data[i].publishedList.names[j];
							var name = id.substring((id.split("_", 3).join("_").length) + 1, id.split("_", 4).join("_").length);
							var dtype = id.substring(id.split("_", 4).join("_").length + 1);
							var geom;
							switch (dtype) {
							case "LWPOLYLINE":
								geom = "LineString";
								break;
							case "POLYLINE":
								geom = "LineString";
								break;
							case "POINT":
								geom = "Point";
								break;
							case "MULTIPOINT":
								geom = "MultiPoint";
								break;
							case "INSERT":
								geom = "Point";
								break;
							case "POLYGON":
								geom = "Polygon";
								break;
							case "MULTIPOLYGON":
								geom = "MultiPolygon";
								break;
							case "LINESTRING":
								geom = "LineString";
								break;
							case "MULTILINESTRING":
								geom = "MultiLineString";
								break;
							case "TEXT":
								geom = "Point";
								break;

							default:
								break;
							}
							var gchild = {
								"validation" : false,
								"editable" : true,
								"fake" : "child",
								"geometry" : geom
							}
							layer.set("git", gchild);
							layer.set("id", id);
							layer.set("name", name);
							layers.push(layer);
						}
						var getPosition = function(str, subString, index) {
							return str.split(subString, index).join(subString).length;
						};
						var id = data[i].name.replace(/(\s*)/g, '');
						var format = id.substring((getPosition(id, "_", 1) + 1), getPosition(id, "_", 2));
						var mapsheet = new gb.mapsheet.Mapsheet({
							id : data[i].name.replace(/(\s*)/g, ''),
							number : obj.refer.get_node(data[i].name).text.replace(/(\s*)/g, ''),
							format : format
						});
						var git = {
							"validation" : false,
							"geometry" : data[i].geomType,
							"editable" : true,
							"fake" : "parent",
							"layers" : layers,
							"information" : mapsheet
						}

						wms.set("name", obj.refer.get_node(data[i].name).text);
						wms.set("id", data[i].name);
						wms.set("git", git);
						var mapLayers = that._data.geoserver.map.getLayers();

						for (var j = 0; j < mapLayers.getLength(); j++) {
							if (mapLayers.item(j).get("id") === wms.get("id") && mapLayers.item(j) instanceof ol.layer.Tile
									&& mapLayers.item(j).get("git").hasOwnProperty("fake")) {
								that._data.geoserver.map.removeLayer(mapLayers.item(j));
								break;
							}
						}
						console.log(wms);
						// wms.set("type", "ImageTile");
						that._data.geoserver.map.addLayer(wms);
						$("body").css("cursor", "default");
					}
				}
			}
		});
	};
	this.import_fake_image_notload = function(obj) {
		// // =======================================
		var that = this;
		var parentLayer;
		var farr = {
			"geoLayerList" : [ obj.parent ]
		}
		console.log(JSON.stringify(farr));
		$.ajax({
			url : that._data.geoserver.groupLayerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(farr),
			beforeSend : function() { // 호출전실행
				$("body").css("cursor", "wait");
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				if (Array.isArray(data)) {
					var arra = [];
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : obj.arr.toString(),
									// 'LAYERS' :
									// that._data.geoserver.user
									// +
									// ":" + data[i].name,
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].bbox.minx.toString() + "," + data[i].bbox.miny.toString() + ","
											+ data[i].bbox.maxx.toString() + "," + data[i].bbox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});

						var layers = new ol.Collection();
						for (var j = 0; j < obj.arr.length; j++) {
							var layer = new ol.layer.Layer({
								opacity : 1,
								visible : true
							});
							var id = obj.arr[j];
							var name = id.substring((id.split("_", 3).join("_").length) + 1, id.split("_", 4).join("_").length);
							var dtype = id.substring(id.split("_", 4).join("_").length + 1);
							var geom;
							switch (dtype) {
							case "LWPOLYLINE":
								geom = "LineString";
								break;
							case "POLYLINE":
								geom = "LineString";
								break;
							case "POINT":
								geom = "Point";
								break;
							case "MULTIPOINT":
								geom = "MultiPoint";
								break;
							case "INSERT":
								geom = "Point";
								break;
							case "POLYGON":
								geom = "Polygon";
								break;
							case "MULTIPOLYGON":
								geom = "MultiPolygon";
								break;
							case "LINESTRING":
								geom = "LineString";
								break;
							case "MULTILINESTRING":
								geom = "MultiLineString";
								break;
							case "TEXT":
								geom = "Point";
								break;

							default:
								break;
							}
							var gchild = {
								"validation" : false,
								"editable" : true,
								"fake" : "child",
								"geometry" : geom
							}
							layer.set("git", gchild);
							layer.set("id", id);
							layer.set("name", name);
							layers.push(layer);
						}
						var getPosition = function(str, subString, index) {
							return str.split(subString, index).join(subString).length;
						};
						var id = data[i].name.replace(/(\s*)/g, '');
						var format = id.substring((getPosition(id, "_", 1) + 1), getPosition(id, "_", 2));
						var mapsheet = new gb.mapsheet.Mapsheet({
							id : data[i].name.replace(/(\s*)/g, ''),
							number : obj.refer.get_node(data[i].name).text.replace(/(\s*)/g, ''),
							format : format
						});
						var git = {
							"validation" : false,
							"editable" : true,
							"fake" : "parent",
							"layers" : layers,
							"information" : mapsheet
						}
						wms.set("name", obj.refer.get_node(data[i].name).text);
						wms.set("id", data[i].name);
						wms.set("git", git);
						// wms.set("type", "ImageTile");
						var mapLayers = that._data.geoserver.map.getLayers();
						var flag = true;
						var newCollection = [];
						for (var j = 0; j < mapLayers.getLength(); j++) {
							if (mapLayers.item(j).get("id") === obj.parent && mapLayers.item(j) instanceof ol.layer.Tile
									&& mapLayers.item(j).get("git").hasOwnProperty("fake")) {

								var befParams = mapLayers.item(j).getSource().getParams();
								var git = mapLayers.item(j).get("git");
								var lid = mapLayers.item(j).get("id");
								var lname = mapLayers.item(j).get("name");
								// 있다면 구 그룹의 콜렉션과 신 그룹의 콜렉션을
								// 비교
								var befCollection = mapLayers.item(j).get("git").layers;
								for (var l = 0; l < layers.getLength(); l++) {
									var dupl = false;
									for (var k = 0; k < befCollection.getLength(); k++) {
										if (layers.item(l).get("id") === befCollection.item(k).get("id")) {
											dupl = true;
										}
									}
									if (!dupl) {
										newCollection.push(layers.item(l));
									}
								}
								befCollection.extend(newCollection);
								var names = [];
								for (var i = 0; i < befCollection.getLength(); i++) {
									names.push(befCollection.item(i).get("id"));
								}
								befParams["LAYERS"] = names.toString();
								befParams['TIME'] = Date.now();
								mapLayers.item(j).getSource().updateParams(befParams);
								// that._data.geoserver.clientRefer.refresh();
								var group = new ol.layer.Group({
									layers : befCollection
								});
								var wms2 = new ol.layer.Tile({
									source : new ol.source.TileWMS({
										url : that._data.geoserver.getMapWMS,
										params : befParams,
										serverType : 'geoserver'
									})
								});
								wms2.set("name", lname);
								wms2.set("id", lid);
								wms2.set("git", git);
								wms.set("type", "Group");
								that._data.geoserver.map.removeLayer(mapLayers.item(j));
								that._data.geoserver.map.addLayer(wms2);
								flag = false;
								// console.log(wms2);
								$("body").css("cursor", "default");
								break;
							}
						}
						if (flag) {
							var info = wms.get("git");
							info["layers"] = layers;
							console.log(wms);
							that._data.geoserver.map.addLayer(wms);
							$("body").css("cursor", "default");
						}
					}
				}
			}
		});
	};

	/**
	 * wms레이어를 트리형태로 임포트
	 * 
	 * @name $.jstree.plugins.geoserver.import_fake_image
	 * @plugin geoserver
	 * @author 소이준
	 */
	this.import_fake_image = function(obj) {
		// // =======================================
		var that = this;
		var parentLayer;
		var farr = {
			"geoLayerList" : [ obj.parent ]
		}
		console.log(JSON.stringify(farr));
		var parentParam;
		$.ajax({
			url : that._data.geoserver.groupLayerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(farr),
			beforeSend : function() { // 호출전실행
				$("body").css("cursor", "wait");
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				// parentParam = data;
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : obj.arr.toString(),
									// 'LAYERS' :
									// that._data.geoserver.user +
									// ":" + data[i].name,
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].bbox.minx.toString() + "," + data[i].bbox.miny.toString() + ","
											+ data[i].bbox.maxx.toString() + "," + data[i].bbox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});
						wms.set("name", obj.refer.get_node(data[i].name).text);
						wms.set("id", data[i].name);
						var git = {
							"validation" : false,
							"geometry" : data[i].geomType,
							"editable" : true,
							"fake" : "parent"
						}
						wms.set("git", git);
						parentLayer = wms;
						console.log(wms);
						// wms.set("type", "ImageTile");
						// that._data.geoserver.map.addLayer(wms);
					}
				}
				// =======================================
				var arr = {
					"geoLayerList" : obj.arr
				}
				var names = [];
				console.log(JSON.stringify(arr));
				$.ajax({
					url : that._data.geoserver.layerInfoURL,
					method : "POST",
					contentType : "application/json; charset=UTF-8",
					cache : false,
					data : JSON.stringify(arr),
					beforeSend : function() { // 호출전실행
						// loadImageShow();
					},
					complete : function() {
						$("body").css("cursor", "default");
					},
					traditional : true,
					success : function(data2, textStatus, jqXHR) {
						console.log(data2);
						if (Array.isArray(data2)) {
							var arra = [];
							for (var i = 0; i < data2.length; i++) {
								var wms = new ol.layer.Tile({
									source : new ol.source.TileWMS({
										url : that._data.geoserver.getMapWMS,
										params : {
											'TIME' : Date.now(),
											'LAYERS' : data2[i].lName,
											'TILED' : true,
											'FORMAT' : 'image/png8',
											'VERSION' : '1.1.0',
											'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
											'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
											'BBOX' : data2[i].nbBox.minx.toString() + "," + data2[i].nbBox.miny.toString() + ","
													+ data2[i].nbBox.maxx.toString() + "," + data2[i].nbBox.maxy.toString()
										},
										serverType : 'geoserver'
									})
								});
								var git = {
									"validation" : false,
									"geometry" : data2[i].geomType,
									"editable" : true,
									"attribute" : data2[i].attInfo,
									"fake" : "child"
								}
								wms.set("name", obj.refer.get_node(data2[i].lName).text);
								wms.set("id", data2[i].lName);
								// wms.setVisible(false);
								console.log(wms.get("id"));
								// wms.set("type", "ImageTile");
								wms.set("git", git);
								arra.push(wms);
								console.log(wms);
							}
							var mapLayers = that._data.geoserver.map.getLayers();
							var flag = true;
							var newCollection = [];
							// 현재 맵에 같은 아이디의 타일레이어가 있는지
							for (var j = 0; j < mapLayers.getLength(); j++) {
								if (mapLayers.item(j).get("id") === obj.parent && mapLayers.item(j) instanceof ol.layer.Tile) {
									var befParams = mapLayers.item(j).getSource().getParams();
									var git = mapLayers.item(j).get("git");
									var lid = mapLayers.item(j).get("id");
									var lname = mapLayers.item(j).get("name");
									// 있다면 구 그룹의 콜렉션과 신 그룹의 콜렉션을 비교
									var befCollection = mapLayers.item(j).get("git").layers;
									for (var l = 0; l < arra.length; l++) {
										var dupl = false;
										for (var k = 0; k < befCollection.getLength(); k++) {
											if (arra[l].get("id") === befCollection.item(k).get("id")) {
												dupl = true;
											}
										}
										if (!dupl) {
											newCollection.push(arra[l]);
										}
									}
									befCollection.extend(newCollection);
									var names = [];
									for (var i = 0; i < befCollection.getLength(); i++) {
										names.push(befCollection.item(i).get("id"));
									}
									befParams["LAYERS"] = names.toString();
									befParams['TIME'] = Date.now();
									// var group = new
									// ol.layer.Group({
									// layers : befCollection
									// });
									var wms2 = new ol.layer.Tile({
										source : new ol.source.TileWMS({
											url : that._data.geoserver.getMapWMS,
											params : befParams,
											serverType : 'geoserver'
										})
									});
									wms2.set("name", lname);
									wms2.set("id", lid);
									wms2.set("git", git);
									// wms.set("type", "Group");
									that._data.geoserver.map.removeLayer(mapLayers.item(j));
									that._data.geoserver.map.addLayer(wms2);
									flag = false;
									break;
								}
							}
							if (flag) {
								// var group = new ol.layer.Group({
								// layers : arra
								// });
								var info = parentLayer.get("git");
								info["layers"] = new ol.Collection().extend(arra);
								console.log(parentLayer);
								that._data.geoserver.map.addLayer(parentLayer);
								// group.set("name",
								// obj.refer.get_node(obj.parent).text);
								// group.set("id", obj.parent);
								// group.set("type", "Group");
								// that._data.geoserver.map.addLayer(group);
							}
							$("body").css("cursor", "default");
						}
					}
				});
			}
		});
	};

	/**
	 * wms레이어를 클라이언트로 임포트
	 * 
	 * @name $.jstree.plugins.geoserver.import_image
	 * @plugin geoserver
	 * @author 소이준
	 */
	this.import_image = function(obj) {
		var that = this;
		var arr = {
			"geoLayerList" : obj.arr
		}
		console.log(JSON.stringify(arr));
		$.ajax({
			url : that._data.geoserver.layerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(arr),
			beforeSend : function() { // 호출전실행
				// loadImageShow();
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				if (Array.isArray(data)) {
					var arra = [];
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : data[i].lName,
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].nbBox.minx.toString() + "," + data[i].nbBox.miny.toString() + ","
											+ data[i].nbBox.maxx.toString() + "," + data[i].nbBox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});
						var git = {
							"validation" : false,
							"geometry" : data[i].geomType,
							"editable" : true,
							"attribute" : data[i].attInfo
						}
						// wms.set("name",
						// obj.refer.get_node(data[i].lName).text);
						wms.set("name", data[i].lName);
						wms.set("id", data[i].lName);
						console.log(wms.get("id"));
						// wms.set("type", "ImageTile");
						wms.set("git", git);
						arra.push(wms);
					}
					var mapLayers = that._data.geoserver.map.getLayers();
					var flag = true;
					var newCollection = [];
					// 현재 맵에 같은 아이디의 그룹레이어가 있는지
					for (var j = 0; j < mapLayers.getLength(); j++) {
						if (mapLayers.item(j).get("id") === obj.parent && mapLayers.item(j) instanceof ol.layer.Group) {
							// 있다면 구 그룹의 콜렉션과 신 그룹의 콜렉션을 비교
							var befCollection = mapLayers.item(j).getLayers();
							for (var l = 0; l < arra.length; l++) {
								var dupl = false;
								for (var k = 0; k < befCollection.getLength(); k++) {
									if (arra[l].get("id") === befCollection.item(k).get("id")) {
										dupl = true;
									}
								}
								if (!dupl) {
									newCollection.push(arra[l]);
								}
							}
							befCollection.extend(newCollection);
							var group = new ol.layer.Group({
								layers : befCollection
							});
							group.set("name", obj.refer.get_node(obj.parent).text);
							group.set("id", obj.parent);
							// group.set("type", "Group");
							that._data.geoserver.map.removeLayer(mapLayers.item(j));
							that._data.geoserver.map.addLayer(group);
							flag = false;
						}
					}
					if (flag) {
						var group = new ol.layer.Group({
							layers : arra
						});
						group.set("name", obj.refer.get_node(obj.parent).text);
						group.set("id", obj.parent);
						// group.set("type", "Group");
						that._data.geoserver.map.addLayer(group);
					}
				}
			}
		});
	};

	/**
	 * 그룹wms레이어를 트리형태로 임포트
	 * 
	 * @name $.jstree.plugins.geoserver.import_fake_group
	 * @plugin geoserver
	 * @author 소이준
	 */
	this.import_fake_group = function(obj) {
		// // =======================================
		var that = this;
		var parentLayer;
		var farr = {
			"geoLayerList" : obj.parent
		}
		console.log(JSON.stringify(farr));
		var parentParam;
		$.ajax({
			url : that._data.geoserver.groupLayerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(farr),
			beforeSend : function() { // 호출전실행
				$("body").css("cursor", "wait");
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				// parentParam = data;
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : obj.refer.get_node(data[i].name).children.toString(),
									// 'LAYERS' :
									// that._data.geoserver.user +
									// ":" + data[i].name,
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].bbox.minx.toString() + "," + data[i].bbox.miny.toString() + ","
											+ data[i].bbox.maxx.toString() + "," + data[i].bbox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});
						wms.set("name", obj.refer.get_node(data[i].name).text);
						wms.set("id", data[i].name);
						var git = {
							"validation" : false,
							"geometry" : data[i].geomType,
							"editable" : true,
							"fake" : "parent"
						}
						wms.set("git", git);
						parentLayer = wms;
						console.log(wms);
						// wms.set("type", "ImageTile");
						// that._data.geoserver.map.addLayer(wms);
					}
				}
				// =======================================
				for (var m = 0; m < data.length; m++) {
					var arr = {
						"geoLayerList" : obj.refer.get_node(data[m].name).children
					}
					var names = [];
					// console.log(JSON.stringify(arr));
					$.ajax({
						url : that._data.geoserver.layerInfoURL,
						method : "POST",
						contentType : "application/json; charset=UTF-8",
						cache : false,
						data : JSON.stringify(arr),
						beforeSend : function() { // 호출전실행
							// loadImageShow();
						},
						complete : function() {
							$("body").css("cursor", "default");
						},
						traditional : true,
						success : function(data2, textStatus, jqXHR) {
							console.log(data2);
							if (Array.isArray(data2)) {
								var arra = [];
								for (var i = 0; i < data2.length; i++) {
									var wms = new ol.layer.Tile({
										source : new ol.source.TileWMS({
											url : that._data.geoserver.getMapWMS,
											params : {
												'TIME' : Date.now(),
												'LAYERS' : data2[i].lName,
												'TILED' : true,
												'FORMAT' : 'image/png8',
												'VERSION' : '1.1.0',
												'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
												'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
												'BBOX' : data2[i].nbBox.minx.toString() + "," + data2[i].nbBox.miny.toString() + ","
														+ data2[i].nbBox.maxx.toString() + "," + data2[i].nbBox.maxy.toString()
											},
											serverType : 'geoserver'
										})
									});
									var git = {
										"validation" : false,
										"geometry" : data2[i].geomType,
										"editable" : true,
										"attribute" : data2[i].attInfo,
										"fake" : "child"
									}
									wms.set("name", obj.refer.get_node(data2[i].lName).text);
									wms.set("id", data2[i].lName);
									// wms.setVisible(false);
									console.log(wms.get("id"));
									// wms.set("type", "ImageTile");
									wms.set("git", git);
									arra.push(wms);
									console.log(wms);
								}
								var mapLayers = that._data.geoserver.map.getLayers();
								var flag = true;
								var newCollection = [];
								// 현재 맵에 같은 아이디의 타일레이어가 있는지
								for (var j = 0; j < mapLayers.getLength(); j++) {
									if (mapLayers.item(j).get("id") === obj.parent && mapLayers.item(j) instanceof ol.layer.Tile) {
										var befParams = mapLayers.item(j).getSource().getParams();
										var git = mapLayers.item(j).get("git");
										var lid = mapLayers.item(j).get("id");
										var lname = mapLayers.item(j).get("name");
										// 있다면 구 그룹의 콜렉션과 신 그룹의 콜렉션을
										// 비교
										var befCollection = mapLayers.item(j).get("git").layers;
										for (var l = 0; l < arra.length; l++) {
											var dupl = false;
											for (var k = 0; k < befCollection.getLength(); k++) {
												if (arra[l].get("id") === befCollection.item(k).get("id")) {
													dupl = true;
												}
											}
											if (!dupl) {
												newCollection.push(arra[l]);
											}
										}
										befCollection.extend(newCollection);
										var names = [];
										for (var i = 0; i < befCollection.getLength(); i++) {
											names.push(befCollection.item(i).get("id"));
										}
										befParams["LAYERS"] = names.toString();
										befParams['TIME'] = Date.now();
										// var group = new
										// ol.layer.Group({
										// layers : befCollection
										// });
										var wms2 = new ol.layer.Tile({
											source : new ol.source.TileWMS({
												url : that._data.geoserver.getMapWMS,
												params : befParams,
												serverType : 'geoserver'
											})
										});
										wms2.set("name", lname);
										wms2.set("id", lid);
										wms2.set("git", git);
										// wms.set("type", "Group");
										that._data.geoserver.map.removeLayer(mapLayers.item(j));
										that._data.geoserver.map.addLayer(wms2);
										flag = false;
										break;
									}
								}
								if (flag) {
									// var group = new
									// ol.layer.Group({
									// layers : arra
									// });
									var info = parentLayer.get("git");
									info["layers"] = new ol.Collection().extend(arra);
									console.log(parentLayer);
									that._data.geoserver.map.addLayer(parentLayer);
									// group.set("name",
									// obj.refer.get_node(obj.parent).text);
									// group.set("id", obj.parent);
									// group.set("type", "Group");
									// that._data.geoserver.map.addLayer(group);
								}
								$("body").css("cursor", "default");
							}
						}
					});
				}
			}
		});
	};

	/**
	 * 그룹wms레이어를 클라이언트로 임포트
	 * 
	 * @name $.jstree.plugins.geoserver.import_group
	 * @plugin geoserver
	 * @author 소이준
	 */
	this.import_group = function(obj) {
		var that = this;
		var arr = {
			"geoLayerList" : obj
		}
		console.log(JSON.stringify(arr));
		$.ajax({
			url : that._data.geoserver.groupLayerInfoURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			cache : false,
			data : JSON.stringify(arr),
			beforeSend : function() { // 호출전실행
				// loadImageShow();
			},
			complete : function() {
				$("body").css("cursor", "default");
			},
			traditional : true,
			success : function(data, textStatus, jqXHR) {
				console.log(data);
				if (Array.isArray(data)) {
					var arra = [];
					for (var i = 0; i < data.length; i++) {
						var wms = new ol.layer.Tile({
							source : new ol.source.TileWMS({
								url : that._data.geoserver.getMapWMS,
								params : {
									'TIME' : Date.now(),
									'LAYERS' : data[i].name,
									// 'LAYERS' :
									// that._data.geoserver.user +
									// ":" + data[i].name,
									'TILED' : true,
									'FORMAT' : 'image/png8',
									'VERSION' : '1.1.0',
									'CRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'SRS' : that._data.geoserver.map.getView().getProjection().getCode(),
									'BBOX' : data[i].bbox.minx.toString() + "," + data[i].bbox.miny.toString() + ","
											+ data[i].bbox.maxx.toString() + "," + data[i].bbox.maxy.toString()
								},
								serverType : 'geoserver'
							})
						});
						wms.set("name", data[i].name);
						wms.set("id", data[i].name);
						var git = {
							"validation" : false,
							"geometry" : data[i].geomType,
							"editable" : true
						}
						wms.set("git", git);
						// wms.set("type", "ImageTile");
						that._data.geoserver.map.addLayer(wms);
					}
				}
			}
		});
	};

};
// $.jstree.defaults.plugins.push("geoserver");
