var gb3d;
if (!gb3d)
	gb3d = {};
if (!gb3d.edit)
	gb3d.edit = {};

/**
 * @classdesc 2차원,3차원 편집 기능을 정의한다.
 * @class gb3d.edit.EditingToolBase
 * @memberof gb3d.edit
 * @param {Object} obj - 생성자 옵션
 * @param {boolean} [obj.isDisplay=false] - 객체 생성 후 바로 가시화 여부
 * @param {string} [obj.toggleClass="header-toggle-btn"] - toggle button 요소 Class 이름. 해당 button 요소에
 * edit tool toggle 기능 추가
 * @param {string} obj.targetElement - Edit tool bar를 생성할 div id 또는 class name
 * @param {Array.<Object>} [obj.list] - Edit tool bar에 생성할 메뉴
 * @param {string} obj.list[].content - 메뉴 이름
 * @param {string} obj.list[].icon - 메뉴 아이콘 {@link https://fontawesome.com/}
 * @param {string} obj.list[].color - 메뉴 색상
 * @param {string} [obj.locale="en"] - 언어 코드
 * @author KIM HOCHUL
 * @date 2019. 12. 24
 * @version 0.01
 */
gb3d.edit.EditingToolBase = function(obj){
	var that = this;
	// 다국적 언어 지원
	this.translator = {
		"draw": {
			"en": "Draw",
			"ko": "그리기"
		},
		"move": {
			"en": "Move",
			"ko": "이동"
		},
		"rotate": {
			"en": "Transform",
			"ko": "변환"
		},
		"modify": {
			"en": "Modify",
			"ko": "수정"
		},
		"delete": {
			"en": "Delete",
			"ko": "삭제"
		},
		"undo": {
			"en": "Undo",
			"ko": "되돌리기"
		},
		"redo": {
			"en": "Redo",
			"ko": "다시하기"
		},
		"area": {
			"en": "Area",
			"ko": "면적"
		},
		"length": {
			"en": "Length",
			"ko": "길이"
		}
	}
	
	/**
	 * 최상위 element
	 * 
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.headerTag = undefined;
	
	/**
	 * 좌측 ul element
	 * 
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.ulTagLeft = undefined;
	
	/**
	 * 우측 ul element
	 * 
	 * @type {n.fn.init.<HTMLDivElement>}
	 * @private
	 */
	this.ulTagRight = undefined;
	
	/**
	 * content list
	 * 
	 * @type {Array.<n.fn.init.<HTMLDivElement>>}
	 * @private
	 */
	this.contentList = [];
	
	/**
	 * active header
	 * 
	 * @type {boolean}
	 * @private
	 */
	this.active_ = false;
	
	// default list
	var defaultList = [
		{
			content: "Draw",
			icon: "fas fa-pencil-alt fa-lg",
			color: ""
		}
	];
	
	// element style 정의
	this.aStyle = {
		"color": "#555555"
	};
	
	this.iStyle = {
		
	};
	
	this.liStyle = {
		"display": "inline-block",
		"padding-left": "20px",
		"list-style-type": "none"
	};
	
	this.ulStyleLeft = {
		"margin-top": "14px",
		"padding": "0",
		"display": "inline-block",
		"font-size": "16px"
	};
	
	this.ulStyleRight = {
		"margin-top": "14px",
		"display": "inline-block",
		"float": "right",
		"font-size": "16px"
	};
	
	this.headerStyle = {
		"position": "absolute",
		"z-index": "3",
		"top": "0",
		"left": "0",
		"right": "0",
		"height": "52px",
		"background-color": "rgba(255,255,255, 0.78)",
		"box-shadow": "0px 0px 20px rgba(0,0,0, 0.5)"
	};
	
	this.closeBtnStyle = {
		"display": "inline-block",
		"float": "right",
		"padding": "0",
		"margin": "0",
		"border": "none",
		"background-color": "transparent",
		"cursor": "pointer",
		"outline": "none",
		"color": "rgb(85, 85, 85)"
	};
	
	this.closeSpanStyle = {
		"padding": "2px 8px",
		"font-size": "18px",
		"font-weight": "700"
	};
	
	var options = obj ? obj : {};
	this.locale = options.locale || "en";
	this.isDisplay = options.isDisplay ? true : false;
	this.toggleClass = options.toggleClass || "header-toggle-btn";
	this.targetElement = $(options.targetElement);
	this.list = options.list || defaultList;
	
	this.createContent(this.list);
	
	this.createToggleEvent(this.toggleClass);
	
	if(!this.isDisplay){
		this.closeTool();
	}
}

/**
 * Edit tool bar 생성
 * 
 * @method gb3d.edit.EditingToolBase#createContent
 * @function
 * @param {Array.<Object>} [list] - Edit tool bar에 생성할 메뉴
 * @param {string} list[].content - 메뉴 이름
 * @param {string} list[].icon - 메뉴 아이콘 {@link https://fontawesome.com/}
 * @param {string} list[].color - 메뉴 색상
 */
gb3d.edit.EditingToolBase.prototype.createContent = function(list){
	
	var that = this;
	
	// target element에 header가 이미 존재한다면 header element 삭제
	if(this.targetElement.find("header").length !== 0){
		this.targetElement.find("header").remove();
	}
	
	// content 저장 배열 초기화
	this.contentList = [];
	
	/**
	 * element style 적용 함수
	 * 
	 * @method adjustStyle
	 * @param {n.fn.init} element - jQuery 선택자
	 * @param {Object} style - style정의 객체
	 * @private
	 */
	function adjustStyle(element, style){
		for(var content in style){
			element.css(content, style[content]);
		}
	}
	
	// header element 생성
	this.headerTag = $("<header>").addClass("gb-headerbase-header");
// adjustStyle(this.headerTag, this.headerStyle);t
	
	this.ulTagLeft = $("<ul class='left-content'>").addClass("gb-headerbase-ul-left");
// adjustStyle(this.ulTagLeft, this.ulStyleLeft);
	
	this.ulTagRight = $("<ul class='right-conent'>").addClass("gb-headerbase-ul-right");
// adjustStyle(this.ulTagRight, this.ulStyleRight);
	
	
	// close button 생성
	/*
	 * var closeBtn = $("<button>"); adjustStyle(closeBtn, this.closeBtnStyle);
	 * closeBtn.hover(function(){ $(this).css("color", "#4c6ef5"); },function(){
	 * $(this).css("color", "rgb(85, 85, 85)"); });
	 * 
	 * closeBtn.click(function(){ that.closeTool(); });
	 * 
	 * var closeSpan = $("<span>×</span>"); adjustStyle(closeSpan, this.closeSpanStyle);
	 * 
	 * closeBtn.append(closeSpan);
	 */
	
	// header content 생성
	var iTag, aTag, liTag;
	for(var i in list){
		iTag = $("<i>").addClass(list[i].icon).attr("aria-hidden", "true");
		
		aTag = $("<a>").addClass("gb-headerbase-a").attr("href", "#").attr("data-content", list[i].content);
		
		aTag.hover(function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "#23527c");
				$(this).css("text-decoration", "none");
			}
		},function(){
			if(!$(this).hasClass("active")){
				$(this).css("color", "rgb(85, 85, 85)");
			}
		});
		
		// content element 저장
		this.contentList.push(aTag);
		
		liTag = $("<li>").addClass("gb-headerbase-li");
		
		if(typeof list[i].clickEvent === "function"){
			aTag.click(list[i].clickEvent);
		}
		
		if(list[i].className){
			liTag.addClass(list[i].className);
		}
		
		if(list[i].color){
			iTag.css("color", list[i].color);
		}
		
// adjustStyle(iTag, this.iStyle);
// adjustStyle(aTag, this.aStyle);
// adjustStyle(liTag, this.liStyle);
		
		if(this.translator[list[i].content]){
			aTag.html(this.translator[list[i].content][this.locale]);
		} else {
			aTag.html(list[i].content);
		}
		
		aTag.prepend(iTag);
		liTag.append(aTag);
		
		if(!list[i].float){
			this.ulTagLeft.append(liTag);
		} else {
			if(list[i].float === "right"){
				liTag.css("padding-left", "0").css("padding-right", "20px");
				this.ulTagRight.append(liTag);
			} else if(list[i].float === "left"){
				this.ulTagLeft.append(liTag);
			} else {
				this.ulTagLeft.append(liTag);
			}
		}
	}
	
	// this.headerTag.append(closeBtn);
	this.headerTag.append(this.ulTagLeft);
// this.headerTag.append(this.ulTagRight);
	
	this.targetElement.prepend(this.headerTag);
}

/**
 * header를 나타낸다.
 * 
 * @method gb3d.edit.EditingToolBase#openTool
 */
gb3d.edit.EditingToolBase.prototype.openTool = function(){
	if(this.active_){
		this.headerTag.css("display", "block");
		this.isDisplay = true;
	}
}

/**
 * header를 숨긴다
 * 
 * @method gb3d.edit.EditingToolBase#closeTool
 */
gb3d.edit.EditingToolBase.prototype.closeTool = function(){
	this.headerTag.css("display", "none");
	this.isDisplay = false;
}

/**
 * header open/close toggle
 * 
 * @method gb3d.edit.EditingToolBase#toggleTool
 */
gb3d.edit.EditingToolBase.prototype.toggleTool = function(){
	if(this.isDisplay){
		this.active_ = false;
		this.closeTool();
	} else {
		this.active_ = true;
		this.openTool();
	}
}

/**
 * header를 open, close 하는 이벤트 함수를 생성한다.
 * 
 * @method gb3d.edit.EditingToolBase#createToggleEvent
 * @param {string} className - header 토글 이벤트를 바인딩할 element의 클래스 이름
 */
gb3d.edit.EditingToolBase.prototype.createToggleEvent = function(className){
	var that = this;
	
	$("." + className).on("click", function(){
		that.toggleTool();
	});
}

/**
 * header 활성화 설정
 * 
 * @method gb3d.edit.EditingToolBase#setActiveTool
 * @param {boolean} bool - header 활성화 여부
 */
gb3d.edit.EditingToolBase.prototype.setActiveTool = function(bool){
	this.active_ = bool;
	
	if(bool){
		this.openTool();
	} else {
		this.closeTool();
	}
}

/**
 * header 활성화 설정값 반환
 * 
 * @method gb3d.edit.EditingToolBase#getActiveTool
 * @return {boolean}
 */
gb3d.edit.EditingToolBase.prototype.getActiveTool = function(){
	return this.active_;
}