<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div id="geoserverModal" tabindex="-1" role="dialog" class="modal" aria-hidden="true">
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