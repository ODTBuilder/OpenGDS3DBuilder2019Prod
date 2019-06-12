/**
 * 
 */
package com.gitrnd.qaproducer.qa.service;

import java.util.Iterator;
import java.util.Set;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gitrnd.qaproducer.common.worker.Producer;
import com.gitrnd.qaproducer.filestatus.domain.FileStatus;
import com.gitrnd.qaproducer.filestatus.service.FileStatusService;
import com.gitrnd.qaproducer.qa.domain.QACategory;
import com.gitrnd.qaproducer.qa.domain.QAProgress;

/**
 * @author GIT
 *
 */
@Service("webService")
public class QAWebService {

	// qa progress
	protected static int FILEUPLOAD = 1;
	protected static String GEOSERVERQA = "GEOSERVER";

	@Autowired
	private Producer producer;

	@Autowired
	private FileStatusService fileStatusService;

	@Autowired
	private QAProgressService qapgService;

	@Autowired
	private QACategoryService qaCatService;

	/**
	 * @param serverURL
	 * @param layers
	 * @param prid2
	 * @param param
	 * @return
	 */
	public boolean validate(String serverURL, JSONObject layers, int cid, String crs, String qaVer, String qaType,
			String bPrid, int prid, int uIdx) {

		try {

			FileStatus fileStatus = new FileStatus();
			String fname = "";
			Set set = layers.keySet();
			Iterator iter = set.iterator();
			int i = 0;
			while (iter.hasNext()) {
				String wsName = (String) iter.next();
				if (i == 0) {
					fname += wsName;
				}
			}
			int size = set.size();
			if (size > 2) {
				fname += "_and_others";
			}
			fileStatus.setFname(fname);
			fileStatus.setStatus(1);
			fileStatus.setUidx(uIdx);
			fileStatusService.createFileStatus(fileStatus);
			Long catetoryIdx = (long) cid;
			int cIdx = catetoryIdx.intValue();
			QACategory qaCat = qaCatService.retrieveQACategoryByIdx(cIdx);
			String qaTitle = qaCat.getTitle();

			QAProgress progress = new QAProgress();
			progress.setUIdx(uIdx);
			progress.setQaType(qaTitle);
			progress.setPrid(prid);

			progress.setQaState(FILEUPLOAD);
			progress.setOriginName(fileStatus.getFname());
			progress.setFIdx(fileStatus.getFid());
			progress.setUIdx(uIdx);
			progress.setQaType(qaTitle);
			progress.setPrid(prid);
			progress.setFileType(GEOSERVERQA);
			qapgService.insertQARequest(progress);

			int pid = progress.getPIdx();
			JSONObject json = new JSONObject();
			json.put("serverURL", serverURL);
			json.put("layersMap", layers);
			json.put("category", cid);
			json.put("qaVer", qaVer);
			json.put("qaType", qaType);
			json.put("fid", fileStatus.getFid());
			json.put("pid", pid);
			json.put("prid", bPrid);
			json.put("crs", crs);
			json.put("type", "web");
			producer.produceWebMsg(json.toString());
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}
