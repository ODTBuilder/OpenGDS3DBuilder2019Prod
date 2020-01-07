var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.style)
	gb3d.style = {};

/**
 * @classdesc Cesium 3D Tileset 선언적 스타일링 관리 객체
 * @class gb3d.style.Declarative
 * @memberof gb3d.style
 * @param {Object} obj - 생성자 옵션
 * @param {string} [obj.target="body"] - 선언적 스타일링 관리 UI를 생성할 Element ID 또는 Class name
 * @author KIM HOCHUL
 * @date 2019. 12. 24
 * @version 0.01
 */
gb3d.style.Declarative = function(obj) {
	var that = this;
	var options = obj;
	this.target = options.element ? $(options.element) : $("body");

	this.mainId = "tilesAccordion";
	this.accordion = $("<div class='panel-group' role='tablist' aria-multiselectable='true'>").attr("id", this.mainId);
	this.target.append(this.accordion);

	function getConditionRow() {
		var options = [ "<=", ">=", "<", ">", "=", "!=" ];

		var row = $("<div class='gb3d-declare-row'>");
		var item = $("<div class='gb-declare-item'>");
		var select = $("<select class='form-control gb-declare-condition'>");
		var option;
		for (var i = 0; i < options.length; i++) {
			option = $("<option>").text(options[i]).val(options[i]);
			select.append(option);
		}
		item.append(select);
		row.append(item);

		item = $("<div class='gb-declare-item'>");
		var input = $("<input class='form-control gb-declare-value'>");
		item.append(input);
		row.append(item);

		item = $("<div class='gb-declare-item'>");
		input = $("<input class='form-control gb-declare-color'>");
		item.append(input);
		row.append(item);
		input.spectrum({
			preferredFormat : "hex",
			color : "#fff",
			showAlpha : false
		});

		item = $("<div class='gb-declare-item'>");
		input = $("<input type='checkbox'>");
		item.append(input);
		row.append(item);

		var a = $("<a href='#'>").addClass("gb-declare-item-del");
		var i = $("<i class='far fa-trash-alt'>");
		a.append(i);
		row.append(a);

		return row;
	}

	$(document).on("click", ".gb3d-declare-row-header > span > .gb3d-declare-row-add", function() {
		var row = getConditionRow();

		$(this).parent().parent().parent().append(row);
	});

	$(document).on("click", ".gb3d-declare-row > .gb-declare-item-del", function(e) {
		// $( this ).parent().remove();
		console.log("delete");
	});
}

/**
 * 조건문 삭제 이벤트 발생 시 이벤트 함수 설정
 * 
 * @method gb3d.style.Declarative#deleteEvent
 * @param {requestCallback} callback - callback 함수
 */
gb3d.style.Declarative.prototype.deleteEvent = function(callback) {
	$(document).on("click", "#" + this.mainId + " a", callback);
}

/**
 * 조건문 조건식 변경 이벤트 발생 시 이벤트 함수 설정
 * 
 * @method gb3d.style.Declarative#conditionEvent
 * @param {requestCallback} callback - callback 함수
 */
gb3d.style.Declarative.prototype.conditionEvent = function(callback) {
	$(document).on("change", "#" + this.mainId + " .gb-declare-item .gb-declare-condition", callback);
}

/**
 * 조건문 설정값 입력 이벤트 발생 시 이벤트 함수 설정
 * 
 * @method gb3d.style.Declarative#inputValueEvent
 * @param {requestCallback} callback - callback 함수
 */
gb3d.style.Declarative.prototype.inputValueEvent = function(callback) {
	$(document).on("keyup", "#" + this.mainId + " .gb-declare-item .gb-declare-value", callback);
}

/**
 * 조건문 색상 변경 이벤트 발생 시 이벤트 함수 설정
 * 
 * @method gb3d.style.Declarative#inputColorEvent
 * @param {requestCallback} callback - callback 함수
 */
gb3d.style.Declarative.prototype.inputColorEvent = function(callback) {
	$(document).on("change", "#" + this.mainId + " .gb-declare-item .gb-declare-color", callback);
}

/**
 * 조건문 체크박스 선택 이벤트 발생 시 이벤트 함수 설정
 * 
 * @method gb3d.style.Declarative#checkEvent
 * @param {requestCallback} callback - callback 함수
 */
gb3d.style.Declarative.prototype.checkEvent = function(callback) {
	$(document).on("change", "#" + this.mainId + " .gb-declare-item input:checkbox", callback);
}

/**
 * 새로운 Tileset 패널을 생성한다.
 * 
 * @method gb3d.style.Declarative#addTilesPanel
 * @param {gb3d.object.Tileset} tileset - Tileset 객체
 */
gb3d.style.Declarative.prototype.addTilesPanel = function(tileset) {
	var t = tileset;
	if (t instanceof gb3d.object.Tileset) {
		var tile = tileset.getCesiumTileset();
		var properties = tile.properties;

		var options = [ "Condition", "Value", "Color", "Hide" ];

		var panel = $("<div class='panel panel-default'>");
		this.accordion.append(panel);

		var heading = $("<div class='panel-heading' role='tab'>").attr("id", t.getLayer());
		panel.append(heading);

		var title = $("<h4 class='panel-title gb-flex-between'>");
		heading.append(title);

		var lid = t.getLayer();
		var lname = lid.split(":")[3];
		var titleButton = $("<a role='button' data-toggle='collapse' href='#collapse1' aria-expanded='true'>").text(lname).attr("data-parent", "#" + this.mainId).attr("aria-controls",
				"collapse-" + t.getLayer()).attr("href", "#collapse-" + t.getLayer());
		title.append(titleButton);

		var keySelect = $("<select class='form-control' style='flex: 0 0 90px;'>");
		title.append(keySelect);

		if (!properties) {
			return;
		}

		if (properties instanceof Object) {
			for ( var i in properties) {
				var key = $("<option>").val(i).text(i);
				keySelect.append(key);
			}
		}

		var collapse = $("<div class='panel-collapse collapse in' role='tabpanel'>").attr("id", "collapse-" + t.getLayer()).attr("aria-labelledby", t.getLayer());
		panel.append(collapse);

		var body = $("<div class='panel-body'>");
		collapse.append(body);

		var row = $("<div class='gb3d-declare-row-header'>");
		body.append(row);

		var span;
		for (var i = 0; i < options.length; i++) {
			span = $("<span class='Text'>").text(options[i]);
			row.append(span);
		}

		span = $("<span class='Text'>");
		var a = $("<a href='#'>").addClass("gb3d-declare-row-add");
		var i = $("<i class='fas fa-plus'></i>");
		a.append(i);
		span.append(a);
		row.append(span);
	}
}