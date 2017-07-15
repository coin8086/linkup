$(function() {
  "use strict";

  function shuffle(array) {
    for (var i = 0; i < 3; i++) {
      for (var k = 0; k < array.length; k++) {
        var r = Math.floor(Math.random() * 1000 % array.length);
        if (r != k) {
          var t = array[k];
          array[k] = array[r];
          array[r] = t;
        }
      }
    }
  }

  //urls should have at least one element.
  function generate_images(urls, m, n) {
    var total = Math.floor(m * n / 2);
    if (urls.length > total) {
      urls.length = total;
    }
    var images = [];
    for (var i = 0; i < urls.length; i++) {
      images.push(urls[i], urls[i]);
    }
    var required = total * 2;
    while (images.length < required) {
      images = images.concat(images);
    }
    images.length = required; //Truncate it to required length.
    shuffle(images);
    images.length = m * n; //The last is blank if m * n is odd.

    var ret = [];
    for (var i = 0; i < m; i++) {
      ret[i] = [];
      for (var j = 0; j < n; j++) {
        ret[i].push(images[i * n + j]);
      }
    }
    return ret;
  }

  function generate($table, m, n, image_urls) {
    var images = generate_images(image_urls, m, n);

    for (var i = 0; i < m; i++) {
      var $row = $('<tr>').appendTo($table);
      for (var j = 0; j < n; j++) {
        var $cell = $('<td></td>').data('index', { x: i, y: j }).appendTo($row);
        var url = images[i][j];
        if (url) {
          $('<img>').attr('src', url).appendTo($cell);
        }
      }
    }

    return images;
  }

  function bind_event($table, images) {
    var $prev = null;
    var link_sound = $('#link-sound').get(0);
    var applause_sound = $('#applause-sound').get(0);
    $table.find('td').click(function() {
      var $this = $(this);
      var index = $this.data('index');
      var linked = false;
      if ($prev) {
        var prev_index = $prev.data('index');
        if (prev_index.x != index.x || prev_index.y != index.y) {
          var prev_url = $prev.find('img').attr('src');
          var url = $this.find('img').attr('src');
          if (prev_url && url && prev_url == url && linkable(images, prev_index, index)) {
            link_sound.play();
            $prev.find('img').remove();
            $this.find('img').remove();
            clear(images, prev_index);
            clear(images, index);
            linked = true;
          }
        }
        $prev.css('border-style', 'groove');
      }
      if (!linked) {
        $this.css('border-style', 'inset');
        $prev = $this;
      }
      else {
        $prev = null;
      }
      if (over(images)) {
        applause_sound.play();
        confirm("Congrats!");
      }
    });
  }

  function linkable(b, p1, p2) {
    var m = b.length;
    var n = b[0].length;
    var start = p1.x * n + p1.y;
    var target = p2.x * n + p2.y;
    var total = m * n;
    var found = new Array(total);
    var turn = new Array(total);
    var q = [];
    q.push(start);
    found[start] = true;
    turn[start] = -1;

    var ch = b[p2.x][p2.y];

    b[p2.x][p2.y] = null;
    var d = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    var p;
    while (q.length > 0) {
      p = q.shift();
      if (p == target || turn[p] > 2) {
        break;
      }
      else if (turn[p] == 2) {
        continue;
      }
      else {
        var i = Math.floor(p / n);
        var j = p % n;
        var stop = new Array(4);
        for (var s = 1;; s++) {
          var k;
          for (k = 0; k < 4; k++) {
            if (stop[k]) {
              continue;
            }
            var x = i + d[k][0] * s;
            var y = j + d[k][1] * s;
            var l = x * n + y;
            if (x >= 0 && x < m && y >= 0 && y < n && !b[x][y] && (!found[l] || turn[l] > turn[p])) {
              if (!found[l]) {
                q.push(l);
                found[l] = true;
                turn[l] = turn[p] + 1;
              }
            }
            else {
              stop[k] = true;
            }
          }
          for (k = 0; k < 4; k++) {
            if (!stop[k])
              break;
          }
          if (k == 4) {
            break;
          }
        }
      }
    }

    b[p2.x][p2.y] = ch;

    return p == target;
  }

  function clear(images, index) {
    images[index.x][index.y] = null;
  }

  function over(images) {
    var m = images.length;
    var n = images[0].length;
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        if (images[i][j])
          return false;
      }
    }
    return true;
  }

  function new_game($table, m, n, image_urls) {
    var images = generate($table, m, n, image_urls);
    bind_event($table, images);
  }

  var default_params = {
    rows: 5,
    cols: 6,
    width: 100,
    urls: [
      "https://s-media-cache-ak0.pinimg.com/236x/9b/a2/57/9ba25796112cad616be27e473ae1e149--kids-cartoon-characters-childhood-characters.jpg",
      "https://s-media-cache-ak0.pinimg.com/236x/c9/8e/e4/c98ee48d53c7b9e1ba07b5b4824e55c0--mickey-mouse-cartoon-cartoon-disney.jpg",
      "https://s-media-cache-ak0.pinimg.com/236x/9b/16/3d/9b163ddd863acb25fd4a93fba727280d--old-cartoons-vintage-cartoons.jpg",
      "https://s-media-cache-ak0.pinimg.com/236x/4b/f1/01/4bf101536015f85d9a91f318a6405627--tom-jerry-iron-on-transfer.jpg",
      "https://s-media-cache-ak0.pinimg.com/236x/1a/77/07/1a770728c9682c885c479a7149abcad4--tom-and-jerry-jerry-oconnell.jpg",
    ],
  };

  function get_params($form) {
    var rows = $('#rows', $form).val();
    var cols = $('#cols', $form).val();
    var width = $('#width', $form).val();
    var urls = $('.image-url', $form).not('.template').map(function() {
      return $('input', this).val();
    }).get().filter(function(x) { return x; });
    return { rows: rows, cols: cols, width: width, urls: urls};
  }

  function set_params($form, params) {
    $form.get(0).reset();
    if (params.rows)
      $('#rows', $form).val(params.rows);
    if (params.cols)
      $('#cols', $form).val(params.cols);
    if (params.width)
      $('#width', $form).val(params.width);
    if (params.urls && params.urls.length > 0) {
      var count = count_image_inputs($form);
      if (count < params.urls.length) {
        var n = Math.ceil(params.urls.length / 5) * 5;
        add_image_inputs($form, n - count);
      }
      for (var i = 0; i < params.urls.length; i++) {
        $('#url' + (i + 1), $form).val(params.urls[i]).change();
      }
    }
  }

  function count_image_inputs($form) {
    return $form.find('.image-url').not('.template').size();
  }

  function add_image_inputs($form, num) {
    var count = count_image_inputs($form);
    var $template = $form.find('.template.image-url');
    for (var i = 0; i < num; i++) {
      count++;
      var id = 'url' + count;
      var $clone = $template.clone().removeClass('template');
      $clone.find('label').attr('for', id).text('Image ' + count);
      $clone.find('input').attr('id', id).change(function() {
        var $this = $(this);
        $this.closest('.form-group').find('.preview').attr('src', $this.val());
      });
      $clone.insertBefore($template);
    }
  }

  $('#more-images').click(function() {
    add_image_inputs($('#controls'), 5);
    return false;
  });

  $('#play').click(function() {
    var $table = $('#board').empty();
    var params = get_params($('#controls'));
    for (var k in params) {
      if (!params[k] || params[k].length == 0)
        params[k] = default_params[k];
    }
    new_game($table, params.rows, params.cols, params.urls);
    //Set width after table is generated.
    $table.find('td').css('width', params.width + 'px');
    //Scroll to game board
    document.location = '#board';
    return false;
  });

  $('#save').click(function() {
    var params = get_params($('#controls'));
    var json = JSON.stringify(params);
    localStorage.setItem('params', json);
    return false;
  });

  $('#load').click(function() {
    var json = localStorage.getItem('params');
    if (json) {
      var params = JSON.parse(json);
      set_params($('#controls'), params);
    }
    else {
      alert("No saved params to load!");
    }
    return false;
  });

  $('#load-default').click(function() {
    set_params($('#controls'), default_params);
    return false;
  }).click();

});
