# An API for Facebook Messenger platform

## Init
Init an instance of Messenger with at least the Facebook token
```javascript
const Messenger = require('messenger');
const messenger = new Messenger({ token: 'your_token'});
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

You can send messages with text and buttons:
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
