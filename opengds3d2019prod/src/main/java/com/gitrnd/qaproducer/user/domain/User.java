package com.gitrnd.qaproducer.user.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 사용자 정보 클래스
 * @author SG.LEE
 *
 */
@Data
@ToString
@EqualsAndHashCode
@NoArgsConstructor
public class User {
	/**
	 * DB pk
	 */
	private int idx;
	/**
	 * 사용자 아이디
	 */
	private String uid;
	/**
	 * 사용자 비밀번호
	 */
	private String pw;
	/**
	 * 사용자 이메일
	 */
	private String email;
	/**
	 * 사용자 권한
	 */
	private String auth;
	/**
	 * 이름
	 */
	private String fname;
	/**
	 * 성
	 */
	private String lname;
	/**
	 * 사용자 권한 id
	 */
	private int aid;
	/**
	 * 활성화 여부
	 */
	private Boolean active;
}
