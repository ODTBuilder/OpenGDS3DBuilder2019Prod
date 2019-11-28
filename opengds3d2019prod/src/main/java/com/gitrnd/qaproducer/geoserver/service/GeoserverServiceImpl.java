/*
 *    OpenGDS/Builder
 *    http://git.co.kr
 *
 *    (C) 2014-2017, GeoSpatial Information Technology(GIT)
 *    
 *    This library is free software; you can redistribute it and/or
 *    modify it under the terms of the GNU Lesser General Public
 *    License as published by the Free Software Foundation;
 *    version 3 of the License.
 *
 *    This library is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *    Lesser General Public License for more details.
 */

package com.gitrnd.qaproducer.geoserver.service;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.SchemaException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.opengis.referencing.FactoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.gitrnd.gdsbuilder.fileread.UnZipFile;
import com.gitrnd.gdsbuilder.fileread.shp.SHPFileWriter;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverPublisher;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverReader;
import com.gitrnd.gdsbuilder.geoserver.converter.type.GeneralMapExport;
import com.gitrnd.gdsbuilder.geoserver.data.DTGSGeogigDatastoreEncoder;
import com.gitrnd.gdsbuilder.geoserver.data.DTGeoserverManagerList;
import com.gitrnd.gdsbuilder.geoserver.data.tree.DTGeoserverTree.EnTreeType;
import com.gitrnd.gdsbuilder.geoserver.data.tree.factory.impl.DTGeoserverTreeFactoryImpl;
import com.gitrnd.gdsbuilder.geoserver.layer.DTGeoGroupLayer;
import com.gitrnd.gdsbuilder.geoserver.layer.DTGeoGroupLayerList;
import com.gitrnd.gdsbuilder.geoserver.layer.DTGeoLayer;
import com.gitrnd.gdsbuilder.geoserver.layer.DTGeoLayerList;
import com.gitrnd.gdsbuilder.geoserver.service.en.EnLayerBboxRecalculate;
import com.gitrnd.gdsbuilder.net.impl.RestAPIRequestImpl;
import com.gitrnd.gdsbuilder.parse.impl.DataConvertorImpl;
import com.gitrnd.gdsbuilder.type.geoserver.GeoLayerInfo;
import com.vividsolutions.jts.geom.Geometry;

import it.geosolutions.geoserver.rest.decoder.RESTDataStore;
import it.geosolutions.geoserver.rest.decoder.RESTDataStoreList;
import it.geosolutions.geoserver.rest.decoder.RESTWorkspaceList;
import it.geosolutions.geoserver.rest.encoder.GSLayerEncoder;
import it.geosolutions.geoserver.rest.encoder.feature.GSFeatureTypeEncoder;
import it.geosolutions.geoserver.rest.manager.GeoServerRESTStyleManager;

/**
 * Geoserver와 관련된 데이터를 처리하는 클래스
 * 
 * @author SG.Lee
 * @since 2017. 5. 12. 오전 2:22:14
 */
@Service("geoService")
@PropertySources({ @PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true),
	@PropertySource(value = "file:./application.yml", ignoreResourceNotFound = true) })
public class GeoserverServiceImpl implements GeoserverService {

	private Logger logger = LoggerFactory.getLogger(this.getClass());

	private DTGeoserverReader dtReader;
	private DTGeoserverPublisher dtPublisher;
	private GeoServerRESTStyleManager restStyleManager;
	
	@Value("${gitrnd.node.protocol}")
	private String protocol;
	
	@Value("${gitrnd.node.host}")
	private String nodeHost;

	@Value("${gitrnd.node.port}")
	private String nodePort;

	/**
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#shpLayerPublishGeoserver(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager, java.lang.String, java.lang.String, java.lang.String, java.io.File, java.lang.String)
	 */
	@Override
	public int shpLayerPublishGeoserver(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			String layerName, File zipFile, String srs) {
		int puFlag = 500;
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
			try {
				if(dtPublisher.publishShp(workspace, dsName, layerName, zipFile, srs)){
					puFlag = 200;
					logger.info(layerName + "레이어는 정상적으로 발행되었습니다.");
				}else{
					puFlag = 610;
				}
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				puFlag = 610;
			}
		} else {
			puFlag = 605;
		}
		return puFlag;
	}

	@Override
	public int shpLayerPublishGeoserver(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			String layerName, File zipFile, String srs, String defaultStyle) {
		int puFlag = 500;
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
			try {
				if(dtPublisher.publishShp(workspace, dsName, layerName, zipFile, srs, defaultStyle)){
					puFlag = 200;
					logger.info(layerName + "레이어는 정상적으로 발행되었습니다.");
				}else{
					puFlag = 610;
				}
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				puFlag = 610;
			}
		} else {
			puFlag = 605;
		}
		return puFlag;
	}

	/**
	 * 
	 * @since 2018. 11. 5.
	 * @author SG.Lee
	 * @param dtGeoManager
	 * @param workspace
	 * @param datastore
	 * @param request
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#shpCollectionPublishGeoserver(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 *      java.lang.String, java.lang.String,
	 *      org.springframework.web.multipart.MultipartHttpServletRequest)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public JSONObject shpCollectionPublishGeoserver(MultipartHttpServletRequest request, DTGeoserverManager dtGeoManager, String workspace, String datastore, boolean ignorePublication) {
		JSONObject resultJson = new JSONObject();
		JSONArray layers = new JSONArray();
		resultJson.put("status_Code", 200);
		resultJson.put("layers", layers);
		
		
		dtReader = dtGeoManager.getReader();
			dtPublisher = dtGeoManager.getPublisher();
			
			boolean wsFlag = false;
			boolean dsFlag = false;

			wsFlag = dtReader.existsWorkspace(workspace);
			dsFlag = dtReader.existsDatastore(workspace, datastore);

			if (wsFlag && dsFlag) {
				String defaultTempPath = System.getProperty("java.io.tmpdir") + "GeoDT";
				String outputFolderPath = defaultTempPath;
				Path tmp = null;
				
				String uploadFilename = "";//업로드 파일명
				
				
				File file = new File(defaultTempPath);
				if (!file.exists()) {
					file.mkdirs();
				}
				
				try {
					tmp = Files.createTempDirectory(FileSystems.getDefault().getPath(outputFolderPath), "temp_");
				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

				String saveFilePath = "";

				// 1. build an iterator
				Iterator<String> itr = request.getFileNames();

				MultipartFile mpf = null;

				int index = 0;

				//파일구조 검사
				// 2. get each file
				while (itr.hasNext()) {
					if (index < 1) {
						// 2.1 get next MultipartFile
						mpf = request.getFile(itr.next());
						try {
							// 2.3 create new fileMeta
							// FileStatus fileStatus = new FileStatus();
							String trimFileName = mpf.getOriginalFilename().replaceAll(" ", "");
							int trimPos = trimFileName.lastIndexOf( "." );
		                	String trimExt = trimFileName.substring( trimPos + 1 );
		                	String trimOName = trimFileName.substring(0, trimPos);
							if(trimExt.endsWith("zip")){
								// String encodeFileName = URLEncoder.encode(trimFileName,
								// "UTF-8");
								
								saveFilePath = tmp.toString() + File.separator + trimFileName;
								
								BufferedOutputStream stream = new BufferedOutputStream(new FileOutputStream(saveFilePath));

								// copy file to local disk (make sure the path "e.g.
								// D:/temp/files" exists)
								FileCopyUtils.copy(mpf.getBytes(), stream);
								
								//zip파일 복사까지 완료된 상태
								
								
								UnZipFile unZipFile = new UnZipFile(new File(saveFilePath));
								try {
									unZipFile.decompress();
									
									//압축파일 삭제
									File delFile = unZipFile.getZipFile();
									deleteDirectory(new File(tmp.toFile()+File.separator +trimOName));
									delFile.delete();
								} catch (Throwable e) {
									// TODO Auto-generated catch block
									deleteDirectory(tmp.toFile());
									logger.warn("압축파일 풀기 실패");
									resultJson.put("status_Code",608);
									return resultJson;
								}
								
								//다중파일업로드 추가
								File targetDir = tmp.toFile();
								String unzipPath = targetDir.getPath();
								if (targetDir.exists() == false) {
									logger.warn("폴더경로가 존재하지 않습니다");
									resultJson.put("status_Code",608);
									deleteDirectory(tmp.toFile());
									return resultJson; 
								}
								
								File[] fileList = targetDir.listFiles();
								
								//Zip파일내에 폴더가 있을시
								for(int i = 0; i < fileList.length; i++){
									if (fileList[i].isDirectory()) {
										//파일구조 이상
					                	logger.warn("압축파일내에 폴더가 있습니다.");
					                	resultJson.put("status_Code",608);
					                	deleteDirectory(tmp.toFile());
					                	return resultJson;
									}
								}
								
								for (int i = 0; i < fileList.length; i++) {
									if (!fileList[i].isDirectory()) {
										String filePath = fileList[i].getPath();
										String fFullName = fileList[i].getName();
										int Idx = fFullName.lastIndexOf(".");
										String _fileName = fFullName.substring(0, Idx);
										String ext = fFullName.substring(Idx + 1);
										/*
										 * if (_fileName.equals(unzipName)) { equalFlag = true; }
										 */

										if (_fileName.contains(".")) {
											moveDirectory(_fileName.substring(0, _fileName.lastIndexOf(".")), _fileName + "." + ext,
													filePath, unzipPath);
										} else {
											moveDirectory(_fileName, _fileName + "." + ext, filePath, unzipPath);
										}
									}
								}
								
								fileList = targetDir.listFiles();
								
								String filePath = "";
								String fileName = "";
								
								for(File targetFile : fileList){
									filePath = targetFile.toString();
									fileName = targetFile.getName() + ".zip";
									
									createZipFile(filePath, filePath, fileName);
									
									String fileZipPath = filePath + File.separator + fileName;
									int result = this.singleFileUpload(new File(fileZipPath), dtGeoManager, workspace, datastore, ignorePublication);
									JSONArray tempArray = (JSONArray) resultJson.get("layers");
									
									JSONObject lResultJson = new JSONObject();
									lResultJson.put(targetFile.getName(), result);
									tempArray.add(lResultJson);
								}
							}else{
								deleteDirectory(tmp.toFile());
								logger.warn("zip파일이 아님");
								resultJson.put("status_Code",608);
								return resultJson;
							}
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					} else {
						deleteDirectory(tmp.toFile());
						logger.warn("파일이 2개이상");
						resultJson.put("status_Code",608);
						return resultJson;
					}
				}
				// 성공 or 실패시 파일삭제
				deleteDirectory(tmp.toFile());
			} else {
				logger.warn("workspace 또는 datastore 존재 X");
				resultJson.put("status_Code",607);
				return resultJson;
			}
		return resultJson;
	}
	
	private int singleFileUpload(File uploadFile, DTGeoserverManager dtGeoManager, String workspace, String datastore, boolean ignorePublication){
		int puFlag = 500;
		if (dtGeoManager != null && workspace != null && datastore != null) {
			dtReader = dtGeoManager.getReader();
			dtPublisher = dtGeoManager.getPublisher();
			
			boolean wsFlag = false;
			boolean dsFlag = false;

			wsFlag = dtReader.existsWorkspace(workspace);
			dsFlag = dtReader.existsDatastore(workspace, datastore);

			if (wsFlag && dsFlag) {
				
				String uploadFilename = "";//업로드 파일명
				
				
				String saveFilePath = "";

				//파일구조 검사
				// 2. get each file
					// 2.1 get next MultipartFile
					try {
						if(uploadFile.getName().endsWith("zip")){
							// String encodeFileName = URLEncoder.encode(trimFileName,
							// "UTF-8");
							
							saveFilePath = uploadFile.getPath();
							
							ZipFile zipFile = new ZipFile(saveFilePath);
							
				            Enumeration<? extends ZipEntry> entries = zipFile.entries();
				            
				            int shpIndex = 0;
				            int prjIndex = 0;
				            while(entries.hasMoreElements()){
				                ZipEntry entry = entries.nextElement();
				                if(entry.isDirectory()){
				                	//파일구조 이상
				                	logger.warn("압축파일내에 폴더있음");
				                	return 618;
				                } else {
				                	String fullFileName = entry.getName();
				                	int pos = fullFileName.lastIndexOf( "." );
				                	String ext = fullFileName.substring( pos + 1 );

				                	if(ext.endsWith("shp")){
				                		uploadFilename = fullFileName.substring(0, pos);
				                		shpIndex++;
				                	}
				                	
				                	if(ext.endsWith("prj")){
				                		prjIndex++;
				                	}
				                }
				            }
				            zipFile.close();
				            if(shpIndex==0){
				            	logger.warn("shp파일이 없음");
				            	return 616;
				            }else if(shpIndex>1){
				            	logger.warn("shp파일이 1개이상");
				            	return 617;
				            }
				            
				            if(prjIndex==0){
				            	logger.warn("prj파일이 없음");
				            	return 615;
				            }
						}else{
							logger.warn("zip파일이 아님");
			            	return 608;
						}
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
			
				if (dtReader.existsLayer(workspace, uploadFilename, true)) {
					// 레이어 중복
					logger.warn("레이어중복");
					return 609;
				}
				boolean availableFlag = dtReader.existsFeatureTypesAvailable(workspace, datastore, uploadFilename);
				if(!ignorePublication){
					if(availableFlag){
						logger.warn("데이터 존재->미발행 레이어");
						return 613;
					}
				}
				try {
					// Geoserver에 레이어 발행
					boolean serverPFlag = dtPublisher.publishShpCollection(workspace, datastore,
							new File(saveFilePath).toURI());
					if (serverPFlag) {
						puFlag = 200;
					} else {
						puFlag = 500;
						logger.warn("발행실패");
					}
				} catch (IOException e) {
					// TODO Auto-generated catch block
					puFlag = 500;
					logger.warn("발행실패");
				}
				// 성공 or 실패시 파일삭제
			} else {
				logger.warn("workspace 또는 datastore 존재 X");
				puFlag = 607;
			}
		} else {
			logger.warn("Geoserver 정보X");
			puFlag = 604;
		}
		return puFlag;
	}
	
	
	/**
	 * GeoJSON -> Geoserver 업로드
	 * @since 2019. 1. 24.
	 * @author SG.Lee
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#geojsonPublishGeoserver(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager, java.lang.String, java.lang.String, java.lang.String, java.lang.String, org.json.simple.JSONObject, org.json.simple.JSONObject, boolean)
	 */
	@SuppressWarnings("unchecked")
	public JSONObject geojsonPublishGeoserver(DTGeoserverManager dtGeoManager, String workspace, String datastore, String epsg, List<JSONObject> uploadJsons, boolean ignorePublication){
		JSONObject resultJson = new JSONObject();
		JSONArray layers = new JSONArray();
		resultJson.put("status_Code", 200);
		resultJson.put("layers", layers);
		
		int puFlag = 500;
		if (dtGeoManager != null && workspace != null && datastore != null) {
			if(uploadJsons==null){
				logger.warn("uploadJSON Null");
				resultJson.put("status_Code",614);
				return resultJson;
			}else{
				if(uploadJsons.size()==0){
					logger.warn("uploadJSON Size 0");
					resultJson.put("status_Code",614);
					return resultJson;
				}
			}
			
			
			dtReader = dtGeoManager.getReader();
			dtPublisher = dtGeoManager.getPublisher();
			
			boolean wsFlag = false;
			boolean dsFlag = false;

			wsFlag = dtReader.existsWorkspace(workspace);
			dsFlag = dtReader.existsDatastore(workspace, datastore);

			if (wsFlag && dsFlag) {
				//temp 경로 임시파일 생성
				String defaultTempPath = System.getProperty("java.io.tmpdir") + "GeoDT_Upload";
				
				if (!new File(defaultTempPath).exists()) {
					new File(defaultTempPath).mkdirs();
				}
						
				
				for(int i=0; i<uploadJsons.size();i++){
					JSONObject uploadJson = (JSONObject)uploadJsons.get(i);
					String layerName = (String) uploadJson.get("layername");
					JSONObject geoJson = (JSONObject) uploadJson.get("geojson");
					JSONObject attJson = (JSONObject) uploadJson.get("attjson");
					
					puFlag = this.singleGeojsonPublishGeoserver(dtGeoManager, defaultTempPath, workspace, datastore, layerName, epsg, geoJson, attJson, ignorePublication);
					
					JSONArray tempArray = (JSONArray) resultJson.get("layers");
					
					JSONObject lResultJson = new JSONObject();
					lResultJson.put(layerName, puFlag);
					tempArray.add(lResultJson);
				}
				
			/*	for(JSONObject uploadJson : uploadJsons){
					String layerName = (String) uploadJson.get("layername");
					JSONObject geoJson = (JSONObject) uploadJson.get("geojson");
					JSONObject attJson = (JSONObject) uploadJson.get("attjson");
					
					puFlag = this.singleGeojsonPublishGeoserver(dtGeoManager, defaultTempPath, workspace, datastore, layerName, epsg, geoJson, attJson, ignorePublication);
					
					JSONArray tempArray = (JSONArray) resultJson.get("layers");
					
					JSONObject lResultJson = new JSONObject();
					lResultJson.put(layerName, puFlag);
					tempArray.add(lResultJson);
				}*/
			} else {
				logger.warn("workspace 또는 datastore 존재 X");
				resultJson.put("status_Code",607);
				return resultJson;
			}
		} else {
			logger.warn("Geoserver 정보X");
			resultJson.put("status_Code",604);
			return resultJson;
		}
		return resultJson;
	}
	
	public int singleGeojsonPublishGeoserver(DTGeoserverManager dtGeoManager, String defaultTempPath, String workspace, String datastore, String layerName, String epsg, JSONObject geojson, JSONObject attJson, boolean ignorePublication){
		int puFlag = 500;
		if (dtGeoManager != null && workspace != null && datastore != null) {
			
			if(layerName == null){
				logger.warn("레이어명 null");
				return 610;
			}
			
			
			dtReader = dtGeoManager.getReader();
			dtPublisher = dtGeoManager.getPublisher();
			
			boolean wsFlag = false;
			boolean dsFlag = false;

			wsFlag = dtReader.existsWorkspace(workspace);
			dsFlag = dtReader.existsDatastore(workspace, datastore);

			if (wsFlag && dsFlag) {
				if (dtReader.existsLayer(workspace, layerName, true)) {
					// 레이어 중복
					logger.warn("레이어중복");
					return 609;
				}
				
				if(!ignorePublication){
					boolean availableFlag = dtReader.existsFeatureTypesAvailable(workspace, datastore, layerName);
					if(availableFlag){
						logger.warn("데이터 존재->미발행 레이어");
						return 613;
					}
				}
			
				
				SimpleFeatureCollection simpleCollection = null;
				
				if(geojson!=null){
					try {
						if (attJson == null) {
							simpleCollection = new DataConvertorImpl().geoJsonToSimpleFeatureCollecion(geojson);
						} else {
							simpleCollection = new DataConvertorImpl().geoJsonToSimpleFeatureCollecion(geojson,attJson);
						}
					} catch (SchemaException e) {
						logger.warn("geojson 오류로 인한 SimpleFeatureCollection 생성불가");
						return 614;
					}
					
					if (simpleCollection != null) {
						int size = simpleCollection.size();
						if(size==0){
							logger.warn("features Size 0");
							return 610;
						}
						File tmpFile = null;
						try {
							// 임시폴더 생성
							Path tmpBasedir = Files.createTempDirectory(Paths.get(defaultTempPath), "upload_temp_");
							tmpFile = tmpBasedir.toFile();
							String writerPath = tmpBasedir + File.separator + layerName + ".shp";
							try {
								SHPFileWriter.writeSHP(epsg, simpleCollection, writerPath);
							} catch (SchemaException | FactoryException e) {
								// TODO Auto-generated catch block
								if(tmpFile!=null){
									deleteDirectory(tmpFile);
								}
								logger.warn("shp파일 생성불가");
								return 610;
							}
							createZipFile(tmpBasedir.toString(), tmpBasedir.toString(), layerName + ".zip");

							String saveFilePath = tmpBasedir + File.separator + layerName + ".zip";

							// Geoserver에 레이어 발행
							boolean serverPFlag = dtPublisher.publishShpCollection(workspace, datastore,
									new File(saveFilePath).toURI());
							if (serverPFlag) {
								puFlag = 200;
							} else {
								deleteDirectory(tmpBasedir.toFile());
								puFlag = 610;
								logger.warn("발행실패");
							}
						} catch (IOException e) {
							// TODO Auto-generated catch block
							if(tmpFile!=null){
								deleteDirectory(tmpFile);
							}
							puFlag = 610;
							logger.warn("발행실패");
						}
						// 성공 or 실패시 파일삭제
						if(tmpFile!=null){
							deleteDirectory(tmpFile);
						}
					} else {
						logger.warn("geojson 오류로 인한 SimpleFeatureCollection 생성불가");
						return 614;
					}
				}else{
					logger.warn("geojson 오류로 인한 SimpleFeatureCollection 생성불가");
					return 614; 
				}
			} else {
				logger.warn("workspace 또는 datastore 존재 X");
				puFlag = 607;
			}
		} else {
			logger.warn("Geoserver 정보X");
			puFlag = 604;
		}
		return puFlag;
	}

	/**
	 * @since 2018. 7. 13.
	 * @author SG.Lee
	 * @param dtGeoManagers
	 * @param serverName
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#getGeoserverLayerCollectionTree(com.gitrnd.gdsbuilder.geoserver.data.DTGeoserverManagerList,
	 *      java.lang.String)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public JSONArray getGeoserverLayerCollectionTree(DTGeoserverManagerList dtGeoserverMList, String parent,
			String serverName, String type) {
		JSONArray jsonArray = new JSONArray();
		EnTreeType enType = null;
		if (dtGeoserverMList != null) {
			if (type.toLowerCase().equals("server")) {
				enType = EnTreeType.SERVER;
			} else if (type.toLowerCase().equals("workspace")) {
				enType = EnTreeType.WORKSPACE;
			} else if (type.toLowerCase().equals("datastore")) {
				enType = EnTreeType.DATASTORE;
			} else if (type.toLowerCase().equals("layer")) {
				enType = EnTreeType.LAYER;
			} else {
				logger.warn("DTGeoserverManagerList Null");
			}
			if (enType != null) {
				if (enType == EnTreeType.SERVER) {
					jsonArray = new DTGeoserverTreeFactoryImpl().createDTGeoserverTree(dtGeoserverMList, enType);
				} else {
					jsonArray = new DTGeoserverTreeFactoryImpl().createDTGeoserverTree(dtGeoserverMList, parent,
							serverName, enType);
				}
			}
		} else {
			// TODO: handle exception
			logger.warn("DTGeoserverManagerList Null");
		}
		return jsonArray;
	}

	/**
	 * @since 2018. 7. 13.
	 * @author SG.Lee
	 * @param dtGeoserverMList
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#getGeoserverLayerCollectionTree(com.gitrnd.gdsbuilder.geoserver.data.DTGeoserverManagerList)
	 */
	@SuppressWarnings("unchecked")
	public JSONArray getGeoserverLayerCollectionTrees(DTGeoserverManagerList dtGeoserverMList) {
		JSONArray jsonArray = new JSONArray();

		if (dtGeoserverMList != null) {
			jsonArray = new DTGeoserverTreeFactoryImpl().createDTGeoserverTrees(dtGeoserverMList);
			if (jsonArray.size() == 0) {
				JSONObject errorJSON = new JSONObject();
				errorJSON.put("id", 200);
				errorJSON.put("parent", "#");
				errorJSON.put("text", "No Geoserver");
				errorJSON.put("type", "info");
				jsonArray.add(errorJSON);
			}
		} else {
			JSONObject errorJSON = new JSONObject();
			errorJSON.put("id", 200);
			errorJSON.put("parent", "#");
			errorJSON.put("text", "No Geoserver");
			errorJSON.put("type", "info");
			jsonArray.add(errorJSON);
		}
		return jsonArray;
	}

	/**
	 * @since 2018. 7. 5.
	 * @author SG.Lee
	 * @param dtGeoManager
	 * @param workspace
	 * @param layerList
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#duplicateCheck(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 *      java.lang.String, java.util.ArrayList)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public JSONObject duplicateCheck(DTGeoserverManager dtGeoManager, String workspace, ArrayList<String> layerList) {
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		JSONObject object = new JSONObject();
		for (String layerName : layerList) {
			object.put(layerName, dtReader.existsLayer(workspace, layerName));
		}

		return object;
	}

	/**
	 * @since 2018. 7. 5.
	 * @author SG.Lee
	 * @param dtGeoManager
	 * @param workspace
	 * @param layerList
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#getGeoLayerList(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 *      java.lang.String, java.util.ArrayList)
	 */
	@Override
	public DTGeoLayerList getGeoLayerList(DTGeoserverManager dtGeoManager, String workspace,
			ArrayList<String> layerList) {
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
			restStyleManager = dtGeoManager.getStyleManager();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		if (layerList == null)
			throw new IllegalArgumentException("LayerNames may not be null");
		if (layerList.size() == 0)
			throw new IllegalArgumentException("LayerNames may not be null");

		DTGeoLayerList dtGeoLayerList = dtReader.getDTGeoLayerList(workspace, layerList);
		if (dtGeoLayerList != null) {
			String sld = "";
			for (DTGeoLayer geoLayer : dtGeoLayerList) {
				if (!geoLayer.getStyle().isEmpty()) {
					sld = restStyleManager.getSLD(geoLayer.getStyle());
					geoLayer.setSld(sld);
				}
			}
		}
		return dtGeoLayerList;
	}

	/**
	 * @since 2017. 4
	 * @author SG.Lee
	 * @param groupList
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#getGeoGroupLayerList(java.util.ArrayList)
	 */
	@Override
	public DTGeoGroupLayerList getGeoGroupLayerList(DTGeoserverManager dtGeoManager, String workspace,
			ArrayList<String> groupList) {
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		if (groupList == null)
			throw new IllegalArgumentException("GroupNames may not be null");
		if (groupList.size() == 0)
			throw new IllegalArgumentException("GroupNames may not be null");
		return dtReader.getDTGeoGroupLayerList(workspace, groupList);
	}

	/**
	 * @since 2018. 7. 5.6
	 * @author SG.Lee
	 * @param workspace
	 * @param layerNameList
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#removeDTGeoserverLayers(java.lang.String,
	 *      java.util.List)
	 */
	@Override
	public int removeDTGeoserverLayers(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			List<String> layerNameList) {
		int resultFlag = 500;
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
			boolean removeFlag = dtPublisher.removeLayers(workspace, dsName, layerNameList);
			if (removeFlag) {
				resultFlag = 200; // 성공
			} else {
				resultFlag = 606; // 일부성공 또는 실패
			}
		} else {
			resultFlag = 605; // Geoserver 정보없음
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return resultFlag;
	}

	/**
	 * @since 2017. 6. 5.
	 * @author SG.Lee
	 * @param groupLayerName
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#removeGeoserverGroupLayer(java.lang.String)
	 */
	@Override
	public boolean removeDTGeoserverAllLayer(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			String groupLayerName) {
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		boolean isRemoveFlag = false;
		DTGeoGroupLayer dtGeoGroupLayer = dtReader.getDTGeoGroupLayer(workspace, groupLayerName);

		int flagVal = 0;
		if (dtGeoGroupLayer != null) {
			List<String> layerList = dtGeoGroupLayer.getPublishedList().getNames();

			dtPublisher.removeLayerGroup(workspace, groupLayerName);

			for (String layerName : layerList) {
				boolean isRemoveFeatureType = dtPublisher.unpublishFeatureType(workspace, dsName, layerName);
				if (isRemoveFeatureType) {
					flagVal++;
				}
			}

			if (layerList.size() == flagVal) {
				isRemoveFlag = true;
			} else
				isRemoveFlag = false;
		} else
			isRemoveFlag = false;
		return isRemoveFlag;
	}

	/**
	 *
	 * @author SG.Lee
	 * @since 2017. 6. 19. 오후 9:15:07
	 * @return boolean
	 */
	@Override
	public List<String> getGeoserverStyleList(DTGeoserverManager dtGeoManager) {
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return dtReader.getStyles().getNames();
	}

	/**
	 * 
	 * @since 2017. 6. 7.
	 * @author SG.Lee
	 * @param sldBody
	 * @param name
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#publishStyle(java.lang.String,
	 *      java.lang.String)
	 */
	@Override
	public boolean publishStyle(DTGeoserverManager dtGeoManager, final String sldBody, final String name) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return dtPublisher.publishStyle(sldBody, name);
	};

	/**
	 * 
	 * @since 2017. 6. 7.
	 * @author SG.Lee
	 * @param sldBody
	 * @param name
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#updateStyle(java.lang.String,
	 *      java.lang.String)
	 */
	@Override
	public boolean updateStyle(DTGeoserverManager dtGeoManager, final String sldBody, final String name) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return dtPublisher.updateStyle(sldBody, name);
	};

	/**
	 * 
	 * @since 2017. 6. 7.
	 * @author SG.Lee
	 * @param styleName
	 * @return
	 * @see com.gitrnd.qaproducer.geoserver.service.GeoserverService#removeStyle(java.lang.String)
	 */
	@Override
	public boolean removeStyle(DTGeoserverManager dtGeoManager, String styleName) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return dtPublisher.removeStyle(styleName);
	};

	@Override
	public boolean updateFeatureType(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			String originalName, String name, String title, String abstractContent, String srs, String style,
			boolean attChangeFlag) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		boolean updateFlag = false;
		GSFeatureTypeEncoder fte = new GSFeatureTypeEncoder();
		GSLayerEncoder layerEncoder = null;

		if (originalName == null) {
			System.err.println("OriginalName may not be null!");
			return false;
		}
		if (originalName.isEmpty()) {
			System.err.println("OriginalName may not be empty!");
			return false;
		}
		if (name != null) {
			fte.setName(name);
		}
		if (title != null) {
			fte.setTitle(title);
		}
		if (abstractContent != null) {
			fte.setAbstract(abstractContent);
		}
		if (srs != null) {
			fte.setSRS(srs);
		}
		if (style != null) {
			layerEncoder = new GSLayerEncoder();
			layerEncoder.setDefaultStyle(style);
		}

		updateFlag = dtPublisher.updateFeatureType(workspace, dsName, originalName, fte, layerEncoder, attChangeFlag);
		
		if (srs != null) {
			dtPublisher.recalculate(workspace, dsName, originalName, EnLayerBboxRecalculate.ALL);
		}

		return updateFlag;
	}

	@Override
	public boolean errLayerPublishGeoserver(DTGeoserverManager dtGeoManager, String workspace, String dsName,
			GeoLayerInfo geoLayerInfo) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		// TODO Auto-generated method stub
		return dtPublisher.publishErrLayer(workspace, dsName, geoLayerInfo);
	}

	@Override
	public String requestWFSTransaction(DTGeoserverManager dtGeoManager, String workspace, String wfstXml) {
		if (dtGeoManager != null) {
			dtPublisher = dtGeoManager.getPublisher();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return dtPublisher.requestWFSTransaction(workspace, wfstXml);
	}

	@Override
	public String getLayerStyleSld(DTGeoserverManager dtGeoManager, String workspace, String layerName) {
		String sld = "";
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
			DTGeoLayer dtLayer = dtReader.getDTGeoLayer(workspace, layerName);
			String style = dtLayer.getStyle();
			sld = dtReader.getSLD(workspace, style);
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return sld;
	}

	@Override
	public boolean exsistLayer(DTGeoserverManager dtGeoManager, String workspace, String layerName) {
		boolean flag = false;
		if (dtGeoManager != null) {
			dtReader = dtGeoManager.getReader();
			flag = dtReader.existsLayer(workspace, layerName);
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		return flag;
	}

	@Override
	public boolean updateGeogigGsStore(DTGeoserverManager geoserverManager, String workspace, String datastore,
			String branch) {

		DTGeoserverReader dtGeoserverReader = geoserverManager.getReader();
		RESTWorkspaceList restWorkspaceList = dtGeoserverReader.getWorkspaces();
		dtPublisher = geoserverManager.getPublisher();

		boolean updated = false;
		if (restWorkspaceList != null) {
			for (RESTWorkspaceList.RESTShortWorkspace item : restWorkspaceList) {
				String wsName = item.getName();
				if (wsName.equalsIgnoreCase(workspace)) {
					RESTDataStoreList dataStoreList = dtGeoserverReader.getDatastores(wsName);
					if (dataStoreList != null) {
						List<String> dsNames = dataStoreList.getNames();
						for (String dsName : dsNames) {
							if (dsName.equalsIgnoreCase(datastore)) {
								if (dsName.equalsIgnoreCase(datastore)) {
									RESTDataStore dStore = dtGeoserverReader.getDatastore(workspace, datastore);
									DTGSGeogigDatastoreEncoder dsEncoder = new DTGSGeogigDatastoreEncoder(dStore);
									dsEncoder.setBranch(branch);
									updated = dtPublisher.updateDatastore(workspace, datastore, dsEncoder);
								}
							}
						}
					}
				}
			}
		}
		return updated;
	}

	@Override
	public List<String> getStyleList(DTGeoserverManager geoserverManager) {
		List<String> styles = new ArrayList<String>();
		if (geoserverManager != null) {
			restStyleManager = geoserverManager.getStyleManager();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}

		if (restStyleManager != null) {
			styles = restStyleManager.getStyles().getNames();
		}
		return styles;
	}

	@Override
	public List<String> getStyleList(DTGeoserverManager geoserverManager, String workspace) {
		List<String> styles = new ArrayList<String>();
		if (geoserverManager != null) {
			restStyleManager = geoserverManager.getStyleManager();
		} else {
			throw new IllegalArgumentException("Geoserver 정보 없음");
		}
		if (restStyleManager != null) {
			styles = restStyleManager.getStyles(workspace).getNames();
		}
		return styles;
	}
	
	
	
	
	@SuppressWarnings("unchecked")
	@Override
	public JSONObject geolayerTo3DTiles(DTGeoserverManager dtGeoManager, String workspace, String datastore, String srs, String layerName, double minVal, double maxVal){
		int puFlag = 500;
		JSONObject returnJSON = new JSONObject();
		if (dtGeoManager != null && workspace != null && datastore != null) {
			if(layerName == null){
				logger.warn("레이어명 null");
				puFlag = 610;
			}else{
				String serverURL = dtGeoManager.getRestURL();
				dtReader = dtGeoManager.getReader();
				dtPublisher = dtGeoManager.getPublisher();
				
				boolean wsFlag = false;
				boolean dsFlag = false;

				wsFlag = dtReader.existsWorkspace(workspace);
				dsFlag = dtReader.existsDatastore(workspace, datastore);
				if (wsFlag && dsFlag) {
					if (dtReader.existsLayer(workspace, layerName, true)) {
						String defaultTempPath = System.getProperty("java.io.tmpdir") + "GeoDT_Upload";
						Path tmp = null;
						
						if (!new File(defaultTempPath).exists()) {
							new File(defaultTempPath).mkdirs();
						}
						
						try {
							tmp = Files.createTempDirectory(FileSystems.getDefault().getPath(defaultTempPath), "temp_");
						} catch (IOException e1) {
							// TODO Auto-generated catch block
							e1.printStackTrace();
						}
						
						String outputFolderPath = tmp.toString();
						
						int downReNum = new GeneralMapExport(serverURL, workspace, layerName, outputFolderPath, srs).export();
						
						if(downReNum == 200){
							String shpPath = outputFolderPath + "/" + layerName +".shp";
							
							
							
							//폴더경로
							String folderPath = "";
							
							
							
							//tileset option 경로
//							String tilesetPath = "";
							
							//API 요청 파라미터 생성
							String nodeURL = protocol + "://"+nodeHost+":"+nodePort+"/local";
							String userName = dtReader.getUsername();
							
							List<String> args = new ArrayList<String>();
							args.add("b3dm");
							boolean combineFlag = false;
							
							//body 
							JSONObject bodyJson = new JSONObject();
							bodyJson.put("uid", userName);
							bodyJson.put("-m", folderPath);
							bodyJson.put("combine", combineFlag);
							bodyJson.put("args", args);
							
						
							String bodyString = bodyJson.toJSONString();
							
							returnJSON = new RestAPIRequestImpl().requestRestAPI(HttpMethod.POST, nodeURL, bodyString);
							
							puFlag = 200;
							//다 처리하고 임시폴더 삭제
							deleteDirectory(tmp.toFile());
						}else{
							logger.warn("다운로드 실패");
						}
					}else{
						logger.warn("레이어가 존재하지 않습니다.");
					}
				} else {
					logger.warn("workspace 또는 datastore 존재 X");
					puFlag = 607;
				}
			}
		}else{
			logger.warn("Geoserver 정보X");
			puFlag = 604;
		}
		returnJSON.put("status_code", puFlag);
		return returnJSON;
	}
	
	@Override
	public JSONObject geolayerTo3DTiles(DTGeoserverManager dtGeoManager, String workspace, String datastore, String srs, String layerName, double defVal){
		
		return null;
	}
	
	@Override
	public JSONObject geolayerTo3DTiles(DTGeoserverManager dtGeoManager, String workspace, String datastore, String srs, String layerName, String attribute){
		
		return null;
	}
	
	
	
	
	/**
     * 디렉토리 및 파일을 압축한다.
     * @param path 압축할 디렉토리 및 파일
     * @param toPath 압축파일을 생성할 경로
     * @param fileName 압축파일의 이름
     */
    public static void createZipFile(String path, String toPath, String fileName) {
 
        File dir = new File(path);
        String[] list = dir.list();
        String _path;
 
        if (!dir.canRead() || !dir.canWrite())
            return;
 
        int len = list.length;
 
        if (path.charAt(path.length() - 1) != '/')
            _path = path + "/";
        else
            _path = path;
 
        try {
            ZipOutputStream zip_out = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(toPath+"/"+fileName), 2048));
 
            for (int i = 0; i < len; i++)
                zip_folder("",new File(_path + list[i]), zip_out);
 
            zip_out.close();
 
        } catch (FileNotFoundException e) {
//            Log.e("File not found", e.getMessage());
 
        } catch (IOException e) {
//            Log.e("IOException", e.getMessage());
        } finally {
 
 
        }
    }
 
    /**
     * ZipOutputStream를 넘겨 받아서 하나의 압축파일로 만든다.
     * @param parent 상위폴더명
     * @param file 압축할 파일
     * @param zout 압축전체스트림
     * @throws IOException
     */
    private static void zip_folder(String parent, File file, ZipOutputStream zout) throws IOException {
        byte[] data = new byte[2048];
        int read;
 
        if (file.isFile()) {
            ZipEntry entry = new ZipEntry(parent + file.getName());
            zout.putNextEntry(entry);
            BufferedInputStream instream = new BufferedInputStream(new FileInputStream(file));
 
            while ((read = instream.read(data, 0, 2048)) != -1)
                zout.write(data, 0, read);
 
            zout.flush();
            zout.closeEntry();
            instream.close();
        }
    }
    
    /**
   	 * 파일이동
   	 * 
   	 * @author SG.Lee
   	 * @since 2018. 4. 18. 오전 9:46:27
   	 * @param folderName
   	 * @param fileName
   	 * @param beforeFilePath
   	 * @param afterFilePath
   	 * @return String
   	 */
   	private static String moveDirectory(String folderName, String fileName, String beforeFilePath, String afterFilePath) {
   		String path = afterFilePath + "/" + folderName;
   		String filePath = path + "/" + fileName;

   		File dir = new File(path);

   		if (!dir.exists()) { // 폴더 없으면 폴더 생성
   			dir.mkdirs();
   		}

   		try {
   			File file = new File(beforeFilePath);

   			if (file.renameTo(new File(filePath))) { // 파일 이동
   				return filePath; // 성공시 성공 파일 경로 return
   			} else {
   				return null;
   			}
   		} catch (Exception e) {
   			e.getMessage();
   			return null;
   		}
   	}

   	/**
   	 * 파일복사
   	 * 
   	 * @author SG.Lee
   	 * @since 2018. 4. 18. 오전 9:45:55
   	 * @param source
   	 * @param dest
   	 * @throws IOException void
   	 */
   	private static void FileNio2Copy(String source, String dest) throws IOException {
   		Files.copy(new File(source).toPath(), new File(dest).toPath());
   	}
   	
   	private void deleteDirectory(File dir) {

		if (dir.exists()) {
			File[] files = dir.listFiles();
			for (File file : files) {
				if (file.isDirectory()) {
					deleteDirectory(file);
				} else {
					file.delete();
				}
			}
		}
		dir.delete();
	}
}

/**
 * 쓰레드 Result 클래스
 * 
 * @author SG.Lee
 * @since 2017. 9. 6. 오후 3:09:38
 */
class Result {
	List<String> successLayerList = new ArrayList<String>();
	Collection<Geometry> geometryCollection = new ArrayList<Geometry>();
	int failCount = 0;

	synchronized void addLayerName(String layerName) {
		successLayerList.add(layerName);
	}

	synchronized void addGeoCollection(Geometry geometry) {
		geometryCollection.add(geometry);
	}

	synchronized void addFailCount() {
		failCount++;
	}
}
