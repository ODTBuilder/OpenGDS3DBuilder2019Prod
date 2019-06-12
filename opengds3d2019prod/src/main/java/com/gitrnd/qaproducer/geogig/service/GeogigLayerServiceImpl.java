/**
 * 
 */
package com.gitrnd.qaproducer.geogig.service;

import java.io.StringReader;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.springframework.stereotype.Service;

import com.gitrnd.gdsbuilder.geogig.GeogigCommandException;
import com.gitrnd.gdsbuilder.geogig.GeogigExceptionStatus;
import com.gitrnd.gdsbuilder.geogig.command.repository.DiffRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.LogRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.RemovePath;
import com.gitrnd.gdsbuilder.geogig.type.GeogigDiff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigDiff.Diff;
import com.gitrnd.gdsbuilder.geogig.type.GeogigLayerSimpleLog;
import com.gitrnd.gdsbuilder.geogig.type.GeogigLayerSimpleLog.SimpleCommit;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRemove;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryLog;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryLog.Commit;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;

/**
 * @author GIT
 *
 */
@Service("layerService")
public class GeogigLayerServiceImpl implements GeogigLayerService {

	@Override
	public GeogigLayerSimpleLog logLayer(DTGeoserverManager geoserverManager, String repoName, String layerName,
			String limit, String until) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		LogRepository logRepos = new LogRepository();
		GeogigLayerSimpleLog simpleLog = new GeogigLayerSimpleLog();
		try {
			List<SimpleCommit> simpleCommits = new ArrayList<>();
			List<Commit> commits = new ArrayList<>();
			GeogigRepositoryLog geogigLog = logRepos.executeCommand(url, user, pw, repoName, layerName, limit, until,
					true);
			simpleLog.setSuccess(geogigLog.getSuccess());
			commits.addAll(geogigLog.getCommits());

			int commitSize = commits.size();
			for (int i = 0; i < commitSize; i++) {
				Commit newCommit = commits.get(i); // current
				SimpleCommit simpleCommit = new SimpleCommit();
				// simpleCommit.setcIdx(i + index); // idx
				String commitId = newCommit.getCommitId(); // commit id
				simpleCommit.setCommitId(commitId);
				simpleCommit.setAuthorName(newCommit.getAuthor().getName()); // author
				simpleCommit.setMessage(newCommit.getMessage()); // message
				Timestamp timestamp = new Timestamp(Long.parseLong(newCommit.getAuthor().getTimestamp())); // time
				Date date = new Date(timestamp.getTime());
				DateFormat dateformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				String dateStr = dateformat.format(date);

				int addedCount = Integer.parseInt(newCommit.getAdds());
				if (addedCount > 0) {
					simpleCommit.setAdds(addedCount);
				}
				int removedCount = Integer.parseInt(newCommit.getRemoves());
				if (removedCount > 0) {
					simpleCommit.setRemoves(removedCount);
				}
				int modifiedCount = Integer.parseInt(newCommit.getModifies());
				if (modifiedCount > 0) {
					simpleCommit.setModifies(modifiedCount);
				}
				simpleCommit.setDate(dateStr);
				simpleCommits.add(simpleCommit);
			}
			simpleLog.setSimpleCommits(simpleCommits);
		} catch (GeogigCommandException e) {
			GeogigRepositoryLog geogigLog = null;
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRepositoryLog.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigLog = (GeogigRepositoryLog) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
				simpleLog.setSuccess(geogigLog.getSuccess());
				simpleLog.setError(geogigLog.getError());
			} else {
				simpleLog.setError(e.getMessage());
				simpleLog.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(simpleLog.getError());
			simpleLog.setError(geogigStatus.getStatus());
		}
		return simpleLog;
	}

	@Override
	public GeogigDiff diffLayer(DTGeoserverManager geoserverManager, String repoName, int oldIndex, int newIndex,
			String layerName) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		String oldTreeish = "HEAD";
		String newTreeish = "HEAD";
		if (newIndex > 0) {
			newTreeish += "~" + newIndex;
		}
		oldTreeish += "~" + oldIndex;

		DiffRepository diffRepos = new DiffRepository();
		GeogigDiff diff = null;
		try {
			diff = diffRepos.executeCommand(url, user, pw, repoName, oldTreeish, newTreeish, layerName, null);
			String nextPage = diff.getNextPage();
			if (nextPage != null) {
				Integer page = 1;
				List<Diff> diffs = new ArrayList<>();
				diffs.addAll(diff.getDiffs());
				while (nextPage != null) {
					GeogigDiff nextDiff = diffRepos.executeCommand(url, user, pw, repoName, oldTreeish, newTreeish,
							layerName, page);
					diffs.addAll(nextDiff.getDiffs());
					nextPage = nextDiff.getNextPage();
				}
				diff.setDiffs(diffs);
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigDiff.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				diff = (GeogigDiff) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				diff = new GeogigDiff();
				diff.setError(e.getMessage());
				diff.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(diff.getError());
			diff.setError(geogigStatus.getStatus());
		}
		return diff;
	}

	@Override
	public GeogigDiff diffLayerById(DTGeoserverManager geoserverManager, String repoName, String oldId, String newId,
			String layerName) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		DiffRepository diffRepos = new DiffRepository();
		GeogigDiff diff = null;
		try {
			diff = diffRepos.executeCommand(url, user, pw, repoName, oldId, newId, layerName, null);
			String nextPage = diff.getNextPage();
			if (nextPage != null) {
				Integer page = 1;
				List<Diff> diffs = new ArrayList<>();
				diffs.addAll(diff.getDiffs());
				while (nextPage != null) {
					GeogigDiff nextDiff = diffRepos.executeCommand(url, user, pw, repoName, oldId, newId, layerName,
							page);
					diffs.addAll(nextDiff.getDiffs());
					nextPage = nextDiff.getNextPage();
				}
				diff.setDiffs(diffs);
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigDiff.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				diff = (GeogigDiff) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				diff = new GeogigDiff();
				diff.setError(e.getMessage());
				diff.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(diff.getError());
			diff.setError(geogigStatus.getStatus());
		}
		return diff;
	}

	@Override
	public GeogigRemove removeLayer(DTGeoserverManager geoserverManager, String repoName, String transactionId,
			String path, boolean recursive) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		RemovePath remove = new RemovePath();
		GeogigRemove geogigRemove = null;
		try {
			geogigRemove = remove.executeCommand(url, user, pw, repoName, transactionId, path, recursive);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRemove.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigRemove = (GeogigRemove) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigRemove = new GeogigRemove();
				geogigRemove.setError(e.getMessage());
				geogigRemove.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigRemove.getError());
			geogigRemove.setError(geogigStatus.getStatus());
		}
		return geogigRemove;
	}
}
