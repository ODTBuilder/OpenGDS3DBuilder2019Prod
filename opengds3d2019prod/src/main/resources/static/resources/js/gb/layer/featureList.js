var gb;
if (!gb)
	gb = {};
if (!gb.layer)
	gb.layer = {};

(function($){
	/**
	 * feature 목록 테이블 객체를 정의한다.
	 * 
	 * @class gb.layer.FeatureList
	 * @constructor
	 * @requires {@link gb.footer.FooterBase}
	 * @memberof gb.layer
	 * @param {Object} obj - 생성자 옵션을 담은 객체
	 * @param {ol.Map} obj.map - Openlayers Map 객체
	 * @param {String} obj.wfstURL - WFS-T 요청 URL
	 * @param {String} obj.layerInfoURL - Geoserver 레이어 정보 요청 URL
	 * @param {String} obj.getFeatureURL - Geoserver 레이어 WFS 요청 URL
	 * @param {String} [obj.tableId=featureListTable] - footer content에 생성할 테이블 element의 ID
	 * @param {String|undefined} [obj.locale="en"] - 언어 코드
	 * @author KIM HOCHUL
	 * @date 2019. 03. 18
	 * @version 0.01
	 */
	gb.layer.FeatureList = function(obj) {
		obj.title = "";
		gb.footer.FooterBase.call(this, obj);
		
		var that = this;
		this.translation = {
			"notNullHint" : {
				"ko" : "빈 값이 허용되지않습니다.",
				"en" : "null values ​​are not allowed."
			},
			"intValueHint" : {
				"ko" : "정수 타입의 값을 입력해야합니다.",
				"en" : "You must enter a value for Integer type."
			},
			"doubleValueHint" : {
				"ko" : "실수 타입의 값을 입력해야합니다.",
				"en" : "You must enter a value for double type."
			},
			"boolValueHint" : {
				"ko" : "Boolean 타입의 값을 입력해야합니다.",
				"en" : "You must enter a value for boolean type."
			},
			"totalFeature" : {
				"en" : "Total number of Feature",
				"ko" : "총 객체 개수"
			},
			"saveHint" : {
				"en" : "There are changes. Do you want to save it?",
				"ko" : "변경사항이 있습니다. 저장하시겠습니까?"
			},
			"save" : {
				"en" : "Save",
				"ko" : "저장"
			},
			"wfstUrlHint" : {
				"ko" : "'wfstURL'은 필수 입력항목입니다.",
				"en" : "'wfstURL' is a required field."
			},
			"layerInfoUrlHint" : {
				"ko" : "'layerInfoURL'은 필수 입력항목입니다.",
				"en" : "'layerInfoURL' is a required field."
			},
			"getFeatureUrlHint" : {
				"ko" : "'getFeatureURL'은 필수 입력항목입니다.",
				"en" : "'getFeatureURL' is a required field."
			}
		}
		
		/**
		 * 현재 선택된 레이어의 JSTree ID
		 * @private
		 * @type {string}
		 */
		this.selectedTreeId = undefined;
		
		/**
		 * 현재 선택된 레이어
		 * @private
		 * @type {ol.layer.Base}
		 */
		this.selectedLayer = undefined;
		
		/**
		 * 현재 선택된 객체
		 * @private
		 * @type {ol.Featrue}
		 */
		this.selectedFeature = undefined;
		
		/**
		 * GetFeature 요청 파라미터 정보 객체
		 * @private
		 * @type {Object}
		 */
		this.parameters = undefined;
		
		/**
		 * scroll 막대의 Top 부분이 위치해있는 높이
		 * @private
		 * @type {number}
		 */
		this.scrollTop = undefined;
		
		/**
		 * JSTree의 treeid가 key이고 value는 feature의 속성 key값인 col, feature의 속성값인 data로 구성
		 * @private
		 * @type {Object.<string, string>}
		 */
		this.attrList = {};
		
		/**
		 * 속성값이 수정된 feature들의 집합
		 * @private
		 * @type {Object.<string, Object>}
		 */
		this.editedFeature = {};
		
		/**
		 * DataTable ID 고유번호
		 * @private
		 * @type {number}
		 */
		this.countId = 0;
		
		/**
		 * feature 요청 리스트 시작 index
		 * @private
		 * @type {number}
		 */
		this.startIndex = 0;
		
		/**
		 * feature 요청 리스트 최대 개수
		 * @private
		 * @type {number}
		 */
		this.maxFeatures = 10;
		
		this.titleAreaStyle = {
			"position": "absolute",
			"width": "100%",
			"z-index": "2",
			"padding": "8px 16px"
		};
		
		this.contentAreaStyle = {
			"height": "100%"
		};
		
		this.backgroundStyle = {
			"display": "none",
			"position": "absolute",
			"z-index": "2",
			"left": "0",
			"top": "0",
			"width": "100%",
			"height": "100%",
			"overflow": "auto",
			"background-color": "rgb(0, 0, 0)",
			"background-color": "rgba(0, 0, 0, 0.4)"
		};
			
		var options = obj || {};
		this.locale = options.locale || "en";
		this.map = options.map || undefined;
		this.wfstURL = options.wfstURL || '';
		if(!this.wfstURL){
			console.error("gb.layer.FeatureList: " + this.translation.wfstUrlHint[this.locale]);
		}
		this.layerInfoURL = options.layerInfoURL || '';
		if(!this.layerInfoURL){
			console.error("gb.layer.FeatureList: " + this.translation.layerInfoUrlHint[this.locale]);
		}
		this.getFeatureURL = options.getFeatureURL || '';
		if(!this.getFeatureURL){
			console.error("gb.layer.FeatureList: " + this.translation.getFeatureUrlHint[this.locale]);
		}
		this.tableId = options.tableId || "featureListTable";
		
		// Datatable을 적용할 테이블 element 생성
		this.tableElement = this.createTableElement();
		
		// Background 블러 처리
		this.backgroundDiv = $("<div class='gb-featurelist-background'>");
//		this.adjustStyle_(this.backgroundDiv, this.backgroundStyle);
		this.targetElement.append(this.backgroundDiv);
		
		this.dataTable = this.tableElement.DataTable({
			columns: [
				{title: 'Column1'},
				{title: 'Column2'}
			],
			data: [
				[
					'Row 1 Data 1',
					'Row 1 Data 2'
				]
			],
			info: false,
			searching: false,
			paging: false,
			scrollX: true,
			scrollY: true,
			scrollCollapse: true,
			dom: "Bfrtip",
			select: "single",
			responsive: true,
			altEditor: true,
			buttons: [{
				extend: "selected",
				text: "<i class='fas fa-edit fa-lg' style=color: #bfbfbf;'></i>",
				name: "edit"
			}]
		});
		
		this.tableElement.find("tbody > tr").css("background-color", "transparent");
		this.footerTag.find("label").css("color", "#DDD");
		
		window.addEventListener("resize", function () {
			that.onResize();
		}, false);
		
		$(document).ready(function(){
			that.onResize();
		});
		
		this.footerTag.on("footeropen", function(){
			var isEdit = gb? (gb.module ? gb.module.isEditing : undefined) : undefined;
			var tree = $('.gb-article-body.jstreeol3').length === 1 ? $('.gb-article-body.jstreeol3') : undefined;
			if(isEdit instanceof Object){
				if(isEdit.get()){
					that.close();
					isEdit.alert();
					return
				}
			}
			
			if(tree){
				var layers = tree.jstreeol3("get_selected_layer");
				if(layers.length === 1){
					that.updateFeatureList(layers[0]);
				}
			}
			
			that.onResize();
		});
		
		this.footerTag.on("footerclose", function(){
			if(!$.isEmptyObject(that.editedFeature)){
				that.openSaveModal();
			} else {
				that.tableElement = that.createTableElement();
				that.dataTable = that.tableElement.DataTable({
					columns: [
						{title: 'Column1'},
						{title: 'Column2'}
					],
					data: [
						[
							'Row 1 Data 1',
							'Row 1 Data 2'
						]
					],
					info: false,
					paging: false,
					searching: false,
					scrollX: true,
					scrollY: true,
					scrollCollapse: true
				});
				that.tableElement.find("tbody > tr").css("background-color", "transparent");
				that.footerTag.find("label").css("color", "#DDD");
			}
		});
		
		// Div style change event 추가
		var orig = $.fn.css;
		
		$.fn.css = function() {
			var result = orig.apply(this, arguments);
			$(this).trigger('stylechange');
			return result;
		}
		
		// footer tag의 css style 변경시 실행되는 이벤트 함수
		this.footerTag.on("stylechange", function(e){
			var display = this.style.display;
			
			// feature list footer tag의 display none으로 설정되면 background의 display도 none으로 변경
			if(display === "none"){
				that.backgroundDiv.css("display", "none");
			} else {
				that.backgroundDiv.css("display", "block");
			}
		});
	}
	// gb.footer.FooterBase 상속
	gb.layer.FeatureList.prototype = Object.create(gb.footer.FooterBase.prototype);
	gb.layer.FeatureList.prototype.constructor = gb.layer.FeatureList;
	
	/**
	 * 이전 테이블 element를 제거하고 새로 생성하여 반환한다.
	 * @method gb.layer.FeatureList#createTableElement
	 * @function
	 * @return {HTMLElement} 테이블 element
	 */
	gb.layer.FeatureList.prototype.createTableElement = function(){
		this.removeTableElement();
		
		var that = this;
		var num = ++this.countId;
		
		var table = $("<table>").attr("id", this.tableId + num).css("width", "100%");
		
		table.on("click", "tr", function(){
			var data = that.dataTable.row(this).data();
			if(data.length === 0){
				return;
			}
			
			if(data[0].getGeometry === undefined){
				return;
			}
			
			if(that.map !== undefined){
				that.map.getView().fit(data[0].getGeometry().getExtent(), that.map.getSize());
			}
		});
		
		this.createFooter({
			title: this.title,
			titleClass: "gb-featurelist-wrapper-title",
			content: table,
			contentClass: "gb-featurelist-wrapper-content"
		});
		
		return table;
	}
	
	/**
	 * 테이블 element를 제거한다.
	 * @method gb.layer.FeatureList#removeTableElement
	 * @function
	 */
	gb.layer.FeatureList.prototype.removeTableElement = function(){
		if(!this.tableElement){
			return;
		}
		this.tableElement.off("click", "tr");
		this.tableElement.remove();
		delete this.tableElement;
		
		$(document).off("click", "#addRowBtn");
		$(document).off("click", "#editRowBtn");
		$(document).off("click", "#deleteRowBtn");
	}
	
	/**
	 * feature list layout 생성 클릭 이벤트
	 * @method gb.layer.FeatureList#clickEvent
	 * @function
	 * @param {HTMLElement} target - Target element
	 */
	gb.layer.FeatureList.prototype.clickEvent = function(target){
		var that = this;
		$(target).click(function(){
			that.createFooter({
				title: that.title,
				content: that.tableElement,
				titleClass: "gb-featurelist-wrapper-title",
				contentClass: "gb-featurelist-wrapper-content"
			});
		});
	}
	
	/**
	 * 전체 객체 리스트 테이블 크기 재갱신
	 * @method gb.layer.FeatureList#onResize
	 * @function
	 */
	gb.layer.FeatureList.prototype.onResize = function(){
		if(!!this.dataTable){
			this.dataTable.columns.adjust().draw();
			this.resizeTbody();
		}
	}
	
	/**
	 * tbody Tag height 갱신
	 * @method gb.layer.FeatureList#resizeTbody
	 * @function
	 */
	gb.layer.FeatureList.prototype.resizeTbody = function(){
		var a = this.footerTag.find(".gb-featurelist-wrapper-content").height();
		var b = $("#" + this.tableId + this.countId + "_wrapper").find(".dt-buttons").height();
		var c = $("#" + this.tableId + this.countId + "_wrapper .dataTables_scrollHead").height();
		
		var height = a - b - c;
		
		this.footerTag.find(".gb-featurelist-wrapper-content #" + this.tableId + this.countId + "_wrapper .dataTables_scrollBody").css("max-height", height + "px");
	}
	
	/**
	 * Feature Attribute 편집 저장 여부 알림창을 생성한다.
	 * 취소 버튼 클릭 시 모든 변경사항을 무시한다.
	 * @method gb.layer.FeatureList#openSaveModal
	 * @function
	 */
	gb.layer.FeatureList.prototype.openSaveModal = function(){
		var that = this;

		var row2 = $("<div>").addClass("row").append(this.translation.saveHint[this.locale]);

		var well = $("<div>").addClass("well").append(row2);

		var closeBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-default").text("Cancel");
		var okBtn = $("<button>").css({
			"float" : "right"
		}).addClass("gb-button").addClass("gb-button-primary").text("Save");

		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn)
				.append(closeBtn);
		var modalFooter = $("<div>").append(buttonArea);

		var gBody = $("<div>").append(well).css({
			"display" : "table",
			"width" : "100%"
		});
		var openSaveModal = new gb.modal.ModalBase({
			"title" : this.translation.save[this.locale],
			"width" : 540,
			"height" : 250,
			"autoOpen" : true,
			"body" : gBody,
			"footer" : modalFooter
		});
		$(closeBtn).click(function() {
			that.attrList = {};
			that.editedFeature = {};
			openSaveModal.close();
		});
		$(okBtn).click(function() {
			that.sendWFSTTransaction(openSaveModal);
		});
	}
	
	/**
	 * 특정컬럼의 특정값을 검색한다. 검색결과만을 포함하도록 테이블 내용을 업데이트한다.
	 * @method gb.layer.FeatureList#searchTable
	 * @function
	 * @param {string} column - 컬럼명
	 * @param {string} value - 검색하려는 값
	 */
	gb.layer.FeatureList.prototype.searchTable = function(column, value){
		var that = this;
		var col = column,
			val = value,
			vectorData = {};
		var list = this.attrList;
		var treeid = this.selectedTreeId;
		var features = list[treeid].features;
		this.startIndex = 0;
		
		if(!this.parameters){
			features = list[treeid].all;
			if(val === ""){
				list[treeid].searchResults = undefined;
			} else {
				for(var i in features){
					if(features[i].get(col).includes(val)){
						vectorData[i] = features[i]
					}
				}
				list[treeid].searchResults = vectorData;
			}
			this.updateTable(treeid);
			return;
		}
		
		this.parameters.startIndex = this.startIndex;
		
		if(!val){
			this.updateFeatureList(this.selectedLayer);
		} else {
			this.parameters["cql_filter"] = encodeURI(col + " LIKE '%" + val + "%'");
			$.ajax({
				url : this.getFeatureURL,
				type : "GET",
				contentType : "application/json; charset=UTF-8",
				data : this.parameters,
				dataType : "JSON",
				success : function(errorData, textStatus, jqXHR) {
					var format = new ol.format.GeoJSON().readFeatures(JSON.stringify(errorData));
					var th = [],
						td = [],
						data = {},
						col = [];
					
					for(var i in format){
						if(!th.length){
							col = format[i].getKeys();
						}
						data[format[i].getId()] = format[i];
					}
					
					list[treeid].col = col;
					list[treeid].features = data;
					list[treeid].total = errorData.totalFeatures;
					
					that.requestLayerInfo(list[treeid].serverName, list[treeid].workspace, list[treeid].layerName, treeid);
					that.updateTable(treeid);
					
					console.log(that.parameters);
					console.log(errorData);
				},
				error: function(jqXHR, textStatus, errorThrown){
					console.log(errorThrown);
				}
			});
		}
	}
	
	/**
	 * 현재 선택된 레이어로 DataTable Table 내용 갱신
	 * @method gb.layer.FeatureList#updateTable
	 * @function
	 * @param {string} treeid - 선택한 레이어의 JSTree 노드 아이디
	 */
	gb.layer.FeatureList.prototype.updateTable = function(treeid){
		var that = this;
		this.selectedTreeId = treeid;
		
		var layer = that.selectedLayer;
		var git = layer.get("git") || {};
		var attribute = git.attribute;
		var opt = {};
		
		for(var i = 0; i < attribute.length; i++){
			opt[attribute[i].fieldName] = {};
			opt[attribute[i].fieldName].unique = attribute[i].isUnique || false;
			opt[attribute[i].fieldName].nullable = attribute[i].nullable || false;
			opt[attribute[i].fieldName].type = attribute[i].type || "String";
		}
		
		var col = this.attrList[treeid].col;
		var features;
		if(!this.attrList[treeid].searchResults){
			features = this.attrList[treeid].features;
		} else {
			features = this.attrList[treeid].searchResults;
		}
		var column = [],
			data= [];
		var select = $("<select>").addClass("gb-form").addClass("gb-featurelist-form");
		var icon = $("<i>").addClass("fas fa-search fa-lg");
		var button = $("<button>").addClass("gb-button gb-button-primary").css({
			"float": "right"
		}).append(icon);
		var input = $("<input>").addClass("gb-featurelist-input");
		
		button.click(function(e){
			that.searchTable(select.find("option:selected").val(), input.val());
		});
		
		input.keypress(function(e){
			if(e.which == 13){
				that.searchTable(select.find("option:selected").val(), input.val());
			}
		});
		
		var pattern, errorMsg;
		for(var i = 0; i < col.length; i++){
			if(col[i] === "geometry"){
				column.push({
					title: col[i],
					visible: false,
					type: "hidden"
				});
			} else {
				if(opt[col[i]].type === "Integer" || opt[col[i]].type === "Number" || opt[col[i]].type === "Long"){
					errorMsg = this.translation.intValueHint[this.locale];
					if(opt[col[i]].nullable){
						pattern = "^-?[0-9]*$";
					} else {
						pattern = "^-?[0-9]+$";
						errorMsg += "\n" + this.translation.notNullHint[this.locale];
					}
					
				} else if(opt[col[i]].type === "Double"){
					errorMsg = this.translation.doubleValueHint[this.locale];
					if(opt[col[i]].nullable){
						pattern = "^([-+]?[0-9]*\.?[0-9]+)*$";
					} else {
						pattern = "^([-+]?[0-9]*\.?[0-9]+)+$";
						errorMsg += "\n" + this.translation.notNullHint[this.locale];
					}
				} else if(opt[col[i]].type === "Boolean"){
					if(opt[col[i]].nullable){
						pattern = "^true|false$";
					} else {
						pattern = "^(true|false)*$";
					}
					errorMsg = this.translation.boolValueHint[this.locale];
				} else {
					if(opt[col[i]].nullable){
						pattern = ".*";
					} else {
						pattern = ".+";
						errorMsg = this.translation.notNullHint[this.locale];
					}
				}
				column.push({
					title: col[i],
					pattern: pattern,
					errorMsg: errorMsg
				});
				
				select.append($("<option>").val(col[i]).text(col[i]));
			}
		}
		
		if(col.length === 0){
			column.push({
				title: "No Data"
			});
			data.push(["No Data"]);
		}
		
		for(var id in features){
			var arr = [];
			for(var i = 0; i < col.length; i++){
				if(col[i] === "geometry"){
					arr.push(features[id]);
				} else {
					arr.push(features[id].get(col[i]));
				}
			}
			data.push(arr);
		}
		
		this.dataTable.clear();
		this.dataTable.destroy();
		delete this.dataTable;
		this.tableElement = this.createTableElement();
		
		this.dataTable = this.tableElement.DataTable({
			columns: column,
			data: data,
			info: false,
			searching: false,
			paging: false,
			scrollX: true,
			scrollY: "100%",
			scrollCollapse: true,
			dom: "Bfrtip",
			select: "single",
			responsive: false,
			altEditor: true,
			buttons: [{
				extend: "selected",
				text: "<i class='fas fa-edit fa-lg' style=color: #bfbfbf;'></i>",
				name: "edit"
			}
			/*{
				extend: "selected",
				text: "Delete",
				name: "delete"
			}*/],
			onEditRow: function(datatable, rowdata, success, error){
				var feature, keys;
				for(var i in rowdata){
					if(rowdata[i] instanceof ol.Feature){
						feature = rowdata[i];
						keys = rowdata[i].getKeys();
						continue;
					}
					
					if(feature instanceof ol.Feature){
						feature.set(keys[i], rowdata[i]);
					}
				}
				
				if(!(feature instanceof ol.Feature)){
					return;
				}
				
				var layerInfo = that.attrList[that.selectedTreeId];
				var geomKey = that.attrList[that.selectedTreeId].geomKey;
				
				if(!!geomKey){
					feature.setGeometryName(geomKey);
					feature.set(geomKey, feature.get("geometry"));
				}
				
				if(layerInfo.serverName){
					if(!that.editedFeature[that.selectedTreeId]){
						that.editedFeature[that.selectedTreeId] = {};
						that.editedFeature[that.selectedTreeId].serverName = layerInfo.serverName;
						that.editedFeature[that.selectedTreeId].workspace = layerInfo.workspace;
						that.editedFeature[that.selectedTreeId].layerName = layerInfo.layerName;
					}
					
					that.editedFeature[that.selectedTreeId].feature = feature;
				}
				
				success(rowdata);
			}
		});
		var statisticVal = $("<div>").html(this.attrList[treeid].total).addClass("gb-featurelist-statistic-val");
		var statisticLabel = $("<div>").html(this.translation.totalFeature[this.locale]).addClass("gb-featurelist-statistic-label");
		var statistic = $("<div>").append(statisticLabel).append(statisticVal).addClass("gb-featurelist-statistic");
		this.footerTag.find(".dt-buttons").css({"z-index": "3"});
		this.footerTag.find(".gb-featurelist-wrapper-title").empty();
		this.footerTag.find(".gb-featurelist-wrapper-title").append(button).append(input).append(select).append(statistic);
		
		$("#" + this.tableId + this.countId).parent().scroll(function(){
			if($(this).scrollTop() + $(this)[0].clientHeight == $(this).children(":first").height()){
				if(that.scrollTop !== $(this).scrollTop()){
					that.scrollTop = $(this).scrollTop();
					that.nextFeatureList();
				}
			}
		});
		
		this.tableElement.find("tbody > tr").css("background-color", "transparent");
		this.footerTag.find("label").css("color", "#DDD");
		this.onResize();
	}
	
	/**
	 * 인자값으로 주어진 레이어의 정보로 테이블 내용 업데이트
	 * @method gb.layer.FeatureList#updateFeatureList
	 * @function
	 * @param {ol.layer.Base} layer - 갱신할 레이어 객체
	 */
	gb.layer.FeatureList.prototype.updateFeatureList = function(layer){
		this.startIndex = 0;
		this.scrollTop = 0;
		
		this.contentTag
			.append(
				$("<div id='feature-list-loading'>")
					.addClass("gb-body-loading")
					.append(
						$("<i>")
							.addClass("fas fa-spinner fa-spin fa-5x")
							.addClass("gb-body-loading-icon")
					)
			);
		
		var options = layer.get("git") || {};
		
		var list = this.attrList;
		
		var treeid = layer.get("treeid");
		
		this.selectedLayer = layer;
		this.parameters = undefined;
		
		if(layer instanceof ol.layer.Vector){
			var data = [],
				paging = {},
				col = [],
				count = 0,
				features = layer.getSource().getFeatures();
			
			list[treeid] = {};
			
			for(var i in features){
				if(!col.length){
					col = features[i].getKeys();
					list[treeid].geomKey = features[i].getGeometryName();
				}
				data.push(features[i]);
				if(count < this.maxFeatures){
					paging[features[i].getId()] = features[i];
				}
				count++;
			}
			list[treeid].col = col;
			list[treeid].features = paging;
			list[treeid].all = data;
			list[treeid].total = data.length;
			this.updateTable(treeid);
			$("#feature-list-loading").remove();
			return;
		}
		
		/*if(!!this.attrList[treeid]){
			this.updateTable(treeid);
			return;
		}*/
		
		var geoserver = options.geoserver;
		if(!geoserver){
			console.error('gb.layer.FeatureList: geoserver name is required');
			return;
		}
		
		var workspace = options.workspace;
		if(!workspace){
			console.error('gb.layer.FeatureList: workspace name is required');
			return;
		}
		
		var layerName = layer.get("name");
		if(!layerName){
			console.error('gb.layer.FeatureList: layer name is required');
			return;
		}
		
		this.parameters = {
			"serverName": geoserver,
			"workspace": workspace,
			"version" : gb.module.serviceVersion.WFS,
			"typeName" : layerName,
			"outputformat" : "application/json",
			"maxFeatures": this.maxFeatures,
			"startIndex": this.startIndex
		};

		var that = this;
		$.ajax({
			url : this.getFeatureURL,
			type : "GET",
			contentType : "application/json; charset=UTF-8",
			data : this.parameters,
			dataType : "JSON",
			success : function(errorData, textStatus, jqXHR) {
				var format = new ol.format.GeoJSON().readFeatures(JSON.stringify(errorData));
				var th = [],
					td = [],
					data = {},
					col = [];
				
				for(var i in format){
					if(!th.length){
						col = format[i].getKeys();
					}
					data[format[i].getId()] = format[i];
				}
				
				list[treeid] = {};
				list[treeid].serverName = geoserver;
				list[treeid].workspace = workspace;
				list[treeid].layerName = layerName;
				list[treeid].col = col;
				list[treeid].features = data;
				list[treeid].total = errorData.totalFeatures;
				
				that.requestLayerInfo(geoserver, workspace, layerName, treeid);
				that.updateTable(treeid);
				$("#feature-list-loading").remove();
				//that.setTitle(layerName);
			},
			error: function(jqXHR, textStatus, errorThrown){
				$("#feature-list-loading").remove();
				console.log(errorThrown);
			}
		});
	}
	
	/**
	 * 테이블 데이터 페이징 처리
	 * @method gb.layer.FeatureList#nextFeatureList
	 * @function
	 */
	gb.layer.FeatureList.prototype.nextFeatureList = function(){
		var that = this;
		this.startIndex = this.startIndex + this.maxFeatures;
		var list = this.attrList;
		
		this.contentTag
		.append(
			$("<div id='feature-list-loading'>")
				.addClass("gb-body-loading")
				.append(
					$("<i>")
						.addClass("fas fa-spinner fa-spin fa-5x")
						.addClass("gb-body-loading-icon")
				)
		);
		
		if(!this.parameters){
			var all = list[this.selectedTreeId].all,
				data = [];
			var props;
			
			if(this.startIndex > all.length){
				return;
			}
			
			for(var i = this.startIndex; i < this.startIndex + this.maxFeatures; i++){
				if(i >= all.length){
					break;
				}
				var arr = [];
				props = all[i].getProperties();
				for(var j in props){
					if(j === "geometry"){
						arr.push(all[i]);
					} else {
						arr.push(props[j]);
					}
				}
				data.push(arr);
			}
			
			this.dataTable.rows.add(data).draw();
			this.tableElement.find("tbody > tr").css("background-color", "transparent");
			this.footerTag.find("label").css("color", "#DDD");
			$("#" + this.tableId + this.countId).parent().scrollTop(this.scrollTop);
			$("#feature-list-loading").remove();
			return;
		}
		
		this.parameters.startIndex = this.startIndex;
		
		$.ajax({
			url : this.getFeatureURL,
			type : "GET",
			contentType : "application/json; charset=UTF-8",
			data : this.parameters,
			dataType : "JSON",
			success : function(errorData, textStatus, jqXHR) {
				var format = new ol.format.GeoJSON().readFeatures(JSON.stringify(errorData));
				var data = [],
					features = {},
					col = [];
				
				for(var i in format){
					if(!col.length){
						col = format[i].getKeys();
					}
					features[format[i].getId()] = format[i];
				}
				
				for(var id in features){
					var arr = [];
					for(var i = 0; i < col.length; i++){
						if(col[i] === "geometry"){
							arr.push(features[id]);
						} else {
							arr.push(features[id].get(col[i]));
						}
					}
					data.push(arr);
					
				}
				
				that.dataTable.rows.add(data).draw();
				that.tableElement.find("tbody > tr").css("background-color", "transparent");
				that.footerTag.find("label").css("color", "#DDD");
				$("#" + that.tableId + that.countId).parent().scrollTop(that.scrollTop);
				$("#feature-list-loading").remove();
			},
			error: function(jqXHR, textStatus, errorThrown){
				$("#feature-list-loading").remove();
				console.log(errorThrown);
			}
		});
	}
	
	/**
	 * 레이어의 Geometry Key 정보를 요청한다
	 * @method gb.layer.FeatureList#requestLayerInfo
	 * @function
	 * @param {string} serverName - 서버 이름
	 * @param {string} workspace - 작업공간 이름
	 * @param {string} layer - 레이어 이름
	 * @param {string} treeid - JSTree 노드 아이디
	 */
	gb.layer.FeatureList.prototype.requestLayerInfo = function(serverName, workspace, layer, treeid){
		var list = this.attrList;
		var treeid = treeid;
		var a = {
			serverName: serverName,
			workspace: workspace,
			geoLayerList: [layer]
		};
		
		$.ajax({
			method : "POST",
			url: this.layerInfoURL,
			data: JSON.stringify(a),
			contentType: 'application/json; charset=utf-8',
			success: function(data, textStatus, jqXHR) {
				var geomKey = data[0].geomkey;
				list[treeid].geomKey = geomKey;
			},
			error: function(e) {
				var errorMsg = e? (e.status + ' ' + e.statusText) : "";
				console.log(errorMsg);
			},
		});
	}
	
	/**
	 * 레이어의 속성 변경사항을 저장 요청한다
	 * @method gb.layer.FeatureList#sendWFSTTransaction
	 * @function
	 * @param {gb.modal.ModalBase} openSaveModal - 요청 성공 시 닫아야할 modal 객체
	 */
	gb.layer.FeatureList.prototype.sendWFSTTransaction = function(openSaveModal){
		var featureInfo = this.editedFeature;
		var format = new ol.format.WFS();
		var node, param;
		var modal = openSaveModal;
		
		for(var treeid in featureInfo){
			node = format.writeTransaction(null, [featureInfo[treeid].feature], null, {
				"featureNS": featureInfo[treeid].workspace,
				"featurePrefix": featureInfo[treeid].workspace,
				"featureType": featureInfo[treeid].layerName,
				"version": gb.module.serviceVersion.WFS
			});
			
			param = {
				"serverName": featureInfo[treeid].serverName,
				"workspace": featureInfo[treeid].workspace,
				"wfstXml": new XMLSerializer().serializeToString(node)
			}
			
			$.ajax({
				type: "POST",
				url: this.wfstURL,
				data: JSON.stringify(param),
				contentType: 'application/json; charset=utf-8',
				success: function(data) {
					var result = format.readTransactionResponse(data);
					modal.close();
				},
				error: function(e) {
					var errorMsg = e? (e.status + ' ' + e.statusText) : "";
					console.log(errorMsg);
				},
				context: this
			});
		}
	}
}(jQuery));