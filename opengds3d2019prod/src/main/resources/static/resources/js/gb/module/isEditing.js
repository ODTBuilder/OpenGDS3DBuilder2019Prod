var gb;
if (!gb)
	gb = {};
if (!gb.module)
	gb.module = {};

var locale = locale || "en";

/**
 * Editing Tool 사용 중 실행할 수 없는 작업들에 대하여 경고창을 생성하는 전역 객체.
 * {@link gb.edit.EditingTool} 모듈에 이 객체를 추가해야만 기능이 활성화된다.
 * @namespace {Object} gb.module.isEditing
 * @memberof gb.module
 */
gb.module.isEditing = {
	translation: {
		"editHint": {
			"ko": "편집 기능 실행 중에는 할 수 없는 작업입니다",
			"en": "This is an operation that can not be performed while the editing function is running"
		}
	},
	/**
	 * Editing Tool 활성화 여부
	 * @member {boolean} gb.module.isEditing._active
	 */
	_active: false,
	/**
	 * Editing Tool 활성화 여부
	 * @method gb.module.isEditing.get
	 * @return {boolean}
	 */
	get: function(){
		return this._active
	},
	/**
	 * Editing Tool 활성화 여부값 설정
	 * @method gb.module.isEditing.set
	 * @param {boolean} bool
	 */
	set: function(bool){
		this._active = Boolean(bool);
	},
	/**
	 * 경고창 생성
	 * @method gb.module.isEditing.alert
	 */
	alert: function(){
		alert(this.translation.editHint[locale]);
	}
};