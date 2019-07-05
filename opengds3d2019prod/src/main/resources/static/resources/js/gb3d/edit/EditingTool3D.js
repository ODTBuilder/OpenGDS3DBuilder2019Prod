var gb;
if (!gb)
	gb = {};
if (!gb.edit)
	gb.edit = {};

/**
 * @classdesc
 * 3차원 객체 편집 기능을 정의한다.
 * 필수 라이브러리: jQuery, fontawesome, openlayers, {@link gb.edit.EditingToolBase}
 */

gb.edit.EditingTool3D = function(obj) {
	var that = this;
	gb.edit.EditingToolBase.call(this, obj);
	
	// EditingTool3D 작업 표시줄 기본 항목
	var defaultList = [
		{
			content: "Translate",
			icon: "fas fa-arrows-alt fa-lg",
			clickEvent: function(){
				console.log("draw");
			},
			color: ""
		},
		{
			content: "Scale",
			icon: "fas fa-expand fa-lg",
			clickEvent: function(){
				console.log("move");
			},
			color: ""
		},
		{
			content: "Rotate",
			icon: "fas fa-sync-alt fa-lg",
			clickEvent: function(){
				console.log("rotate");
			},
			color: ""
		},
		{
			content: "delete",
			icon: "fas fa-eraser fa-lg",
			clickEvent: function(){
				console.log("remove");
			},
			color: ""
		}
	];

	// header element 생성
	this.createContent(defaultList);
	this.closeTool();
	this.headerTag.css({"width": "60%"});
}
gb.edit.EditingTool3D.prototype = Object.create(gb.edit.EditingToolBase.prototype);
gb.edit.EditingTool3D.prototype.constructor = gb.edit.EditingTool3D;

gb.edit.EditingTool3D.prototype.createObjectByVector = function(array){
	
}