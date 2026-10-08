const fs = require('fs')
const path = require('path')
const Mocha = require('mocha')
const AWS = require('aws-sdk')
const axios = require('axios')

exports.handler = function (event, context, callback) {
  // set lambda to return as soon as event is done processing
  context.callbackWaitsForEmptyEventLoop = false

  // Get the job id of the pipeline
  const jobId = event['CodePipeline.job'].id

  // Get the execution id of the aws request
  const externalExecutionId = context.awsRequestId

  // Run the tests after a delay of 20 seconds.
  setTimeout(runTests, 45000, jobId, externalExecutionId, callback)
}

function runTests (jobId, externalExecutionId, callback) {
  // Instantiate a Mocha with options
  const mocha = new Mocha({
    reporter: 'list',
    timeout: 45000
  })

  // Use non-default Mocha test directory.
  const testDir = path.resolve(__dirname, 'test')

  // Add each .js file to the mocha instance
  fs.readdirSync(testDir)
    .filter(function (file) {
      return path.extname(file) === '.js'
    })
    .forEach(function (file) {
      console.log(`Adding file ${file}`)
      mocha.addFile(path.join(testDir, file))
    })

  mocha.run(function (failures) {
    process.exitCode = failures ? 1 : 0 // exit with non-zero status if there were failures
    if (process.exitCode === 0) {
      console.log('All tests passed')
      sendSlackMessage('Congratulations! Your tests passed successfully')
      return notifyCodePipelineOfSuccess(jobId, 'All tests passed', callback)
    } else if (process.exitCode === 1) {
      console.error('Some tests failed')
      sendSlackMessage('Some of your tests failed. Please check the CloudWatch logs for the fabtrakr-tests-runner Lambda')
      return notifyCodePipelineOfFailure(jobId, 'Some tests failed', callback, externalExecutionId)
    } else {
      return callback(Error('Unknown exit code'))
    }
  })
}

function notifyCodePipelineOfSuccess (jobId, message, callback) {
  const codepipeline = new AWS.CodePipeline()

  const paramsObject = {
    jobId
  }

  codepipeline.putJobSuccessResult(paramsObject, function (err, data) {
    if (err) {
      return callback(err)
    } else {
      return callback(null, message)
    }
  })
}

function notifyCodePipelineOfFailure (jobId, message, callback, externalExecutionId) {
  const codepipeline = new AWS.CodePipeline()

  const paramsObject = {
    jobId,
    failureDetails: {
      message: JSON.stringify(message),
      type: 'JobFailed',
      externalExecutionId
    }
  }

  codepipeline.putJobFailureResult(paramsObject, function (err, data) {
    return callback(err)
  })
}

async function sendSlackMessage (body) {
  try {
    console.log(`Sending slack message: ${body}`)
    return await axios.post(process.env.SLACK_URL, {
      text: body
    })
  } catch (err) {
    console.error(err)
  }
}
