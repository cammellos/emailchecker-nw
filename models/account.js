var events = require('events');
var util = require('util');
var _ = require('lodash');
var ImapAPI = require('./imap_api.js');
var AccountConfig = require("./account_config.js");

function Account(config) {
   this.config = config;
   this.imap = new ImapAPI(this.config);
   this.username = config.username;
   this.emails = [];
   this.initializeMenu();
   this.imap.connect();
   this.imap.onError(function(err) {console.log(err)});
   this.imap.onClose(function() { console.log('ended')});
   this.imap.onNewEmail(this.addEmail.bind(this));
   this.eventEmitter = new events.EventEmitter();
};

Account.prototype.on = function(e,callback) {
   this.eventEmitter.on(e,callback);
};

Account.prototype.save = function() {
   this.config.save();
}

Account.prototype.initializeMenu = function() {
  this.menuItem = new window.gui.MenuItem({type: "normal", label: this.username})
  this.submenu = new window.gui.Menu();
  this.submenu.append(new window.gui.MenuItem({type: "separator"}));
  this.menuItem.submenu = this.submenu;
};


Account.prototype.addEmail = function(email) {
   var self = this;
   email.imap = self.imap;
   self.emails.push(email);
   var emailEntry = email.menuEntry()
   self.submenu.append(emailEntry);
   email.on("unrender", function() {
      self.submenu.remove(emailEntry);
      self.eventEmitter.emit("email_removed");
   });
   self.eventEmitter.emit("email_added");
   return email;
};

Account.prototype.menuEntry = function() {
  return this.menuItem;
};

Account.createFromParams = function(params,key) {
  var config = new AccountConfig(key);
  config.password = params.password;
  config.username = params.username;
  config.host = params.host;
  config.port = params.port;
  config.tls = params.tls;
  config.tlsOptions = params.tlsOptions;
  config.encryptPassword();
  config.save();
  return new Account(config);
};

Account.loadAccounts = function(key,success) {
   AccountConfig.loadAccountConfigsFromConfigFile(key, function(configs) {
     success.apply(null,[_.map(configs, function(config) {return new Account(config)})]);
   });
};

module.exports = Account;
