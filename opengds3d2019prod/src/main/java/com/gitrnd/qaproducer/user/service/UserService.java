package com.gitrnd.qaproducer.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gitrnd.qaproducer.user.domain.User;
import com.gitrnd.qaproducer.user.repository.UserRepository;

/**
 * 사용자 Service 클래스
 * @author SG.LEE
 */
@Service
@Transactional
public class UserService {
	/**
	 * 사용자 Repository 클래스
	 */
	@Autowired
	private UserRepository userRepository;

	/**
	 * 사용자 조회
	 * @author SG.LEE
	 * @param uid 사용자 id
	 * @return User 클래스
	 */
	@Transactional(readOnly = true)
	public User retrieveUserById(String uid) {
		return userRepository.retrieveUserById(uid);
	}
	/**
	 * 사용자 조회
	 * @author SG.LEE
	 * @param idx 사용자 테이블 pk
	 * @return User 클래스
	 */
	@Transactional(readOnly = true)
	public User retrieveUserByIdx(int idx) {
		return userRepository.retrieveUserByIdx(idx);
	}
	/**
	 * 사용자 생성
	 * @author SG.LEE
	 * @param user User 클래스
	 */
	@Transactional
	public void createUser(User user) {
		userRepository.createUser(user);
	}
	/**
	 * 아이디 중복여부 체크
	 * @author SG.LEE
	 * @param user User 클래스 
	 * @return User 클래스
	 */
	@Transactional(readOnly = true)
	public User checkUserById(User user) {
		return userRepository.checkUserById(user);
	}
	/**
	 * 이메일 체크
	 * @author SG.LEE
	 * @param user User 클래스 
	 * @return User 클래스
	 */
	@Transactional(readOnly = true)
	public User checkUserByEmail(User user) {
		return userRepository.checkUserByEmail(user);
	}
	/**
	 * 아이디 중복여부 체크
	 * @author SG.LEE
	 * @param uid 사용자 id
	 * @return User 클래스(Null일시 false)
	 */
	@Transactional(readOnly = true)
	public User checkDuplicatedById(String uid) {
		return userRepository.checkDuplicatedById(uid);
	}
	/**
	 * 이메일 중복여부 체크
	 * @author SG.LEE
	 * @param email 사용자 이메일
	 * @return User 클래스(Null일시 false)
	 */
	@Transactional(readOnly = true)
	public User checkDuplicatedByEmail(String email) {
		return userRepository.checkDuplicatedByEmail(email);
	}
	/**
	 * 사용자 권한 활성화
	 * @author SG.LEE
	 * @param user User 클래스
	 * @return 업데이트 여부
	 */
	@Transactional
	public boolean setActiveUserById(User user) {
		return userRepository.setActiveUserById(user);
	}

}
