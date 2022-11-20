function mainFunction() {
  let gmailApp = GmailApp;
  var foundThreads = gmailApp.search("is: unread from: ###SENDER ADDRESS### subject: ###SUBJECT OF MESSAGES TO READ FROM###");

  foundThreads.forEach(handleThread);
}

function handleThread(thread){
  let messagesInThread = thread.getMessages();
  messagesInThread.forEach(handleMessage);
}

function handleMessage(message){
    const listNames = ['baselist1', 'baselist2'];

    let body = message.getPlainBody();
    let subject = message.getSubject();
    var listName = 'New';

    listName = subject.match(listNames.join('|'));
    if(Array.isArray(listName)) {
      try {
        listName = listName[0];
      } catch (err) {
        listName = 'New';
      }
    } else if (listName == null) {
      listName = 'New';
    }

    let allAddresses = body.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    let uniqeAddresses = [...new Set(allAddresses)];

    var sum = 0;
    uniqeAddresses.forEach((address) => {
      sum += handleAddress(address, listName);
    })

    var result = "Added " + sum + " from " + uniqeAddresses.length + "\nTo base: " + listName
    message.markRead();
    message.reply(result);

    Logger.log(result); //Logging replies sent in reply
}

function handleAddress(address, listName){
  console.log("ADDRESS: " + address);
  const spreadSheetID = "###GOOGLE SPREADSHEET ID###"

  const ss = SpreadsheetApp.openById(spreadSheetID);
  const sheet = ss.getSheetByName("addresses"); 

  let foundCount = sheet.createTextFinder(address).findAll().length;
  if(foundCount > 0) {
    return 0;
  } else {
    try {
      sheet.appendRow([address, listName]);
    } catch (err) {
      Logger.log("Error occured: " + err);
      return 0;
    } finally {
      return 1;
    }
  }
}