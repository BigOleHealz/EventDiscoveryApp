import { CloudWatchLogsClient, CreateLogGroupCommand, CreateLogStreamCommand, DescribeLogGroupsCommand, DescribeLogStreamsCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { aws_region, aws_access_key_id, aws_secret_access_key } from '../utils/aws_constants';
import { formatLogStreamNameDate } from '../utils/HelperFunctions';

const client = new CloudWatchLogsClient({
  region: aws_region,
  credentials: {
    accessKeyId: aws_access_key_id,
    secretAccessKey: aws_secret_access_key
  }
});

export class Logger {
  constructor(logGroupName, logStreamName = null) {
    this.logGroupName = logGroupName;
    this.logStreamName = logStreamName;
    if (!this.logStreamName) {
      this.logStreamName = formatLogStreamNameDate();
    }
    this.initialization = this.initializeLogGroup().then(() => this.createLogStream());

  };

  async initializeLogGroup() {
    const describeParams = {
      logGroupNamePrefix: this.logGroupName,
    };

    try {
      const describeResponse = await client.send(new DescribeLogGroupsCommand(describeParams));

      // Check if log group exists
      const exists = describeResponse.logGroups.some(group => group.logGroupName === this.logGroupName);

      if (!exists) {
        // Create log group if it doesn't exist
        const createParams = {
          logGroupName: this.logGroupName,
        };
        const createCommand = new CreateLogGroupCommand(createParams);
        const createResponse = await client.send(createCommand);
        console.log("Log group created:", createResponse);
      }
    } catch (err) {
      console.log("Error initializing log group:", err);
    }
  };

  async createLogStream() {
    const describeParams = {
      logGroupName: this.logGroupName,
      logStreamNamePrefix: this.logStreamName,
    };
  
    try {
      const describeResponse = await client.send(new DescribeLogStreamsCommand(describeParams));
      const exists = describeResponse.logStreams.some(stream => stream.logStreamName === this.logStreamName);
  
      if (!exists) {
        // Create log stream if it doesn't exist
        const params = {
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
        };
        const createStreamCommand = new CreateLogStreamCommand(params);
        const response = await client.send(createStreamCommand);
      }
    } catch (err) {
      console.log("Error creating log stream:", err);
    }
  };

  async logEvents(level, message) {
    await this.initialization;
    const params = {
      logEvents: [
        {
          message: `[${level}] ${message}`,
          timestamp: Date.now()
        },
      ],
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName, // Use level as log stream name
    };

    try {
      const putLogCommand = new PutLogEventsCommand(params);
      const response = await client.send(putLogCommand);
    } catch (err) {
      console.log("Error putting log events:", err);
    }
  };

  async info(message) {
    console.info(message);
    await this.logEvents('INFO', message);
  }

  async debug(message) {
    console.debug(message);
    await this.logEvents('DEBUG', message);
  }

  async warning(message) {
    console.warn(message);
    await this.logEvents('WARNING', message);
  }

  async error(message) {
    console.error(message);
    await this.logEvents('ERROR', message);
  }

  async critical(message) {
    console.critical(message);
    await this.logEvents('CRITICAL', message);
  }
}
