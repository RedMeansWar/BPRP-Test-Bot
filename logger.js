class Logger {
    static LogDebug(message) {
        console.log(`[DEBUG]: ${message}`);
    }

    static LogError(message) {
        console.log(`[ERROR]: ${message}`);
    }

    static LogInfo(message) {
        console.log(`[BPRP]: ${message}`);
    }

    static LogFramework(message) {
        console.log(`[BPRP FRAMEWORK]: ${message}`);
    }
}

module.exports = Logger;