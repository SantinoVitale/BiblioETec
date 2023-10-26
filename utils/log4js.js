import log4js from 'log4js';

// Configuración de log4js
log4js.configure({
  appenders: {
    file: { 
      type: 'file', 
      filename: 'logs/app.log',
      maxLogSize: 10485760, // 10MB (tamaño máximo del archivo de logs)
      backups: 3 // número de archivos de respaldo a mantener
    },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['file'], level: 'warn' },
    APP: { appenders: ['file', 'console'], level: 'all' },
    MONGO: { appenders: ['file', 'console'], level: 'all' },
    BOOK: { appenders: ['file', 'console'], level: 'all' },
    BOOKMANAGER: { appenders: ['file', 'console'], level: 'all' },
    USER: { appenders: ['file', 'console'], level: 'all' }
  },
  // Función para formatear la fecha en el mensaje de log
  format: (logEvent) => {
    const formattedDate = moment(logEvent.startTime).format("YYYY-MM-DD HH:mm:ss");
    return `[${formattedDate}] [${logEvent.level.levelStr}] ${logEvent.data}`;
  }
});

// Obtener el logger
const defaultlogger = log4js.getLogger("APP");
const databaseLogger = log4js.getLogger("MONGO");
const bookLogger = log4js.getLogger("BOOK");
const bookManagerLogger = log4js.getLogger("BOOKMANAGER");
const userLogger = log4js.getLogger("USER");

// Exportar el logger
export { defaultlogger, databaseLogger, bookLogger, bookManagerLogger, userLogger };