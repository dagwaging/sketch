$(document).ready(function() {
  var count = $("#count");
  var data = "";
  
  var canvasElement = $("#canvas");
  var canvas = canvasElement.get()[0].getContext("2d");
  
  canvas.strokeStyle = "black";
  canvas.lineWidth = 3;
  canvas.lineJoin = "round";
  canvas.lineCap = "round";
  
  canvasElement.on("mousedown.sketch", function(e) {
    var pointX = Math.round(e.offsetX);
    var pointY = Math.round(e.offsetY);
    
    canvas.beginPath();
    canvas.moveTo(pointX, pointY);
    
    data += pointX.toString(36) + pointY.toString(36);
    
    canvasElement.on("mousemove.sketch", function(e) {
      pointX = Math.round(e.offsetX);
      pointY = Math.round(e.offsetY);
      
      canvas.lineTo(pointX, pointY);
      canvas.stroke();
      
      data += pointX.toString(36) + pointY.toString(36);
      
      count.html("Ink used: " + Math.ceil(data.length / 65535 * 100) + "%");
      
      e.preventDefault();
      
      return false;
    }).on("mouseup.sketch", function(e) {
      data += " ";
      
      canvasElement.off("mousemove.sketch mouseup.sketch");
      
      e.preventDefault();
      
      return false;
    });
    
    e.preventDefault();
    
    return false;
  }).on("contextmenu", function(e) {
    return false;
  });
  
  $("#swap").on("click", function() {
    console.log(data);
    
    $.ajax({
      url: "./proxy/" + encodeURIComponent("http://garyc.me/sketch/swap.php?v=32"),
      method: "POST",
      data: data
    });
  });
  
  $("#reset").on("click", function() {
    canvas.clearRect(0, 0, 800, 600);
    
    data = "";
  });
  
  $("#undo").on("click", function() {
    
  });
});