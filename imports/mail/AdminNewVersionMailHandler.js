import { Meteor } from 'meteor/meteor';

import { MailFactory } from './MailFactory';
import { GlobalSettings } from '../config/GlobalSettings';

export class AdminNewVersionMailHandler {
    constructor(myVersion, masterVersion, masterMessage) {
        this._myVersion = myVersion;
        this._masterVersion = masterVersion;
        // Build text for version hint messages
        this._masterMessageTxt = '';
        Object.keys(masterMessage).map(msgVersion => {
            this._masterMessageTxt = this._masterMessageTxt
                + '\n* Version ' + msgVersion + ':\n'
                + masterMessage[msgVersion] + '\n';
        });
        if (this._masterMessageTxt !== '') {
            this._masterMessageTxt = 'Version Hints:\n' + this._masterMessageTxt + '\n';
        }
    }

    // TODO: Translate me!
    send() {
        let adminFrom = GlobalSettings.getDefaultEmailSenderAddress();

        let admins = Meteor.users.find({isAdmin: true}).fetch();
        if (GlobalSettings.isEMailDeliveryEnabled() && admins.length > 0) {
            let adminMails = [];
            admins.map(adm => {adminMails.push(adm.emails[0].address);});
            let mailer = MailFactory.getMailer(adminFrom, adminMails.join(','));
            mailer.setSubject('[4Minitz] Newer version exists');
            mailer.setText('Hello Admin,\n'+
                '\n'+
                'It seems you are running an outdated version of 4Minitz.\n'+
                '\n'+
                'Your 4Minitz instance on: ' + GlobalSettings.getRootUrl()+'\n' +
                'has version: '+this._myVersion+'\n'+
                '\n'+
                'Newest version available is: '+this._masterVersion+'\n'+
                'Release notes: https://github.com/4minitz/4minitz/releases\n' +
                'Please consider to update.\n' +
                '\n' +
                this._masterMessageTxt +
                '\n' +
                'This mail was generated by your 4Minitz backend.\n'+
                'You can disable the update check via settings.json: "updateCheck": false.\n'+
                '\n' +
                'Have fun!\n' +
                '        Your 4Minitz team.\n' +
                '\n' +
                '\n' +
                '--- \n' +
                '4Minitz is free open source developed by the 4Minitz team.\n' +
                'Source is available at https://github.com/4minitz/4minitz\n'
            );
            mailer.send();
        } else {
            console.error('Could not send admin new version mail. Mail is disabled or no admins specified.');
        }
    }
}
