/**
 * 
 */
package com.gitrnd.qaproducer.geogig.service;

import java.io.StringReader;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.springframework.stereotype.Service;

import com.gitrnd.gdsbuilder.geogig.GeogigCommandException;
import com.gitrnd.gdsbuilder.geogig.GeogigExceptionStatus;
import com.gitrnd.gdsbuilder.geogig.command.repository.CommitRepository;
import com.gitrnd.gdsbuilder.geogig.command.transaction.BeginTransaction;
import com.gitrnd.gdsbuilder.geogig.command.transaction.EndTransaction;
import com.gitrnd.gdsbuilder.geogig.type.GeogigTransaction;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;

/**
 * @author GIT
 *
 */
@Service("transactionService")
public class GeogigTransactionServiceImpl implements GeogigTransactionService {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigTransactionService#
	 * beginTransaction(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String)
	 */
	@Override
	public GeogigTransaction beginTransaction(DTGeoserverManager geoserverManager, String repoName)
			throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		BeginTransaction begin = new BeginTransaction();
		GeogigTransaction transaction = null;
		try {
			transaction = begin.executeCommand(url, user, pw, repoName);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigTransaction.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				transaction = (GeogigTransaction) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				transaction = new GeogigTransaction();
				transaction.setError(e.getMessage());
				transaction.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(transaction.getError());
			transaction.setError(geogigStatus.getStatus());
		}
		return transaction;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.gitrnd.qaproducer.geogig.service.GeogigTransactionService#endTransaction(
	 * com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager, java.lang.String,
	 * java.lang.String)
	 */
	@Override
	public GeogigTransaction endTransaction(DTGeoserverManager geoserverManager, String repoName, String transactionId)
			throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		EndTransaction end = new EndTransaction();
		GeogigTransaction transaction = null;

		try {
			CommitRepository commit = new CommitRepository();
			commit.executeCommand(url, user, pw, repoName, transactionId, "", "", "");
			transaction = end.executeCommand(url, user, pw, repoName, transactionId);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigTransaction.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				transaction = (GeogigTransaction) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				transaction = new GeogigTransaction();
				transaction.setError(e.getMessage());
				transaction.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(transaction.getError());
			transaction.setError(geogigStatus.getStatus());
		}
		return transaction;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigTransactionService#
	 * cancelTransaction(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigTransaction cancelTransaction(DTGeoserverManager geoserverManager, String repoName,
			String transactionId) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		EndTransaction end = new EndTransaction();
		GeogigTransaction transaction = null;

		try {
			transaction = end.executeCommand(url, user, pw, repoName, transactionId);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigTransaction.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				transaction = (GeogigTransaction) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				transaction = new GeogigTransaction();
				transaction.setError(e.getMessage());
				transaction.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(transaction.getError());
			transaction.setError(geogigStatus.getStatus());
		}
		return transaction;
	}

}
