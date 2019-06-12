package com.gitrnd.qaproducer.geogig.service;

import javax.xml.bind.JAXBException;

import com.gitrnd.gdsbuilder.geogig.type.GeogigDiff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigFeatureAttribute;
import com.gitrnd.gdsbuilder.geogig.type.GeogigFeatureDiff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigFeatureRevert;
import com.gitrnd.gdsbuilder.geogig.type.GeogigFeatureSimpleLog;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.security.LoginUser;

public interface GeogigFeatureService {

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param path
	 * @param newCommitId
	 * @param oldCommitId
	 * @return
	 * @throws JAXBException
	 */
	GeogigDiff diff(DTGeoserverManager geoserverManager, String repoName, String path, String newCommitId,
			String oldCommitId) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param path
	 * @param newCommitId
	 * @param oldCommitId
	 * @return
	 * @throws JAXBException
	 */
	GeogigFeatureDiff featureDiff(DTGeoserverManager geoserverManager, String repoName, String path, String newCommitId,
			String oldCommitId) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param path
	 * @param branch
	 * @return
	 * @throws JAXBException
	 */
	GeogigFeatureAttribute featureAttribute(DTGeoserverManager geoserverManager, String repoName, String path,
			String branch) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param path
	 * @param until
	 * @param limit
	 * @param index
	 * @return
	 */
	GeogigFeatureSimpleLog featureLog(DTGeoserverManager geoserverManager, String repoName, String path, int limit,
			String until, int index) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param path
	 * @param oldCommitId
	 * @param newCommitId
	 * @param commitMessage
	 * @param mergeMessage
	 * @param loginUser
	 * @return
	 * @throws JAXBException
	 */
	GeogigFeatureRevert featureRevert(DTGeoserverManager geoserverManager, String repoName, String path,
			String oldCommitId, String newCommitId, String commitMessage, String mergeMessage, LoginUser loginUser)
			throws JAXBException;

}
