const Queue = require('bull')

const testQueue = new Queue('test-queue', 'redis://127.0.0.1:6379')

// Worker (consumer)
testQueue.process(async job => {
  console.log('Processing job:', job.data)
  return { result: 'done' }
})

// Producer (add job every 2 seconds)
setInterval(() => {
  testQueue.add({ message: 'Hello from Bull!' })
}, 2000)

console.log('Bull test started...')
