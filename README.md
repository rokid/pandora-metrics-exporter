# Pandora Metrics Exporter

Expose [Pandora.js] metrics to [Prometheus] scrappers

## Usage

### Install globally

```bash
$ npm i pandora-metrics-exporter -g # install pandora-metrics-exporter globally
$ pandora start --name exporter `pandora-metrics-exporter-dir` # start it
```

Now the metrics is available at default path `http://127.0.0.1:9082/metrics`

### Environs

- `METRICS_HOST`: web server host address listening to, default: `127.0.0.1`
- `METRICS_PORT`: web server port listening to, default: `9082`


[Pandora.js]: http://www.midwayjs.org/pandora/en/
[Prometheus]: https://prometheus.io
