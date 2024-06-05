const promClient = require('prom-client');

const register = new promClient.Registry();

register.setDefaultLabels({
    app: 'my-node-app'
});

promClient.collectDefaultMetrics({ register });

const requestCount = new promClient.Counter({
    name: 'app_request_count',
    help: 'Total number of requests received'
});

const requestDuration = new promClient.Histogram({
    name: 'app_request_duration_seconds',
    help: 'Duration of requests in seconds',
    buckets: [0.1, 0.5, 1, 1.5, 2, 5, 10]
});

const cpuUsage = new promClient.Gauge({
    name: 'app_cpu_usage',
    help: 'CPU usage of the application process'
});

const memoryUsage = new promClient.Gauge({
    name: 'app_memory_usage',
    help: 'Memory usage of the application process'
});

const photoUploadSuccess = new promClient.Counter({
    name: 'app_photo_upload_success_total',
    help: 'Total number of successful photo uploads'
});

const photoUploadError = new promClient.Counter({
    name: 'app_photo_upload_error_total',
    help: 'Total number of photo upload errors'
});

register.registerMetric(requestCount);
register.registerMetric(requestDuration);
register.registerMetric(cpuUsage);
register.registerMetric(memoryUsage);
register.registerMetric(photoUploadSuccess);
register.registerMetric(photoUploadError);

setInterval(() => {
    const usage = process.cpuUsage();
    cpuUsage.set(usage.user / 1000000);

    const memUsage = process.memoryUsage();
    memoryUsage.set(memUsage.heapUsed / 1048576);
}, 1000);

module.exports = {
    requestCount,
    requestDuration,
    photoUploadSuccess,
    photoUploadError,
    register
};
