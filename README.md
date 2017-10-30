[![Build Status](https://travis-ci.org/adriendulong/messenger.svg?branch=master)](https://travis-ci.org/adriendulong/messenger) [![Coverage Status](https://coveralls.io/repos/github/adriendulong/messenger/badge.svg)](https://coveralls.io/github/adriendulong/messenger) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
# messenger-platform

A NON official node client for [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform)

## Init
Init an instance of Messenger with at least the Facebook token and your verify string
```javascript
const Messenger = require('messenger');
const messenger = new Messenger({ token: 'your_token', verify: 'your_verify_string'});
```

## Send
### Send a message

You can send messages with just text :
```javascript
messenger.sendMessage('recipient_id', {
  text: 'My first bot message'
}).then(response => console.log(response));
```

You can send messages with text and attachment (or just attachment):
```javascript
messenger.sendMessage('recipient_id', {
  text: 'My first bot message',
  attachment: {
    url: 'http://example.com/myimage.png',
    type: 'image'
  }
}).then(response => console.log(response));
```

You can send messages with text and buttons (what FB call the [button template]( https://developers.facebook.com/docs/messenger-platform/send-messages/template/button)):
```javascript
const buttons = new Buttons();
buttons.add({
  title: 'My Website',
  url: 'http://mywebsite.com'
});

messenger.sendMessage('recipient_id', {
  text: 'My first bot message',
  buttons: buttons
}).then(response => console.log(response));
```

### Send an action

You can send an action in order to keep your user in touch with what your bot is doing.
Possible actions : mark_seen, typing_on, typing_off

```javascript
messenger.sendAction('recipient_id', 'typing_on').then(response => console.log(response));
```

Or even more easy for setting if your typing or stop showing the typing indicator :
```javascript
messenger.setTyping('recipient_id', true).then(response => console.log(response));
```

### Send a Generic Template

More infos about generic template here: https://developers.facebook.com/docs/messenger-platform/send-messages/template/generic

```javascript
const elements = new Elements();
elements.add({ title: 'Blue shirt', subtitle: 'A nice blue shirt', image: 'http://mywebsite.com/myimage.png'})
messenger.sendGenericTempalte('recipient_id', elements, {sharable: false, imageRatio: 'square'}).then(response => console.log(response));
```

## Messenger Profile API

More about this api here: https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api

### Set the Get Started payload

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/get-started-button)

```javascript
messenger.setGetStarted(<PAYLOAD>).then(response => console.log(response));
```

### Set the Greeting text

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/greeting)

### Set the whitelisted domains

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/domain-whitelisting)

### Set the persistent menu

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/messenger-profile-api/persistent-menu)

## Handover Procotol

More about this part of the API here : https://developers.facebook.com/docs/messenger-platform/reference/handover-protocol

### Take the thread

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/handover-protocol/take-thread-control)

### Pass the thread

[Facebook Doc](https://developers.facebook.com/docs/messenger-platform/reference/handover-protocol/pass-thread-control)
