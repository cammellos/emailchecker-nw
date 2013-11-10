var Imap = require('imap');
var _ = require('lodash');
var Email = require('./email.js');

function ImapAPI(accountConfig) {
   this.imap = new Imap(accountConfig.toParams());
   this.fetchedEmailIds = [];
   this.READ_FLAG = '\\Seen';
   this.inbox = accountConfig.inbox;

   this.imap.once('ready', this.openInbox.bind(this));
};

ImapAPI.prototype.markRead = function(emailIds,success) {
   this.imap.seq.addFlags(emailIds,this.READ_FLAG, function(err) {
     if(success) {
       success.apply();
     }
   });
};

ImapAPI.prototype.onNewEmail = function(onNewEmail) {
   this.onNewEmail = onNewEmail;
};

ImapAPI.prototype.connect = function() {
   this.imap.connect();
};

ImapAPI.prototype.openInbox = function() {
   var self = this;
   self.imap.openBox(self.inbox, false, function(err,inbox) {
      if (err) throw err;
      self.imap.on('mail', self.fetchNewEmails.bind(self));
      self.fetchNewEmails();
   });

};

ImapAPI.prototype.fetchNewEmails = function() {
   var self = this;
   self.imap.seq.search(['UNSEEN'], function(err,results) {
      if (err) throw err;
      if (results.length > 0) {
        results = _.difference(results,self.fetchedEmailIds);
        var emails = self.imap.seq.fetch(results, {
           bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
          struct: true
        });
        emails.on('message',function(msg,seqno) {
          self.fetchedEmailIds.push(seqno);
          msg.on('body', function(stream, info) {
           var buffer = '';
           stream.on('data', function(chunk) {
               buffer += chunk.toString('utf8');
             });
           stream.once('end', function() {
             var header = Imap.parseHeader(buffer);
             var email = new Email(seqno, header.from, header.subject)
             if (self.onNewEmail) {
               self.onNewEmail.apply(null,[email]);
             }
           });
          });
        });
      };
   });
}

ImapAPI.prototype.onError = function(onError) {
   this.imap.once('error', onError);
};

ImapAPI.prototype.onClose = function(onClose) {
   this.imap.once('end', onClose);
};

module.exports = ImapAPI;
