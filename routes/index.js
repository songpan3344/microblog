var express = require('express');
var router = {};
var User = require('../models/user.js');
var Post = require('../models/post.js');
var crypto = require('crypto');

/* GET home page. */
router.index = function(req, res, next) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		res.locals.title = '首页';
		res.locals.posts = posts;
		res.render('index');
	});
}


router.user = function(req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.locals.title = user.name;
			res.locals.posts = posts;
			res.render('user');
		});
	});
}

router.post = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/' + currentUser.name);
	});
};
router.reg = function(req, res) {
	res.locals.title = '用户注册'
	res.render('reg')
};
router.doReg = function(req, res) {
	debugger;
	//检验用户两次输入的口令是否一致
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', '两次输入的口令不一致');
		return res.redirect('/reg');
	}
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name: req.body.username,
		password: password,
	});
	debugger;
	//检查用户名是否已经存在
	User.get(newUser.name, function(err, user) {
		if (user)
			err = 'Username already exists.';
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//如果不存在则新增用户
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
};
router.login = function(req, res) {
	res.locals.title = '用户登入'
	res.render('login');
};
router.doLogin = function(req, res) {
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
};
router.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/');
};

router.checkLogin = function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
}

router.checkNotLogin = function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}

module.exports = router;