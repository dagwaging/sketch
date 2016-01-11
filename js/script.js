function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function intersects(x1, y1, x2, y2, x3, y3, radius) {
  
}

function encode(lines) {
  var data = [];
  
  for(var i in lines) {
    var line = lines[i];
    var lineData = "";
    
    for(var j in line) {
      lineData += pad(line[j].toString(36), 2);
    }
    
    data.push(lineData);
  }
  
  return data.join(" ");
}

function decode(data) {
  var linesData = data.split(" ");
  var lines = [];
  
  for(var i in linesData) {
    var lineData = linesData[i];
    var line = [];
    
    for(var j = 0; j < lineData.length; j += 2) {
      line.push(parseInt(lineData.substr(j, 2), 36));
    }
    
    lines.push(line);
  }
  
  return lines;
}

$(document).ready(function() {
  var count = $("#count");
  var debug = $("#debug");
  var lines = [];
  var ink = 0;
  var erasing = false;
  
  var query = window.location.search.replace("?", "");
  
  var editable = true;
  
  var canvasElement = $("#overlay");
  var canvas = $("#canvas").get()[0].getContext("2d");
  var overlay = canvasElement.get()[0].getContext("2d");
  var playTimer = 0;
  var last = 0;
  
  overlay.strokeStyle = "black";
  overlay.lineWidth = 1;
  overlay.lineJoin = "round";
  overlay.lineCap = "round";
  overlay.fillStyle = "white";
  
  canvas.strokeStyle = "black";
  canvas.lineWidth = 3;
  canvas.lineJoin = "round";
  canvas.lineCap = "round";
  canvas.fillStyle = "white";
  canvas.fillRect(0, 0, 800, 600);
  
  function play(lines) {
    clearTimeout(playTimer);
    
    var line;
    
    function loop(i, j, interval) {
      if(j >= lines[i].length) {
        j = 0;
        i++;
      }
      
      if(i >= lines.length) {
        return;
      }
      
      if(j === 0) {
        line = beginLine({
          offsetX: lines[i][j],
          offsetY: lines[i][j + 1]
        });
      }
      else {
        drawLine({
          offsetX: lines[i][j],
          offsetY: lines[i][j + 1]
        }, line);
      }
      
      j += 2;
      
      playTimer = setTimeout(function() {
        loop(i, j, interval);
      }, interval);
    }
    
    loop(0, 0, 10);
  }
  
  function beginLine(e) {
    if(e.which == 0) {
      e.offsetX = e.originalEvent.touches[0].pageX - $(e.target).offset().left;
      e.offsetY = e.originalEvent.touches[0].pageY - $(e.target).offset().top;
    } else {
      e.offsetX = e.offsetX || e.pageX - $(e.target).offset().left;
      e.offsetY = e.offsetY || e.pageY - $(e.target).offset().top;
    }
    
    var pointX = Math.round(e.offsetX);
    var pointY = Math.round(e.offsetY);
    
    canvas.beginPath();
    canvas.moveTo(pointX, pointY);
    
    var line = [];
    lines.push(line);
    line.push(pointX);
    line.push(pointY);
    
    debug.html(JSON.stringify(lines));
    
    ink += 5;
    
    count.html("Ink used: " + Math.ceil(ink / 65535 * 100) + "%");
    
    return line;
  }
  
  function drawLine(e, line) {
    if(e.which == 0) {
      e.offsetX = e.originalEvent.touches[0].pageX - $(e.target).offset().left;
      e.offsetY = e.originalEvent.touches[0].pageY - $(e.target).offset().top;
    } else {
      e.offsetX = e.offsetX || e.pageX - $(e.target).offset().left;
      e.offsetY = e.offsetY || e.pageY - $(e.target).offset().top;
    }
    
    var pointX = Math.round(e.offsetX);
    var pointY = Math.round(e.offsetY);
    
    var lastPointX = line[line.length - 2];
    var lastPointY = line[line.length - 1];
    
    // if(Math.pow(lastPointX - pointX, 2) + Math.pow(lastPointY - pointY, 2) < 9) {
    if(Date.now() - last < 16) {
      return;
    }
    
    last = Date.now();
    
    canvas.lineTo(pointX, pointY);
    canvas.stroke();
    
    line.push(pointX);
    line.push(pointY);
    
    debug.html(JSON.stringify(lines));
    
    ink += 4;
  
    count.html("Ink used: " + Math.ceil(ink / 65535 * 100) + "%");
  }
  
  function eraseLine(e, radius) {
    radius = radius || 5;
    
    e.offsetX = e.offsetX || e.pageX - $(e.target).offset().left;
    e.offsetY = e.offsetY || e.pageY - $(e.target).offset().top;
    
    for(var j in lines) {
      var line = lines[j];
      
      for(var i = 0; i < line.length; i += 2) {
        var ax = line[i], ay = line[i + 1], bx = line[i + 2], by = line[i + 3];
        
        if(Math.sqrt(Math.pow(e.offsetX - line[i], 2) + Math.pow(e.offsetY - line[i + 1], 2)) < radius) {
          var first = line.slice(0, i);
          
          var second = line.slice(i + 2);
          
          lines.splice(j, 1);
          
          if(first.length > 2) {
            lines.splice(j, 0, first);
          }
          
          if(second.length > 2) {
            lines.splice(j, 0, second);
          }
          
          debug.html(JSON.stringify(lines));
    
          redraw();
          
          return;
        }
      }
    }
  }
  
  function redraw() {
    canvas.fillRect(0, 0, 800, 600);
    
    for(var i in lines) {
      var line = lines[i];
      
      canvas.beginPath();
      
      canvas.moveTo(line[0], line[1]);
      
      for(var i = 2; i <= line.length; i += 2) {
        canvas.lineTo(line[i], line[i + 1]);
      }
      
      canvas.stroke();
    }
  }
  
  canvasElement.on("mousemove.overlay touchmove.overlay", function(e) {
    e.offsetX = e.offsetX || e.pageX - $(e.target).offset().left;
    e.offsetY = e.offsetY || e.pageY - $(e.target).offset().top;
    
    if(erasing) {
      overlay.clearRect(0, 0, 800, 600);
      overlay.beginPath();
      overlay.arc(e.offsetX, e.offsetY, 5, 0, Math.PI * 2);
      overlay.fill();
      overlay.stroke();
    }
  })
  
  canvasElement.on("mousedown.sketch touchstart.sketch", function(e) {
    e.preventDefault();
    
    if(!editable || ink >= 65535) {
      return false;
    }
    
    if(e.which == 1 || e.which == 0) {
      overlay.clearRect(0, 0, 800, 600);
      erasing = false;
      
      var line = beginLine(e);
      
      canvasElement.on("mousemove.sketch touchmove.sketch", function(e) {
        if(!editable || ink >= 65535) {
          return false;
        }
        
        drawLine(e, line);
        
        return false;
      }).on("mouseleave.sketch", function(e) {
        canvasElement.one("mouseenter.sketch", function(e) {
          line = beginLine(e);
        });
      });
    }
    else if(e.which == 3) {
      erasing = true;
      
      canvasElement.on("mousemove.sketch touchmove.sketch", function(e) {
        eraseLine(e);
        
        return false;
      });
    }
    
    $(document).one("mouseup.sketch touchend.sketch", function(e) {
      e.preventDefault();
      
      canvasElement.off("mousemove.sketch mouseleave.sketch mouseenter.sketch touchmove.sketch");
      
      return false;
    });
    
    return false;
  }).on("contextmenu", function(e) {
    return false;
  });
  
  $("#swap").on("click", function() {
    var data = encode(lines);
    
    $.ajax({
      url: "http://cors-dagwaging.rhcloud.com/" + "garyc.me/sketch/swap.php?v=32" + (query ? "&" + query : ""),
      method: "POST",
      data: data
    }).done(function(data) {
      function getSketch() {
        $.ajax("http://cors-dagwaging.rhcloud.com/" + "garyc.me/sketch/get.php?id=" + data + (query ? "&" + query : ""))
        .done(function(data) {
          if(data == "wait") {
            setTimeout(getSketch, 3000);
            
            return;
          }
          
          $("#reset").click();
          editable = false;
          
          play(decode(data));
        });
      }
      
      getSketch();
    });
  });
  
  $("#reset").on("click", function() {
    clearTimeout(playTimer);
    
    canvas.fillRect(0, 0, 800, 600);
    
    lines = [];
    
    debug.html(JSON.stringify(lines));
    
    ink = 0;
    
    count.html("Ink used: " + Math.ceil(ink / 65535 * 100) + "%");
    
    editable = true;
  });
  
  $("#undo").on("click", function() {
    if(!editable) {
      return;
    }
    
    var last = lines.pop();
    
    debug.html(JSON.stringify(lines));
    
    redraw();
    
    ink -= last.length * 2 + 1;
    
    count.html("Ink used: " + Math.ceil(ink / 65535 * 100) + "%");
  });
  
  $(document).on('keydown', function(e) {
    if(e.ctrlKey) {
      switch(e.keyCode) {
        case 90:
          $("#undo").click();
          break;
        case 67:
          alert(encode(lines));
          break;
        case 86:
          lines = decode(prompt());
          
          break;
      }
    }
  });
  
  function updateStats() {
    $.ajax("http://cors-dagwaging.rhcloud.com/" + "garyc.me/sketch/getStats.php?timespan=300" + (query ? "&" + query : ""))
    .done(function(data) {
      var stats = data.split(",");
      
      for(var i in stats) {
        stats[i] = parseInt(stats[i], 10);
      }
      
      var sketchPlural = "<strong>" + stats[0] + "</strong>" + (stats[0] == 1 ? " sketch was" : " sketches were");
      var artistPlural = "<strong>" + stats[1] + "</strong>" + (stats[1] == 1 ? " artist" : " different artists");
      var peekerPlural = (stats[2] == 1 ? " was" : " were") + " also<br />" + "<strong>" + stats[2] + "</strong>" + (stats[2] == 1 ? " person" : " people");
      
      $("#stats").html("In the past 5 minutes<br />" + sketchPlural + " swapped by<br />" + artistPlural + ". There" + peekerPlural + " who only peeked.");
    });
  }
  
  $("#save").on("submit", function(e) {
    e.preventDefault();
    
    var img = $("#canvas")[0].toDataURL("image/png");
    
    $("#data").val(img);
    
    this.submit();
  });
  
  $("#gallery").on("click", function() {
    window.open("http://garyc.me/sketch/gallery.swf" + (query ? "?" + query : ""));
  });
  
  $("#peek").on("click", function() {
    $.ajax("http://cors-dagwaging.rhcloud.com/" + "garyc.me/sketch/get.php" + (query ? "?" + query : ""))
      .done(function(data) {
        $("#reset").click();
        editable = false;
        
        play(decode(data));
      });
  });
  
  updateStats();
  setInterval(updateStats, 30000);
});

