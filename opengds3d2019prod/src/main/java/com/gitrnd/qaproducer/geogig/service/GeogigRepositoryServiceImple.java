/**
 * 
 */
package com.gitrnd.qaproducer.geogig.service;

import java.io.StringReader;
import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.springframework.stereotype.Service;

import com.gitrnd.gdsbuilder.geogig.GeogigCommandException;
import com.gitrnd.gdsbuilder.geogig.GeogigExceptionStatus;
import com.gitrnd.gdsbuilder.geogig.command.repository.AddRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.CommitRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.ConfigRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.ConfigRepository.ConfigName;
import com.gitrnd.gdsbuilder.geogig.command.repository.DeleteRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.InfoRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.InitRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.LogRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.PullRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.PushRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.remote.AddRemoteRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.remote.ListRemoteRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.remote.PingRemoteRepository;
import com.gitrnd.gdsbuilder.geogig.command.repository.remote.RemoveRemoteRepository;
import com.gitrnd.gdsbuilder.geogig.command.transaction.BeginTransaction;
import com.gitrnd.gdsbuilder.geogig.command.transaction.EndTransaction;
import com.gitrnd.gdsbuilder.geogig.type.GeogigAdd;
import com.gitrnd.gdsbuilder.geogig.type.GeogigCommit;
import com.gitrnd.gdsbuilder.geogig.type.GeogigConfig;
import com.gitrnd.gdsbuilder.geogig.type.GeogigConfig.Config;
import com.gitrnd.gdsbuilder.geogig.type.GeogigFetch;
import com.gitrnd.gdsbuilder.geogig.type.GeogigPull;
import com.gitrnd.gdsbuilder.geogig.type.GeogigPush;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRemoteRepository;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryDelete;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryInfo;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryInit;
import com.gitrnd.gdsbuilder.geogig.type.GeogigRepositoryLog;
import com.gitrnd.gdsbuilder.geogig.type.GeogigTransaction;
import com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager;
import com.gitrnd.qaproducer.common.security.LoginUser;

/**
 * @author GIT
 *
 */
@Service("reposService")
public class GeogigRepositoryServiceImple implements GeogigRepositoryService {

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * initRepository( com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * com.gitrnd.qaproducer.common.security.LoginUser, java.lang.String,
	 * java.lang.String, java.lang.String, java.lang.String, java.lang.String,
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigRepositoryInit initRepository(DTGeoserverManager geoserverManager, LoginUser loginUser,
			String repoName, String dbHost, String dbPort, String dbName, String dbSchema, String dbUser,
			String dbPassword, String remoteName, String remoteURL) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		String authorName = loginUser.getUsername();
		String authorEmail = loginUser.getEmail();

		InitRepository initRepos = new InitRepository();
		GeogigRepositoryInit geogigReposInit = null;

		try {
			geogigReposInit = initRepos.executeCommand(url, user, pw, repoName, dbHost, dbPort, dbName, dbSchema,
					dbUser, dbPassword, user, authorEmail);
			if (remoteName != null && remoteURL != null) {
				String initReposName = geogigReposInit.getRepo().getName();
				// add remote
				AddRemoteRepository addRemote = new AddRemoteRepository();
				addRemote.executeCommand(url, user, pw, repoName, remoteName, remoteURL);
				// pull remote
				BeginTransaction beginTransaction = new BeginTransaction();
				GeogigTransaction transaction = beginTransaction.executeCommand(url, user, pw, initReposName);
				String transactionId = transaction.getTransaction().getId();

				LogRepository logRepos = new LogRepository();
				GeogigRepositoryLog geogigLog = logRepos.executeCommand(url, user, pw, remoteName, null, "1", null,
						false);
				if (geogigLog.getCommits() != null) {
					try {
						PullRepository pull = new PullRepository();
						pull.executeCommand(url, user, pw, initReposName, transactionId, remoteName, "master", "master",
								user, authorEmail);
						EndTransaction endTransaction = new EndTransaction();
						endTransaction.executeCommand(url, user, pw, initReposName, transactionId);
					} catch (GeogigCommandException e) {
						if (e.isXml()) {
							JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRepositoryInit.class);
							Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
							geogigReposInit = (GeogigRepositoryInit) unmarshaller
									.unmarshal(new StringReader(e.getResponseBodyAsString()));
						} else {
							geogigReposInit = new GeogigRepositoryInit();
							geogigReposInit.setError(e.getMessage());
							geogigReposInit.setSuccess("false");
						}
						DeleteRepository delete = new DeleteRepository();
						GeogigRepositoryDelete reposDelete = delete.executeGetCommand(url, user, pw, repoName);
						delete.executeDeleteCommand(url, user, pw, repoName, reposDelete.getToken());

						GeogigExceptionStatus geogigStatus = GeogigExceptionStatus
								.getStatus(geogigReposInit.getError());
						geogigReposInit.setError(geogigStatus.getStatus());
					}
				} else {
					geogigReposInit = new GeogigRepositoryInit();
					geogigReposInit.setError("No Commits Remote Repository");
					geogigReposInit.setSuccess("false");

					GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigReposInit.getError());
					geogigReposInit.setError(geogigStatus.getStatus());
				}
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRepositoryInit.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigReposInit = (GeogigRepositoryInit) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigReposInit = new GeogigRepositoryInit();
				geogigReposInit.setError(e.getMessage());
				geogigReposInit.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigReposInit.getError());
			geogigReposInit.setError(geogigStatus.getStatus());
		}
		return geogigReposInit;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.9GeogigRepositoryService#
	 * deleteRepository (com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String)
	 */
	@Override
	public GeogigRepositoryDelete deleteRepository(DTGeoserverManager geoserverManager, String repoName)
			throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		DeleteRepository deleteReops = new DeleteRepository();
		GeogigRepositoryDelete geogigRepos = null;
		try {
			geogigRepos = deleteReops.executeGetCommand(url, user, pw, repoName);
			String token = geogigRepos.getToken();
			deleteReops.executeDeleteCommand(url, user, pw, repoName, token);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRepositoryDelete.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigRepos = (GeogigRepositoryDelete) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigRepos = new GeogigRepositoryDelete();
				geogigRepos.setError(e.getMessage());
				geogigRepos.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigRepos.getError());
			geogigRepos.setError(geogigStatus.getStatus());
		}
		return geogigRepos;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * addRepository( com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigAdd addRepository(DTGeoserverManager geoserverManager, String repoName, String transactionId)
			throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		AddRepository addRepos = new AddRepository();
		GeogigAdd geogigAdd = null;
		try {
			geogigAdd = addRepos.executeCommand(url, user, pw, repoName, transactionId);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigAdd.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigAdd = (GeogigAdd) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigAdd = new GeogigAdd();
				geogigAdd.setError(e.getMessage());
				geogigAdd.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigAdd.getError());
			geogigAdd.setError(geogigStatus.getStatus());
		}
		return geogigAdd;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * commitRepository (com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String, java.lang.String,
	 * com.gitrnd.qaproducer.common.security.LoginUser)
	 */
	@Override
	public GeogigCommit commitRepository(DTGeoserverManager geoserverManager, String repoName, String transactionId,
			String message, LoginUser loginUser) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		String authorName = loginUser.getUsername();
		String authorEmail = loginUser.getEmail();

		CommitRepository commitRepos = new CommitRepository();
		GeogigCommit geogigCommit = null;

		try {
			geogigCommit = commitRepos.executeCommand(url, user, pw, repoName, transactionId, message, user,
					authorEmail);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigCommit.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigCommit = (GeogigCommit) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigCommit = new GeogigCommit();
				geogigCommit.setError(e.getMessage());
				geogigCommit.setSuccess("false");
			}
		}
		return geogigCommit;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * listRemoteRepository(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.Boolean)
	 */
	@Override
	public GeogigRemoteRepository listRemoteRepository(DTGeoserverManager geoserverManager, String repoName,
			Boolean verbose) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		ListRemoteRepository list = new ListRemoteRepository();
		GeogigRemoteRepository remotes = null;
		try {
			remotes = list.executeCommand(url, user, pw, repoName, verbose);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRemoteRepository.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				remotes = (GeogigRemoteRepository) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				remotes = new GeogigRemoteRepository();
				remotes.setError(e.getMessage());
				remotes.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(remotes.getError());
			remotes.setError(geogigStatus.getStatus());
		}
		return remotes;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * addRemoteRepository(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigRemoteRepository addRemoteRepository(DTGeoserverManager geoserverManager, String repoName,
			String remoteName, String remoteURL, LoginUser loginUser) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		AddRemoteRepository add = new AddRemoteRepository();
		GeogigRemoteRepository remotes = null;
		try {
			remotes = add.executeCommand(url, user, pw, repoName, remoteName, remoteURL);
			BeginTransaction begin = new BeginTransaction();
			GeogigTransaction transaction = begin.executeCommand(url, user, pw, repoName);

			String transactionId = transaction.getTransaction().getId();
			String authorName = loginUser.getUsername();
			String authorEmail = loginUser.getEmail();

			// master pull
			PullRepository pull = new PullRepository();
			GeogigPull geogigPull = pull.executeCommand(url, user, pw, repoName, transactionId, remoteName, "master",
					"master", user, authorEmail);
			if (geogigPull.getPull() != null) {
				EndTransaction end = new EndTransaction();
				end.executeCommand(url, user, pw, repoName, transactionId);
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRemoteRepository.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				remotes = (GeogigRemoteRepository) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				remotes = new GeogigRemoteRepository();
				remotes.setError(e.getMessage());
				remotes.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(remotes.getError());
			remotes.setError(geogigStatus.getStatus());
			// delete remote
			RemoveRemoteRepository remove = new RemoveRemoteRepository();
			remove.executeCommand(url, user, pw, repoName, remoteName);
		}
		return remotes;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * removeRemoteRepository(com.gitrnd.gdsbuilder.geoserver. DTGeoserverManager,
	 * java.lang.String, java.lang.Boolean, java.lang.String)
	 */
	@Override
	public GeogigRemoteRepository removeRemoteRepository(DTGeoserverManager geoserverManager, String repoName,
			String remoteName) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		RemoveRemoteRepository remove = new RemoveRemoteRepository();
		GeogigRemoteRepository remotes = null;
		try {
			remotes = remove.executeCommand(url, user, pw, repoName, remoteName);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRemoteRepository.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				remotes = (GeogigRemoteRepository) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				remotes = new GeogigRemoteRepository();
				remotes.setError(e.getMessage());
				remotes.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(remotes.getError());
			remotes.setError(geogigStatus.getStatus());
		}
		return remotes;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * pingRemoteRepository(com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigRemoteRepository pingRemoteRepository(DTGeoserverManager geoserverManager, String repoName,
			String remoteName) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		PingRemoteRepository ping = new PingRemoteRepository();
		GeogigRemoteRepository remote = null;
		try {
			remote = ping.executeCommand(url, user, pw, repoName, remoteName);
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRemoteRepository.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				remote = (GeogigRemoteRepository) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				remote = new GeogigRemoteRepository();
				remote.setError(e.getMessage());
				remote.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(remote.getError());
			remote.setError(geogigStatus.getStatus());
		}
		return remote;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * pullRepository( com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String, java.lang.String, java.lang.String,
	 * java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigPull pullRepository(DTGeoserverManager geoserverManager, String repoName, String transactionId,
			String remoteName, String branchName, String remoteBranchName, LoginUser loginUser) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		String authorName = loginUser.getUsername();
		String authorEmail = loginUser.getEmail();

		GeogigPull geogigPull = null;
		try {
			PullRepository pull = new PullRepository();
			PingRemoteRepository pingRepos = new PingRemoteRepository();
			GeogigRemoteRepository geogigRemote = pingRepos.executeCommand(url, user, pw, repoName, remoteName);
			if (geogigRemote.getPing().getSuccess().equalsIgnoreCase("true")) {
				geogigPull = pull.executeCommand(url, user, pw, repoName, transactionId, remoteName, branchName,
						remoteBranchName, user, authorEmail);
			} else {
				geogigPull = new GeogigPull();
				geogigPull.setSuccess("false");
				geogigPull.setError(GeogigExceptionStatus.REMOTE_CONNECTION_FAIL.getStatus());
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigPull.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigPull = (GeogigPull) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigPull = new GeogigPull();
				geogigPull.setError(e.getMessage());
				geogigPull.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigPull.getError());
			geogigPull.setError(geogigStatus.getStatus());
		}
		return geogigPull;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.gitrnd.qaproducer.geogig.service.GeogigRepositoryService#
	 * pushRepository( com.gitrnd.gdsbuilder.geoserver.DTGeoserverManager,
	 * java.lang.String, java.lang.String, java.lang.String, java.lang.String)
	 */
	@Override
	public GeogigPush pushRepository(DTGeoserverManager geoserverManager, String repoName, String remoteName,
			String branchName, String remoteBranchName) throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		GeogigPush geogigPush = null;
		try {
			PingRemoteRepository pingRepos = new PingRemoteRepository();
			GeogigRemoteRepository geogigRemote = pingRepos.executeCommand(url, user, pw, repoName, remoteName);
			PushRepository push = new PushRepository();
			if (geogigRemote.getPing().getSuccess().equalsIgnoreCase("true")) {
				geogigPush = push.executeCommand(url, user, pw, repoName, remoteName, branchName, remoteBranchName);
			} else {
				geogigPush = new GeogigPush();
				geogigPush.setSuccess("false");
				geogigPush.setError(GeogigExceptionStatus.REMOTE_CONNECTION_FAIL.getStatus());
			}
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigPush.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigPush = (GeogigPush) unmarshaller.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigPush = new GeogigPush();
				geogigPush.setError(e.getMessage());
				geogigPush.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigPush.getError());
			geogigPush.setError(geogigStatus.getStatus());
		}
		return geogigPush;
	}

	@Override
	public GeogigRepositoryInfo infoRepository(DTGeoserverManager geoserverManager, String repoName)
			throws JAXBException {

		String url = geoserverManager.getRestURL();
		String user = geoserverManager.getUsername();
		String pw = geoserverManager.getPassword();

		InfoRepository infoRepos = new InfoRepository();
		GeogigRepositoryInfo geogigReposInfo;
		try {
			geogigReposInfo = infoRepos.executeCommand(url, user, pw, repoName);
			ConfigRepository configRepos = new ConfigRepository();
			GeogigConfig geogigConfig = configRepos.executeCommand(url, user, pw, repoName, null);
			List<Config> configList = geogigConfig.getConfigs();
			for (Config config : configList) {
				String name = config.getName();
				String value = config.getValue();
				if (name.equalsIgnoreCase(ConfigName.STORAGE_REFS.getType())) {
					geogigReposInfo.setStorage(value);
				} else if (name.equalsIgnoreCase(ConfigName.USER_NAME.getType())) {
					geogigReposInfo.setUser(value);
				} else if (name.equalsIgnoreCase(ConfigName.USER_EMAIL.getType())) {
					geogigReposInfo.setEmail(value);
				}
			}
			String geogigUrl = url + "/geogig/repos/" + repoName;
			geogigReposInfo.setUrl(geogigUrl);
			geogigReposInfo.setSuccess("true");
		} catch (GeogigCommandException e) {
			if (e.isXml()) {
				JAXBContext jaxbContext = JAXBContext.newInstance(GeogigRepositoryInfo.class);
				Unmarshaller unmarshaller = jaxbContext.createUnmarshaller();
				geogigReposInfo = (GeogigRepositoryInfo) unmarshaller
						.unmarshal(new StringReader(e.getResponseBodyAsString()));
			} else {
				geogigReposInfo = new GeogigRepositoryInfo();
				geogigReposInfo.setError(e.getMessage());
				geogigReposInfo.setSuccess("false");
			}
			GeogigExceptionStatus geogigStatus = GeogigExceptionStatus.getStatus(geogigReposInfo.getError());
			geogigReposInfo.setError(geogigStatus.getStatus());
		}
		return geogigReposInfo;
	}

}
