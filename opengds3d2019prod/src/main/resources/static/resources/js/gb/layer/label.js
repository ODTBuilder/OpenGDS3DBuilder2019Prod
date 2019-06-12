var gb;
if (!gb)
	gb = {};
if (!gb.layer)
	gb.layer = {};

(function($){
	/**
	 * 레이어 라벨 기능. 레이어의 속성값 중 하나를 선택하여 라벨을 표시한다.
	 * Vector 레이어에 대해서만 적용 가능.
	 * @class gb.layer.Label
	 * @memberof gb.layer
	 * @constructor
	 * @param {Object} obj - gb.layer.Label 생성 옵션
	 * @param {ol.layer.Vector} obj.layer - 기능을 적용할 레이어 객체
	 * @param {Object} obj.labelOptions - 라벨 옵션
	 * @param {string} [obj.labelOptions.attribute="errName"] - 속성 컬럼명
	 * @param {string} [obj.labelOptions.align="center"] - 좌우 텍스트 정렬
	 * @param {string} [obj.labelOptions.baseline="middle"] - 상하 텍스트 정렬
	 * @param {string|number} [obj.labelOptions.size="12px"] - 텍스트 크기
	 * @param {string|number} [obj.labelOptions.offsetX=0] - x좌표 여백
	 * @param {string|number} [obj.labelOptions.offsetY=0] - y좌표 여백
	 * @param {string} [obj.labelOptions.weight="normal"] - 텍스트 굵기('Bold' or 'normal')
	 * @param {string} [obj.labelOptions.placement="point"] - 텍스트 위치('Point' or 'Line')
	 * @param {string|number} [obj.labelOptions.maxAngle="0.7853981633974483"] - 텍스트 꺽임 허용 범위
	 * @param {boolean} [obj.labelOptions.overflow=true] - 텍스트 객체 범위 벗어남 허용
	 * @param {string|number} [obj.labelOptions.rotation="0"] - 텍스트 회전
	 * @param {string} [obj.labelOptions.fillColor="blue"] - 텍스트 색상(hex code 사용 가능)
	 * @param {string} [obj.labelOptions.outlineColor="#ffffff"] - 텍스트 테두리 색상
	 * @param {string|number} [obj.labelOptions.outlineWidth=3] - 텍스트 테두리 넓이
	 * @param {number} [obj.labelOptions.maxResolution=1200] - 줌 레벨에 따른 라벨 가시화 여부(작게 설정할 수록 맵을 더 확대해야 라벨이 보임)
	 * @author KIM HOCHUL
	 * @date 2019. 03. 25
	 * @version 0.01
	 */
	gb.layer.Label = function(obj){
		var that = this;
		var options = obj;
		
		var layer = options.layer || undefined;
		if(!(layer instanceof ol.layer.Vector)){
			return;
		}
		
		var labelOptions = obj.labelOptions;
		
		var git = layer.get("git");
		
		this.style = layer.getStyle();
		
		if(this.style instanceof Function){
			this.style = this.style();
		}
		
		this.labelOptions = {};
		this.labelOptions.attribute = labelOptions.attribute || "errName";
		this.labelOptions.align = labelOptions.align || "center";
		this.labelOptions.baseline = labelOptions.baseline || "middle";
		this.labelOptions.size = labelOptions.size || "12px";
		this.labelOptions.offsetX = parseInt((labelOptions.offsetX || "0"), 10);
		this.labelOptions.offsetY = parseInt((labelOptions.offsetY || "0"), 10);
		this.labelOptions.weight = labelOptions.weight || "normal";
		this.labelOptions.placement = labelOptions.placement || "point";
		this.labelOptions.maxAngle = parseFloat(labelOptions.maxAngle || "0.7853981633974483");
		this.labelOptions.overflow = labelOptions.overflow || true;
		this.labelOptions.rotation = parseFloat(labelOptions.rotation || "0");
		this.labelOptions.font = this.labelOptions.weight + " " + this.labelOptions.size + " " + (labelOptions.font || "Arial");
		this.labelOptions.fillColor = labelOptions.fillColor || "blue";
		this.labelOptions.outlineColor = labelOptions.outlineColor || "#ffffff";
		this.labelOptions.outlineWidth = parseInt((labelOptions.outlineWidth || "3"), 10);
		this.labelOptions.maxResolution = labelOptions.maxResolution || 1200;
		
		var func = function(feature, resolution){
			that.style.setText(that.createTextStyle(feature, resolution));
			return that.style;
		}
		
		return func;
	}
	
	/**
	 * Feature에서 특정 속성 컬럼의 값을 반환한다.
	 * @method gb.layer.Label#getText
	 * @function
	 * @param {ol.Feature} feature - 속성값을 가져올 객체
	 * @param {number} resolution - 현재 맵의 줌 레벨
	 * @return {string} 속성값
	 */
	gb.layer.Label.prototype.getText = function(feature, resolution){
		var props = feature instanceof ol.Feature ? feature.getProperties() : undefined;
		
		var text;
		
		if(props instanceof Object){
			text = props[this.labelOptions.attribute] + "";
		} else {
			text = '';
		}
		
		if(resolution > this.labelOptions.maxResolution){
			text = '';
		}
		
		text = stringDivider(text, 16, '\n');

		return text;
	};
	
	/**
	 * 설정한 label 스타일 옵션이 적용된 ol.style.Text 객체를 반환한다.
	 * @method gb.layer.Label#createTextStyle
	 * @function
	 * @param {ol.Feature} feature - 속성값을 가져올 객체
	 * @param {number} resolution - 현재 맵의 줌 레벨
	 * @return {ol.style.Text}
	 */
	gb.layer.Label.prototype.createTextStyle = function (feature, resolution) {
		return new ol.style.Text({
			textAlign: this.labelOptions.align == '' ? undefined : this.labelOptions.align,
			textBaseline: this.labelOptions.baseline,
			font: this.labelOptions.font,
			text: this.getText(feature, resolution),
			fill: new ol.style.Fill({color: this.labelOptions.fillColor}),
			stroke: new ol.style.Stroke({color: this.labelOptions.outlineColor, width: this.labelOptions.outlineWidth}),
			offsetX: this.labelOptions.offsetX,
			offsetY: this.labelOptions.offsetY,
			placement: this.labelOptions.placement,
			maxAngle: this.labelOptions.maxAngle,
			overflow: this.labelOptions.overflow,
			rotation: this.labelOptions.rotation
		});
	};

	/**
	 * 텍스트 유효성 체크 및 변환
	 * 참조: {@link http://stackoverflow.com/questions/14484787/wrap-text-in-javascript}
	 * @method stringDivider
	 * @function
	 * @param {string} str - 속성값을 가져올 객체
	 * @param {number} width - 속성값을 가져올 객체
	 * @param {string} spaceReplacer - 현재 맵의 줌 레벨
	 * @return {string}
	 * @private
	 */
	function stringDivider(str, width, spaceReplacer) {
		if (str.length > width) {
			var p = width;
			while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
				p--;
			}
			if (p > 0) {
				var left;
				if (str.substring(p, p + 1) == '-') {
					left = str.substring(0, p + 1);
				} else {
					left = str.substring(0, p);
				}
				var right = str.substring(p + 1);
				return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
			}
		}
		return str;
	}
}(jQuery));