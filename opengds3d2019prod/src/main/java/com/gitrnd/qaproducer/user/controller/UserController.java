package com.gitrnd.qaproducer.user.controller;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.gitrnd.qaproducer.common.security.LoginUser;
import com.gitrnd.qaproducer.user.domain.User;
import com.gitrnd.qaproducer.user.service.UserService;

/**
 * {@link User} 와 관련된 Client 요청을 처리하는 Controller
 * @author SG.LEE
 */
@Controller
@RequestMapping(value = "/user")
public class UserController {

	/**
	 * {@link User} 관련 요청 처리 Service
	 */
	@Autowired
	UserService userService;

	/**
	 * {@link UserController} {@link Logger}
	 */
	private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

	
	/**
	 * 사용자 가입 페이지 이동
	 * @author SG.LEE
	 * @param request {@link HttpServletRequest}
	 * @param loginUser 사용자 로그인 정보
	 * @return 호출 URL
	 */
	@RequestMapping(value = "/signin.do", method = RequestMethod.GET)
	public String signinView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser) {
		LOGGER.info("access: /signin.do");
		String redir;
		if (loginUser != null) {
			redir = "redirect:main.do";
		} else {
			redir = "/user/signin";
		}
		return redir;
	}

	
	/**
	 * 사용자 회원가입 요청 처리
	 * @author SG.LEE
	 * @param email 이메일
	 * @param uid 사용자 아이디
	 * @param fname 이름
	 * @param lname 성
	 * @param pw 비밀번호
	 * @return 호출 URL
	 */
	@RequestMapping(value = "/signup.do", method = RequestMethod.POST)
	public String signupProcess(@RequestParam("email") String email, @RequestParam("userid") String uid,
			@RequestParam("firstname") String fname, @RequestParam("lastname") String lname,
			@RequestParam("password") String pw) {
		LOGGER.info("access: /signup.do, user: {}.", uid);
		User user = new User();
		user.setUid(uid);
		user.setPw(new BCryptPasswordEncoder().encode(pw));
		user.setEmail(email);
		user.setAid(1);
		user.setFname(fname);
		user.setLname(lname);
		userService.createUser(user);
		return "redirect:signin.do";
	}

	/**
	 * 사용자 정보 페이지 이동
	 * @author SG.LEE
	 * @param request {@link HttpServletRequest}
	 * @param loginUser 사용자 로그인 정보
	 * @return {@link ModelAndView}
	 * @throws Exception
	 */
	@RequestMapping(value = "/userinfo.do")
	@ResponseBody
	public ModelAndView userInfoView(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser)
			throws Exception {
		ModelAndView mav = new ModelAndView();
		if (loginUser != null) {
			LOGGER.info("access: /userinfo.do user={}", loginUser.getUsername());
			mav.addObject("username", loginUser.getUsername());
			mav.addObject("fname", loginUser.getFname());
			mav.addObject("lname", loginUser.getLname());
			mav.addObject("email", loginUser.getEmail());
			mav.addObject("auth", loginUser.getAuthorities());
		}
		String header = request.getHeader("User-Agent");
		if (header != null) {
			if (header.indexOf("Trident") > -1) {
				mav.addObject("browser", "MSIE");
			}
		}
		mav.setViewName("/user/userinfo");
		return mav;
	}

	/**
	 * 아이디 중복체크
	 * @author SG.LEE
	 * @param request {@link HttpServletRequest}
	 * @return {@link Boolean} 중복여부 true - 중복X , false - 중복
	 * @throws Exception
	 */
	@RequestMapping(value = "/idcheck.ajax")
	@ResponseBody
	public boolean checkDuplicatedID(HttpServletRequest request) throws Exception {
		boolean isUnique = false;
		String id = request.getParameter("id");
		User oldUser = userService.checkDuplicatedById(id);
		if (oldUser == null) {
			isUnique = true;
		}
		LOGGER.info("아이디 중복확인:{}", id);
		LOGGER.info("유일 아이디 여부:{}", isUnique);
		return isUnique;
	}

	/**
	 * 
	 * @author SG.LEE
	 * @param request
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/emailcheck.ajax")
	@ResponseBody
	public boolean checkDuplicatedEmail(HttpServletRequest request) throws Exception {
		boolean isUnique = false;
		String email = request.getParameter("email");
		User oldUser = userService.checkDuplicatedByEmail(email);
		if (oldUser == null) {
			isUnique = true;
		}
		LOGGER.info("이메일 중복확인:{}", email);
		LOGGER.info("유일 아이디 여부:{}", isUnique);
		return isUnique;
	}

	/**
	 * 
	 * @author SG.LEE
	 * @param request
	 * @param loginUser
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/deactivateuser.ajax")
	@ResponseBody
	public boolean deactivateUser(HttpServletRequest request, @AuthenticationPrincipal LoginUser loginUser)
			throws Exception {
		LOGGER.info("유저 비활성화 user=:{}", loginUser.getUsername());
		boolean isDeactivated = false;
		User user = new User();
		user.setUid(loginUser.getUsername());
		user.setActive(false);
		isDeactivated = userService.setActiveUserById(user);
		return isDeactivated;
	}
}
