<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div id="geoserverModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" data-dismiss="modal" aria-label="Close" class="close">
					<span aria-hidden="true">×</span>
				</button>
				<h4 class="modal-title">
					<spring:message code="lang.geoserver" />
				</h4>
			</div>
			<div class="modal-body">
				<div class="builderLayerGeoServerPanel"></div>
			</div>
		</div>
	</div>
</div>
<div id="geoserverAdd" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-body">
				<form class="gb-geoserver-add-table">
					<div class="gb-geoserver-add-row">
						<div class="gb-geoserver-add-label">Name: </div>
						<div class="gb-geoserver-add-input-cell">
							<input type="text" value="geo42" class="gb-geoserver-add-input geoserver-name">
						</div>
					</div>
					<div class="gb-geoserver-add-row">
						<div class="gb-geoserver-add-label">URL: </div>
						<div class="gb-geoserver-add-input-cell">
							<input type="text" value="http://175.116.181.42:9990/geoserver" class="gb-geoserver-add-input geoserver-url">
						</div>
					</div>
					<div class="gb-geoserver-add-row">
						<div class="gb-geoserver-add-label">ID: </div>
						<div class="gb-geoserver-add-input-cell">
							<input type="text" value="admin" class="gb-geoserver-add-input geoserver-id">
						</div>
					</div>
					<div class="gb-geoserver-add-row">
						<div class="gb-geoserver-add-label">Password: </div>
						<div class="gb-geoserver-add-input-cell">
							<input type="password" autocomplete="username" value="geoserver" class="gb-geoserver-add-input geoserver-password">
						</div>
					</div>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal"><spring:message code="lang.close" /></button>
				<button type="button" id="geoserverAddConfirm" class="btn btn-primary"><spring:message code="lang.confirm" /></button>
			</div>
		</div>
	</div>
</div>