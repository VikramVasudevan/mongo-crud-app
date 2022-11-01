const { EventEmitter } = require('node:events');
class MyEmitter extends EventEmitter { }

const myEmitter = new MyEmitter();
myEmitter.on('event', (event) => {
    console.log('an event occurred!', event);
});

for (var i = 0; i < 10; i++) {
    console.log('Emitting- ', i)
    myEmitter.emit('event', i);
}
