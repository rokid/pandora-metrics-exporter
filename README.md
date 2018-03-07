# Pandora Metrics Exporter

![npm](https://img.shields.io/npm/v/pandora-metrics-exporter.svg)

Expose [Pandora.js] metrics to [Prometheus] scrappers

## Usage

### Install

```bash
$ npm i pandora-metrics-exporter -g # install pandora-metrics-exporter globally
$ export PANDORA_CONFIG=`pandora-metrics-exporter-dir`

$ pandora exit && pandora start --name dashboard `pandora-dashboard-dir`  # restart pandora daemon
```

Now the metrics is available at default path `http://127.0.0.1:7002/prometheus`

[Pandora.js]: http://www.midwayjs.org/pandora/en/
[Prometheus]: https://prometheus.io
