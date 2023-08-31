import { formatLogStreamNameDate } from '../utils/HelperFunctions';

export class Logger {
  constructor({ logGroupName, logStreamName = null }) {
    this.logGroupName = logGroupName;
    this.logStreamName = logStreamName;
    if (!this.logStreamName) {
      this.logStreamName = formatLogStreamNameDate();
    }
  }

  async logEvents(level, message) {
    const logData = {
      log_level: level,
      log_message: message,
      log_group: this.logGroupName,
      log_stream: this.logStreamName
    };
    
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      }).then(res => res.json())
        .then(data => {
          if (!data.message || data.message !== 'success') {
            console.error('Failed to log message:', data.message || 'Unknown error');
          }
        }).catch((error) => {
          console.error('Error logging message:', error);
        });
    } catch (err) {
      console.log("Error putting log events:", err);
    }
  }

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
    console.error(message);
    await this.logEvents('CRITICAL', message);
  }
}
