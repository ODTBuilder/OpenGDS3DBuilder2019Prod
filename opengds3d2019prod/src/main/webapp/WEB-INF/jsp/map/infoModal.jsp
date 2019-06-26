<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<div id="infoModal" tabindex="-1" role="dialog" class="modal fade" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" data-dismiss="modal" aria-label="Close" class="close">
					<span aria-hidden="true">×</span>
				</button>
				<h4 class="modal-title">
					<spring:message code="lang.info" />
				</h4>
			</div>
			<div class="modal-body" style="height: 550px; overflow-y: auto;">
				<h4 class="gb-horizontal">
					<spring:message code="lang.buildInfo" />
				</h4>
				<table style="width: 100%; margin-bottom: 50px;">
					<tbody>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">GeoDT Web <spring:message
									code="lang.version" /></td>
							<td style="padding: 0.785714em;">1.0</td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;"><spring:message
									code="lang.gitAddress" /></td>
							<td style="padding: 0.785714em;"><a href="https://github.com/ODTBuilder/OpenGDSBuilder2018Prod"
								title="Generalization Process">https://github.com/ODTBuilder/OpenGDSBuilder2018Prod</a></td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;"><spring:message
									code="lang.buildDate" /></td>
							<td style="padding: 0.785714em;">2019-01-08 18:00</td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">Java <spring:message
									code="lang.version" /></td>
							<td style="padding: 0.785714em;">OpenJDK 1.8.0.111 64bit</td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">PostgreSQL <spring:message
									code="lang.version" /></td>
							<td style="padding: 0.785714em;">9.4</td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">GeoTools <spring:message
									code="lang.version" /></td>
							<td style="padding: 0.785714em;">16.5</td>
						</tr>
					</tbody>
				</table>
				<h4 class="gb-horizontal">
					<spring:message code="lang.license" />
				</h4>
				<table style="width: 100%; margin-bottom: 50px;">
					<tbody>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;"><spring:message
									code="lang.licenseLGPL" /> 3.0 (LGPL v3.0)</td>
							<td style="padding: 0.785714em;"><a href="http://www.opensource.org/licenses/lgpl-3.0.html"
								class="gb-href-link"> GNU LESSER GENERAL PUBLIC LICENSE </a><br>
								<p>Version 3, 29 June 2007
								<p>
								<p>
									Copyright (C) 2007 Free Software Foundation, Inc. <a href="http://fsf.org" class="gb-href-link">http://fsf.org</a>
								</p>
								<p>Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it
									is not allowed.
								<p>
								<p>This version of the GNU Lesser General Public License incorporates the terms and conditions of version 3
									of the GNU General Public License, supplemented by the additional permissions listed below.</p></td>
						</tr>
					</tbody>
				</table>
				<h4 class="gb-horizontal">
					<spring:message code="lang.useLibrary" />
				</h4>
				<table style="width: 100%;">
					<tbody>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">GeoTools</td>
							<td style="padding: 0.785714em;"><a href="http://www.gnu.org/licenses/lgpl-2.1.html" class="gb-href-link">
									<spring:message code="lang.licenseLGPL" /> 2.1 (LGPL v2.1)
							</a></td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">PostgreSQL</td>
							<td style="padding: 0.785714em;"><a href="https://www.postgresql.org/about/licence/" class="gb-href-link">
									The PostgreSQL Licence (PostgreSQL) </a></td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">Geoserver</td>
							<td style="padding: 0.785714em;"><a href="https://opensource.org/licenses/gpl-2.0.php" class="gb-href-link">
									<spring:message code="lang.licenseGPL" /> (GPLv2)
							</a></td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">Geogig</td>
							<td style="padding: 0.785714em;"><a href="http://opensource.org/licenses/BSD-3-Clause" class="gb-href-link">
									3-Clause BSD License (BSD-3-Clause) </a></td>
						</tr>
						<tr style="border-bottom: 1px solid rgba(0, 0, 0, 0.1);">
							<td style="padding: 0.785714em; background: rgba(0, 0, 0, 0.03); font-weight: 700;">Apache</td>
							<td style="padding: 0.785714em;"><a href="http://www.apache.org/licenses/LICENSE-2.0" class="gb-href-link">
									Apache License 2.0 </a></td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="modal-footer">
				<span style="float: right;">
					<button type="button" data-dismiss="modal" class="btn btn-default">
						<spring:message code="lang.close" />
					</button>
				</span>
			</div>
		</div>
	</div>
</div>