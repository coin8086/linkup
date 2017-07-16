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
        confirm("恭喜!");
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
    cols: 8,
    width: 100,
    urls: [
      "http://img.qq1234.org/uploads/allimg/140705/5_140705210128_5.jpg",
      "http://img.qq1234.org/uploads/allimg/140705/5_140705210128_8.jpeg",
      "http://img.qq1234.org/uploads/allimg/140705/5_140705210128_9.png",
      "http://img.qq1234.org/uploads/allimg/140705/5_140705210128_6.jpeg",
      "http://img4q.duitang.com/uploads/item/201408/09/20140809152759_APyBA.thumb.700_0.jpeg",
      "https://b-ssl.duitang.com/uploads/item/201407/18/20140718143545_FPKvR.png",
      "http://cgwall.cn/upload/2014/08/0829PhC0JtQU2oI92SX-1.jpg",
      "http://s9.sinaimg.cn/middle/69309e56g8d3241d035d8&690&690",
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

    $form.find('.image-url').not('.template').remove();
    if (params.urls && params.urls.length > 0) {
      var n = Math.ceil(params.urls.length / 5) * 5;
      add_image_inputs($form, n);
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
      $clone.find('label').attr('for', id).text('图片' + count);
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
    }
    else {
      var params = default_params;
    }
    set_params($('#controls'), params);
    return false;
  }).click();

  $('#load-default').click(function() {
    set_params($('#controls'), default_params);
    return false;
  });
});
