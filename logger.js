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

    static LogTeamSpeak(message) {
        console.log(`[BPRP TEAMSPEAK]: ${message}`);
    }
}

module.exports = Logger;