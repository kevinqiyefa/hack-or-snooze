let favStoryIDs = new Set();

$(function() {
  fetchFav().then(() => {
    fetchStories().then(() => {
      if (localStorage.getItem('token') && localStorage.getItem('username')) {
        $('#signup-btn').hide();
        $('#login-btn').text('Log Out');
        profile();
        displayUserInfo();
        $('.newStories, .profile').css('display', 'inline-block');
        getFirstNameAndAppend(localStorage.getItem('username'));
        $('.fa-star').css('display', 'inline-block');
      }
    });
  });
});

function displayUserInfo() {
  $('#userinfo')
    .append($('<h5>').text(`Full Name:  ${localStorage.getItem('fullname')}`))
    .append($('<h5>').text(`User Name:  ${localStorage.getItem('username')}`));
}

function fetchStories() {
  let starClass;
  return $
    .getJSON('https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=20')
    .then(function(data) {
      data.data.forEach(function(name) {
        starClass = favStoryIDs.has(name.storyId)
          ? 'fas fa-star'
          : 'far fa-star';

        $('.list').append(
          $('<li>')
            .addClass('title-list')
            .append(
              $('<i>')
                .addClass(starClass)
                .click(function(e) {
                  $(e.target).toggleClass('fas fa-star far fa-star');
                  if ($(e.target).hasClass('fas')) {
                    favorite(name.storyId, 'POST');
                    favStoryIDs.add(name.storyId);
                  } else {
                    favorite(name.storyId, 'DELETE');
                    favStoryIDs.delete(name.storyId);
                  }
                })
            )
            .append(
              $('<a>')
                .attr('href', `${name.url}`)
                .text(name.title)
            )
            .append(
              $('<span>')
                .addClass('url-list')
                .text(
                  `( ${name.url
                    .match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i)[1]
                    .replace('www.', '')} )`
                )
            )
        );
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function favorite(sId, method) {
  $.ajax({
    url: `https://hack-or-snooze.herokuapp.com/users/${localStorage.getItem(
      'username'
    )}/favorites/${sId}`,
    method: method,
    dataType: 'json',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(resp => console.log(resp))
    .catch(errs => console.log(errs));
}

function fetchFav() {
  return $
    .ajax({
      url: `https://hack-or-snooze.herokuapp.com/users/${localStorage.getItem(
        'username'
      )}`,
      method: 'GET',
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(function(data) {
      data.data.favorites.forEach(function(story) {
        favStoryIDs.add(story.storyId);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

$('.title').click(function() {
  $('.body-content').show();
  $('.profile-content').hide();
});

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
      //get first name and append to the heading
      getFirstNameAndAppend(user_name);
      fetchFav().then(() => {
        $('.list').empty();

        $('.login-msg').hide();

        //UI after login.
        $('#signup-btn').hide();
        $('#login-btn').text('Log Out');

        fetchStories().then(() => $('.fa-star').css('display', 'inline-block'));

        $('.newStories, .profile').css('display', 'inline-block');
        displayUserInfo();

        $('.loginForm > form')[0].reset();
        $('.login-modal').modal('hide');
        $('#login-btn').attr('data-target', '#youCantCallMe');
        console.log(res);
      });
    })
    .catch(function(error) {
      $('.login-err-msg').text(
        'Please double check your username and password!'
      );
      $('.loginForm > form')[0].reset();
      console.log(error);
    });
}

function getFirstNameAndAppend(user_name) {
  //get first name and append to the heading
  let firstName;

  let token = localStorage.getItem('token');
  $.ajax({
    url: `https://hack-or-snooze.herokuapp.com/users/${user_name}`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
    .then(resp => {
      firstName = resp.data.name.split(' ')[0];
      localStorage.setItem('fullname', resp.data.name);
      $('.heading').append(
        $('<div>')
          .addClass('helloMsg')
          .text(`Hi, ${firstName}`)
      );
    })
    .catch(errs => console.log(errs));
}

function greetingTime() {
  let d = new Date();
  let greetingMsg;
  if (d.getHours() < 12) {
    greetingMsg = 'Good Morning';
  } else if (d.getHours() > 18) {
    greetingMsg = 'Good Evening';
  } else {
    greetingMsg = 'Good Afternoon';
  }
  return greetingMsg;
}

function profile() {
  let greeting = greetingTime();
  let firstName = localStorage.getItem('fullname');
  $('.profile').click(function() {
    $('.body-content').hide();
    $('.profile-content').show();
    $('.greeting').text(`${greeting}, ${firstName}`);
    $('.myStroylist').empty();
    listMyPostedStories();
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
    $('.newStories, .profile').css('display', 'none');
    $('.helloMsg').remove();
    $('#userinfo').empty();
    $('.profile-content').hide();
    $('.body-content').css('display', 'block');

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    localStorage.removeItem('storyid');

    favStoryIDs.clear();

    $('.fa-star').css('display', 'none');

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
  let author = $('#inputAuthor').val();
  let data = {
    data: {
      author: author,
      title: title,
      url: url,
      username: localStorage.getItem('username')
    }
  };

  let token = localStorage.getItem('token');

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
      $('.list').append(
        $('<li>')
          .addClass('title-list')
          .append(
            $('<i>')
              .addClass('far fa-star')
              .click(function(e) {
                $(e.target).css('display', 'inline-block');
                $(e.target).toggleClass('fas fa-star far fa-star');
              })
          )
          .append(
            $('<a>')
              .attr('href', `${url}`)
              .text(title)
          )
          .append(
            $('<span>')
              .addClass('url-list')
              .text(
                `( ${url
                  .match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i)[1]
                  .replace('www.', '')} )`
              )
          )
      );

      $('#submitStory > form')[0].reset();

      console.log(msg);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function listMyPostedStories() {
  $('.myStorylist').empty();
  $.ajax({
    url: `https://hack-or-snooze.herokuapp.com/users/${localStorage.getItem(
      'username'
    )}`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(resp => {
      resp.data.stories.forEach(story => {
        $('.myStorylist').append(
          $('<li>')
            .append(
              $('<a>')
                .attr('href', `${story.url}`)
                .text(
                  story.title.length > 30
                    ? story.title.substring(0, 30) + '... '
                    : story.title
                )
            )
            .append(
              $('<span>')
                .addClass('url-list')
                .text(
                  `( ${story.url
                    .match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i)[1]
                    .replace('www.', '')} )`
                )
            )
            .append(
              $('<i class="fas fa-trash-alt"></i>').click(function(event) {
                deleteStory(story.storyId).then(() =>
                  $(event.target)
                    .parent()
                    .remove()
                );
              })
            )
            .append(
              $(
                '<i class="fas fa-edit text-primary" data-toggle="modal" data-target="#editStory"></i>'
              ).click(function(event) {
                //prefill inputs
                $('#editTitle').val(story.title);
                $('#editAuthor').val(story.author);
                $('#editUrl').val(story.url);
                localStorage.setItem('storyid', story.storyId);
              })
            )
        );
      });

      console.log(resp.data.stories);
    })
    .catch(errs => console.log(errs));
}

function editStory(event) {
  event.preventDefault();
  let storyid = localStorage.getItem('storyid');
  let d = {
    data: {
      title: `${$('#editTitle').val()}`,
      author: `${$('#editAuthor').val()}`,
      url: `${$('#editUrl').val()}`
    }
  };

  $.ajax({
    url: `https://hack-or-snooze.herokuapp.com/stories/${storyid}`,
    method: 'PATCH',
    dataType: 'json',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    data: JSON.stringify(d)
  })
    .then(resp => {
      $('.editStory-modal').modal('hide');
      $('.list').empty();
      fetchStories();
      listMyPostedStories();
      console.log(resp);
    })
    .catch(errs => {
      alert('working');
      console.log(errs);
    });
}

function deleteStory(storyID) {
  return $
    .ajax({
      url: `https://hack-or-snooze.herokuapp.com/stories/${storyID}`,
      method: 'DELETE',
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(resp => {
      console.log(resp);
    })
    .catch(errs => console.log(errs));
}

$('.loginForm > form').submit(logIn);
$('.signupForm > form').submit(signUp);
$('#submitStory > form').submit(submitStory);
$('.editStoryForm > form').submit(editStory);
