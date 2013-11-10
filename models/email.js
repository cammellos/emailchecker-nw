var util = require('util');
var events = require('events');
function Email(id, from,subject) {
   this.id = id;
   this.from = from;
   this.subject = subject;
   this.eventEmitter = new events.EventEmitter();
   this.sendNotification();
};

Email.prototype.sendNotification = function() {
  var sys = require('sys');
  var exec = require('child_process').exec;
  var command = "notify-send '" + this.from + "' '" + this.subject + "'";
  exec(command);
};
Email.prototype.delete = function() {
   this.imap.delete([this.id], this.unrender.bind(this));
};



Email.prototype.markRead = function() {
   this.imap.markRead([this.id], this.unrender.bind(this));
};

Email.prototype.on = function(e,callback) {
   this.eventEmitter.on(e,callback);
};

Email.prototype.markUnread = function() {};
Email.prototype.isUnread = function() {};
Email.prototype.unrender = function() {
   this.eventEmitter.emit("unrender");
};

Email.prototype.menuEntry = function() {
  var emailEntry = new window.gui.MenuItem({type: "normal", label: this.subject + " " + this.from });
  var emailEntrySubmenu = new window.gui.Menu();
  emailEntrySubmenu.append(new window.gui.MenuItem({type: "normal", label: "Mark read", click: this.markRead.bind(this)}));
  emailEntrySubmenu.append(new window.gui.MenuItem({type: "normal", label: "Delete"}));
  emailEntry.submenu = emailEntrySubmenu;
  return emailEntry;
};


module.exports = Email;
