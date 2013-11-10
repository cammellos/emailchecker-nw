var crypto = require("crypto");
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var configDir = "/home/eleroo/.config/emailchecker/";
var accountConfigRoot = configDir + "accounts/";


function AccountConfig(key) {
   this.key = key;
   this.inbox = "INBOX";
};

AccountConfig.prototype.toConfigEntry = function() {
   var data =  {
      username: this.username,
      password: this.password,
      host: this.host,
      port: this.port,
      tls: this.tls,
      tlsOptions: this.tlsOptions
   };
   return data;
}

AccountConfig.prototype.encryptPassword = function() {
   this.password = this.encryptString(this.password);
};

AccountConfig.prototype.toParams = function() {
   return {
      user: this.username,
      password: this.decryptString(this.password),
      host: this.host,
      port: this.port,
      tls: this.tls,
      tlsOptions: this.tlsOptions
   };
}

AccountConfig.prototype.encryptString = function(string) {
   cipher = this.getCipher(this.key.toString());
   cipher.update(string.toString(),'binary','hex');
   return cipher.final('hex');
};

AccountConfig.prototype.decryptString = function(string) {
   cipher = this.getDecipher(this.key);
   cipher.update(string,'hex','binary');
   return cipher.final('binary');
};

AccountConfig.prototype.getCipher = function() {
  return crypto.createCipher('aes192',this.key);
}

AccountConfig.prototype.getDecipher = function() {
  return crypto.createDecipher('aes192',this.key);
}

AccountConfig.prototype.save = function() {
   fs.writeFile(accountConfigRoot + this.username + ".json", JSON.stringify(this.toConfigEntry()), function(err) {
        if(err) {
            console.log(err);
        }
    });
};


AccountConfig.loadAccountConfigsFromConfigFile = function(key,success) {
  var processFile = function(err,data) {
    return AccountConfig.loadAccountConfigFromConfigEntry(JSON.parse(data),key);
  };
  fs.readdir(accountConfigRoot,function(err,files) {
    async.map(_.map(files, function(f) { return accountConfigRoot + f;}),fs.readFile,function(err,results) {
       success.apply(null,[_.map(results,function(r) { return AccountConfig.loadAccountConfigFromConfigEntry(JSON.parse(r),key)})]);
    });
  });
};

AccountConfig.loadAccountConfigFromConfigEntry = function(configEntry,key) {
    var config = new AccountConfig(key);
    config.username = configEntry.username;
    config.password = configEntry.password;
    config.host = configEntry.host;
    config.port = configEntry.port;
    config.tls = configEntry.tls;
    config.tlsOptions = configEntry.tlsOptions;
    return config;
};

module.exports = AccountConfig;


