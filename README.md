# OpenGDS3DBuilder2019Prod
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Korean](https://img.shields.io/badge/language-Korean-blue.svg)](#korean)


<a name="korean"></a>
OpenGDS3DBuilder2019Prod (웹 기반 공간자료 3D 편집도구) 
=======
이 프로젝트는 국토공간정보연구사업 중 [공간정보 SW 활용을 위한 오픈소스 가공기술 개발]과제의 연구성과 입니다.<br>
웹 상에서 3D 공간 정보를 편집할 수 있으며 OpenLayers, Cesium, ThreeJS, TurfJS  등의 오픈소스 라이브러리들을 사용하여 개발되었습니다.<br>
별도의 프로그램 설치 없이 웹 브라우저 상에서 3D 공간 정보를 편집하고 다양한 포맷으로 Import/Export 할 수 있습니다.<br>

감사합니다.<br>
공간정보기술(주) 연구소 <link>http://www.git.co.kr/<br>
OpenGeoDT 팀


특징
=====
- OpenGDS3DBuilder2019Prod 은 3차원 공간정보 편집 솔루션임.
- 웹 페이지상에서 3차원 공간정보를 편집할 수 있으며 댜양한 포맷의 3D 파일에 대한 Import/Export 기능을 지원함.
- Geoserver를 연동하여 2차원 공간정보를 3차원 공간정보로 변환 및 가시화하는 기능을 지원함.
- 다양한 웹 브라우저 지원가능, 플러그인 및 ActiveX 설치 없이 사용 가능함.
- JavaScript, Java 라이브러리 형태로 개발되어 사용자 요구사항에 따라 커스터 마이징 및 확장이 가능함.


연구기관
=====
- 세부 책임 : 부산대학교 <link>http://www.pusan.ac.kr/<br>
- 연구 책임 : 국토연구원 <link>http://www.krihs.re.kr/


Getting Started
=====
### 1. 환경 ###
- Java – OpenJDK 1.8.0.111 64 bit
- eclipse neon
- Spring boot 1.5.9
- PostgreSQL 9.4 
- Geoserver 2.13.2
- RabbitMQ 3.7.7
- Apache HTTP Server 2.4

### 2. Geoserver 설치 및 설정 ###
- http://geoserver.org/ 접속 후 Geoserver 2.13.2 Windows Installer 다운로드 <br> 
** jdk 1.8 버전 이상 사용 시 Geoserver 2.8 버전 이상 사용
- Windows Installer 실행 후  C:\Program Files (x86) 경로에 설치
- C:\Program Files (x86)\GeoServer 2.13.2\bin 경로의 startup.bat 실행

### 3. PostgreSQL 설치 및 설정 ###
- http://www.postgresql.org/download/ 접속 후 PostgreSQL 다운로드 및 설치
- pgAdmin 실행 후 새로운 데이터베이스 생성 
- 소스코드에서 gdo2018scheme 파일 다운로드
- 생성한 데이터베이스에 gdo2018scheme 파일 restore

### 4. RabbitMQ 설치 및 설정 ###
- erlang 다운로드 및 설치 http://www.erlang.org/download.html
- rabbitMQ windows 버전 다운로드 및 설치 http://www.rabbitmq.com/download.html 에서 installer 버전을 받아 설치
- 명령 프롬프트에서 c:/Program Files/RabbitMQ Server/rabbitmq_server-x.x.x/sbin 으로 이동후
  >   rabbitmq-plugins enable rabbitmq_management 커맨드 실행해서 RabbitMQ Management Plug-in 설치
- RabbitMQ 서비스 재시작
- RabbitMQ Management 접속(localhost:15672) 후 guest/guest로 로그인
- 프로젝트를 위한 새로운 계정 생성
- virtual host, exchange, routing key 설정

### 5. Apache web server 설치 및 설정 ###
- 운영체제에 맞는 Apache http server 설치
- 텍스트 에디터에서 Apache http server경로/conf/httpd.conf 파일 열기
- ServerRoot(서버 설치 경로) 설정
- Listen(사용할 포트 번호) 설정
- DocumentRoot(파일 저장 경로) 설정
- Cross-origin 해제
  1. #LoadModule headers_module modules/mod_headers.so 구문에서 #제거
  2. <Directory "your root"> 태그 안에
      <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
      </IfModule>
     구문 추가

### 6. 소스코드 설치 및 프로젝트 실행 ###
- https://github.com/ODTBuilder/OpenGDS3DBuilder2019Prod 접속 후 소스코드 다운로드
- eclipse 실행 후 Project Import
- 프로젝트 경로 내 src/main/resources/application.yml 접근 후 아래 속성들을 수정
<pre><code>
spring:
  rabbitmq:
    host: 레빗엠큐 호스트 주소 EX)175.111.222.333
    port: 레빗엠큐 포트번호 EX)5672
    virtual-host: 레빗 엠큐 버추얼 호스트
    username: 레빗엠큐 계정명
    password: 레빗엠큐 비밀번호
    template:
      exchange: 레빗엠큐 익스체인지
      routing-key: 레빗엠큐 라우팅키
      routing-key-mobile: 레빗엠큐 모바일용 라우팅키
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    url: jdbc:postgresql://postgresql주소:포트번호/데이터베이스 이름?charSet=UTF-8&prepareThreshold=1
    username: 데이터베이스 계정명
    password: 데이터베이스 비밀번호
    driver-class-name: org.postgresql.Driver
    hikari:
      connection-test-query: SELECT 1
      minimum-idle: 3
      maximum-pool-size: 20
      pool-name: gdoDBPool_Prod
      auto-commit: false
  mvc:
    view:
      prefix: /WEB-INF/jsp/
      suffix: .jsp
  http:
    multipart:
      max-file-size: 10485760KB
      max-request-size: 10485760KB
server:
  port: 프로젝트 접속 포트번호
  context-path: /geodt
  servlet:
    session:
      timeout: 3600
  jsp-servlet:
    init-parameters:
      development: true
  error:
    whitelabel:
      enabled: false
gitrnd:
  serverhost: 프로젝트 접속 주소 EX)175.111.222.333
  apache:
    host: 아파치 http 서버 주소 EX) 127.0.0.1
    port: 아파치 http 서버 포트 EX) 8888
    basedir: 파일 저장 디렉토리 이름 EX) gdofiles
    basedrive: 드라이브 명 EX) C
mybatis:
  config-location: classpath:config/mybatis.xml
  mapper-location: classpath:sql/*.xml
  configuration:
    map-underscore-to-camel-case: true
    use-column-label: true
</code></pre>
- 서버 실행 후 메인 페이지 url 접속 
 <pre><code> http://[host]:[port]/geodt/main.do </code></pre>
- 가입 후 로그인
- 편집도구 초기화면 접속 

### 7. 지원 기능 ###

- ### Openlayers Layer 편집 기능 지원<br>
- ### ThreeJS 편집 기능 지원<br>

### 8. 요청방법 ###
- [Producer 인터페이스 설계서.pdf]

사용 라이브러리
=====
1. jQuery 2.2.2 (MIT License, CC0) http://jquery.com/
2. jQuery UI 1.11.4 (MIT License & GPL License, this case MIT License), start theme. http://jqueryui.com/
3. GeoTools 16.5 (LGPL) http://www.geotools.org/
4. ApachePOI 3.14 (Apache License 2.0) http://poi.apache.org
5. ApacheCommons 1.3.3 (Apache License 2.0) commons.apache.org/proper/commons-logging/
6. JACKSON 1.9.7 (Apache License (AL) 2.0, LGPL 2.1)
7. JSON 20160212 (MIT License)
8. Openlayers3 v5.3.0 (FreeBSD) www.openlayers.org
9. Spectrum 1.8.0 (MIT) http://numeraljs.com/
10. Bootstrap v3.3.2 (MIT) http://getbootstrap.com
11. JSTS (EPL) http://bjornharrtell.github.io/jsts/
12. three.js r109 (MIT) https://github.com/mrdoob/three.js
13. Cesium (Apache License 2.0) http://cesiumjs.org/

Mail
=====
Developer : SG.LEE
ghre55@git.co.kr

