let $list = $('.list');
$(function() {
  printStories();

  if (localStorage.getItem('token') && localStorage.getItem('username')) {
    $('#signup-btn').hide();
    $('#login-btn').text('Log Out');
    $('.newStories, .favorites').css('display', 'inline-block');
  }
});

function printStories() {
  $.getJSON('https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10')
    .then(function(data) {
      data.data.forEach(function(name) {
        $list.append(
          `<li  class='title-list'><a href='${name.url}'>${
            name.title
          }</a> <span class='url-list'>( ${name.url
            .replace('https://www.', '')
            .replace('http://www.', '')
            .replace('http://', '')
            .replace('https://', '')} )</span></li>`
        );
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function logIn(event) {
  event.preventDefault();
  let user_name = $('#login_username').val();
  let pass_word = $('#login_password').val();
  let data = {
    data: {
      username: user_name,
      password: pass_word
    }
  };

  $.post('https://hack-or-snooze.herokuapp.com/auth', data, 'json')
    .then(function(res) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', user_name);

      $('.login-msg').hide();
      $('#signup-btn').hide();
      $('#login-btn').text('Log Out');

      $('.newStories, .favorites').css('display', 'inline-block');

      $('.loginForm > form')[0].reset();
      $('.login-modal').modal('hide');
      $('#login-btn').attr('data-target', '#youCantCallMe');
      console.log(res);
    })
    .catch(function(error) {
      $('.login-err-msg').text(
        'Please double check your username and password!'
      );
      $('.loginForm > form')[0].reset();
      console.log(error);
    });
}

function signUp(event) {
  event.preventDefault();
  let name = $('#signup_name').val();
  let user_name = $('#signup_username').val();
  let pass_word = $('#signup_password').val();
  let data = {
    data: {
      name: name,
      username: user_name,
      password: pass_word
    }
  };

  $.post('https://hack-or-snooze.herokuapp.com/users', data, 'json')
    .then(function(res) {
      // localStorage.setItem('username', user_name);

      $('.signup-err-msg').hide();

      $('.signupForm > form')[0].reset();
      $('.signup-modal').modal('hide');

      console.log(res);
    })
    .catch(function(err) {
      $('.signup-err-msg').text('Username has already been taken');

      // $('.signup-err-msg').text(`${err.error}`);
      $('.signupForm > form')[0].reset();
      console.log(err.error);
    });
}

//logout
$('#login-btn').on('click', function() {
  if ($('#login-btn').text() === 'Log Out') {
    $('#login-btn').attr('data-target', '#logout');
    $('.newStories, .favorites').css('display', 'none');

    localStorage.removeItem('token');
    localStorage.removeItem('username');

    $('#login-btn').text('Login');
    $('#signup-btn').show();
    setTimeout(function() {
      $('#login-btn').attr('data-target', '#login');
    }, 1000);
  }
});

//submit story
function submitStory(event) {
  event.preventDefault();
  let title = $('#inputTitle').val();
  let url = $('#url').val();
  let author = $('#inoutAuthor').val();
  let data = {
    data: {
      author: author,
      title: title,
      url: url,
      username: localStorage.getItem('username')
    }
  };

  let token = localStorage.getItem('token');
  console.log(token);

  $.ajax({
    url: 'https://hack-or-snooze.herokuapp.com/stories',
    method: 'POST',
    dataType: 'json',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: JSON.stringify(data)
  })
    .then(function(msg) {
      $list.append(
        `<li  class='title-list'><a href='${name.url}'>${
          name.title
        }</a> <span class='url-list'>( ${name.url
          .replace('https://www.', '')
          .replace('http://www.', '')
          .replace('http://', '')
          .replace('https://', '')} )</span></li>`
      );

      $('#submitStory > form')[0].reset();

      console.log(msg);
    })
    .catch(function(error) {
      console.log(error);
    });
}

$('.loginForm > form').submit(logIn);
$('.signupForm > form').submit(signUp);
$('#submitStory > form').submit(submitStory);
