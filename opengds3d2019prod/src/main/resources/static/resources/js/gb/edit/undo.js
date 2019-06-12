var gb;
if (!gb)
	gb = {};
if (!gb.edit)
	gb.edit = {};

/**
 * @classdesc
 * Undo, Redo 기능 Class. Shift+Z 또는 Shift+Y 키이벤트를 통해 undo, redo 기능을 실행한다.
 * @example
 * var undo = new gb.edit.Undo();
 * undo.pushAction({
 *  undo: function(data){
 *   // unde 실행 시 수행할 구문
 *   console.log(data.undo);
 *  },
 *  redo: function(data){
 *   // redo 실행 시 수행할 구문
 *   console.log(data.redo);
 *  },
 *  data: {
 *   // undo, redo 실행 함수에 전달할 데이터
 *   undo: "undo",
 *   redo: "redo"
 *  }
 * });
 * @class gb.edit.Undo
 * @memberof gb.edit
 * @constructor
 * @version 0.01
 * @author KIM HOCHUL
 * @date 2019. 03. 20
 */
gb.edit.Undo = function(obj) {
	var options = obj || {};
	
	var that = this;
	
	/**
	 * undo, redo 기능 수행을 위한 정보를 가지고 있는 gb.edit.Undo.UndoItem 객체를 저장
	 * @type {Array.<Object>}
	 * @private
	 */
	this.stack_ = [];
	
	/**
	 * 멤버 변수 stack_의 index. undo 수행시 -1, redo 수행시 +1, push 수행시 +1
	 * @type {number}
	 * @private
	 */
	this.current_ = -1;
	
	/**
	 * undo, redo 기능 활성화 여부
	 * @type {boolean}
	 * @private
	 */
	this.active_ = true;
	
	// Shift+Z, Shift+Y Key Event 생성
	$(window).keypress(function(e){
		if(!that.active_){
			return;
		}
		
		if((e.keyCode === 90 || e.which === 90) && e.shiftKey){
			that.undo();
			console.log("execute undo");
		} else if((e.keyCode === 89 || e.which === 89) && e.shiftKey){
			that.redo();
			console.log("execute redo");
		}
	});
}

/**
 * undo, redo function과 그에 필요한 parmeter에 대한 data를 담는 객체를 생성.
 * stack에 저장되며 필요에 따라 호출되어 undo, redo 함수를 실행한다
 * @function
 * @param {function} undo - undo 작업을 수행할 callback 함수
 * @param {function} redo - redo 작업을 수행할 callback 함수
 * @param {Object} data - undo, redo 콜백함수 실행에 필요한 값
 * @private
 */
gb.edit.Undo.UndoItem = function(undo, redo, data){
	this.exeUndo = undo;
	this.exeRedo = redo;
	this.data = data;
}

/**
 * stack 변수에 gb.edit.Undo.UndoItem 객체를 추가하고 현재 작업 위치를 1 증가시킨다.
 * 이 함수 실행시 현재 작업 위치 이후에 있는 모든 작업들은 삭제된다
 * @method gb.edit.Undo#push
 * @function
 * @param {function} undo - undo 작업을 수행할 callback 함수
 * @param {function} redo - redo 작업을 수행할 callback 함수
 * @param {Object} data - undo, redo 콜백함수 실행에 필요한 값
 */
gb.edit.Undo.prototype.push = function(undo, redo, data){
	this.current_++;
	
	this.stack_.splice(this.current_);
	this.stack_.push(new gb.edit.Undo.UndoItem(undo, redo, data));
}

/**
 * undo 작업을 수행한다. 현재 작업 위치가 1 감소한다
 * @method gb.edit.Undo#undo
 * @function
 */
gb.edit.Undo.prototype.undo = function(){
	var perform;
	
	if(this.current_ >= 0){
		perform = this.stack_[this.current_];
		perform.exeUndo(perform.data);
		this.current_--;
	} else {
		console.log("Already at oldest change");
	}
}

/**
 * redo 작업을 수행한다. 현재 작업 위치가 1 증가한다
 * @method gb.edit.Undo#redo
 * @function
 */
gb.edit.Undo.prototype.redo = function(){
	var perform;
	
	perform = this.stack_[this.current_ + 1];
	
	if(perform){
		perform.exeRedo(perform.data);
		this.current_++;
	} else {
		console.log("Already at newest change");
	}
}

/**
 * stack에 저장되어 있는 모든 작업을 초기화한다
 * @method gb.edit.Undo#invalidateAll
 * @function
 */
gb.edit.Undo.prototype.invalidateAll = function () {
	this.stack_ = [];
	this.current_ = -1;
}

/**
 * undo, redo 실행 여부 설정
 * @method gb.edit.Undo#setActive
 * @function
 * @param {boolean} bool - false일시 undo, redo 실행 중지
 */
gb.edit.Undo.prototype.setActive = function (bool) {
	this.active_ = bool;
}

/**
 * undo, redo callback 함수와 그 함수에 필요한 값을 설정한다
 * @method gb.edit.Undo#pushAction
 * @function
 * @param {Object} obj - callback 함수와 그 함수에 필요한 값을 가진 객체
 * @param {function} obj.undo - undo 작업을 수행할 callback 함수
 * @param {function} obj.redo - redo 작업을 수행할 callback 함수
 * @param {Object} obj.data - undo, redo callback함수 실행에 필요한 값
 * @return {gb.edit.Undo} gb.edit.Undo 객체
 */
gb.edit.Undo.prototype.pushAction = function(obj){
	this.push(obj.undo, obj.redo, obj.data);
	
	return this;
}

gb.undo = new gb.edit.Undo({});