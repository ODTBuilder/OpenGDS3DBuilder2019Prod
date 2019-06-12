/**
 * 
 */
package com.gitrnd.qaproducer.geogig.service;

import javax.xml.bind.JAXBException;

import com.gitrnd.gdsbuilder.geogig.type.GeogigDiff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigLayerSimpleLog;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRemove;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;

/**
 * @author GIT
 *
 */
public interface GeogigLayerService {

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param layerName
	 * @param limint
	 * @param until
	 * @param head
	 * @return
	 * @throws JAXBException
	 */
	GeogigLayerSimpleLog logLayer(DTGeoserverManager geoserverManager, String repoName, String layerName, String limit,
			String until) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param oldIndex
	 * @param newIndex
	 * @param layerName
	 * @return GeogigDiff
	 * @throws JAXBException
	 */
	GeogigDiff diffLayer(DTGeoserverManager geoserverManager, String repoName, int oldIndex, int newIndex,
			String layerName) throws JAXBException;

	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param oldIndex
	 * @param newIndex
	 * @param layerName
	 * @return GeogigDiff
	 * @throws JAXBException
	 */
	GeogigDiff diffLayerById(DTGeoserverManager geoserverManager, String repoName, String oldId, String newId,
			String layerName) throws JAXBException;
	
	/**
	 * @param geoserverManager
	 * @param repoName
	 * @param transactionId
	 * @param path
	 * @param recursive
	 * @return
	 * @throws JAXBException
	 */
	GeogigRemove removeLayer(DTGeoserverManager geoserverManager, String repoName, String transactionId, String path,
			boolean recursive) throws JAXBException;

}
