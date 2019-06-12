/**
 * GeoGig repository 모달 객체를 정의한다.
 * 
 * @class gb.versioning.Repository
 * @memberof gb.versioning
 * @param {string}
 *            obj.locale - 사용할 언어 ko | en
 * @param {string}
 *            obj.epsg - 설정하고자 하는 좌표계의 EPSG 코드
 * @param {Object}
 *            obj - 생성자 옵션을 담은 객체
 * @param {Object}
 *            obj.url - 요청을 수행할 URL
 * @param {string}
 *            obj.url.serverTree - 서버 목록 트리를 요청할 URL ex) /getWorkingTree.ajax
 * @param {string}
 *            obj.url.remoteTree - 원격 Repository의 목록을 요청할 URL ex)
 *            /getRemoteRepoTree.ajax
 * @param {string}
 *            obj.url.beginTransaction - 작업을 수행하기 위한 트랜잭션 ID 발급을 요청할 URL ex)
 *            /beginTransaction.do
 * @param {string}
 *            obj.url.endTransaction - 작업을 수행하기 위한 트랜잭션 ID 적용 및 해제 요청할 URL ex)
 *            /endTransaction.do
 * @param {string}
 *            obj.url.cancelTransaction - 작업을 수행하기 위한 트랜잭션 ID 미적용 및 해제 요청할 컨트롤러
 *            주소 ex) /cancelTransaction.do
 * @param {string}
 *            obj.url.checkoutBranch- 선택한 브랜치를 체크아웃 요청할 URL ex)
 *            /checkoutBranch.do
 * @param {string}
 *            obj.url.removeRemoteRepository - 원격 Repository 삭제를 요청할 URL ex)
 *            /removeRemoteRepository.do
 * @param {string}
 *            obj.url.removeRepository - Repository 삭제를 요청할 URL ex)
 *            /deleteRepository.do?
 * @param {string}
 *            obj.url.branchList - 선택한 repository의 브랜치 목록을 조회할 URL ex)
 *            /branchList.do
 * @param {string}
 *            obj.url.mergeBranch - 브랜치간의 머지를 요청할 URL ex) /mergeBranch.do
 * @param {string}
 *            obj.url.initRepository - Repository의 추가를 요청할 URL ex)
 *            /initRepository.do
 * @param {string}
 *            obj.url.addRemoteRepository - 원격 Repository의 추가를 요청할 URL ex)
 *            /addRemoteRepository.do
 * @param {string}
 *            obj.url.pullRepository - 원격 Repository에서 Local branch로 Pull 요청할
 *            URL ex) /pullRepository.do
 * @param {string}
 *            obj.url.pushRepository - Local branch에서 원격 Repository로 Push 요청할
 *            URL ex) /pushRepository.do
 * @param {string}
 *            obj.url.createBranch - 새로운 브랜치 생성을 요청할 URL ex) /createBranch.do
 * @param {string}
 *            obj.url.resolveConflict - 충돌 문제 해결을 요청할 URL ex)
 *            /resolveConflict.do
 * @param {string}
 *            obj.url.featureBlame - 피처 비교를 요청할 URL ex) /featureBlame.do
 * @param {string}
 *            obj.url.catConflictFeatureObject - GeoGig 저장소별 오브젝트 아이디를 통한 피처 비교를
 *            요청할 URL ex) /catConflictFeatureObject.do
 * @param {string}
 *            obj.url.dataStoreList - GeoGig 브랜치와 연결된 데이터저장소 목록을 요청할 URL ex)
 *            /getDataStoreList.do
 * @param {string}
 *            obj.url.listGeoserverLayer - GeoServer 레이어를 조회할 URL ex)
 *            /listGeoserverLayer.do
 * @param {string}
 *            obj.url.publishGeogigLayer - GeoGig 레이어 발행을 요청할 URL ex)
 *            /publishGeogigLayer.do
 * @param {string}
 *            obj.url.removeGeogigLayer - GeoGig 레이어 삭제를 요청할 URL ex)
 *            /removeLayer.do
 * @param {string}
 *            obj.url.infoRepository - GeoGig 저장소 정보를 요청할 URL ex)
 *            /infoRepository.do
 * @param {string}
 *            obj.url.logLayer - GeoGig 레이어 이력을 요청할 URL ex) /logLayer.do
 * @param {string}
 *            obj.url.diffLayer - GeoGig 레이어 변경사항 조회를 요청할 URL ex)
 *            /diffLayerById.do
 * @param {string}
 *            obj.url.featureDiff - 피처 변경사항 조회를 요청할 URL ex) /featureDiff.do
 * @param {string}
 *            obj.url.featureRevert - 피처 되돌리기를 요청할 URL ex) /featureRevert.do
 * @author SOYIJUN
 */
gb.versioning.Repository = function(obj) {
	/**
	 * 번역 정보
	 * 
	 * @private
	 * @type {Object}
	 */
	this.translation = {
		"400" : {
			"ko" : "요청값 잘못입력",
			"en" : "Bad request"
		},
		"404" : {
			"ko" : "페이지 없음",
			"en" : "Not found"
		},
		"405" : {
			"ko" : "요청 타입 에러",
			"en" : "Method not allowed"
		},
		"406" : {
			"ko" : "요청 형식 에러",
			"en" : "Not acceptable"
		},
		"407" : {
			"ko" : "프록시 에러",
			"en" : "Proxy authentication required"
		},
		"408" : {
			"ko" : "요청시간 초과",
			"en" : "Request timeout"
		},
		"415" : {
			"ko" : "지원하지 않는 타입 요청",
			"en" : "Unsupported media type"
		},
		"500" : {
			"ko" : "서버 내부 오류",
			"en" : "Internal server error"
		},
		"800" : {
			"ko" : "Transaction 시작 후 다시 요청하세요.",
			"en" : "No transaction was specified, this command requires a transaction to preserve the stability of the repository."
		},
		"801" : {
			"ko" : "해당 Transaction ID가 존재하지 않습니다.",
			"en" : "A transaction with the provided ID could not be found."
		},
		"802" : {
			"ko" : "해당 Geogig 저장소가 존재하지 않습니다.",
			"en" : "Repository not found."
		},
		"803" : {
			"ko" : "옵션에 잘못된 값이 지정되었습니다.",
			"en" : "Invalid value specified for option. "
		},
		"804" : {
			"ko" : "해당 Geogig 명령어가 존재하지 않습니다.",
			"en" : "Not a geogig command."
		},
		"805" : {
			"ko" : "기존 Transaction 을 종료 후 다시 요청하세요.",
			"en" : "Tried to start a transaction within a transaction."
		},
		"806" : {
			"ko" : "Branch나 Commit 이력을 확인할 수 없습니다.",
			"en" : "Could not resolve branch or commit."
		},
		"807" : {
			"ko" : "해당 경로의 Feature 가 유효하지 않습니다.",
			"en" : "The supplied path does not resolve to a feature."
		},
		"808" : {
			"ko" : "해당 경로가 존재하지 않습니다.",
			"en" : "The supplied path does not exist."
		},
		"809" : {
			"ko" : "응답 결과가 없습니다.",
			"en" : "No response"
		},
		"810" : {
			"ko" : "올바르지 않은 ObjectId 입니다.",
			"en" : "You must specify a valid non-null ObjectId."
		},
		"811" : {
			"ko" : "해당 ObjectId가 Geogig 저장소 내에 존재하지 않습니다.",
			"en" : "The specified ObjectId was not found in the respository."
		},
		"812" : {
			"ko" : "해당 저장소에 HEAD가 없어 체크아웃 할 수 없습니다.",
			"en" : "Repository has no HEAD, can't checkout."
		},
		"813" : {
			"ko" : "ours 또는 theirs로 피처를 지정하여 충돌을 해결하세요.",
			"en" : "Please specify either ours or theirs to update the feature path specified."
		},
		"814" : {
			"ko" : "Branch나 Commit 이력이 존재하지 않습니다.",
			"en" : "No branch or commit specified for checkout."
		},
		"815" : {
			"ko" : "속성을 등록할 때에 key 값을 입력해야합니다.",
			"en" : "You must specify the key when setting a config key."
		},
		"816" : {
			"ko" : "속성을 등록할 때에 value 값을 입력해야합니다.",
			"en" : "You must specify the value when setting a config key."
		},
		"817" : {
			"ko" : "Old Commit Id가 올바르지 않습니다.",
			"en" : "Invalid old ref spec."
		},
		"818" : {
			"ko" : "해당 경로가 유효하지 않습니다.",
			"en" : "Invalid path was specified."
		},
		"819" : {
			"ko" : "새로운 Fetch 이력이 존재하지 않습니다.",
			"en" : "Nothing specified to fetch from."
		},
		"820" : {
			"ko" : "원격 Geogig 저장소로부터 Fetch 이력을 받아올 수 없습니다.",
			"en" : "Unable to fetch, the remote history is shallow."
		},
		"821" : {
			"ko" : "해당 경로가 유효하지 않습니다.",
			"en" : "Couldn't resolve the given path."
		},
		"822" : {
			"ko" : "유효하지 않은 FeatureType 입니다.",
			"en" : "Couldn't resolve the given path to a feature type."
		},
		"823" : {
			"ko" : "저장소에 HEAD가 존재하지 않아 Merge 할 수 없습니다.",
			"en" : "Repository has no HEAD, can't merge."
		},
		"824" : {
			"ko" : "해당 Commit 이력을 확인할 수 없습니다.",
			"en" : "Couldn't resolve to a commit."
		},
		"825" : {
			"ko" : "원격 Geogig 저장소로부터 Pull 할 수 없습니다.",
			"en" : "Unable to pull, the remote history is shallow."
		},
		"826" : {
			"ko" : "원격 Geogig 저장소에 변경사항이 있으므로 Push 할 수 없습니다. Pull 한 후 다시 요청하세요.",
			"en" : "Push failed: The 원격 저장소 has changes that would be lost in the event of a push."
		},
		"827" : {
			"ko" : "해당 저장소는 원격 Geogig 저장소에 Push 할 변경사항이 없습니다.",
			"en" : "Push failed: There is not enough local history to complete the push."
		},
		"828" : {
			"ko" : "원격 Geogig 저장소가 존재하지 않습니다.",
			"en" : "REMOTE_NOT_FOUND"
		},
		"829" : {
			"ko" : "원격 Geogig 저장소 URL이 유효하지 않습니다.",
			"en" : "No URL was specified."
		},
		"830" : {
			"ko" : "해당 Object ID가 유효하지 않습니다.",
			"en" : "Object ID could not be resolved to a feature."
		},
		"831" : {
			"ko" : "해당 Object ID가 유효하지 않습니다.",
			"en" : "Invalid reference."
		},
		"832" : {
			"ko" : "Geogig 저장소의 상위 Commit 이력을 찾을 수 없습니다.",
			"en" : "Parent tree couldn't be found in the repository."
		},
		"833" : {
			"ko" : "New Commit ID는 유효한 Commit 이력이 아닙니다.",
			"en" : "New commit id did not resolve to a valid tree."
		},
		"834" : {
			"ko" : "Old Commit ID는 유효한 Commit 이력이 아닙니다.",
			"en" : "Old commit id did not resolve to a valid tree."
		},
		"835" : {
			"ko" : "해당 Feature는 Commit 이력에 존재하지 않습니다. ",
			"en" : "The feature was not found in either commit tree."
		},
		"836" : {
			"ko" : "삭제할 Geogig 저장소가 존재하지 않습니다.",
			"en" : "No repository to delete."
		},
		"837" : {
			"ko" : "Commit 이력이 존재하지 않습니다.",
			"en" : "Commit not found."
		},
		"838" : {
			"ko" : "URI가 유효하지 않습니다.",
			"en" : "Unable to resolve URI of newly created repository."
		},
		"839" : {
			"ko" : "지원하지 않는 명령어입니다.",
			"en" : "The request method is unsupported for this operation."
		},
		"840" : {
			"ko" : "해당 데이터베이스의 파라미터가 유효하지 않습니다.",
			"en" : "Unable to connect using the specified database parameters."
		},
		"841" : {
			"ko" : "이미 존재하는 Geogig 저장소입니다. ",
			"en" : "Cannot run init on an already initialized repository."
		},
		"842" : {
			"ko" : "Commit 이력에 해당 tree Id가 존재하지 않습니다.",
			"en" : "Couldn't resolve commit's treeId"
		},
		"843" : {
			"ko" : "유효하지 않은 POST data 입니다.",
			"en" : "Invalid POST data."
		},
		"844" : {
			"ko" : "token이 유효하지 않습니다. ",
			"en" : "You must specify the correct token to delete a repository."
		},
		"845" : {
			"ko" : "token이 존재하지 않거나 만료되었습니다.",
			"en" : "The specified token does not exist or has expired."
		},
		"846" : {
			"ko" : "value를 theirs 또는 ours로 입력해야합니다. ",
			"en" : "Can not set 'value' to 'true' with 'theirs' or 'ours' set."
		},
		"847" : {
			"ko" : "이미 존재하는 Geogig 저장소 이름입니다. ",
			"en" : "The specified repository name is already in use, please try a different name"
		},
		"848" : {
			"ko" : "Remote Repository에 연결할 수 없습니다.",
			"en" : "Unable to connect 원격 저장소."
		},
		"849" : {
			"ko" : "Geoserver에 연결할 수 없습니다.",
			"en" : "Connection refused"
		},
		"850" : {
			"ko" : "Geogig 저장소 생성을 실패했습니다. connection parameters를 정확히 입력하세요.",
			"en" : "Read timed out"
		},
		"851" : {
			"ko" : "Geogig 저장소 생성을 실패했습니다. connection parameters를 정확히 입력하세요.",
			"en" : "PSQLException: ERROR: schema does not exist"
		},
		"852" : {
			"ko" : "이미 존재하는 Remote Geogig 저장소입니다. ",
			"en" : "REMOTE_ALREADY_EXISTS"
		},
		"853" : {
			"ko" : "해당 Remote Geogig 저장소를 찾을 수 없습니다. ",
			"en" : "java.io.FileNotFoundException"
		},
		"854" : {
			"ko" : "Remote Repository URL이 유효하지 않습니다.",
			"en" : "java.net.UnknownHostException"
		},
		"855" : {
			"ko" : "Remote Repository URL이 유효하지 않습니다.",
			"en" : "Expected authority"
		},
		"856" : {
			"ko" : "Remote Repository URL이 유효하지 않습니다.",
			"en" : "java.net.MalformedURLException"
		},
		"857" : {
			"ko" : "충돌을 해결하세요.",
			"en" : "You need to resolve your index first."
		},
		"858" : {
			"ko" : "호스트에 숫자가 아닌 값을 입력했습니다.",
			"en" : "You have entered a non-numeric value for the host."
		},
		"859" : {
			"ko" : "커밋 이력이 없는 저장소 입니다.",
			"en" : "A repository that has no commit history."
		},
		"860" : {
			"ko" : "잘못된 구조의 정보를 입력했습니다.",
			"en" : "You have entered incorrect structured information."
		},
		"861" : {
			"ko" : "저장소 정보를 읽을 수 없습니다.",
			"en" : "Could not read repository information."
		},
		"err" : {
			"ko" : "오류",
			"en" : "Error"
		},
		"geogig" : {
			"ko" : "버전 관리",
			"en" : "Version Control"
		},
		"close" : {
			"ko" : "닫기",
			"en" : "Close"
		},
		"newrepo" : {
			"ko" : "새로운 저장소",
			"en" : "New Repository"
		},
		"newbranch" : {
			"ko" : "새로운 브랜치",
			"en" : "New Branch"
		},
		"remoterepo" : {
			"ko" : "원격 저장소",
			"en" : "Remote Repository"
		},
		"remove" : {
			"ko" : "삭제",
			"en" : "Remove"
		},
		"fetch" : {
			"ko" : "가져오기",
			"en" : "Fetch"
		},
		"end" : {
			"ko" : "작업 종료",
			"en" : "End"
		},
		"add" : {
			"ko" : "추가",
			"en" : "Add"
		},
		"commit" : {
			"ko" : "커밋",
			"en" : "Commit"
		},
		"checkout" : {
			"ko" : "체크아웃",
			"en" : "Checkout"
		},
		"pull" : {
			"ko" : "Pull",
			"en" : "Pull"
		},
		"push" : {
			"ko" : "Push",
			"en" : "Push"
		},
		"merge" : {
			"ko" : "병합",
			"en" : "Merge"
		},
		"publish" : {
			"ko" : "발행",
			"en" : "Publish"
		},
		"history" : {
			"ko" : "이력",
			"en" : "History"
		},
		"staged" : {
			"ko" : "스태이지 됨",
			"en" : "Staged"
		},
		"unstaged" : {
			"ko" : "스태이지 안됨",
			"en" : "Unstaged"
		},
		"merged" : {
			"ko" : "병합됨",
			"en" : "Merged"
		},
		"unmerged" : {
			"ko" : "병합안됨",
			"en" : "Unmerged"
		},
		"geoserver" : {
			"ko" : "GeoServer",
			"en" : "GeoServer"
		},
		"repository" : {
			"ko" : "저장소",
			"en" : "Repository"
		},
		"targetbranch" : {
			"ko" : "목표 브랜치",
			"en" : "Target Branch"
		},
		"cancel" : {
			"ko" : "취소",
			"en" : "Cancel"
		},
		"create" : {
			"ko" : "생성",
			"en" : "Create"
		},
		"createrepo" : {
			"ko" : "저장소 생성",
			"en" : "Create Repository"
		},
		"name" : {
			"ko" : "이름",
			"en" : "Name"
		},
		"attr" : {
			"ko" : "속성",
			"en" : "Attribute"
		},
		"namemsg" : {
			"ko" : "저장소 이름",
			"en" : "Repository name"
		},
		"host" : {
			"ko" : "호스트 주소",
			"en" : "Host"
		},
		"hostmsg" : {
			"ko" : "호스트 주소 예시) 127.0.0.1",
			"en" : "Host address EX) 127.0.0.1"
		},
		"port" : {
			"ko" : "포트",
			"en" : "Port"
		},
		"portmsg" : {
			"ko" : "포트 번호 예시)5432",
			"en" : "Host"
		},
		"db" : {
			"ko" : "데이터베이스",
			"en" : "Database"
		},
		"dbmsg" : {
			"ko" : "데이터베이스 이름",
			"en" : "Database name"
		},
		"scheme" : {
			"ko" : "스키마",
			"en" : "Scheme"
		},
		"schememsg" : {
			"ko" : "스키마 이름",
			"en" : "Scheme name"
		},
		"username" : {
			"ko" : "사용자 이름",
			"en" : "User Name"
		},
		"usernamemsg" : {
			"ko" : "데이터베이스 사용자 이름",
			"en" : "Database user name"
		},
		"password" : {
			"ko" : "비밀번호",
			"en" : "Password"
		},
		"passwordmsg" : {
			"ko" : "데이터베이스 사용자 비밀번호",
			"en" : "Database user password"
		},
		"pullfrom" : {
			"ko" : "원격 저장소로부터 Pull 받기",
			"en" : "Pull from 원격 저장소"
		},
		"remoreponame" : {
			"ko" : "저장소 이름",
			"en" : "Repository name"
		},
		"remoreponamemsg" : {
			"ko" : "GeoServer에 등록된 원격 저장소의 이름",
			"en" : "The name of GeoGig repository on GeoServer"
		},
		"remorepourl" : {
			"ko" : "저장소 URL",
			"en" : "Repository URL"
		},
		"remorepourlmsg" : {
			"ko" : "원격 저장소의 URL",
			"en" : "The URL of GeoGig repository"
		},
		"host" : {
			"ko" : "호스트 주소",
			"en" : "Host"
		},
		"publish" : {
			"ko" : "발행",
			"en" : "Publish"
		},
		"emptyfield" : {
			"ko" : "필수 입력 필드가 비어있습니다.",
			"en" : "Some required fields are empty."
		},
		"removerepomsg" : {
			"ko" : "이 저장소를 삭제하시겠습니까?",
			"en" : "Are you sure to remove this repository?"
		},
		"removerepo" : {
			"ko" : "저장소 삭제",
			"en" : "Remove Repository"
		},
		"ok" : {
			"ko" : "확인",
			"en" : "OK"
		},
		"removelayer" : {
			"ko" : "레이어 삭제",
			"en" : "Remove Layer"
		},
		"removelayermsg" : {
			"ko" : "레이어를 삭제하시겠습니까?",
			"en" : "Are you sure to remove this layer?"
		},
		"chkoutfail" : {
			"ko" : "체크아웃에 실패했습니다.",
			"en" : "Checkout failed."
		},
		"ischkout1" : {
			"ko" : "다른 브랜치가 체크아웃 되어있습니다.",
			"en" : "Another branch has been checked out."
		},
		"ischkout2" : {
			"ko" : "진행하면 현재 변경사항을 잃습니다. 진행하시겠습니까?",
			"en" : 'If you proceed, you will lose your changes. Do you want to proceed?'
		},
		"dnc" : {
			"ko" : "폐기 후 체크아웃",
			"en" : "Discard and Checkout"
		},
		"warning" : {
			"ko" : "경고",
			"en" : "Warning"
		},
		"removeremoterepo" : {
			"ko" : "원격 저장소 삭제",
			"en" : "Remove Remote Repository"
		},
		"removeremoterepomsg" : {
			"ko" : "원격 저장소를 삭제하시겠습니까?",
			"en" : "Are you sure to remove this 원격 저장소?"
		},
		"removeremotefail" : {
			"ko" : "원격 저장소 삭제에 실패했습니다.",
			"en" : "Remove Remote Repository Fail"
		},
		"mergecompl1" : {
			"ko" : "병합이 완료되었습니다.",
			"en" : "Merge is complete."
		},
		"mergecompl2" : {
			"ko" : "변경 사항을 브랜치에 반영하시겠습니까?",
			"en" : 'Do you want to commit the changes to your branch?'
		},
		"later" : {
			"ko" : "나중에",
			"en" : "Later"
		},
		"cmitchnges" : {
			"ko" : "변경사항 적용",
			"en" : "Commit Changes"
		},
		"conflmsg1" : {
			"ko" : "충돌하는 객체가 있습니다.",
			"en" : "There are conflicting features."
		},
		"conflmsg2" : {
			"ko" : "충돌을 해결하시겠습니까?",
			"en" : 'Would you like to resolve conflicts?'
		},
		"resolve" : {
			"ko" : "해결하기",
			"en" : 'Resolve'
		},
		"conflicts" : {
			"ko" : "충돌 사항",
			"en" : 'Conflicts'
		},
		"mergefail" : {
			"ko" : "병합에 실패했습니다.",
			"en" : 'Merge failed.'
		},
		"nobranch" : {
			"ko" : "브랜치 목록을 가져올수 없었습니다.",
			"en" : "Couldn't get the branch list."
		},
		"cub" : {
			"ko" : "현재 브랜치",
			"en" : "Current Branch"
		},
		"tab" : {
			"ko" : "목표 브랜치",
			"en" : "Target Branch"
		},
		"addremorepo" : {
			"ko" : "원격 저장소 추가",
			"en" : "Add Remote Repository"
		},
		"no" : {
			"ko" : "번호",
			"en" : "No"
		},
		"layer" : {
			"ko" : "레이어",
			"en" : "Layer"
		},
		"fid" : {
			"ko" : "객체ID",
			"en" : "Feature ID"
		},
		"resolution" : {
			"ko" : "해결방법",
			"en" : "Resolution"
		},
		"detail" : {
			"ko" : "세부 정보",
			"en" : "Detail"
		},
		"use" : {
			"ko" : "사용",
			"en" : "Use"
		},
		"resolveconfl" : {
			"ko" : "충돌 해결",
			"en" : "Resolve Conflicts"
		},
		"click" : {
			"ko" : "클릭",
			"en" : "Click"
		},
		"value" : {
			"ko" : "값",
			"en" : "Value"
		},
		"compareconfl" : {
			"ko" : "충돌 객체 비교",
			"en" : "Compare Conflicts"
		},
		"comparebeaf" : {
			"ko" : "변경 전후 객체 비교",
			"en" : "Compare Features"
		},
		"workspace" : {
			"ko" : "워크스페이스",
			"en" : "Workspace"
		},
		"datastore" : {
			"ko" : "데이터스토어",
			"en" : "Datastore"
		},
		"layers" : {
			"ko" : "레이어",
			"en" : "Layers"
		},
		"publish" : {
			"ko" : "발행",
			"en" : "Publish"
		},
		"nodatastoremsg1" : {
			"ko" : "이 브랜치에 연결된 데이터스토어가 없습니다.",
			"en" : "There is no datastore connected with this branch."
		},
		"nodatastoremsg2" : {
			"ko" : "브랜치와 연결된 데이터스토어를 만들어 주세요.",
			"en" : "Please make a datastore connected with the branch."
		},
		"chooselayer" : {
			"ko" : "레이어를 선택해주세요.",
			"en" : "Please choose a layer."
		},
		"removed" : {
			"ko" : "삭제됨",
			"en" : "Removed"
		},
		"published" : {
			"ko" : "발행됨",
			"en" : "Published"
		},
		"layerdel" : {
			"ko" : "레이어가 삭제되었습니다.",
			"en" : "Layer has been deleted."
		},
		"layerpub" : {
			"ko" : "레이어가 발행되었습니다.",
			"en" : "Layer has been published."
		},
		"message" : {
			"ko" : "알림",
			"en" : "Message"
		},
		"info" : {
			"ko" : "정보",
			"en" : "Information"
		},
		"url" : {
			"ko" : "URL",
			"en" : "URL"
		},
		"location" : {
			"ko" : "위치",
			"en" : "Location"
		},
		"storage" : {
			"ko" : "저장소 형식",
			"en" : "Storage Type"
		},
		"user" : {
			"ko" : "소유자",
			"en" : "Commiter"
		},
		"email" : {
			"ko" : "이메일",
			"en" : "E-mail"
		},
		"repoinfo" : {
			"ko" : "저장소 정보",
			"en" : "Repository Information"
		},
		"beforeend" : {
			"ko" : "현재 브랜치에서 수행할 작업을 선택하세요.",
			"en" : "What would you like to do?"
		},
		"discard" : {
			"ko" : "폐기",
			"en" : "Discard"
		},
		"endtran" : {
			"ko" : "트랜잭션 종료",
			"en" : "End Transaction"
		},
		"noremote" : {
			"ko" : "연결된 원격 저장소가 없습니다.",
			"en" : "There is no remote branch."
		},
		"pullcompl" : {
			"ko" : "Pull이 완료되었습니다.",
			"en" : '"Pull" is complete.'
		},
		"pullfail" : {
			"ko" : "Pull이 실패했습니다.",
			"en" : "Pull failed."
		},
		"pushmsg1" : {
			"ko" : "변경사항이 원격 브랜치에 반영되었습니다.",
			"en" : 'The changes have been applied to remote branch.'
		},
		"pushmsg2" : {
			"ko" : "변경사항이 없습니다.",
			"en" : 'Nothing changed.'
		},
		"pushcompl" : {
			"ko" : "Push가 완료되었습니다.",
			"en" : '"Push" is complete.'
		},
		"pushfail" : {
			"ko" : "Push에 실패했습니다.",
			"en" : 'Push failed.'
		},
		"remote" : {
			"ko" : "원격 저장소",
			"en" : 'Remote Repository'
		},
		"local" : {
			"ko" : "로컬 저장소",
			"en" : 'Local Repository'
		},
		"nobranchlist" : {
			"ko" : "브랜치 리스트를 받을 수 없습니다.",
			"en" : "Couldn't get branch list."
		},
		"date" : {
			"ko" : "일시",
			"en" : "Date"
		},
		"commitmsg" : {
			"ko" : "설명",
			"en" : "Description"
		},
		"revert" : {
			"ko" : "되돌리기",
			"en" : "Revert"
		},
		"readmore" : {
			"ko" : "더 보기",
			"en" : "Read more"
		},
		"added" : {
			"ko" : "추가됨",
			"en" : "Added"
		},
		"modified" : {
			"ko" : "수정됨",
			"en" : "Modified"
		},
		"removed" : {
			"ko" : "삭제됨",
			"en" : "Removed"
		},
		"revertmsg1" : {
			"ko" : "해당 커밋 시점으로 피쳐를 되돌립니다.",
			"en" : "Revert the feature to the point of time when it was committed."
		},
		"revertmsg2" : {
			"ko" : "진행하시겠습니까?",
			"en" : 'Do you want to proceed?'
		},
		"refresh" : {
			"ko" : "새로고침",
			"en" : 'Refresh'
		},
		"author" : {
			"ko" : "작성자",
			"en" : 'Author'
		},
		"nocommit" : {
			"ko" : "불러올 이력이 없습니다.",
			"en" : "No commits to load"
		},
		"nodetailretr" : {
			"ko" : "조회 가능한 개수를 초과하였습니다.",
			"en" : "You have exceeded the viewable number."
		},
		"unknown" : {
			"ko" : "알 수 없음",
			"en" : "Unknown"
		},
		"nochange" : {
			"ko" : "변경사항을 조회할 수 없었습니다.",
			"en" : "Changes could not be retrieved."
		},
		"beforeft" : {
			"ko" : "변경 전",
			"en" : "Before"
		},
		"afterft" : {
			"ko" : "변경 후",
			"en" : "After"
		},
		"firstcommit" : {
			"ko" : "가장 처음의 커밋입니다.",
			"en" : "This is the very first commit."
		},
		"revertsucc" : {
			"ko" : "객체가 성공적으로 되돌려졌습니다.",
			"en" : "Feature reverted successfully."
		},
		"revertfail" : {
			"ko" : "되돌리기 실패했습니다.",
			"en" : "Revert failed."
		},
		"conflictmsg1" : {
			"ko" : "충돌 객체가 있습니다. 해결하시겠습니까?",
			"en" : 'There are conflicting features. Do you want to resolve?'
		},
		"commitdesc" : {
			"ko" : "이 작업에 대한 설명을 입력해 주세요.",
			"en" : 'Please provide a description of this action.'
		}
	};
	var options = obj ? obj : {};
	/**
	 * 사용 언어
	 * 
	 * @type {string}
	 */
	this.locale = options.locale ? options.locale : "en";

	obj.width = 730;
	obj.height = 450;
	obj.title = this.translation.geogig[this.locale];
	obj.autoOpen = false;
	gb.modal.ModalBase.call(this, obj);
	var that = this;
	/**
	 * EPSG코드
	 * 
	 * @type {string}
	 */
	this.epsg = options.epsg ? options.epsg : undefined;
	var url = options.url ? options.url : {};
	/**
	 * 지오서버 트리 객체 요청 주소
	 * 
	 * @type {string}
	 */
	this.serverTreeURL = url.serverTree ? url.serverTree : undefined;
	/**
	 * 트랜잭션 아이디 발급 요청 주소
	 * 
	 * @type {string}
	 */
	this.beginTransactionURL = url.beginTransaction ? url.beginTransaction : undefined;
	/**
	 * 트랜잭션 아이디 종료 요청 주소
	 * 
	 * @type {string}
	 */
	this.endTransactionURL = url.endTransaction ? url.endTransaction : undefined;
	/**
	 * 트랜잭션 아이디 폐기 요청 주소
	 * 
	 * @type {string}
	 */
	this.cancelTransactionURL = url.cancelTransaction ? url.cancelTransaction : undefined;
	/**
	 * 체크아웃 요청 주소
	 * 
	 * @type {string}
	 */
	this.checkoutURL = url.checkoutBranch ? url.checkoutBranch : undefined;
	/**
	 * 원격 저장소 트리 구조 요청 주소
	 * 
	 * @type {string}
	 */
	this.remoteTreeURL = url.remoteTree ? url.remoteTree : undefined;
	/**
	 * 원격 저장소 삭제 요청 주소
	 * 
	 * @type {string}
	 */
	this.removeRemoteRepositoryURL = url.removeRemoteRepository ? url.removeRemoteRepository : undefined;
	/**
	 * 저장소 삭제 요청 주소
	 * 
	 * @type {string}
	 */
	this.removeRepositoryURL = url.removeRepository ? url.removeRepository : undefined;
	/**
	 * 브랜치 목록 요청 주소
	 * 
	 * @type {string}
	 */
	this.branchListURL = url.branchList ? url.branchList : undefined;
	/**
	 * 브랜치 머지 요청 주소
	 * 
	 * @type {string}
	 */
	this.mergeBranchURL = url.mergeBranch ? url.mergeBranch : undefined;
	/**
	 * 저장소 초기화 요청 주소
	 * 
	 * @type {string}
	 */
	this.initRepositoryURL = url.initRepository ? url.initRepository : undefined;
	/**
	 * 풀 요청 주소
	 * 
	 * @type {string}
	 */
	this.pullRepositoryURL = url.pullRepository ? url.pullRepository : undefined;
	/**
	 * 푸시 요청 주소
	 * 
	 * @type {string}
	 */
	this.pushRepositoryURL = url.pushRepository ? url.pushRepository : undefined;
	/**
	 * 브랜치 생성 요청 주소
	 * 
	 * @type {string}
	 */
	this.createBranchURL = url.createBranch ? url.createBranch : undefined;
	/**
	 * 원격 저장소 추가 요청 주소
	 * 
	 * @type {string}
	 */
	this.addRemoteRepositoryURL = url.addRemoteRepository ? url.addRemoteRepository : undefined;
	/**
	 * 충돌 해결 요청 주소
	 * 
	 * @type {string}
	 */
	this.resolveConflictURL = url.resolveConflict ? url.resolveConflict : undefined;
	/**
	 * 피처 비교 요청 주소
	 * 
	 * @type {string}
	 */
	this.featureBlameURL = url.featureBlame ? url.featureBlame : undefined;
	/**
	 * 오브젝트 아이디 기반 피처 비교 요청 주소
	 * 
	 * @type {string}
	 */
	this.catConflictFeatureObjectURL = url.catConflictFeatureObject ? url.catConflictFeatureObject : undefined;
	/**
	 * 데이터저장소 목록 요청 주소
	 * 
	 * @type {string}
	 */
	this.dataStoreListURL = url.dataStoreList ? url.dataStoreList : undefined;
	/**
	 * 레이어 목록 요청 주소
	 * 
	 * @type {string}
	 */
	this.listGeoserverLayerURL = url.listGeoserverLayer ? url.listGeoserverLayer : undefined;
	/**
	 * 레이어 발행 요청 주소
	 * 
	 * @type {string}
	 */
	this.publishGeogigLayerURL = url.publishGeogigLayer ? url.publishGeogigLayer : undefined;
	/**
	 * 레이어 삭제 요청 주소
	 * 
	 * @type {string}
	 */
	this.removeGeogigLayerURL = url.removeGeogigLayer ? url.removeGeogigLayer : undefined;
	/**
	 * 저장소 정보 요청 주소
	 * 
	 * @type {string}
	 */
	this.infoRepositoryURL = url.infoRepository ? url.infoRepository : undefined;
	/**
	 * 레이어 로그 요청 주소
	 * 
	 * @type {string}
	 */
	this.logLayerURL = url.logLayer ? url.logLayer : undefined;
	/**
	 * 레이어 변경 사항 요청 주소
	 * 
	 * @type {string}
	 */
	this.diffLayerURL = url.diffLayer ? url.diffLayer : undefined;
	/**
	 * 피처 비교 요청 주소
	 * 
	 * @type {string}
	 */
	this.featureDiffURL = url.featureDiff ? url.featureDiff : undefined;
	/**
	 * 피처 되돌리기 요청 주소
	 * 
	 * @type {string}
	 */
	this.featureRevertURL = url.featureRevert ? url.featureRevert : undefined;

	/**
	 * edit tool 활성화 여부 객체
	 * 
	 * @type {gb.module.isEditing}
	 */
	this.isEditing = options.isEditing || undefined;
	/**
	 * 현재 저장소
	 * 
	 * @type {Object}
	 */
	this.nowRepo = undefined;
	/**
	 * 현재 원격 저장소
	 * 
	 * @type {Object}
	 */
	this.nowRemoteRepo = undefined;
	/**
	 * 현재 서버
	 * 
	 * @type {Object}
	 */
	this.nowRepoServer = undefined;
	/**
	 * 현재 브랜치
	 * 
	 * @type {Object}
	 */
	this.nowBranch = undefined;
	/**
	 * 현재 레이어
	 * 
	 * @type {Object}
	 */
	this.nowLayer = undefined;

	/**
	 * @private
	 * @type {Array.<Object>}
	 */
	this.loadingList = [];
	/**
	 * @private
	 * @type {Array.<Object>}
	 */
	this.loadingNumber = [];
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.layerHistoryArea;
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.reRepoSelect = $("<select>").addClass("gb-form").addClass("gb-repository-repo-select");
	$(this.reRepoSelect).on("change", function() {
		console.log(this.value);
		var branches = that.remoteObj[this.value];
		$(that.reBranchSelect).empty();
		for (var i = 0; i < branches.length; i++) {
			var opt = $("<option>").text(branches[i]);
			$(that.reBranchSelect).append(opt);
		}
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.reBranchSelect = $("<select>").addClass("gb-form").addClass("gb-repository-branch-select");
	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.refBtn = $("<button>").addClass("gb-button-clear").append(refIcon).addClass("gb-button-float-right").click(function() {
		that.refreshList();
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.searchInput = $("<input>").attr({
		"type" : "text"
	}).addClass("gb-repository-search-input");
	$(this.searchInput).keyup(function() {
		// if (that.tout) {
		// clearTimeout(that.tout);
		// }
		// that.tout = setTimeout(function() {
		// var v = $(that.searchInput).val();
		// that.getJSTree().search(v);
		// }, 250);

		var root = that.getJSTree().get_node("#");
		var nodes = root.children;
		var callback = function() {
			var v = $(that.searchInput).val();
			that.getJSTree().search(v);
		};
		that.initLoadingList();
		that.initLoadingNumber();
		for (var i = 0; i < nodes.length; i++) {
			var pnodeid = nodes[i];
			console.log("선택한 노드:", pnodeid);
			console.log(that.getLoadingList());
			that.openNodeRecursive(i, that.getJSTree().get_node(nodes[i]), pnodeid, callback, true);
		}
	});
	var head = $("<div>").addClass("gb-article-head").append(this.searchInput).append(this.refBtn);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.treeArea = $("<div>");
	$(this.treeArea).jstree({
		"core" : {
			"animation" : 0,
			"check_callback" : true,
			"themes" : {
				"stripes" : true
			},
			"data" : {
				'url' : function(node) {
					var url = that.getServerTreeURL();
					return url;
				},
				"data" : function(node) {
					var obj = {};
					if (node.id === "#") {
						obj["type"] = "server";
					} else {
						if (node.type === "geoserver") {
							obj["type"] = "repository";
							obj["serverName"] = node.id;
							obj["node"] = node.id;
						} else if (node.type === "repository") {
							obj["type"] = "branch";
							obj["serverName"] = node.parent;
							obj["node"] = node.id;
							var tranId = that.getJSTree()._data.geogigfunction.transactionId;
							if (tranId.hasOwnProperty(node.id)) {
								obj["transactionId"] = tranId[node.id];
							}
						} else if (node.type === "branch") {
							obj["type"] = "layer";
							obj["serverName"] = node.parents[1];
							obj["node"] = node.id
						}
					}
					console.log(obj);
					return obj;
				}
			}

		},
		"search" : {
			show_only_matches : true
		},
		"types" : {
			"#" : {
				"valid_children" : [ "geoserver", "default", "error" ]
			},
			"default" : {
				"icon" : "fas fa-exclamation-circle"
			},
			"error" : {
				"icon" : "fas fa-exclamation-circle"
			},
			"geoserver" : {
				"icon" : "fas fa-globe",
				"valid_children" : [ "repository" ]
			},
			"repository" : {
				"icon" : "fas fa-archive",
				"valid_children" : [ "branch" ]
			},
			"branch" : {
				"icon" : "fas fa-code-branch",
				"valid_children" : [ "layer" ]
			},
			"layer" : {
				"icon" : "fas fa-file"
			}
		},
		"geogigfunction" : {
			"repository" : that,
			"status" : {
				"checkout" : "fas fa-check",
				"unstaged" : "gb-geogig-unstaged",
				"staged" : "gb-geogig-staged",
				"unmerged" : "gb-geogig-unmerged",
				"merged" : "gb-geogig-merged",
				"connected" : "fas fa-link",
				"disconnected" : "fas fa-unlink"
			}
		},
		"plugins" : [ "search", "types", "geogigfunction" ]
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.jstree = $(this.treeArea).jstree(true);

	// $(this.treeArea).on('open_node.jstree', function(e, data) {
	// console.log(data);
	// that.getJSTree().deselect_all();
	// that.getJSTree().select_node(data.node);
	// });
	var v = this.jstree.get_json('#', {
		no_state : true,
		flat : true
	});
	var json_obj = JSON.stringify(v);
	console.log(json_obj);
	var body = $("<div>").addClass("gb-repository-tree-body").append(this.treeArea);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.serverArea = $("<div>").append(head).append(body);

	var refRemoteIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.refreshRemoteTreeBtn = $("<button>").addClass("gb-button-clear").append(refRemoteIcon).click(function() {
		that.refreshRemoteList();
	}).addClass("gb-button-float-right");
	var addIcon = $("<i>").addClass("fas").addClass("fa-plus");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.addRemoteBtn = $("<button>").addClass("gb-button-clear").append(addIcon).click(function() {
		console.log("add remote");
		var server = that.getNowServer();
		var repo = that.getNowRepository();
		that.addRemoteRepoModal(server.text, repo.text);
	}).addClass("gb-button-float-right");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.remoteTitle = $("<span>");

	var backIcon = $("<i>").addClass("fas").addClass("fa-arrow-left");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.backToTreeBtn = $("<button>").addClass("gb-button-clear").append(backIcon).append(" ").append(this.remoteTitle).click(function() {
		that.transitPage("server");
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.remoteHead = $("<div>").addClass("gb-article-head").append(this.backToTreeBtn).append(this.addRemoteBtn).append(
			this.refreshRemoteTreeBtn);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.remoteTree = $("<div>");
	$(this.remoteTree).jstree({
		"core" : {
			"animation" : 0,
			"check_callback" : true,
			"themes" : {
				"stripes" : true
			},
			"data" : {
				'url' : function(node) {
					var url = that.getRemoteTreeURL();
					return url;
				},
				"data" : function(node) {
					var obj = {};
					// if (node.id === "#") {
					// obj["type"] = "server";
					// } else if (node.type === "geoserver") {
					// obj["type"] = "repository";
					// obj["serverName"] = node.id;
					// obj["node"] = node.id;
					// } else
					if (node.id === "#") {
						obj["type"] = "remoteRepository";
						obj["node"] = that.getNowRepository() !== undefined ? that.getNowRepository().id : undefined;
						obj["serverName"] = that.getNowServer() !== undefined ? that.getNowServer().id : undefined;
					} else if (node.type === "remoteRepository") {
						obj["type"] = "remoteBranch";
						obj["serverName"] = that.getNowServer() !== undefined ? that.getNowServer().id : undefined;
						obj["node"] = node.text;
						obj["local"] = that.getNowRepository() !== undefined ? that.getNowRepository().id : undefined;
						obj["fetch"] = that.getFetchRepository() === node.text ? true : false;
					}
					console.log(obj);
					return obj;
				}
			}

		},
		"search" : {
			show_only_matches : true
		},
		"types" : {
			"#" : {
				"valid_children" : [ "remoteRepository", "default", "error" ]
			},
			"default" : {
				"icon" : "fas fa-exclamation-circle"
			},
			"error" : {
				"icon" : "fas fa-exclamation-circle"
			},
			"remoteRepository" : {
				"icon" : "fas fa-archive",
				"valid_children" : [ "remoteBranch" ]
			},
			"remoteBranch" : {
				"icon" : "fas fa-code-branch",
				"valid_children" : [ "layer" ]
			},
			"layer" : {
				"icon" : "fas fa-file"
			}
		},
		"geogigfunction" : {
			"repository" : that,
			"status" : {
				"checkout" : "fas fa-check",
				"unstaged" : "gb-geogig-unstaged",
				"staged" : "gb-geogig-staged",
				"unmerged" : "gb-geogig-unmerged",
				"merged" : "gb-geogig-merged",
				"connected" : "fas fa-link",
				"disconnected" : "fas fa-unlink"
			}
		},
		"plugins" : [ "search", "types", "geogigfunction" ]
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.remotejstree = $(this.remoteTree).jstree(true);

	$(this.remoteTree).on("create_node.jstree", function(e, data) {
		console.log(e);
		console.log(data);
	}).jstree();
	var remoteBody = $("<div>").addClass("gb-repository-tree-remote-body").append(this.remoteTree);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.remoteArea = $("<div>").append(this.remoteHead).append(remoteBody);
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.historyArea = $("<div>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.newBranchArea = $("<div>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.geoserverNameVal = $("<span>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.repoNameVal = $("<span>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.cubNameVal = $("<span>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.tabNameVal = $("<select>").addClass("gb-form");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.failArea = $("<div>");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.mbody = $("<div>").addClass("gb-repository-body").append(this.serverArea).append(this.remoteArea).append(this.historyArea).append(
			this.failArea);
	this.setModalBody(this.mbody);
	$(this.getModalBody()).addClass("gb-repository-modal-body");
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]).click(function() {
		that.close();
	});

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);
	this.setModalFooter(buttonArea);
	this.getCheckoutBranchURL("server");
	this.transitPage("server");
	/**
	 * @type {ol.Map}
	 */
	this.conflictView1 = new ol.View({
		"center" : [ 0, 0 ],
		"zoom" : 1
	});
	/**
	 * @type {ol.Map}
	 */
	this.conflictView2 = new ol.View({
		"center" : [ 0, 0 ],
		"zoom" : 1
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.cfeature = $("<div>").addClass("gb-repository-map-body");
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.tfeature = $("<div>").addClass("gb-repository-map-body");
	/**
	 * @type {ol.Map}
	 */
	this.cmap = new ol.Map({
		"target" : $(this.cfeature)[0],
		// "view" : this.conflictView1,
		"layers" : []
	});
	/**
	 * @type {ol.Map}
	 */
	this.tmap = new ol.Map({
		"target" : $(this.tfeature)[0],
		// "view" : this.conflictView2,
		"layers" : []
	});

	this.crs = new gb.crs.BaseCRS({
		"autoOpen" : false,
		"title" : "Base CRS",
		"message" : $(".epsg-now"),
		"maps" : [ this.cmap, this.tmap ],
		"epsg" : typeof this.epsg === "function" ? this.epsg() : this.epsg
	});
	/**
	 * @private
	 * @type {HTMLElement}
	 */
	this.sourceSelect = undefined;
};
gb.versioning.Repository.prototype = Object.create(gb.modal.ModalBase.prototype);
gb.versioning.Repository.prototype.constructor = gb.versioning.Repository;

/**
 * 원격 GeoGig 저장소로 페이지를 전환한다.
 * 
 * @method gb.versioning.Repository#manageRemoteRepository
 * @param {string}
 *            server - GeoServer 이름
 * @param {string}
 *            repo - GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.manageRemoteRepository = function(server, repo) {
	var serverName = server;
	var repoName = repo;
	$(this.remoteTitle).empty();
	$(this.remoteTitle).text(repoName);
	this.transitPage("remote");
	this.refreshRemoteList();
};

/**
 * 페이지를 전환한다.
 * 
 * @method gb.versioning.Repository#transitPage
 * @param {string}
 *            page - 전환할 페이지 이름 (server, remote, history, newbranch, merge,
 *            fail)
 */
gb.versioning.Repository.prototype.transitPage = function(page) {
	if (page === "server") {
		$(this.remoteArea).hide();
		$(this.historyArea).hide();
		$(this.newBranchArea).hide();
		$(this.mergeArea).hide();
		$(this.failArea).hide();
		$(this.serverArea).show();
	} else if (page === "remote") {
		$(this.historyArea).hide();
		$(this.newBranchArea).hide();
		$(this.mergeArea).hide();
		$(this.failArea).hide();
		$(this.serverArea).hide();
		$(this.remoteArea).show();
	} else if (page === "history") {
		$(this.remoteArea).hide();
		$(this.newBranchArea).hide();
		$(this.mergeArea).hide();
		$(this.failArea).hide();
		$(this.serverArea).hide();
		$(this.historyArea).show();
	} else if (page === "newbranch") {
		$(this.remoteArea).hide();
		$(this.historyArea).hide();
		$(this.mergeArea).hide();
		$(this.failArea).hide();
		$(this.serverArea).hide();
		$(this.newBranchArea).show();
	} else if (page === "merge") {
		$(this.remoteArea).hide();
		$(this.historyArea).hide();
		$(this.newBranchArea).hide();
		$(this.failArea).hide();
		$(this.serverArea).hide();
		$(this.mergeArea).show();
	} else if (page === "fail") {
		$(this.remoteArea).hide();
		$(this.historyArea).hide();
		$(this.newBranchArea).hide();
		$(this.mergeArea).hide();
		$(this.serverArea).hide();
		$(this.failArea).show();
	}
};

/**
 * 트랜잭션 아이디를 요청한다.
 * 
 * @method gb.versioning.Repository#beginTransaction
 * @param {string}
 *            serverName - GeoServer 이름
 * @param {string}
 *            repoName - GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.beginTransaction = function(serverName, repoName) {
	var params = {
		"serverName" : serverName,
		"repoName" : repoName
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getBeginTransactionURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {

			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 트랜잭션 아이디를 종료한다.
 * 
 * @method gb.versioning.Repository#endTransaction
 * @param {string}
 *            serverName - 등록한 GeoServer 이름
 * @param {string}
 *            repoName - GeoGig 저장소 이름
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {gb.modal.ModalBase}
 *            modal - 작업 완료후 닫을 Modal 객체
 */
gb.versioning.Repository.prototype.endTransaction = function(serverName, repoName, tid, modal) {
	var that = this;
	var params = {
		"serverName" : serverName,
		"repoName" : repoName,
		"transactionId" : tid
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getEndTransactionURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				var repo = that.getNowRepository();
				if (repo.text === repoName) {
					modal.close();
					that.getJSTree().removeTransactionId(repo.id);
					that.transitPage("server");
					that.refreshList();
				}
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 트랜잭션 아이디를 폐기한다.
 * 
 * @method gb.versioning.Repository#cancelTransaction
 * @param {string}
 *            serverName - 등록한 GeoServer 이름
 * @param {string}
 *            repoName - GeoGig 저장소 이름
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {gb.modal.ModalBase}
 *            modal - 작업 완료후 닫을 Modal 객체
 * @param {function}
 *            callback - 폐기 후 수행할 콜백함수
 */
gb.versioning.Repository.prototype.cancelTransaction = function(serverName, repoName, tid, modal, callback) {
	var that = this;
	var params = {
		"serverName" : serverName,
		"repoName" : repoName,
		"transactionId" : tid
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getCancelTransactionURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				var repo = that.getNowRepository();
				if (repo.text === repoName) {
					modal.close();
					that.getJSTree().removeTransactionId(repo.id);
					that.transitPage("server");
					that.refreshList();
					callback();
				}
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 해당 GeoGig 저장소의 브랜치 목록을 조회한다.
 * 
 * @method gb.versioning.Repository#getBranchList
 * @param {string}
 *            serverName - 등록한 서버 이름
 * @param {string}
 *            repoName - GeoGig repository 이름
 * @param {function}
 *            callback - 콜백함수
 */
gb.versioning.Repository.prototype.getBranchList = function(serverName, repoName, callback) {
	var params = {
		"serverName" : serverName,
		"repoName" : repoName
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getBranchListURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			callback(data);
		}
	});
};

/**
 * GeoGig 목록을 새로고침한다.
 * 
 * @method gb.versioning.Repository#refreshList
 */
gb.versioning.Repository.prototype.refreshList = function() {
	this.getJSTree().refresh();
};

/**
 * Remote repository 목록을 새로고침한다.
 * 
 * @method gb.versioning.Repository#refreshRemoteList
 */
gb.versioning.Repository.prototype.refreshRemoteList = function() {
	this.getRemoteJSTree().refresh();
};

/**
 * jsTree 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getJSTree
 * @return {$.jstree}
 */
gb.versioning.Repository.prototype.getJSTree = function() {
	return this.jstree;
};

/**
 * 원격 저장소 jsTree 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getRemoteJSTree
 * @return {$.jstree}
 */
gb.versioning.Repository.prototype.getRemoteJSTree = function() {
	return this.remotejstree;
};

/**
 * GeoServer의 GeoGig 목록 트리 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getServerTreeURL
 * @return {string} GeoGig 목록 요청 요청 URL
 */
gb.versioning.Repository.prototype.getServerTreeURL = function() {
	return this.serverTreeURL;
};

/**
 * 트랜잭션 아이디 발급 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getBeginTransactionURL
 * @return {string} 트랜잭션 아이디 발급 요청 URL
 */
gb.versioning.Repository.prototype.getBeginTransactionURL = function() {
	return this.beginTransactionURL;
};

/**
 * 트랜잭션 아이디 종료 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getEndTransactionURL
 * @return {string} 트랜잭션 아이디 종료 요청 URL
 */
gb.versioning.Repository.prototype.getEndTransactionURL = function() {
	return this.endTransactionURL;
};

/**
 * 트랜잭션 아이디 폐기 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getCancelTransactionURL
 * @return {string} 트랜잭션 아이디 폐기 요청 URL
 */
gb.versioning.Repository.prototype.getCancelTransactionURL = function() {
	return this.cancelTransactionURL;
};

/**
 * 브랜치 체크아웃 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getCheckoutBranchURL
 * @return {string} 체크아웃 요청 요청 URL
 */
gb.versioning.Repository.prototype.getCheckoutBranchURL = function() {
	return this.checkoutURL;
};

/**
 * 브랜치 리스트 조회 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getBranchListURL
 * @return {string} 브랜치 조회 URL
 */
gb.versioning.Repository.prototype.getBranchListURL = function() {
	return this.branchListURL;
};

/**
 * 원격 GeoGig 저장소 트리 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getRemoteTreeURL
 * @return {string} 원격 저장소 트리 요청 URL
 */
gb.versioning.Repository.prototype.getRemoteTreeURL = function() {
	return this.remoteTreeURL;
};

/**
 * 원격 GeoGig 저장소 삭제 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getRemoveRemoteRepositoryURL
 * @return {string} 원격 저장소 삭제 요청 URL
 */
gb.versioning.Repository.prototype.getRemoveRemoteRepositoryURL = function() {
	return this.removeRemoteRepositoryURL;
};

/**
 * GeoGig 저장소 삭제 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getRemoveRepositoryURL
 * @return {string} GeoGig 저장소 삭제 요청 URL
 */
gb.versioning.Repository.prototype.getRemoveRepositoryURL = function() {
	return this.removeRepositoryURL;
};

/**
 * 브랜치 머지 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getMergeBranchURL
 * @return {string} 머지 요청 URL
 */
gb.versioning.Repository.prototype.getMergeBranchURL = function() {
	return this.mergeBranchURL;
};

/**
 * GeoGig 저장소 생성 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getInitRepositoryURL
 * @return {string} GeoGig 저장소 생성 요청 URL
 */
gb.versioning.Repository.prototype.getInitRepositoryURL = function() {
	return this.initRepositoryURL;
};

/**
 * 브랜치 생성 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getCreateBranchURL
 * @return {string} 브랜치 생성 요청 URL
 */
gb.versioning.Repository.prototype.getCreateBranchURL = function() {
	return this.createBranchURL;
};

/**
 * Pull 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getPullRepositoryURL
 * @return {string} Pull 요청 URL
 */
gb.versioning.Repository.prototype.getPullRepositoryURL = function() {
	return this.pullRepositoryURL;
};

/**
 * Push 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getPushRepositoryURL
 * @return {string} Push 요청 URL
 */
gb.versioning.Repository.prototype.getPushRepositoryURL = function() {
	return this.pushRepositoryURL;
};

/**
 * 원격 저장소 추가 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getAddRemoteRepositoryURL
 * @return {string} 원격 저장소 추가 URL
 */
gb.versioning.Repository.prototype.getAddRemoteRepositoryURL = function() {
	return this.addRemoteRepositoryURL;
};

/**
 * resolve conflict 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getResolveConflictURL
 * @return {string} 충동 해결 요청 URL
 */
gb.versioning.Repository.prototype.getResolveConflictURL = function() {
	return this.resolveConflictURL;
};

/**
 * 최신 피처 속성 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getFeatureBlameURL
 * @return {string} 최신 피처 속성 요청 URL
 */
gb.versioning.Repository.prototype.getFeatureBlameURL = function() {
	return this.featureBlameURL;
};

/**
 * 충돌 피처 조회 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getCatConflictFeatureObjectURL
 * @return {string} 피처 조회 요청 URL
 */
gb.versioning.Repository.prototype.getCatConflictFeatureObjectURL = function() {
	return this.catConflictFeatureObjectURL;
};

/**
 * 데이터저장소 목록 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getDataStoreListURL
 * @return {string} 데이터저장소 목록 요청 URL
 */
gb.versioning.Repository.prototype.getDataStoreListURL = function() {
	return this.dataStoreListURL;
};

/**
 * GeoServer 레이어 목록 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getListGeoserverLayerURL
 * @return {string} 레이어 목록 요청 URL
 */
gb.versioning.Repository.prototype.getListGeoserverLayerURL = function() {
	return this.listGeoserverLayerURL;
};

/**
 * GeoGig 레이어 발행 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getPublishGeogigLayerURL
 * @return {string} 레이어 발행 요청 URL
 */
gb.versioning.Repository.prototype.getPublishGeogigLayerURL = function() {
	return this.publishGeogigLayerURL;
};

/**
 * GeoGig 레이어 삭제 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getRemoveGeogigLayerURL
 * @return {string} 레이어 삭제 요청 URL
 */
gb.versioning.Repository.prototype.getRemoveGeogigLayerURL = function() {
	return this.removeGeogigLayerURL;
};

/**
 * GeoGig저장소 정보 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getInfoRepositoryURL
 * @return {string} 저장소 정보 요청 URL
 */
gb.versioning.Repository.prototype.getInfoRepositoryURL = function() {
	return this.infoRepositoryURL;
};

/**
 * 레이어 이력 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getLogLayerURL
 * @return {string} 레이어 이력 요청 URL
 */
gb.versioning.Repository.prototype.getLogLayerURL = function() {
	return this.logLayerURL;
};

/**
 * 레이어 변경 이력 상세 정보 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getDiffLayerURL
 * @return {string} 상세정보 요청 URL
 */
gb.versioning.Repository.prototype.getDiffLayerURL = function() {
	return this.diffLayerURL;
};

/**
 * 피처 변경 상세정보 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getFeatureDiffURL
 * @return {string} 상세정보 요청 URL
 */
gb.versioning.Repository.prototype.getFeatureDiffURL = function() {
	return this.featureDiffURL;
};

/**
 * 현재 보고있는 원격 GeoGig 저장소 노드 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getNowRemoteRepository
 * @return {Object} 원격 GeoGig 저장소 노드 객체
 */
gb.versioning.Repository.prototype.getNowRemoteRepository = function() {
	return this.nowRemoteRepo;
};

/**
 * 현재 보고있는 원격 GeoGig 저장소 노드 객체를 설정한다.
 * 
 * @method gb.versioning.Repository#setNowRemoteRepository
 * @param {Object}
 *            repo - 원격 GeoGig 저장소 노드
 */
gb.versioning.Repository.prototype.setNowRemoteRepository = function(repo) {
	this.nowRemoteRepo = repo;
};

/**
 * 현재 보고있는 브랜치 노드 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getNowBranch
 * @return {Object} GeoGig 브랜치 노드 객체
 */
gb.versioning.Repository.prototype.getNowBranch = function() {
	return this.nowBranch;
};

/**
 * 현재 보고있는 브랜치 노드 객체를 설정한다.
 * 
 * @method gb.versioning.Repository#setNowBranch
 * @param {Object}
 *            branch - GeoGig 브랜치 노드 객체
 */
gb.versioning.Repository.prototype.setNowBranch = function(branch) {
	this.nowBranch = branch;
};

/**
 * 현재 보고있는 레이어 노드 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getNowLayer
 * @return {Object} 레이어 노드 객체
 */
gb.versioning.Repository.prototype.getNowLayer = function() {
	return this.nowLayer;
};

/**
 * 현재 보고있는 레이어 노드 객체를 설정한다.
 * 
 * @method gb.versioning.Repository#setNowLayer
 * @param {Object}
 *            layer - 레이어 노드 객체
 */
gb.versioning.Repository.prototype.setNowLayer = function(layer) {
	this.nowLayer = layer;
};

/**
 * 현재 보고있는 GeoGig 저장소 노드 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getNowRepository
 * @return {Object} GeoGig 저장소 노드 객체
 */
gb.versioning.Repository.prototype.getNowRepository = function() {
	return this.nowRepo;
};

/**
 * 현재 보고있는 GeoGig 저장소 노드 객체를 설정한다.
 * 
 * @method gb.versioning.Repository#setNowRepository
 * @param {Object}
 *            repo - GeoGig 저장소 노드 객체
 */
gb.versioning.Repository.prototype.setNowRepository = function(repo) {
	this.nowRepo = repo;
};

/**
 * 현재 보고있는 GeoGig 저장소의 서버 노드 객체를 반환한다.
 * 
 * @method gb.versioning.Repository#getNowServer
 * @return {Object} GeoGig 저장소 서버 노드 객체
 */
gb.versioning.Repository.prototype.getNowServer = function() {
	return this.nowRepoServer;
};

/**
 * 현재 보고있는 GeoGig 저장소의 서버 노드 객체를 설정한다.
 * 
 * @method gb.versioning.Repository#setNowServer
 * @param {Object}
 *            server - GeoGig 저장소 서버 노드 객체
 */
gb.versioning.Repository.prototype.setNowServer = function(server) {
	this.nowRepoServer = server;
};

/**
 * 지오긱 모달을 연다.
 * 
 * @method gb.versioning.Repository#open
 * @override
 */
gb.versioning.Repository.prototype.open = function() {
	if (this.isEditing instanceof Object) {
		if (this.isEditing.get()) {
			this.isEditing.alert();
			return;
		}
	}

	gb.modal.ModalBase.prototype.open.call(this);
	this.refreshList();
};

/**
 * 브랜치를 체크아웃 한다.
 * 
 * @method gb.versioning.Repository#checkoutBranch
 * @param {Object}
 *            server - 작업 중인 서버 노드 객체 객체
 * @param {Object}
 *            repo - 작업 중인 저장소 노드 객체
 * @param {Object}
 *            branch - 작업 중인 브랜치 노드 객체
 */
gb.versioning.Repository.prototype.checkoutBranch = function(server, repo, branch) {
	var that = this;
	var branches = repo.children;
	var isCheckedout = false;
	for (var i = 0; i < branches.length; i++) {
		var br = that.getJSTree().get_node(branches[i]);
		var bname = br.text;
		if (branch.text !== bname) {
			var state = br.state;
			if (state.hasOwnProperty("merged") || state.hasOwnProperty("unmerged") || state.hasOwnProperty("staged")
					|| state.hasOwnProperty("unstaged")) {
				isCheckedout = true;
				break;
			}
		}
	}
	var callback = function() {
		var params = {
			"serverName" : server.text,
			"repoName" : repo.text,
			"branchName" : branch.text
		}
		// + "&" + jQuery.param(params),
		var checkURL = that.getCheckoutBranchURL();
		if (checkURL.indexOf("?") !== -1) {
			checkURL += "&";
			checkURL += jQuery.param(params);
		} else {
			checkURL += "?";
			checkURL += jQuery.param(params);
		}

		$.ajax({
			url : checkURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			// data : params,
			// dataType : 'jsonp',
			// jsonpCallback : 'getJson',
			beforeSend : function() {
				// $("body").css("cursor", "wait");
			},
			complete : function() {
				// $("body").css("cursor", "default");
			},
			success : function(data) {
				console.log(data);
				if (data.success === "true") {
					var transactionId = data.transactionId;
					var newTarget = data.newTarget;
					var ggfn = that.getJSTree()._data.geogigfunction;
					ggfn.transactionId[repo.id] = transactionId;
					console.log(ggfn);
					that.setNowBranch(branch);
					that.getJSTree().refresh_node(repo);
					that.getJSTree().deselect_all();
					that.getJSTree().select_node(branch);
				} else {
					var title = this.translation.err[this.locale];
					var msg = this.translation.chkoutfail[this.locale];
					that.messageModal(title, msg);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {

			}
		});
	};

	if (isCheckedout) {
		var msg1 = $("<div>").text(this.translation.ischkout1[this.locale]).addClass("gb-repository-msg16");
		var msg2 = $("<div>").text(this.translation.ischkout2[this.locale]).addClass("gb-repository-msg16");
		var body = $("<div>").append(msg1).append(msg2);
		var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
				this.translation.cancel[this.locale]);
		var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
				this.translation.dnc[this.locale]);
		var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

		var commitModal = new gb.modal.ModalBase({
			"title" : this.translation.warning[this.locale],
			"width" : 310,
			"height" : 200,
			"autoOpen" : true,
			"body" : body,
			"footer" : buttonArea
		});
		$(closeBtn).click(function() {
			commitModal.close();
		});
		$(okBtn).click(function() {
			var tid = that.getJSTree().getTransactionId(repo.id);
			that.cancelTransaction(server.text, repo.text, tid, commitModal, callback);
		});
	} else {
		callback();
	}
};

/**
 * 브랜치를 머지 한다.
 * 
 * @method gb.versioning.Repository#mergeBranch
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 * @param {string}
 *            branch - 작업 중인 브랜치 이름
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {gb.modal.ModalBase}
 *            mModal - 머지 완료후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.mergeBranch = function(server, repo, branch, tid, mModal) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"branchName" : branch,
		"transactionId" : tid
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getMergeBranchURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				if (data.merge.conflicts === null) {
					var msg1 = $("<div>").text(that.translation.mergecompl1[that.locale]).addClass("gb-repository-msg16");
					var msg2 = $("<div>").text(that.translation.mergecompl2[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.later[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.commit[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.cmitchnges[that.locale],
						"width" : 310,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(function() {
						mModal.close();
						that.endTransaction(server, repo, tid, commitModal);
					});
				} else {
					var confl = parseInt(data.merge.conflicts);
					console.log(confl);
					var msg1 = $("<div>").text(that.translation.conflmsg1[that.locale]).addClass("gb-repository-msg16");
					var msg2 = $("<div>").text(that.translation.conflmsg2[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.cancel[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.resolve[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.conflicts[that.locale],
						"width" : 310,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(
							function() {
								mModal.close();
								// that.endTransaction(server, repo, tid,
								// commitModal);
								that.resolveConflictModal(server, repo, repo, that.getNowBranch().text, branch, data.merge.ours,
										data.merge.theirs, data.merge.features, commitModal);
							});
				}
			} else {
				var title = that.translation.err[that.locale];
				var msg = that.translation.mergefail[that.locale];
				that.messageModal(title, msg);
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});
};

/**
 * 원격 GeoGig 저장소를 삭제한다.
 * 
 * @method gb.versioning.Repository#removeRemoteRepository
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 * @param {string}
 *            remote - 작업 중인 원격 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.removeRemoteRepository = function(server, repo, remote) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"remoteName" : remote
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getRemoveRemoteRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	var msg1 = $("<div>").text(this.translation.removeremoterepomsg[this.locale]).addClass("gb-repository-msg16");
	var msg2 = $("<div>").text('"' + remote + '"').addClass("gb-repository-msg24");
	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.remove[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var removeModal = new gb.modal.ModalBase({
		"title" : this.translation.removeremoterepo[this.locale],
		"width" : 310,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		removeModal.close();
	});
	$(okBtn).click(function() {
		$.ajax({
			url : checkURL,
			method : "POST",
			contentType : "application/json; charset=UTF-8",
			// data : params,
			// dataType : 'jsonp',
			// jsonpCallback : 'getJson',
			beforeSend : function() {
				// $("body").css("cursor", "wait");
			},
			complete : function() {
				// $("body").css("cursor", "default");
			},
			success : function(data) {
				console.log(data);
				if (data.success === "true") {
					that.refreshRemoteList();
					removeModal.close();
				} else {
					var title = this.translation.err[this.locale];
					var msg = this.translation.removeremotefail[this.locale];
					that.messageModal(title, msg);
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				var title = this.translation.err[this.locale];
				var msg = this.translation.removeremotefail[this.locale];
				that.messageModal(title, msg);
			}
		});
	});
};

/**
 * pull 요청한다.
 * 
 * @method gb.versioning.Repository#pullRepository
 * @param {string}
 *            server - 작업 중인 서버
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소
 * @param {string}
 *            branch - 작업 중인 브랜치
 * @param {string}
 *            remoteRepo - 원격 GeoGig 저장소
 * @param {string}
 *            remoteBranch - 원격 브랜치
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {gb.modal.ModalBase}
 *            modal - 요청 완료 후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.pullRepository = function(server, repo, branch, remoteRepo, remoteBranch, tid, modal) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"branchName" : branch,
		"remoteName" : remoteRepo,
		"remoteBranchName" : remoteBranch,
		"transactionId" : tid
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getPullRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				if (data.pull === null && data.merge !== null) {
					var confl = parseInt(data.merge.conflicts);
					console.log(confl);
					var msg1 = $("<div>").text(that.translation.conflmsg1[that.locale]).addClass("gb-repository-msg16");
					var msg2 = $("<div>").text(that.translation.conflmsg2[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.cancel[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.resolve[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.conflicts[that.locale],
						"width" : 310,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(
							function() {
								modal.close();
								// that.endTransaction(server, repo, tid,
								// commitModal);
								that.resolveConflictModal(server, repo, remoteRepo, that.getNowBranch().text, remoteBranch,
										data.merge.ours, data.merge.theirs, data.merge.features, commitModal);
							});
				} else {
					var msg1 = $("<div>").text(that.translation.pullcompl[that.locale]).addClass("gb-repository-msg16");
					var msg2 = $("<div>").text(that.translation.mergecompl2[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.later[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.commit[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.cmitchnges[that.locale],
						"width" : 310,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(function() {
						that.endTransaction(server, repo, tid, commitModal);
						var nid = server + ":" + repo + ":" + remoteRepo + ":" + remoteBranch;
						console.log(nid);
						console.log(that.getRemoteJSTree()._data.geogigfunction.fetchRemote);
						that.getRemoteJSTree().removeFetchCount(nid);
						console.log(that.getRemoteJSTree()._data.geogigfunction.fetchRemote);
					});
				}
			} else {
				var title = that.translation.err[that.locale];
				var msg = that.translation.pullfail[that.locale];
				that.messageModal(title, msg);
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});
};

/**
 * push 요청한다.
 * 
 * @method gb.versioning.Repository#pushRepository
 * @param {string}
 *            server - 작업 중인 서버
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소
 * @param {string}
 *            branch - 작업 중인 브랜치
 * @param {string}
 *            remoteRepo - 원격 GeoGig 저장소
 * @param {string}
 *            remoteBranch - 원격 브랜치
 * @param {string}
 *            tid - 트랜잭션 아이디
 */
gb.versioning.Repository.prototype.pushRepository = function(server, repo, branch, remoteRepo, remoteBranch, modal) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"branchName" : branch,
		"remoteName" : remoteRepo,
		"remoteBranchName" : remoteBranch
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getPushRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				var msg2 = "";
				if (data.dataPushed === "true") {
					msg2 = $("<div>").text(that.translation.pushmsg1[that.locale]).addClass("gb-repository-msg16");
				} else {
					msg2 = $("<div>").text(that.translation.pushmsg2[that.locale]).addClass("gb-repository-msg16");
				}
				var msg1 = $("<div>").text(that.translation.pushcompl[that.locale]).addClass("gb-repository-msg16");

				var body = $("<div>").append(msg1).append(msg2);
				// var closeBtn = $("<button>").css({
				// "float" : "right"
				// }).addClass("gb-button").addClass("gb-button-default").text("Later");
				var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
						that.translation.ok[that.locale]);
				var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

				var commitModal = new gb.modal.ModalBase({
					"title" : that.translation.message[that.locale],
					"width" : 310,
					"height" : 190,
					"autoOpen" : true,
					"body" : body,
					"footer" : buttonArea
				});
				// $(closeBtn).click(function() {
				// commitModal.close();
				// });
				$(okBtn).click(function() {
					// that.endTransaction(server, repo, tid, commitModal);
					commitModal.close();
				});
			} else {
				var title = that.translation.err[that.locale];
				var msg = that.translation.pushfail[that.locale];
				that.messageModal(title, msg);
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});
};

/**
 * pull 요청 창을 생성한다.
 * 
 * @method gb.versioning.Repository#pullRepositoryModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 * @param {string}
 *            tid - 작업 중인 GeoGig 저장소의 트랜잭션 아이디
 */
gb.versioning.Repository.prototype.pullRepositoryModal = function(server, repo, tid) {
	var that = this;
	var reLabel = $("<div>").text(this.translation.remote[this.locale]).addClass("gb-repository-remote-label");
	$(this.reRepoSelect).empty();
	var reRepo = $("<div>").append(this.reRepoSelect);
	$(this.reBranchSelect).empty();
	var reBranch = $("<div>").append(this.reBranchSelect).addClass("gb-repository-remote-branch-select");
	var remote = $("<div>").addClass("gb-repository-remote-area").append(reLabel).append(reRepo).append(reBranch);
	var loLabel = $("<div>").text(this.translation.local[this.locale]).addClass("gb-repository-local-label");
	var loRepo = $("<div>").addClass("gb-form").append(this.getNowRepository().text);
	var loBranch = $("<div>").addClass("gb-form").append(this.getNowBranch().text).addClass("gb-repository-local-branch-select");
	var local = $("<div>").addClass("gb-repository-local-area").append(loLabel).append(loRepo).append(loBranch);

	var arrow = $("<i>").addClass("fas").addClass("fa-angle-double-left");
	var arrowArea = $("<div>").addClass("gb-repository-arrow-area").append(arrow);

	var wrap = $("<div>").addClass("gb-repository-pull-area").append(local).append(arrowArea).append(remote);
	var body = $("<div>").append(wrap);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.pull[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var commitModal = new gb.modal.ModalBase({
		"title" : this.translation.pull[this.locale],
		"width" : 410,
		"height" : 234,
		"autoOpen" : false,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		commitModal.close();
	});
	$(okBtn).click(
			function() {
				console.log($(that.reRepoSelect).val());
				console.log($(that.reBranchSelect).val());
				console.log(tid);

				that.pullRepository(server, repo, that.getNowBranch().text, $(that.reRepoSelect).val(), $(that.reBranchSelect).val(), tid,
						commitModal);
			});
	this.remoteObj = {};
	var callback = function(data) {
		if (data.success === "true") {
			var branches = data.remoteBranchList;
			if (Array.isArray(branches)) {
				for (var i = 0; i < branches.length; i++) {
					var branch = branches[i];
					if (!that.remoteObj.hasOwnProperty(branch.remoteName)) {
						that.remoteObj[branch.remoteName] = [];
					}
					that.remoteObj[branch.remoteName].push(branch.name);
				}
			}
			console.log(that.remoteObj);
			var rRepos = Object.keys(that.remoteObj);
			for (var i = 0; i < rRepos.length; i++) {
				var opt = $("<option>").text(rRepos[i]);
				$(that.reRepoSelect).append(opt);
			}
			var rbranches = that.remoteObj[$(that.reRepoSelect).val()];
			$(that.reBranchSelect).empty();
			if (Array.isArray(rbranches)) {
				for (var i = 0; i < rbranches.length; i++) {
					var opt = $("<option>").text(rbranches[i]);
					$(that.reBranchSelect).append(opt);
				}
				commitModal.open();
			} else {
				console.error("error - no remote branch");
				var title = that.translation.err[that.locale];
				var msg = that.translation.noremote[that.locale];
				that.messageModal(title, msg);
			}
		} else {
			that.errorModal(data.error);
		}
	};
	this.getBranchList(server, repo, callback);
};

/**
 * push 요청 창을 생성한다.
 * 
 * @method gb.versioning.Repository#pushRepositoryModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.pushRepositoryModal = function(server, repo) {
	var that = this;
	var reLabel = $("<div>").text(this.translation.remote[this.locale]).addClass("gb-repository-remote-label");
	$(this.reRepoSelect).empty();
	var reRepo = $("<div>").append(this.reRepoSelect);
	$(this.reBranchSelect).empty();
	var reBranch = $("<div>").append(this.reBranchSelect).addClass("gb-repository-remote-branch-select");
	var remote = $("<div>").addClass("gb-repository-remote-area").append(reLabel).append(reRepo).append(reBranch);
	var loLabel = $("<div>").text(this.translation.local[this.locale]).addClass("gb-repository-local-label");
	var loRepo = $("<div>").append(this.getNowRepository().text).addClass("gb-form");
	var loBranch = $("<div>").append(this.getNowBranch().text).addClass("gb-form").addClass("gb-repository-local-branch-select");
	var local = $("<div>").addClass("gb-repository-local-area").append(loLabel).append(loRepo).append(loBranch);

	var arrow = $("<i>").addClass("fas").addClass("fa-angle-double-right");
	var arrowArea = $("<div>").addClass("gb-repository-arrow-area").append(arrow);

	var wrap = $("<div>").addClass("gb-repository-push-area").append(local).append(arrowArea).append(remote);
	var body = $("<div>").append(wrap);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.push[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var commitModal = new gb.modal.ModalBase({
		"title" : this.translation.push[this.locale],
		"width" : 410,
		"height" : 234,
		"autoOpen" : false,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		commitModal.close();
	});
	$(okBtn).click(function() {
		console.log($(that.reRepoSelect).val());
		console.log($(that.reBranchSelect).val());

		that.pushRepository(server, repo, that.getNowBranch().text, $(that.reRepoSelect).val(), $(that.reBranchSelect).val(), commitModal);
	});
	this.remoteObj = {};
	var callback = function(data) {
		if (data.success === "true") {
			var branches = data.remoteBranchList;
			if (Array.isArray(branches)) {
				for (var i = 0; i < branches.length; i++) {
					var branch = branches[i];
					if (!that.remoteObj.hasOwnProperty(branch.remoteName)) {
						that.remoteObj[branch.remoteName] = [];
					}
					that.remoteObj[branch.remoteName].push(branch.name);
				}
			}
			console.log(that.remoteObj);
			var rRepos = Object.keys(that.remoteObj);
			for (var i = 0; i < rRepos.length; i++) {
				var opt = $("<option>").text(rRepos[i]);
				$(that.reRepoSelect).append(opt);
			}
			var rbranches = that.remoteObj[$(that.reRepoSelect).val()];
			$(that.reBranchSelect).empty();
			if (Array.isArray(rbranches)) {
				for (var i = 0; i < rbranches.length; i++) {
					var opt = $("<option>").text(rbranches[i]);
					$(that.reBranchSelect).append(opt);
				}
				commitModal.open();
			} else {
				console.error("error - no remote branch");
				var title = that.translation.err[that.locale];
				var msg = that.translation.noremote[that.locale];
				that.messageModal(title, msg);
			}
		} else {
			var title = this.translation.err[this.locale];
			var msg = this.translation.nobranchlist[this.locale];
			that.messageModal(title, msg);
		}
	};
	this.getBranchList(server, repo, callback);
};

/**
 * GeoGig 저장소 생성 창을 연다.
 * 
 * @method gb.versioning.Repository#initRepositoryModal
 */
gb.versioning.Repository.prototype.initRepositoryModal = function() {
	var that = this;

	var rName = $("<div>").text(this.translation.name[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rNameInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.namemsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rNameInputDiv = $("<div>").append(rNameInput).addClass("gb-repository-init-input-cell");
	var rNameArea = $("<div>").append(rName).append(rNameInputDiv).addClass("gb-repository-init-input-row");

	var rHost = $("<div>").text(this.translation.host[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rHostInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.hostmsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rHostInputDiv = $("<div>").append(rHostInput).addClass("gb-repository-init-input-cell");
	var rHostArea = $("<div>").append(rHost).append(rHostInputDiv).addClass("gb-repository-init-input-row");

	var rPort = $("<div>").text(this.translation.port[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rPortInput = $("<input>").attr({
		"type" : "number",
		"placeholder" : this.translation.portmsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rPortInputDiv = $("<div>").append(rPortInput).addClass("gb-repository-init-input-cell");
	var rPortArea = $("<div>").append(rPort).append(rPortInputDiv).addClass("gb-repository-init-input-row");

	var rDB = $("<div>").text(this.translation.db[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rDBInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.dbmsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rDBInputDiv = $("<div>").append(rDBInput).addClass("gb-repository-init-input-cell");
	var rDBArea = $("<div>").append(rDB).append(rDBInputDiv).addClass("gb-repository-init-input-row");

	var rScheme = $("<div>").text(this.translation.scheme[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rSchemeInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.schememsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rSchemeInputDiv = $("<div>").append(rSchemeInput).addClass("gb-repository-init-input-cell");
	var rSchemeArea = $("<div>").append(rScheme).append(rSchemeInputDiv).addClass("gb-repository-init-input-row");

	var rID = $("<div>").text(this.translation.username[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rIDInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.usernamemsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rIDInputDiv = $("<div>").append(rIDInput).addClass("gb-repository-init-input-cell");
	var rIDArea = $("<div>").append(rID).append(rIDInputDiv).addClass("gb-repository-init-input-row");

	var rPass = $("<div>").text(this.translation.password[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rPassInput = $("<input>").attr({
		"type" : "password",
		"placeholder" : this.translation.passwordmsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rPassInputDiv = $("<div>").append(rPassInput).addClass("gb-repository-init-input-cell");
	var rPassArea = $("<div>").append(rPass).append(rPassInputDiv).addClass("gb-repository-init-input-row");

	var rrName = $("<div>").text(this.translation.remoreponame[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rrNameInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.remoreponamemsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rrNameInputDiv = $("<div>").append(rrNameInput).addClass("gb-repository-init-input-cell");
	var rrNameArea = $("<div>").append(rrName).append(rrNameInputDiv).addClass("gb-repository-init-input-row");

	var rrURL = $("<div>").text(this.translation.remorepourl[this.locale] + ": ").addClass("gb-repository-init-keyname");
	var rrURLInput = $("<input>").attr({
		"type" : "text",
		"placeholder" : this.translation.remorepourlmsg[this.locale]
	}).addClass("gb-form").addClass("gb-repository-init-input");
	var rrURLInputDiv = $("<div>").append(rrURLInput).addClass("gb-repository-init-input-cell");
	var rrURLArea = $("<div>").append(rrURL).append(rrURLInputDiv).addClass("gb-repository-init-input-row");
	var tbArea = $("<div>").addClass("gb-repository-init-remote-table").append(rrNameArea).append(rrURLArea);

	var remoteInputArea = $("<div>").addClass("gb-repository-init-remote-area").append(tbArea);

	var icon = $("<i>").addClass("fas").addClass("fa-caret-down");
	var pullBtn = $("<button>").append(icon).append(" " + this.translation.pullfrom[this.locale]).addClass("gb-button-clear").click(
			function() {
				if ($(remoteInputArea).css("display") === "none") {
					if ($(this).find("i").hasClass("fa-caret-down")) {
						$(this).find("i").removeClass("fa-caret-down");
						$(this).find("i").addClass("fa-caret-up");
					}
					$(remoteInputArea).css("display", "block");
				} else if ($(remoteInputArea).css("display") === "block") {
					if ($(this).find("i").hasClass("fa-caret-up")) {
						$(this).find("i").removeClass("fa-caret-up");
						$(this).find("i").addClass("fa-caret-down");
					}
					$(remoteInputArea).css("display", "none");
				}
			});
	var pullBtnRow = $("<div>").addClass("gb-repository-init-remote-pull-row").append(pullBtn);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.create[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var rBody = $("<div>").append(rNameArea).append(rHostArea).append(rPortArea).append(rDBArea).append(rSchemeArea).append(rIDArea)
			.append(rPassArea).addClass("gb-repository-init-area");

	var repoBody = $("<div>").append(rBody).append(pullBtnRow).append(remoteInputArea);
	var createRepoModal = new gb.modal.ModalBase({
		"title" : this.translation.createrepo[this.locale],
		"width" : 540,
		"height" : 425,
		"autoOpen" : true,
		"body" : repoBody,
		"footer" : modalFooter
	});
	$(closeBtn).click(function() {
		createRepoModal.close();
	});
	$(okBtn).click(function() {
		console.log("create repo");
		var server = that.getNowServer().text;
		var repo = $(rNameInput).val();
		var host = $(rHostInput).val();
		var port = $(rPortInput).val();
		var dbname = $(rDBInput).val();
		var scheme = $(rSchemeInput).val();
		var user = $(rIDInput).val();
		var pass = $(rPassInput).val();
		var rname = $(rrNameInput).val() === "" ? null : $(rrNameInput).val();
		var rurl = $(rrURLInput).val() === "" ? null : $(rrURLInput).val();
		if (typeof rurl === "string") {
			if (rurl.indexOf("http://") === -1 && rurl.indexOf("https://") === -1) {
				rurl = "http://" + rurl;
			}
		}
		if (rname === null || rurl === null) {
			rname = null;
			rurl = null;
		}
		if (repo === "" || host === "" || dbname === "" || scheme === "" || user === "" || pass === "") {
			if (repo === "") {
				$(rNameInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rNameInput).css({
					"background-color" : "#fff"
				});
			}
			if (host === "") {
				$(rHostInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rHostInput).css({
					"background-color" : "#fff"
				});
			}
			if (port === "") {
				$(rPortInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rPortInput).css({
					"background-color" : "#fff"
				});
			}
			if (dbname === "") {
				$(rDBInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rDBInput).css({
					"background-color" : "#fff"
				});
			}
			if (scheme === "") {
				$(rSchemeInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rSchemeInput).css({
					"background-color" : "#fff"
				});
			}
			if (user === "") {
				$(rIDInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rIDInput).css({
					"background-color" : "#fff"
				});
			}
			if (pass === "") {
				$(rPassInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(rPassInput).css({
					"background-color" : "#fff"
				});
			}

			if (!($(rrNameInput).val() === "" && $(rrURLInput).val() === "")) {
				$(rrNameInput).css({
					"background-color" : "#fcf8e3"
				});
				$(rrURLInput).css({
					"background-color" : "#fcf8e3"
				});
			} else {
				$(rrNameInput).css({
					"background-color" : "#fff"
				});
				$(rrURLInput).css({
					"background-color" : "#fff"
				});
			}
			var title = that.translation.err[that.locale];
			var msg = that.translation.emptyfield[that.locale];
			that.messageModal(title, msg);
		} else {
			$(rNameInput).css({
				"background-color" : "#fff"
			});
			$(rHostInput).css({
				"background-color" : "#fff"
			});
			$(rPortInput).css({
				"background-color" : "#fff"
			});
			$(rDBInput).css({
				"background-color" : "#fff"
			});
			$(rSchemeInput).css({
				"background-color" : "#fff"
			});
			$(rIDInput).css({
				"background-color" : "#fff"
			});
			$(rPassInput).css({
				"background-color" : "#fff"
			});
			$(rrNameInput).css({
				"background-color" : "#fff"
			});
			$(rrURLInput).css({
				"background-color" : "#fff"
			});
			var callback = function() {
				$(okBtn).prop("disabled", false);
			};
			that.initRepository(server, repo, host, port, dbname, scheme, user, pass, rname, rurl, createRepoModal, callback);
			$(this).prop("disabled", true);
		}
	});
};

/**
 * GeoGig 저장소 생성을 요청한다.
 * 
 * @method gb.versioning.Repository#initRepository
 * @param {string}
 *            server - 새 GeoGig 저장소가 포함될 GeoServer
 * @param {string}
 *            repo - 생성될 GeoGig 저장소 이름
 * @param {string}
 *            host - 데이터베이스 호스트 주소
 * @param {string}
 *            dbname - 연결할 데이터베이스 이름
 * @param {string}
 *            scheme - 연결할 데이터베이스 스키마 이름
 * @param {string}
 *            user - 데이터베이스 계정명
 * @param {string}
 *            pass - 데이터베이스 비밀번호
 * @param {string}
 *            rname - 원격 저장소 이름
 * @param {string}
 *            rurl - 원격 저장소 주소
 * @param {gb.modal.ModalBase}
 *            modal - 완료 후 닫을 모달 객체
 * @param {function}
 *            callback - 완료 후 수행할 콜백함수
 */
gb.versioning.Repository.prototype.initRepository = function(server, repo, host, port, dbname, scheme, user, pass, rname, rurl, modal,
		callback) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"dbHost" : host,
		"dbPort" : port,
		"dbName" : dbname,
		"dbSchema" : scheme,
		"dbUser" : user,
		"dbPassword" : pass
	}
	if (rname && rurl) {
		params["remoteName"] = rname;
		params["remoteURL"] = rurl;
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getInitRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			that.showSpinner(true, modal);
		},
		complete : function() {
			that.showSpinner(false, modal);
			if (typeof callback === "function") {
				callback();
			}
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				that.refreshList();
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * GeoGig 저장소 삭제 확인창을 생성한다.
 * 
 * @method gb.versioning.Repository#removeRepositoryModal
 * @param {string}
 *            repo - 삭제할 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.removeRepositoryModal = function(repo) {
	var that = this;
	var msg1 = $("<div>").text(this.translation.removerepomsg[this.locale]).addClass("gb-repository-msg16");
	var msg2 = $("<div>").text('"' + repo + '"').addClass("gb-repository-msg24");
	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.remove[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var removeModal = new gb.modal.ModalBase({
		"title" : this.translation.removerepo[this.locale],
		"width" : 310,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		removeModal.close();
	});
	$(okBtn).click(function() {
		that.removeRepository(that.getNowServer().text, that.getNowRepository().text, removeModal);
	});
};

/**
 * GeoGig 저장소 삭제를 요청한다.
 * 
 * @method gb.versioning.Repository#removeRepository
 * @param {string}
 *            server - 삭제할 GeoGig 저장소가 포함된 GeoServer
 * @param {string}
 *            repo - 삭제할 GeoGig 저장소
 * @param {gb.modal.ModalBase}
 *            modal - 완료후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.removeRepository = function(server, repo, modal) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getRemoveRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				that.refreshList();
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 오류 메시지 창을 생성한다.
 * 
 * @method gb.versioning.Repository#messageModal
 * @param {string}
 *            title - 메세지 창 제목
 * @param {string}
 *            msg - 메세지 내용
 */
gb.versioning.Repository.prototype.messageModal = function(title, msg) {
	var that = this;
	var msg1 = $("<div>").append(msg).addClass("gb-repository-msg-modal");
	var body = $("<div>").append(msg1);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.ok[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn);

	var modal = new gb.modal.ModalBase({
		"title" : title,
		"width" : 390,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(okBtn).click(function() {
		modal.close();
	});
};

/**
 * quit 창을 생성한다.
 * 
 * @method gb.versioning.Repository#quitModal
 * @param {Object}
 *            server - 작업 중인 서버 노드 객체
 * @param {Object}
 *            repo - 작업 중인 GeoGig 저장소 노드 객체
 * @param {Object}
 *            branch - 작업 중인 브랜치 노드 객체
 * @param {string}
 *            tid - 종료할 트랜잭션 아이디
 */
gb.versioning.Repository.prototype.quitModal = function(server, repo, branch, tid) {
	var that = this;
	var msg1 = $("<div>").text(this.translation.beforeend[this.locale]).addClass("gb-repository-msg16");
	var msg2 = $("<div>").text(this.translation.cub[this.locale] + ": " + branch.text).addClass("gb-repository-msg24");

	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var discardBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.discard[this.locale]);
	var saveBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.commit[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(saveBtn).append(discardBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : this.translation.endtran[this.locale],
		"width" : 370,
		"height" : 176,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		modal.close();
	});
	$(discardBtn).click(function() {
		that.cancelTransaction(server.text, repo.text, tid, modal);
	});
	$(saveBtn).click(function() {
		that.endTransaction(server.text, repo.text, tid, modal);
	});
};

/**
 * merge 창을 생성한다.
 * 
 * @method gb.versioning.Repository#mergeModal
 * @param {string}
 *            server - 작업 중인 서버 노드 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 노드 이름
 * @param {string}
 *            branch - 작업 중인 브랜치 노드 이름
 */
gb.versioning.Repository.prototype.mergeModal = function(server, repo, branch) {
	var that = this;

	$(this.geoserverNameVal).empty();
	$(this.geoserverNameVal).text(server);

	$(this.repoNameVal).empty();
	$(this.repoNameVal).text(repo);

	$(this.cubNameVal).empty();
	$(this.cubNameVal).text(branch);

	$(this.tabNameVal).empty();
	var callback = function(data) {
		if (data.success === "true") {
			var branches = data.localBranchList;
			if (Array.isArray(branches)) {
				for (var i = 0; i < branches.length; i++) {
					var opt = $("<option>").text(branches[i].name);
					if (branches[i].name === branch) {
						$(opt).prop({
							"disabled" : true
						});
					}
					$(that.tabNameVal).append(opt);
				}
			}
		} else {
			var title = that.translation.err[that.locale];
			var msg = that.translation.nobranch[that.locale];
			that.messageModal(title, msg);
		}
	};
	this.getBranchList(server, repo, callback);

	var serverName = $("<span>").text(that.translation.geoserver[that.locale] + ": ").addClass("gb-repository-merge-keyname");
	var serverNameValArea = $("<span>").addClass("gb-repository-merge-value").append(this.geoserverNameVal);
	var geoserverArea = $("<div>").append(serverName).append(serverNameValArea).addClass("gb-repository-merge-row");
	var repoName = $("<span>").text(that.translation.repository[that.locale] + ": ").addClass("gb-repository-merge-keyname");
	var repoNameValArea = $("<span>").addClass("gb-repository-merge-value").append(this.repoNameVal);
	var repoNameArea = $("<div>").append(repoName).append(repoNameValArea).addClass("gb-repository-merge-row");
	var cubName = $("<span>").text(that.translation.cub[that.locale] + ": ").addClass("gb-repository-merge-keyname");
	var cubNameValArea = $("<span>").addClass("gb-repository-merge-value").append(this.cubNameVal);
	var cubArea = $("<div>").append(cubName).append(cubNameValArea).addClass("gb-repository-merge-row");
	var tabName = $("<span>").text(that.translation.tab[that.locale] + ": ").addClass("gb-repository-merge-keyname");
	var tabNameValArea = $("<span>").addClass("gb-repository-merge-value").append(this.tabNameVal);
	var tabArea = $("<div>").append(tabName).append(tabNameValArea).addClass("gb-repository-merge-row");

	var body = $("<div>").append(geoserverArea).append(repoNameArea).append(cubArea).append(tabArea).addClass("gb-repository-merge-body");
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.cancel[that.locale]);
	var mergeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.merge[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(mergeBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : that.translation.merge[that.locale],
		"width" : 370,
		"height" : 268,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		modal.close();
	});
	$(mergeBtn).click(function() {
		var server = that.getNowServer();
		var repo = that.getNowRepository();
		var tab = $(that.tabNameVal).val();
		var tid = that.getJSTree().getTransactionId(repo.id);
		if (!tid) {
			console.log("you want to check out this branch?");
		} else if (server.text && repo.text && tab && tid) {
			console.log("its working");
			that.mergeBranch(server.text, repo.text, tab, tid, modal);
		}
	});
};

/**
 * new branch 창을 생성한다.
 * 
 * @method gb.versioning.Repository#newBranchModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.newBranchModal = function(server, repo) {
	var that = this;

	this.sourceSelect = $("<select>").addClass("gb-form").addClass("gb-repository-branch-source");
	var callback = function(data) {
		if (data.success === "true") {
			var branches = data.localBranchList;
			if (Array.isArray(branches)) {
				for (var i = 0; i < branches.length; i++) {
					var opt = $("<option>").text(branches[i].name);
					$(that.sourceSelect).append(opt);
				}
			}
		} else {
			var title = "Error";
			var msg = "Couldn't get branch list."
			that.messageModal(title, msg);
		}
	};
	this.getBranchList(server, repo, callback);

	var serverName = $("<span>").text(that.translation.geoserver[that.locale] + ": ").addClass("gb-repository-branch-keyname");
	var serverNameVal = $("<span>").text(server).addClass("gb-repository-newbranch-value");
	var geoserverArea = $("<div>").append(serverName).append(serverNameVal).addClass("gb-repository-newbranch-row");
	var repoName = $("<span>").text(that.translation.repository[that.locale] + ": ").addClass("gb-repository-branch-keyname");
	var repoNameVal = $("<span>").text(repo).addClass("gb-repository-newbranch-value");
	var repoNameArea = $("<div>").append(repoName).append(repoNameVal).addClass("gb-repository-newbranch-row");
	var cubName = $("<span>").text(that.translation.newbranch[that.locale] + ": ").addClass("gb-repository-branch-keyname");
	var nameInput = $("<input>").addClass("gb-form").attr({
		"type" : "text"
	}).addClass("gb-repository-branch-name");
	var nameArea = $("<div>").append(nameInput).addClass("gb-repository-newbranch-value");
	var cubArea = $("<div>").append(cubName).append(nameArea).addClass("gb-repository-newbranch-row");
	var tabName = $("<span>").text(that.translation.tab[that.locale] + ": ").addClass("gb-repository-branch-keyname");
	var tabSelect = $("<div>").append(this.sourceSelect).addClass("gb-repository-newbranch-value");
	var tabArea = $("<div>").append(tabName).append(tabSelect).addClass("gb-repository-newbranch-row");

	var body = $("<div>").append(geoserverArea).append(repoNameArea).append(cubArea).append(tabArea).addClass(
			"gb-repository-newbranch-body");

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var createBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.create[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(createBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : this.translation.newbranch[this.locale],
		"width" : 370,
		"height" : 268,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		modal.close();
	});
	$(createBtn).click(function() {
		var server = that.getNowServer();
		var repo = that.getNowRepository();
		var branch = $(nameInput).val();
		var source = $(that.sourceSelect).val();
		that.createNewBranch(server.text, repo.text, branch, source, modal);
	});
};

/**
 * 브랜치 생성을 요청한다.
 * 
 * @method gb.versioning.Repository#createNewBranch
 * @param {string}
 *            server - 브랜치를 생성할 서버 이름
 * @param {string}
 *            repo - 브랜치를 생성할 GeoGig 저장소 이름
 * @param {string}
 *            branch - 새로 생성할 브랜치 이름
 * @param {string}
 *            source - 원본으로 사용할 브랜치 이름
 * @param {gb.modal.ModalBase}
 *            modal - 완료 후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.createNewBranch = function(server, repo, branch, source, modal) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"branchName" : branch,
		"source" : source
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getCreateBranchURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				that.refreshList();
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 원격 저장소 등록 창을 생성한다.
 * 
 * @method gb.versioning.Repository#addRemoteRepoModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 작업 중인 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.addRemoteRepoModal = function(server, repo) {
	var that = this;

	var serverName = $("<span>").text(that.translation.geoserver[that.locale] + ": ").addClass("gb-repository-addremote-keyname");
	var serverNameVal = $("<span>").text(server).addClass("gb-repository-addremote-value");
	var geoserverArea = $("<div>").append(serverName).append(serverNameVal).addClass("gb-repository-addremote-row");
	var repoName = $("<span>").text(that.translation.repository[that.locale] + ": ").addClass("gb-repository-addremote-keyname");
	var repoNameVal = $("<span>").text(repo).addClass("gb-repository-addremote-value");
	var repoNameArea = $("<div>").append(repoName).append(repoNameVal).addClass("gb-repository-addremote-row");
	var remoteName = $("<span>").text(that.translation.remoreponame[that.locale] + ": ").addClass("gb-repository-addremote-keyname");
	var nameInput = $("<input>").attr({
		"type" : "text"
	}).addClass("gb-repository-addremote-input").addClass("gb-form");
	var nameArea = $("<div>").append(nameInput).addClass("gb-repository-addremote-value");
	var remoteNameArea = $("<div>").append(remoteName).append(nameArea).addClass("gb-repository-addremote-row");
	var remoteURL = $("<span>").text(that.translation.remorepourl[that.locale] + ": ").addClass("gb-repository-addremote-keyname");
	var remoteURLInput = $("<input>").attr({
		"type" : "text"
	}).addClass("gb-repository-addremote-input").addClass("gb-form");

	var remoteURLInputArea = $("<div>").append(remoteURLInput).addClass("gb-repository-addremote-value");
	var urlArea = $("<div>").append(remoteURL).append(remoteURLInputArea).addClass("gb-repository-addremote-row");

	var body = $("<div>").append(geoserverArea).append(repoNameArea).append(remoteNameArea).append(urlArea).addClass(
			"gb-repository-addremote-body");

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var addBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.add[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(addBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : this.translation.addremorepo[this.locale],
		"width" : 570,
		"height" : 268,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		modal.close();
	});
	$(addBtn).click(function() {
		var server = that.getNowServer();
		var repo = that.getNowRepository();
		var name = $(nameInput).val();
		var url = $(remoteURLInput).val();
		if (name === "" || url === "") {
			if (name === "") {
				$(nameInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(nameInput).css({
					"background-color" : "#fff"
				});
			}
			if (url === "") {
				$(remoteURLInput).css({
					"background-color" : "#f2dede"
				});
			} else {
				$(remoteURLInput).css({
					"background-color" : "#fff"
				});
			}
			var title = this.translation.err[this.locale];
			var msg = this.translation.emptyfield[this.locale];
			that.messageModal(title, msg);
		} else {
			$(nameInput).css({
				"background-color" : "#fff"
			});
			$(remoteURLInput).css({
				"background-color" : "#fff"
			});
			if (typeof url === "string") {
				if (url.indexOf("http://") === -1 && url.indexOf("https://") === -1) {
					url = "http://" + url;
				}
			}
			$(this).prop("disabled", true);
			that.addRemoteRepository(server.text, repo.text, name, url, modal, $(this)[0]);
		}
	});
};

/**
 * 원격 GeoGig 저장소 추가를 요청한다.
 * 
 * @method gb.versioning.Repository#addRemoteRepository
 * @param {string}
 *            server - 로컬 GeoGig 저장소의 서버 이름
 * @param {string}
 *            repo - 연동될 로컬 GeoGig 저장소 이름
 * @param {string}
 *            remote - 원격 GeoGig 저장소 이름
 * @param {string}
 *            url - 원격 GeoGig 저장소 주소
 * @param {gb.modal.ModalBase}
 *            modal - 완료 후 닫을 모달 객체
 * @param {HTMLElement}
 *            callbackBtn - 요청 직후 비활성화 할 버튼 객체
 */
gb.versioning.Repository.prototype.addRemoteRepository = function(server, repo, remote, url, modal, callbackBtn) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"remoteName" : remote,
		"remoteURL" : url
	}
	// + "&" + jQuery.param(params),
	var checkURL = this.getAddRemoteRepositoryURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}

	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
			that.showSpinner(true, modal);
		},
		complete : function() {
			// $("body").css("cursor", "default");
			that.showSpinner(false, modal);
			$(callbackBtn).prop("disabled", false);
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				modal.close();
				that.refreshRemoteList();
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * resolve conflict 창을 생성한다.
 * 
 * @method gb.versioning.Repository#resolveConflictModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            repo - 체크아웃 중인 GeoGig 저장소 이름
 * @param {string}
 *            trepo - pull 또는 merge 하려는 GeoGig 저장소 이름
 * @param {string}
 *            cub - 체크아웃 중인 브랜치 이름
 * @param {string}
 *            tab - pull 또는 merge 하려는 브랜치 이름
 * @param {string}
 *            ours - 충돌 사항의 로컬 브랜치 식별자
 * @param {string}
 *            theirs - 충돌 사항의 원격 브랜치 식별자
 * @param {Array.
 *            <Object>} features - 오버라이드할 객체 정보
 * @param {gb.modal.ModalBase}
 *            cmodal - 완료후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.resolveConflictModal = function(server, repo, trepo, cub, tab, ours, theirs, features, cmodal) {
	var that = this;

	// var serverName = $("<span>").text(this.translation.geoserver[this.locale]
	// + ": ").addClass("gb-repository-conflict-keyname");
	// var serverNameVal =
	// $("<span>").text(server).addClass("gb-repository-conflict-value");
	// var geoserverArea = $("<span>").append(serverName).append(serverNameVal);
	// var repoName = $("<span>").text(this.translation.repository[this.locale]
	// + ": ").addClass("gb-repository-conflict-keyname");
	// var repoNameVal =
	// $("<span>").text(repo).addClass("gb-repository-conflict-value");
	// var repoNameArea = $("<span>").append(repoName).append(repoNameVal);
	//
	// var cubName = $("<span>").text(this.translation.cub[this.locale] + ":
	// ").addClass("gb-repository-conflict-keyname");
	// var cubNameVal =
	// $("<span>").text(cub).addClass("gb-repository-conflict-value");
	// var cubNameArea = $("<span>").append(cubName).append(cubNameVal);
	//
	// var tabName = $("<span>").text(this.translation.tab[this.locale] + ":
	// ").addClass("gb-repository-conflict-keyname");
	// var tabNameVal =
	// $("<span>").text(tab).addClass("gb-repository-conflict-value");
	// var tabNameArea = $("<span>").append(tabName).append(tabNameVal);

	var col1 = $("<th>").addClass("select-checkbox");
	var col2 = $("<th>").text(this.translation.no[this.locale]);
	var col3 = $("<th>").text(this.translation.layer[this.locale]);
	var col4 = $("<th>").text(this.translation.fid[this.locale]);
	var col5 = $("<th>").text(this.translation.resolution[this.locale]);
	var col6 = $("<th>").text(this.translation.detail[this.locale]);
	var row1 = $("<tr>").append(col1).append(col2).append(col3).append(col4).append(col5).append(col6);
	var thead = $("<thead>").append(row1);
	var tbody = $("<tbody>");
	this.conflictFeatureTbody = tbody;
	var table = $("<table>").append(thead).append(tbody);
	var tableArea = $("<div>").append(table).addClass("gb-repository-conflict-table-area");

	// var selectedLabel = $("<span>").text("Selected Items");
	var useCubBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.use[this.locale] + " [" + repo + " - " + cub + "]").addClass("gb-repository-conflict-use-btn");
	var useTabBtn = $("<button>").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.use[this.locale] + " [" + trepo + " - " + tab + "]").addClass("gb-repository-conflict-use-btn");
	var selectedButtons = $("<div>").append(useCubBtn).append(useTabBtn);
	var wholeSelectBody = $("<div>").append(selectedButtons).addClass("gb-repository-conflict-use-area");

	// var infoBody =
	// $("<div>").append(geoserverArea).append(repoNameArea).append(cubNameArea).append(tabNameArea).css({
	// "display" : "table",
	// "padding" : "10px",
	// "width" : "100%",
	// "height" : "138px"
	// });

	var body = $("<div>").append(tableArea).append(wholeSelectBody);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.merge[this.locale]);
	var buttonArea = $("<div>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : this.translation.resolveconfl[this.locale],
		"width" : 770,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	var data = [];
	this.setCommitId(ours, theirs);
	for (var i = 0; i < features.length; i++) {
		if (features[i].change === "CONFLICT") {
			var layer = features[i].id.substring(0, features[i].id.indexOf("/"));
			var fid = features[i].id.substring(features[i].id.indexOf("/") + 1);
			var oval = features[i].ourvalue;
			var tval = features[i].theirvalue;
			var diffObj = {
				"ourvalue" : oval,
				"theirvalue" : tval
			};
			var item = [ "", i + 1, layer, fid, "", diffObj ];
			data.push(item);
		}
	}

	var select;
	var optcub;
	var opttab;

	console.log(data);
	$(table).DataTable(
			{
				"data" : data,
				"columns" : [
						{
							"orderable" : false,
							"className" : "select-checkbox gb-repository-select-checkbox"
						},
						{
							"title" : this.translation.no[this.locale]
						},
						{
							"title" : this.translation.layer[this.locale]
						},
						{
							"title" : this.translation.fid[this.locale]
						},
						{
							"title" : this.translation.resolution[this.locale],
							'searchable' : false,
							"orderable" : false,
							"render" : function(d, t, r, m) {
								select = $("<select>").addClass("gb-form").addClass("gb-repository-instead-branch");

								var optcub = $("<option>").text(repo + " - " + cub).attr({
									"value" : "ours"
								});
								var opttab = $("<option>").text(trepo + " - " + tab).attr({
									"value" : "theirs"
								});

								$(select).append(optcub);
								$(select).append(opttab);

								if (d === $(optcub).val() || d === "") {
									$(select).val(cub);
								} else if (d === $(opttab).val()) {
									$(select).val(tab);
								}

								console.log(d);
								console.log(t);
								console.log(r);
								console.log(m);
								return $(select).prop("outerHTML");
							}
						},
						{
							"title" : this.translation.detail[this.locale],
							'searchable' : false,
							"orderable" : false,
							"data" : null,
							"defaultContent" : "<button class='gb-button gb-button-default gb-repository-conflict-detail'>"
									+ this.translation.click[this.locale] + "</button>"
						} ],
				"select" : {
					"style" : 'multi',
					"selector" : 'td:first-child'
				},
				"order" : [ [ 1, 'asc' ] ]
			});
	modal.refreshPosition();
	var tableObj = $(table).DataTable();

	tableObj.on("click", "th.select-checkbox", function() {
		if ($("th.select-checkbox").hasClass("selected")) {
			tableObj.rows().deselect();
			$("th.select-checkbox").removeClass("selected");
		} else {
			tableObj.rows().select();
			$("th.select-checkbox").addClass("selected");
		}
	}).on("select deselect", function() {
		if (tableObj.rows({
			selected : true
		}).count() !== tableObj.rows().count()) {
			$("th.select-checkbox").removeClass("selected");
		} else {
			$("th.select-checkbox").addClass("selected");
		}
	});

	tableObj.on("select", function() {
		if (tableObj.rows({
			selected : true
		}).count() > 0) {
			$(wholeSelectBody).show();
		} else {
			$(wholeSelectBody).hide();
		}
	});

	tableObj.on("deselect", function() {
		if (tableObj.rows({
			selected : true
		}).count() > 0) {
			$(wholeSelectBody).show();
		} else {
			$(wholeSelectBody).hide();
		}
	});

	$(useCubBtn).click(function() {
		console.log(tableObj.rows({
			selected : true
		}).indexes());
		var length = tableObj.rows({
			selected : true
		}).indexes().count();
		var arr = tableObj.rows({
			selected : true
		}).indexes();
		for (var i = 0; i < length; i++) {
			var select = $(that.conflictFeatureTbody).find("tr").eq(arr[i]).find(".gb-repository-instead-branch");
			$(select).val("ours");
			$(select).trigger("change");
		}
	});

	$(useTabBtn).click(function() {
		console.log(tableObj.rows({
			selected : true
		}).indexes());
		var length = tableObj.rows({
			selected : true
		}).indexes().count();
		var arr = tableObj.rows({
			selected : true
		}).indexes();
		for (var i = 0; i < length; i++) {
			var select = $(that.conflictFeatureTbody).find("tr").eq(arr[i]).find(".gb-repository-instead-branch");
			$(select).val("theirs");
			$(select).trigger("change");
		}
	});

	$(table).find("tbody").off("click", ".gb-repository-conflict-detail");

	$(table).find("tbody").on("click", ".gb-repository-conflict-detail", function() {
		console.log($(this).val());
		// console.log($(this).parents(2)[0]);
		var idx = tableObj.row($(this).parents().eq(1)).index();
		console.log(tableObj.row($(this).parents().eq(1)).index());
		// data[idx][4] = $(this).val();
		console.log(data[idx][5]);
		var path = data[idx][2] + "/" + data[idx][3];
		var fid = data[idx][5];
		console.log($(this).parents().eq(1)[0]);
		var setVal = $(this).parents().eq(1).find(".gb-repository-instead-branch").val();
		that.conflictDetailModal(server, repo, trepo, cub, tab, path, data[idx][5].ourvalue, data[idx][5].theirvalue, setVal, idx);
	});

	$(table).find("tbody").off("change", ".gb-repository-instead-branch");

	$(table).find("tbody").on("change", ".gb-repository-instead-branch", function() {
		console.log($(this).val());
		// console.log($(this).parents(2)[0]);
		var idx = tableObj.row($(this).parents().eq(1)).index();
		console.log(tableObj.row($(this).parents().eq(1)).index());
		data[idx][4] = $(this).val();
		console.log(data[idx][4]);
		console.log(data);
	});

	$(closeBtn).click(function() {
		modal.close();
	});
	$(okBtn).click(function() {
		console.log($(table).DataTable().data());
		var data = $(table).DataTable().data();
		var features = [];
		for (var i = 0; i < data.length; i++) {
			var obj = {
				"path" : data[i][2] + "/" + data[i][3],
				"version" : data[i][4] === "" || data[i][4] === "ours" ? "ours" : "theirs"
			};
			features.push(obj);
		}
		console.log(features);
		var tid = that.getJSTree().getTransactionId(that.getNowRepository().id);
		console.log(tid);
		that.resolveConflict(server, repo, features, tid, modal);
		cmodal.close();
		// var server = that.getNowServer();
		// var repo = that.getNowRepository();
		// var name = $(nameInput).val();
		// var url = $(remoteURLInput).val();
		// that.addRemoteRepository(server.text, repo.text, name, url, modal);
	});
};

/**
 * resolve conflict 요청한다.
 * 
 * @method gb.versioning.Repository#resolveConflict
 * @param {string}
 *            server - 작업중인 GeoServer 이름
 * @param {string}
 *            repo - 작업중인 GeoGig 저장소 이름
 * @param {string}
 *            features - 덮어쓸 피처의 path
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {gb.modal.ModalBase}
 *            modal - 완료 후 닫을 모달 객체
 */
gb.versioning.Repository.prototype.resolveConflict = function(server, repo, features, tid, modal) {
	console.log(this.getResolveConflictURL());
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"features" : features,
		"transactionId" : tid
	};
	console.log(params);
	var url = this.getResolveConflictURL();
	var withoutParamURL = url.substring(0, url.indexOf("?") !== -1 ? url.indexOf("?") : undefined);
	console.log(withoutParamURL);
	var queryString = url.indexOf("?") !== -1 ? url.substring(url.indexOf("?") + 1) : undefined;
	console.log(queryString);
	var queryParams = {};
	if (queryString) {
		queryParams = JSON.parse('{"' + queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value) {
			return key === "" ? value : decodeURIComponent(value);
		});
	}
	console.log(queryParams);
	var finalParams = {};
	$.extend(finalParams, params, queryParams);
	console.log(finalParams);

	var form = $("<form>");
	var formData = new FormData(form[0]);
	var keys = Object.keys(finalParams);
	for (var i = 0; i < keys.length; i++) {
		if (Array.isArray(finalParams[keys[i]])) {
			formData.append(keys[i], JSON.stringify(finalParams[keys[i]]));
		} else {
			formData.append(keys[i], finalParams[keys[i]]);
		}
	}

	$.ajax(
			{
				url : withoutParamURL,
				method : "POST",
				enctype : 'multipart/form-data',
				contentType : false,
				data : formData,
				processData : false,
				beforeSend : function() {
					// $("body").css("cursor", "wait");
					that.showSpinner(true, modal);
				},
				complete : function() {
					// $("body").css("cursor", "default");
					that.showSpinner(false, modal);
				},
				success : function(data) {
					console.log(data);
					var success = true;
					if (Array.isArray(data)) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].success !== "true") {
								success = false;
							}
						}
					}
					if (success === true) {
						var msg1 = $("<div>").text(that.translation.mergecompl1[that.locale]).addClass("gb-repository-msg16");
						var msg2 = $("<div>").text(that.translation.mergecompl2[that.locale]).addClass("gb-repository-msg16");
						var body = $("<div>").append(msg1).append(msg2);
						var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
								.text(that.translation.later[that.locale]);
						var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary")
								.text(that.translation.commit[that.locale]);
						var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

						var commitModal = new gb.modal.ModalBase({
							"title" : that.translation.cmitchnges[that.locale],
							"width" : 310,
							"height" : 200,
							"autoOpen" : true,
							"body" : body,
							"footer" : buttonArea
						});
						$(closeBtn).click(function() {
							commitModal.close();
						});
						$(okBtn).click(function() {
							modal.close();
							that.endTransaction(server, repo, tid, commitModal);
						});
					} else {
						that.errorModal(data.error);
					}
				}
			}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
}

/**
 * conflict detail 창을 생성한다.
 * 
 * @method gb.versioning.Repository#conflictDetailModal
 * @param {string}
 *            server - 작업 중인 서버 이름
 * @param {string}
 *            crepos - 체크아웃 중인 GeoGig 저장소 이름
 * @param {string}
 *            trepos - pull 또는 merge 하려는 GeoGig 저장소 이름
 * @param {string}
 *            cub - 체크아웃 중인 브랜치 이름
 * @param {string}
 *            tab - pull 또는 merge 하려는 브랜치 이름
 * @param {string}
 *            path - 충돌 피처의 아이디
 * @param {string}
 *            fid1 - 충돌 피처의 로컬 브랜치 GeoGig 오브젝트 아이디
 * @param {string}
 *            fid2 - 충돌 피처의 원격 브랜치 GeoGig 오브젝트 아이디
 * @param {string}
 *            val - 이전 화면에서 선택한 덮어쓸 브랜치
 * @param {number}
 *            idx - 선택한 브랜치로 덮어쓸 충돌 객체 인덱스
 */
gb.versioning.Repository.prototype.conflictDetailModal = function(server, crepos, trepos, cub, tab, path, fid1, fid2, val, idx) {
	var that = this;

	var crepo = $("<div>").append(crepos).addClass("gb-form").addClass("gb-repository-conflict-detail-repo");
	var cbranch = $("<div>").append(cub).addClass("gb-form").addClass("gb-repository-conflict-detail-branch");
	// var cfeature = $("<div>").css({
	// "width" : "100%",
	// "height" : "200px",
	// "background-color" : "#dbdbdb"
	// });
	var cheadtd1 = $("<th>").text(that.translation.attr[that.locale]);
	var cheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var cheadth = $("<tr>").append(cheadtd1).append(cheadtd2);
	var cattrthead = $("<thead>").append(cheadth);
	var cattrtbody = $("<tbody>").addClass("gb-repository-conflict-detail-attr-tbody");
	var cattrtable = $("<table>").append(cattrthead).append(cattrtbody).addClass("gb-table");
	var cattribute = $("<div>").append(cattrtable).addClass("gb-repository-conflict-detail-attr-area");
	var carea = $("<div>").append(crepo).append(cbranch).append(this.cfeature).append(cattribute).addClass(
			"gb-repository-conflict-detail-half");
	// this.conflictView = new ol.View({
	// "center" : [ 0, 0 ],
	// "zoom" : 1
	// });
	// this.cmap = new ol.Map({
	// "target" : $(cfeature)[0],
	// "view" : this.conflictView,
	// "layers" : []
	// });

	var trepo = $("<div>").append(trepos).addClass("gb-form").addClass("gb-repository-conflict-detail-repo");
	var tbranch = $("<div>").append(tab).addClass("gb-form").addClass("gb-repository-conflict-detail-branch");
	// var tfeature = $("<div>").css({
	// "width" : "100%",
	// "height" : "200px",
	// "background-color" : "#dbdbdb"
	// });
	var theadtd1 = $("<th>").text(that.translation.attr[that.locale]);
	var theadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var theadth = $("<tr>").append(theadtd1).append(theadtd2);
	var tattrthead = $("<thead>").append(theadth);
	var tattrtbody = $("<tbody>").addClass("gb-repository-conflict-detail-attr-tbody");
	var tattrtable = $("<table>").append(tattrthead).append(tattrtbody).addClass("gb-table");
	// .css({
	// "width" : "100%",
	// "table-layout" : "fixed"
	// });
	var tattribute = $("<div>").append(tattrtable).addClass("gb-repository-conflict-detail-attr-area");

	$(cattrtbody).on("scroll", function() {
		$(tattrtbody).prop("scrollTop", this.scrollTop).prop("scrollLeft", this.scrollLeft);
	});

	// $(tattribute).on("scroll", function() {
	// $(cattribute).prop("scrollTop", this.scrollTop).prop("scrollLeft",
	// this.scrollLeft);
	// });

	var tarea = $("<div>").append(trepo).append(tbranch).append(this.tfeature).append(tattribute).addClass(
			"gb-repository-conflict-detail-half");
	// this.tmap = new ol.Map({
	// "target" : $(tfeature)[0],
	// "view" : this.conflictView,
	// "layers" : []
	// });

	var ctarea = $("<div>").append(carea).append(tarea);

	var cubOpt = $("<option>").text(crepos + " - " + cub).attr({
		"value" : "ours"
	});
	var tabOpt = $("<option>").text(trepos + " - " + tab).attr({
		"value" : "theirs"
	});
	var branchSelect = $("<select>").addClass("gb-form").append(cubOpt).append(tabOpt);
	$(branchSelect).val(val);
	var sarea = $("<div>").append(branchSelect).addClass("gb-repository-conflict-detail-select");

	var body = $("<div>").append(ctarea).append(sarea);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.cancel[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.use[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : that.translation.compareconfl[that.locale],
		"width" : 770,
		"height" : 840,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		modal.close();
	});
	$(okBtn).click(function() {
		console.log(idx);
		$(branchSelect).val();
		console.log($(branchSelect).val());
		var select = $(that.conflictFeatureTbody).find("tr").eq(idx).find(".gb-repository-instead-branch");
		$(select).filter("option:selected").text();
		console.log($(select).find("option").filter(":selected").val());
		$(select).val($(branchSelect).val());
		$(select).trigger("change");
		modal.close();
	});

	var cparams1 = {
		"serverName" : server,
		"repoName" : crepos,
		"path" : path,
		"commitId" : this.getCommitId().ours,
		"featureId" : fid1
	}

	var cparams2 = {
		"serverName" : server,
		"repoName" : crepos,
		"path" : path,
		"commitId" : this.getCommitId().theirs,
		"featureId" : fid2
	}

	var wkt1;
	var wkt2;
	if (fid1 !== "0000000000000000000000000000000000000000") {
		var fobjectURL1 = this.getCatConflictFeatureObjectURL();
		if (fobjectURL1.indexOf("?") !== -1) {
			fobjectURL1 += "&";
			fobjectURL1 += jQuery.param(cparams1);
		} else {
			fobjectURL1 += "?";
			fobjectURL1 += jQuery.param(cparams1);
		}

		$.ajax(
				{
					url : fobjectURL1,
					method : "POST",
					contentType : "application/json; charset=UTF-8",
					// data : cparams1,
					// dataType : 'jsonp',
					// jsonpCallback : 'getJson',
					beforeSend : function() {
						// $("body").css("cursor", "wait");
					},
					complete : function() {
						// $("body").css("cursor", "default");
					},
					success : function(data) {
						console.log(data);
						if (data.success === "true") {
							var attrs = data.attributes;
							for (var i = 0; i < attrs.length; i++) {
								if (attrs[i].type === "POINT" || attrs[i].type === "LINESTRING" || attrs[i].type === "POLYGON"
										|| attrs[i].type === "MULTIPOINT" || attrs[i].type === "MULTILINESTRING"
										|| attrs[i].type === "MULTIPOLYGON") {
									var wkt = attrs[i].value;
									wkt1 = wkt;
									console.log(wkt1);
									var format = new ol.format.WKT();
									var geom = format.readGeometry(wkt);
									var feature = new ol.Feature({
										"geometry" : geom
									});
									feature.setId(data.featureId);
									console.log(feature);
									console.log(feature.getId());
									var style = new ol.style.Style({
										image : new ol.style.Circle({
											radius : 5,
											fill : new ol.style.Fill({
												color : 'orange'
											})
										}),
										stroke : new ol.style.Stroke({
											width : 1,
											color : 'orange'
										}),
										fill : new ol.style.Fill({
											color : 'orange'
										})
									});

									var vlayer = new ol.layer.Vector({
										"style" : style,
										"source" : new ol.source.Vector({
											"features" : [ feature ]
										}),
										"zIndex" : 2
									});

									var osm = new ol.layer.Tile({
										"source" : new ol.source.OSM(),
										"zIndex" : 1
									});

									var epsg = attrs[i].crs.toLowerCase();
									var code = epsg.substring(epsg.indexOf("epsg:") + 5);
									var intcode = parseInt(code);
									console.log(code);

									var ccrs = new gb.crs.BaseCRS({
										"title" : "Base CRS",
										"width" : 300,
										"height" : 200,
										"autoOpen" : false,
										"message" : undefined,
										"map" : that.getCurrentMap(),
										"epsg" : Number.isInteger(intcode) ? code : "4326"
									});

									that.getCurrentMap().updateSize();
									that.getCurrentMap().getLayers().clear();
									that.getCurrentMap().addLayer(osm);
									that.getCurrentMap().addLayer(vlayer);
									that.getCurrentMap().getView().fit(geom);

								} else {
									var name = attrs[i].name;
									var value = attrs[i].value;
									var td1 = $("<td>").text(name);
									var td2 = $("<td>").text(value).addClass("gb-repository-conflict-detail-attr-value");
									var tr = $("<tr>").append(td1).append(td2);
									$(cattrtbody).append(tr);
								}

							}

							if (fid2 !== "0000000000000000000000000000000000000000") {
								var fobjectURL2 = that.getCatConflictFeatureObjectURL();
								if (fobjectURL2.indexOf("?") !== -1) {
									fobjectURL2 += "&";
									fobjectURL2 += jQuery.param(cparams2);
								} else {
									fobjectURL2 += "?";
									fobjectURL2 += jQuery.param(cparams2);
								}

								$
										.ajax(
												{
													url : fobjectURL2,
													method : "POST",
													contentType : "application/json; charset=UTF-8",
													// data : cparams2,
													// dataType : 'jsonp',
													// jsonpCallback :
													// 'getJson',
													beforeSend : function() {
														// $("body").css("cursor",
														// "wait");
													},
													complete : function() {
														// $("body").css("cursor",
														// "default");
													},
													success : function(data) {
														console.log(data);
														if (data.success === "true") {
															var attrs = data.attributes;
															for (var i = 0; i < attrs.length; i++) {
																if (attrs[i].type === "POINT" || attrs[i].type === "LINESTRING"
																		|| attrs[i].type === "POLYGON" || attrs[i].type === "MULTIPOINT"
																		|| attrs[i].type === "MULTILINESTRING"
																		|| attrs[i].type === "MULTIPOLYGON") {
																	var wkt = attrs[i].value;
																	wkt2 = wkt;
																	if (wkt1 !== wkt2) {
																		$(that.cfeature).css({
																			"border" : "3px solid #ffc523"
																		});
																		$(that.tfeature).css({
																			"border" : "3px solid #ffc523"
																		});
																	} else {
																		$(that.cfeature).css({
																			"border" : "1px solid #ccc"
																		});
																		$(that.tfeature).css({
																			"border" : "1px solid #ccc"
																		});
																	}
																	console.log(wkt2);
																	var format = new ol.format.WKT();
																	var geom = format.readGeometry(wkt);
																	var feature = new ol.Feature({
																		"geometry" : geom
																	});
																	feature.setId(data.featureId);
																	console.log(feature);
																	console.log(feature.getId());
																	var style = new ol.style.Style({
																		image : new ol.style.Circle({
																			radius : 5,
																			fill : new ol.style.Fill({
																				color : 'orange'
																			})
																		}),
																		stroke : new ol.style.Stroke({
																			width : 1,
																			color : 'orange'
																		}),
																		fill : new ol.style.Fill({
																			color : 'orange'
																		})
																	});

																	var vlayer = new ol.layer.Vector({
																		"style" : style,
																		"source" : new ol.source.Vector({
																			"features" : [ feature ]
																		}),
																		"zIndex" : 2
																	});

																	var osm = new ol.layer.Tile({
																		"source" : new ol.source.OSM(),
																		"zIndex" : 1
																	});

																	var epsg = attrs[i].crs.toLowerCase();
																	var code = epsg.substring(epsg.indexOf("epsg:") + 5);
																	var intcode = parseInt(code);
																	console.log(code);

																	var ccrs = new gb.crs.BaseCRS({
																		"title" : "Base CRS",
																		"width" : 300,
																		"height" : 200,
																		"autoOpen" : false,
																		"message" : undefined,
																		"map" : that.getTargetMap(),
																		"epsg" : Number.isInteger(intcode) ? code : "4326"
																	});

																	that.getTargetMap().updateSize();
																	that.getTargetMap().getLayers().clear();
																	that.getTargetMap().addLayer(osm);
																	that.getTargetMap().addLayer(vlayer);
																	var geom = feature.getGeometry();

																	that.getTargetMap().getView().fit(geom);

																} else {
																	var name = attrs[i].name;
																	var value = attrs[i].value;
																	var td1 = $("<td>").text(name);
																	var td2 = $("<td>").text(value).addClass(
																			"gb-repository-conflict-detail-attr-value");
																	var tr = $("<tr>").append(td1).append(td2);
																	$(tattrtbody).append(tr);
																}

															}
															if ($(cattrtbody).find("tr").length === $(tattrtbody).find("tr").length) {
																var trs = $(cattrtbody).find("tr");
																var ttrs = $(tattrtbody).find("tr");
																for (var j = 0; j < trs.length; j++) {
																	if ($(trs[j]).find("td").eq(0).text() === $(ttrs[j]).find("td").eq(0)
																			.text()) {

																		if ($(trs[j]).find("td").eq(1).text() !== $(ttrs[j]).find("td").eq(
																				1).text()) {
																			$(trs[j]).css({
																				"background-color" : "#ffc523"
																			});
																			$(ttrs[j]).css({
																				"background-color" : "#ffc523"
																			});
																		}
																	}
																}
															}
														} else {
															that.errorModal(data.error);
														}
													}
												}).fail(function(xhr, status, errorThrown) {
											that.errorModal(xhr.responseJSON.status);
										});
							} else {
								that.getTargetMap().updateSize();
								var td1 = $("<td>").text("Removed");
								var td2 = $("<td>").text("Removed");
								var tr = $("<tr>").append(td1).append(td2);
								$(tattrtbody).append(tr);
							}
						} else {
							that.errorModal(data.error);
						}
					}
				}).fail(function(xhr, status, errorThrown) {
			that.errorModal(xhr.responseJSON.status);
		});
	}
};

/**
 * commit id 를 설정한다.
 * 
 * @method gb.versioning.Repository#setCommitId
 * @param {string}
 *            ours - 현재 브랜치 커밋의 오브젝트 아이디
 * @param {string}
 *            theirs - 타겟 브랜치 커밋의 오브젝트 아이디
 */
gb.versioning.Repository.prototype.setCommitId = function(ours, theirs) {
	this.commitId = {
		"ours" : ours,
		"theirs" : theirs
	};
}

/**
 * commit id 를 반환한다.
 * 
 * @method gb.versioning.Repository#getCommitId
 * @return {Object} 작업 브랜치 커밋의 오브젝트 아이디 정보
 */
gb.versioning.Repository.prototype.getCommitId = function() {
	return this.commitId;
}

/**
 * 체크아웃 브랜치의 충돌피처를 보여줄 ol.Map을 반환한다.
 * 
 * @method gb.versioning.Repository#getCurrentMap
 * @return {ol.Map} 충돌 피쳐 표시 지도 객체
 */
gb.versioning.Repository.prototype.getCurrentMap = function() {
	return this.cmap;
}

/**
 * 타겟 브랜치의 충돌피처를 보여줄 ol.Map을 반환한다.
 * 
 * @method gb.versioning.Repository#getTargetMap
 * @return {ol.Map} 충돌 피쳐 표시 지도 객체
 */
gb.versioning.Repository.prototype.getTargetMap = function() {
	return this.tmap;
}

/**
 * fetch 요청을 할 GeoGig 저장소의 이름을 저장한다.
 * 
 * @method gb.versioning.Repository#setFetchRepository
 * @param {string}
 *            remote - fetch할 원격 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.setFetchRepository = function(remote) {
	this.fetchRemote = remote;
}

/**
 * fetch 요청을 할 GeoGig 저장소의 이름을 반환한다.
 * 
 * @method gb.versioning.Repository#getFetchRepository
 * @return {string} fetch할 원격 GeoGig 저장소 이름
 * 
 */
gb.versioning.Repository.prototype.getFetchRepository = function() {
	return this.fetchRemote;
}

/**
 * 레이어 발행 창을 연다.
 * 
 * @method gb.versioning.Repository#publishModal
 * @param {string}
 *            server - 발행할 레이어가 저장된 서버 이름
 * @param {string}
 *            repo - 발행할 레이어가 저장된 GeoGig 저장소 이름
 * @param {string}
 *            branch - 발행할 레이어가 저장된 브랜치 이름
 */
gb.versioning.Repository.prototype.publishModal = function(server, repo, branch) {
	var that = this;

	var wsList;
	var workspace;
	var datastore;

	var wsLabel = $("<div>").text(this.translation.workspace[this.locale]).addClass("gb-repository-publish-work-label");
	var wsSelect = $("<select>").addClass("gb-form");
	var wsSelectDiv = $("<div>").append(wsSelect).addClass("gb-repository-publish-work-select-area");
	var dsLabel = $("<div>").text(this.translation.datastore[this.locale]).addClass("gb-repository-publish-store-label");
	var dsSelect = $("<select>").addClass("gb-form");
	var dsSelectDiv = $("<div>").append(dsSelect).addClass("gb-repository-publish-store-select-area");
	var left = $("<div>").addClass("gb-repository-publish-half").append(wsLabel).append(wsSelectDiv).append(dsLabel).append(dsSelectDiv);
	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	var refBtn = $("<button>").append(refIcon).addClass("gb-button-clear").addClass("gb-button-float-right");

	var layerLabel = $("<div>").append(this.translation.layer[this.locale]).append(refBtn).addClass("gb-repository-publish-layer-label");
	// var layerList = $("<div>");
	var layerList = $("<select>").attr({
		"size" : "4"
	}).addClass("gb-form").addClass("gb-repository-publish-layer-list");
	$(layerList).change(function() {
		console.log(this.value);
	});
	$(dsSelect).change(function() {
		datastore = $(this).val();
		console.log(workspace);
		console.log(datastore);
		that.getListGeoserverLayer(server, workspace, datastore, layerList);
	});
	$(refBtn).click(function() {
		workspace = $(wsSelect).val();
		datastore = $(dsSelect).val();
		that.getListGeoserverLayer(server, workspace, datastore, layerList);
	});
	var layerPanel = $("<div>").addClass("gb-article").append(layerList);
	var right = $("<div>").addClass("gb-repository-publish-half").append(layerLabel).append(layerPanel);
	$(wsSelect).change(function() {
		console.log("change");
		workspace = $(this).val();
		$(dsSelect).empty();
		var elems = wsList[$(wsSelect).val()];
		if (elems !== undefined && elems !== null) {
			if (Array.isArray(elems)) {
				for (var i = 0; i < elems.length; i++) {
					var opt = $("<option>").text(elems[i]);
					$(dsSelect).append(opt);
				}
				$(dsSelect).trigger("change");
			}
		}
	});
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.publish[this.locale]);

	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);
	var modalFooter = $("<div>").append(buttonArea);

	var body = $("<div>").addClass("gb-repository-publish-area").append(left).append(right);

	var params = {
		"serverName" : server,
		"repoName" : repo,
		"branchName" : branch
	};

	var checkURL = this.getDataStoreListURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}
	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			wsList = data;
			if (Object.keys(data).length === 0) {
				console.error("No result");
				var msg1 = $("<div>").append(that.translation.nodatastoremsg1[that.locale]);
				var msg2 = $("<div>").append(that.translation.nodatastoremsg2[that.locale]);
				var group = $("<div>").append(msg1).append(msg2);
				that.messageModal(that.translation.err[that.locale], group);
			} else {
				$(wsSelect).empty();
				var wsKeys = Object.keys(wsList);
				for (var i = 0; i < wsKeys.length; i++) {
					var opt = $("<option>").append(wsKeys[i]);
					$(wsSelect).append(opt);
				}
				$(wsSelect).trigger("change");
				var publishModal = new gb.modal.ModalBase({
					"title" : that.translation.publish[that.locale],
					"width" : 540,
					"height" : 282,
					"autoOpen" : true,
					"body" : body,
					"footer" : modalFooter
				});

				$(closeBtn).click(function() {
					publishModal.close();
				});
				$(okBtn).click(function() {
					console.log("create repo");
					var sv = server;
					var ws = workspace;
					var ds = datastore;
					var lyr = $(layerList).val();
					var rp = repo;
					var br = branch;
					if (!lyr) {
						var msg1 = $("<div>").append(that.translation.chooselayer[that.locale]);
						that.messageModal(that.translation.err[that.locale], msg1);
					} else {
						that.publishGeogigLayer(sv, ws, ds, lyr, rp, br, publishModal, function() {
							that.getListGeoserverLayer(server, workspace, datastore, layerList);
						});
					}
				});
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 해당 데이터스토어의 레이어를 조회한다.
 * 
 * @method gb.versioning.Repository#getListGeoServerLayer
 * @param {string}
 *            server - 레이어가 저장된 서버 이름
 * @param {string}
 *            work - 레이어가 저장된 작업공간 저장소 이름
 * @param {string}
 *            store - 레이어가 저장된 데이터 저장소 이름
 * @param {HTMLElement}
 *            select - 레이어 목록을 입력할 select 폼 객체
 */
gb.versioning.Repository.prototype.getListGeoserverLayer = function(server, work, store, select) {
	var that = this;

	var params = {
		"serverName" : server,
		"workspace" : work,
		"datastore" : store
	};

	var checkURL = this.getListGeoserverLayerURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}
	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (Array.isArray(data)) {
				$(select).empty();
				for (var i = 0; i < data.length; i++) {
					var opt = $("<option>").attr({
						"value" : data[i].layerName
					}).append(data[i].layerName);
					if (data[i].published === true) {
						$(opt).append(" [" + that.translation.published[that.locale] + "]");
						$(opt).prop("disabled", true);
					}
					$(select).append(opt);
				}
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 해당 레이어를 발행한다.
 * 
 * @method gb.versioning.Repository#publishGeogigLayer
 * @param {string}
 *            server - 레이어가 발행될 서버 이름
 * @param {string}
 *            work - 레이어가 발행될 작업공간 저장소 이름
 * @param {string}
 *            store - 레이어가 발행될 데이터 저장소 이름
 * @param {string}
 *            layer - 발행할 레이어 이름
 * @param {string}
 *            repo - 레이어가 저장된 GeoGig 저장소 이름
 * @param {string}
 *            branch - 레이어가 저장된 브랜치 이름
 * @param {gb.modal.ModalBase}
 *            modal - 완료 후 닫을 모달 객체
 * @param {function}
 *            callback - 완료 후 수행할 콜백함수
 */
gb.versioning.Repository.prototype.publishGeogigLayer = function(server, work, store, layer, repo, branch, modal, callback) {
	var that = this;

	var params = {
		"serverName" : server,
		"workspace" : work,
		"datastore" : store,
		"layer" : layer,
		"repoName" : repo,
		"branchName" : branch
	};

	var checkURL = this.getPublishGeogigLayerURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}
	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				var group = $("<div>").append(that.translation.layerpub[that.locale]);
				that.messageModal(that.translation.message[that.locale], group);
				// modal.close();
				if (typeof callback === "function") {
					callback();
				}
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 레이어 삭제 확인창을 생성한다.
 * 
 * @method gb.versioning.Repository#removeLayerModal
 * @param {string}
 *            layer - 삭제할 레이어의 이름
 */
gb.versioning.Repository.prototype.removeLayerModal = function(layer) {
	var that = this;
	var msg1 = $("<div>").text(this.translation.removelayermsg[this.locale]).addClass("gb-repository-msg16");
	var msg2 = $("<div>").text('"' + layer + '"').addClass("gb-repository-msg24");
	var body = $("<div>").append(msg1).append(msg2);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.cancel[this.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			this.translation.remove[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var removeModal = new gb.modal.ModalBase({
		"title" : this.translation.removelayer[this.locale],
		"width" : 310,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		removeModal.close();
	});
	$(okBtn).click(function() {
		var server = that.getNowServer();
		var repo = that.getNowRepository();
		var tid = that.getJSTree().getTransactionId(repo.id);
		var path = layer;
		var callback = function() {
			that.refreshList();
		};
		that.removeLayer(server.text, repo.text, tid, path, removeModal, callback);
	});
};

/**
 * GeoGig 저장소 정보 확인창을 생성한다.
 * 
 * @method gb.versioning.Repository#infoRepoModal
 * @param {string}
 *            serverName - GeoGig이 설치된 GeoServer 이름
 * @param {string}
 *            repoName - 정보를 조회할 GeoGig 저장소 이름
 */
gb.versioning.Repository.prototype.infoRepoModal = function(serverName, repoName) {
	var that = this;

	var namekey = $("<div>").addClass("gb-repository-info-key").text(this.translation.name[this.locale]);
	var nameval = $("<div>").addClass("gb-repository-info-value");
	var row1 = $("<div>").addClass("gb-repository-info-row").append(namekey).append(nameval);

	var urlkey = $("<div>").addClass("gb-repository-info-key").text(this.translation.url[this.locale]);
	var urlval = $("<div>").addClass("gb-repository-info-value");
	var row2 = $("<div>").addClass("gb-repository-info-row").append(urlkey).append(urlval);

	var lockey = $("<div>").addClass("gb-repository-info-key").text(this.translation.location[this.locale]);
	var locval = $("<div>").addClass("gb-repository-info-value");
	var row3 = $("<div>").addClass("gb-repository-info-row").append(lockey).append(locval);

	var storagekey = $("<div>").addClass("gb-repository-info-key").text(this.translation.storage[this.locale]);
	var storageval = $("<div>").addClass("gb-repository-info-value");
	var row4 = $("<div>").addClass("gb-repository-info-row").append(storagekey).append(storageval);

	var userkey = $("<div>").addClass("gb-repository-info-key").text(this.translation.user[this.locale]);
	var userval = $("<div>").addClass("gb-repository-info-value");
	var row5 = $("<div>").addClass("gb-repository-info-row").append(userkey).append(userval);

	var emailkey = $("<div>").addClass("gb-repository-info-key").text(this.translation.email[this.locale]);
	var emailval = $("<div>").addClass("gb-repository-info-value");
	var row6 = $("<div>").addClass("gb-repository-info-row").append(emailkey).append(emailval);
	var tb = $("<div>").addClass("gb-repository-info-table").append(row1).append(row2).append(row3).append(row4).append(row5).append(row6);
	var body = $("<div>").append(tb);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

	var params = {
		"serverName" : serverName,
		"repoName" : repoName
	};
	// + "&" + jQuery.param(params),
	var tranURL = this.getInfoRepositoryURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		// data : params,
		// dataType : 'jsonp',
		// jsonpCallback : 'getJson',
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				$(nameval).html(data.name);
				$(urlval).html(data.url);
				$(locval).html(data.location);
				$(storageval).html(data.storage);
				$(userval).html(data.user);
				$(emailval).html(data.email);
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});

	var removeModal = new gb.modal.ModalBase({
		"title" : this.translation.repoinfo[this.locale],
		"width" : 526,
		"height" : 366,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		removeModal.close();
	});
};

/**
 * 해당 레이어를 삭제한다.
 * 
 * @method gb.versioning.Repository#removeLayer
 * @param {string}
 *            server - 삭제할 레이어가 저장된 GeoServer 이름
 * @param {string}
 *            repo - 삭제할 레이어가 저장된 GeoGig 저장소 이름
 * @param {string}
 *            tid - 트랜잭션 아이디
 * @param {string}
 *            path - 레이어 이름
 * @param {string}
 *            modal - 완료 후 닫을 모달 객체
 * @param {string}
 *            callback - 완료 후 수행할 콜백함수
 */
gb.versioning.Repository.prototype.removeLayer = function(server, repo, tid, path, modal, callback) {
	var that = this;

	var params = {
		"serverName" : server,
		"repoName" : repo,
		"transactionId" : tid,
		"path" : path,
		"recursive" : true
	};

	var checkURL = this.getRemoveGeogigLayerURL();
	if (checkURL.indexOf("?") !== -1) {
		checkURL += "&";
		checkURL += jQuery.param(params);
	} else {
		checkURL += "?";
		checkURL += jQuery.param(params);
	}
	$.ajax({
		url : checkURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			$("body").css("cursor", "wait");
		},
		complete : function() {
			$("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				if (data.error === null) {
					var group = $("<div>").append(that.translation.layerdel[that.locale]);
					that.messageModal(that.translation.message[that.locale], group);
					modal.close();
					if (typeof callback === "function") {
						callback();
					}
				}
			} else {
				that.errorModal(data.error);
			}
		}
	}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 노드를 마지막 자식 노드까지 로드한다.
 * 
 * @private
 * @method gb.versioning.Repository#openNodeRecursive
 * @param {number}
 *            idx - 레이어 목록에서 선택한 노드들의 인덱스
 * @param {Object}
 *            node - 열려는 노드
 * @param {Object}
 *            topNode - 레이어 목록에서 선택한 노드
 * @param {function}
 *            afterOpen - 로드후 실행할 콜백함수
 * @param {boolean}
 *            each - 각 노드를 불러왔을 때마다 콜백 함수를 실행할지 지정
 */
gb.versioning.Repository.prototype.openNodeRecursive = function(idx, node, topNode, afterOpen, each) {
	var that = this;
	var callback = function(opened, children) {
		if (that.getLoadingNumber()[idx] > -1) {
			that.setLoadingNumber(idx, that.getLoadingNumber()[idx] + opened.children.length);
		}
		console.log("현재 로딩 리스트 인덱스에 로딩되야할 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
		that.changeNodeOnLoadingList(idx, opened.id, true);
		console.log("현재 로딩이 완료된 부모 노드는: ", opened.id.toString());
		console.log("현재 로딩 리스트 인덱스에 로딩되야할 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
		if (children) {
			var childrenNodes = opened.children;
			for (var i = 0; i < childrenNodes.length; i++) {
				that.addNodeToLoadingList(idx, childrenNodes[i]);
				var child = that.getJSTree().get_node(childrenNodes[i]);
				console.log("지금 로딩 리스트에 추가된 자식 노드는: ", child.id.toString());
				console.log("지금 로딩 리스트의 로딩되야할 자식 노드의 개수는: ", that.getLoadingNumber()[idx].toString());
				if (each) {
					that.openNodeRecursive(idx, child, topNode, afterOpen, true);
				} else {
					if (i === (childrenNodes.length - 1)) {
						that.openNodeRecursive(idx, child, topNode, afterOpen, false);
					} else {
						that.openNodeRecursive(idx, child, topNode, undefined, false);
					}
				}
			}
		} else {
			if (typeof afterOpen === "function" && that.getLoadingNumber()[idx] === 0) {
				afterOpen(topNode);
			}
		}
	};
	that.addNodeToLoadingList(idx, node.id);
	if (!that.getJSTree().is_open(node)) {
		that.getJSTree().open_node(node, callback);
	} else {
		var already = node;
		callback(node, node.children.length > 0);
	}
};

/**
 * loadingNumber 객체를 반환한다.
 * 
 * @private
 * @method gb.versioning.Repository#getLoadingNumber
 * @return {Object} 로딩할 노드목록을 가진 객체
 */
gb.versioning.Repository.prototype.getLoadingNumber = function() {
	return this.loadingNumber;
};

/**
 * loadingNumber 객체를 설정한다.
 * 
 * @private
 * @method gb.versioning.Repository#setLoadingNumber
 * @param {number}
 *            idx - 레이어의 인덱스
 * @param {number}
 *            num - 레이어의 남은 로딩 레이어 개수
 */
gb.versioning.Repository.prototype.setLoadingNumber = function(idx, num) {
	this.loadingNumber[idx] = num;
};

/**
 * loadingNumber 객체를 빈 상태호 초기화한다.
 * 
 * @private
 * @method gb.versioning.Repository#setLoadingNumber
 */
gb.versioning.Repository.prototype.initLoadingNumber = function() {
	this.loadingNumber = [];
};

/**
 * loadingList 객체를 반환한다.
 * 
 * @private
 * @method gb.versioning.Repository#getLoadingList
 * @return {Object} 로딩할 노드목록을 가진 객체
 */
gb.versioning.Repository.prototype.getLoadingList = function() {
	return this.loadingList;
};

/**
 * loadingList 객체를 설정한다.
 * 
 * @private
 * @method gb.versioning.Repository#setLoadingList
 * @param {Object}
 *            list - 로딩할 레이어 정보를 가진 객체
 */
gb.versioning.Repository.prototype.setLoadingList = function(list) {
	this.loadingList = list;
};

/**
 * loadingList 목록에 추가한다.
 * 
 * @private
 * @method gb.versioning.Repository#addLoadingList
 * @param {number}
 *            idx - 레이어의 인덱스
 * @param {string}
 *            nodeId - 레이어의 식별자
 */
gb.versioning.Repository.prototype.addNodeToLoadingList = function(idx, nodeId) {
	var list = this.getLoadingList();
	if (Array.isArray(list)) {
		if (list[idx] === undefined) {
			list[idx] = {};
			this.setLoadingNumber(idx, 1);
		}
		list[idx][nodeId] = false;
	} else {
		console.error("로딩 리스트 객체가 배열이 아닙니다.");
	}
};

/**
 * loadingList 객체를 설정한다.
 * 
 * @private
 * @method gb.versioning.Repository#initLoadingList
 */
gb.versioning.Repository.prototype.initLoadingList = function() {
	this.loadingList = [];
};

/**
 * loadingList 객체에 노드를 추가한다.
 * 
 * @private
 * @method gb.versioning.Repository#changeNodeOnLoadingList
 * @param {number}
 *            idx - 레이어의 인덱스
 * @param {string}
 *            nodeId - 레이어의 식별자
 * @param {boolean}
 *            flag - 로드 완료 여부
 */
gb.versioning.Repository.prototype.changeNodeOnLoadingList = function(idx, nodeId, flag) {
	var that = this;
	var list = this.getLoadingList();
	if (list[idx].hasOwnProperty(nodeId)) {
		list[idx][nodeId] = flag;
		// if (that.getLoadingNumber()[idx] === -1) {
		// that.setLoadingNumber(idx, 0);
		// }
		if (flag) {
			if (that.getLoadingNumber()[idx] > 0) {
				that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] - 1));
			}
		} else {
			that.setLoadingNumber(idx, (that.getLoadingNumber()[idx] + 1));
		}
	} else {
		console.error("there is no node id:", nodeId);
		return;
	}
};

/**
 * 오류 메세지 창을 표시한다.
 * 
 * @private
 * @method gb.tree.GeoServer#errorModal
 * @param {string}
 *            code - 오류 코드
 */
gb.versioning.Repository.prototype.errorModal = function(code) {
	var that = this;
	that.messageModal(that.translation.err[that.locale], that.translation[code][that.locale]);
};

/**
 * 레이어 변경이력 창을 표시한다.
 * 
 * @method gb.versioning.Repository#layerHistoryModal
 * @param {Object}
 *            server - 레이어가 저장된 서버 노드 객체
 * @param {Object}
 *            repo - 레이어가 저장된 GeoGig 저장소 노드 객체
 * @param {Object}
 *            path - 레이어 노드 객체
 */
gb.versioning.Repository.prototype.layerHistoryModal = function(server, repo, path) {
	var that = this;

	var user = $("<td>").addClass("gb-repository-history-cell").addClass("gb-repository-history-cell-user").text(
			that.translation.author[that.locale]);
	var day = $("<td>").addClass("gb-repository-history-cell").addClass("gb-repository-history-cell-date").text(
			that.translation.date[that.locale]);
	var cmsg = $("<td>").addClass("gb-repository-history-cell").addClass("gb-repository-history-cell-msg").text(
			that.translation.commitmsg[that.locale]);
	var detail = $("<td>").addClass("gb-repository-history-cell").addClass("gb-repository-history-no-right-border").addClass(
			"gb-repository-history-cell-detail").text(that.translation.detail[that.locale]);
	var revert = $("<td>").addClass("gb-repository-history-cell").addClass("gb-repository-history-cell-revert").text(
			that.translation.revert[that.locale]);

	// var row = $("<div>").addClass("tr
	// gb-versioning-feature-tr").append(user).append(day).append(cmsg).append(detail).append(revert);
	var row = $("<tr>").append(user).append(day).append(cmsg).append(detail);
	var rowgroup1 = $("<thead>").append(row);
	this.setLayerHistoryArea($("<tbody>")[0]);
	var tb = $("<table>").addClass("gb-repository-history-table").append(rowgroup1).append(this.getLayerHistoryArea());

	this.loadLayerHistory(server, repo, path, 10, null, true, true, undefined);

	var refIcon = $("<i>").addClass("fas").addClass("fa-sync-alt");
	var refBtn = $("<button>").addClass("gb-button-clear").append(refIcon).append(" " + that.translation.refresh[that.locale]).click(
			function() {
				that.loadLayerHistory(server, repo, path, 10, null, true, true, undefined);
			});
	var reftd = $("<div>").addClass("gb-repository-history-refresh").append(refBtn);

	var readIcon = $("<i>").addClass("fas").addClass("fa-caret-down");
	var readBtn = $("<button>").addClass("gb-button-clear").append(readIcon).append(" " + that.translation.readmore[that.locale]).click(
			function() {
				var ltr = $(that.getLayerHistoryArea()).find("tr.gb-repository-history-commit").last();
				var until = $(ltr).attr("commitid");
				console.log($(ltr).attr("commitid"));
				that.loadLayerHistory(server, repo, path, 10, until, true, false, undefined);
			});
	var td3 = $("<div>").addClass("gb-repository-history-readmore").append(readBtn);
	var row3 = $("<div>").addClass("tr gb-versioning-feature-tr").append(td3);
	var rowgroup3 = $("<div>").addClass("gb-versioning-feature-trg").append(row3);

	var body = $("<div>").addClass("gb-repository-history-area").append(reftd).append(tb).append(td3);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			this.translation.close[this.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : this.translation.history[this.locale],
		"width" : 1000,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		modal.close();
	});
};

/**
 * 피처 revert 요청 모달을 연다.
 * 
 * @private
 * @method gb.versioning.Repository#openRevertModal
 * @param {string}
 *            server - 작업중인 GeoServer 이름
 * @param {string}
 *            repo - 작업중인 GeoGig 저장소 이름
 * @param {string}
 *            path - revert할 피쳐의 path
 * @param {string}
 *            oc - 예전 커밋 아이디
 * @param {string}
 *            nc - 새로운 커밋 아이디
 * @param {gb.modal.ModalBase}
 *            compmodal - 완료 후 닫을 revert 모달 객체
 */
gb.versioning.Repository.prototype.openRevertModal = function(server, repo, path, oc, nc, compmodal) {
	var that = this;
	var msg1 = $("<div>").text(that.translation.revertmsg1[that.locale]).addClass("gb-repository-msg16");
	var msg2 = $("<div>").text(that.translation.revertmsg2[that.locale]).addClass("gb-repository-msg16");
	var inputMsg = $("<input>").attr({
		"type" : "text",
		"placeholder" : that.translation.commitdesc[that.locale]
	}).addClass("gb-form");
	var msg3 = $("<div>").append(inputMsg);

	var body = $("<div>").append(msg1).append(msg2).append(msg3);
	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.cancel[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.revert[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var commitModal = new gb.modal.ModalBase({
		"title" : that.translation.revert[that.locale],
		"width" : 494,
		"height" : 200,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});
	$(closeBtn).click(function() {
		commitModal.close();
	});
	$(okBtn).click(function() {
		var message = inputMsg.val();
		that.revert(server, repo, path, oc, nc, message, message, commitModal, compmodal);
	});
};

/**
 * 피처 revert 요청한다.
 * 
 * @method gb.versioning.Repository#revert
 * @param {string}
 *            server - 작업중인 GeoServer 이름
 * @param {string}
 *            repo - 작업중인 GeoGig 저장소 이름
 * @param {string}
 *            path - revert할 피쳐의 path
 * @param {string}
 *            oc - 예전 커밋 아이디
 * @param {string}
 *            nc - 새로운 커밋 아이디
 * @param {string}
 *            cm - 커밋 메세지
 * @param {string}
 *            mm - 머지 메세지
 * @param {gb.modal.ModalBase}
 *            rmodal - 완료 후 닫을 메세지 모달 객체
 * @param {gb.modal.ModalBase}
 *            compmodal - 완료 후 닫을 revert 모달 객체
 */
gb.versioning.Repository.prototype.revert = function(server, repo, path, oc, nc, cm, mm, rmodal, cmodal) {
	var that = this;

	var params = {
		"serverName" : server,
		"repoName" : repo,
		"path" : path,
		"oldCommitId" : oc,
		"newCommitId" : nc,
		"commitMessage" : cm,
		"mergeMessage" : mm
	}
	console.log(params);

	var tranURL = that.getFeatureRevertURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				if (data.merge.conflicts === null) {
					var msg1 = $("<div>").text(that.translation.revertsucc[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.ok[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.revert[that.locale],
						"width" : 350,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					rmodal.close();
					cmodal.close();
					var serverFake = {
						"text" : server
					};
					var repoFake = {
						"text" : repo
					};
					var pathFake = {
						"text" : path
					};
					that.loadLayerHistory(serverFake, repoFake, pathFake, 10, null, true, true, undefined);
				} else if (Array.isArray(data.merge.conflicts)) {
					var msg1 = $("<div>").text(that.translation.revertfail[that.locale]).addClass("gb-repository-msg16");
					var msg2 = $("<div>").text(that.translation.conflictmsg1[that.locale]).addClass("gb-repository-msg16");
					var body = $("<div>").append(msg1).append(msg2);
					var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default")
							.text(that.translation.cancel[that.locale]);
					var okBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-primary").text(
							that.translation.resolve[that.locale]);
					var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

					var commitModal = new gb.modal.ModalBase({
						"title" : that.translation.revert[that.locale],
						"width" : 350,
						"height" : 200,
						"autoOpen" : true,
						"body" : body,
						"footer" : buttonArea
					});
					$(closeBtn).click(function() {
						commitModal.close();
					});
					$(okBtn).click(
							function() {
								mModal.close();
								that.endTransaction(server, repo, tid, commitModal);
								that.resolveConflictModal(server, repo, repo, that.getNowBranch().text, branch, data.merge.ours,
										data.merge.theirs, data.merge.features, commitModal);
								that.openConflictDetailModal();
							});
				}
			}
		}
	});
};

/**
 * 스피너를 보여준다.
 * 
 * @method gb.versioning.Repository#showSpinner
 * @param {boolean}
 *            show - 스피너 표시 유무
 * @param {gb.modal.ModalBase}
 *            modal - 스피너를 표시할 모달 객체
 */
gb.versioning.Repository.prototype.showSpinner = function(show, modal) {
	if (show) {
		var spinnerArea = $("<div>").append($("<i>").addClass("fas fa-spinner fa-spin fa-5x")).addClass("gb-spinner-wrap").addClass(
				"gb-spinner-body").addClass("gb-spinner-position");
		$(modal.modal).append(spinnerArea);
	} else {
		$(modal.modal).find(".gb-spinner-wrap").remove();
	}
};

/**
 * 레이어 편집이력을 요청한다.
 * 
 * @private
 * @method gb.versioning.Repository#loadLayerHistory
 * @param {Object}
 *            server - GeoServer 노드 객체
 * @param {Object}
 *            repo - GeoGig 저장소 노드 객체
 * @param {Object}
 *            path - 레이어 노드 객체
 * @param {number}
 *            limit - 불러올 이력 개수
 * @param {string}
 *            until - 올려올 이력의 기준 커밋 아이디
 * @param {boolean}
 *            paste - 기존 이력에 이어지는지 여부
 * @param {boolean}
 *            refresh - 새로고침 동작인지 여부
 * @param {function}
 *            callback - 로드 완료 후 수행할 콜백함수
 */
gb.versioning.Repository.prototype.loadLayerHistory = function(server, repo, path, limit, until, paste, refresh, callback) {
	var that = this;
	var params = {
		"serverName" : server.text,
		"repoName" : repo.text,
		"path" : path.text,
		"limit" : limit
	}
	if (typeof until === "string") {
		params["until"] = until;
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getLogLayerURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax(
			{
				url : tranURL,
				method : "POST",
				contentType : "application/json; charset=UTF-8",
				// data : params,
				// dataType : 'jsonp',
				// jsonpCallback : 'getJson',
				beforeSend : function() {
					// $("body").css("cursor", "wait");
				},
				complete : function() {
					// $("body").css("cursor", "default");
				},
				success : function(data) {
					console.log(data);
					if (data.success === "true") {
						if (refresh) {
							$(that.getLayerHistoryArea()).empty();
						}
						if (typeof callback === "function") {
							callback(data);
						}
						if (paste === false) {
							return;
						}
						var ltr = $(that.getLayerHistoryArea()).find("tr").last();
						var trelem = $(ltr)[0];
						var until;
						if (trelem !== undefined && trelem !== null) {
							until = $(ltr).attr("commitid");
						}
						var commits = data.simpleCommits;
						if (Array.isArray(commits)) {
							for (var i = 0; i < commits.length; i++) {
								if (until !== undefined) {
									if (commits[i].commitId === until && commits.length === 1) {
										var title = that.translation.err[that.locale];
										var msg = that.translation.nocommit[that.locale];
										that.messageModal(title, msg);
										continue;
									}
									if (commits[i].commitId === until) {
										continue;
									}
								}
								var user = $("<td>").addClass("gb-repository-history-cell-content").addClass(
										"gb-repository-history-cell-user").text(commits[i].authorName);
								var day = $("<td>").addClass("gb-repository-history-cell-content").addClass(
										"gb-repository-history-cell-date").text(commits[i].date);
								var cmsg = $("<td>").addClass("gb-repository-history-cell-content").addClass(
										"gb-repository-history-cell-msg").text(commits[i].message);
								var detailIcon = $("<i>").addClass("fas").addClass("fa-list");
								var detailBtn = $("<button>").addClass("gb-button-clear").append(detailIcon).click(function() {
									var tr = $(this).parents().eq(1);
									var changes = parseInt($(tr).attr("changes"));
									if (changes >= 10) {
										var title = that.translation.err[that.locale];
										var msg = that.translation.nodetailretr[that.locale];
										that.messageModal(title, msg);
										return;
									}
									var serverp = params["serverName"];
									var repop = params["repoName"];
									var pathp = params["path"];
									console.log($(this).parents().eq(1).index());

									var flag = $(tr).next().hasClass("gb-repository-history-detail-row");
									$(".gb-repository-history-detail-row").remove();
									var newtr = $(tr)[0] !== undefined ? $(tr)[0] : undefined;
									var newid = newtr !== undefined ? $(newtr).attr("commitid") : undefined;
									var oldtr = $(newtr).next()[0] !== undefined ? $(newtr).next() : undefined;
									var oldid = oldtr !== undefined ? $(oldtr).attr("commitid") : undefined;
									var newidx = $(tr).index();
									var oldidx = $(tr).index() + 1;
									if (!flag && typeof newid === "string" && typeof oldid === "string") {
										that.loadCommitDetail(serverp, repop, pathp, newid, oldid, $(this)[0]);
									} else if (!flag && typeof newid === "string" && oldid === undefined) {
										var buttonObj = $(this)[0];
										var callback = function(data) {
											console.log("callback working");
											if (data.success === "true") {
												var commits = data.simpleCommits;
												if (Array.isArray(commits)) {
													if (commits.length === 2) {
														var loadedOldid = commits[1].commitId;
														that.loadCommitDetail(serverp, repop, pathp, newid, loadedOldid, buttonObj);
													} else if (commits.length < 2) {
														var title = that.translation.err[that.locale];
														var msg = that.translation.firstcommit[that.locale];
														that.messageModal(title, msg);
													}
												}
											}
										}
										that.loadLayerHistory(server, repo, path, 2, newid, undefined, false, callback);
									}
								});
								var detail = $("<td>").addClass("gb-repository-history-cell-content").addClass(
										"gb-repository-history-cell-detail").addClass("gb-repository-history-cell-content-center").append(
										detailBtn);

								var revertIcon = $("<i>").addClass("fas").addClass("fa-undo");
								var revertBtn = $("<button>").addClass("gb-button-clear").append(revertIcon);
								var revert = $("<td>").addClass("gb-repository-history-cell-content").addClass(
										"gb-repository-history-cell-content-center").addClass("gb-repository-history-cell-revert").append(
										revertBtn);

								var row1 = $("<tr>").append(user).append(day).append(cmsg).append(detail).attr({
									"commitId" : commits[i].commitId,
									"changes" : (commits[i].adds + commits[i].modifies + commits[i].removes)
								}).addClass("gb-repository-history-commit");
								$(that.getLayerHistoryArea()).append(row1);
							}
						}
					} else {
						that.errorModal(data.error);
					}
				}
			}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 커밋의 상세 편집이력을 요청한다.
 * 
 * @method gb.versioning.Repository#loadCommitDetail
 * @param {string}
 *            server - 레이어가 저장된 GeoServer 이름
 * @param {string}
 *            repo - 레이어가 저장된 GeoGig 저장소 이름
 * @param {string}
 *            layer - 레이어 이름
 * @param {string}
 *            newid - 새 커밋 아이디
 * @param {string}
 *            oldid - 이전 커밋 아이디
 * @param {HTMLElement}
 *            btn - 커밋 상세 보기 버튼 객체
 */
gb.versioning.Repository.prototype.loadCommitDetail = function(server, repo, layer, newid, oldid, btn) {
	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"layerName" : layer,
		"new" : newid,
		"old" : oldid
	}
	// + "&" + jQuery.param(params),
	var tranURL = this.getDiffLayerURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax(
			{
				url : tranURL,
				method : "POST",
				contentType : "application/json; charset=UTF-8",
				// data : params,
				// dataType : 'jsonp',
				// jsonpCallback : 'getJson',
				beforeSend : function() {
					// $("body").css("cursor", "wait");
				},
				complete : function() {
					// $("body").css("cursor", "default");
				},
				success : function(data) {
					console.log(data);
					if (data.success === "true") {
						var diffs = data.diffs;
						if (Array.isArray(diffs)) {
							console.log($(btn).parents().eq(1));

							var ul = $("<ul>").addClass("gb-repository-history-detail-ul");
							var div = $("<div>").addClass("gb-repository-history-detail-area").append(ul);

							for (var i = 0; i < diffs.length; i++) {
								var typeLabel = typeof diffs[i].changeType === "string" ? diffs[i].changeType.toLowerCase() : "unknown";
								var type = $("<span>").addClass("gb-repository-history-detail-li-span").text(
										that.translation[typeLabel][that.locale]);
								var selectedPath = diffs[i].changeType.toUpperCase() === "ADDED"
										|| diffs[i].changeType.toUpperCase() === "MODIFIED" ? diffs[i].newPath : diffs[i].path;
								var fid = $("<span>").addClass("gb-repository-history-detail-li-span").text(selectedPath);
								var icon = $("<i>").addClass("fas").addClass("fa-search");
								var deBtn = $("<button>").addClass("gb-repository-history-detail-li-span").attr({
									"newObjectId" : diffs[i].newObjectId,
									"oldObjectId" : diffs[i].oldObjectId,
									"path" : selectedPath
								}).append(icon).addClass("gb-button-clear").click(function() {
									// var nid = $(this).attr("newObjectId");
									var nid = newid;
									// var oid = $(this).attr("oldObjectId");
									var oid = oldid;
									var path = $(this).attr("path");
									that.openDetailChanges(server, repo, path, nid, oid);
								});
								var de1 = $("<div>").append(type).append(fid).append(deBtn);
								var li = $("<li>").append(de1);
								$(ul).append(li);

								var td1 = $("<td>").attr({
									"colspan" : "2"
								});
								var td2 = $("<td>").append(div);
								var td3 = $("<td>").attr({
									"colspan" : "2"
								});
								var tr1 = $("<tr>").addClass("gb-repository-history-detail-row").append(td1).append(td2).append(td3);

								$(btn).parents().eq(1).after(tr1);
							}
						} else {
							var title = that.translation.err[that.locale];
							var msg = that.translation.nochange[that.locale];
							that.messageModal(title, msg);
						}
					} else {
						that.errorModal(data.error);
					}
				}
			}).fail(function(xhr, status, errorThrown) {
		that.errorModal(xhr.responseJSON.status);
	});
};

/**
 * 피처 디테일 창을 연다.
 * 
 * @method gb.versioning.Repository#openDetailChanges
 * @param {string}
 *            server - 서버 이름
 * @param {string}
 *            repo - GeoGig 저장소 이름
 * @param {string}
 *            path - 피처 패스
 * @param {number}
 *            nid - 현재 커밋 아이디
 * @param {number}
 *            oid - 이전 커밋 아이디
 */
gb.versioning.Repository.prototype.openDetailChanges = function(server, repo, path, nid, oid) {
	var that = this;

	var olabel = $("<div>").append(that.translation.beforeft[that.locale]).addClass("gb-form").addClass(
			"gb-repository-history-detail-changes-label");

	var oheadtd1 = $("<th>").text(that.translation.attr[that.locale]);
	var oheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var oheadth = $("<tr>").append(oheadtd1).append(oheadtd2);
	var oattrthead = $("<thead>").append(oheadth);
	this.tattrtbody = $("<tbody>").addClass("gb-repository-history-detail-changes-tbody");
	var oattrtable = $("<table>").append(oattrthead).append(this.tattrtbody).addClass("gb-table");
	var oattribute = $("<div>").append(oattrtable).addClass("gb-repository-history-detail-changes-area");
	var oarea = $("<div>").append(olabel).append(this.tfeature).append(oattribute).addClass("gb-repository-history-detail-changes-half");

	var clabel = $("<div>").append(that.translation.afterft[that.locale]).addClass("gb-form").addClass(
			"gb-repository-history-detail-changes-label");

	var cheadtd1 = $("<th>").text(that.translation.attr[that.locale]);
	var cheadtd2 = $("<th>").text(that.translation.value[that.locale]);
	var cheadth = $("<tr>").append(cheadtd1).append(cheadtd2);
	var cattrthead = $("<thead>").append(cheadth);
	this.cattrtbody = $("<tbody>").addClass("gb-repository-history-detail-changes-tbody");
	var cattrtable = $("<table>").append(cattrthead).append(this.cattrtbody).addClass("gb-table");
	var cattribute = $("<div>").append(cattrtable).addClass("gb-repository-history-detail-changes-area");

	$(this.tattrtbody).on("scroll", function() {
		$(that.cattrtbody).prop("scrollTop", this.scrollTop).prop("scrollLeft", this.scrollLeft);
	});

	var carea = $("<div>").append(clabel).append(this.cfeature).append(cattribute).addClass("gb-repository-history-detail-changes-half");

	var ocarea = $("<div>").addClass("gb-repository-history-detail-changes-compare-area").append(oarea).append(carea);

	var body = $("<div>").append(ocarea);

	var closeBtn = $("<button>").addClass("gb-button-float-right").addClass("gb-button").addClass("gb-button-default").text(
			that.translation.close[that.locale]);
	var okBtn = $("<button>").addClass("gb-button-float-left").addClass("gb-button").addClass("gb-button-primary").text(
			that.translation.revert[that.locale]);
	var buttonArea = $("<span>").addClass("gb-modal-buttons").append(okBtn).append(closeBtn);

	var modal = new gb.modal.ModalBase({
		"title" : that.translation.comparebeaf[that.locale],
		"width" : 770,
		"height" : 840,
		"autoOpen" : true,
		"body" : body,
		"footer" : buttonArea
	});

	$(closeBtn).click(function() {
		modal.close();
	});

	var that = this;
	var params = {
		"serverName" : server,
		"repoName" : repo,
		"path" : path,
		"newCommitId" : nid,
		"oldCommitId" : oid
	}

	var tranURL = this.getFeatureDiffURL();
	if (tranURL.indexOf("?") !== -1) {
		tranURL += "&";
		tranURL += jQuery.param(params);
	} else {
		tranURL += "?";
		tranURL += jQuery.param(params);
	}

	$.ajax({
		url : tranURL,
		method : "POST",
		contentType : "application/json; charset=UTF-8",
		beforeSend : function() {
			// $("body").css("cursor", "wait");
		},
		complete : function() {
			// $("body").css("cursor", "default");
		},
		success : function(data) {
			console.log(data);
			if (data.success === "true") {
				if (data.hasOwnProperty("diffs")) {
					var diffs = data.diffs
					if (Array.isArray(diffs)) {
						for (var i = 0; i < diffs.length; i++) {
							if (diffs[i].geometry === "true") {
								var crs;
								if (diffs[i].crs !== undefined && diffs[i].crs !== null) {
									crs = diffs[i].crs.substring(diffs[i].crs.indexOf(":") + 1);
								}
								var leftGeom, rightGeom;
								var osm = new ol.layer.Tile({
									"source" : new ol.source.OSM(),
									"zIndex" : 1
								});

								that.getTargetMap().updateSize();
								that.getTargetMap().getLayers().clear();
								that.getTargetMap().addLayer(osm);

								var oldwkt = diffs[i].oldvalue;
								if (oldwkt !== undefined && oldwkt !== null) {
									var format = new ol.format.WKT();
									var geom = format.readGeometry(oldwkt);
									leftGeom = geom;
									var feature = new ol.Feature({
										"geometry" : geom
									});

									var style = new ol.style.Style({
										image : new ol.style.Circle({
											radius : 5,
											fill : new ol.style.Fill({
												color : 'orange'
											})
										}),
										stroke : new ol.style.Stroke({
											width : 1,
											color : 'orange'
										}),
										fill : new ol.style.Fill({
											color : 'orange'
										})
									});

									var vlayer = new ol.layer.Vector({
										"style" : style,
										"source" : new ol.source.Vector({
											"features" : [ feature ]
										}),
										"zIndex" : 2
									});
									that.getTargetMap().addLayer(vlayer);
								}

								that.getCurrentMap().updateSize();
								that.getCurrentMap().getLayers().clear();
								that.getCurrentMap().addLayer(osm);

								var newwkt;
								if (diffs[i].changetype.toUpperCase() === "NO_CHANGE") {
									newwkt = diffs[i].oldvalue;

									$(that.cfeature).css({
										"border" : "1px solid #ccc"
									});
									$(that.tfeature).css({
										"border" : "1px solid #ccc"
									});
								} else if (diffs[i].changetype.toUpperCase() === "MODIFIED"
										|| diffs[i].changetype.toUpperCase() === "ADDED") {
									newwkt = diffs[i].newvalue;

									$(that.cfeature).css({
										"border" : "3px solid #ffc523"
									});
									$(that.tfeature).css({
										"border" : "3px solid #ffc523"
									});
								}

								if (newwkt !== undefined && newwkt !== null) {
									var format = new ol.format.WKT();
									var geom = format.readGeometry(newwkt);
									rightGeom = geom;
									var feature = new ol.Feature({
										"geometry" : geom
									});

									var style = new ol.style.Style({
										image : new ol.style.Circle({
											radius : 5,
											fill : new ol.style.Fill({
												color : 'orange'
											})
										}),
										stroke : new ol.style.Stroke({
											width : 1,
											color : 'orange'
										}),
										fill : new ol.style.Fill({
											color : 'orange'
										})
									});

									var vlayer = new ol.layer.Vector({
										"style" : style,
										"source" : new ol.source.Vector({
											"features" : [ feature ]
										}),
										"zIndex" : 2
									});

									that.getCurrentMap().addLayer(vlayer);
									// that.getLeftMap().getView().fit(geom);
								}
								var tempCallback;
								if (diffs[i].changetype.toUpperCase() === "MODIFIED" || diffs[i].changetype.toUpperCase() === "ADDED") {
									tempCallback = function() {
										that.getCurrentMap().getView().fit(rightGeom);
									}
								} else if (diffs[i].changetype.toUpperCase() === "REMOVED"
										|| diffs[i].changetype.toUpperCase() === "NO_CHANGE") {
									tempCallback = function() {
										that.getTargetMap().getView().fit(leftGeom);
									}
								}
								this.crs = new gb.crs.BaseCRS({
									"autoOpen" : false,
									"title" : "Base CRS",
									"message" : $(".epsg-now"),
									"maps" : [ that.getTargetMap(), that.getCurrentMap() ],
									"epsg" : crs,
									"callback" : tempCallback
								});

							} else {
								var otd1 = $("<td>").text(diffs[i].attributename);
								var otd2 = $("<td>").text(diffs[i].oldvalue);
								var otr1 = $("<tr>").append(otd1).append(otd2);
								$(that.getLeftTBody()).append(otr1);

								var ctd1 = $("<td>").text(diffs[i].attributename);
								var newval;
								if (diffs[i].changetype.toUpperCase() === "NO_CHANGE") {
									newval = diffs[i].oldvalue;
								} else {
									newval = diffs[i].newvalue;
								}
								var ctd2 = $("<td>").text(newval);
								var ctr1 = $("<tr>").append(ctd1).append(ctd2);

								if (diffs[i].changetype.toUpperCase() !== "NO_CHANGE") {
									$(otr1).css({
										"background-color" : "#ffc523"
									});
									$(ctr1).css({
										"background-color" : "#ffc523"
									});
								}

								$(that.getRightTBody()).append(ctr1);
							}
						}
						$(okBtn).click(function() {
							that.openRevertModal(server, repo, path, oid, nid, modal);
						});
					}
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {

		}
	});

};

/**
 * 왼쪽 피처 tbody를 반환한다.
 * 
 * @method gb.versioning.Repository#getLeftTBody
 * @return {HTMLElement} 왼쪽 피처 tbody 객체
 */
gb.versioning.Repository.prototype.getLeftTBody = function() {
	return this.tattrtbody;
}

/**
 * 오른쪽 피처 tbody를 반환한다.
 * 
 * @method gb.versioning.Repository#getRightTBody
 * @return {HTMLElement} 오른쪽 피처 tbody 객체
 */
gb.versioning.Repository.prototype.getRightTBody = function() {
	return this.cattrtbody;
}

/**
 * 피처 되돌리기 요청 URL을 반환한다.
 * 
 * @method gb.versioning.Repository#getFeatureRevertURL
 * @return {string} 요청 URL
 */
gb.versioning.Repository.prototype.getFeatureRevertURL = function() {
	return this.featureRevertURL;
};

/**
 * 레이어 이력 영억 설정
 * 
 * @method gb.versioning.Repository#setLayerHistoryArea
 * @param {HTMLElement}
 *            tbody - 레이어 이력 영역 tbody 객체
 */
gb.versioning.Repository.prototype.setLayerHistoryArea = function(tbody) {
	this.layerHistoryArea = tbody;
};

/**
 * 레이어 이력 영역 반환
 * 
 * @method gb.versioning.Repository#getLayerHistoryArea
 * @return {HTMLElement} 레이어 이력 영역 tbody 객체
 */
gb.versioning.Repository.prototype.getLayerHistoryArea = function() {
	return this.layerHistoryArea;
};
