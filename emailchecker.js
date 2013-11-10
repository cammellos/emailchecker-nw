var events = require('events');
var eventEmitter = new events.EventEmitter();
window.gui = require('nw.gui');
var win = window.gui.Window.get();
var Widget = require('./models/widget.js');

window.onload = function() {
  var showEncryptionPasswordDialog = function() {
    document.getElementById("encryption-password-dialog").removeAttribute("class");
    document.getElementById("password-submitted").onclick = handleEncryptionPasswordInput;
    win.show();
  };

  var handleEncryptionPasswordInput = function() {
   document.getElementById("encryption-password-dialog").setAttribute("class","hidden");
   win.hide();
   var key = document.getElementById("encryption-password").value;
   var widget = new Widget(document, key);
  };
  showEncryptionPasswordDialog();
}

