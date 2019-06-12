var gb;
if (!gb)
	gb = {};
if (!gb.layer)
	gb.layer = {};

/**
 * @classdesc
 * Layer Navigator. 레이어의 객체를 추적한다.
 * @class gb.layer.Navigator
 * @memberof gb.layer
 * @constructor
 * @param {Object} obj - gb.layer.Navigator 생성 옵션
 * @param {ol.Map} obj.map - 기능을 적용할 Openlayers Map 객체
 * @param {string} [obj.token] - 요청 인증 토큰
 * @param {string} obj.getWFSFeature - Geoserver 레이어 WFS 요청 URL
 * @author KIM HOCHUL
 * @date 2019. 03. 25
 * @version 0.01
 */
gb.layer.Navigator = function(obj) {
	this.featureList = undefined;
	
	this.count = 0;
	
	/**
	 * feature 요청 리스트 최대 개수
	 */
	this.maxFeatures = 1;
	
	/**
	 * 현재 선택된 레이어
	 */
	this.selectedLayer = undefined;
	
	this.td2 = $("<div>").css({
		"display" : "inline-block"
	});
	
	this.tbody = $("<tbody>");
	
	this.naviWindow = $("<div>").addClass("gb-navigator-window");
	
	var options = obj;
	this.map = options.map || false;
	if(!this.map){
		console.error("gb.layer.Navigator: 'map' is required field");
		return null;
	}
	this.token = options.token || "";
	this.getWFSFeature = options.getWFSFeature || false;
	if(!this.getWFSFeature){
		console.error("gb.layer.Navigator: 'getWFSFeature' is required field");
		return null;
	}
	
	// Navigator 창 생성
	this.createNavigator_();
}

/**
 * 객체 추적 기능을 적용할 레이어 객체를 설정한다.
 * @method gb.layer.Navigator#setFeatures
 * @function
 * @param {ol.layer.Layer} Layer - 객체 추적 기능을 적용할 레이어 객체
 */
gb.layer.Navigator.prototype.setFeatures = function(Layer){
	var layer = Layer;
	this.count = 0;
	
	if(layer instanceof ol.layer.Tile){
		var git = layer.get("git");
		this.requestFeatureList(git.geoserver, git.workspace, layer.get("name"));
	} else if(layer instanceof ol.layer.Vector){
		this.featureList = layer.getSource().getFeatures();
		this.updateNavigator();
	} else {
		console.error("Not supported layer type");
		return;
	}
	
	
	this.selectedLayer = layer;
}

/**
 * Geoserver에 WFS를 요청한다. 요청 성공 시 네비게이터창이 생성된다.
 * @method gb.layer.Navigator#requestFeatureList
 * @function
 * @param {ol.layer.Layer} Layer - 객체 추적 기능을 적용할 레이어 객체
 */
gb.layer.Navigator.prototype.requestFeatureList = function(serverName, workspace, layer){
	var that = this;
	var a = {
		serverName: serverName,
		workspace: workspace,
		typeName: layer,
		version: gb.module.serviceVersion.WFS || "1.0.0",
		outputformat: "application/json",
		maxFeatures: this.maxFeatures,
		startIndex: this.count
	};
	
	$.ajax({
		url: this.getWFSFeature + this.token,
		type : "GET",
		contentType : "application/json; charset=UTF-8",
		data: a,
		dataType: "JSON",
		beforeSend : function() {
			that.naviWindow.append(
				$("<div id='navigator-loading'>")
					.addClass("gb-body-loading")
					.append(
						$("<i>")
							.addClass("fas fa-spinner fa-spin fa-5x").addClass("gb-body-loading-icon")
					)
			);
		},
		complete : function() {
			$("#navigator-loading").remove();
		},
		success: function(data, textStatus, jqXHR) {
			if(that.count === data.totalFeatures){
				// count 변수가 Feature 총 개수와 같다면 count를 1 줄이고 작업을 중단함
				that.count = data.totalFeatures - 1;
				return;
			}
			
			that.featureList = new ol.format.GeoJSON().readFeatures(JSON.stringify(data));
			// 네비게이터창 생성
			that.showFeatureInfo(that.featureList[0]);
			that.open();
		},
		error: function(e) {
			var errorMsg = e? (e.status + ' ' + e.statusText) : "";
			console.log(errorMsg);
		},
	});
}

/**
 * Feature 목록을 업데이트 한다. 선택된 레이어가 Vector 레이어일 경우에 실행하는 함수.
 * @method gb.layer.Navigator#updateNavigator
 * @function
 * @private
 */
gb.layer.Navigator.prototype.updateNavigator = function(){
	var features = this.featureList;
	this.count = 0;
	this.showFeatureInfo(features[this.count]);
	this.open();
}

/**
 * Body Tag에 네비게이터창을 생성한다.
 * @method gb.layer.Navigator#createNavigator_
 * @function
 * @private
 */
gb.layer.Navigator.prototype.createNavigator_ = function(){
	var that = this;
	var prevIcon = $("<span>").addClass("glyphicon").addClass("glyphicon-backward"),
		nextIcon = $("<span>").addClass("glyphicon").addClass("glyphicon-forward");
	
	var btnPrev = 
			$("<button>")
				.addClass("gb-navigator-prev")
				.addClass("btn").addClass("btn-default")
				.append(prevIcon), 
		btnNext = 
			$("<button>")
			.addClass("gb-navigator-next")
			.addClass("btn").addClass("btn-default").append(nextIcon);
	
	$(document).on("click", ".gb-navigator-prev", function() {
		that.prev();
	});
	
	$(document).on("click", ".gb-navigator-next", function() {
		that.next();
	});
	
	var td1 = $("<div>").css({
		"width" : "100px",
		"display" : "inline-block"
	}).append(btnPrev), td3 = $("<div>").css({
		"width" : "100px",
		"display" : "inline-block"
	}).append(btnNext);
	var tr1 = $("<div>").addClass("text-center").append(td1).append(this.td2).append(td3);
	var thead = $("<div>").css({
		"margin-bottom" : "10px"
	}).append(tr1);
	var xSpan = $("<span>").attr({
		"aria-hidden" : "true"
	}).append("&times;");
	var xBtn = $("<button>").click(function() {
		$(that.naviWindow).hide();
	}).attr({
		"data-dismiss" : "modal",
		"aria-label" : "Close"
	}).addClass("gb-navigator-close-btn").append(xSpan);

	var title = $("<span>").text("Feature Navigator");
	var tb = $("<table>").addClass("table").append(this.tbody);
	var pbd = $("<div>").addClass("panel-body").css({
		"max-height" : "500px",
		"overflow" : "auto"
	}).append(thead).append(tb);
	var phd = $("<div>").addClass("panel-heading").append(title).append(xBtn);
	var pdf = $("<div>").addClass("panel").addClass("panel-default").append(phd).append(pbd);
	this.naviWindow.append(pdf);

	$("body").append(this.naviWindow);
	$(this.naviWindow).hide();
}

/**
 * 네비게이터창을 연다.
 * @method gb.layer.Navigator#open
 * @function
 */
gb.layer.Navigator.prototype.open = function(){
	$(this.naviWindow).show();
}

/**
 * 네비게이터창을 닫는다.
 * @method gb.layer.Navigator#close
 * @function
 */
gb.layer.Navigator.prototype.close = function(){
	$(this.naviWindow).hide();
}

/**
 * 선택된 Feature의 세부정보 테이블을 네비게이터창에 생성하고 맵을 Feature가 위치한 곳으로 이동시킨다.
 * @method gb.layer.Navigator#showFeatureInfo
 * @function
 * @param {ol.Feature} feature - Feature 세부정보창에 보여질 객체
 */
gb.layer.Navigator.prototype.showFeatureInfo = function(feature) {
	if(!(feature instanceof ol.Feature)){
		console.error("gb.layer.Navigator#showFeatureInfo: type error(ol.Feature)");
		return;
	}
	var fid = feature.getId();
	$(this.td2).text(fid);
	var prop = feature.getProperties();
	var keys = Object.keys(prop);
	$(this.tbody).empty();
	for (var i = 0; i < keys.length; i++) {
		if(prop[keys[i]] instanceof Object){
			continue;
		}
		var td1 = $("<td>").text(keys[i]);
		var td2 = $("<td>").attr("colspan", 2).text(prop[keys[i]]);
		var tr1 = $("<tr>").append(td1).append(td2);
		$(this.tbody).append(tr1);
	}
	var geom = feature.getGeometry();
	this.map.getView().fit(geom.getExtent(), this.map.getSize());
}

/**
 * 이전 객체를 불러온다. count 변수가 1 줄어든다.
 * @method gb.layer.Navigator#prev
 * @function
 */
gb.layer.Navigator.prototype.prev = function(){
	var features = this.featureList;
	
	// Tile 레이어일 때는 이전 객체를 Geoserver에 요청, Vector 레이어 일때는 Feature 목록에서 이전 객체를 불러옴
	if(this.selectedLayer instanceof ol.layer.Tile){
		var git = this.selectedLayer.get("git");
		if(this.count > 0){
			this.count--;
			this.requestFeatureList(git.geoserver, git.workspace, this.selectedLayer.get("name"));
		}
	} else if(this.selectedLayer instanceof ol.layer.Vector){
		if (this.count > 0 && this.count <= features.length) {
			this.count--;
		} else {
			return;
		}
		
		if (features[this.count]) {
			this.showFeatureInfo(features[this.count]);
		}
	} else {
		console.error("Not supported layer type");
		return;
	}
}

/**
 * 다음 객체를 불러온다. count 변수가 1 증가한다.
 * @method gb.layer.Navigator#prev
 * @function
 */
gb.layer.Navigator.prototype.next = function(){
	var features = this.featureList;
	
	// Tile 레이어일 때는 다음 객체를 Geoserver에 요청, Vector 레이어 일때는 Feature 목록에서 다음 객체를 불러옴
	if(this.selectedLayer instanceof ol.layer.Tile){
		var git = this.selectedLayer.get("git");
		this.count++;
		this.requestFeatureList(git.geoserver, git.workspace, this.selectedLayer.get("name"));
	} else if(this.selectedLayer instanceof ol.layer.Vector){
		if (this.count >= 0 && this.count < features.length) {
			this.count++;
		} else {
			return;
		}
		
		if (features[this.count]) {
			this.showFeatureInfo(features[this.count]);
		}
	} else {
		console.error("Not supported layer type");
		return;
	}
}
