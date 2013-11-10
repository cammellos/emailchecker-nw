var Account = require('./account.js');
var _ = require('lodash');

var win = window.gui.Window.get();

function Widget(document, key) {
   var self = this;
   self.document = document;
   self.tray = new window.gui.Tray({ title: 'Email Checker', icon: 'email_inactive.png'});
   self.menu = new window.gui.Menu();
   self.key = key;
   self.tray.menu = self.menu;
   self.accounts = []
   self.unreadEmails = 0;
   self.initializeMenu();
   Account.loadAccounts(self.key, function(accounts) {
     _.each(accounts, self.addAccount.bind(self));});
   self.bindActions();
}

Widget.prototype.bindActions = function() {
 this.newConfigSubmitted = this.document.getElementById("account-submitted");
 this.newConfigSubmitted.onclick = this.handleNewConfig.bind(this);
}

Widget.prototype.updateIcon = function() {
   if(this.unreadEmails > 0) {
      this.tray.icon = 'email_active.png';
   } else {
      this.tray.icon = 'email_inactive.png';
   }
};

Widget.prototype.addAccount = function(account) {
   var self = this;
   self.accounts.push(account);
   account.on('email_added', function() {
      self.unreadEmails = self.unreadEmails + 1;
      self.updateIcon();
   });
   account.on('email_removed', function() {
      self.unreadEmails = self.unreadEmails - 1;
      self.updateIcon();
   });
   self.menu.append(account.menuEntry());
};

Widget.prototype.initializeMenu = function() {
   this.menu.append(new window.gui.MenuItem({type: "normal", label: "Add account", click: this.showNewAccountDialog.bind(this)}));
   this.menu.append(new window.gui.MenuItem({type: "separator"}));
};

Widget.prototype.showNewAccountDialog = function() {
  this.document.getElementById("new-account-dialog").removeAttribute("class");
  win.show();
};



Widget.prototype.parseConfigParams = function() {
   return {
      username: this.document.getElementById("username").value,
      password: this.document.getElementById("password").value,
      host: this.document.getElementById("host").value,
      port: this.document.getElementById("port").value,
      tls: true,
      tlsOptions: { "rejectUnauthorized": false}
   }
};

Widget.prototype.handleNewConfig = function() {
   this.document.getElementById("new-account-dialog").setAttribute("class","hidden");
   win.hide();
   this.addAccount(Account.createFromParams(this.parseConfigParams(),this.key));
};

module.exports = Widget;
