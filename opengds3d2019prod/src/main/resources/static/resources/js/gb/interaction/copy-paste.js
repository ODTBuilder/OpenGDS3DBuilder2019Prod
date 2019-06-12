var gb;
if (!gb)
	gb = {};
if (!gb.interaction)
	gb.interaction = {};

/**
 * @classdesc
 * Copy, Paste 기능 Class. Shift+C 또는 Shift+Y 키이벤트를 통해 Copy, Paste 기능을 실행할 수 있다.
 * @example
 * var source = ol.source.Vector({
 * 	format: new ol.format.GeoJSON()
 * });
 * 
 * var sources = new ol.Collection();
 * sources.push(source);
 * 
 * var map = new ol.Map({
 * 	target: "mapDiv",
 * 	layers: [new ol.layer.VectorLayer({
 * 		source: source
 * 	})],
 * 	view: new ol.View({
 * 		center: [0, 0],
 * 		zoom: 2
 * 	})
 * });
 * 
 * var select = new ol.interaction.Select();
 * map.addInteraction(select);
 * 
 * var copypaste = new gb.interaction.Copypaste({
 * 	features: select.getFeatures(),
 * 	sources: sources
 * });
 * map.addInteraction(copypaste);
 * @class gb.interaction.Copypaste
 * @memberof gb.interaction
 * @param {Object} obj - gb.interaction.Copypaste 생성 기본 옵션
 * @param {ol.Collection.<ol.Feature>} obj.features - 선택된 feature들의 집합
 * @param {ol.Collection.<ol.source.Vector>} obj.sources - 선택된 Vector Source들의 집합
 * @param {gb.edit.FeatureRecord} [obj.featureRecord] - feature 편집 이력 관리 객체
 * @extends {ol.interaction.Interaction}
 * @author KIM HOCHUL
 * @date 2019. 03. 25
 * @version 0.01
 */
gb.interaction.Copypaste = function(obj) {
	
	ol.interaction.Interaction.call(this, {
		handleEvent: gb.interaction.Copypaste.prototype.handleEvent
	});
	
	var that = this;
	
	/**
	 * 선택된 features
	 * @type {ol.Collection.<ol.Feature>}
	 * @private
	 */
	this.clipboard_ = new ol.Collection();
	
	var options = obj || {};
	this.features_ = options.features;
	if(!(this.features_ instanceof ol.Collection)){
		console.error("gb.interaction.Copypaste: 'features' is a required field.");
	}
	this.sources_ = options.sources;
	if(!(this.sources_ instanceof ol.Collection)){
		console.error("gb.interaction.Copypaste: 'sources' is a required field.");
	}
	this.record_ = options.featureRecord;
	
	this.setActive(true);
	
	// Shift+C, Shift+V Key Event 생성
	$(window).keypress(function(e){
		if(!that.getActive()){
			return;
		}
		
		if((e.keyCode === 67 || e.which === 67) && e.shiftKey){
			// Shift+C
			that.clip();
			console.log("clip");
		} else if((e.keyCode === 86 || e.which === 86) && e.shiftKey){
			// Shift+V
			that.paste();
			console.log("paste");
		}
	});
}
ol.inherits(gb.interaction.Copypaste, ol.interaction.Interaction);

gb.interaction.Copypaste.prototype.handleEvent = function(evt) {
	return true;
}

/**
 * copy. 현재 선택된 feature 저장
 * @method gb.interaction.Copypaste#clip
 * @function
 * @return {ol.Collection.<ol.Feature>}
 */
gb.interaction.Copypaste.prototype.clip = function(){
	var that = this;
	this.clipboard_.clear();
	this.features_.forEach(function(feature){
		that.clipboard_.push(feature);
	});
	return this.clipboard_;
}

/**
 * paste. 현재 저장된 feature들을 복사하여 선택된 layer의 Vector Source에 추가
 * @method gb.interaction.Copypaste#paste
 * @function
 */
gb.interaction.Copypaste.prototype.paste = function(){
	var vectorSource = this.sources_.item(0);
	var arr = this.clipboard_.getArray();
	var feature;
	for(var i in arr){
		if(arr[i] instanceof ol.Feature &&
				vectorSource instanceof ol.source.Vector){
			if(this.record_ instanceof gb.edit.FeatureRecord){
				feature = arr[i].clone();
				feature.setId(gb.interaction.Copypaste.createFeatureId(vectorSource));
				this.record_.create(vectorSource.get("git").tempLayer, feature);
				vectorSource.addFeature(feature);
			}
		}
	}
}

/**
 * 복사될 Feature의 아이디를 새로 생성한다.
 * @method gb.interaction.Copypaste#createFeatureId
 * @function
 * @param {ol.source.Vector} source - Feature ID를 생성할 vector source
 * @return {String} Feature 아이디
 */
gb.interaction.Copypaste.createFeatureId = function(source){
	var vectorSource = source;
	var features = vectorSource.getFeatures();
	var count = 0;
	var newId = source.get("git") ? source.get("git").layerID + ".new" :
		source.ol_uid + ".new";
	var ids = [];
	
	features.forEach(function(feature){
		ids.push(feature.getId());
	});
	
	while(ids.indexOf(newId + count) !== -1){
		count++;
	}
	
	newId += count;
	return newId;
}